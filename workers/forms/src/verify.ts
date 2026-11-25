/**
 * Finer Pioneers — verificação do email do candidato.
 *
 * Fluxo: a candidatura é gravada (public.ts) → só depois, fora da resposta, sai um email
 * institucional para o candidato com uma ligação pessoal → a página /pioneers/confirmar/ do
 * site lê o token do fragmento (#t=…, que nunca chega a nenhum servidor nem aos registos do
 * GitHub Pages) e, quando a pessoa carrega em "Confirmar email", envia-o por POST para
 * /verify. A confirmação é sempre feita aqui, no servidor.
 *
 * Porquê POST e um botão, e não uma ligação GET direta: os filtros de segurança de email
 * (e as pré-visualizações) abrem as ligações das mensagens; um GET gastaria a ligação de uso
 * único antes de o candidato a ver.
 *
 * Três estados independentes na linha da candidatura (migração 0004):
 *   status          avaliação comercial — nunca é alterado nem devolvido por este módulo;
 *   email_status    not_requested | pending | verified — o candidato provou que o endereço é dele;
 *   confirm_status  none | pending | sent | failed — o Resend aceitou o email ("enviado" ≠ "confirmado").
 *
 * Segurança:
 *  - token de 256 bits (crypto.getRandomValues); na D1 fica só o SHA-256 — quem ler a base de
 *    dados não reconstrói nenhuma ligação; o token nunca é escrito em logs;
 *  - uso único e validade de TOKEN_TTL_MS; confirmar invalida as outras ligações da candidatura;
 *  - respostas sem dados pessoais nem estado de avaliação; o reenvio por email responde sempre
 *    o mesmo, exista ou não candidatura (não permite descobrir quem se candidatou);
 *  - limites: por minuto em /verify e /resend (sem IP), Turnstile no reenvio por email,
 *    MAX_RESENDS reenvios por candidatura com RESEND_INTERVAL_MS entre eles e MAX_PER_ADDRESS_DAY
 *    emails por endereço em 24 h;
 *  - o email não contém nenhum texto escrito pelo candidato (nome, empresa): o formulário não
 *    pode ser usado para enviar conteúdo de terceiros a um endereço alheio.
 *
 * A candidatura nunca depende do email: já está gravada antes de qualquer envio; falhas do
 * Resend ficam registadas na linha e o acionador agendado repete-as (os mesmos intervalos das
 * notificações internas). Sem CONFIRM_FROM (domínio de envio ainda por verificar no Resend),
 * nada é enviado e a candidatura fica 'not_requested' — exatamente o comportamento anterior.
 */
import { MAX_ATTEMPTS, due, replyTo } from './notify'
import { json, logError, text } from './shared'

export interface VerifyEnv {
  DB: D1Database
  RESEND_API_KEY?: string
  /** Remetente do email ao candidato — exige domínio verificado no Resend (ex.: "Finer One <info@finer-one.com>"). */
  CONFIRM_FROM?: string
  /** Endereço de resposta (opcional): uma caixa de entrada real da equipa. */
  CONFIRM_REPLY_TO?: string
  /** Origem do site onde está a página de confirmação (ex.: https://www.finer-one.com). */
  CONFIRM_BASE_URL?: string
}

/** Versões do aviso de privacidade que preveem o email de confirmação ao candidato. */
export const VERIFY_CONSENTS: readonly string[] = ['2026-11-v5', '2026-11-v6', '2026-11-v7']
export const TOKEN_TTL_MS = 48 * 60 * 60 * 1000
export const MAX_RESENDS = 3
export const RESEND_INTERVAL_MS = 10 * 60 * 1000
/** Depois deste prazo já não se reenvia: o candidato deve escrever à equipa. */
export const RESEND_WINDOW_MS = 30 * 24 * 60 * 60 * 1000
/** Máximo de emails de confirmação para o mesmo endereço em 24 h, somando todas as candidaturas (evita usar o formulário para encher a caixa de terceiros). */
export const MAX_PER_ADDRESS_DAY = 4
export const VERIFY_PER_MINUTE = 60
export const RESEND_PER_MINUTE = 10
const CONFIRM_BATCH = 10
const RESEND_URL = 'https://api.resend.com/emails'
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Cors = Record<string, string>
type Turnstile = (token: unknown) => Promise<boolean>

/** Origem do site validada: https, ou http só em localhost (desenvolvimento). */
export function baseUrl(env: VerifyEnv): string | null {
  try {
    const u = new URL(env.CONFIRM_BASE_URL ?? '')
    const local = u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')
    return u.protocol === 'https:' || local ? u.origin : null
  } catch {
    return null
  }
}

/**
 * Remetente válido para enviar a terceiros: "Nome <endereco@dominio>" ou só o endereço, num
 * domínio próprio. O domínio de testes do Resend (resend.dev) só entrega na caixa da própria
 * conta, por isso não serve: com ele a confirmação fica desligada em vez de falhar a cada envio.
 */
export function confirmFrom(env: VerifyEnv): string | null {
  const raw = (env.CONFIRM_FROM ?? '').trim()
  const m = /^(?:[^<>"\r\n]{1,80}\s)?<([^<>\s]+)>$/.exec(raw)
  const address = replyTo(m ? m[1] : raw)
  if (!address || address.endsWith('@resend.dev') || address.endsWith('.resend.dev')) return null
  return raw
}

export const confirmConfigured = (env: VerifyEnv) => !!(env.RESEND_API_KEY && confirmFrom(env) && baseUrl(env))

/** Esta candidatura deve receber o email de confirmação? */
export function wantsVerification(env: VerifyEnv, kind: string, consent: string): boolean {
  return kind === 'pioneers' && VERIFY_CONSENTS.includes(consent) && confirmConfigured(env)
}

export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Conta mais um pedido neste minuto; false se o limite já foi ultrapassado. */
async function allow(db: D1Database, name: string, limit: number, now: number): Promise<boolean> {
  const minute = new Date(now).toISOString().slice(0, 16)
  const row = await db
    .prepare('INSERT INTO rate_counters (name, minute, n) VALUES (?, ?, 1) ON CONFLICT (name, minute) DO UPDATE SET n = n + 1 RETURNING n')
    .bind(name, minute)
    .first<{ n: number }>()
  return (row?.n ?? 1) <= limit
}

// ---------- Envio do email de confirmação ----------

type Outcome = 'sent' | 'pending' | 'failed' | 'skipped'
type ConfirmRow = { id: string; kind: string; email: string; lang: string; email_status: string; confirm_status: string; confirm_attempts: number; confirm_resends: number }

/** Envia (ou volta a tentar) o email de confirmação de uma candidatura. Nunca lança. */
export async function sendConfirmation(env: VerifyEnv, id: string, now = Date.now()): Promise<Outcome> {
  try {
    const base = baseUrl(env)
    if (!confirmConfigured(env) || !base) return 'pending'
    const row = await env.DB.prepare('SELECT id, kind, email, lang, email_status, confirm_status, confirm_attempts, confirm_resends FROM submissions WHERE id = ?').bind(id).first<ConfirmRow>()
    if (!row || row.kind !== 'pioneers' || row.email_status !== 'pending' || row.confirm_status !== 'pending' || row.confirm_attempts >= MAX_ATTEMPTS) return 'skipped'

    const to = replyTo(row.email) // mesmo formato estrito do Reply-To: um só endereço simples
    if (!to) {
      await env.DB.prepare("UPDATE submissions SET confirm_status = 'failed', confirm_error = 'address' WHERE id = ?").bind(id).run()
      return 'failed'
    }
    const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM email_tokens t JOIN submissions s ON s.id = t.submission_id WHERE s.email = ? AND t.created_at > ?')
      .bind(row.email, new Date(now - 24 * 60 * 60 * 1000).toISOString())
      .first<{ n: number }>()
    if ((recent?.n ?? 0) >= MAX_PER_ADDRESS_DAY) {
      await env.DB.prepare("UPDATE submissions SET confirm_status = 'failed', confirm_error = 'address_limit' WHERE id = ?").bind(id).run()
      return 'failed'
    }
    // Reserva a tentativa: se outro processo já a reservou, não envia de novo.
    const iso = new Date(now).toISOString()
    const claim = await env.DB.prepare("UPDATE submissions SET confirm_attempts = confirm_attempts + 1, confirm_last_attempt_at = ? WHERE id = ? AND confirm_status = 'pending' AND confirm_attempts = ?")
      .bind(iso, id, row.confirm_attempts)
      .run()
    if (!claim.meta.changes) return 'skipped'
    const attempt = row.confirm_attempts + 1

    // Cada tentativa leva uma ligação nova (só o hash fica guardado, por isso não se pode
    // reenviar a anterior). As ligações anteriores ainda válidas continuam a funcionar.
    const token = newToken()
    await env.DB.prepare('INSERT INTO email_tokens (token_hash, submission_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .bind(await hashToken(token), id, iso, new Date(now + TOKEN_TTL_MS).toISOString())
      .run()
    const lang = row.lang === 'en' ? 'en' : 'pt'
    const mail = confirmEmail(lang, `${base}/pioneers/confirmar/#t=${token}${lang === 'en' ? '&l=en' : ''}`)
    const reply = env.CONFIRM_REPLY_TO ? replyTo(env.CONFIRM_REPLY_TO) : null

    let error = ''
    try {
      const res = await fetch(RESEND_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `pioneers-confirm-${id}-r${row.confirm_resends}-a${attempt}` },
        body: JSON.stringify({ from: confirmFrom(env), to: [to], ...(reply ? { reply_to: [reply] } : {}), subject: mail.subject, text: mail.text, html: mail.html }),
      })
      if (!res.ok) error = `http_${res.status}`
    } catch {
      error = 'network'
    }

    if (!error) {
      await env.DB.prepare("UPDATE submissions SET confirm_status = 'sent', confirm_sent_at = ?, confirm_error = NULL WHERE id = ?").bind(new Date().toISOString(), id).run()
      return 'sent'
    }
    const final = attempt >= MAX_ATTEMPTS
    await env.DB.prepare('UPDATE submissions SET confirm_status = ?, confirm_error = ? WHERE id = ?').bind(final ? 'failed' : 'pending', error, id).run()
    logError('confirm_failed', new Error(error))
    return final ? 'failed' : 'pending'
  } catch (err) {
    logError('confirm_error', err)
    return 'pending'
  }
}

/**
 * Acionador agendado: repete os emails de confirmação por enviar cujo intervalo já passou e
 * limpa o que deixou de ser preciso (ligações expiradas há mais de 30 dias, contadores antigos).
 */
export async function retryConfirmations(env: VerifyEnv, now = Date.now()): Promise<number> {
  let sent = 0
  try {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM email_tokens WHERE expires_at < ?').bind(new Date(now - RESEND_WINDOW_MS).toISOString()),
      env.DB.prepare('DELETE FROM rate_counters WHERE minute < ?').bind(new Date(now - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)),
    ])
    if (!confirmConfigured(env)) return 0
    const { results } = await env.DB.prepare("SELECT id, confirm_attempts, confirm_last_attempt_at FROM submissions WHERE confirm_status = 'pending' AND confirm_attempts < ? ORDER BY created_at LIMIT 100")
      .bind(MAX_ATTEMPTS)
      .all<{ id: string; confirm_attempts: number; confirm_last_attempt_at: string | null }>()
    const ready = results.filter((r) => due(r.confirm_attempts, r.confirm_last_attempt_at, now)).slice(0, CONFIRM_BATCH)
    for (const { id } of ready) if ((await sendConfirmation(env, id, now)) === 'sent') sent++
  } catch (err) {
    logError('confirm_retry_error', err)
  }
  return sent
}

// ---------- POST /verify ----------

/**
 * Confirma o email a partir do token. Respostas (nunca com dados pessoais nem avaliação):
 *   200 { ok, status: 'verified' }            confirmado agora
 *   200 { ok, status: 'verified', already }   já estava confirmado (segunda visita)
 *   410 { error: 'expired' }                  ligação fora do prazo — pode pedir outra
 *   404 { error: 'invalid' }                  ligação desconhecida ou já sem efeito
 */
export async function handleVerify(body: Record<string, unknown>, env: VerifyEnv, cors: Cors, now = Date.now()): Promise<Response> {
  const token = body.token
  if (typeof token !== 'string' || !TOKEN_RE.test(token)) return json({ ok: false, error: 'invalid' }, 404, cors)
  if (!(await allow(env.DB, 'verify', VERIFY_PER_MINUTE, now))) return json({ ok: false, error: 'rate' }, 429, cors)

  const row = await env.DB.prepare('SELECT t.submission_id AS id, t.expires_at, t.used_at, s.email_status FROM email_tokens t JOIN submissions s ON s.id = t.submission_id WHERE t.token_hash = ?')
    .bind(await hashToken(token))
    .first<{ id: string; expires_at: string; used_at: string | null; email_status: string }>()
  if (!row) return json({ ok: false, error: 'invalid' }, 404, cors)
  if (row.email_status === 'verified') return json({ ok: true, status: 'verified', already: true }, 200, cors)
  if (row.used_at || row.email_status !== 'pending') return json({ ok: false, error: 'invalid' }, 404, cors)
  if (Date.parse(row.expires_at) <= now) return json({ ok: false, error: 'expired' }, 410, cors)

  const iso = new Date(now).toISOString()
  // Uso único: a ligação só conta se ainda estiver por usar (dois cliques em simultâneo → um só).
  const used = await env.DB.prepare('UPDATE email_tokens SET used_at = ? WHERE token_hash = ? AND used_at IS NULL').bind(iso, await hashToken(token)).run()
  if (used.meta.changes) {
    // O que fica confirmado é o endereço: vale para todas as candidaturas Pioneers desse email
    // que estavam por confirmar (por exemplo, uma candidatura repetida), e as ligações delas deixam de contar.
    const same = "kind = 'pioneers' AND email = (SELECT email FROM submissions WHERE id = ?)"
    await env.DB.batch([
      env.DB.prepare(`UPDATE email_tokens SET used_at = ? WHERE used_at IS NULL AND submission_id IN (SELECT id FROM submissions WHERE ${same})`).bind(iso, row.id),
      env.DB.prepare(`UPDATE submissions SET email_status = 'verified', email_verified_at = ? WHERE email_status = 'pending' AND ${same}`).bind(iso, row.id),
    ])
  }
  return json({ ok: true, status: 'verified', ...(used.meta.changes ? {} : { already: true }) }, 200, cors)
}

// ---------- POST /resend ----------

/** Volta a pôr o email de confirmação em fila, se os limites da candidatura o permitirem. */
async function reissue(env: VerifyEnv, id: string, now: number): Promise<void> {
  const claim = await env.DB.prepare(
    `UPDATE submissions SET confirm_resends = confirm_resends + 1, confirm_last_resend_at = ?, confirm_status = 'pending', confirm_attempts = 0, confirm_error = NULL
     WHERE id = ? AND kind = 'pioneers' AND email_status = 'pending' AND confirm_resends < ? AND created_at > ?
       AND (confirm_last_resend_at IS NULL OR confirm_last_resend_at < ?)
       AND (confirm_last_attempt_at IS NULL OR confirm_last_attempt_at < ?)`,
  )
    .bind(new Date(now).toISOString(), id, MAX_RESENDS, new Date(now - RESEND_WINDOW_MS).toISOString(), new Date(now - RESEND_INTERVAL_MS).toISOString(), new Date(now - RESEND_INTERVAL_MS).toISOString())
    .run()
  if (claim.meta.changes) await sendConfirmation(env, id, now)
}

/**
 * Pedido de nova ligação. Duas formas:
 *  - { token }: a partir de uma ligação expirada (quem a tem recebeu o email);
 *  - { email, turnstileToken }: quem não recebeu o email — exige Turnstile.
 * A resposta é sempre { ok: true } quando o pedido é aceite, exista ou não candidatura, esteja
 * ou não confirmada, e o trabalho corre depois da resposta: nem o conteúdo nem o tempo de
 * resposta revelam se um email se candidatou.
 */
export async function handleResend(body: Record<string, unknown>, env: VerifyEnv, cors: Cors, turnstile: Turnstile, ctx?: ExecutionContext, now = Date.now()): Promise<Response> {
  if (!confirmConfigured(env)) return json({ ok: false, error: 'unavailable' }, 503, cors)

  let find: () => Promise<string | null>
  if (typeof body.token === 'string' && body.token) {
    const token = body.token
    if (!TOKEN_RE.test(token)) return json({ ok: false, error: 'invalid' }, 404, cors)
    find = async () => (await env.DB.prepare('SELECT submission_id AS id FROM email_tokens WHERE token_hash = ?').bind(await hashToken(token)).first<{ id: string }>())?.id ?? null
  } else {
    const email = text(body.email, 254).toLowerCase()
    if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'invalid', field: 'email' }, 400, cors)
    if (!(await turnstile(body.turnstileToken))) return json({ ok: false, error: 'verification' }, 403, cors)
    find = async () =>
      (await env.DB.prepare("SELECT id FROM submissions WHERE kind = 'pioneers' AND email = ? AND email_status = 'pending' ORDER BY created_at DESC LIMIT 1").bind(email).first<{ id: string }>())?.id ?? null
  }
  if (!(await allow(env.DB, 'resend', RESEND_PER_MINUTE, now))) return json({ ok: false, error: 'rate' }, 429, cors)

  const work = (async () => {
    try {
      const id = await find()
      if (id) await reissue(env, id, now)
    } catch (err) {
      logError('resend_error', err)
    }
  })()
  if (ctx) ctx.waitUntil(work)
  else await work
  return json({ ok: true }, 200, cors)
}

// ---------- Conteúdo do email (PT-PT e EN) ----------
// Mensagem transacional única, por causa da candidatura: não é marketing e não inscreve o
// candidato em nenhuma lista. Sem nome, empresa ou outro texto escrito no formulário.

const COPY = {
  pt: {
    subject: 'Confirme o seu email — candidatura Finer Pioneers',
    preheader: 'Falta um passo: confirme que este endereço de email é seu.',
    title: 'Confirme o seu email',
    intro: 'Recebemos a sua candidatura ao programa Finer Pioneers. Obrigado pelo interesse em construir a Finer One connosco.',
    ask: 'Para confirmar que este endereço de email é seu, abra a ligação abaixo e carregue em "Confirmar email".',
    button: 'Confirmar email',
    validity: 'A ligação é pessoal, só pode ser usada uma vez e é válida durante 48 horas.',
    next: 'A confirmação do email não é uma decisão sobre a candidatura: a equipa vai analisá-la e contactará os empresários selecionados.',
    ignore: 'Se não se candidatou ao Finer Pioneers, pode ignorar esta mensagem: sem confirmação, este endereço não será usado.',
    why: 'Recebeu este email porque este endereço foi indicado numa candidatura ao Finer Pioneers em www.finer-one.com. É uma mensagem de serviço, enviada por causa dessa candidatura; não o inscreve em newsletters nem em campanhas.',
    fallback: 'Se o botão não funcionar, copie este endereço para o navegador:',
  },
  en: {
    subject: 'Confirm your email — Finer Pioneers application',
    preheader: 'One step left: confirm that this email address is yours.',
    title: 'Confirm your email',
    intro: 'We received your application to the Finer Pioneers programme. Thank you for your interest in building Finer One with us.',
    ask: 'To confirm that this email address is yours, open the link below and select "Confirm email".',
    button: 'Confirm email',
    validity: 'The link is personal, can only be used once and is valid for 48 hours.',
    next: 'Confirming your email is not a decision on your application: the team will review it and contact the selected business owners.',
    ignore: 'If you did not apply to Finer Pioneers, you can ignore this message: without confirmation, this address will not be used.',
    why: 'You received this email because this address was given in a Finer Pioneers application at www.finer-one.com. It is a service message, sent because of that application; it does not sign you up for newsletters or campaigns.',
    fallback: 'If the button does not work, copy this address into your browser:',
  },
} as const

export function confirmEmail(lang: 'pt' | 'en', link: string): { subject: string; text: string; html: string } {
  const c = COPY[lang]
  const text = [c.intro, '', c.ask, '', link, '', c.validity, c.next, '', c.ignore, '', '—', 'Finer One · Where Finance Meets Strategy', 'www.finer-one.com', '', c.why].join('\n')
  // A ligação só tem caracteres seguros (origem validada + token base64url), por isso entra no HTML tal como está.
  const p = 'margin:0 0 16px;font-size:15px;line-height:1.6;color:#0B1030'
  const small = 'margin:0 0 10px;font-size:12.5px;line-height:1.6;color:#5B6282'
  const html = `<!doctype html>
<html lang="${lang === 'en' ? 'en' : 'pt-PT'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${c.subject}</title></head>
<body style="margin:0;padding:0;background:#F3F6FD;font-family:Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${c.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F6FD"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden">
<tr><td style="background:#070D2B;padding:24px 32px;border-bottom:2px solid #0052FF"><span style="font-size:18px;font-weight:700;letter-spacing:-0.01em;color:#FFFFFF">Finer One</span><span style="font-size:12px;color:#9FB4E8"> &nbsp;·&nbsp; Finer Pioneers</span></td></tr>
<tr><td style="padding:32px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;letter-spacing:-0.02em;color:#070D2B">${c.title}</h1>
<p style="${p}">${c.intro}</p>
<p style="${p}">${c.ask.replace(/"([^"]+)"/, '<strong>$1</strong>')}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="border-radius:999px;background:#0052FF"><a href="${link}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none">${c.button}</a></td></tr></table>
<p style="${p}">${c.validity}</p>
<p style="${p}">${c.next}</p>
<p style="${small}">${c.fallback}<br><a href="${link}" style="color:#0040C8;word-break:break-all">${link}</a></p>
</td></tr>
<tr><td style="padding:20px 32px 28px;border-top:1px solid #E6EAF5">
<p style="${small}">${c.ignore}</p>
<p style="${small}">${c.why}</p>
<p style="margin:0;font-size:12.5px;line-height:1.6;color:#5B6282">Finer One · Where Finance Meets Strategy · <a href="https://www.finer-one.com" style="color:#5B6282">www.finer-one.com</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`
  return { subject: c.subject, text, html }
}

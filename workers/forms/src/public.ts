/**
 * Finer One — recetor público dos formulários do site (Cloudflare Worker).
 *
 * POST /  — recebe uma submissão da Lista de Espera ou do Finer Pioneers e
 *           guarda-a em D1. O site só mostra "sucesso" quando este Worker
 *           responde { ok: true } depois de a linha estar gravada.
 * GET  /  — verificação simples de que o serviço está ativo.
 *
 * Não envia emails nem regista dados pessoais nos logs. A consulta, exportação
 * e eliminação estão num Worker separado (admin.ts), protegido por autenticação.
 *
 * Proteções: Turnstile validado no servidor; campo-armadilha e tempo mínimo;
 * identificador de submissão (repetições não duplicam); lista de espera sem
 * emails repetidos; o mesmo email só 1 candidatura Pioneers a cada 10 minutos;
 * limite global por minuto; validação e limites de tamanho; corpo até 16 KB;
 * CORS e Origin restritos ao site (não é autenticação — só reduz abuso).
 */
import { KINDS, type Kind, clean, json, list, logError, text, validate } from './shared'

export interface Env {
  DB: D1Database
  /** Segredo do widget Turnstile (wrangler secret put TURNSTILE_SECRET). */
  TURNSTILE_SECRET: string
  /** Origens autorizadas a enviar, separadas por vírgulas (ex.: https://www.finer-one.com). */
  ALLOWED_ORIGINS: string
  /** Hostnames aceites na resposta do Turnstile (ex.: www.finer-one.com). Vazio = não verifica. */
  ALLOWED_HOSTNAMES?: string
  /** Só para testes locais: endereço alternativo de verificação do Turnstile. */
  TURNSTILE_VERIFY_URL?: string
}

const MAX_BODY = 16 * 1024
const MIN_FILL_MS = 3000
const PIONEERS_EMAIL_WINDOW_MS = 10 * 60 * 1000
const GLOBAL_PER_MINUTE = 30
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? ''
    const allowed = list(env.ALLOWED_ORIGINS).includes(origin)
    const cors: Record<string, string> = allowed ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : { Vary: 'Origin' }

    if (request.method === 'OPTIONS') {
      if (!allowed) return new Response(null, { status: 403, headers: cors })
      return new Response(null, {
        status: 204,
        headers: { ...cors, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' },
      })
    }
    if (request.method === 'GET' && new URL(request.url).pathname === '/') return json({ ok: true, service: 'finer-one-forms' }, 200, cors)
    if (request.method !== 'POST') return json({ ok: false, error: 'invalid' }, 405, cors)
    if (!allowed) return json({ ok: false, error: 'forbidden' }, 403, cors)

    try {
      return await submit(request, env, cors)
    } catch (err) {
      logError('submit_failed', err)
      return json({ ok: false, error: 'server' }, 500, cors)
    }
  },
} satisfies ExportedHandler<Env>

async function readBody(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get('Content-Length') ?? '0')
  if (declared > MAX_BODY) return null
  const raw = await request.text()
  return raw.length > MAX_BODY ? null : raw
}

async function submit(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  const raw = await readBody(request)
  if (raw === null) return json({ ok: false, error: 'invalid' }, 413, cors)

  let body: Record<string, unknown>
  try {
    const parsed = JSON.parse(raw || '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('shape')
    body = parsed as Record<string, unknown>
  } catch {
    return json({ ok: false, error: 'invalid' }, 400, cors)
  }

  const kind = body.kind as Kind
  if (!KINDS.includes(kind)) return json({ ok: false, error: 'invalid' }, 400, cors)

  const c = clean(body.fields)
  const invalid = validate(kind, c)
  if (invalid) return json({ ok: false, error: 'invalid', field: invalid }, 400, cors)

  const id = text(body.submissionId, 64).replace(/[^A-Za-z0-9-]/g, '') || crypto.randomUUID()

  // Mesmo envio repetido (duplo clique, nova tentativa após falha de rede): já está guardado.
  if (await env.DB.prepare('SELECT 1 FROM submissions WHERE id = ?').bind(id).first()) {
    return json({ ok: true, duplicate: true }, 200, cors)
  }

  if (!(await verifyTurnstile(body.turnstileToken, env, request.headers.get('CF-Connecting-IP')))) {
    return json({ ok: false, error: 'verification' }, 403, cors)
  }

  // Sinais de robô (campo-armadilha preenchido, envio demasiado rápido): nunca se finge
  // sucesso — só há confirmação com registo guardado ou já existente. A resposta é a mesma
  // de um Turnstile recusado e só chega depois da verificação, para não revelar qual das
  // proteções falhou.
  if (String(body.website ?? '').trim() !== '' || !(Number(body.elapsedMs) >= MIN_FILL_MS)) {
    return json({ ok: false, error: 'verification' }, 403, cors)
  }

  const now = Date.now()
  const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM submissions WHERE created_at > ?')
    .bind(new Date(now - 60_000).toISOString())
    .first<{ n: number }>()
  if ((recent?.n ?? 0) >= GLOBAL_PER_MINUTE) return json({ ok: false, error: 'rate' }, 429, cors)

  if (kind === 'waitlist') {
    // Já inscrito: para quem se inscreve, o resultado é o mesmo (está na lista).
    if (await env.DB.prepare("SELECT 1 FROM submissions WHERE kind = 'waitlist' AND email = ?").bind(c.email).first()) {
      return json({ ok: true, duplicate: true }, 200, cors)
    }
  } else if (
    await env.DB.prepare("SELECT 1 FROM submissions WHERE kind = 'pioneers' AND email = ? AND created_at > ?")
      .bind(c.email, new Date(now - PIONEERS_EMAIL_WINDOW_MS).toISOString())
      .first()
  ) {
    return json({ ok: false, error: 'duplicate' }, 409, cors)
  }

  const lang = body.lang === 'en' ? 'en' : 'pt'
  const consent = text(body.consentVersion, 40)
  const result = await env.DB.prepare(
    `INSERT INTO submissions (id, kind, created_at, name, email, company, sector, challenge, size, interests, lang, consent_version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
  )
    .bind(
      id,
      kind,
      new Date(now).toISOString(),
      c.name,
      c.email,
      kind === 'pioneers' ? c.company : null,
      kind === 'pioneers' ? c.sector : null,
      kind === 'pioneers' ? c.challenge : null,
      kind === 'waitlist' ? c.size : null,
      kind === 'waitlist' ? c.interests : null,
      lang,
      consent,
    )
    .run()

  // Corrida entre dois pedidos iguais: o outro já gravou.
  if (!result.meta.changes) return json({ ok: true, duplicate: true }, 200, cors)
  return json({ ok: true, id }, 200, cors)
}

async function verifyTurnstile(token: unknown, env: Env, ip: string | null): Promise<boolean> {
  if (typeof token !== 'string' || !token || token.length > 2048 || !env.TURNSTILE_SECRET) return false
  const form = new FormData()
  form.append('secret', env.TURNSTILE_SECRET)
  form.append('response', token)
  if (ip) form.append('remoteip', ip)
  // O endereço alternativo só é aceite se for local (testes); em produção usa-se sempre o oficial.
  const local = env.TURNSTILE_VERIFY_URL && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(env.TURNSTILE_VERIFY_URL)
  const res = await fetch(local ? env.TURNSTILE_VERIFY_URL! : SITEVERIFY, { method: 'POST', body: form })
  if (!res.ok) throw new Error('TurnstileUnavailable')
  const data = (await res.json()) as { success?: boolean; hostname?: string }
  if (data.success !== true) return false
  const hostnames = list(env.ALLOWED_HOSTNAMES)
  return hostnames.length === 0 || hostnames.includes(String(data.hostname ?? ''))
}

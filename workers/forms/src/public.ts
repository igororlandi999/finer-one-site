/**
 * Finer One — recetor público dos formulários do site (Cloudflare Worker).
 *
 * POST /  — recebe uma submissão da Lista de Espera ou do Finer Pioneers e
 *           guarda-a em D1. O site só mostra "sucesso" quando este Worker
 *           responde { ok: true } depois de a linha estar gravada.
 * GET  /  — verificação simples de que o serviço está ativo.
 *
 * POST / com kind "explore" — pedido da análise completa do Explorar: grava o lead
 *           e o contexto da simulação na tabela explore_leads (ver explore.ts) e
 *           só então confirma; a notificação interna por email (notify.ts) corre
 *           depois e é repetida pelo acionador agendado se falhar.
 *
 * Não regista dados pessoais nos logs. A Lista de Espera e o Finer Pioneers não
 * geram email. A consulta faz-se no painel autenticado da Cloudflare.
 *
 * Proteções: Turnstile validado no servidor; campo-armadilha e tempo mínimo;
 * identificador de submissão (repetições não duplicam); lista de espera sem
 * emails repetidos; o mesmo email só 1 candidatura Pioneers a cada 10 minutos;
 * limite global por minuto; validação e limites de tamanho; corpo até 16 KB;
 * CORS e Origin restritos ao site (não é autenticação — só reduz abuso).
 */
import { KINDS, type Kind, clean, json, list, logError, text, validate } from './shared'
import { cleanLead, cleanSimulation, referenceMonth, simHash, summarize } from './explore'
import { type NotifyEnv, notifyLead, retryPending } from './notify'

export interface Env extends NotifyEnv {
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
// Explorar: o mesmo email pode pedir várias análises (simulações diferentes), com limite.
const EXPLORE_SAME_SIM_WINDOW_MS = 24 * 60 * 60 * 1000
const EXPLORE_PER_EMAIL_DAY = 5

export default {
  async fetch(request: Request, env: Env, ctx?: ExecutionContext): Promise<Response> {
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
      return await submit(request, env, cors, ctx)
    } catch (err) {
      logError('submit_failed', err)
      return json({ ok: false, error: 'server' }, 500, cors)
    }
  },

  /** De 15 em 15 minutos: reenvia as notificações do Explorar que ainda não saíram. */
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      retryPending(env).then(
        () => undefined,
        (err) => logError('retry_failed', err),
      ),
    )
  },
} satisfies ExportedHandler<Env>

async function readBody(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get('Content-Length') ?? '0')
  if (declared > MAX_BODY) return null
  const raw = await request.text()
  return raw.length > MAX_BODY ? null : raw
}

async function submit(request: Request, env: Env, cors: Record<string, string>, ctx?: ExecutionContext): Promise<Response> {
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

  if (body.kind === 'explore') return explore(body, request, env, cors, ctx)

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

/**
 * Explorar: pedido da análise completa. Grava o lead e o contexto da simulação na
 * tabela explore_leads e só depois responde { ok, id }. A notificação por email
 * corre a seguir, fora da resposta, e nunca impede a gravação nem a confirmação.
 */
async function explore(body: Record<string, unknown>, request: Request, env: Env, cors: Record<string, string>, ctx?: ExecutionContext): Promise<Response> {
  const lead = cleanLead(body.fields)
  if (typeof lead === 'string') return json({ ok: false, error: 'invalid', field: lead }, 400, cors)
  const sim = cleanSimulation(body.simulation)
  if (typeof sim === 'string') return json({ ok: false, error: 'invalid', field: sim }, 400, cors)

  const id = text(body.submissionId, 64).replace(/[^A-Za-z0-9-]/g, '') || crypto.randomUUID()
  if (await env.DB.prepare('SELECT 1 FROM explore_leads WHERE id = ?').bind(id).first()) return json({ ok: true, duplicate: true }, 200, cors)

  if (!(await verifyTurnstile(body.turnstileToken, env, request.headers.get('CF-Connecting-IP')))) {
    return json({ ok: false, error: 'verification' }, 403, cors)
  }
  if (String(body.website ?? '').trim() !== '' || !(Number(body.elapsedMs) >= MIN_FILL_MS)) {
    return json({ ok: false, error: 'verification' }, 403, cors)
  }

  const now = Date.now()
  const minuteAgo = new Date(now - 60_000).toISOString()
  const recent = await env.DB.prepare('SELECT (SELECT COUNT(*) FROM submissions WHERE created_at > ?1) + (SELECT COUNT(*) FROM explore_leads WHERE created_at > ?1) AS n')
    .bind(minuteAgo)
    .first<{ n: number }>()
  if ((recent?.n ?? 0) >= GLOBAL_PER_MINUTE) return json({ ok: false, error: 'rate' }, 429, cors)

  // A mesma simulação, pelo mesmo email, já pedida nas últimas 24 h: o pedido já está registado
  // (sem nova linha nem novo email) e a análise abre na mesma.
  const hash = await simHash(sim)
  const dayAgo = new Date(now - EXPLORE_SAME_SIM_WINDOW_MS).toISOString()
  if (await env.DB.prepare('SELECT 1 FROM explore_leads WHERE email = ? AND sim_hash = ? AND created_at > ?').bind(lead.email, hash, dayAgo).first()) {
    return json({ ok: true, duplicate: true }, 200, cors)
  }
  const perEmail = await env.DB.prepare('SELECT COUNT(*) AS n FROM explore_leads WHERE email = ? AND created_at > ?').bind(lead.email, dayAgo).first<{ n: number }>()
  if ((perEmail?.n ?? 0) >= EXPLORE_PER_EMAIL_DAY) return json({ ok: false, error: 'rate' }, 429, cors)

  const s = summarize(sim)
  const result = await env.DB.prepare(
    `INSERT INTO explore_leads (id, created_at, name, email, company, phone, contact_requested, marketing_opt_in,
       simulation_id, scenario, horizon, currency, reference_month, sim_hash, sim_inputs, sim_results,
       lowest_balance, max_gap, funding_need, lang, consent_version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
  )
    .bind(
      id,
      new Date(now).toISOString(),
      lead.name,
      lead.email,
      lead.company,
      lead.phone,
      lead.contact ? 1 : 0,
      lead.marketing ? 1 : 0,
      sim.id,
      sim.scenario,
      sim.horizon,
      sim.currency,
      referenceMonth(now),
      hash,
      JSON.stringify(sim.inputs),
      JSON.stringify(s),
      s.lowestBalance,
      s.maxGap,
      s.fundingNeed,
      body.lang === 'en' ? 'en' : 'pt',
      text(body.consentVersion, 40),
    )
    .run()
  if (!result.meta.changes) return json({ ok: true, duplicate: true }, 200, cors)

  const sending = notifyLead(env, id)
  if (ctx) ctx.waitUntil(sending)
  else await sending
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

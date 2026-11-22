import { env } from 'cloudflare:workers'
import { createExecutionContext, createScheduledController, waitOnExecutionContext } from 'cloudflare:test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../src/public'
import { MAX_ATTEMPTS, SUBMISSION_NOTIFY_CONSENTS, lisbonDate, notifySubmission, retryPending } from '../src/notify'
import formsSource from '../../../src/lib/forms.ts?raw'

// Notificação interna da Lista de Espera e do Finer Pioneers (dados sintéticos).
const ORIGIN = 'https://www.finer-one.com'
const V4 = '2026-11-v4'
type Body = Record<string, unknown>
let resendCalls: { headers: Headers; body: Record<string, any> }[] = []
let resendStatus = 200
let resendThrows = false

const withKey = () => ({ ...env, RESEND_API_KEY: 're_test_123' })

async function post(body: Body, e: typeof env = withKey()) {
  const ctx = createExecutionContext()
  const r = await worker.fetch(
    new Request('https://forms.test/', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', Origin: ORIGIN }, body: JSON.stringify(body) }),
    e,
    ctx,
  )
  await waitOnExecutionContext(ctx) // espera a notificação que corre depois da resposta
  return r
}
const wl = (fields: Body = {}, over: Body = {}): Body => ({
  kind: 'waitlist',
  fields: { name: 'Teste Sintético', email: 'Lista@Exemplo-Sintetico.pt', size: '2 a 9 pessoas', interests: 'Tesouraria, Previsões', ...fields },
  submissionId: crypto.randomUUID(), website: '', elapsedMs: 9000, consentVersion: V4, lang: 'pt', turnstileToken: 'tok-ok',
  ...over,
})
const pio = (fields: Body = {}, over: Body = {}): Body => ({
  kind: 'pioneers',
  fields: { name: 'Teste Pioneer', email: 'pioneer@exemplo-sintetico.pt', company: 'Empresa Sintética, Lda', sector: 'Comércio', challenge: 'Pressão de tesouraria. Clientes pagam tarde.', ...fields },
  submissionId: crypto.randomUUID(), website: '', elapsedMs: 9000, consentVersion: V4, lang: 'pt', turnstileToken: 'tok-ok',
  ...over,
})
const row = async (id: unknown) => env.DB.prepare('SELECT * FROM submissions WHERE id = ?').bind(id).first<Record<string, any>>()
const count = async () => (await env.DB.prepare('SELECT COUNT(*) AS n FROM submissions').first<{ n: number }>())!.n

beforeEach(async () => {
  await env.DB.prepare('DELETE FROM submissions').run()
  await env.DB.prepare('DELETE FROM explore_leads').run()
  resendCalls = []
  resendStatus = 200
  resendThrows = false
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (url.startsWith('https://challenges.cloudflare.com/turnstile/v0/siteverify')) {
      const token = (init?.body as FormData).get('response')
      return token === 'tok-ok' ? Response.json({ success: true, hostname: 'www.finer-one.com' }) : Response.json({ success: false })
    }
    if (url === 'https://api.resend.com/emails') {
      if (resendThrows) throw new TypeError('network')
      resendCalls.push({ headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) })
      return resendStatus === 200 ? Response.json({ id: 'email-1' }) : new Response('{"name":"error"}', { status: resendStatus })
    }
    throw new Error('fetch inesperado: ' + url)
  })
})
afterEach(() => vi.restoreAllMocks())

describe('1. Lista de Espera: cadastro válido gera email', () => {
  it('grava primeiro, confirma com id e envia o email pedido (sem dados a mais)', async () => {
    const b = wl()
    const r = await post(b)
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ ok: true, id: b.submissionId })
    expect(resendCalls).toHaveLength(1)
    const { headers, body } = resendCalls[0]
    expect(headers.get('Authorization')).toBe('Bearer re_test_123')
    expect(headers.get('Idempotency-Key')).toBe(`waitlist-${b.submissionId}`)
    expect(body.to).toEqual(['geral.finerone@gmail.com'])
    expect(body.from).toBe('Finer One <onboarding@resend.dev>')
    expect(body.subject).toBe('Novo lead Lista de Espera | Finer One')
    expect(body.reply_to).toEqual(['lista@exemplo-sintetico.pt'])
    const saved = await row(b.submissionId)
    expect(body.text).toContain('Nome: Teste Sintético')
    expect(body.text).toContain('Email: lista@exemplo-sintetico.pt')
    expect(body.text).toContain(`Data da inscrição: ${lisbonDate(saved!.created_at)}`)
    expect(body.text).toContain('Origem: Lista de Espera')
    expect(body.text).toContain(`Identificador interno: ${b.submissionId}`)
    // Minimização: dimensão, temas, idioma e versão do aviso não seguem no email.
    for (const v of ['2 a 9 pessoas', 'Tesouraria', 'Previsões', V4]) expect(body.text).not.toContain(v)
    expect(saved).toMatchObject({ notify_status: 'sent', notify_attempts: 1, notify_error: null, consent_version: V4 })
    expect(saved!.notified_at).toBeTruthy()
  })

  it('data no fuso de Lisboa', () => {
    expect(lisbonDate('2026-11-22T22:33:04.000Z')).toBe('22/11/2026, 22:33 (hora de Lisboa)')
    expect(lisbonDate('2026-07-01T10:05:00.000Z')).toBe('01/07/2026, 11:05 (hora de Lisboa)')
  })
})

describe('2. Finer Pioneers: cadastro válido gera email', () => {
  it('envia nome, email, empresa, setor, desafio, data e identificador', async () => {
    const b = pio()
    const r = await post(b)
    expect(await r.json()).toEqual({ ok: true, id: b.submissionId })
    expect(resendCalls).toHaveLength(1)
    const { headers, body } = resendCalls[0]
    expect(headers.get('Idempotency-Key')).toBe(`pioneers-${b.submissionId}`)
    expect(body.subject).toBe('Nova candidatura Finer Pioneers | Finer One')
    expect(body.reply_to).toEqual(['pioneer@exemplo-sintetico.pt'])
    for (const line of ['Nome: Teste Pioneer', 'Email: pioneer@exemplo-sintetico.pt', 'Empresa: Empresa Sintética, Lda', 'Setor: Comércio', 'Principal desafio financeiro: Pressão de tesouraria. Clientes pagam tarde.', 'Data da candidatura: ', `Identificador interno: ${b.submissionId}`]) {
      expect(body.text).toContain(line)
    }
    expect((await row(b.submissionId))!.notify_status).toBe('sent')
  })

  it('texto livre segue como texto simples; o assunto é fixo (sem dados do visitante)', async () => {
    const b = pio({ name: 'Rui <b>Teste</b>', challenge: 'Linha 1\nBcc: alguem@exemplo-sintetico.pt <script>' })
    await post(b)
    const { body } = resendCalls[0]
    expect(body.subject).toBe('Nova candidatura Finer Pioneers | Finer One')
    expect(body).not.toHaveProperty('html')
    expect(body.to).toEqual(['geral.finerone@gmail.com'])
    expect(body).not.toHaveProperty('bcc')
    expect(body.text).toContain('Bcc: alguem@exemplo-sintetico.pt <script>')
  })
})

describe('3. Cadastro repetido não duplica a notificação', () => {
  it('o mesmo envio repetido (mesmo identificador) não gera segundo email', async () => {
    const b = wl()
    await post(b)
    const again = await post(b)
    expect(await again.json()).toEqual({ ok: true, duplicate: true })
    expect(resendCalls).toHaveLength(1)
  })
  it('Lista de Espera: email já inscrito não cria linha nem email', async () => {
    await post(wl())
    const again = await post(wl({ email: 'LISTA@exemplo-sintetico.pt' }))
    expect(await again.json()).toEqual({ ok: true, duplicate: true })
    expect(await count()).toBe(1)
    expect(resendCalls).toHaveLength(1)
  })
  it('Pioneers: mesmo email em 10 minutos é recusado sem email', async () => {
    await post(pio())
    const again = await post(pio())
    expect(again.status).toBe(409)
    expect(resendCalls).toHaveLength(1)
  })
  it('linha já notificada: nova chamada ou cron não reenviam', async () => {
    const b = wl()
    await post(b)
    expect(await notifySubmission(withKey(), b.submissionId as string)).toBe('skipped')
    expect(await retryPending(withKey(), Date.now() + 24 * 60 * 60_000)).toBe(0)
    expect(resendCalls).toHaveLength(1)
  })
  it('duas chamadas em simultâneo enviam uma só vez', async () => {
    const b = wl()
    await post(b, env) // sem chave: grava e fica pendente
    await Promise.all([notifySubmission(withKey(), b.submissionId as string), notifySubmission(withKey(), b.submissionId as string)])
    expect(resendCalls).toHaveLength(1)
  })
})

describe('4. Falha do Resend sem perda do cadastro', () => {
  it('erro HTTP: o visitante recebe sucesso, a linha fica gravada e pendente', async () => {
    resendStatus = 500
    const b = pio()
    const r = await post(b)
    expect(await r.json()).toEqual({ ok: true, id: b.submissionId })
    expect(await row(b.submissionId)).toMatchObject({ kind: 'pioneers', notify_status: 'pending', notify_attempts: 1, notify_error: 'http_500' })
  })
  it('falha de rede: igual, e o log não tem dados pessoais', async () => {
    resendThrows = true
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const b = wl()
    expect(await (await post(b)).json()).toEqual({ ok: true, id: b.submissionId })
    expect(await row(b.submissionId)).toMatchObject({ notify_status: 'pending', notify_error: 'network' })
    expect(JSON.stringify(log.mock.calls)).not.toContain('exemplo-sintetico')
  })
  it('sem RESEND_API_KEY: grava, fica pendente sem gastar tentativas', async () => {
    const b = wl()
    expect(await (await post(b, env)).json()).toEqual({ ok: true, id: b.submissionId })
    expect(await row(b.submissionId)).toMatchObject({ notify_status: 'pending', notify_attempts: 0, notify_error: 'not_configured' })
    expect(resendCalls).toHaveLength(0)
  })
  it('base sem as colunas da migração 0003: a inscrição é gravada na mesma', async () => {
    // Simula publicar o Worker antes da migração: a notificação falha, o cadastro não.
    const failing = { ...withKey(), DB: new Proxy(env.DB, { get: (t, k) => (k === 'prepare' ? (sql: string) => (sql.includes('notify_') ? { bind: () => { throw new Error('no such column') } } : t.prepare(sql)) : (t as any)[k]) }) }
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const b = wl()
    expect(await (await post(b, failing as typeof env)).json()).toEqual({ ok: true, id: b.submissionId })
    expect(await row(b.submissionId)).toBeTruthy()
  })
})

describe('5. Novas tentativas pelo Cron', () => {
  it('reenvia com intervalos crescentes e acaba em failed após MAX_ATTEMPTS', async () => {
    resendStatus = 503
    const b = wl()
    await post(b)
    expect(await retryPending(withKey())).toBe(0) // ainda dentro do intervalo
    for (let i = 1; i < MAX_ATTEMPTS; i++) await retryPending(withKey(), Date.now() + i * 13 * 60 * 60_000)
    expect(await row(b.submissionId)).toMatchObject({ notify_status: 'failed', notify_attempts: MAX_ATTEMPTS, notify_error: 'http_503' })
    expect(resendCalls).toHaveLength(MAX_ATTEMPTS)
    expect(new Set(resendCalls.map((c) => c.headers.get('Idempotency-Key')))).toEqual(new Set([`waitlist-${b.submissionId}`]))
    await retryPending(withKey(), Date.now() + 10 * 24 * 60 * 60_000)
    expect(resendCalls).toHaveLength(MAX_ATTEMPTS)
  })
  it('o handler scheduled envia as pendentes da Lista de Espera, do Pioneers e do Explorar', async () => {
    const a = wl()
    const p = pio()
    await post(a, env)
    await post(p, env)
    await env.DB.prepare(
      `INSERT INTO explore_leads (id, created_at, name, email, company, contact_requested, simulation_id, scenario, horizon, currency, reference_month, sim_hash, sim_inputs, sim_results, max_gap, lang, consent_version)
       VALUES ('exp-1', ?, 'Teste', 'exp@exemplo-sintetico.pt', 'Empresa', 1, 'sim-1', 'treasury', 3, 'EUR', '2026-11', 'h', '{}', '{}', 0, 'pt', ?)`,
    ).bind(new Date().toISOString(), V4).run()
    const ctx = createExecutionContext()
    await worker.scheduled(createScheduledController({ cron: '*/15 * * * *', scheduledTime: Date.now() }), withKey(), ctx)
    await waitOnExecutionContext(ctx)
    expect(resendCalls.map((c) => c.headers.get('Idempotency-Key')).sort()).toEqual(['explore-exp-1', `pioneers-${p.submissionId}`, `waitlist-${a.submissionId}`].sort())
    expect((await row(a.submissionId))!.notify_status).toBe('sent')
    expect((await row(p.submissionId))!.notify_status).toBe('sent')
  })
  it('no máximo 20 envios por execução, somando as duas tabelas', async () => {
    for (let i = 0; i < 25; i++) await post(wl({ email: `l${i}@exemplo-sintetico.pt` }), env)
    expect(await retryPending(withKey())).toBe(20)
    expect(await retryPending(withKey())).toBe(5)
  })
})

describe('6. Explorar preservado', () => {
  it('assunto, chave de idempotência e Reply-To do Explorar não mudam', async () => {
    await env.DB.prepare(
      `INSERT INTO explore_leads (id, created_at, name, email, company, phone, contact_requested, simulation_id, scenario, horizon, currency, reference_month, sim_hash, sim_inputs, sim_results, max_gap, lang, consent_version)
       VALUES ('exp-2', ?, 'Teste', 'exp@exemplo-sintetico.pt', 'Empresa Exemplo', NULL, 0, 'sim-2', 'clients', 6, 'EUR', '2026-11', 'h', '{}', '{}', 0, 'pt', '2026-11-v3')`,
    ).bind(new Date().toISOString()).run()
    await retryPending(withKey())
    const { headers, body } = resendCalls[0]
    expect(headers.get('Idempotency-Key')).toBe('explore-exp-2')
    expect(body.subject).toBe('Novo lead Explorar — Empresa Exemplo | Finer One')
    expect(body.reply_to).toEqual(['exp@exemplo-sintetico.pt'])
    expect(body.text).toContain('Tipo de simulação: Os meus clientes')
    // O Explorar não depende da versão do aviso (v3 já prevê o email).
    expect((await env.DB.prepare("SELECT notify_status FROM explore_leads WHERE id = 'exp-2'").first<{ notify_status: string }>())!.notify_status).toBe('sent')
  })
})

describe('7. Aviso de privacidade, migrações e cadastros existentes', () => {
  it('a versão do aviso que o site envia é a que o Worker notifica (v4)', () => {
    const site = /export const PRIVACY_VERSION = '([^']+)'/.exec(formsSource)?.[1]
    expect(site).toBe(V4)
    expect(SUBMISSION_NOTIFY_CONSENTS).toContain(site)
  })

  it('inscrições com o aviso v3 (que diz que não há email) ficam skipped e nunca enviam', async () => {
    expect(SUBMISSION_NOTIFY_CONSENTS).not.toContain('2026-11-v3')
    const b = wl({}, { consentVersion: '2026-11-v3' })
    expect(await (await post(b)).json()).toEqual({ ok: true, id: b.submissionId })
    expect(await row(b.submissionId)).toMatchObject({ notify_status: 'skipped', notify_error: 'consent_version', notify_attempts: 0 })
    await retryPending(withKey(), Date.now() + 24 * 60 * 60_000)
    expect(resendCalls).toHaveLength(0)
  })

  it('0003 sobre uma tabela com cadastros: dados intactos, antigos sem email, INSERT antigo continua a funcionar', async () => {
    const migrations = (env as any).TEST_MIGRATIONS as { name: string; queries: string[] }[]
    const pick = (n: string) => migrations.find((m) => m.name.startsWith(n))!.queries.map((q) => q.replaceAll('submissions', 'compat_submissions'))
    try {
      for (const q of pick('0001')) await env.DB.prepare(q).run()
      // Cadastros como os de produção, gravados pelo código anterior.
      const oldInsert = `INSERT INTO compat_submissions (id, kind, created_at, name, email, company, sector, challenge, size, interests, lang, consent_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      await env.DB.prepare(oldInsert).bind('old-1', 'waitlist', '2026-11-16T10:00:00.000Z', 'Antigo', 'a@exemplo-sintetico.pt', null, null, null, 'Só eu', 'Tesouraria', 'pt', '2026-11-v1').run()
      await env.DB.prepare(oldInsert).bind('old-2', 'pioneers', '2026-11-16T11:00:00.000Z', 'Antigo P', 'p@exemplo-sintetico.pt', 'Emp', 'Outro', 'Desafio antigo', null, null, 'pt', '2026-11-v1').run()
      for (const q of pick('0003')) await env.DB.prepare(q).run()
      const { results } = await env.DB.prepare('SELECT id, name, size, challenge, status, notify_status, notify_attempts, notify_error FROM compat_submissions ORDER BY id').all()
      expect(results).toEqual([
        { id: 'old-1', name: 'Antigo', size: 'Só eu', challenge: null, status: 'nova', notify_status: 'skipped', notify_attempts: 0, notify_error: 'before_notifications' },
        { id: 'old-2', name: 'Antigo P', size: null, challenge: 'Desafio antigo', status: 'nova', notify_status: 'skipped', notify_attempts: 0, notify_error: 'before_notifications' },
      ])
      // Reversão do Worker: o INSERT do código anterior continua válido depois da migração.
      await env.DB.prepare(oldInsert).bind('new-1', 'waitlist', new Date().toISOString(), 'Novo', 'n@exemplo-sintetico.pt', null, null, null, 'Só eu', 'Tesouraria', 'pt', V4).run()
      expect(await env.DB.prepare("SELECT notify_status, notify_attempts FROM compat_submissions WHERE id = 'new-1'").first()).toEqual({ notify_status: 'pending', notify_attempts: 0 })
    } finally {
      await env.DB.prepare('DROP TABLE IF EXISTS compat_submissions').run()
    }
  })
})

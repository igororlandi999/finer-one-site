import { env } from 'cloudflare:workers'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../src/public'
import { createExecutionContext, createScheduledController, waitOnExecutionContext } from 'cloudflare:test'
import { MAX_ATTEMPTS, RETRY_AFTER_MIN, due, retryPending } from '../src/notify'
import { simulate, deepen } from '../../../src/lib/explore/monthly'

const ORIGIN = 'https://www.finer-one.com'
type Body = Record<string, unknown>
let resendCalls: { headers: Headers; body: Record<string, unknown> }[] = []
let resendStatus = 200
let resendThrows = false

const withKey = () => ({ ...env, RESEND_API_KEY: 're_test_123' })

function post(body: Body | string, e: typeof env = env, origin = ORIGIN) {
  return worker.fetch(
    new Request('https://forms.test/', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8', Origin: origin },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    e,
  )
}

// Dados sintéticos (nenhum dado real).
const treasuryInputs = { balance: 25000, receipts: [42000, 38000, 45000, 40000, 47000, 43000], payments: [41000, 43000, 40000, 44000, 41000, 42000], delayShare: 40, delayDays: 30, horizon: 6, hasBalance: true }
const ex = (over: Body = {}, sim: Body = {}, fields: Body = {}): Body => ({
  kind: 'explore',
  fields: { name: 'Teste Sintético', email: 'Teste@Exemplo-Sintetico.pt', company: 'Empresa Exemplo, Lda', phone: '+351 912 000 000', contact: '1', marketing: '0', privacy: '1', ...fields },
  simulation: { id: crypto.randomUUID(), scenario: 'treasury', horizon: 6, currency: 'EUR', inputs: { ...treasuryInputs }, ...sim },
  submissionId: crypto.randomUUID(), website: '', elapsedMs: 9000, consentVersion: '2026-11-v3', lang: 'pt', turnstileToken: 'tok-ok',
  ...over,
})
const leads = async () => (await env.DB.prepare('SELECT * FROM explore_leads ORDER BY created_at').all<Record<string, any>>()).results

beforeEach(async () => {
  await env.DB.prepare('DELETE FROM explore_leads').run()
  await env.DB.prepare('DELETE FROM submissions').run()
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

describe('Explorar — gravação', () => {
  it('grava o lead com o contexto da simulação e confirma com id', async () => {
    const b = ex()
    const r = await post(b)
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ ok: true, id: b.submissionId })
    const [row] = await leads()
    expect(row).toMatchObject({ id: b.submissionId, name: 'Teste Sintético', email: 'teste@exemplo-sintetico.pt', company: 'Empresa Exemplo, Lda', phone: '+351912000000', contact_requested: 1, marketing_opt_in: 0, source: 'explorar', scenario: 'treasury', horizon: 6, currency: 'EUR', lang: 'pt', consent_version: '2026-11-v3', status: 'nova' })
    expect(row.simulation_id).toBe((b.simulation as Body).id)
    expect(row.reference_month).toMatch(/^\d{4}-\d{2}$/)
    expect(row.sim_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.parse(row.sim_inputs)).toEqual({ balance: 25000, receipts: treasuryInputs.receipts, payments: treasuryInputs.payments, delayShare: 40, delayDays: 30, hasBalance: true })
  })

  it('os resultados são recalculados no servidor com o mesmo módulo do site', async () => {
    await post(ex())
    const [row] = await leads()
    const s = JSON.parse(row.sim_results)
    const r = simulate(treasuryInputs as never)
    const d = deepen(treasuryInputs as never)
    expect(s.lowestBalance).toBe(Math.round(r.delayed.minClosing))
    expect(s.maxGap).toBe(Math.round(r.maxGap))
    expect(s.fundingNeed).toBe(Math.round(d.fundingNeed))
    expect(s.pressureMonths).toEqual(r.pressure)
    expect(row.lowest_balance).toBe(s.lowestBalance)
    expect(row.max_gap).toBe(s.maxGap)
  })

  it('ignora resultados enviados pelo navegador', async () => {
    await post(ex({ results: { lowestBalance: 999999999 } }, { results: { lowestBalance: 999999999 } }))
    const [row] = await leads()
    expect(JSON.parse(row.sim_results).lowestBalance).not.toBe(999999999)
    expect(row.sim_inputs).not.toContain('999999999')
  })

  it('minimização: só os meses do horizonte; sem saldo/pagamentos quando não indicados', async () => {
    await post(ex({}, { scenario: 'clients', horizon: 3, inputs: { balance: 25000, receipts: [30000, 52000, 28000, 46000, 35000, 41000], payments: [1, 2, 3, 4, 5, 6], delayShare: 35, delayDays: 30, hasBalance: false } }))
    const [row] = await leads()
    expect(JSON.parse(row.sim_inputs)).toEqual({ balance: null, receipts: [30000, 52000, 28000], payments: null, delayShare: 35, delayDays: 30, hasBalance: false })
    expect(row.lowest_balance).toBeNull()
    expect(row.funding_need).toBeNull()
  })

  it('telefone é opcional', async () => {
    await post(ex({}, {}, { phone: '' }))
    expect((await leads())[0].phone).toBeNull()
  })

  it('Lista de Espera e Finer Pioneers continuam na tabela submissions', async () => {
    const wl = { kind: 'waitlist', fields: { name: 'Ana Teste', email: 'ana@exemplo-sintetico.pt', size: '2 a 9 pessoas', interests: 'Tesouraria' }, submissionId: crypto.randomUUID(), website: '', elapsedMs: 9000, consentVersion: 'x', lang: 'pt', turnstileToken: 'tok-ok' }
    expect((await post(wl)).status).toBe(200)
    expect((await env.DB.prepare('SELECT COUNT(*) AS n FROM submissions').first<{ n: number }>())?.n).toBe(1)
    expect(await leads()).toHaveLength(0)
    expect(resendCalls).toHaveLength(0)
  })
})

describe('Explorar — validação no servidor', () => {
  const cases: [string, Body][] = [
    ['name', ex({}, {}, { name: 'A' })],
    ['email', ex({}, {}, { email: 'sem-arroba' })],
    ['company', ex({}, {}, { company: '' })],
    ['phone', ex({}, {}, { phone: '912 000 000' })],
    ['phone', ex({}, {}, { phone: '+351 12' })],
    ['privacy', ex({}, {}, { privacy: '0' })],
    ['scenario', ex({}, { scenario: 'outro' })],
    ['horizon', ex({}, { horizon: 4 })],
    ['currency', ex({}, { currency: 'BTC' })],
    ['simulation', ex({}, { id: 'x' })],
    ['simulation', ex({ simulation: 'texto' })],
    ['inputs', ex({}, { inputs: { ...treasuryInputs, receipts: [-1, 0, 0, 0, 0, 0] } })],
    ['inputs', ex({}, { inputs: { ...treasuryInputs, receipts: [1e12, 0, 0, 0, 0, 0] } })],
    ['inputs', ex({}, { inputs: { ...treasuryInputs, delayShare: 101 } })],
    ['inputs', ex({}, { inputs: { ...treasuryInputs, delayDays: 12.5 } })],
    ['inputs', ex({}, { inputs: { ...treasuryInputs, receipts: [1, 2] } })],
    ['inputs', ex({}, { inputs: { ...treasuryInputs, balance: 'muito' } })],
  ]
  for (const [field, body] of cases) {
    it(`recusa ${field} inválido → 400`, async () => {
      const r = await post(body)
      expect(r.status).toBe(400)
      expect(await r.json()).toEqual({ ok: false, error: 'invalid', field })
      expect(await leads()).toHaveLength(0)
    })
  }

  it('corpo acima de 16 KB → 413', async () => {
    const r = await post(ex({}, {}, { name: 'x'.repeat(17 * 1024) }))
    expect(r.status).toBe(413)
  })

  it('origem não autorizada → 403', async () => {
    const r = await post(ex(), env, 'https://outro-site.example')
    expect(r.status).toBe(403)
    expect(await leads()).toHaveLength(0)
  })

  it('não há nenhuma rota de leitura de leads', async () => {
    await post(ex())
    const r = await worker.fetch(new Request('https://forms.test/?kind=explore'), env)
    const text = await r.text()
    expect(text).not.toContain('exemplo-sintetico')
    expect((await worker.fetch(new Request('https://forms.test/leads'), env)).status).toBe(405)
  })
})

describe('Explorar — robôs e abuso', () => {
  it('Turnstile recusado → 403 sem gravar', async () => {
    const r = await post(ex({ turnstileToken: 'tok-mau' }))
    expect(r.status).toBe(403)
    expect(await leads()).toHaveLength(0)
  })
  it('campo-armadilha → 403 sem gravar', async () => {
    expect((await post(ex({ website: 'http://spam' }))).status).toBe(403)
    expect(await leads()).toHaveLength(0)
  })
  it('envio demasiado rápido → 403 sem gravar', async () => {
    expect((await post(ex({ elapsedMs: 500 }))).status).toBe(403)
    expect(await leads()).toHaveLength(0)
  })
  it('o mesmo envio repetido não duplica nem reenvia email', async () => {
    const b = ex()
    await post(b, withKey())
    const r = await post(b, withKey())
    expect(await r.json()).toEqual({ ok: true, duplicate: true })
    expect(await leads()).toHaveLength(1)
    expect(resendCalls).toHaveLength(1)
  })
  it('a mesma simulação do mesmo email em 24 h é reconhecida (sem nova linha)', async () => {
    await post(ex())
    const r = await post(ex({}, {}, { email: 'teste@exemplo-sintetico.pt' }))
    expect(await r.json()).toEqual({ ok: true, duplicate: true })
    expect(await leads()).toHaveLength(1)
  })
  it('simulações diferentes do mesmo email: até 5 por dia', async () => {
    for (let i = 0; i < 5; i++) expect((await post(ex({}, { inputs: { ...treasuryInputs, delayShare: i * 5 } }))).status).toBe(200)
    const r = await post(ex({}, { inputs: { ...treasuryInputs, delayShare: 50 } }))
    expect(r.status).toBe(429)
    expect(await r.json()).toEqual({ ok: false, error: 'rate' })
    expect(await leads()).toHaveLength(5)
  })
  it('logs sem dados pessoais nem financeiros', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    resendStatus = 500
    await post(ex(), withKey())
    const logged = JSON.stringify(spy.mock.calls)
    expect(logged).not.toContain('exemplo-sintetico')
    expect(logged).not.toContain('Teste')
    expect(logged).not.toContain('25000')
  })
})

describe('Explorar — notificação por email', () => {
  it('sem chave configurada: lead gravado, notificação pendente, nenhum envio', async () => {
    const b = ex()
    expect((await post(b)).status).toBe(200)
    const [row] = await leads()
    expect(row).toMatchObject({ notify_status: 'pending', notify_attempts: 0, notify_error: 'not_configured' })
    expect(resendCalls).toHaveLength(0)
  })

  it('com chave: envia um email à equipa com o conteúdo pedido', async () => {
    const b = ex()
    await post(b, withKey())
    expect(resendCalls).toHaveLength(1)
    const { headers, body } = resendCalls[0]
    expect(headers.get('Authorization')).toBe('Bearer re_test_123')
    expect(headers.get('Idempotency-Key')).toBe(`explore-${b.submissionId}`)
    expect(body.to).toEqual(['geral.finerone@gmail.com'])
    expect(body.from).toBe('Finer One <onboarding@resend.dev>')
    expect(body.reply_to).toBe('teste@exemplo-sintetico.pt')
    expect(body.subject).toBe('Novo lead Explorar — Empresa Exemplo, Lda | Finer One')
    const text = String(body.text)
    const simId = (b.simulation as Body).id as string
    expect(text).toContain('Pediu contacto da equipa: Sim')
    for (const s of ['Nome: Teste Sintético', 'Email: teste@exemplo-sintetico.pt', 'Empresa: Empresa Exemplo, Lda', 'Telefone: +351912000000', 'Tipo de simulação: A minha tesouraria', `ID da simulação: ${simId}`]) expect(text).toContain(s)
    expect(text).not.toContain('re_test_123')
    // Aviso v3: nenhum valor financeiro sai da D1 por email.
    const all = JSON.stringify(body).replaceAll(simId, '').replaceAll(String(b.submissionId), '')
    expect(all).not.toMatch(/€|saldo|liquidez|financiamento|capital preso|horizonte|moeda/i)
    for (const n of [...treasuryInputs.receipts, ...treasuryInputs.payments, treasuryInputs.balance]) expect(all).not.toContain(String(n))
    const [row0] = await leads()
    for (const k of ['lowestBalance', 'maxGap', 'fundingNeed']) expect(all).not.toContain(String(JSON.parse(row0.sim_results)[k]))
    const [row] = await leads()
    expect(row.notify_status).toBe('sent')
    expect(row.notified_at).toBeTruthy()
  })

  it('sem pedido de contacto, o email di-lo e avisa para não contactar comercialmente', async () => {
    await post(ex({}, {}, { contact: '0' }), withKey())
    const text = String(resendCalls[0].body.text)
    expect(text).toContain('Pediu contacto da equipa: Não (não contactar comercialmente')
    expect(text).not.toContain('Pediu contacto da equipa: Sim')
  })

  it('email falha: o lead fica gravado, a análise é confirmada e a falha fica registada', async () => {
    resendStatus = 500
    const b = ex()
    const r = await post(b, withKey())
    expect(await r.json()).toEqual({ ok: true, id: b.submissionId })
    const [row] = await leads()
    expect(row).toMatchObject({ notify_status: 'pending', notify_attempts: 1, notify_error: 'http_500' })
  })

  it('falha de rede no envio também não perde o lead', async () => {
    resendThrows = true
    expect((await post(ex(), withKey())).status).toBe(200)
    expect((await leads())[0]).toMatchObject({ notify_status: 'pending', notify_error: 'network' })
  })

  it('o acionador agendado reenvia as pendentes, mas só depois do intervalo', async () => {
    resendStatus = 500
    await post(ex(), withKey())
    resendStatus = 200
    expect(await retryPending(withKey())).toBe(0)
    expect(resendCalls).toHaveLength(1)
    expect(await retryPending(withKey(), Date.now() + 15 * 60_000)).toBe(1)
    expect((await leads())[0]).toMatchObject({ notify_status: 'sent', notify_attempts: 2, notify_error: null })
  })

  it('handler scheduled (o que o Cron Trigger chama) envia as pendentes', async () => {
    await post(ex())
    const ctx = createExecutionContext()
    await worker.scheduled(createScheduledController({ cron: '*/15 * * * *', scheduledTime: Date.now() }), withKey(), ctx)
    await waitOnExecutionContext(ctx)
    expect(resendCalls).toHaveLength(1)
    expect((await leads())[0].notify_status).toBe('sent')
  })

  it('handler scheduled sem chave não envia nem falha', async () => {
    await post(ex())
    const ctx = createExecutionContext()
    await worker.scheduled(createScheduledController({ cron: '*/15 * * * *', scheduledTime: Date.now() }), env, ctx)
    await waitOnExecutionContext(ctx)
    expect(resendCalls).toHaveLength(0)
    expect((await leads())[0]).toMatchObject({ notify_status: 'pending', notify_attempts: 0 })
  })

  it('intervalos: 15 min, 1 h, 4 h, 12 h — todos dentro das 24 h de idempotência do Resend', () => {
    const t0 = Date.parse('2026-12-01T10:00:00Z')
    const iso = (min: number) => new Date(t0 - min * 60_000).toISOString()
    expect(due(0, null, t0)).toBe(true)
    expect(due(1, iso(10), t0)).toBe(false)
    expect(due(1, iso(15), t0)).toBe(true)
    expect(due(2, iso(50), t0)).toBe(false)
    expect(due(2, iso(60), t0)).toBe(true)
    expect(due(4, iso(700), t0)).toBe(false)
    expect(due(4, iso(720), t0)).toBe(true)
    expect(RETRY_AFTER_MIN.reduce<number>((a, b) => a + b, 0)).toBeLessThan(24 * 60)
  })

  it('pendentes sem chave são enviadas quando a chave é configurada', async () => {
    await post(ex())
    expect(await retryPending(env)).toBe(0)
    expect(await retryPending(withKey())).toBe(1)
    expect((await leads())[0].notify_status).toBe('sent')
  })

  it(`depois de ${MAX_ATTEMPTS} tentativas falhadas fica "failed" e deixa de tentar`, async () => {
    resendStatus = 503
    await post(ex(), withKey())
    for (let i = 1; i <= MAX_ATTEMPTS + 2; i++) await retryPending(withKey(), Date.now() + i * 13 * 60 * 60_000)
    const [row] = await leads()
    expect(row).toMatchObject({ notify_status: 'failed', notify_attempts: MAX_ATTEMPTS, notify_error: 'http_503' })
    expect(resendCalls).toHaveLength(MAX_ATTEMPTS)
  })
})

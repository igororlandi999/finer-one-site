import { env } from 'cloudflare:workers'
import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../src/public'
import { SUBMISSION_NOTIFY_CONSENTS } from '../src/notify'
import { EXPLORE_PHONE_REQUIRED_CONSENTS } from '../src/explore'
import { PIONEERS_EXTRA_CONSENTS } from '../src/pioneers'
import { VERIFY_CONSENTS } from '../src/verify'
import { WAITLIST_PHONE_CONSENTS } from '../src/waitlist'
import formsSource from '../../../src/lib/forms.ts?raw'

// Lista de Espera — telefone obrigatório a partir do aviso 2026-11-v7 (dados sintéticos).
const ORIGIN = 'https://www.finer-one.com'
const V7 = '2026-11-v7'
type Body = Record<string, unknown>
let resendCalls: { body: Record<string, any> }[] = []
let siteverifyCalls = 0

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
  fields: { name: 'Teste Sintético', email: `lista-${crypto.randomUUID().slice(0, 8)}@exemplo-sintetico.pt`, size: '2 a 9 pessoas', interests: 'Tesouraria', ...fields },
  submissionId: crypto.randomUUID(), website: '', elapsedMs: 9000, consentVersion: V7, lang: 'pt', turnstileToken: 'tok-ok',
  ...over,
})
const rows = async () => (await env.DB.prepare('SELECT * FROM submissions ORDER BY created_at').all<Record<string, any>>()).results

beforeEach(async () => {
  await env.DB.prepare('DELETE FROM submissions').run()
  await env.DB.prepare('DELETE FROM explore_leads').run()
  resendCalls = []
  siteverifyCalls = 0
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (url.startsWith('https://challenges.cloudflare.com/turnstile/v0/siteverify')) {
      siteverifyCalls++
      const token = (init?.body as FormData).get('response')
      return token === 'tok-ok' ? Response.json({ success: true, hostname: 'www.finer-one.com' }) : Response.json({ success: false })
    }
    if (url === 'https://api.resend.com/emails') {
      resendCalls.push({ body: JSON.parse(String(init?.body)) })
      return Response.json({ id: 'email-1' })
    }
    throw new Error('fetch inesperado: ' + url)
  })
})
afterEach(() => vi.restoreAllMocks())

describe('Lista de Espera — telefone obrigatório a partir do aviso 2026-11-v7', () => {
  it.each([
    ['ausente', undefined],
    ['vazio', ''],
    ['só espaços', '   '],
    ['sem indicativo', '912 345 678'],
    ['curto demais', '+351 12'],
    ['Portugal com 8 dígitos', '+351 912 345 67'],
    ['Portugal a começar por 8', '+351 812 345 678'],
    ['longo demais', '+351 912 345 678 000 000'],
    ['letras', '+351 91A 345 678'],
  ])('recusa telefone %s com 400 phone, sem gravar, sem Turnstile e sem aviso à equipa', async (_n, phone) => {
    const r = await post(wl(phone === undefined ? {} : { phone }))
    expect(r.status).toBe(400)
    expect(await r.json()).toEqual({ ok: false, error: 'invalid', field: 'phone' })
    expect(await rows()).toHaveLength(0)
    expect(siteverifyCalls).toBe(0)
    expect(resendCalls).toHaveLength(0)
  })

  it.each([
    ['Portugal (móvel)', '+351 912 345 678', '+351912345678'],
    ['Portugal (fixo)', '+351 21 234 5678', '+351212345678'],
    ['Espanha', '+34 612 345 678', '+34612345678'],
    ['Reino Unido', '+44 20 7946 0958', '+442079460958'],
    ['Brasil', '+55 11 91234 5678', '+5511912345678'],
  ])('aceita telefone válido de %s e grava-o normalizado na coluna phone', async (_n, phone, saved) => {
    const b = wl({ phone })
    expect(await (await post(b)).json()).toEqual({ ok: true, id: b.submissionId })
    const [row] = await rows()
    expect(row).toMatchObject({ kind: 'waitlist', phone: saved, company_url: null, consent_version: V7, notify_status: 'sent', email_status: 'not_requested', confirm_status: 'none' })
  })

  it('a notificação interna inclui o telefone e a finalidade (sem marketing), para geral.finerone@gmail.com', async () => {
    const b = wl({ phone: '+351 912 345 678' })
    await post(b)
    expect(resendCalls).toHaveLength(1)
    const { body } = resendCalls[0]
    expect(body.to).toEqual(['geral.finerone@gmail.com'])
    expect(body.from).toBe('Finer One <onboarding@resend.dev>')
    expect(body.subject).toBe('Novo lead Lista de Espera | Finer One')
    expect(body.text).toContain('Telefone: +351912345678')
    expect(body.text).toContain('O telefone serve só para contactar sobre o interesse na Finer One e o acesso futuro à plataforma — não para campanhas de marketing.')
    // Minimização mantida: dimensão, temas e versão do aviso não seguem no email.
    for (const v of ['2 a 9 pessoas', 'Tesouraria', V7]) expect(body.text).not.toContain(v)
  })

  it.each(['2026-11-v3', '2026-11-v4', '2026-11-v5', '2026-11-v6'])('página publicada antes da v7 (%s): sem telefone continua a ser aceite', async (consentVersion) => {
    const b = wl({}, { consentVersion })
    expect(await (await post(b)).json()).toEqual({ ok: true, id: b.submissionId })
    expect((await rows())[0]).toMatchObject({ phone: null, consent_version: consentVersion })
  })

  it('versão anterior à v7 com telefone enviado: o número não é pedido por esse aviso e não é guardado nem notificado', async () => {
    const b = wl({ phone: '+351 912 345 678' }, { consentVersion: '2026-11-v6' })
    expect(await (await post(b)).json()).toEqual({ ok: true, id: b.submissionId })
    expect((await rows())[0]).toMatchObject({ phone: null, notify_status: 'sent' })
    expect(resendCalls[0].body.text).not.toContain('Telefone')
  })

  it('inscrição com v6 sem telefone: notificação igual à de antes (sem linha de telefone)', async () => {
    const b = wl({}, { consentVersion: '2026-11-v6' })
    await post(b)
    expect(resendCalls).toHaveLength(1)
    expect(resendCalls[0].body.text).not.toContain('Telefone')
    expect(resendCalls[0].body.text).not.toContain('O telefone serve')
  })

  it('email repetido na lista continua a responder duplicate, sem nova linha nem novo aviso', async () => {
    const first = wl({ phone: '+351 912 345 678', email: 'repetido@exemplo-sintetico.pt' })
    await post(first)
    const again = wl({ phone: '+351 913 000 000', email: 'repetido@exemplo-sintetico.pt' })
    expect(await (await post(again)).json()).toEqual({ ok: true, duplicate: true })
    expect(await rows()).toHaveLength(1)
    expect(resendCalls).toHaveLength(1)
  })
})

describe('Aviso v7 nos outros formulários: regras da v6 preservadas', () => {
  it('o site envia a v7 e todas as listas de versões do Worker a incluem (v4-v6 continuam aceites)', () => {
    const site = /export const PRIVACY_VERSION = '([^']+)'/.exec(formsSource)?.[1]
    expect(site).toBe(V7)
    expect(WAITLIST_PHONE_CONSENTS).toEqual([V7])
    for (const v of ['2026-11-v4', '2026-11-v5', '2026-11-v6', V7]) expect(SUBMISSION_NOTIFY_CONSENTS).toContain(v)
    expect(EXPLORE_PHONE_REQUIRED_CONSENTS).toEqual(['2026-11-v6', V7])
    expect(PIONEERS_EXTRA_CONSENTS).toEqual(['2026-11-v5', '2026-11-v6', V7])
    expect(VERIFY_CONSENTS).toEqual(['2026-11-v5', '2026-11-v6', V7])
  })

  it('Finer Pioneers com v7: telefone obrigatório, website opcional, aviso à equipa e sem email de confirmação (sem CONFIRM_FROM)', async () => {
    const pio = (fields: Body) => ({ kind: 'pioneers', fields: { name: 'Teste', email: `pio-${crypto.randomUUID().slice(0, 8)}@exemplo-sintetico.pt`, company: 'Empresa', sector: 'Comércio', challenge: 'Desafio de tesouraria.', ...fields }, submissionId: crypto.randomUUID(), website: '', elapsedMs: 9000, consentVersion: V7, lang: 'pt', turnstileToken: 'tok-ok' })
    expect(await (await post(pio({}))).json()).toEqual({ ok: false, error: 'invalid', field: 'phone' })
    expect(await (await post(pio({ phone: '+351 912 345 678', companyUrl: 'javascript:alert(1)' }))).json()).toEqual({ ok: false, error: 'invalid', field: 'companyUrl' })
    const ok = pio({ phone: '+351 912 345 678', companyUrl: 'empresa.pt' })
    // Sem "verification": nenhum email automático ao candidato enquanto não houver CONFIRM_FROM.
    expect(await (await post(ok)).json()).toEqual({ ok: true, id: ok.submissionId })
    expect((await rows())[0]).toMatchObject({ phone: '+351912345678', company_url: 'https://empresa.pt', notify_status: 'sent', email_status: 'not_requested', confirm_status: 'none' })
    expect(resendCalls).toHaveLength(1)
    expect(resendCalls[0].body.to).toEqual(['geral.finerone@gmail.com'])
  })

  it('Explorar com v7: telefone obrigatório e aviso à equipa como na v6', async () => {
    const ex = (phone: string) => ({
      kind: 'explore',
      fields: { name: 'Teste', email: 'exp-v7@exemplo-sintetico.pt', company: 'Empresa Exemplo', phone, contact: '0', marketing: '0', privacy: '1' },
      simulation: { id: crypto.randomUUID(), scenario: 'treasury', horizon: 3, currency: 'EUR', inputs: { balance: 20000, receipts: [30000, 31000, 32000], payments: [29000, 30000, 31000], delayShare: 20, delayDays: 30, horizon: 3, hasBalance: true } },
      submissionId: crypto.randomUUID(), website: '', elapsedMs: 9000, consentVersion: V7, lang: 'pt', turnstileToken: 'tok-ok',
    })
    expect(await (await post(ex(''))).json()).toEqual({ ok: false, error: 'invalid', field: 'phone' })
    const ok = ex('+351 912 345 678')
    expect(await (await post(ok)).json()).toEqual({ ok: true, id: ok.submissionId })
    const lead = await env.DB.prepare('SELECT phone, notify_status FROM explore_leads').first()
    expect(lead).toEqual({ phone: '+351912345678', notify_status: 'sent' })
  })
})

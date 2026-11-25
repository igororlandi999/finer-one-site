import { env } from 'cloudflare:workers'
import { createExecutionContext, createScheduledController, waitOnExecutionContext } from 'cloudflare:test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../src/public'
import { MAX_ATTEMPTS } from '../src/notify'
import { companyUrl, pioneerPhone } from '../src/pioneers'
import { MAX_PER_ADDRESS_DAY, MAX_RESENDS, RESEND_INTERVAL_MS, TOKEN_TTL_MS, VERIFY_PER_MINUTE, confirmConfigured, confirmEmail, handleResend, handleVerify, hashToken, newToken, retryConfirmations, sendConfirmation } from '../src/verify'

// Finer Pioneers: novos campos e verificação do email do candidato (dados sintéticos).
const ORIGIN = 'https://www.finer-one.com'
const V5 = '2026-11-v5'
const FROM = 'Finer One <info@finer-one.com>'
const CANDIDATE = 'candidata@exemplo-sintetico.pt'
type Body = Record<string, unknown>
type Mail = { headers: Headers; body: Record<string, any> }
let mails: Mail[] = []
let resendStatus = 200

/** Ambiente com o email de confirmação ativo (em produção isto só acontece depois de o domínio estar verificado). */
const on = () => ({ ...env, RESEND_API_KEY: 're_test_123', CONFIRM_FROM: FROM, CONFIRM_REPLY_TO: 'info@finer-one.com' }) as typeof env
/** Como está hoje em produção: notificações internas ativas, sem remetente de confirmação. */
const today = () => ({ ...env, RESEND_API_KEY: 're_test_123' }) as typeof env

async function call(path: string, body: Body, e: typeof env = on(), origin = ORIGIN) {
  const ctx = createExecutionContext()
  const r = await worker.fetch(new Request('https://forms.test' + path, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', Origin: origin }, body: JSON.stringify(body) }), e, ctx)
  await waitOnExecutionContext(ctx)
  return r
}
const pio = (fields: Body = {}, over: Body = {}): Body => ({
  kind: 'pioneers',
  fields: { name: 'Teste Pioneer', email: 'Candidata@Exemplo-Sintetico.pt', company: 'Empresa Sintética, Lda', sector: 'Comércio', challenge: 'Pressão de tesouraria. Clientes pagam tarde.', phone: '+351 912 345 678', companyUrl: 'www.exemplo-sintetico.pt', ...fields },
  submissionId: crypto.randomUUID(), website: '', elapsedMs: 9000, consentVersion: V5, lang: 'pt', turnstileToken: 'tok-ok',
  ...over,
})
const row = async (id: unknown) => (await env.DB.prepare('SELECT * FROM submissions WHERE id = ?').bind(id).first<Record<string, any>>())!
const tokens = async () => (await env.DB.prepare('SELECT * FROM email_tokens ORDER BY created_at').all<Record<string, any>>()).results
const toCandidate = () => mails.filter((m) => m.body.to[0] === CANDIDATE)
const tokenOf = (m: Mail) => /\/pioneers\/confirmar\/#t=([A-Za-z0-9_-]{43})/.exec(m.body.text)![1]
/** Candidatura já gravada, com o email de confirmação enviado. Devolve o id e o token recebido. */
async function applied(fields: Body = {}, over: Body = {}) {
  const b = pio(fields, over)
  const r = await call('/', b)
  expect(r.status).toBe(200)
  return { id: b.submissionId as string, token: tokenOf(toCandidate().at(-1)!), res: await r.json() }
}

beforeEach(async () => {
  await env.DB.batch([env.DB.prepare('DELETE FROM submissions'), env.DB.prepare('DELETE FROM email_tokens'), env.DB.prepare('DELETE FROM rate_counters')])
  mails = []
  resendStatus = 200
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (url.startsWith('https://challenges.cloudflare.com/turnstile/v0/siteverify')) {
      return (init?.body as FormData).get('response') === 'tok-ok' ? Response.json({ success: true, hostname: 'www.finer-one.com' }) : Response.json({ success: false })
    }
    if (url === 'https://api.resend.com/emails') {
      mails.push({ headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) })
      return resendStatus === 200 ? Response.json({ id: 'email-1' }) : new Response('{"name":"error"}', { status: resendStatus })
    }
    throw new Error('fetch inesperado: ' + url)
  })
})
afterEach(() => vi.restoreAllMocks())

describe('1. Novos campos da candidatura', () => {
  it('grava telefone e website normalizados; a avaliação comercial começa em "nova"', async () => {
    const { id } = await applied()
    expect(await row(id)).toMatchObject({ phone: '+351912345678', company_url: 'https://www.exemplo-sintetico.pt', status: 'nova', email: CANDIDATE })
  })
  it('telefone obrigatório e validado (formato internacional; plano de numeração de Portugal)', async () => {
    for (const phone of ['', '912 345 678', '+351 12', '+351 812 345 678', '+351 9123', '+351 912 345 6789', 'abc', '+1']) {
      const r = await call('/', pio({ phone }))
      expect(r.status, phone).toBe(400)
      expect(await r.json()).toEqual({ ok: false, error: 'invalid', field: 'phone' })
    }
    expect(mails).toHaveLength(0)
    expect(pioneerPhone('+351 21 234 56 78')).toBe('+351212345678')
    expect(pioneerPhone('+34 612 345 678')).toBe('+34612345678')
    expect(pioneerPhone('+44 (20) 7946-0958')).toBe('+442079460958')
  })
  it('website opcional; quando preenchido tem de ser um endereço http(s) de um domínio', async () => {
    const { id } = await applied({ companyUrl: '' })
    expect((await row(id)).company_url).toBeNull()
    for (const bad of ['javascript:alert(1)', 'http://localhost', 'https://utilizador:senha@exemplo.pt', 'ftp://exemplo.pt', 'exemplo', 'https://192.168.1.1', 'exemplo.pt:8080', 'exem plo.pt', 'mailto:a@exemplo.pt', 'x'.repeat(190) + '.exemplo-sintetico.pt']) {
      expect(companyUrl(bad), bad).toBe(false)
    }
    const r = await call('/', pio({ companyUrl: 'javascript:alert(1)', email: 'outra@exemplo-sintetico.pt' }))
    expect(await r.json()).toEqual({ ok: false, error: 'invalid', field: 'companyUrl' })
    expect(companyUrl('Exemplo-Sintetico.PT')).toBe('https://exemplo-sintetico.pt')
    expect(companyUrl('http://exemplo-sintetico.pt/sobre?x=1')).toBe('http://exemplo-sintetico.pt/sobre?x=1')
  })
  it('a notificação interna inclui o telefone e o website', async () => {
    await applied()
    const internal = mails.find((m) => m.body.to[0] === 'geral.finerone@gmail.com')!
    expect(internal.body.from).toBe('Finer One <onboarding@resend.dev>') // remetente e destinatário atuais inalterados
    expect(internal.body.text).toContain('Telefone: +351912345678')
    expect(internal.body.text).toContain('Website: https://www.exemplo-sintetico.pt')
  })
  it('página antiga (aviso v4, sem telefone): candidatura aceite como antes, sem verificação', async () => {
    const b = pio({ phone: undefined, companyUrl: undefined }, { consentVersion: '2026-11-v4' })
    const r = await call('/', b)
    expect(await r.json()).toEqual({ ok: true, id: b.submissionId })
    expect(await row(b.submissionId)).toMatchObject({ phone: null, company_url: null, email_status: 'not_requested', confirm_status: 'none' })
    expect(toCandidate()).toHaveLength(0)
  })
  it('Lista de Espera: sem alterações (nenhum campo novo, nenhuma verificação, nenhum email ao inscrito)', async () => {
    const b = { kind: 'waitlist', fields: { name: 'Teste', email: CANDIDATE, size: '2 a 9 pessoas', interests: 'Tesouraria' }, submissionId: crypto.randomUUID(), website: '', elapsedMs: 9000, consentVersion: V5, lang: 'pt', turnstileToken: 'tok-ok' }
    expect(await (await call('/', b)).json()).toEqual({ ok: true, id: b.submissionId })
    expect(await row(b.submissionId)).toMatchObject({ phone: null, email_status: 'not_requested', confirm_status: 'none' })
    expect(toCandidate()).toHaveLength(0)
  })
})

describe('2. Email de confirmação', () => {
  it('candidatura gravada → resposta com "verification: pending" → email institucional ao candidato', async () => {
    const { id, res } = await applied()
    expect(res).toEqual({ ok: true, id, verification: 'pending' })
    const [m] = toCandidate()
    expect(m.body.from).toBe(FROM)
    expect(m.body.to).toEqual([CANDIDATE])
    expect(m.body.reply_to).toEqual(['info@finer-one.com'])
    expect(m.body.subject).toBe('Confirme o seu email — candidatura Finer Pioneers')
    expect(m.body.text).toContain('https://www.finer-one.com/pioneers/confirmar/#t=')
    expect(m.body.html).toContain('Confirmar email')
    expect(m.headers.get('Idempotency-Key')).toBe(`pioneers-confirm-${id}-r0-a1`)
    // "Enviado" e "confirmado" são estados diferentes.
    expect(await row(id)).toMatchObject({ confirm_status: 'sent', email_status: 'pending', email_verified_at: null, status: 'nova' })
  })
  it('o email não leva nenhum texto escrito no formulário (não serve para enviar conteúdo a terceiros)', async () => {
    await applied({ name: 'COMPRE JÁ em spam.example', company: '<script>alert(1)</script>', challenge: 'Visite http://spam.example agora mesmo.' })
    const [m] = toCandidate()
    for (const s of ['COMPRE', 'spam.example', 'script>alert', 'Sintética', '+351']) {
      expect(m.body.text).not.toContain(s)
      expect(m.body.html).not.toContain(s)
    }
  })
  it('em inglês quando a candidatura foi feita em inglês', async () => {
    await applied({}, { lang: 'en' })
    const [m] = toCandidate()
    expect(m.body.subject).toBe('Confirm your email — Finer Pioneers application')
    expect(m.body.text).toMatch(/#t=[A-Za-z0-9_-]{43}&l=en/)
    expect(confirmEmail('en', 'https://x.test/#t=a').html).toContain('lang="en"')
  })
  it('na base de dados fica só o hash do token, nunca o token', async () => {
    const { id, token } = await applied()
    const [t] = await tokens()
    expect(t.token_hash).toBe(await hashToken(token))
    expect(t.token_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(Date.parse(t.expires_at) - Date.parse(t.created_at)).toBe(TOKEN_TTL_MS)
    expect(JSON.stringify([await row(id), await tokens()])).not.toContain(token)
    expect(newToken()).not.toBe(newToken())
    expect(newToken()).toMatch(/^[A-Za-z0-9_-]{43}$/)
  })
  it('como está hoje (sem CONFIRM_FROM): candidatura gravada, sem promessa de email e sem envio ao candidato', async () => {
    const b = pio()
    const r = await call('/', b, today())
    expect(await r.json()).toEqual({ ok: true, id: b.submissionId })
    expect(await row(b.submissionId)).toMatchObject({ phone: '+351912345678', email_status: 'not_requested', confirm_status: 'none', notify_status: 'sent' })
    expect(toCandidate()).toHaveLength(0)
    expect(await tokens()).toHaveLength(0)
  })
  it('o Resend falha: a candidatura NÃO se perde e o envio é repetido mais tarde com ligação nova', async () => {
    resendStatus = 500
    const b = pio()
    const r = await call('/', b)
    expect(await r.json()).toEqual({ ok: true, id: b.submissionId, verification: 'pending' })
    expect(await row(b.submissionId)).toMatchObject({ name: 'Teste Pioneer', confirm_status: 'pending', confirm_attempts: 1, confirm_error: 'http_500', email_status: 'pending' })

    resendStatus = 200
    expect(await retryConfirmations(on())).toBe(0) // ainda dentro do intervalo
    expect(await retryConfirmations(on(), Date.now() + 16 * 60_000)).toBe(1)
    expect(await row(b.submissionId)).toMatchObject({ confirm_status: 'sent', confirm_attempts: 2, confirm_error: null })
    const sent = toCandidate()
    expect(sent.at(-1)!.headers.get('Idempotency-Key')).toBe(`pioneers-confirm-${b.submissionId}-r0-a2`)
    expect(tokenOf(sent.at(-1)!)).not.toBe(tokenOf(sent[0]))
  })
  it(`desiste ao fim de ${MAX_ATTEMPTS} tentativas e fica "failed" para recuperação manual`, async () => {
    resendStatus = 422
    const b = pio()
    await call('/', b)
    let t = Date.now()
    for (let i = 0; i < MAX_ATTEMPTS + 2; i++) await retryConfirmations(on(), (t += 13 * 60 * 60_000))
    expect(await row(b.submissionId)).toMatchObject({ confirm_status: 'failed', confirm_attempts: MAX_ATTEMPTS, email_status: 'pending', status: 'nova' })
    expect(toCandidate()).toHaveLength(MAX_ATTEMPTS)
  })
  it('o acionador agendado repete os emails de confirmação por enviar', async () => {
    resendStatus = 500
    const b = pio()
    await call('/', b)
    resendStatus = 200
    await env.DB.prepare("UPDATE submissions SET confirm_last_attempt_at = '2026-01-01T00:00:00.000Z', notify_last_attempt_at = '2026-01-01T00:00:00.000Z'").run()
    const ctx = createExecutionContext()
    await worker.scheduled(createScheduledController(), on(), ctx)
    await waitOnExecutionContext(ctx)
    expect((await row(b.submissionId)).confirm_status).toBe('sent')
  })
  it('os logs nunca levam o token, o email nem o nome', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    resendStatus = 500
    await call('/', pio())
    resendStatus = 200
    const { token } = await applied({ email: 'segunda@exemplo-sintetico.pt' }).catch(() => ({ token: '' }))
    await call('/verify', { token: 'x'.repeat(43) })
    const out = JSON.stringify(log.mock.calls)
    expect(log).toHaveBeenCalled()
    for (const s of ['exemplo-sintetico', 'Teste Pioneer', '#t=', token || 'sem-token']) expect(out).not.toContain(s)
  })
})

describe('3. POST /verify', () => {
  it('token válido confirma o email — e só o email: a avaliação comercial não muda', async () => {
    const { id, token } = await applied()
    await env.DB.prepare("UPDATE submissions SET status = 'contactada' WHERE id = ?").bind(id).run()
    const r = await call('/verify', { token })
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ ok: true, status: 'verified' })
    const saved = await row(id)
    expect(saved).toMatchObject({ email_status: 'verified', status: 'contactada', confirm_status: 'sent' })
    expect(saved.email_verified_at).toMatch(/^\d{4}-\d\d-\d\dT/)
    expect((await tokens())[0].used_at).toBe(saved.email_verified_at)
  })
  it('a resposta não revela dados pessoais nem o estado de avaliação', async () => {
    const { token } = await applied()
    const text = await (await call('/verify', { token })).text()
    for (const s of ['exemplo', 'Pioneer', 'nova', 'status":"nova', '+351', 'Sintética']) expect(text).not.toContain(s)
  })
  it('uso único: a segunda visita não altera nada e diz apenas que já estava confirmado', async () => {
    const { id, token } = await applied()
    await call('/verify', { token })
    const first = (await row(id)).email_verified_at
    const again = await call('/verify', { token })
    expect(await again.json()).toEqual({ ok: true, status: 'verified', already: true })
    expect((await row(id)).email_verified_at).toBe(first)
  })
  it('dois pedidos em simultâneo com a mesma ligação: confirma uma só vez', async () => {
    const { token } = await applied()
    const [a, b] = await Promise.all([call('/verify', { token }), call('/verify', { token })])
    const out = [await a.json(), await b.json()] as Body[]
    expect(out.every((o) => o.ok === true && o.status === 'verified')).toBe(true)
    expect((await tokens()).filter((t) => t.used_at)).toHaveLength(1)
  })
  it('ligação expirada: 410, nada é confirmado', async () => {
    const { id, token } = await applied()
    const r = await handleVerify({ token }, on(), {}, Date.now() + TOKEN_TTL_MS + 1000)
    expect(r.status).toBe(410)
    expect(await r.json()).toEqual({ ok: false, error: 'expired' })
    expect((await row(id)).email_status).toBe('pending')
  })
  it('token desconhecido, adulterado ou mal formado: 404, igual para todos', async () => {
    const { id, token } = await applied()
    const flipped = token.slice(0, -1) + (token.endsWith('A') ? 'B' : 'A')
    for (const t of [flipped, newToken(), '', 'abc', 123, null, "' OR 1=1 --", 'x'.repeat(5000)]) {
      const r = await call('/verify', { token: t })
      expect(r.status).toBe(404)
      expect(await r.json()).toEqual({ ok: false, error: 'invalid' })
    }
    expect((await row(id)).email_status).toBe('pending')
  })
  it('confirmar invalida as outras ligações da mesma candidatura', async () => {
    const { id, token } = await applied()
    await handleResend({ token }, on(), {}, async () => true, undefined, Date.now() + RESEND_INTERVAL_MS + 1000)
    const second = tokenOf(toCandidate().at(-1)!)
    expect(second).not.toBe(token)
    await call('/verify', { token: second })
    expect((await tokens()).every((t) => t.used_at)).toBe(true)
    expect(await (await call('/verify', { token })).json()).toEqual({ ok: true, status: 'verified', already: true })
    expect((await row(id)).email_status).toBe('verified')
  })
  it(`limite de ${VERIFY_PER_MINUTE} verificações por minuto`, async () => {
    const minute = new Date().toISOString().slice(0, 16)
    await env.DB.prepare('INSERT INTO rate_counters (name, minute, n) VALUES (?, ?, ?)').bind('verify', minute, VERIFY_PER_MINUTE).run()
    const r = await handleVerify({ token: newToken() }, on(), {}, Date.parse(minute + ':30.000Z'))
    expect(r.status).toBe(429)
    expect(await r.json()).toEqual({ ok: false, error: 'rate' })
  })
  it('só o site pode chamar (Origin) e só por POST', async () => {
    const { token } = await applied()
    expect((await call('/verify', { token }, on(), 'https://evil.example')).status).toBe(403)
    const get = await worker.fetch(new Request(`https://forms.test/verify?token=${token}`, { headers: { Origin: ORIGIN } }), on())
    expect(get.status).toBe(405) // um GET (pré-visualização de ligações, filtros de email) nunca confirma
    expect((await tokens())[0].used_at).toBeNull()
  })
  it('apagar a candidatura apaga as suas ligações', async () => {
    const { id, token } = await applied()
    await env.DB.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run()
    expect(await tokens()).toHaveLength(0)
    expect((await call('/verify', { token })).status).toBe(404)
  })
})

describe('4. POST /resend', () => {
  const later = (n = 1) => Date.now() + n * (RESEND_INTERVAL_MS + 1000)
  const byEmail = (email: string, now = later(), turnstile = async () => true) => handleResend({ email, turnstileToken: 'tok-ok' }, on(), {}, turnstile, undefined, now)

  it('por email: a mesma resposta exista ou não candidatura (não permite enumerar emails)', async () => {
    await applied()
    const known = await byEmail(CANDIDATE)
    const unknown = await byEmail('ninguem@exemplo-sintetico.pt')
    expect([known.status, await known.text()]).toEqual([unknown.status, await unknown.text()])
    expect(known.status).toBe(200)
    expect(toCandidate()).toHaveLength(2) // original + reenvio; nada para o endereço desconhecido
    expect(mails.filter((m) => m.body.to[0] === 'ninguem@exemplo-sintetico.pt')).toHaveLength(0)
  })
  it('por email: exige Turnstile válido (pela rota pública)', async () => {
    await applied()
    const r = await call('/resend', { email: CANDIDATE, turnstileToken: 'tok-mau' })
    expect(r.status).toBe(403)
    expect(await r.json()).toEqual({ ok: false, error: 'verification' })
    expect((await call('/resend', { email: CANDIDATE })).status).toBe(403)
    expect((await call('/resend', { email: 'isto-nao-e-email' })).status).toBe(400)
    expect(toCandidate()).toHaveLength(1)
  })
  it('a nova ligação funciona e a anterior, ainda válida, também', async () => {
    const { id, token } = await applied()
    await byEmail(CANDIDATE)
    const fresh = tokenOf(toCandidate().at(-1)!)
    expect(toCandidate().at(-1)!.headers.get('Idempotency-Key')).toBe(`pioneers-confirm-${id}-r1-a1`)
    expect(fresh).not.toBe(token)
    expect(await (await call('/verify', { token: fresh })).json()).toEqual({ ok: true, status: 'verified' })
  })
  it('a partir de uma ligação expirada, sem voltar a escrever o email', async () => {
    const { id, token } = await applied()
    const after = Date.now() + TOKEN_TTL_MS + 1000
    expect((await handleVerify({ token }, on(), {}, after)).status).toBe(410)
    const r = await handleResend({ token }, on(), {}, async () => false, undefined, after)
    expect(await r.json()).toEqual({ ok: true })
    expect(toCandidate()).toHaveLength(2)
    const fresh = tokenOf(toCandidate().at(-1)!)
    expect((await handleVerify({ token: fresh }, on(), {}, after + 1000)).status).toBe(200)
    expect((await row(id)).email_status).toBe('verified')
  })
  it('limites: intervalo mínimo entre reenvios e máximo por candidatura', async () => {
    const { id } = await applied()
    await byEmail(CANDIDATE, Date.now() + 60_000) // logo a seguir ao envio inicial: ignorado
    expect(toCandidate()).toHaveLength(1)
    for (let i = 1; i <= MAX_RESENDS + 2; i++) await byEmail(CANDIDATE, later(i))
    expect(toCandidate()).toHaveLength(1 + MAX_RESENDS)
    expect((await row(id)).confirm_resends).toBe(MAX_RESENDS)
    const again = await byEmail(CANDIDATE, later(20))
    expect(await again.json()).toEqual({ ok: true }) // a resposta continua igual
  })
  it('email já confirmado: resposta igual, nenhum email novo', async () => {
    const { token } = await applied()
    await call('/verify', { token })
    expect(await (await byEmail(CANDIDATE)).json()).toEqual({ ok: true })
    expect(toCandidate()).toHaveLength(1)
  })
  it('recupera um envio que tinha ficado "failed"', async () => {
    resendStatus = 422
    const b = pio()
    await call('/', b)
    await env.DB.prepare("UPDATE submissions SET confirm_status = 'failed', confirm_attempts = ? WHERE id = ?").bind(MAX_ATTEMPTS, b.submissionId).run()
    resendStatus = 200
    await byEmail(CANDIDATE)
    expect(await row(b.submissionId)).toMatchObject({ confirm_status: 'sent', confirm_attempts: 1, confirm_resends: 1 })
  })
  it('candidaturas repetidas com o mesmo email não enchem a caixa de ninguém: limite de emails por endereço em 24 h', async () => {
    for (let i = 0; i < MAX_PER_ADDRESS_DAY + 2; i++) {
      await env.DB.prepare("UPDATE submissions SET created_at = '2026-11-01T00:00:00.000Z'").run() // fora da janela de 10 min entre candidaturas
      const b = pio()
      expect(await (await call('/', b)).json()).toMatchObject({ ok: true, id: b.submissionId }) // todas ficam gravadas
    }
    expect(toCandidate()).toHaveLength(MAX_PER_ADDRESS_DAY)
    expect((await env.DB.prepare("SELECT COUNT(*) AS n FROM submissions WHERE confirm_error = 'address_limit'").first<{ n: number }>())!.n).toBe(2)
  })
  it('limite global por minuto e indisponível enquanto o remetente não estiver configurado', async () => {
    const minute = new Date().toISOString().slice(0, 16)
    await env.DB.prepare('INSERT INTO rate_counters (name, minute, n) VALUES (?, ?, ?)').bind('resend', minute, 999).run()
    expect((await byEmail(CANDIDATE, Date.parse(minute + ':30.000Z'))).status).toBe(429)
    const off = await call('/resend', { email: CANDIDATE, turnstileToken: 'tok-ok' }, today())
    expect(off.status).toBe(503)
    expect(await off.json()).toEqual({ ok: false, error: 'unavailable' })
  })
})

describe('5. Candidaturas existentes e limpeza', () => {
  it('uma candidatura anterior continua válida: sem verificação pedida e sem email retroativo', async () => {
    await env.DB.prepare("INSERT INTO submissions (id, kind, created_at, name, email, company, sector, challenge, lang, consent_version) VALUES ('antiga', 'pioneers', '2026-11-16T10:00:00.000Z', 'Antiga', ?, 'Empresa', 'Comércio', 'Desafio antigo.', 'pt', '2026-11-v1')").bind(CANDIDATE).run()
    expect(await row('antiga')).toMatchObject({ status: 'nova', email_status: 'not_requested', confirm_status: 'none', phone: null })
    expect(await retryConfirmations(on(), Date.now() + 86_400_000)).toBe(0)
    expect(await sendConfirmation(on(), 'antiga')).toBe('skipped')
    await handleResend({ email: CANDIDATE, turnstileToken: 'tok-ok' }, on(), {}, async () => true)
    expect(toCandidate()).toHaveLength(0)
  })
  it('limpa ligações expiradas há muito tempo e contadores antigos', async () => {
    const { id } = await applied()
    await env.DB.prepare("INSERT INTO rate_counters (name, minute, n) VALUES ('verify', '2026-01-01T00:00', 3)").run()
    await env.DB.prepare("INSERT INTO email_tokens (token_hash, submission_id, created_at, expires_at) VALUES ('velho', ?, '2026-01-01T00:00:00.000Z', '2026-01-03T00:00:00.000Z')").bind(id).run()
    await retryConfirmations(on())
    expect((await tokens()).map((t) => t.token_hash)).not.toContain('velho')
    expect(await tokens()).toHaveLength(1)
    expect((await env.DB.prepare('SELECT COUNT(*) AS n FROM rate_counters WHERE minute < ?').bind('2026-06').first<{ n: number }>())!.n).toBe(0)
  })
})

describe('6. Sem enumeração de candidaturas (antes: 409 "duplicate")', () => {
  const shape = async (r: Response, id: unknown) => JSON.stringify([r.status, [...r.headers].sort(), await r.json()]).replaceAll(String(id), 'ID')

  it('candidatura repetida em 10 minutos: resposta indistinguível da de um email nunca visto', async () => {
    await call('/', pio())
    const repeated = pio()
    const fresh = pio({ email: 'nunca-visto@exemplo-sintetico.pt' })
    const a = await shape(await call('/', repeated), repeated.submissionId)
    const b = await shape(await call('/', fresh), fresh.submissionId)
    expect(a).toBe(b)
    expect(a).toContain('"ok":true')
    expect(a).not.toContain('duplicate')
  })
  it('igual com o site de hoje (aviso v4, sem verificação) e sem remetente configurado', async () => {
    const v4 = (email: string) => pio({ email, phone: undefined, companyUrl: undefined }, { consentVersion: '2026-11-v4' })
    await call('/', v4(CANDIDATE), today())
    const repeated = v4(CANDIDATE)
    const fresh = v4('nunca-visto@exemplo-sintetico.pt')
    const r = await call('/', repeated, today())
    expect(r.status).toBe(200)
    expect(await shape(r, repeated.submissionId)).toBe(await shape(await call('/', fresh, today()), fresh.submissionId))
  })
  it('nenhum código de estado, corpo ou campo denuncia a repetição, por muitas vezes que se tente', async () => {
    await call('/', pio())
    for (let i = 0; i < 5; i++) {
      const b = pio()
      const r = await call('/', b)
      expect(r.status).toBe(200)
      expect(Object.keys((await r.json()) as object).sort()).toEqual(['id', 'ok', 'verification'])
    }
  })
  it('por dentro, a repetição continua identificável: gravada, ligada à primeira e sem segundo aviso à equipa', async () => {
    const first = pio()
    await call('/', first)
    const second = pio({ challenge: 'Versão corrigida do desafio, enviada minutos depois.' })
    await call('/', second)
    expect(await row(first.submissionId)).toMatchObject({ duplicate_of: null, notify_status: 'sent' })
    expect(await row(second.submissionId)).toMatchObject({ duplicate_of: first.submissionId, notify_status: 'skipped', notify_error: 'duplicate', challenge: 'Versão corrigida do desafio, enviada minutos depois.', status: 'nova' })
    expect(mails.filter((m) => m.body.to[0] === 'geral.finerone@gmail.com')).toHaveLength(1)
    const dup = await env.DB.prepare('SELECT d.id, o.id AS original FROM submissions d JOIN submissions o ON o.id = d.duplicate_of').all()
    expect(dup.results).toEqual([{ id: second.submissionId, original: first.submissionId }])
  })
  it('uma terceira tentativa aponta para a primeira candidatura; fora da janela volta a ser candidatura normal', async () => {
    const first = pio()
    await call('/', first)
    await call('/', pio())
    const third = pio()
    await call('/', third)
    expect((await row(third.submissionId)).duplicate_of).toBe(first.submissionId)
    await env.DB.prepare("UPDATE submissions SET created_at = '2026-11-01T00:00:00.000Z'").run()
    const later = pio()
    await call('/', later)
    expect(await row(later.submissionId)).toMatchObject({ duplicate_of: null, notify_status: 'sent' })
  })
  it('confirmar o email vale para o endereço: a candidatura repetida fica confirmada com a primeira', async () => {
    const first = await applied()
    const second = await applied()
    expect(second.token).not.toBe(first.token)
    expect(await (await call('/verify', { token: first.token })).json()).toEqual({ ok: true, status: 'verified' })
    expect((await row(first.id)).email_status).toBe('verified')
    expect((await row(second.id)).email_status).toBe('verified')
    expect((await tokens()).every((t) => t.used_at)).toBe(true)
    expect(await (await call('/verify', { token: second.token })).json()).toEqual({ ok: true, status: 'verified', already: true })
  })
  it('a confirmação de um endereço não confirma candidaturas de outro endereço', async () => {
    const a = await applied()
    const b = pio({ email: 'outra@exemplo-sintetico.pt' })
    await call('/', b)
    await call('/verify', { token: a.token })
    expect((await row(b.submissionId)).email_status).toBe('pending')
  })
})

describe('7. O envio de confirmação só liga com o remetente bem configurado', () => {
  const withFrom = (from: string | undefined) => ({ ...env, RESEND_API_KEY: 're_test_123', CONFIRM_FROM: from }) as typeof env

  it.each([undefined, '', 'Finer One <onboarding@resend.dev>', 'onboarding@resend.dev', 'Finer One', 'Finer One <info@finer-one.com>, outro@exemplo.pt', 'info@finer-one.com\r\nBcc: x@exemplo.pt', '<info@finer-one>'])('remetente %j → desligado', async (from) => {
    const e = withFrom(from)
    expect(confirmConfigured(e)).toBe(false)
    const b = pio()
    expect(await (await call('/', b, e)).json()).toEqual({ ok: true, id: b.submissionId })
    expect(await row(b.submissionId)).toMatchObject({ email_status: 'not_requested', confirm_status: 'none' })
    expect(toCandidate()).toHaveLength(0)
    expect((await call('/resend', { email: CANDIDATE, turnstileToken: 'tok-ok' }, e)).status).toBe(503)
  })
  it('sem chave do Resend ou sem endereço do site também fica desligado', () => {
    expect(confirmConfigured({ ...env, CONFIRM_FROM: FROM } as typeof env)).toBe(false)
    expect(confirmConfigured({ ...on(), CONFIRM_BASE_URL: 'http://www.finer-one.com' } as typeof env)).toBe(false)
    expect(confirmConfigured({ ...on(), CONFIRM_BASE_URL: undefined } as typeof env)).toBe(false)
  })
  it.each([FROM, 'info@finer-one.com'])('remetente %j num domínio próprio → ligado', (from) => {
    expect(confirmConfigured(withFrom(from))).toBe(true)
  })
  it('a configuração publicada (wrangler.jsonc) não traz CONFIRM_FROM: confirmação desligada por omissão', () => {
    expect(env.CONFIRM_FROM).toBeUndefined()
    expect(env.NOTIFY_FROM).toBe('Finer One <onboarding@resend.dev>')
    expect(env.NOTIFY_TO).toBe('geral.finerone@gmail.com')
  })
})

describe('8. Aviso v5 nos outros formulários: notificações preservadas', () => {
  it('Lista de Espera com v5: grava e avisa a equipa como com a v4', async () => {
    for (const consentVersion of ['2026-11-v4', V5]) {
      const b = { kind: 'waitlist', fields: { name: 'Teste', email: `lista-${consentVersion}@exemplo-sintetico.pt`, size: '2 a 9 pessoas', interests: 'Tesouraria' }, submissionId: crypto.randomUUID(), website: '', elapsedMs: 9000, consentVersion, lang: 'pt', turnstileToken: 'tok-ok' }
      expect(await (await call('/', b, today())).json()).toEqual({ ok: true, id: b.submissionId })
      expect(await row(b.submissionId)).toMatchObject({ consent_version: consentVersion, notify_status: 'sent' })
    }
    expect(mails.map((m) => m.body.subject)).toEqual(['Novo lead Lista de Espera | Finer One', 'Novo lead Lista de Espera | Finer One'])
  })
  it('Finer Pioneers com v4 (site publicado hoje) e com v5: ambos gravam e avisam a equipa', async () => {
    const old = pio({ email: 'v4@exemplo-sintetico.pt', phone: undefined, companyUrl: undefined }, { consentVersion: '2026-11-v4' })
    const neu = pio({ email: 'v5@exemplo-sintetico.pt' })
    for (const b of [old, neu]) expect(await (await call('/', b, today())).json()).toEqual({ ok: true, id: b.submissionId })
    expect((await row(old.submissionId)).notify_status).toBe('sent')
    expect((await row(neu.submissionId)).notify_status).toBe('sent')
  })
})

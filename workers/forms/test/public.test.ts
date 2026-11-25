import { env } from 'cloudflare:workers'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../src/public'

const ORIGIN = 'https://www.finer-one.com'
type Body = Record<string, unknown>
let verifyCalls: FormData[] = []
let siteverifyStatus = 200

function post(body: Body | string, origin = ORIGIN, headers: Record<string, string> = {}) {
  return worker.fetch(
    new Request('https://forms.test/', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8', Origin: origin, ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    env,
  )
}
const wl = (over: Body = {}): Body => ({
  kind: 'waitlist',
  fields: { name: 'Ana Silva', email: 'Ana@Empresa.pt', size: '2 a 9 pessoas', interests: 'Tesouraria, Previsões' },
  submissionId: crypto.randomUUID(), website: '', elapsedMs: 9000, consentVersion: '2026-11-rascunho', lang: 'pt', turnstileToken: 'tok-ok',
  ...over,
})
const pio = (over: Body = {}): Body => ({
  kind: 'pioneers',
  fields: { name: 'Rui Costa', email: 'rui@costa.pt', company: 'Costa & Filhos, Lda', sector: 'Retail', challenge: '=Recebimentos em atraso.\nClientes pagam tarde.' },
  submissionId: crypto.randomUUID(), website: '', elapsedMs: 12000, consentVersion: '2026-11-rascunho', lang: 'en', turnstileToken: 'tok-ok',
  ...over,
})
const rows = async () => (await env.DB.prepare('SELECT * FROM submissions ORDER BY created_at').all<Record<string, unknown>>()).results

beforeEach(async () => {
  await env.DB.prepare('DELETE FROM submissions').run()
  verifyCalls = []
  siteverifyStatus = 200
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (!url.startsWith('https://challenges.cloudflare.com/turnstile/v0/siteverify')) throw new Error('fetch inesperado: ' + url)
    const form = init?.body as FormData
    verifyCalls.push(form)
    if (siteverifyStatus !== 200) return new Response('erro', { status: siteverifyStatus })
    const token = form.get('response')
    if (token === 'tok-ok') return Response.json({ success: true, hostname: 'www.finer-one.com' })
    if (token === 'tok-outro-site') return Response.json({ success: true, hostname: 'outro-site.example' })
    return Response.json({ success: false, 'error-codes': ['invalid-input-response'] })
  })
})
afterEach(() => vi.restoreAllMocks())

describe('serviço e CORS', () => {
  it('GET responde que está ativo', async () => {
    const r = await worker.fetch(new Request('https://forms.test/'), env)
    expect(await r.json()).toEqual({ ok: true, service: 'finer-one-forms' })
  })
  it('preflight só para origens autorizadas', async () => {
    const ok = await worker.fetch(new Request('https://forms.test/', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), env)
    expect(ok.status).toBe(204)
    expect(ok.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN)
    const no = await worker.fetch(new Request('https://forms.test/', { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } }), env)
    expect(no.status).toBe(403)
    expect(no.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
  it('POST de origem não autorizada é recusado sem gravar nem verificar', async () => {
    const r = await post(wl(), 'https://evil.example')
    expect(r.status).toBe(403)
    expect(await rows()).toHaveLength(0)
    expect(verifyCalls).toHaveLength(0)
  })
  it('outros métodos são recusados', async () => {
    const r = await worker.fetch(new Request('https://forms.test/', { method: 'PUT', headers: { Origin: ORIGIN }, body: '{}' }), env)
    expect(r.status).toBe(405)
  })
})

describe('Lista de Espera e Finer Pioneers', () => {
  it('lista de espera: grava os dados submetidos e confirma só depois', async () => {
    const body = wl()
    const r = await post(body)
    expect(r.status).toBe(200)
    expect(r.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN)
    expect(await r.json()).toEqual({ ok: true, id: body.submissionId })
    const [row] = await rows()
    expect(row).toMatchObject({ kind: 'waitlist', name: 'Ana Silva', email: 'ana@empresa.pt', size: '2 a 9 pessoas', interests: 'Tesouraria, Previsões', company: null, lang: 'pt', consent_version: '2026-11-rascunho', status: 'nova' })
  })
  it('finer pioneer: separado da lista, texto livre e conteúdo hostil guardados literalmente', async () => {
    const r = await post(pio({ fields: { ...(pio().fields as Body), name: "Rui'); DROP TABLE submissions;--" } }))
    expect(r.status).toBe(200)
    const [row] = await rows()
    expect(row).toMatchObject({ kind: 'pioneers', company: 'Costa & Filhos, Lda', sector: 'Retail', challenge: '=Recebimentos em atraso.\nClientes pagam tarde.', size: null, lang: 'en' })
    expect(row.name).toBe("Rui'); DROP TABLE submissions;--")
  })
})

// Regressão (22/11/2026): payloads iguais aos que o site publicado envia, com a versão v3 do aviso
// de privacidade e o contexto de execução (ctx) que o Cloudflare passa em produção.
describe('regressão: envios válidos do site com aviso de privacidade v3', () => {
  const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext
  const send = (body: Body) =>
    worker.fetch(
      new Request('https://forms.test/', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8', Origin: ORIGIN },
        body: JSON.stringify(body),
      }),
      env,
      ctx,
    )
  const site = (kind: 'waitlist' | 'pioneers', fields: Body): Body => ({
    kind, fields, consentVersion: '2026-11-v3', lang: 'pt', submissionId: crypto.randomUUID(),
    website: '', elapsedMs: 45000, turnstileToken: 'tok-ok',
  })

  it('lista de espera: grava com consent_version v3 e só confirma com id', async () => {
    const body = site('waitlist', { name: 'Teste Sintético', email: 'lista@exemplo-sintetico.pt', size: 'Só eu', interests: 'Tesouraria, Tudo num só lugar' })
    const r = await send(body)
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ ok: true, id: body.submissionId })
    const all = await rows()
    expect(all).toHaveLength(1)
    expect(all[0]).toMatchObject({ id: body.submissionId, kind: 'waitlist', email: 'lista@exemplo-sintetico.pt', size: 'Só eu', consent_version: '2026-11-v3', status: 'nova' })
    expect(verifyCalls).toHaveLength(1)
  })

  it('finer pioneers: grava com consent_version v3 e só confirma com id', async () => {
    const body = site('pioneers', {
      name: 'Teste Sintético', company: 'Empresa Sintética, Lda', sector: 'Comércio', email: 'pioneer@exemplo-sintetico.pt',
      challenge: 'Pressão de tesouraria. Tenho dificuldade em prever a falta de caixa.',
    })
    const r = await send(body)
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ ok: true, id: body.submissionId })
    const all = await rows()
    expect(all).toHaveLength(1)
    expect(all[0]).toMatchObject({ id: body.submissionId, kind: 'pioneers', company: 'Empresa Sintética, Lda', sector: 'Comércio', consent_version: '2026-11-v3', size: null })
  })

  it('os dois formulários gravam em sequência, sem interferirem entre si nem com o Explorar', async () => {
    const a = site('waitlist', { name: 'Teste A', email: 'a@exemplo-sintetico.pt', size: '2 a 9 pessoas', interests: 'Previsões' })
    const b = site('pioneers', { name: 'Teste B', company: 'Empresa B, Lda', sector: 'Outro', email: 'b@exemplo-sintetico.pt', challenge: 'Informação dispersa por vários sítios.' })
    expect((await send(a)).status).toBe(200)
    expect((await send(b)).status).toBe(200)
    const all = await rows()
    expect(all.map((x) => [x.kind, x.consent_version])).toEqual([['waitlist', '2026-11-v3'], ['pioneers', '2026-11-v3']])
    const explore = await env.DB.prepare('SELECT COUNT(*) AS n FROM explore_leads').first<{ n: number }>()
    expect(explore?.n).toBe(0)
  })
})

describe('validação no servidor', () => {
  it.each([
    ['email inválido', wl({ fields: { name: 'Ana', email: 'x@y', size: '1', interests: 'a' } }), 'email'],
    ['dimensão em falta', wl({ fields: { name: 'Ana', email: 'a@b.pt', size: '', interests: 'a' } }), 'size'],
    ['desafio curto', pio({ fields: { name: 'Rui', email: 'r@c.pt', company: 'Costa', sector: 'X', challenge: 'curto' } }), 'challenge'],
  ])('%s', async (_, body, field) => {
    const r = await post(body)
    expect(r.status).toBe(400)
    expect(await r.json()).toMatchObject({ ok: false, error: 'invalid', field })
    expect(await rows()).toHaveLength(0)
  })
  it('formulário desconhecido, JSON inválido e corpo que não é objeto', async () => {
    expect((await post({ ...wl(), kind: 'outro' })).status).toBe(400)
    expect((await post('{nao-json')).status).toBe(400)
    expect((await post('[1,2]')).status).toBe(400)
  })
  it('corpo acima de 16 KB é recusado', async () => {
    const r = await post(wl({ padding: 'x'.repeat(17 * 1024) }))
    expect(r.status).toBe(413)
    expect(await rows()).toHaveLength(0)
  })
})

describe('robôs e Turnstile', () => {
  it('campo-armadilha ou envio instantâneo: nunca há falso sucesso, nada é gravado', async () => {
    for (const extra of [{ website: 'http://spam' }, { elapsedMs: 500 }, { elapsedMs: undefined }, { website: ' x ', elapsedMs: 0 }]) {
      const r = await post(wl(extra))
      expect(r.status).toBe(403)
      const body = (await r.json()) as Record<string, unknown>
      expect(body.ok).toBe(false)
      expect(body).not.toHaveProperty('id')
    }
    expect(await rows()).toHaveLength(0)
  })
  it('sinais de robô respondem exatamente como um Turnstile recusado (não revelam qual proteção falhou)', async () => {
    const bot = await post(wl({ website: 'http://spam' }))
    const badToken = await post(wl({ turnstileToken: 'tok-mau' }))
    expect(bot.status).toBe(badToken.status)
    expect(await bot.json()).toEqual(await badToken.json())
    expect([...bot.headers.entries()].sort()).toEqual([...badToken.headers.entries()].sort())
    // o token é verificado (e consumido) antes de se olhar para os sinais de robô
    expect(verifyCalls).toHaveLength(2)
  })
  it('qualquer resposta de sucesso corresponde a um registo guardado ou já existente', async () => {
    const first = wl()
    const ok = (await (await post(first)).json()) as Record<string, unknown>
    expect(ok).toEqual({ ok: true, id: first.submissionId })
    const dup = (await (await post(first)).json()) as Record<string, unknown>
    expect(dup).toEqual({ ok: true, duplicate: true })
    expect(await rows()).toHaveLength(1)
  })
  it('token em falta, inválido ou de outro site: recusado sem gravar', async () => {
    for (const turnstileToken of [undefined, 'tok-mau', 'tok-outro-site']) {
      const r = await post(wl({ turnstileToken }))
      expect(r.status).toBe(403)
      expect(await r.json()).toEqual({ ok: false, error: 'verification' })
    }
    expect(await rows()).toHaveLength(0)
  })
  it('envia o segredo e o IP do visitante ao siteverify', async () => {
    await post(wl(), ORIGIN, { 'CF-Connecting-IP': '203.0.113.7' })
    expect(verifyCalls[0].get('secret')).toBe('segredo-de-teste')
    expect(verifyCalls[0].get('remoteip')).toBe('203.0.113.7')
  })
  it('Turnstile indisponível: erro de servidor, sem gravar e sem dados pessoais no log', async () => {
    siteverifyStatus = 503
    const logs = vi.spyOn(console, 'error').mockImplementation(() => {})
    const r = await post(wl())
    expect(r.status).toBe(500)
    expect(await r.json()).toEqual({ ok: false, error: 'server' })
    expect(await rows()).toHaveLength(0)
    expect(logs).toHaveBeenCalledWith('submit_failed', 'Error')
    expect(JSON.stringify(logs.mock.calls)).not.toMatch(/ana@empresa|Ana Silva/i)
  })
})

describe('duplicações e abuso', () => {
  it('o mesmo envio repetido (nova tentativa) não duplica nem gasta nova verificação', async () => {
    const body = wl()
    await post(body)
    const r = await post({ ...body, turnstileToken: 'tok-ja-usado' })
    expect(await r.json()).toEqual({ ok: true, duplicate: true })
    expect(await rows()).toHaveLength(1)
    expect(verifyCalls).toHaveLength(1)
  })
  it('lista de espera: email já inscrito não cria nova linha', async () => {
    await post(wl())
    const r = await post(wl({ fields: { name: 'Ana S.', email: 'ANA@empresa.pt', size: '1', interests: 'x' } }))
    expect(await r.json()).toEqual({ ok: true, duplicate: true })
    expect(await rows()).toHaveLength(1)
  })
  it('pioneers: mesmo email em 10 minutos recebe a resposta de uma candidatura nova; fica gravada e marcada como repetida', async () => {
    const first = pio()
    await post(first)
    const second = pio()
    const r = await post(second)
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ ok: true, id: second.submissionId })
    const saved = await rows()
    expect(saved).toHaveLength(2)
    expect(saved.map((s) => s.duplicate_of).sort()).toEqual([first.submissionId, null].sort())
    await env.DB.prepare('UPDATE submissions SET created_at = ?').bind(new Date(Date.now() - 11 * 60 * 1000).toISOString()).run()
    const third = pio()
    expect((await post(third)).status).toBe(200)
    expect((await rows()).find((s) => s.id === third.submissionId)!.duplicate_of).toBeNull() // fora da janela: candidatura normal
  })
  it('limite global por minuto', async () => {
    const now = new Date().toISOString()
    const stmt = env.DB.prepare("INSERT INTO submissions (id, kind, created_at, name, email, lang, consent_version) VALUES (?, 'pioneers', ?, 'X', ?, 'pt', 'v')")
    await env.DB.batch(Array.from({ length: 30 }, (_, i) => stmt.bind(`seed-${i}`, now, `p${i}@a.pt`)))
    const r = await post(wl())
    expect(r.status).toBe(429)
    expect(await r.json()).toEqual({ ok: false, error: 'rate' })
  })
})

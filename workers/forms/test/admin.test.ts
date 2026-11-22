import { env } from 'cloudflare:workers'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import admin, { csvCell, type Env as AdminEnv } from '../src/admin'

const TOKEN = 'a'.repeat(48)
const TEAM = 'finerone.cloudflareaccess.com'
const AUD = 'aud-tag-123'
let keys: CryptoKeyPair, otherKeys: CryptoKeyPair, jwk: JsonWebKey

const enc = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
async function jwt(claims: Record<string, unknown>, key = keys.privateKey, header: Record<string, unknown> = { alg: 'RS256', kid: 'k1' }) {
  const data = `${enc(header)}.${enc(claims)}`
  return `${data}.${b64(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(data)))}`
}
const now = () => Math.floor(Date.now() / 1000)
const goodClaims = () => ({ aud: [AUD], iss: `https://${TEAM}`, exp: now() + 600, nbf: now() - 5, email: 'geral.finerone@gmail.com' })

const tokenEnv = (): AdminEnv => ({ DB: env.DB, ADMIN_TOKEN: TOKEN })
const accessEnv = (): AdminEnv => ({ DB: env.DB, ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAILS: 'geral.finerone@gmail.com', ADMIN_TOKEN: TOKEN })
function call(e: AdminEnv, path: string, init: RequestInit = {}) {
  return admin.fetch(new Request('https://admin.test' + path, init), e)
}
const bearer = { Authorization: `Bearer ${TOKEN}` }
const postJson = (body: unknown, extra: Record<string, string> = {}): RequestInit => ({
  method: 'POST', headers: { ...bearer, 'Content-Type': 'application/json', 'X-Finer-Admin': '1', ...extra }, body: JSON.stringify(body),
})

async function seed() {
  const s = env.DB.prepare('INSERT INTO submissions (id, kind, created_at, name, email, company, sector, challenge, size, interests, lang, consent_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  await env.DB.batch([
    s.bind('w1', 'waitlist', '2026-11-15T10:00:00.000Z', 'Ana "A" Silva', 'ana@empresa.pt', null, null, null, '2 a 9 pessoas', 'Tesouraria', 'pt', 'v1'),
    s.bind('w2', 'waitlist', '2026-11-15T11:00:00.000Z', '=HYPERLINK("http://x")', 'bruno@empresa.pt', null, null, null, '1', 'Previsões', 'pt', 'v1'),
    s.bind('p1', 'pioneers', '2026-11-15T12:00:00.000Z', 'Rui Costa', 'ana@empresa.pt', 'Costa, Lda', 'Retail', 'Linha 1\nLinha 2', null, null, 'en', 'v1'),
  ])
}

beforeAll(async () => {
  keys = (await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify'])) as CryptoKeyPair
  otherKeys = (await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify'])) as CryptoKeyPair
  jwk = { ...((await crypto.subtle.exportKey('jwk', keys.publicKey)) as JsonWebKey), kid: 'k1' } as JsonWebKey
})
beforeEach(async () => {
  await env.DB.prepare('DELETE FROM submissions').run()
  await seed()
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (url === `https://${TEAM}/cdn-cgi/access/certs`) return Response.json({ keys: [jwk] })
    throw new Error('fetch inesperado: ' + url)
  })
})
afterEach(() => vi.restoreAllMocks())

describe('autorização', () => {
  it('sem Access nem token configurados: tudo recusado', async () => {
    expect((await call({ DB: env.DB }, '/api/summary')).status).toBe(503)
    expect((await call({ DB: env.DB, ADMIN_TOKEN: 'curto' }, '/api/summary', { headers: { Authorization: 'Bearer curto' } })).status).toBe(503)
  })
  it('token: em falta ou errado → 401; correto → 200', async () => {
    expect((await call(tokenEnv(), '/api/summary')).status).toBe(401)
    expect((await call(tokenEnv(), '/api/summary', { headers: { Authorization: 'Bearer ' + 'b'.repeat(48) } })).status).toBe(401)
    const r = await call(tokenEnv(), '/api/summary', { headers: bearer })
    expect(await r.json()).toEqual({ ok: true, totals: { waitlist: 2, pioneers: 1 }, total: 3 })
  })
  it('Access: JWT válido de email autorizado → 200', async () => {
    const r = await call(accessEnv(), '/api/summary', { headers: { 'Cf-Access-Jwt-Assertion': await jwt(goodClaims()) } })
    expect(r.status).toBe(200)
  })
  it('Access configurado: o token deixa de ser aceite', async () => {
    expect((await call(accessEnv(), '/api/summary', { headers: bearer })).status).toBe(401)
  })
  it.each([
    ['audiência errada', { aud: ['outra'] }],
    ['emissor errado', { iss: 'https://outra.cloudflareaccess.com' }],
    ['expirado', { exp: Math.floor(Date.now() / 1000) - 10 }],
    ['email não autorizado', { email: 'intruso@example.com' }],
  ])('Access: %s → 403', async (_, over) => {
    const r = await call(accessEnv(), '/api/summary', { headers: { 'Cf-Access-Jwt-Assertion': await jwt({ ...goodClaims(), ...over }) } })
    expect(r.status).toBe(403)
  })
  it('Access: assinatura de outra chave, alg none ou lixo → 403', async () => {
    for (const token of [await jwt(goodClaims(), otherKeys.privateKey), `${enc({ alg: 'none', kid: 'k1' })}.${enc(goodClaims())}.`, 'nao.e.jwt', 'abc']) {
      expect((await call(accessEnv(), '/api/summary', { headers: { 'Cf-Access-Jwt-Assertion': token } })).status).toBe(403)
    }
  })
  it('a página não contém dados e tem CSP restritiva', async () => {
    const r = await call({ DB: env.DB }, '/')
    const html = await r.text()
    expect(r.headers.get('Content-Security-Policy')).toContain("default-src 'none'")
    expect(r.headers.get('X-Frame-Options')).toBe('DENY')
    expect(html).not.toContain('ana@empresa.pt')
  })
})

describe('consulta e exportação', () => {
  it('lista por formulário, mais recentes primeiro', async () => {
    const d = (await (await call(tokenEnv(), '/api/submissions?kind=waitlist', { headers: bearer })).json()) as { rows: { id: string }[] }
    expect(d.rows.map((r) => r.id)).toEqual(['w2', 'w1'])
  })
  it('CSV: BOM, cabeçalho, aspas escapadas, fórmulas neutralizadas, quebras de linha preservadas', async () => {
    const r = await call(tokenEnv(), '/api/export.csv', { headers: bearer })
    expect(r.headers.get('Content-Disposition')).toMatch(/^attachment; filename="finer-one-inscricoes-\d{4}-\d{2}-\d{2}\.csv"$/)
    const bytes = new Uint8Array(await r.arrayBuffer())
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]) // BOM para o Excel abrir em UTF-8
    const csv = new TextDecoder().decode(bytes)
    expect(csv).toContain('id,kind,created_at,name,email')
    expect(csv).toContain('"Ana ""A"" Silva"')
    expect(csv).toContain(`"'=HYPERLINK(""http://x"")"`)
    expect(csv).toContain('"Linha 1\nLinha 2"')
    expect(csvCell('+1')).toBe(`"'+1"`)
    expect(csvCell(null)).toBe('""')
  })
  it('CSV por formulário só traz esse formulário', async () => {
    const csv = await (await call(tokenEnv(), '/api/export.csv?kind=pioneers', { headers: bearer })).text()
    expect(csv.trim().split('\r\n')).toHaveLength(2)
  })
})

describe('eliminação e estado', () => {
  it('elimina por id, por lista de ids e por email (todos os formulários), sem dados pessoais no log', async () => {
    const logs = vi.spyOn(console, 'log').mockImplementation(() => {})
    expect(await (await call(tokenEnv(), '/api/delete', postJson({ id: 'w2' }))).json()).toEqual({ ok: true, deleted: 1 })
    expect(await (await call(tokenEnv(), '/api/delete', postJson({ email: 'ANA@empresa.pt' }))).json()).toEqual({ ok: true, deleted: 2 })
    expect((await env.DB.prepare('SELECT COUNT(*) AS n FROM submissions').first<{ n: number }>())?.n).toBe(0)
    expect(JSON.stringify(logs.mock.calls)).not.toMatch(/@/)
  })
  it('pedidos de alteração exigem JSON, cabeçalho próprio e a mesma origem', async () => {
    const base = postJson({ id: 'w1' })
    const h = base.headers as Record<string, string>
    expect((await call(tokenEnv(), '/api/delete', { ...base, headers: { ...h, 'X-Finer-Admin': '' } })).status).toBe(403)
    expect((await call(tokenEnv(), '/api/delete', { ...base, headers: { ...h, 'Content-Type': 'text/plain' } })).status).toBe(403)
    expect((await call(tokenEnv(), '/api/delete', { ...base, headers: { ...h, Origin: 'https://evil.example' } })).status).toBe(403)
    expect((await call(tokenEnv(), '/api/delete', { ...base, headers: { ...h, Origin: 'https://admin.test' } })).status).toBe(200)
  })
  it('pedido de eliminação inválido', async () => {
    expect((await call(tokenEnv(), '/api/delete', postJson({}))).status).toBe(400)
    expect((await call(tokenEnv(), '/api/delete', postJson({ ids: Array(501).fill('x') }))).status).toBe(400)
  })
  it('estado: só valores permitidos', async () => {
    expect(await (await call(tokenEnv(), '/api/status', postJson({ id: 'p1', status: 'selecionada' }))).json()).toEqual({ ok: true, updated: 1 })
    expect((await call(tokenEnv(), '/api/status', postJson({ id: 'p1', status: 'qualquer' }))).status).toBe(400)
  })
})

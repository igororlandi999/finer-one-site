import { env } from 'cloudflare:workers'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../src/public'

// Worker novo publicado ANTES da migração 0004: a candidatura tem de ser gravada na mesma.
const ORIGIN = 'https://www.finer-one.com'

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (url.startsWith('https://challenges.cloudflare.com/')) return Response.json({ success: true, hostname: 'www.finer-one.com' })
    throw new Error('fetch inesperado: ' + url)
  })
})
afterEach(() => vi.restoreAllMocks())

describe('migração 0004 por aplicar', () => {
  it('grava a candidatura com as colunas de sempre e confirma com id (sem verificação)', async () => {
    await env.DB.prepare('ALTER TABLE submissions DROP COLUMN company_url').run()
    const id = crypto.randomUUID()
    const r = await worker.fetch(
      new Request('https://forms.test/', {
        method: 'POST',
        headers: { Origin: ORIGIN },
        body: JSON.stringify({
          kind: 'pioneers',
          fields: { name: 'Teste Pioneer', email: 'ordem@exemplo-sintetico.pt', company: 'Empresa Sintética, Lda', sector: 'Comércio', challenge: 'Pressão de tesouraria.', phone: '+351 912 345 678' },
          submissionId: id, website: '', elapsedMs: 9000, consentVersion: '2026-11-v5', lang: 'pt', turnstileToken: 'tok-ok',
        }),
      }),
      { ...env, RESEND_API_KEY: undefined, CONFIRM_FROM: 'Finer One <info@finer-one.com>' } as typeof env,
    )
    expect(await r.json()).toEqual({ ok: true, id })
    expect(await env.DB.prepare('SELECT name, email, challenge FROM submissions WHERE id = ?').bind(id).first()).toEqual({ name: 'Teste Pioneer', email: 'ordem@exemplo-sintetico.pt', challenge: 'Pressão de tesouraria.' })
  })
})

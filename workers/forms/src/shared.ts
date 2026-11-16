/**
 * Regras partilhadas pelos Workers dos formulários. São as mesmas do recetor
 * Google Apps Script (backend/google-apps-script/Code.gs) e do site, para que
 * os dois recetores aceitem e recusem exatamente o mesmo.
 */
export type Kind = 'waitlist' | 'pioneers'
export const KINDS: readonly Kind[] = ['waitlist', 'pioneers']

export const LIMITS = { name: 100, company: 120, sector: 80, email: 254, challenge: 1500, size: 40, interests: 200 } as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type Clean = { name: string; email: string; company: string; sector: string; challenge: string; size: string; interests: string }

/** Limpa caracteres de controlo. Só o texto livre (multiline) mantém as mudanças de linha. */
export function text(value: unknown, max: number, multiline = false): string {
  let s = String(value ?? '').replace(/\r\n?/g, '\n')
  s = multiline ? s.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ') : s.replace(/[\u0000-\u001F\u007F]/g, ' ')
  return s.trim().slice(0, max)
}

export function clean(fields: unknown): Clean {
  const f = (fields && typeof fields === 'object' ? fields : {}) as Record<string, unknown>
  return {
    name: text(f.name, LIMITS.name),
    email: text(f.email, LIMITS.email).toLowerCase(),
    company: text(f.company, LIMITS.company),
    sector: text(f.sector, LIMITS.sector),
    challenge: text(f.challenge, LIMITS.challenge, true),
    size: text(f.size, LIMITS.size),
    interests: text(f.interests, LIMITS.interests),
  }
}

/** Devolve o primeiro campo inválido, ou '' se estiver tudo certo. */
export function validate(kind: Kind, c: Clean): string {
  if (c.name.length < 2) return 'name'
  if (!EMAIL_RE.test(c.email)) return 'email'
  if (kind === 'waitlist') {
    if (!c.size) return 'size'
    if (!c.interests) return 'interests'
  } else {
    if (c.company.length < 2) return 'company'
    if (!c.sector) return 'sector'
    if (c.challenge.length < 10) return 'challenge'
  }
  return ''
}

export function list(value: string | undefined): string[] {
  return (value ?? '').split(',').map((s) => s.trim()).filter(Boolean)
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
  })
}

/** Regista só o tipo de erro — nunca dados pessoais nem o corpo do pedido. */
export function logError(event: string, err: unknown) {
  console.error(event, err instanceof Error ? err.name : 'unknown')
}

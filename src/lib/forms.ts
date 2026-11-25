/**
 * Envio dos formulários (Finer Pioneers, Lista de Espera e Explorar).
 *
 * O site é estático (GitHub Pages), por isso os dados seguem por HTTPS para um
 * recetor externo definido em VITE_FORMS_ENDPOINT. Dois recetores possíveis,
 * escolhidos por VITE_FORMS_PROVIDER (nunca os dois ao mesmo tempo):
 *  - "google" (por omissão): Google Apps Script — guarda numa Folha Google e envia
 *    email para geral.finerone@gmail.com (backend/google-apps-script);
 *  - "cloudflare": Cloudflare Worker + D1, com Turnstile (workers/forms). Exige
 *    VITE_TURNSTILE_SITEKEY; sem ela o formulário fica indisponível.
 *
 * Sem VITE_FORMS_ENDPOINT:
 *  - em desenvolvimento (npm run dev): MODO DE PRÉ-VISUALIZAÇÃO — valida, mostra a
 *    confirmação com o aviso "nenhum dado foi enviado" e não envia nada;
 *  - num build de produção: o formulário mostra que está indisponível. Nunca
 *    mostra sucesso sem o recetor ter confirmado que guardou a submissão.
 *
 * Proteção (aplicada aqui e repetida no recetor):
 *  - campo-armadilha invisível ("website"), que só robôs preenchem: o envio é recusado
 *    com a mesma mensagem genérica de verificação, sem nada enviado;
 *  - tempo mínimo de preenchimento: um envio mais rápido espera o tempo que falta
 *    (fica em "A enviar…") e segue normalmente — nunca se finge sucesso;
 *  - só há confirmação quando o recetor devolve o registo guardado (id) ou já
 *    existente (duplicate);
 *  - um envio de cada vez; o mesmo identificador de submissão é reutilizado nas
 *    novas tentativas, para o recetor não guardar a mesma inscrição duas vezes;
 *  - limite de envios por navegador;
 *  - validação e limites de tamanho de todos os campos.
 */

export type FormKind = 'pioneers' | 'waitlist' | 'explore'

// 2026-11-v3: aviso aprovado pelos três fundadores a 22/11/2026 (inclui o Explorar).
// 2026-11-v4: autorizada a 22/11/2026 — email interno também na Lista de Espera e no Finer Pioneers.
// 2026-11-v5: aprovada para publicação por Igor Orlandi Barros a 25/11/2026 — Finer Pioneers com telefone
// obrigatório e website opcional; verificação do email do candidato descrita como condicional (desligada).
// 2026-11-v6: aprovada para publicação por Igor Orlandi Barros a 25/11/2026 — Explorar com telefone
// obrigatório (contacto sobre a análise pedida); conversas comerciais e novidades continuam opcionais.
// 2026-11-v7: PROPOSTA de 25/11/2026, por aprovar — Lista de Espera com telefone obrigatório (contacto sobre o
// interesse na Finer One e o acesso futuro à plataforma; não é consentimento para marketing). Publicar só com o
// aviso v7 aprovado (a trava do build bloqueia antes disso).
export const PRIVACY_VERSION = '2026-11-v7'
const MIN_FILL_MS = 3000
const LOCAL_LIMIT = 5
const LOCAL_WINDOW_MS = 60 * 60 * 1000
const TIMEOUT_MS = 20000

export const endpoint: string | undefined = import.meta.env.VITE_FORMS_ENDPOINT || undefined
export const isPreviewMode = !endpoint && import.meta.env.DEV
export const FORMS_PROVIDER: 'google' | 'cloudflare' = import.meta.env.VITE_FORMS_PROVIDER === 'cloudflare' ? 'cloudflare' : 'google'
const turnstileSiteKey: string | undefined = import.meta.env.VITE_TURNSTILE_SITEKEY || undefined

export type SubmitFailure = 'bot' | 'rate' | 'network' | 'server' | 'unavailable' | 'duplicate' | 'verification'
/** `verification`: o recetor pôs em fila um email de confirmação para o candidato (só Finer Pioneers). */
export type SubmitResult = { ok: true; preview: boolean; verification?: boolean } | { ok: false; reason: SubmitFailure }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(email: string) {
  return EMAIL_RE.test(email.trim()) && email.trim().length <= 254
}

function recentSubmissions(): number[] {
  try {
    const raw = window.localStorage.getItem('fo-form-submissions')
    const list: number[] = raw ? JSON.parse(raw) : []
    return list.filter((t) => Date.now() - t < LOCAL_WINDOW_MS)
  } catch {
    return []
  }
}

function rememberSubmission() {
  try {
    window.localStorage.setItem('fo-form-submissions', JSON.stringify([...recentSubmissions(), Date.now()]))
  } catch {
    /* armazenamento indisponível: ignora */
  }
}

function newId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  }
}

// Identificador da submissão em curso, por formulário: mantém-se entre tentativas
// (uma falha de rede pode acontecer depois de o recetor já ter guardado) e só é
// renovado depois de uma confirmação.
const pendingIds: Partial<Record<FormKind, string>> = {}
const inFlight: Partial<Record<FormKind, boolean>> = {}

/** Esquece o identificador pendente (ex.: o Explorar mudou de simulação entre tentativas). */
export function resetSubmission(kind: FormKind) {
  if (!inFlight[kind]) delete pendingIds[kind]
}

/**
 * `extra` acrescenta propriedades ao corpo do pedido (só o Explorar o usa, para enviar
 * os valores da simulação). Os outros formulários enviam exatamente o mesmo de antes.
 */
export async function submitForm(
  kind: FormKind,
  rawFields: Record<string, string>,
  guard: { honeypot: string; startedAt: number },
  extra: Record<string, unknown> = {},
): Promise<SubmitResult> {
  // Campo-armadilha preenchido: só robôs (ou preenchimento automático indevido) o fazem.
  // Nunca se finge sucesso; a mensagem é a mesma de uma verificação Turnstile falhada.
  if (guard.honeypot.trim() !== '') return { ok: false, reason: 'verification' }
  if (recentSubmissions().length >= LOCAL_LIMIT) return { ok: false, reason: 'rate' }

  // Envia exatamente o que o recetor vai guardar (sem espaços nas pontas).
  const fields = Object.fromEntries(Object.entries(rawFields).map(([k, v]) => [k, v.trim()]))

  if (!endpoint) {
    if (!isPreviewMode) return { ok: false, reason: 'unavailable' }
    rememberSubmission()
    return { ok: true, preview: true }
  }

  if (FORMS_PROVIDER === 'cloudflare' && !turnstileSiteKey) return { ok: false, reason: 'unavailable' }
  if (inFlight[kind]) return { ok: false, reason: 'network' }
  inFlight[kind] = true
  const submissionId = (pendingIds[kind] ??= newId())
  const controller = new AbortController()
  let timer = 0

  try {
    // Envio mais rápido do que o tempo mínimo: espera o que falta em vez de o descartar.
    const wait = MIN_FILL_MS + 100 - (Date.now() - guard.startedAt)
    if (wait > 0) await new Promise((resolve) => window.setTimeout(resolve, wait))
    // Cloudflare: um token Turnstile novo a cada tentativa (só vale uma vez).
    let turnstileToken: string | undefined
    if (FORMS_PROVIDER === 'cloudflare') {
      const { getTurnstileToken } = await import('@/lib/turnstile')
      turnstileToken = (await getTurnstileToken(turnstileSiteKey!)) ?? undefined
      if (!turnstileToken) return { ok: false, reason: 'verification' }
    }
    timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
    // text/plain evita o pedido prévio (CORS) que o Google Apps Script não suporta.
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        kind,
        fields,
        submissionId,
        website: guard.honeypot,
        elapsedMs: Date.now() - guard.startedAt,
        consentVersion: PRIVACY_VERSION,
        lang: document.documentElement.lang === 'en' ? 'en' : 'pt',
        ...extra,
        ...(turnstileToken ? { turnstileToken } : {}),
      }),
      signal: controller.signal,
    })
    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; id?: unknown; duplicate?: unknown; verification?: unknown } | null
    // Sucesso só com registo guardado (id) ou já existente (duplicate). Um "ok" sem um
    // dos dois (ex.: recetor antigo a descartar um envio suspeito) não é confirmação.
    const confirmed = response.ok && data?.ok === true && ((typeof data.id === 'string' && data.id !== '') || data.duplicate === true)
    if (!confirmed) {
      if (response.ok && data?.ok === true) return { ok: false, reason: 'verification' }
      const reason: SubmitFailure =
        data?.error === 'rate' ? 'rate' : data?.error === 'duplicate' ? 'duplicate' : data?.error === 'verification' ? 'verification' : 'server'
      return { ok: false, reason }
    }
    delete pendingIds[kind]
    rememberSubmission()
    return { ok: true, preview: false, verification: data.verification === 'pending' }
  } catch {
    return { ok: false, reason: 'network' }
  } finally {
    window.clearTimeout(timer)
    inFlight[kind] = false
  }
}

// ---------- Finer Pioneers: confirmação do email (workers/forms/src/verify.ts) ----------
// Só existe no recetor Cloudflare. O token da ligação segue no corpo de um POST: nunca num
// endereço (não fica em registos de servidores, no histórico nem em cabeçalhos Referer).

export type VerifyOutcome = 'verified' | 'already' | 'expired' | 'invalid' | 'rate' | 'network' | 'unavailable'
export type ResendOutcome = 'requested' | 'invalid' | 'verification' | 'rate' | 'network' | 'unavailable'

const route = (path: string) => (endpoint && FORMS_PROVIDER === 'cloudflare' ? new URL(path, endpoint).href : null)

async function post(url: string, body: Record<string, unknown>) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: controller.signal, referrerPolicy: 'no-referrer' })
    return { response, data: (await response.json().catch(() => null)) as { ok?: boolean; error?: string; status?: string; already?: boolean } | null }
  } finally {
    window.clearTimeout(timer)
  }
}

/** Confirma o email no servidor. Só devolve o resultado — nunca dados da candidatura. */
export async function verifyEmail(token: string): Promise<VerifyOutcome> {
  const url = route('verify')
  if (!url) return 'unavailable'
  try {
    const { response, data } = await post(url, { token })
    if (response.ok && data?.ok === true && data.status === 'verified') return data.already ? 'already' : 'verified'
    if (data?.error === 'expired') return 'expired'
    if (data?.error === 'rate') return 'rate'
    return response.status === 404 ? 'invalid' : 'network'
  } catch {
    return 'network'
  }
}

/**
 * Pede uma nova ligação de confirmação: com o token de uma ligação expirada, ou com o email
 * (exige Turnstile). O recetor responde o mesmo exista ou não candidatura com esse email.
 */
export async function requestConfirmationLink(by: { token: string } | { email: string }): Promise<ResendOutcome> {
  const url = route('resend')
  if (!url) return 'unavailable'
  try {
    let body: Record<string, unknown> = by
    if ('email' in by) {
      if (!turnstileSiteKey) return 'unavailable'
      const { getTurnstileToken } = await import('@/lib/turnstile')
      const turnstileToken = await getTurnstileToken(turnstileSiteKey)
      if (!turnstileToken) return 'verification'
      body = { email: by.email.trim(), turnstileToken }
    }
    const { response, data } = await post(url, body)
    if (response.ok && data?.ok === true) return 'requested'
    if (data?.error === 'unavailable') return 'unavailable'
    if (data?.error === 'rate') return 'rate'
    if (data?.error === 'verification') return 'verification'
    if (data?.error === 'invalid') return 'invalid'
    return 'network'
  } catch {
    return 'network'
  }
}

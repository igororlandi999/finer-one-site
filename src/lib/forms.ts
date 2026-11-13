/**
 * Envio dos formulários (Finer Pioneers e Lista de Espera).
 *
 * O site é estático (GitHub Pages), por isso os dados seguem por HTTPS para um
 * recetor externo definido em VITE_FORMS_ENDPOINT (Google Apps Script — ver
 * backend/google-apps-script). O recetor guarda cada submissão numa Folha Google
 * e envia um email para geral.finerone@gmail.com.
 *
 * Sem VITE_FORMS_ENDPOINT:
 *  - em desenvolvimento (npm run dev): MODO DE PRÉ-VISUALIZAÇÃO — valida, mostra a
 *    confirmação com o aviso "nenhum dado foi enviado" e não envia nada;
 *  - num build de produção: o formulário mostra que está indisponível. Nunca
 *    mostra sucesso sem o recetor ter confirmado que guardou a submissão.
 *
 * Proteção (aplicada aqui e repetida no recetor):
 *  - campo-armadilha invisível ("website"), que só robôs preenchem;
 *  - tempo mínimo de preenchimento;
 *  - um envio de cada vez; o mesmo identificador de submissão é reutilizado nas
 *    novas tentativas, para o recetor não guardar a mesma inscrição duas vezes;
 *  - limite de envios por navegador;
 *  - validação e limites de tamanho de todos os campos.
 */

export type FormKind = 'pioneers' | 'waitlist'

export const PRIVACY_VERSION = '2026-11-rascunho'
const MIN_FILL_MS = 3000
const LOCAL_LIMIT = 5
const LOCAL_WINDOW_MS = 60 * 60 * 1000
const TIMEOUT_MS = 20000

export const endpoint: string | undefined = import.meta.env.VITE_FORMS_ENDPOINT || undefined
export const isPreviewMode = !endpoint && import.meta.env.DEV

export type SubmitFailure = 'bot' | 'rate' | 'network' | 'server' | 'unavailable' | 'duplicate'
export type SubmitResult = { ok: true; preview: boolean } | { ok: false; reason: SubmitFailure }

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

export async function submitForm(
  kind: FormKind,
  rawFields: Record<string, string>,
  guard: { honeypot: string; startedAt: number },
): Promise<SubmitResult> {
  // Robôs: preenchem o campo invisível ou submetem instantaneamente.
  // Fingimos sucesso para não lhes dar pistas.
  if (guard.honeypot.trim() !== '' || Date.now() - guard.startedAt < MIN_FILL_MS) {
    return { ok: true, preview: isPreviewMode }
  }
  if (recentSubmissions().length >= LOCAL_LIMIT) return { ok: false, reason: 'rate' }

  // Envia exatamente o que o recetor vai guardar (sem espaços nas pontas).
  const fields = Object.fromEntries(Object.entries(rawFields).map(([k, v]) => [k, v.trim()]))

  if (!endpoint) {
    if (!isPreviewMode) return { ok: false, reason: 'unavailable' }
    rememberSubmission()
    return { ok: true, preview: true }
  }

  if (inFlight[kind]) return { ok: false, reason: 'network' }
  inFlight[kind] = true
  const submissionId = (pendingIds[kind] ??= newId())
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
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
      }),
      signal: controller.signal,
    })
    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null
    if (!response.ok || data?.ok !== true) {
      const reason: SubmitFailure = data?.error === 'rate' ? 'rate' : data?.error === 'duplicate' ? 'duplicate' : 'server'
      return { ok: false, reason }
    }
    delete pendingIds[kind]
    rememberSubmission()
    return { ok: true, preview: false }
  } catch {
    return { ok: false, reason: 'network' }
  } finally {
    window.clearTimeout(timer)
    inFlight[kind] = false
  }
}

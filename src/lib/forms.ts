/**
 * Envio dos formulários (Finer Pioneers e Lista de Espera).
 *
 * O site é estático (GitHub Pages), por isso os dados seguem para um recetor
 * externo definido em VITE_FORMS_ENDPOINT (ver backend/google-apps-script).
 * Sem essa variável, o site funciona em MODO DE PRÉ-VISUALIZAÇÃO: valida,
 * mostra a confirmação e NÃO envia nem guarda nada.
 *
 * Proteção contra inscrições automáticas (aplicada aqui e repetida no recetor):
 *  - campo-armadilha invisível ("website"), que só robôs preenchem;
 *  - tempo mínimo de preenchimento;
 *  - limite de envios por navegador;
 *  - validação e limites de tamanho de todos os campos.
 */

export type FormKind = 'pioneers' | 'waitlist'

export const PRIVACY_VERSION = '2026-11-rascunho'
const MIN_FILL_MS = 3000
const LOCAL_LIMIT = 5
const LOCAL_WINDOW_MS = 60 * 60 * 1000

export const endpoint: string | undefined = import.meta.env.VITE_FORMS_ENDPOINT || undefined
export const isPreviewMode = !endpoint

export type SubmitResult = { ok: true; preview: boolean } | { ok: false; reason: 'bot' | 'rate' | 'network' | 'server' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(email: string) {
  return EMAIL_RE.test(email.trim()) && email.length <= 254
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

export async function submitForm(
  kind: FormKind,
  fields: Record<string, string>,
  guard: { honeypot: string; startedAt: number },
): Promise<SubmitResult> {
  // Robôs: preenchem o campo invisível ou submetem instantaneamente.
  // Fingimos sucesso para não lhes dar pistas.
  if (guard.honeypot.trim() !== '' || Date.now() - guard.startedAt < MIN_FILL_MS) {
    return { ok: true, preview: isPreviewMode }
  }
  if (recentSubmissions().length >= LOCAL_LIMIT) return { ok: false, reason: 'rate' }

  if (!endpoint) {
    rememberSubmission()
    return { ok: true, preview: true }
  }

  try {
    // text/plain evita o pedido prévio (CORS) que o Google Apps Script não suporta.
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        kind,
        fields,
        website: guard.honeypot,
        elapsedMs: Date.now() - guard.startedAt,
        consentVersion: PRIVACY_VERSION,
        lang: document.documentElement.lang,
      }),
    })
    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null
    if (!response.ok || !data?.ok) return { ok: false, reason: data?.error === 'rate' ? 'rate' : 'server' }
    rememberSubmission()
    return { ok: true, preview: false }
  } catch {
    return { ok: false, reason: 'network' }
  }
}

/**
 * Cloudflare Turnstile (só quando VITE_FORMS_PROVIDER=cloudflare).
 *
 * O script da Cloudflare só é carregado no momento do envio — quem apenas
 * navega no site não faz nenhum pedido à Cloudflare. Cada envio pede um token
 * novo (os tokens só valem uma vez). Na maioria dos casos a verificação é
 * invisível; se a Cloudflare pedir uma interação, o widget aparece numa caixa
 * fixa no fundo do ecrã, sem alterar o layout dos formulários.
 */
type TurnstileApi = {
  render(el: HTMLElement, options: Record<string, unknown>): string
  remove(widgetId: string): void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let loading: Promise<TurnstileApi> | null = null
let box: HTMLDivElement | null = null

function load(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT
    s.async = true
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')))
    s.onerror = () => {
      loading = null
      reject(new Error('turnstile'))
    }
    document.head.appendChild(s)
  })
  return loading
}

function container(): HTMLDivElement {
  if (!box || !box.isConnected) {
    box = document.createElement('div')
    box.setAttribute('data-turnstile', '')
    box.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:60'
    document.body.appendChild(box)
  }
  return box
}

/** Devolve um token novo, ou null se a verificação falhar, expirar ou não carregar. */
export async function getTurnstileToken(siteKey: string, timeoutMs = 30000): Promise<string | null> {
  let api: TurnstileApi
  try {
    api = await load()
  } catch {
    return null
  }
  return new Promise<string | null>((resolve) => {
    let done = false
    let widgetId = ''
    const finish = (token: string | null) => {
      if (done) return
      done = true
      window.clearTimeout(timer)
      try {
        if (widgetId) api.remove(widgetId)
      } catch {
        /* já removido */
      }
      resolve(token)
    }
    const timer = window.setTimeout(() => finish(null), timeoutMs)
    try {
      widgetId = api.render(container(), {
        sitekey: siteKey,
        appearance: 'interaction-only',
        callback: (token: string) => finish(token),
        'error-callback': () => {
          finish(null)
          return true
        },
        'expired-callback': () => finish(null),
        'timeout-callback': () => finish(null),
      })
    } catch {
      finish(null)
    }
  })
}

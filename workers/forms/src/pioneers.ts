/**
 * Finer Pioneers — campos acrescentados à candidatura (telefone e website da empresa).
 *
 * São pedidos pelo formulário a partir do aviso de privacidade 2026-11-v5. Uma página antiga
 * (ainda em cache no navegador, ou o site por publicar) envia uma versão anterior do aviso e
 * não tem estes campos: essa candidatura continua a ser aceite como antes, sem eles — por
 * isso o Worker pode ser publicado antes do site sem recusar nenhuma candidatura.
 */
import { phone } from './explore'
import { text } from './shared'

/** Versões do aviso de privacidade em que o formulário pede telefone (obrigatório) e website. */
export const PIONEERS_EXTRA_CONSENTS: readonly string[] = ['2026-11-v5']

export const URL_MAX = 200
const HOST_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/

/**
 * Telefone em formato internacional ("+351 912 345 678" → "+351912345678"), com a mesma regra
 * do Explorar e, para Portugal, o plano de numeração nacional: 9 dígitos começados por 2, 3 ou 9.
 * Vazio → null; inválido → false.
 */
export function pioneerPhone(value: unknown): string | null | false {
  const p = phone(value)
  if (!p) return p
  if (p.startsWith('+351') && !/^\+351[239]\d{8}$/.test(p)) return false
  return p
}

/**
 * Website opcional. Aceita "empresa.pt" e "https://www.empresa.pt/sobre"; guarda sempre um
 * endereço http(s) completo. Recusa outros esquemas (javascript:, data:, mailto:), credenciais
 * no endereço, portas, IP e nomes sem domínio de topo. Vazio → null; inválido → false.
 */
export function companyUrl(value: unknown): string | null | false {
  let raw = text(value, URL_MAX + 50)
  if (!raw) return null
  if (/\s/.test(raw) || raw.length > URL_MAX) return false
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return false
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
  if (u.username || u.password || u.port) return false
  if (!HOST_RE.test(u.hostname)) return false
  const href = u.pathname === '/' && !u.search && !u.hash ? u.origin : u.href
  return href.length > URL_MAX ? false : href
}

export type PioneerExtras = { phone: string | null; companyUrl: string | null }

/** Devolve os campos limpos, ou o nome do primeiro campo inválido. */
export function pioneerExtras(fields: unknown, consent: string): PioneerExtras | string {
  if (!PIONEERS_EXTRA_CONSENTS.includes(consent)) return { phone: null, companyUrl: null }
  const f = (fields && typeof fields === 'object' ? fields : {}) as Record<string, unknown>
  const tel = pioneerPhone(f.phone)
  if (!tel) return 'phone' // obrigatório: vazio ou inválido
  const url = companyUrl(f.companyUrl)
  if (url === false) return 'companyUrl'
  return { phone: tel, companyUrl: url }
}

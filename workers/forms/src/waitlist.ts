/**
 * Lista de Espera — telefone obrigatório (aviso de privacidade 2026-11-v7).
 *
 * O formulário pede o telefone a partir do aviso v7. Uma página antiga (em cache no navegador,
 * ou o site ainda por publicar) envia uma versão anterior do aviso e não tem o campo: essa
 * inscrição continua a ser aceite como antes, sem telefone — por isso o Worker pode ser
 * publicado antes do site sem recusar nenhuma inscrição.
 *
 * O número fica na coluna `phone` da tabela submissions (criada pela migração 0004), em
 * formato internacional, com a mesma regra do Explorar e do Finer Pioneers.
 */
import { phoneStrict } from './explore'

/** Versões do aviso de privacidade em que a Lista de Espera pede telefone (obrigatório). */
export const WAITLIST_PHONE_CONSENTS: readonly string[] = ['2026-11-v7']

/**
 * Campos acrescentados à inscrição, no mesmo formato de pioneerExtras (a Lista de Espera não
 * tem website). Devolve o nome do campo inválido ('phone') se o telefone faltar ou for inválido.
 */
export function waitlistExtras(fields: unknown, consent: string): { phone: string | null; companyUrl: null } | 'phone' {
  if (!WAITLIST_PHONE_CONSENTS.includes(consent)) return { phone: null, companyUrl: null }
  const f = (fields && typeof fields === 'object' ? fields : {}) as Record<string, unknown>
  const tel = phoneStrict(f.phone)
  return tel ? { phone: tel, companyUrl: null } : 'phone'
}

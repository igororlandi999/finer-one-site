/**
 * Validação do telefone e do website no navegador. As mesmas regras são repetidas no recetor
 * (workers/forms/src/pioneers.ts), que é quem decide.
 */

/** "+351" + "912 345 678" → "+351912345678"; null se não for um número internacional plausível. */
export function internationalPhone(dial: string, national: string): string | null {
  const digits = (dial + national).replace(/\D/g, '')
  if (!/^\+\d{1,4}$/.test(dial.trim()) || !national.replace(/\D/g, '')) return null
  if (digits.length < 7 || digits.length > 15) return null
  const full = '+' + digits
  // Portugal: 9 dígitos começados por 2, 3 ou 9.
  if (full.startsWith('+351') && !/^\+351[239]\d{8}$/.test(full)) return null
  return full
}

/** Website opcional: vazio é válido; preenchido tem de ser um endereço http(s) de um domínio. */
export function isValidCompanyUrl(value: string): boolean {
  let raw = value.trim()
  if (!raw) return true
  if (/\s/.test(raw) || raw.length > 200) return false
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw
  try {
    const u = new URL(raw)
    return (u.protocol === 'https:' || u.protocol === 'http:') && !u.username && !u.password && !u.port && /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/.test(u.hostname)
  } catch {
    return false
  }
}

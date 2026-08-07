/**
 * Formatação de valores financeiros.
 *
 * Nota: o formato pedido para a marca é "€327.420" (símbolo à esquerda,
 * ponto como separador de milhares). O locale pt-PT devolve "327 420 €",
 * por isso o agrupamento é feito com "de-DE" e o símbolo é prefixado
 * manualmente para garantir um resultado estável em qualquer navegador.
 */
const GROUP_LOCALE = 'de-DE'

export function formatEuro(value: number, fractionDigits = 0): string {
  const grouped = new Intl.NumberFormat(GROUP_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)

  return `€${grouped}`
}

/** Versão compacta para eixos de gráfico: "€200 mil". */
export function formatEuroShort(value: number): string {
  if (Math.abs(value) >= 1000) {
    const thousands = value / 1000
    const digits = Number.isInteger(thousands) ? 0 : 1
    return `€${thousands.toFixed(digits).replace('.', ',')} mil`
  }

  return formatEuro(value)
}

export function formatPercent(value: number, fractionDigits = 1): string {
  const formatted = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Math.abs(value))

  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatted}%`
}

/** Percentagem sem sinal, para valores absolutos como "35,3%". */
export function formatPercentPlain(value: number, fractionDigits = 1): string {
  return `${new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)}%`
}

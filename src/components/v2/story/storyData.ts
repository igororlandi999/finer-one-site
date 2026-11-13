/**
 * Dados demonstrativos da secção "Faturar não é o mesmo que receber".
 *
 * TODOS os valores são fictícios e não correspondem a nenhuma empresa,
 * cliente ou fornecedor real. Estão organizados aqui para serem facilmente
 * substituídos, e as contas batem certo entre si (ver verificações no fim).
 */

export type Invoice = { id: string; client: 'A' | 'B' | 'C' | 'D'; amount: number; daysLate: number }

/** As 6 faturas em atraso, ordenadas por valor. */
export const INVOICES: Invoice[] = [
  { id: 'FT 2026/118', client: 'A', amount: 18000, daysLate: 22 },
  { id: 'FT 2026/131', client: 'A', amount: 15000, daysLate: 18 },
  { id: 'FT 2026/140', client: 'A', amount: 12000, daysLate: 9 },
  { id: 'FT 2026/122', client: 'B', amount: 2480, daysLate: 16 },
  { id: 'FT 2026/127', client: 'C', amount: 1968.6, daysLate: 14 },
  { id: 'FT 2026/135', client: 'D', amount: 1500, daysLate: 11 },
]

export const CLIENT_NAMES: Record<'pt' | 'en', Record<Invoice['client'], string>> = {
  pt: { A: 'Cliente A', B: 'Cliente B', C: 'Cliente C', D: 'Cliente D' },
  en: { A: 'Customer A', B: 'Customer B', C: 'Customer C', D: 'Customer D' },
}

const sum = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) * 100) / 100

export const TOTAL_OVERDUE = sum(INVOICES.map((i) => i.amount)) // 50.948,60
export const OVERDUE_COUNT = INVOICES.length // 6
export const AVG_DAYS_LATE = Math.round(sum(INVOICES.map((i) => i.daysLate)) / INVOICES.length) // 15
export const MAIN_CLIENT_TOTAL = sum(INVOICES.filter((i) => i.client === 'A').map((i) => i.amount)) // 45.000,00
export const OTHERS_TOTAL = Math.round((TOTAL_OVERDUE - MAIN_CLIENT_TOTAL) * 100) / 100 // 5.948,60
export const MAIN_CLIENT_SHARE = MAIN_CLIENT_TOTAL / TOTAL_OVERDUE // 0,883 → 88,3%

/** Cenário ilustrativo de tesouraria (próximos 15 dias, sem novas entradas). */
export const CASH = {
  available: 28540.32,
  commitments: [
    { key: 'salaries', amount: 19600 },
    { key: 'suppliers', amount: 12430 },
    { key: 'taxes', amount: 6170 },
  ],
}
export const COMMITMENTS_TOTAL = sum(CASH.commitments.map((c) => c.amount)) // 38.200,00
export const CASH_GAP = Math.round((CASH.available - COMMITMENTS_TOTAL) * 100) / 100 // -9.659,68
export const CASH_IF_MAIN_PAYS = Math.round((CASH_GAP + MAIN_CLIENT_TOTAL) * 100) / 100 // +35.340,32

/** Exemplo "Custos": despesas operacionais +18% com receitas +4% (mês vs. mês anterior). */
export const COSTS = {
  revenuePrev: 59490,
  revenue: 61870, // +4,0%
  opexPrev: 37415,
  opex: 44150, // +18,0%
  categories: [
    { key: 'suppliers', delta: 4120 },
    { key: 'subscriptions', delta: 1385 },
    { key: 'energy', delta: 1230 },
  ], // soma 6.735 = 44.150 − 37.415
}

/** Exemplo "Tesouraria": compromissos dos próximos 30 dias acima da liquidez. */
export const TREASURY = {
  available: 28540.32,
  confirmedInflows: 16500,
  commitments: [
    { key: 'salaries', amount: 21800 },
    { key: 'suppliers', amount: 21430 },
    { key: 'taxes', amount: 9070 },
  ], // soma 52.300
}
export const TREASURY_COMMITMENTS = sum(TREASURY.commitments.map((c) => c.amount)) // 52.300
export const TREASURY_GAP = Math.round((TREASURY.available + TREASURY.confirmedInflows - TREASURY_COMMITMENTS) * 100) / 100 // -7.259,68

/** Formatação monetária no estilo da plataforma: € 50.948,60 */
export function eur(value: number, lang: 'pt' | 'en' = 'pt', decimals = 2) {
  const neg = value < 0
  const fixed = Math.abs(value).toFixed(decimals)
  const [int, dec] = fixed.split('.')
  const thousands = lang === 'pt' ? '.' : ','
  const point = lang === 'pt' ? ',' : '.'
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousands)
  return `${neg ? '−' : ''}€ ${grouped}${dec ? point + dec : ''}`
}

export function pct(value: number, lang: 'pt' | 'en' = 'pt', decimals = 1) {
  const s = (value * 100).toFixed(decimals)
  return `${lang === 'pt' ? s.replace('.', ',') : s}%`
}

// Verificações de coerência (só em desenvolvimento).
if (import.meta.env.DEV) {
  const checks: [string, boolean][] = [
    ['total 50.948,60', TOTAL_OVERDUE === 50948.6],
    ['média 15 dias', AVG_DAYS_LATE === 15],
    ['cliente A 45.000', MAIN_CLIENT_TOTAL === 45000],
    ['quota 88,3%', pct(MAIN_CLIENT_SHARE) === '88,3%'],
    ['compromissos 38.200', COMMITMENTS_TOTAL === 38200],
    ['diferença −9.659,68', CASH_GAP === -9659.68],
    ['custos +18%', Math.round((COSTS.opex / COSTS.opexPrev - 1) * 100) === 18],
    ['receitas +4%', Math.round((COSTS.revenue / COSTS.revenuePrev - 1) * 100) === 4],
    ['categorias = variação', sum(COSTS.categories.map((c) => c.delta)) === COSTS.opex - COSTS.opexPrev],
  ]
  const failed = checks.filter(([, ok]) => !ok).map(([n]) => n)
  if (failed.length) console.warn('[storyData] incoerências:', failed)
}

/**
 * Dados FICTÍCIOS da secção 5 (montra da plataforma). Coerentes com a Finer
 * Home e o Finer Advisor da demonstração (saldo € 48.320,15; 9 faturas de
 * fornecedores por pagar, € 21.430,00) e propositadamente diferentes do
 * diagnóstico da secção 2 (cobranças em atraso). Nenhum nome ou valor é real.
 */
import type { Lang } from '@/i18n/LanguageContext'
import { getUiData } from '@/components/v2/finer-ui/data'

/** Formata cêntimos em euros (PT: € 48.320,15 · EN: €48,320.15). */
export function eurCents(cents: number, lang: Lang) {
  const neg = cents < 0
  const abs = Math.abs(Math.round(cents))
  const int = Math.floor(abs / 100)
  const dec = String(abs % 100).padStart(2, '0')
  const grouped = String(int).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'pt' ? '.' : ',')
  const body = lang === 'pt' ? `€ ${grouped},${dec}` : `€${grouped}.${dec}`
  return neg ? `− ${body}` : body
}

/* ---------------- Finer Home (conteúdo próprio da montra) ---------------- */

export function getShowcaseHome(lang: Lang) {
  const base = getUiData(lang).home
  const pt = lang === 'pt'
  return {
    ...base,
    questions: pt
      ? [
          { q: 'Como está a minha empresa este mês?', a: 'Novembro está a correr bem. Entraram € 61.870,00 e saíram € 44.150,00, o que deixa um resultado de € 17.720,00. As entradas subiram € 4.637,20 face a outubro e o saldo atual é de € 48.320,15.' },
          { q: 'Quanto tenho disponível hoje?', a: 'O saldo atual é de € 48.320,15. Esta semana vencem 2 faturas de fornecedores, no total de € 4.980,00.' },
          { q: 'Quais faturas estão por pagar?', a: 'Tem 9 faturas de fornecedores por pagar, no total de € 21.430,00. Duas vencem esta semana (€ 4.980,00). Nenhuma está em atraso.' },
        ]
      : [
          { q: 'How is my company doing this month?', a: 'November is going well. €61,870.00 came in and €44,150.00 went out, leaving a result of €17,720.00. Cash in rose by €4,637.20 on October and the current balance is €48,320.15.' },
          { q: 'How much do I have available today?', a: 'The current balance is €48,320.15. Two supplier invoices are due this week, totalling €4,980.00.' },
          { q: 'Which invoices are due?', a: 'You have 9 supplier invoices due, totalling €21,430.00. Two are due this week (€4,980.00). None are overdue.' },
        ],
    briefTitle: pt ? ['Novembro está a correr bem.', 'Há pagamentos a planear.'] : ['November is going well.', 'Some payments need planning.'],
    briefBody: pt
      ? ['As entradas do mês somam € 61.870,00 e o resultado é positivo. Tem ', '9 faturas de fornecedores', ' por pagar, no valor de ', '€ 21.430,00', '; duas vencem esta semana.']
      : ['Cash in this month totals €61,870.00 and the result is positive. You have ', '9 supplier invoices', ' due, worth ', '€21,430.00', '; two are due this week.'],
    priority: pt ? 'Planear os pagamentos desta semana: € 4.980,00.' : 'Plan this week’s payments: €4,980.00.',
    priorityMeta: pt ? '2 faturas a vencer · Fornecedores' : '2 invoices due · Suppliers',
  }
}

/* ---------------- Cashflow ---------------- */

/** Saldo final (hoje), em cêntimos — igual ao "Saldo atual" da Finer Home. */
export const FINAL_BALANCE = 4832015

/** Entradas e saídas liquidadas por mês, em cêntimos (dez. 2025 – nov. 2026). */
export const CASH_MONTHS: { pt: string; en: string; inC: number; outC: number }[] = [
  { pt: 'dez.', en: 'Dec', inC: 4860000, outC: 5210000 },
  { pt: 'jan.', en: 'Jan', inC: 4420000, outC: 4980000 },
  { pt: 'fev.', en: 'Feb', inC: 4690000, outC: 4530000 },
  { pt: 'mar.', en: 'Mar', inC: 5230000, outC: 5070000 },
  { pt: 'abr.', en: 'Apr', inC: 4980000, outC: 5340000 },
  { pt: 'mai.', en: 'May', inC: 5510000, outC: 5120000 },
  { pt: 'jun.', en: 'Jun', inC: 5340000, outC: 5600000 },
  { pt: 'jul.', en: 'Jul', inC: 5020000, outC: 5490000 },
  { pt: 'ago.', en: 'Aug', inC: 4270000, outC: 4750000 },
  { pt: 'set.', en: 'Sep', inC: 5840000, outC: 5510000 },
  { pt: 'out.', en: 'Oct', inC: 5723280, outC: 4873910 },
  { pt: 'nov.', en: 'Nov', inC: 6187000, outC: 4415000 },
]

export function cashPeriod(months: number) {
  const list = CASH_MONTHS.slice(-months)
  const inC = list.reduce((s, m) => s + m.inC, 0)
  const outC = list.reduce((s, m) => s + m.outC, 0)
  return { list, inC, outC, start: FINAL_BALANCE - inC + outC, end: FINAL_BALANCE }
}

/* ---------------- Clientes e Fornecedores ---------------- */

export type Doc = { who: string; doc: string; due: string; valueC: number; days: number; late: boolean }
export type Side = {
  totalC: number
  buckets: { valueC: number; label: string; docs: number }[]
  open: number
  docs: Doc[]
}

export function getPartners(lang: Lang): { clientes: Side; fornecedores: Side } {
  const pt = lang === 'pt'
  const b = pt ? ['Vencido', 'Próximos 7 dias', '8 – 30 dias', '+ 30 dias'] : ['Overdue', 'Next 7 days', '8 – 30 days', '+ 30 days']
  return {
    clientes: {
      totalC: 2630000,
      buckets: [{ valueC: 1864000, label: b[0], docs: 7 }, { valueC: 0, label: b[1], docs: 0 }, { valueC: 420000, label: b[2], docs: 2 }, { valueC: 346000, label: b[3], docs: 3 }],
      open: 12,
      docs: [
        { who: pt ? 'Cliente Exemplo A, Lda.' : 'Example Customer A Ltd', doc: 'FT 2026/381', due: '06/10/2026', valueC: 642000, days: 35, late: true },
        { who: pt ? 'Cliente Exemplo B, S.A.' : 'Example Customer B plc', doc: 'FT 2026/392', due: '15/10/2026', valueC: 498000, days: 26, late: true },
        { who: pt ? 'Cliente Exemplo C, Lda.' : 'Example Customer C Ltd', doc: 'FT 2026/404', due: '22/10/2026', valueC: 202000, days: 19, late: true },
        { who: pt ? 'Cliente Exemplo D' : 'Example Customer D', doc: 'FT 2026/411', due: '30/10/2026', valueC: 176000, days: 11, late: true },
        { who: pt ? 'Cliente Exemplo F, Unip.' : 'Example Customer F', doc: 'FT 2026/452', due: '28/11/2026', valueC: 270000, days: 18, late: false },
        { who: pt ? 'Cliente Exemplo G, Lda.' : 'Example Customer G Ltd', doc: 'FT 2026/455', due: '02/12/2026', valueC: 150000, days: 22, late: false },
      ],
    },
    fornecedores: {
      totalC: 2143000,
      buckets: [{ valueC: 0, label: b[0], docs: 0 }, { valueC: 498000, label: b[1], docs: 2 }, { valueC: 915000, label: b[2], docs: 4 }, { valueC: 730000, label: b[3], docs: 3 }],
      open: 9,
      docs: [
        { who: pt ? 'Fornecedor Exemplo J, Lda.' : 'Example Supplier J Ltd', doc: 'FT 2026/1184', due: '12/11/2026', valueC: 312000, days: 2, late: false },
        { who: pt ? 'Fornecedor Exemplo K, S.A.' : 'Example Supplier K plc', doc: 'FT 2026/0912', due: '14/11/2026', valueC: 186000, days: 4, late: false },
        { who: pt ? 'Fornecedor Exemplo L' : 'Example Supplier L', doc: 'FT 2026/335', due: '20/11/2026', valueC: 275000, days: 10, late: false },
        { who: pt ? 'Fornecedor Exemplo M, Lda.' : 'Example Supplier M Ltd', doc: 'FT 2026/078', due: '27/11/2026', valueC: 190000, days: 17, late: false },
        { who: pt ? 'Fornecedor Exemplo H, Lda.' : 'Example Supplier H Ltd', doc: 'FT 2026/207', due: '03/12/2026', valueC: 246000, days: 23, late: false },
        { who: pt ? 'Fornecedor Exemplo G, Lda.' : 'Example Supplier G Ltd', doc: 'FT 2026/556', due: '05/12/2026', valueC: 204000, days: 25, late: false },
      ],
    },
  }
}

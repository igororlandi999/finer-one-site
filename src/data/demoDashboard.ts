/**
 * DADOS DEMONSTRATIVOS.
 *
 * Nada neste ficheiro corresponde a uma empresa real, a um cliente real ou a
 * dados obtidos de qualquer integração. Existe apenas para dar vida à
 * representação do produto na Hero do site institucional.
 *
 * Nenhuma destas métricas deve ser reutilizada como prova, referência
 * comercial ou benchmark.
 */

export type Kpi = {
  id: string
  label: string
  value: number
  /** Formatação do valor: euro ou percentagem. */
  unit: 'eur' | 'pct'
  /** Variação face ao período anterior, em pontos percentuais. */
  delta?: number
  /** Se a variação é boa ou má para o negócio (descer despesas é bom). */
  tone?: 'good' | 'bad'
  caption?: string
}

export type CashflowPoint = {
  /** Etiqueta curta do eixo: "Abr". */
  short: string
  /** Etiqueta completa do tooltip: "Abr 2026". */
  label: string
  value: number
  /** true = valor projetado, false = valor realizado. */
  forecast: boolean
}

export const demoKpis: Kpi[] = [
  { id: 'receitas', label: 'Receitas', value: 327_420, unit: 'eur', delta: 8.2, tone: 'good' },
  { id: 'despesas', label: 'Despesas', value: 211_870, unit: 'eur', delta: -3.1, tone: 'good' },
  { id: 'margem', label: 'Margem', value: 35.3, unit: 'pct', delta: -7.8, tone: 'bad' },
  { id: 'tesouraria', label: 'Tesouraria', value: 148_920, unit: 'eur', caption: 'Saldo atual' },
]

/**
 * Dez meses realizados seguidos de três meses de previsão.
 * O último ponto realizado coincide com o KPI de tesouraria (€148.920) e a
 * primeira projeção coincide com a previsão a 30 dias (€184.200).
 */
export const demoCashflow: CashflowPoint[] = [
  { short: 'Out', label: 'Out 2025', value: 96_400, forecast: false },
  { short: 'Nov', label: 'Nov 2025', value: 104_200, forecast: false },
  { short: 'Dez', label: 'Dez 2025', value: 98_750, forecast: false },
  { short: 'Jan', label: 'Jan 2026', value: 112_300, forecast: false },
  { short: 'Fev', label: 'Fev 2026', value: 121_800, forecast: false },
  { short: 'Mar', label: 'Mar 2026', value: 116_400, forecast: false },
  { short: 'Abr', label: 'Abr 2026', value: 128_900, forecast: false },
  { short: 'Mai', label: 'Mai 2026', value: 137_500, forecast: false },
  { short: 'Jun', label: 'Jun 2026', value: 141_200, forecast: false },
  { short: 'Jul', label: 'Jul 2026', value: 148_920, forecast: false },
  { short: 'Ago', label: 'Ago 2026', value: 184_200, forecast: true },
  { short: 'Set', label: 'Set 2026', value: 176_800, forecast: true },
  { short: 'Out', label: 'Out 2026', value: 191_500, forecast: true },
]

export const demoInsight = {
  title: 'Margem operacional caiu 7,8%',
  description: 'Principal impacto: aumento dos custos operacionais.',
  action: 'Ver análise',
}

export const demoForecast = {
  label: 'Previsão de tesouraria',
  value: 184_200,
  caption: 'Próximos 30 dias',
}

export const demoChat = {
  question: 'Posso contratar mais uma pessoa?',
  answer:
    'Com base na margem atual e na previsão de tesouraria, a contratação é financeiramente viável, mas reduzirá a folga de caixa nos próximos 60 dias.',
}

export const demoNavigation = [
  'Resumo',
  'Tesouraria',
  'Receitas',
  'Despesas',
  'Clientes',
  'Alertas',
] as const

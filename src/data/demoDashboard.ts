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
  description:
    'O principal impacto está no aumento dos custos operacionais, com destaque para manutenção e reparações.',
  action: 'Ver análise',
}

export const demoForecast = {
  label: 'Previsão de tesouraria',
  value: 184_200,
  caption: 'Próximos 30 dias',
}

export const demoChat = {
  question: 'Onde estou a perder dinheiro?',
  answer:
    'A principal pressão está nos custos operacionais. Manutenção e reparações aumentaram €18.400 e os serviços externos €6.200 face à média dos últimos meses. Em conjunto explicam grande parte da redução da margem operacional.',
}


/* ------------------------------------------------------------------ *
 * Áreas do plano Plus                                                 *
 *                                                                     *
 * Esta lista corresponde exatamente às abas do plano Plus definidas em *
 * src/data/pricing.ts. Nenhum módulo Pro ou Team aparece aqui.         *
 *                                                                     *
 * Tudo o que se segue é DEMONSTRATIVO — valores inventados para dar    *
 * corpo à representação do produto na Hero.                           *
 * ------------------------------------------------------------------ */

export type DashboardTabId =
  | 'resumo'
  | 'diagnostico'
  | 'receitas'
  | 'despesas'
  | 'relacoes'
  | 'documentos'
  | 'performance'
  | 'alertas'
  | 'chat'

export type DashboardTab = {
  id: DashboardTabId
  label: string
  /** Rótulo curto para a barra superior e para o strip em ecrãs estreitos. */
  short: string
}

export const dashboardTabs: DashboardTab[] = [
  { id: 'resumo', label: 'Resumo', short: 'Resumo' },
  { id: 'diagnostico', label: 'Diagnóstico Financeiro', short: 'Diagnóstico' },
  { id: 'receitas', label: 'Receitas', short: 'Receitas' },
  { id: 'despesas', label: 'Despesas', short: 'Despesas' },
  { id: 'relacoes', label: 'Clientes e Fornecedores', short: 'Clientes' },
  { id: 'documentos', label: 'Documentos', short: 'Documentos' },
  { id: 'performance', label: 'Performance Financeira', short: 'Performance' },
  { id: 'alertas', label: 'Alertas', short: 'Alertas' },
  { id: 'chat', label: 'Chat Financeiro', short: 'Chat' },
]

/** Linha genérica indicador → valor → variação, usada por várias áreas. */
export type DemoRow = {
  label: string
  value: string
  note?: string
  /** Direção da leitura financeira, não do sinal aritmético. */
  tone?: 'good' | 'bad' | 'neutral'
  /** Proporção 0–100 para a barra, quando existe. */
  share?: number
}

export const demoDiagnostic = {
  score: 68,
  state: 'Atenção',
  summary:
    'A empresa mantém liquidez confortável, mas a margem está a estreitar por pressão dos custos operacionais.',
  metrics: [
    { label: 'Liquidez corrente', value: '1,42', note: 'Acima do limiar de referência', tone: 'good' },
    { label: 'Margem operacional', value: '35,3%', note: '-7,8% face ao trimestre', tone: 'bad' },
    { label: 'Cobertura de tesouraria', value: '2,8 meses', note: 'Estável', tone: 'neutral' },
    { label: 'Risco global', value: 'Moderado', note: 'Concentração de clientes', tone: 'bad' },
  ] satisfies DemoRow[],
  readings: [
    'A pressão vem dos custos, não da procura: as receitas continuam a crescer.',
    'A tesouraria absorve a queda de margem no curto prazo.',
  ],
}

export const demoRevenue = {
  total: '€327.420',
  delta: '+8,2%',
  caption: 'Últimos 12 meses',
  months: [58, 62, 55, 68, 74, 70, 79, 84, 88, 92],
  origin: [
    { label: 'Serviços', value: '€189.900', share: 58 },
    { label: 'Produtos', value: '€101.500', share: 31 },
    { label: 'Manutenção', value: '€36.020', share: 11 },
  ] satisfies DemoRow[],
  topClients: [
    { label: 'Cliente A', value: '€58.930', note: '18% do total' },
    { label: 'Cliente B', value: '€41.200', note: '13% do total' },
    { label: 'Cliente C', value: '€32.740', note: '10% do total' },
  ] satisfies DemoRow[],
}

export const demoExpenses = {
  total: '€211.870',
  delta: '-3,1%',
  caption: 'Últimos 12 meses',
  categories: [
    { label: 'Pessoal', value: '€96.400', note: '+1,2%', tone: 'neutral', share: 46 },
    { label: 'Fornecimentos', value: '€44.270', note: '-2,4%', tone: 'good', share: 21 },
    { label: 'Manutenção e reparações', value: '€42.300', note: '+€18.400', tone: 'bad', share: 20 },
    { label: 'Serviços externos', value: '€28.900', note: '+€6.200', tone: 'bad', share: 13 },
  ] satisfies DemoRow[],
  reading:
    'Manutenção e serviços externos explicam €24.600 do aumento face à média dos últimos meses.',
}

export const demoRelations = {
  concentration: [
    { label: 'Maior cliente', value: '18%', note: 'Da faturação analisada' },
    { label: 'Top 5 clientes', value: '47%', note: 'Exposição elevada', tone: 'bad' },
  ] satisfies DemoRow[],
  overdue: { value: '€34.600', note: 'Vencido em 3 clientes' },
  ranking: [
    { label: 'Cliente A', value: '€58.930', note: 'Pagamento a 30 dias', tone: 'good' },
    { label: 'Cliente B', value: '€41.200', note: '18 dias de atraso', tone: 'bad' },
    { label: 'Fornecedor X', value: '€27.400', note: 'Manutenção e reparações', tone: 'neutral' },
    { label: 'Fornecedor Y', value: '€16.850', note: 'Serviços externos', tone: 'neutral' },
  ] satisfies DemoRow[],
}

export type DemoDocument = {
  name: string
  kind: string
  state: string
  date: string
  tone: 'good' | 'bad' | 'neutral'
}

export const demoDocuments: DemoDocument[] = [
  { name: 'Balancete — Jul 2026', kind: 'Contabilidade', state: 'Processado', date: '02 Ago', tone: 'good' },
  { name: 'Extrato bancário — Jul 2026', kind: 'Banco', state: 'Processado', date: '01 Ago', tone: 'good' },
  { name: 'Faturas de fornecedores', kind: 'Faturação', state: '24 documentos', date: 'Jul 2026', tone: 'neutral' },
  { name: 'Mapa de amortizações', kind: 'Contabilidade', state: 'Em falta', date: '—', tone: 'bad' },
]

export const demoPerformance = {
  rows: [
    { label: 'Receitas', value: '€327.420', note: '+8,2%', tone: 'good', share: 100 },
    { label: 'Despesas', value: '€211.870', note: '-3,1%', tone: 'good', share: 65 },
    { label: 'Resultado operacional', value: '€115.550', note: '+2,4%', tone: 'good', share: 35 },
  ] satisfies DemoRow[],
  margin: { value: '35,3%', note: '-7,8% face ao trimestre anterior' },
}

export type DemoAlert = {
  title: string
  context: string
  level: 'Alta' | 'Média' | 'Baixa'
}

export const demoAlerts: DemoAlert[] = [
  {
    title: 'Margem operacional caiu 7,8%',
    context: 'Manutenção e reparações aumentaram €18.400 face à média dos últimos meses.',
    level: 'Alta',
  },
  {
    title: 'Concentração de faturação em 5 clientes',
    context: 'Os cinco maiores clientes representam 47% das receitas analisadas.',
    level: 'Alta',
  },
  {
    title: '€34.600 vencidos por receber',
    context: 'Três clientes com pagamentos em atraso há mais de 15 dias.',
    level: 'Média',
  },
  {
    title: 'Serviços externos acima do padrão',
    context: 'Desvio de €6.200 sem correspondência no volume de atividade.',
    level: 'Baixa',
  },
]

export const demoChatThread = {
  suggestions: ['Porque caiu a margem?', 'Como evolui a tesouraria?'],
  messages: [
    { role: 'user' as const, text: 'Onde estou a perder dinheiro?' },
    {
      role: 'assistant' as const,
      text: 'A principal pressão está nos custos operacionais. Manutenção e reparações aumentaram €18.400 e os serviços externos €6.200 face à média dos últimos meses. Em conjunto explicam grande parte da redução da margem operacional.',
    },
    { role: 'user' as const, text: 'Isso põe a tesouraria em risco?' },
    {
      role: 'assistant' as const,
      text: 'Não no curto prazo. A previsão a 30 dias aponta para €184.200, o que mantém cerca de 2,8 meses de cobertura. O risco é de erosão continuada da margem, não de liquidez imediata.',
    },
  ],
}

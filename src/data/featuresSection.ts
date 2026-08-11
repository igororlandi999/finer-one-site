/**
 * Conteúdo da quarta secção — áreas do produto.
 *
 * TODOS OS NÚMEROS SÃO MOCK DATA. Não pertencem a nenhuma empresa real, não
 * vêm de nenhuma integração e não devem ser usados como prova comercial.
 *
 * As interfaces representam áreas do produto tal como estão desenhadas; não
 * afirmam integrações automáticas, OCR, leitura documental nem qualquer
 * funcionalidade que ainda não esteja definida.
 */

export type FeatureId =
  | 'performance'
  | 'cashflow'
  | 'alertas'
  | 'clientes'
  | 'documentos'
  | 'chat'

export type Feature = {
  id: FeatureId
  /** Etiqueta curta da navegação. */
  tab: string
  /** Nome completo da área, mostrado na barra do módulo. */
  name: string
  headline: string
  description: string
  /** Contexto mostrado à direita da barra do módulo. */
  context: string
}

export const features: Feature[] = [
  {
    id: 'performance',
    tab: 'Performance',
    name: 'Performance Financeira',
    headline: 'Perceba como a empresa está realmente a evoluir.',
    description:
      'Acompanhe receitas, despesas, margens e evolução financeira numa visão clara da performance do negócio.',
    context: 'Últimos 6 meses',
  },
  {
    id: 'cashflow',
    tab: 'Cashflow',
    name: 'Planeamento & Cashflow',
    headline: 'Veja o que pode acontecer antes de acontecer.',
    description:
      'Compare realizado e previsão para antecipar necessidades de tesouraria e tomar decisões com maior segurança.',
    context: 'Realizado e previsão',
  },
  {
    id: 'alertas',
    tab: 'Alertas',
    name: 'Alertas',
    headline: 'Saiba o que exige atenção antes de se tornar um problema.',
    description:
      'A Finer One destaca alterações relevantes na margem, tesouraria, custos, cobranças e outros indicadores financeiros.',
    context: '4 por rever',
  },
  {
    id: 'clientes',
    tab: 'Clientes',
    name: 'Clientes & Fornecedores',
    headline: 'Perceba quem mais influencia a sua saúde financeira.',
    description:
      'Analise recebimentos, atrasos, concentração e exposição financeira entre clientes e fornecedores.',
    context: 'Contas a receber',
  },
  {
    id: 'documentos',
    tab: 'Documentos',
    name: 'Documentos',
    headline: 'A informação certa, organizada quando precisa dela.',
    description:
      'Centralize documentos financeiros e mantenha a informação relevante acessível numa única área.',
    context: 'Jul 2026',
  },
  {
    id: 'chat',
    tab: 'Chat',
    name: 'Chat Financeiro',
    headline: 'Pergunte à sua empresa.',
    description:
      'Converse com a informação financeira e obtenha respostas claras com base nos dados disponíveis na plataforma.',
    context: 'Com base nos dados do período',
  },
]

/* ---------------------------------------------------------------- 01 */

export const performanceMetrics = [
  { label: 'Receitas', value: '€327.420', delta: '+8,2%', tone: 'good' as const },
  { label: 'Despesas', value: '€211.870', delta: '-3,1%', tone: 'good' as const },
  { label: 'Margem', value: '35,3%', delta: '+2,4 p.p.', tone: 'good' as const },
  { label: 'Resultado operacional', value: '€82.640', delta: null, tone: 'neutral' as const },
]

/** Receitas e despesas por mês, normalizadas para 0–100 no desenho. */
export const performanceSeries = [
  { month: 'Fev', receitas: 62, despesas: 44 },
  { month: 'Mar', receitas: 58, despesas: 46 },
  { month: 'Abr', receitas: 71, despesas: 49 },
  { month: 'Mai', receitas: 76, despesas: 52 },
  { month: 'Jun', receitas: 84, despesas: 55 },
  { month: 'Jul', receitas: 92, despesas: 58 },
]

export const performanceAside = {
  label: 'Margem',
  value: '35,3%',
  note: '+2,4 p.p. nos últimos 6 meses',
  spark: [46, 52, 49, 57, 63, 68],
}

/* ---------------------------------------------------------------- 02 */

export const cashflowMetrics = [
  { label: 'Saldo atual', value: '€148.920' },
  { label: 'Previsão 30 dias', value: '€184.200' },
  { label: 'Previsão 60 dias', value: '€162.800' },
]

/** Saldo de tesouraria por mês. `forecast` desenha a coluna a tracejado. */
export const cashflowColumns = [
  { month: 'Mar', height: 46, forecast: false },
  { month: 'Abr', height: 54, forecast: false },
  { month: 'Mai', height: 51, forecast: false },
  { month: 'Jun', height: 63, forecast: false },
  { month: 'Jul', height: 68, forecast: false },
  { month: 'Ago', height: 88, forecast: true },
  { month: 'Set', height: 79, forecast: true },
  { month: 'Out', height: 92, forecast: true },
]

export const cashflowAside = {
  label: 'Cenário base',
  value: '€36.400',
  note: 'Folga de tesouraria estimada a 30 dias',
  floor: 'Limite de segurança definido: €40.000',
}

/* ---------------------------------------------------------------- 03 */

export type AlertLevel = 'info' | 'atencao' | 'risco'

export const alerts: { level: AlertLevel; title: string; meta: string }[] = [
  { level: 'risco', title: 'Margem operacional caiu 7,8%', meta: 'Jul 2026 · face ao trimestre' },
  { level: 'atencao', title: 'Custos operacionais aumentaram 12%', meta: 'Jul 2026' },
  { level: 'atencao', title: 'Cliente B está em atraso há 18 dias', meta: '€31.750 por receber' },
  {
    level: 'info',
    title: 'Tesouraria poderá ficar pressionada dentro de 45 dias',
    meta: 'Com base na previsão atual',
  },
]

export const alertLevelLabel: Record<AlertLevel, string> = {
  info: 'Informação',
  atencao: 'Atenção',
  risco: 'Risco',
}

export const alertsAside = {
  title: 'Margem operacional caiu 7,8%',
  impactLabel: 'Principal impacto',
  impact: 'Custos operacionais +12%',
  suggestionLabel: 'Sugestão de análise',
  suggestion: 'Rever as categorias de maior crescimento.',
}

/* ---------------------------------------------------------------- 04 */

export const clientsMetrics = [
  { label: 'Contas a receber', value: '€92.400' },
  { label: 'Atrasado', value: '€18.600' },
  { label: 'Concentração top 5', value: '38%' },
]

export const clients = [
  { name: 'Cliente A', value: '€48.200', status: 'Em dia', late: false },
  { name: 'Cliente B', value: '€31.750', status: '12 dias em atraso', late: true },
  { name: 'Cliente C', value: '€27.800', status: 'Em dia', late: false },
  { name: 'Cliente D', value: '€16.400', status: 'Em dia', late: false },
]

/** Ageing das contas a receber, em percentagem do total. */
export const clientsAgeing = [
  { label: 'Em dia', share: 68, late: false },
  { label: '1–30 dias', share: 19, late: true },
  { label: '31–60 dias', share: 9, late: true },
  { label: '+60 dias', share: 4, late: true },
]

/* ---------------------------------------------------------------- 05 */

export const documents = [
  {
    name: 'Relatório Financeiro — Jul 2026',
    category: 'Relatório',
    date: '31 Jul 2026',
    state: 'Disponível',
  },
  {
    name: 'Extrato Bancário — Jul 2026',
    category: 'Extrato',
    date: '01 Ago 2026',
    state: 'Disponível',
  },
  {
    name: 'Faturas Fornecedores',
    category: 'Faturação',
    date: 'Jul 2026',
    state: '24 documentos',
  },
  {
    name: 'Previsão de Tesouraria',
    category: 'Planeamento',
    date: 'Ago 2026',
    state: 'Atualizado',
  },
]

export const documentsAside = {
  title: 'Relatório Financeiro',
  period: 'Jul 2026',
  figures: [
    { label: 'Volume de negócios', value: '€327.420' },
    { label: 'Resultado operacional', value: '€82.640' },
  ],
}

/* ---------------------------------------------------------------- 06 */

export const chatExchange = {
  question: 'Porque caiu a margem este mês?',
  answer:
    'A margem operacional caiu 7,8%, principalmente devido ao crescimento dos custos operacionais. As categorias com maior aumento foram logística e fornecedores.',
  suggestions: ['Posso contratar mais uma pessoa?', 'Como está a minha tesouraria?'],
}

export const chatAside = {
  label: 'Custos operacionais',
  value: '+12%',
  note: 'Indicador citado na resposta',
  bars: [
    { label: 'Logística', share: 100 },
    { label: 'Fornecedores', share: 74 },
    { label: 'Pessoal', share: 38 },
  ],
}

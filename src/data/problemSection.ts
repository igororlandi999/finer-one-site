/**
 * Conteúdo da segunda secção da landing page ("o problema").
 *
 * Os valores financeiros são ilustrativos e coerentes com o dashboard
 * demonstrativo da Hero. Não representam nenhuma empresa real.
 * Nenhum nome de banco, ERP ou software real é utilizado.
 */

export type DataSource = {
  /** Tipo genérico de sistema — nunca uma marca real. */
  system: string
  label: string
  value: string
  icon: 'bank' | 'invoice' | 'sheet' | 'accounting' | 'erp'
}

export const dataSources: DataSource[] = [
  { system: 'Banco', label: 'Saldo', value: '€148.920', icon: 'bank' },
  { system: 'Faturação', label: 'Faturas emitidas', value: '€327.420', icon: 'invoice' },
  { system: 'Folha de cálculo', label: 'Margem', value: '35,3%', icon: 'sheet' },
  { system: 'Contabilidade', label: 'Custos', value: '€211.870', icon: 'accounting' },
  { system: 'ERP', label: 'Clientes ativos', value: '128', icon: 'erp' },
]

export const businessQuestions = [
  'Porque caiu a margem?',
  'Posso contratar?',
  'Quanto terei em tesouraria daqui a 30 dias?',
  'Onde estou a perder dinheiro?',
  'Qual cliente é mais rentável?',
]

export type MarginPoint = { month: string; value: number; label: string }

/** Degradação de margem ao longo de quatro meses. */
export const marginTimeline: MarginPoint[] = [
  { month: 'Jan', value: 37, label: '37%' },
  { month: 'Fev', value: 35, label: '35%' },
  { month: 'Mar', value: 31, label: '31%' },
  { month: 'Abr', value: 27, label: '27%' },
]

/** Índices da timeline: onde o problema começa e onde costuma ser notado. */
export const problemStartIndex = 1
export const discoveryIndex = 3

export const hubInputs = [
  { label: 'Banco', icon: 'bank' as const },
  { label: 'ERP', icon: 'erp' as const },
  { label: 'Folha de cálculo', icon: 'sheet' as const },
  { label: 'Faturação', icon: 'invoice' as const },
  { label: 'Contabilidade', icon: 'accounting' as const },
]

export const hubOutputs = [
  { label: 'Análise', icon: 'analysis' as const },
  { label: 'Previsão', icon: 'forecast' as const },
  { label: 'Alerta', icon: 'alert' as const },
  { label: 'Decisão', icon: 'decision' as const },
]

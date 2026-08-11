/**
 * Conteúdo da terceira secção — a solução.
 *
 * REPRESENTAÇÃO CONCEPTUAL. Nada aqui descreve integrações já disponíveis.
 * A linguagem é deliberadamente condicional ("podem alimentar", "foi pensada
 * para"), porque a plataforma ainda não liga automaticamente a bancos, ERPs
 * ou softwares de contabilidade. Nenhuma marca real é referida.
 *
 * Os valores são coerentes com os do dashboard demonstrativo da Hero, mas não
 * pertencem a nenhuma empresa real e não devem ser usados como prova.
 */

export type SolutionStepId = 'conectar' | 'organizar' | 'interpretar' | 'decidir'

export type SolutionStep = {
  id: SolutionStepId
  number: string
  label: string
  headline: string
  text: string
}

export const solutionSteps: SolutionStep[] = [
  {
    id: 'conectar',
    number: '01',
    label: 'Conectar',
    headline: 'Ligue os sistemas que a sua empresa já utiliza.',
    text: 'Bancos, faturação, ERP, contabilidade e folhas de cálculo podem alimentar uma única visão financeira.',
  },
  {
    id: 'organizar',
    number: '02',
    label: 'Organizar',
    headline: 'Dados diferentes. Uma única visão financeira.',
    text: 'A Finer One estrutura a informação e transforma fontes dispersas numa visão consistente da empresa.',
  },
  {
    id: 'interpretar',
    number: '03',
    label: 'Interpretar',
    headline: 'Os números começam a explicar o negócio.',
    text: 'A plataforma identifica alterações, padrões, riscos e oportunidades que seriam difíceis de perceber apenas através de relatórios.',
  },
  {
    id: 'decidir',
    number: '04',
    label: 'Decidir',
    headline: 'Da análise à ação.',
    text: 'Alertas, previsões e respostas claras ajudam o empresário a decidir com mais informação e menos incerteza.',
  },
]

/** 01 — fontes de dados, por tipo de sistema e nunca por marca. */
export const connectSources = [
  { label: 'Banco', detail: 'Saldos e movimentos', icon: 'bank' as const },
  { label: 'Faturação', detail: 'Documentos emitidos', icon: 'invoice' as const },
  { label: 'ERP', detail: 'Clientes e encomendas', icon: 'erp' as const },
  { label: 'Contabilidade', detail: 'Custos e classificações', icon: 'accounting' as const },
  { label: 'Folha de cálculo', detail: 'Mapas internos', icon: 'sheet' as const },
]

/** 02 — as três figuras que abrem a visão consolidada. */
export const organizeFigures = [
  { label: 'Receitas', value: '€327.420' },
  { label: 'Despesas', value: '€211.870' },
  { label: 'Margem', value: '35,3%' },
]

/** 02 — linhas secundárias da mesma visão. */
export const organizeRows = [
  { label: 'Tesouraria', value: '€148.920' },
  { label: 'Clientes', value: '128' },
]

export type InterpretationTone = 'neutral' | 'forecast' | 'risk'

/** 03 — cada linha liga um número ao seu significado. */
export const interpretations: {
  figure: string
  kind: string
  meaning: string
  tone: InterpretationTone
}[] = [
  { figure: '-7,8%', kind: 'Variação', meaning: 'Margem operacional em queda', tone: 'risk' },
  { figure: '+12%', kind: 'Custos', meaning: 'Custos operacionais a crescer', tone: 'neutral' },
  {
    figure: '27%',
    kind: 'Concentração',
    meaning: 'Contas em atraso concentradas num só cliente',
    tone: 'neutral',
  },
  {
    figure: '€184.200',
    kind: 'Previsão',
    meaning: 'Tesouraria projetada para 30 dias',
    tone: 'forecast',
  },
  { figure: '45 dias', kind: 'Risco', meaning: 'Pressão de caixa a aproximar-se', tone: 'risk' },
]

/** 04 — a decisão. */
export const decision = {
  question: 'Posso contratar mais uma pessoa?',
  answer:
    'Com base na margem atual e na previsão de tesouraria, a contratação é viável, mas reduzirá a folga financeira nos próximos 60 dias.',
  recommendationLabel: 'Prioridade recomendada',
  recommendation: 'Rever os custos operacionais antes de aumentar despesas fixas.',
}

/**
 * Camada de sinal da coluna esquerda.
 *
 * Microinformação editorial ligada a cada etapa — não são cards nem um
 * segundo dashboard. Cada variante tem uma forma própria para a coluna não
 * se ler como quatro blocos iguais.
 */
export type StepSignal =
  | { kind: 'tags'; items: string[] }
  | { kind: 'flow'; from: string; to: string }
  | { kind: 'metrics'; items: { text: string; tone: InterpretationTone }[] }
  | { kind: 'question'; question: string; reasoning: string }

export const stepSignals: Record<SolutionStepId, StepSignal> = {
  conectar: {
    kind: 'tags',
    items: ['Banco', 'ERP', 'Faturação', 'Folha de cálculo', 'Contabilidade'],
  },
  organizar: {
    kind: 'flow',
    from: '5 fontes',
    to: '1 visão financeira',
  },
  interpretar: {
    kind: 'metrics',
    items: [
      { text: 'Margem ↓ 7,8%', tone: 'risk' },
      { text: 'Tesouraria €184.200', tone: 'forecast' },
      { text: 'Risco detetado', tone: 'risk' },
    ],
  },
  decidir: {
    kind: 'question',
    question: 'Posso contratar?',
    reasoning: 'Margem + previsão de tesouraria → decisão',
  },
}

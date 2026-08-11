import { formatEuro } from '@/lib/format'

/**
 * Conteúdo da secção de impacto — Interactive Financial Case Explorer.
 *
 * TUDO NESTE FICHEIRO É DEMONSTRAÇÃO CONCEPTUAL.
 *
 * Nenhum número corresponde a uma empresa real e nenhum caso corresponde a um
 * cliente. As leituras e recomendações ilustram o TIPO de resposta que a
 * plataforma se propõe dar — não são aconselhamento financeiro nem promessas
 * de resultado.
 *
 * REGRAS SEGUIDAS:
 * - nenhuma poupança concreta é prometida ("reduza X€", "poupe Y%");
 * - nenhuma data de rutura de tesouraria é afirmada;
 * - nenhum cliente, fornecedor ou setor real é nomeado;
 * - as prioridades do caso 4 são apresentadas como sugeridas, nunca como
 *   decisão fechada;
 * - o limiar de atenção do caso 2 é explicitamente rotulado como
 *   demonstrativo, para não parecer um critério fechado do produto.
 *
 * ESTRUTURA: os quatro casos partilham a mesma espinha — pergunta, dados, o
 * que os dados mostram, leitura, recomendação — e diferem apenas no bloco de
 * dados. Daí a união discriminada por `id`: cada caso traz só o payload que o
 * seu visual sabe desenhar, e o TypeScript impede que um visual seja ligado
 * ao caso errado.
 */

export type ImpactCaseId = 'custos' | 'tesouraria' | 'clientes' | 'prioridades'

export type CostRow = {
  label: string
  amount: number
  /** Categoria assinalada como estando a pressionar a margem. */
  pressure: boolean
}

export type CashPoint = {
  label: string
  amount: number
  /** Ponto abaixo do limiar de atenção demonstrativo. */
  warning: boolean
}

export type ClientRow = { label: string; amount: number; days: number }

export type PriorityLevel = 'Alta' | 'Média' | 'Baixa'
export type PriorityGroup = { level: PriorityLevel; actions: string[] }

type CaseBase = {
  id: ImpactCaseId
  /** Ordinal apresentado no seletor e no cabeçalho do painel. */
  index: string
  /** Rótulo curto do seletor. A pergunta completa vive no painel. */
  tab: string
  question: string
  /** Rótulo do bloco de dados. */
  caption: string
  metric: { value: string; label: string }
  /** Métricas de apoio, para leitura rápida. */
  chips: string[]
  /** Descrição factual do que está no visual. Não interpreta. */
  evidence: string
  /** Interpretação Finer One. */
  reading: string
  recommendationLabel: string
  recommendation: string
}

export type ImpactCase =
  | (CaseBase & { id: 'custos'; rows: CostRow[] })
  | (CaseBase & {
      id: 'tesouraria'
      points: CashPoint[]
      threshold: number
      thresholdLabel: string
      zone: string
    })
  | (CaseBase & {
      id: 'clientes'
      total: number
      concentration: number
      othersLabel: string
      rows: ClientRow[]
    })
  | (CaseBase & { id: 'prioridades'; groups: PriorityGroup[] })

export const impactCopy = {
  kicker: 'Respostas',
  headlineFirst: 'Respostas que geram impacto.',
  headlineSecond: 'Recomendações que melhoram decisões.',
  subheadline:
    'A Finer One transforma informação financeira em diagnósticos claros e recomendações práticas para apoiar decisões mais informadas.',
  hint: 'Escolha uma pergunta para abrir o caso completo.',
  disclaimer:
    'Os casos, valores e recomendações apresentados nesta secção são demonstrativos e servem para ilustrar o tipo de resposta que a Finer One pretende oferecer.',
  signature: ['Menos incerteza.', 'Mais contexto.', 'Melhores decisões.'],
}

const costRows: CostRow[] = [
  { label: 'Logística e distribuição', amount: 48200, pressure: true },
  { label: 'Estrutura administrativa', amount: 31500, pressure: true },
  { label: 'Fornecimentos', amount: 44270, pressure: false },
  { label: 'Serviços externos', amount: 18900, pressure: false },
]

/** €142.870 — total das categorias analisadas. */
const costTotal = costRows.reduce((sum, row) => sum + row.amount, 0)

const clientRows: ClientRow[] = [
  { label: 'Cliente B', amount: 14800, days: 42 },
  { label: 'Cliente E', amount: 6200, days: 28 },
  { label: 'Cliente H', amount: 2500, days: 19 },
]

/** €23.500 — parcela distribuída pelos três clientes listados. */
const clientTopAmount = clientRows.reduce((sum, row) => sum + row.amount, 0)

export const impactCases: ImpactCase[] = [
  {
    id: 'custos',
    index: '01',
    tab: 'Custos e margem',
    question: 'Onde estou a perder dinheiro?',
    caption: 'Peso na estrutura de custos',
    metric: { value: formatEuro(costTotal), label: 'Custos analisados no período' },
    chips: ['4 categorias', '2 assinaladas sob pressão'],
    evidence: `As quatro categorias analisadas somam ${formatEuro(costTotal)} no período. Logística e distribuição concentram o maior valor isolado.`,
    reading: 'Os custos logísticos e administrativos estão a pressionar a margem.',
    recommendationLabel: 'Próximo passo sugerido',
    recommendation: 'Rever contratos, subcontratações e processos com maior impacto nos custos.',
    rows: costRows,
  },
  {
    id: 'tesouraria',
    index: '02',
    tab: 'Tesouraria',
    question: 'Vou ter pressão de tesouraria?',
    caption: 'Projeção de folga de tesouraria',
    metric: { value: formatEuro(148920), label: 'Folga de tesouraria hoje' },
    chips: [`${formatEuro(54700)} a 90 dias`, 'Abaixo do limiar aos 60 dias'],
    evidence: `A folga projetada desce de ${formatEuro(148920)} para ${formatEuro(54700)} no horizonte de 90 dias e cruza o limiar de atenção entre os 30 e os 60 dias.`,
    reading:
      'A tesouraria permanece estável no curto prazo, mas a folga financeira reduz-se significativamente no horizonte projetado.',
    recommendationLabel: 'Ações a considerar',
    recommendation:
      'Antecipar recebimentos, rever pagamentos e adiar compromissos não essenciais, se necessário.',
    points: [
      { label: 'Hoje', amount: 148920, warning: false },
      { label: '30 dias', amount: 121400, warning: false },
      { label: '60 dias', amount: 86300, warning: true },
      { label: '90 dias', amount: 54700, warning: true },
    ],
    threshold: 90000,
    thresholdLabel: 'Limiar de atenção (demonstrativo)',
    zone: 'Zona de atenção a partir dos 60 dias',
  },
  {
    id: 'clientes',
    index: '03',
    tab: 'Clientes',
    question: 'Que clientes estão a afetar os resultados?',
    caption: 'Recebimentos em atraso',
    metric: { value: formatEuro(34600), label: 'Recebimentos em atraso' },
    chips: ['68% em três clientes', 'Até 42 dias de atraso'],
    evidence: `Dos ${formatEuro(34600)} em atraso, ${formatEuro(clientTopAmount)} estão distribuídos por três clientes.`,
    reading:
      'Uma parte relevante dos recebimentos em atraso está concentrada em poucos clientes.',
    recommendationLabel: 'Próximo passo sugerido',
    recommendation:
      'Priorizar o acompanhamento dos maiores valores em atraso e rever condições comerciais quando necessário.',
    total: 34600,
    concentration: 68,
    othersLabel: 'Restantes clientes',
    rows: clientRows,
  },
  {
    id: 'prioridades',
    index: '04',
    tab: 'Prioridades',
    question: 'O que devo fazer agora?',
    caption: 'Prioridade sugerida',
    metric: { value: '5', label: 'Ações sugeridas' },
    chips: ['3 níveis de prioridade', '2 em prioridade alta'],
    evidence:
      'Cinco ações agrupadas em três níveis, apresentadas por ordem de urgência da leitura.',
    reading:
      'As ações são ordenadas pelo impacto financeiro estimado e pela urgência da leitura.',
    recommendationLabel: 'Nota',
    recommendation:
      'Prioridade sugerida — leitura demonstrativa, não aconselhamento financeiro.',
    groups: [
      { level: 'Alta', actions: ['Rever estrutura de custos', 'Acompanhar clientes críticos'] },
      {
        level: 'Média',
        actions: ['Rever pricing e mix de vendas', 'Adiar investimento não essencial'],
      },
      { level: 'Baixa', actions: ['Rever política de crédito'] },
    ],
  },
]

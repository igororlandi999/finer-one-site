/**
 * Configuração dos planos — fonte única de verdade da fase 8.
 *
 * PREÇOS AINDA NÃO DEFINIDOS. Nenhum valor é apresentado. Quando existirem
 * valores oficiais, basta preencher `price` de cada plano e a secção passa a
 * mostrá-los sem alterar um único componente.
 *
 * FATURAÇÃO ANUAL: não existe política definida, por isso não há alternador
 * mensal/anual nem qualquer menção a desconto.
 *
 * DISPONIBILIDADE: apenas o Plus está disponível. Pro e Team continuam no
 * site para mostrar a evolução do produto, mas são apresentados como
 * "Disponível brevemente" e não têm ação de compra. Ver `available`.
 *
 * ORIGEM DO CONTEÚDO: as áreas do Plus são exatamente as do MVP e coincidem
 * com as abas do dashboard demonstrativo da Hero (ver
 * src/data/demoDashboard.ts). Pro acrescenta Planeamento e Indicadores; Team
 * acrescenta Benchmarking do setor e Avaliação. Nada além disto foi
 * acrescentado.
 *
 * LIMITES: Alertas e Chat Financeiro são limitados no Plus e ilimitados no
 * Pro e no Team. Nenhum número concreto de limite é indicado porque nenhum
 * está definido.
 */

export type PlanId = 'plus' | 'pro' | 'team'

/** Cada capacidade é um par verbo/entrega, não um item de checklist. */
export type Capability = { group: string; label: string }

export type Plan = {
  id: PlanId
  name: string
  /** Frase de transformação — o que o plano muda para a empresa. */
  promise: string
  description: string
  /** null enquanto não existir valor oficial. */
  price: string | null
  period: string
  /** Mostrado no lugar do valor enquanto `price` for null. */
  priceNote: string
  /** false = sem ação de compra; o card mostra `statusLabel` no lugar do CTA. */
  available: boolean
  /** Etiqueta de disponibilidade, no topo do card. */
  statusLabel: string
  /** Só é usado quando `available` é true. */
  cta: string
  /** Herança do plano anterior, quando aplicável. */
  inherits: string | null
  capabilities: Capability[]
  /** Linha final compacta, para não engordar a lista de capacidades. */
  footnote: string | null
}

/**
 * O plano em destaque é o que a empresa pode efetivamente contratar hoje.
 * Destacar um plano indisponível levaria o visitante a um beco sem saída.
 */
export const recommendedPlan: PlanId = 'plus'

export const plans: Plan[] = [
  {
    id: 'plus',
    name: 'Plus',
    promise: 'Perceber o que está a acontecer.',
    description:
      'Clareza financeira para acompanhar a operação e compreender melhor o desempenho da empresa.',
    price: null,
    period: 'por mês',
    priceNote: 'Preço a definir',
    available: true,
    statusLabel: 'Disponível',
    cta: 'Começar Agora',
    inherits: null,
    capabilities: [
      { group: 'Visão', label: 'Resumo financeiro' },
      { group: 'Estado', label: 'Diagnóstico Financeiro' },
      { group: 'Acompanhamento', label: 'Receitas e Despesas' },
      { group: 'Relações', label: 'Clientes e Fornecedores' },
      { group: 'Suporte', label: 'Documentos' },
      { group: 'Performance', label: 'Performance Financeira' },
      { group: 'Inteligência', label: 'Alertas limitados e Chat Financeiro limitado' },
    ],
    footnote: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    promise: 'Perceber o que está a acontecer — e o que pode acontecer a seguir.',
    description:
      'Mais profundidade para empresas que querem antecipar cenários e decidir com maior contexto financeiro.',
    price: null,
    period: 'por mês',
    priceNote: 'Preço a definir',
    available: false,
    statusLabel: 'Brevemente',
    cta: '',
    inherits: 'Tudo do Plus',
    capabilities: [
      { group: 'Antecipar', label: 'Planeamento' },
      { group: 'Interpretar', label: 'Indicadores' },
      { group: 'Agir mais cedo', label: 'Alertas ilimitados' },
      { group: 'Perguntar', label: 'Chat Financeiro ilimitado' },
    ],
    footnote: null,
  },
  {
    id: 'team',
    name: 'Team',
    promise: 'Comparar o desempenho da empresa com o setor.',
    description:
      'Para empresas que querem situar os seus números face ao mercado e acompanhar a evolução do valor do negócio.',
    price: null,
    period: 'por mês',
    priceNote: 'Preço a definir',
    available: false,
    statusLabel: 'Brevemente',
    cta: '',
    inherits: 'Tudo do Pro',
    capabilities: [
      { group: 'Comparar', label: 'Benchmarking do setor' },
      { group: 'Avaliar', label: 'Avaliação' },
      { group: 'Agir mais cedo', label: 'Alertas ilimitados' },
      { group: 'Perguntar', label: 'Chat Financeiro ilimitado' },
    ],
    footnote: null,
  },
]

/**
 * Matriz de comparação — apenas diferenças que importam à decisão.
 *
 * `true` inclui, `false` não inclui, e uma string qualifica o nível quando a
 * capacidade existe nos três planos mas com profundidade diferente.
 */
export type FeatureValue = boolean | string

export type ComparisonGroup = {
  title: string
  rows: { label: string; values: Record<PlanId, FeatureValue> }[]
}

const all = (value: FeatureValue = true): Record<PlanId, FeatureValue> => ({
  plus: value,
  pro: value,
  team: value,
})

const proAndTeam: Record<PlanId, FeatureValue> = { plus: false, pro: true, team: true }
const teamOnly: Record<PlanId, FeatureValue> = { plus: false, pro: false, team: true }

export const comparison: ComparisonGroup[] = [
  {
    title: 'Visão financeira',
    rows: [
      { label: 'Resumo', values: all() },
      { label: 'Receitas', values: all() },
      { label: 'Despesas', values: all() },
      { label: 'Documentos', values: all() },
    ],
  },
  {
    title: 'Análise',
    rows: [
      { label: 'Diagnóstico Financeiro', values: all() },
      { label: 'Performance Financeira', values: all() },
      { label: 'Clientes e Fornecedores', values: all() },
    ],
  },
  {
    title: 'Planeamento',
    rows: [
      { label: 'Planeamento', values: proAndTeam },
      { label: 'Indicadores', values: proAndTeam },
    ],
  },
  {
    title: 'Setor',
    rows: [
      { label: 'Benchmarking do setor', values: teamOnly },
      { label: 'Avaliação', values: teamOnly },
    ],
  },
  {
    title: 'Inteligência',
    rows: [
      { label: 'Alertas', values: { plus: 'Limitados', pro: 'Ilimitados', team: 'Ilimitados' } },
      {
        label: 'Chat Financeiro',
        values: { plus: 'Limitado', pro: 'Ilimitado', team: 'Ilimitado' },
      },
    ],
  },
]

export const pricingCopy = {
  headline: 'Escolha o nível de inteligência que a sua empresa precisa.',
  subheadline:
    'Comece com o essencial e evolua à medida que a gestão financeira da sua empresa se torna mais exigente.',
  unavailableLabel: 'Disponível brevemente',
  comparisonTitle: 'Compare os planos',
  openComparison: 'Ver comparação completa',
  closeComparison: 'Fechar comparação',
  note: 'O plano Plus está disponível. Pro e Team serão disponibilizados brevemente. Os valores de cada plano serão anunciados.',
}

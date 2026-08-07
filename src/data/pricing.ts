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
 * ORIGEM DO CONTEÚDO: as capacidades correspondem aos módulos que o site já
 * apresenta (Resumo, Receitas, Despesas, Clientes e Fornecedores, Documentos,
 * Diagnóstico, Performance, Alertas, Planeamento e Cashflow, Indicadores,
 * Chat Financeiro) e à distribuição por plano indicada pelo responsável do
 * produto.
 *
 * A CONFIRMAR ANTES DE PUBLICAR: as capacidades de Team ("utilização em
 * equipa", "maior profundidade de análise") vieram do briefing estratégico e
 * não de uma especificação do produto. Benchmarking de setor e avaliação NÃO
 * foram incluídos por não estarem definidos em lado nenhum.
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
  cta: string
  /** Herança do plano anterior, quando aplicável. */
  inherits: string | null
  capabilities: Capability[]
  /** Linha final compacta, para não engordar a lista de capacidades. */
  footnote: string | null
}

export const recommendedPlan: PlanId = 'pro'

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
    cta: 'Começar com Plus',
    inherits: null,
    capabilities: [
      { group: 'Visão', label: 'Resumo financeiro' },
      { group: 'Acompanhamento', label: 'Receitas e despesas' },
      { group: 'Relações', label: 'Clientes e fornecedores' },
      { group: 'Performance', label: 'Performance financeira' },
      { group: 'Inteligência', label: 'Alertas essenciais e Chat Financeiro' },
    ],
    footnote: 'Inclui também Documentos e Diagnóstico Financeiro',
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
    cta: 'Experimentar Pro',
    inherits: 'Tudo do Plus',
    capabilities: [
      { group: 'Perceber', label: 'Performance financeira' },
      { group: 'Antecipar', label: 'Planeamento e Cashflow' },
      { group: 'Interpretar', label: 'Indicadores e inteligência financeira' },
      { group: 'Agir mais cedo', label: 'Alertas mais avançados' },
      { group: 'Perguntar', label: 'Chat Financeiro mais completo' },
    ],
    footnote: null,
  },
  {
    id: 'team',
    name: 'Team',
    promise: 'Transformar inteligência financeira numa capacidade da equipa.',
    description:
      'Para empresas que precisam de maior profundidade de análise e utilização colaborativa da informação financeira.',
    price: null,
    period: 'por mês',
    priceNote: 'Preço a definir',
    cta: 'Falar connosco',
    inherits: 'Todas as capacidades Pro',
    capabilities: [
      { group: 'Colaboração', label: 'Utilização em equipa' },
      { group: 'Análise', label: 'Maior profundidade de análise' },
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
    title: 'Performance',
    rows: [
      { label: 'Performance Financeira', values: all() },
      { label: 'Diagnóstico Financeiro', values: all() },
      { label: 'Clientes e Fornecedores', values: all() },
    ],
  },
  {
    title: 'Planeamento',
    rows: [
      { label: 'Planeamento e Cashflow', values: proAndTeam },
      { label: 'Indicadores financeiros', values: proAndTeam },
    ],
  },
  {
    title: 'Inteligência',
    rows: [
      { label: 'Alertas', values: { plus: 'Essenciais', pro: 'Avançados', team: 'Avançados' } },
      { label: 'Chat Financeiro', values: { plus: 'Essencial', pro: 'Completo', team: 'Completo' } },
    ],
  },
  {
    title: 'Colaboração',
    rows: [
      { label: 'Utilização em equipa', values: teamOnly },
      { label: 'Maior profundidade de análise', values: teamOnly },
    ],
  },
]

export const pricingCopy = {
  headline: 'Escolha o nível de inteligência que a sua empresa precisa.',
  subheadline:
    'Comece com o essencial e evolua à medida que a gestão financeira da sua empresa se torna mais exigente.',
  recommendedLabel: 'Recomendado',
  comparisonTitle: 'Compare os planos',
  openComparison: 'Ver comparação completa',
  closeComparison: 'Fechar comparação',
  note: 'Os valores dos planos serão anunciados. As capacidades indicadas descrevem a distribuição prevista por plano.',
}

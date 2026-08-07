/**
 * Conteúdo da quinta secção — decisões.
 *
 * TODOS OS NÚMEROS SÃO MOCK DATA. Não pertencem a nenhuma empresa real, não
 * vêm de nenhuma integração e não representam resultados obtidos.
 *
 * Esta secção demonstra o TIPO de leitura financeira que a Finer One
 * pretende oferecer. As interpretações são exemplos escritos à mão, não
 * saídas de nenhum motor de análise, scoring ou modelo probabilístico. Ao
 * editar este ficheiro, manter a linguagem descritiva e sem promessas:
 * descrever o que os números mostram, nunca afirmar uma recomendação
 * financeira absoluta.
 *
 * Alguns valores são derivados por aritmética simples a partir dos valores
 * base (está assinalado onde acontece). Nada aqui é estimado ou inferido.
 */

export type DecisionId = 'contratar' | 'investir' | 'margem' | 'tesouraria' | 'clientes'

export type Decision = {
  id: DecisionId
  /** Ordinal mostrado no topo do card. */
  ordinal: string
  question: string
  context: string
  /** Leitura demonstrativa. Descritiva, nunca prescritiva. */
  insight: string
  /** Elemento visual de demonstração. Não navega. */
  cta?: string
}

export const decisions: Decision[] = [
  {
    id: 'contratar',
    ordinal: '01',
    question: 'Posso contratar mais uma pessoa?',
    context:
      'Antes de aumentar custos fixos, perceba o impacto na margem e na tesouraria.',
    insight:
      'Com base na margem atual e na previsão de tesouraria, a contratação é financeiramente viável, mas reduz a folga financeira prevista para os próximos 60 dias.',
    cta: 'Ver fatores considerados',
  },
  {
    id: 'investir',
    ordinal: '02',
    question: 'Tenho margem para investir agora?',
    context:
      'Veja o impacto de uma decisão de investimento antes de comprometer a liquidez da empresa.',
    insight:
      'O investimento mantém uma posição de tesouraria positiva no cenário base, mas reduz a margem de segurança financeira nos próximos 90 dias.',
  },
  {
    id: 'margem',
    ordinal: '03',
    question: 'Porque caiu a minha margem?',
    context:
      'Perceba onde a margem se perdeu antes de decidir preços, custos ou fornecedores.',
    insight:
      'A redução de margem está concentrada no aumento dos custos operacionais, especialmente logística e fornecedores.',
  },
  {
    id: 'tesouraria',
    ordinal: '04',
    question: 'Vou ter pressão de tesouraria?',
    context:
      'Antecipe períodos de menor folga antes de a falta de liquidez se tornar urgente.',
    insight:
      'A tesouraria permanece confortável no curto prazo, mas a folga financeira diminui significativamente no horizonte de 90 dias.',
  },
  {
    id: 'clientes',
    ordinal: '05',
    question: 'Estou demasiado dependente de poucos clientes?',
    context: 'Perceba quanto do negócio depende dos seus maiores clientes.',
    insight:
      'Os cinco maiores clientes representam 47% das receitas analisadas. Uma alteração significativa num destes clientes terá impacto relevante na faturação.',
  },
]

/* ---------------------------------------------------------------- 01 */

export const hiringMetrics = [
  { label: 'Margem atual', value: '35,3%', variable: false },
  { label: 'Tesouraria', value: '€148.920', variable: false },
  { label: 'Previsão a 60 dias', value: '€162.800', variable: false },
  { label: 'Novo custo fixo', value: '+€4.200/mês', variable: true },
]

/**
 * Peso do novo custo fixo dentro da previsão a 60 dias.
 * Aritmética direta: 4.200 × 2 = 8.400; 8.400 / 162.800 = 5,2%.
 */
export const hiringImpact = {
  baseLabel: 'Previsão a 60 dias',
  baseValue: '€162.800',
  costLabel: 'Custo acumulado a 60 dias',
  costValue: '€8.400',
  share: 5.2,
  note: '5,2% da previsão a 60 dias',
}

/* ---------------------------------------------------------------- 02 */

/**
 * Cenários de liquidez. O valor pós-investimento é aritmética direta:
 * 148.920 − 45.000 = 103.920.
 */
export const investmentScenarios = [
  { label: 'Caixa disponível', value: '€148.920', share: 100, highlight: false },
  { label: 'Liquidez após investimento', value: '€103.920', share: 69.8, highlight: true },
]

export const investmentFigures = [
  { label: 'Investimento considerado', value: '€45.000' },
  { label: 'Cashflow previsto 90 dias', value: '€126.400' },
]

export const investmentLeverage = {
  label: 'Endividamento',
  value: '28%',
  share: 28,
}

/* ---------------------------------------------------------------- 03 */

/** Margem por mês. `share` é a posição no eixo (30%–38%), já normalizada. */
export const marginSeries = [
  { month: 'Jan', value: '37,4%', share: 92.5 },
  { month: 'Mar', value: '35,8%', share: 72.5 },
  { month: 'Mai', value: '33,9%', share: 48.8 },
  { month: 'Jul', value: '31,7%', share: 21.3 },
]

/** `share` é o peso relativo ao maior fator, só para desenhar a barra. */
export const marginFactors = [
  { label: 'Custos logísticos', value: '+14%', share: 100, adverse: true },
  { label: 'Fornecedores', value: '+9%', share: 64, adverse: true },
  { label: 'Preço médio', value: '+1%', share: 7, adverse: false },
]

/* ---------------------------------------------------------------- 04 */

/** `share` é a altura relativa ao valor mais alto do horizonte (€184.200). */
export const treasuryHorizon = [
  { label: 'Hoje', value: '€148.920', share: 81, tight: false },
  { label: '30 dias', value: '€184.200', share: 100, tight: false },
  { label: '60 dias', value: '€162.800', share: 88, tight: false },
  { label: '90 dias', value: '€91.400', share: 50, tight: true },
]

export const treasuryNote = 'Zona de menor folga'

/* ---------------------------------------------------------------- 05 */

/**
 * Composição da faturação analisada. Os três segmentos somam 100%:
 * o maior cliente (18%), os restantes quatro do top 5 (29%) e todos os
 * outros clientes (53%).
 */
export const concentrationBands = [
  { label: 'Maior cliente', share: 18, tone: 'primary' as const },
  { label: '2.º ao 5.º cliente', share: 29, tone: 'secondary' as const },
  { label: 'Restantes clientes', share: 53, tone: 'rest' as const },
]

export const concentrationFigures = [
  { label: 'Maior cliente', value: '18%' },
  { label: 'Top 5 clientes', value: '47%' },
  { label: 'Restantes clientes', value: '53%' },
]

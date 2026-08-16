/**
 * DADOS DEMONSTRATIVOS.
 *
 * Nada neste ficheiro corresponde a uma empresa real, a um cliente real ou a
 * dados obtidos de qualquer integração. Existe apenas para dar vida à
 * representação do produto na Hero do site institucional.
 *
 * Nenhuma destas métricas deve ser reutilizada como prova, referência
 * comercial ou benchmark.
 *
 * BILINGUE: cada exportação de conteúdo textual vive num hook
 * (useDemoDashboardData) que devolve a fatia PT ou EN conforme o idioma
 * ativo (ver src/i18n/LanguageContext.tsx). Os valores numéricos são
 * partilhados entre os dois idiomas — só o texto à volta muda — para nunca
 * haver dois números diferentes para a mesma métrica consoante o idioma.
 */

import { formatEuro, formatPercent } from '@/lib/format'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'

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

export type DashboardTabId = 'resumo' | 'diagnostico' | 'performance' | 'alertas' | 'chat'

export type DashboardTab = {
  id: DashboardTabId
  label: string
  /** Rótulo curto para a barra superior e para o strip em ecrãs estreitos. */
  short: string
}

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

/** Trecho de texto que pode ser destacado — usado para números financeiros em prosa. */
export type TextPart = { text: string; highlight?: boolean }

export type DiagnosticProblem = {
  title: string
  description: TextPart[]
}

/**
 * Rubrica com valor do período atual e do período anterior. É a única forma
 * como a Performance Financeira guarda números — nunca uma percentagem ou
 * variação pré-calculada solta, para as três tabelas, os KPIs e a análise
 * lerem sempre o mesmo valor de origem (ver derivePerformanceMetrics.ts).
 */
export type FinancialLineItem = {
  label: string
  current: number
  previous: number
}

export type AlertSeverity = 'critical' | 'warning' | 'info'

export type FinancialAlert = {
  id: string
  severity: AlertSeverity
  category: string
  title: string
  description: string
  impact: string
  recommendation: string
  metricValue: string
  updatedLabel: string
  /** Só usado para a ordenação "Maior impacto" — nunca mostrado na UI. */
  impactMagnitude: number
  /** Só usado para a ordenação "Mais recentes" — menor valor é mais recente. */
  recencyRank: number
}

export type ChatSuggestionId = 'pmr' | 'risco' | 'tesouraria' | 'margem' | 'prioridades'

export type ChatSuggestion = {
  id: ChatSuggestionId
  question: string
}

export type ChatInsightTone = 'good' | 'attention'

export type ChatInsight = {
  label: string
  tone: ChatInsightTone
}

export type ChatQuickActionId = 'saude' | 'resultado' | 'clientes-risco' | 'fornecedores' | 'prioridades'

export type ChatQuickAction = {
  id: ChatQuickActionId
  title: string
  subtitle: string
  question: string
}

/* ------------------------------------------------------------------ *
 * Valores numéricos partilhados entre PT e EN — só o texto muda.      *
 * ------------------------------------------------------------------ */

const kpiRaw = {
  receitas: { value: 327_420, delta: 8.2 },
  despesas: { value: 211_870, delta: -3.1 },
  margem: { value: 35.3, delta: -7.8 },
  tesouraria: { value: 148_920 },
}

const forecastValue = 184_200

export type DemoDashboardContent = {
  demoKpis: Kpi[]
  demoCashflow: CashflowPoint[]
  demoInsight: { title: string; description: string; action: string }
  demoForecast: { label: string; value: number; caption: string }
  demoChat: { question: string; answer: string }
  dashboardTabs: DashboardTab[]
  demoDiagnostic: { score: number; state: string; metrics: DemoRow[] }
  demoDiagnosticSummary: TextPart[]
  demoDiagnosticProblems: DiagnosticProblem[]
  demoDiagnosticAction: { title: string; description: TextPart[]; cta: string }
  demoPnl: FinancialLineItem[]
  demoBalance: FinancialLineItem[]
  demoCashflowStatement: FinancialLineItem[]
  demoAlerts: FinancialAlert[]
  demoChatSuggestions: ChatSuggestion[]
  demoChatAnswer: {
    question: string
    time: string
    conclusion: string
    impact: string
    recommendation: string
    application: string
  }
  demoChatInsights: ChatInsight[]
  demoChatQuickActions: ChatQuickAction[]
}

function buildContent(lang: Lang): DemoDashboardContent {
  const pt = lang === 'pt'

  const demoKpis: Kpi[] = [
    { id: 'receitas', label: pt ? 'Receitas' : 'Revenue', value: kpiRaw.receitas.value, unit: 'eur', delta: kpiRaw.receitas.delta, tone: 'good' },
    { id: 'despesas', label: pt ? 'Despesas' : 'Expenses', value: kpiRaw.despesas.value, unit: 'eur', delta: kpiRaw.despesas.delta, tone: 'good' },
    { id: 'margem', label: pt ? 'Margem' : 'Margin', value: kpiRaw.margem.value, unit: 'pct', delta: kpiRaw.margem.delta, tone: 'bad' },
    { id: 'tesouraria', label: pt ? 'Tesouraria' : 'Cash', value: kpiRaw.tesouraria.value, unit: 'eur', caption: pt ? 'Saldo atual' : 'Current balance' },
  ]

  const monthShort = pt
    ? ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out']
    : ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
  const monthYear = ['2025', '2025', '2025', '2026', '2026', '2026', '2026', '2026', '2026', '2026', '2026', '2026', '2026']
  const cashflowValues = [96_400, 104_200, 98_750, 112_300, 121_800, 116_400, 128_900, 137_500, 141_200, 148_920, 184_200, 176_800, 191_500]
  const cashflowForecast = [false, false, false, false, false, false, false, false, false, false, true, true, true]

  const demoCashflow: CashflowPoint[] = monthShort.map((short, index) => ({
    short,
    label: `${short} ${monthYear[index]}`,
    value: cashflowValues[index],
    forecast: cashflowForecast[index],
  }))

  const demoInsight = pt
    ? {
        title: 'Margem operacional caiu 7,8%',
        description:
          'O principal impacto está no aumento dos custos operacionais, com destaque para manutenção e reparações.',
        action: 'Ver análise',
      }
    : {
        title: 'Operating margin dropped 7.8%',
        description:
          'The main driver is higher operating costs, especially maintenance and repairs.',
        action: 'View analysis',
      }

  const demoForecast = {
    label: pt ? 'Previsão de tesouraria' : 'Cash forecast',
    value: forecastValue,
    caption: pt ? 'Próximos 30 dias' : 'Next 30 days',
  }

  const demoChat = pt
    ? {
        question: 'Onde estou a perder dinheiro?',
        answer:
          'A principal pressão está nos custos operacionais. Conservação e reparações aumentaram €18.400 e publicidade e propaganda €6.200 face à média dos últimos meses. Em conjunto explicam grande parte da redução da margem operacional.',
      }
    : {
        question: 'Where am I losing money?',
        answer:
          'The main pressure is on operating costs. Maintenance and repairs rose €18,400 and advertising rose €6,200 versus the recent monthly average. Together they explain most of the drop in operating margin.',
      }

  const dashboardTabs: DashboardTab[] = pt
    ? [
        { id: 'resumo', label: 'Resumo', short: 'Resumo' },
        { id: 'diagnostico', label: 'Diagnóstico Financeiro', short: 'Diagnóstico' },
        { id: 'performance', label: 'Performance Financeira', short: 'Performance' },
        { id: 'alertas', label: 'Alertas', short: 'Alertas' },
        { id: 'chat', label: 'Chat Financeiro', short: 'Chat' },
      ]
    : [
        { id: 'resumo', label: 'Overview', short: 'Overview' },
        { id: 'diagnostico', label: 'Financial Diagnostic', short: 'Diagnostic' },
        { id: 'performance', label: 'Financial Performance', short: 'Performance' },
        { id: 'alertas', label: 'Alerts', short: 'Alerts' },
        { id: 'chat', label: 'Financial Chat', short: 'Chat' },
      ]

  const demoDiagnostic = {
    score: 68,
    state: pt ? 'Atenção' : 'Attention',
    metrics: (pt
      ? [
          { label: 'Liquidez corrente', value: '1,42', note: 'Acima do limiar de referência', tone: 'good' },
          { label: 'Margem operacional', value: '35,3%', note: '-7,8% face ao trimestre', tone: 'bad' },
          { label: 'Cobertura de tesouraria', value: '2,8 meses', note: 'Estável', tone: 'neutral' },
          { label: 'Risco global', value: 'Moderado', note: 'Concentração de clientes', tone: 'bad' },
        ]
      : [
          { label: 'Current ratio', value: '1.42', note: 'Above the reference threshold', tone: 'good' },
          { label: 'Operating margin', value: '35.3%', note: '-7.8% vs. quarter', tone: 'bad' },
          { label: 'Cash runway', value: '2.8 months', note: 'Stable', tone: 'neutral' },
          { label: 'Overall risk', value: 'Moderate', note: 'Client concentration', tone: 'bad' },
        ]
    ) satisfies DemoRow[],
  }

  const demoDiagnosticSummary: TextPart[] = pt
    ? [
        { text: 'Tesouraria projetada em ' },
        { text: '€184.200', highlight: true },
        { text: ' a 30 dias, mas a margem caiu 7,8% — pressionada por conservação e reparação (+' },
        { text: '€18.400', highlight: true },
        { text: ') e publicidade e propaganda (+' },
        { text: '€6.200', highlight: true },
        { text: '), ambas acima do padrão recente.' },
      ]
    : [
        { text: 'Cash projected at ' },
        { text: '€184,200', highlight: true },
        { text: ' in 30 days, but margin dropped 7.8% — pressured by maintenance and repairs (+' },
        { text: '€18,400', highlight: true },
        { text: ') and advertising (+' },
        { text: '€6,200', highlight: true },
        { text: '), both above the recent trend.' },
      ]

  const demoDiagnosticProblems: DiagnosticProblem[] = pt
    ? [
        {
          title: 'Conservação e reparação acima do padrão',
          description: [
            { text: 'Cresceu ' },
            { text: '€18.400', highlight: true },
            { text: ' e é o principal fator de pressão sobre a margem.' },
          ],
        },
        {
          title: 'Publicidade e propaganda sem retorno claro',
          description: [
            { text: 'Aumento de ' },
            { text: '€6.200', highlight: true },
            { text: ' sem contributo comercial comprovado.' },
          ],
        },
        {
          title: 'Pressão futura na tesouraria',
          description: [{ text: 'Menos folga para imprevistos se os custos não forem controlados.' }],
        },
      ]
    : [
        {
          title: 'Maintenance and repairs above trend',
          description: [
            { text: 'Grew ' },
            { text: '€18,400', highlight: true },
            { text: ' and is the main factor pressuring margin.' },
          ],
        },
        {
          title: 'Advertising with no clear return',
          description: [
            { text: 'Increased ' },
            { text: '€6,200', highlight: true },
            { text: ' with no proven commercial contribution.' },
          ],
        },
        {
          title: 'Future pressure on cash',
          description: [{ text: 'Less room for the unexpected if costs stay uncontrolled.' }],
        },
      ]

  const demoDiagnosticAction = pt
    ? {
        title: 'Rever conservação e reparação e publicidade e propaganda',
        description: [
          { text: 'Confirmar a natureza dos desvios de ' },
          { text: '€18.400', highlight: true },
          { text: ' e ' },
          { text: '€6.200', highlight: true },
          { text: ' e cortar pelo menos ' },
          { text: '€10.000', highlight: true },
          { text: ' em custos no curto prazo.' },
        ] satisfies TextPart[],
        cta: 'Ver plano de ação',
      }
    : {
        title: 'Review maintenance/repairs and advertising spend',
        description: [
          { text: 'Confirm the nature of the ' },
          { text: '€18,400', highlight: true },
          { text: ' and ' },
          { text: '€6,200', highlight: true },
          { text: ' overruns and cut at least ' },
          { text: '€10,000', highlight: true },
          { text: ' in costs short term.' },
        ] satisfies TextPart[],
        cta: 'View action plan',
      }

  const pnlValues: [string, string, number, number][] = [
    ['Receitas', 'Revenue', 327_420, 302_600],
    ['Margem Bruta', 'Gross Margin', 196_500, 178_500],
    ['EBITDA', 'EBITDA', 142_300, 126_400],
    ['EBIT', 'EBIT', 115_550, 112_840],
    ['Lucro Líquido', 'Net Profit', 81_400, 71_600],
  ]
  const demoPnl: FinancialLineItem[] = pnlValues.map(([labelPt, labelEn, current, previous]) => ({
    label: pt ? labelPt : labelEn,
    current,
    previous,
  }))

  /** Ativo Total = Capital Próprio + Passivo, em ambos os períodos. */
  const balanceValues: [string, string, number, number][] = [
    ['Ativo Total', 'Total Assets', 612_000, 534_000],
    ['Capital Próprio', 'Equity', 326_200, 271_800],
    ['Passivo', 'Liabilities', 285_800, 262_200],
  ]
  const demoBalance: FinancialLineItem[] = balanceValues.map(([labelPt, labelEn, current, previous]) => ({
    label: pt ? labelPt : labelEn,
    current,
    previous,
  }))

  /** Variação Líquida de Caixa = soma das três atividades, em ambos os períodos. */
  const cashflowStatementValues: [string, string, number, number][] = [
    ['Atividades Operacionais', 'Operating Activities', 98_300, 84_100],
    ['Atividades de Investimento', 'Investing Activities', -52_000, -42_000],
    ['Atividades de Financiamento', 'Financing Activities', -14_500, -13_000],
    ['Variação Líquida de Caixa', 'Net Change in Cash', 31_800, 29_100],
  ]
  const demoCashflowStatement: FinancialLineItem[] = cashflowStatementValues.map(
    ([labelPt, labelEn, current, previous]) => ({ label: pt ? labelPt : labelEn, current, previous }),
  )

  /**
   * Alertas financeiros demonstrativos.
   *
   * Margem, faturação e tesouraria são derivados de kpiRaw/forecastValue — a
   * mesma fonte usada no Resumo, Diagnóstico e Performance — para nunca haver
   * dois números diferentes para a mesma métrica.
   */
  const demoAlerts: FinancialAlert[] = pt
    ? [
        {
          id: 'contas-a-pagar-vencidas',
          severity: 'critical',
          category: 'Despesas',
          title: 'Contas a pagar vencidas',
          description:
            '4 contas vencidas, num total de €9.860,40. Atraso material no cumprimento de pagamentos que requer atuação prioritária.',
          impact: 'maior pressão de tesouraria, risco de juros e possível deterioração das condições com fornecedores.',
          recommendation:
            'priorizar a regularização dos vencimentos mais antigos e negociar prazos nos pagamentos de maior valor.',
          metricValue: '€9.860,40',
          updatedLabel: 'Atualizado hoje',
          impactMagnitude: 9_860.4,
          recencyRank: 0,
        },
        {
          id: 'margem-operacional-em-queda',
          severity: 'warning',
          category: 'Margem',
          title: 'Margem operacional em queda',
          description: `A margem operacional recuou ${formatPercent(kpiRaw.margem.delta)} face ao período anterior, pressionada pelo aumento de custos operacionais.`,
          impact: 'deterioração da rentabilidade e menor capacidade de absorver custos adicionais.',
          recommendation: 'validar os principais desvios de custo e definir medidas imediatas de contenção.',
          metricValue: formatPercent(kpiRaw.margem.delta),
          updatedLabel: 'Atualizado esta semana',
          impactMagnitude: Math.abs((kpiRaw.margem.delta / 100) * kpiRaw.receitas.value),
          recencyRank: 3,
        },
        {
          id: 'conservacao-e-reparacao-acima-do-padrao',
          severity: 'warning',
          category: 'Despesas',
          title: 'Conservação e reparação acima do padrão',
          description:
            'Os custos de conservação e reparação aumentaram €18.400 face à média dos últimos meses — um dos principais desvios do período.',
          impact: 'pressão direta sobre a margem operacional e possível recorrência de custo não controlado.',
          recommendation: 'confirmar se o aumento é pontual ou recorrente e rever contratos e fornecedores associados.',
          metricValue: '€18.400',
          updatedLabel: 'Atualizado esta semana',
          impactMagnitude: 18_400,
          recencyRank: 4,
        },
        {
          id: 'publicidade-e-propaganda-sem-retorno',
          severity: 'warning',
          category: 'Despesas',
          title: 'Publicidade e propaganda sem retorno claro',
          description:
            'Os gastos com publicidade e propaganda aumentaram €6.200 face à média, sem contributo comercial comprovado.',
          impact: 'aumento da estrutura de custos operacionais sem retorno demonstrado.',
          recommendation: 'avaliar o retorno por campanha e suspender iniciativas com baixo impacto comercial.',
          metricValue: '€6.200',
          updatedLabel: 'Atualizado esta semana',
          impactMagnitude: 6_200,
          recencyRank: 5,
        },
        {
          id: 'faturacao-acima-do-periodo-anterior',
          severity: 'info',
          category: 'Faturação',
          title: 'Faturação acima do período anterior',
          description: `A faturação cresceu ${formatPercent(kpiRaw.receitas.delta)} face ao período anterior, refletindo bom desempenho comercial.`,
          impact: 'efeito positivo nas receitas; a melhoria deve ser acompanhada em conjunto com a margem e as cobranças.',
          recommendation: 'acompanhar se o crescimento da faturação se traduz em rentabilidade e caixa.',
          metricValue: formatPercent(kpiRaw.receitas.delta),
          updatedLabel: 'Atualizado hoje',
          impactMagnitude: Math.abs((kpiRaw.receitas.delta / 100) * kpiRaw.receitas.value),
          recencyRank: 1,
        },
        {
          id: 'tesouraria-prevista-30-dias',
          severity: 'info',
          category: 'Tesouraria',
          title: 'Tesouraria prevista para os próximos 30 dias',
          description: `A tesouraria projetada para os próximos 30 dias é de ${formatEuro(forecastValue)}, mantendo uma posição confortável no curto prazo.`,
          impact: 'folga financeira positiva, que pode reduzir-se se a pressão de custos persistir.',
          recommendation: 'monitorizar a evolução da caixa e os fatores de custo que podem deteriorar a previsão.',
          metricValue: formatEuro(forecastValue),
          updatedLabel: 'Atualizado hoje',
          impactMagnitude: forecastValue,
          recencyRank: 2,
        },
      ]
    : [
        {
          id: 'contas-a-pagar-vencidas',
          severity: 'critical',
          category: 'Expenses',
          title: 'Overdue payables',
          description:
            '4 overdue invoices totaling €9,860.40. Material delay in meeting payments that requires priority action.',
          impact: 'higher cash pressure, interest risk and possible deterioration of supplier terms.',
          recommendation: 'prioritize settling the oldest overdue amounts and negotiate terms on the largest payments.',
          metricValue: '€9,860.40',
          updatedLabel: 'Updated today',
          impactMagnitude: 9_860.4,
          recencyRank: 0,
        },
        {
          id: 'margem-operacional-em-queda',
          severity: 'warning',
          category: 'Margin',
          title: 'Operating margin declining',
          description: `Operating margin fell ${formatPercent(kpiRaw.margem.delta)} versus the prior period, pressured by higher operating costs.`,
          impact: 'declining profitability and less capacity to absorb further costs.',
          recommendation: 'validate the main cost overruns and set immediate containment measures.',
          metricValue: formatPercent(kpiRaw.margem.delta),
          updatedLabel: 'Updated this week',
          impactMagnitude: Math.abs((kpiRaw.margem.delta / 100) * kpiRaw.receitas.value),
          recencyRank: 3,
        },
        {
          id: 'conservacao-e-reparacao-acima-do-padrao',
          severity: 'warning',
          category: 'Expenses',
          title: 'Maintenance and repairs above trend',
          description:
            'Maintenance and repair costs rose €18,400 versus the recent monthly average — one of the period’s main overruns.',
          impact: 'direct pressure on operating margin and possible recurrence of uncontrolled cost.',
          recommendation: 'confirm whether the increase is one-off or recurring and review related contracts and suppliers.',
          metricValue: '€18,400',
          updatedLabel: 'Updated this week',
          impactMagnitude: 18_400,
          recencyRank: 4,
        },
        {
          id: 'publicidade-e-propaganda-sem-retorno',
          severity: 'warning',
          category: 'Expenses',
          title: 'Advertising with no clear return',
          description:
            'Advertising spend rose €6,200 versus the average, with no proven commercial contribution.',
          impact: 'higher operating cost base with no demonstrated return.',
          recommendation: 'evaluate return per campaign and pause initiatives with low commercial impact.',
          metricValue: '€6,200',
          updatedLabel: 'Updated this week',
          impactMagnitude: 6_200,
          recencyRank: 5,
        },
        {
          id: 'faturacao-acima-do-periodo-anterior',
          severity: 'info',
          category: 'Revenue',
          title: 'Revenue above prior period',
          description: `Revenue grew ${formatPercent(kpiRaw.receitas.delta)} versus the prior period, reflecting strong commercial performance.`,
          impact: 'positive effect on revenue; the improvement should be tracked alongside margin and collections.',
          recommendation: 'monitor whether revenue growth is translating into profitability and cash.',
          metricValue: formatPercent(kpiRaw.receitas.delta),
          updatedLabel: 'Updated today',
          impactMagnitude: Math.abs((kpiRaw.receitas.delta / 100) * kpiRaw.receitas.value),
          recencyRank: 1,
        },
        {
          id: 'tesouraria-prevista-30-dias',
          severity: 'info',
          category: 'Cash',
          title: 'Cash forecast for the next 30 days',
          description: `Projected cash for the next 30 days is ${formatEuro(forecastValue)}, keeping a comfortable short-term position.`,
          impact: 'positive financial cushion, which may narrow if cost pressure persists.',
          recommendation: 'monitor cash evolution and the cost factors that could worsen the forecast.',
          metricValue: formatEuro(forecastValue),
          updatedLabel: 'Updated today',
          impactMagnitude: forecastValue,
          recencyRank: 2,
        },
      ]

  const demoChatSuggestions: ChatSuggestion[] = pt
    ? [
        { id: 'pmr', question: 'Como está o meu prazo médio de recebimento?' },
        { id: 'risco', question: 'Qual o maior risco financeiro agora?' },
        { id: 'tesouraria', question: 'A tesouraria aguenta os próximos 30 dias?' },
        { id: 'margem', question: 'Onde estou a perder margem?' },
        { id: 'prioridades', question: 'Que ações devo priorizar esta semana?' },
      ]
    : [
        { id: 'pmr', question: 'How is my average collection period doing?' },
        { id: 'risco', question: "What's the biggest financial risk right now?" },
        { id: 'tesouraria', question: 'Can cash hold up for the next 30 days?' },
        { id: 'margem', question: 'Where am I losing margin?' },
        { id: 'prioridades', question: 'What actions should I prioritize this week?' },
      ]

  const demoChatAnswer = pt
    ? {
        question: demoChatSuggestions[0].question,
        time: '11:02',
        conclusion: 'O prazo médio de recebimento está em 47 dias, acima do objetivo de 30 dias.',
        impact: 'O atraso está a pressionar a tesouraria e a aumentar o capital empatado em clientes.',
        recommendation:
          'Oferecer, de forma excecional, 2% de desconto aos clientes atualmente em atraso que regularizem o valor em dívida nos próximos 15 dias.',
        application: 'Começar pelos clientes com maior atraso e maior valor em dívida.',
      }
    : {
        question: demoChatSuggestions[0].question,
        time: '11:02 AM',
        conclusion: 'Average collection period stands at 47 days, above the 30-day target.',
        impact: 'The delay is pressuring cash and tying up more capital in receivables.',
        recommendation:
          'As an exception, offer a 2% discount to currently overdue clients who settle their balance within the next 15 days.',
        application: 'Start with the clients with the longest delay and the highest amount owed.',
      }

  const demoChatInsights: ChatInsight[] = pt
    ? [
        { label: 'PMR: 47 dias', tone: 'attention' },
        { label: `Receitas: ${formatPercent(kpiRaw.receitas.delta)} face ao período anterior`, tone: 'good' },
        { label: `Margem operacional: ${formatPercent(kpiRaw.margem.delta)} face ao período anterior`, tone: 'attention' },
        { label: 'Contas a receber vencidas: €34.600', tone: 'attention' },
        { label: 'Top 5 clientes: 47% da faturação', tone: 'attention' },
        { label: `Tesouraria a 30 dias: ${formatEuro(forecastValue)}`, tone: 'good' },
      ]
    : [
        { label: 'Avg. collection period: 47 days', tone: 'attention' },
        { label: `Revenue: ${formatPercent(kpiRaw.receitas.delta)} vs. prior period`, tone: 'good' },
        { label: `Operating margin: ${formatPercent(kpiRaw.margem.delta)} vs. prior period`, tone: 'attention' },
        { label: 'Overdue receivables: €34,600', tone: 'attention' },
        { label: 'Top 5 clients: 47% of revenue', tone: 'attention' },
        { label: `30-day cash: ${formatEuro(forecastValue)}`, tone: 'good' },
      ]

  const demoChatQuickActions: ChatQuickAction[] = pt
    ? [
        { id: 'saude', title: 'Saúde da empresa', subtitle: 'Score e principais desvios', question: 'Qual é a saúde financeira da empresa?' },
        { id: 'resultado', title: 'Resultado do mês', subtitle: 'Margem, receitas e custos', question: 'Como está o resultado deste mês?' },
        { id: 'clientes-risco', title: 'Clientes em risco', subtitle: 'Atrasos e concentração', question: 'Que clientes estão em risco?' },
        { id: 'fornecedores', title: 'Fornecedores', subtitle: 'Pagamentos e dependência', question: 'Como estão os pagamentos a fornecedores?' },
        { id: 'prioridades', title: 'Ações prioritárias', subtitle: 'O que fazer primeiro', question: 'Que ações devo priorizar esta semana?' },
      ]
    : [
        { id: 'saude', title: 'Company health', subtitle: 'Score and main deviations', question: "What's the company's financial health?" },
        { id: 'resultado', title: "Month's result", subtitle: 'Margin, revenue and costs', question: 'How is this month’s result looking?' },
        { id: 'clientes-risco', title: 'Clients at risk', subtitle: 'Delays and concentration', question: 'Which clients are at risk?' },
        { id: 'fornecedores', title: 'Suppliers', subtitle: 'Payments and dependency', question: 'How are payments to suppliers going?' },
        { id: 'prioridades', title: 'Priority actions', subtitle: 'What to do first', question: 'What actions should I prioritize this week?' },
      ]

  return {
    demoKpis,
    demoCashflow,
    demoInsight,
    demoForecast,
    demoChat,
    dashboardTabs,
    demoDiagnostic,
    demoDiagnosticSummary,
    demoDiagnosticProblems,
    demoDiagnosticAction,
    demoPnl,
    demoBalance,
    demoCashflowStatement,
    demoAlerts,
    demoChatSuggestions,
    demoChatAnswer,
    demoChatInsights,
    demoChatQuickActions,
  }
}

export function useDemoDashboardData(): DemoDashboardContent {
  const { lang } = useLanguage()
  return buildContent(lang)
}

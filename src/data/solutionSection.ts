/**
 * Conteúdo da terceira secção — a solução.
 *
 * REPRESENTAÇÃO CONCEPTUAL. Nada aqui descreve integrações já disponíveis.
 * A linguagem é deliberadamente condicional, porque a plataforma ainda não
 * liga automaticamente a bancos, ERPs ou softwares de contabilidade. Nenhuma
 * marca real é referida.
 *
 * Os valores são coerentes com os do dashboard demonstrativo da Hero, mas não
 * pertencem a nenhuma empresa real e não devem ser usados como prova.
 *
 * BILINGUE: ver useDemoDashboardData em demoDashboard.ts para o padrão.
 */

import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'

export type SolutionStepId = 'conectar' | 'organizar' | 'interpretar' | 'decidir'

export type SolutionStep = {
  id: SolutionStepId
  number: string
  label: string
  headline: string
  text: string
}

export type InterpretationTone = 'neutral' | 'forecast' | 'risk'

export type StepSignal =
  | { kind: 'tags'; items: string[] }
  | { kind: 'flow'; items: string[] }
  | { kind: 'metrics'; items: { text: string; tone: InterpretationTone }[] }

export type SolutionSectionContent = {
  solutionSteps: SolutionStep[]
  /** 01 — fontes de dados, por tipo de sistema e nunca por marca. */
  connectSources: { label: string; detail: string; icon: 'bank' | 'invoice' | 'erp' }[]
  /** 02 — cinco linhas de interpretação financeira que sustentam a margem. */
  marginInsights: {
    label: string
    text: string
    value: string
    tone: InterpretationTone
    icon: 'trendDown' | 'maintenance' | 'advertising' | 'treasury' | 'warning'
  }[]
  /** 03 — previsão de tesouraria, por horizonte temporal. */
  treasuryForecast: { title: string; subtitle: string; alertLabel: string; note: string }
  treasuryHorizons: {
    label: string
    value: string
    share: number
    highlightValue?: boolean
    risk?: boolean
  }[]
  /** 04 — a decisão. */
  decision: {
    question: string
    answer: string
    recommendationLabel: string
    recommendation: string
    impact: string
  }
  /** Camada de sinal da coluna esquerda. */
  stepSignals: Record<SolutionStepId, StepSignal>
}

function buildContent(lang: Lang): SolutionSectionContent {
  const pt = lang === 'pt'

  const solutionSteps: SolutionStep[] = pt
    ? [
        {
          id: 'conectar',
          number: '01',
          label: 'Ligamos',
          headline: 'Ligamos os dados da sua empresa.',
          text: 'Reunimos a informação necessária e validamos a sua consistência antes de iniciar a análise.',
        },
        {
          id: 'organizar',
          number: '02',
          label: 'Interpretamos',
          headline: 'Percebemos o que está realmente a acontecer.',
          text: 'Cruzamos indicadores, histórico e contexto para separar sintomas, causas prováveis e impactos.',
        },
        {
          id: 'interpretar',
          number: '03',
          label: 'Antecipamos',
          headline: 'Mostramos o que poderá acontecer a seguir.',
          text: 'Projetamos cenários e avaliamos como as decisões de hoje podem afetar margem, caixa e risco nos próximos meses.',
        },
        {
          id: 'decidir',
          number: '04',
          label: 'Recomendamos',
          headline: 'Transformamos a análise numa prioridade de ação.',
          text: 'Com base na evidência, impacto e risco, priorizamos ações concretas e quantificadas, indicando o que fazer primeiro e o resultado esperado.',
        },
      ]
    : [
        {
          id: 'conectar',
          number: '01',
          label: 'Connect',
          headline: "We connect your company's data.",
          text: 'We gather the necessary information and validate its consistency before starting the analysis.',
        },
        {
          id: 'organizar',
          number: '02',
          label: 'Interpret',
          headline: "We understand what's really happening.",
          text: 'We cross-reference indicators, history and context to separate symptoms, likely causes and impacts.',
        },
        {
          id: 'interpretar',
          number: '03',
          label: 'Anticipate',
          headline: 'We show what could happen next.',
          text: "We project scenarios and assess how today's decisions can affect margin, cash and risk over the coming months.",
        },
        {
          id: 'decidir',
          number: '04',
          label: 'Recommend',
          headline: 'We turn analysis into a priority to act on.',
          text: "Based on evidence, impact and risk, we prioritize concrete, quantified actions — what to do first and the expected outcome.",
        },
      ]

  const connectSources: SolutionSectionContent['connectSources'] = pt
    ? [
        { label: 'Banco', detail: 'Saldos e movimentos', icon: 'bank' },
        { label: 'Sistema de faturação', detail: 'Documentos emitidos', icon: 'invoice' },
        { label: 'ERP', detail: 'Clientes e encomendas', icon: 'erp' },
      ]
    : [
        { label: 'Bank', detail: 'Balances and transactions', icon: 'bank' },
        { label: 'Invoicing system', detail: 'Issued documents', icon: 'invoice' },
        { label: 'ERP', detail: 'Clients and orders', icon: 'erp' },
      ]

  const marginInsights: SolutionSectionContent['marginInsights'] = pt
    ? [
        { label: 'Variação', text: 'Margem operacional em queda', value: '-7,8%', tone: 'risk', icon: 'trendDown' },
        { label: 'Causa', text: 'Conservação e reparação acima do padrão', value: '+€18.400', tone: 'forecast', icon: 'maintenance' },
        { label: 'Causa', text: 'Publicidade e propaganda acima do planeado', value: '+€6.200', tone: 'forecast', icon: 'advertising' },
        { label: 'Impacto', text: 'Contas vencidas a pressionar recebimentos', value: '€34.600', tone: 'forecast', icon: 'treasury' },
        { label: 'Risco', text: 'Prazo médio de recebimento elevado', value: '47 dias', tone: 'risk', icon: 'warning' },
      ]
    : [
        { label: 'Variance', text: 'Operating margin declining', value: '-7.8%', tone: 'risk', icon: 'trendDown' },
        { label: 'Cause', text: 'Maintenance and repairs above trend', value: '+€18,400', tone: 'forecast', icon: 'maintenance' },
        { label: 'Cause', text: 'Advertising above plan', value: '+€6,200', tone: 'forecast', icon: 'advertising' },
        { label: 'Impact', text: 'Overdue invoices pressuring collections', value: '€34,600', tone: 'forecast', icon: 'treasury' },
        { label: 'Risk', text: 'High average collection period', value: '47 days', tone: 'risk', icon: 'warning' },
      ]

  const treasuryForecast = pt
    ? {
        title: 'Previsão de Tesouraria',
        subtitle: 'Folga financeira projetada',
        alertLabel: 'Zona de menor folga',
        note: 'Se os custos se mantiverem, a folga financeira diminui no horizonte de 90 dias.',
      }
    : {
        title: 'Cash Forecast',
        subtitle: 'Projected financial cushion',
        alertLabel: 'Lower cushion zone',
        note: 'If costs stay the same, the financial cushion shrinks over the 90-day horizon.',
      }

  const treasuryHorizons: SolutionSectionContent['treasuryHorizons'] = pt
    ? [
        { label: 'Hoje', value: '€148.920', share: 81 },
        { label: '30 dias', value: '€184.200', share: 100, highlightValue: true },
        { label: '60 dias', value: '€162.800', share: 88 },
        { label: '90 dias', value: '€91.400', share: 50, risk: true },
      ]
    : [
        { label: 'Today', value: '€148,920', share: 81 },
        { label: '30 days', value: '€184,200', share: 100, highlightValue: true },
        { label: '60 days', value: '€162,800', share: 88 },
        { label: '90 days', value: '€91,400', share: 50, risk: true },
      ]

  const decision = pt
    ? {
        question: 'Como está o meu prazo médio de recebimento?',
        answer:
          'O PMR está em 47 dias, acima do objetivo de 30 dias. Os atrasos estão concentrados em clientes relevantes e estão a pressionar a tesouraria.',
        recommendationLabel: 'Prioridade recomendada',
        recommendation:
          'Aplicar, de forma excecional, 2% de desconto aos clientes atualmente em atraso que regularizem a fatura em 15 dias.',
        impact: 'Impacto esperado: acelerar recebimentos e reduzir a pressão de caixa no curto prazo.',
      }
    : {
        question: 'How is my average collection period doing?',
        answer:
          'The ACP stands at 47 days, above the 30-day target. Delays are concentrated among key clients and are pressuring cash.',
        recommendationLabel: 'Recommended priority',
        recommendation:
          'As an exception, apply a 2% discount to currently overdue clients who settle their invoice within 15 days.',
        impact: 'Expected impact: faster collections and less short-term cash pressure.',
      }

  const stepSignals: Record<SolutionStepId, StepSignal> = pt
    ? {
        conectar: { kind: 'tags', items: ['Banco', 'ERP', 'Sistema de faturação'] },
        organizar: {
          kind: 'metrics',
          items: [
            { text: 'Margem ↓ 7,8%', tone: 'risk' },
            { text: 'PMR 47 dias', tone: 'forecast' },
            { text: 'Pressão na tesouraria', tone: 'risk' },
          ],
        },
        interpretar: {
          kind: 'metrics',
          items: [
            { text: 'Cenário base', tone: 'forecast' },
            { text: 'Risco', tone: 'forecast' },
            { text: 'Horizonte temporal', tone: 'forecast' },
          ],
        },
        decidir: { kind: 'flow', items: ['PMR elevado', 'recebimentos mais lentos', 'ação prioritária'] },
      }
    : {
        conectar: { kind: 'tags', items: ['Bank', 'ERP', 'Invoicing system'] },
        organizar: {
          kind: 'metrics',
          items: [
            { text: 'Margin ↓ 7.8%', tone: 'risk' },
            { text: 'ACP 47 days', tone: 'forecast' },
            { text: 'Cash pressure', tone: 'risk' },
          ],
        },
        interpretar: {
          kind: 'metrics',
          items: [
            { text: 'Base scenario', tone: 'forecast' },
            { text: 'Risk', tone: 'forecast' },
            { text: 'Time horizon', tone: 'forecast' },
          ],
        },
        decidir: { kind: 'flow', items: ['High ACP', 'slower collections', 'priority action'] },
      }

  return {
    solutionSteps,
    connectSources,
    marginInsights,
    treasuryForecast,
    treasuryHorizons,
    decision,
    stepSignals,
  }
}

export function useSolutionSectionData(): SolutionSectionContent {
  const { lang } = useLanguage()
  return buildContent(lang)
}

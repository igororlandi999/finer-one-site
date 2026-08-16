/**
 * Configuração dos planos — fonte única de verdade da fase 8.
 *
 * PREÇOS AINDA NÃO DEFINIDOS. Nenhum valor é apresentado. Quando existirem
 * valores oficiais, basta preencher `price` de cada plano e a secção passa a
 * mostrá-los sem alterar um único componente.
 *
 * DISPONIBILIDADE: apenas o Plus está disponível. Pro e Team continuam no
 * site para mostrar a evolução do produto, mas são "Disponível brevemente" e
 * não têm ação de compra. Ver `available`.
 *
 * BILINGUE: ver useDemoDashboardData em demoDashboard.ts para o padrão.
 */

import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'

export type PlanId = 'plus' | 'pro' | 'team'

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
  /** false = sem ação de compra; o card mostra `unavailableCta` no lugar do CTA. */
  available: boolean
  statusLabel: string
  /** Só é usado quando `available` é true. */
  cta: string
  included: string[]
  /** Vazio quando o plano não tem nada de "não incluído" a mostrar (Team). */
  excluded: string[]
}

export type PricingContent = {
  recommendedPlan: PlanId
  plans: Plan[]
  pricingCopy: {
    headline: string
    subheadline: string
    unavailableCta: string
    includedLabel: string
    excludedLabel: string
    noteLines: string[]
  }
}

function buildContent(lang: Lang): PricingContent {
  const pt = lang === 'pt'

  const plans: Plan[] = pt
    ? [
        {
          id: 'plus',
          name: 'Plus',
          promise: 'Perceber o que está a acontecer.',
          description: 'Clareza financeira para acompanhar a operação e compreender melhor o desempenho da empresa.',
          price: null,
          period: '/mês',
          priceNote: 'Preço a definir',
          available: true,
          statusLabel: 'Disponível',
          cta: 'Começar Agora',
          included: [
            'Resumo',
            'Diagnóstico Financeiro',
            'Receitas',
            'Despesas',
            'Documentos',
            'Performance Financeira',
            'Clientes e Fornecedores',
            'Alertas limitados',
            'Chat Financeiro limitado',
          ],
          excluded: ['Planeamento', 'Indicadores', 'Benchmarking do setor', 'Avaliação'],
        },
        {
          id: 'pro',
          name: 'Pro',
          promise: 'Perceber o que está a acontecer — e o que pode acontecer a seguir.',
          description: 'Mais profundidade para empresas que querem antecipar cenários e decidir com maior contexto financeiro.',
          price: null,
          period: '/mês',
          priceNote: 'Preço a definir',
          available: false,
          statusLabel: 'Brevemente',
          cta: '',
          included: ['Tudo do Plus', 'Planeamento', 'Indicadores', 'Alertas ilimitados', 'Chat Financeiro ilimitado'],
          excluded: ['Benchmarking do setor', 'Avaliação'],
        },
        {
          id: 'team',
          name: 'Team',
          promise: 'Comparar o desempenho da empresa com o setor.',
          description: 'Para empresas que querem situar os seus números face ao mercado e acompanhar a evolução do valor do negócio.',
          price: null,
          period: '/mês',
          priceNote: 'Preço a definir',
          available: false,
          statusLabel: 'Brevemente',
          cta: '',
          included: ['Tudo do Pro', 'Benchmarking do setor', 'Avaliação'],
          excluded: [],
        },
      ]
    : [
        {
          id: 'plus',
          name: 'Plus',
          promise: "Understand what's happening.",
          description: 'Financial clarity to track the operation and better understand company performance.',
          price: null,
          period: '/mo',
          priceNote: 'Price to be announced',
          available: true,
          statusLabel: 'Available',
          cta: 'Get Started',
          included: [
            'Overview',
            'Financial Diagnostic',
            'Revenue',
            'Expenses',
            'Documents',
            'Financial Performance',
            'Clients & Suppliers',
            'Limited alerts',
            'Limited Financial Chat',
          ],
          excluded: ['Planning', 'Indicators', 'Industry benchmarking', 'Valuation'],
        },
        {
          id: 'pro',
          name: 'Pro',
          promise: "Understand what's happening — and what could happen next.",
          description: 'More depth for companies that want to anticipate scenarios and decide with greater financial context.',
          price: null,
          period: '/mo',
          priceNote: 'Price to be announced',
          available: false,
          statusLabel: 'Coming soon',
          cta: '',
          included: ['Everything in Plus', 'Planning', 'Indicators', 'Unlimited alerts', 'Unlimited Financial Chat'],
          excluded: ['Industry benchmarking', 'Valuation'],
        },
        {
          id: 'team',
          name: 'Team',
          promise: "Compare the company's performance with the industry.",
          description: 'For companies that want to benchmark their numbers against the market and track the evolution of business value.',
          price: null,
          period: '/mo',
          priceNote: 'Price to be announced',
          available: false,
          statusLabel: 'Coming soon',
          cta: '',
          included: ['Everything in Pro', 'Industry benchmarking', 'Valuation'],
          excluded: [],
        },
      ]

  const pricingCopy = pt
    ? {
        headline: 'Escolha o plano certo para a sua empresa',
        subheadline: 'Três níveis de inteligência financeira para acompanhar, antecipar e comparar o desempenho da sua empresa.',
        unavailableCta: 'Disponível brevemente',
        includedLabel: 'Incluído no plano',
        excludedLabel: 'Não incluído',
        noteLines: [
          'O plano Plus está disponível. Pro e Team serão disponibilizados brevemente.',
          'Os valores de cada plano serão anunciados.',
        ],
      }
    : {
        headline: 'Choose the right plan for your company',
        subheadline: 'Three levels of financial intelligence to track, anticipate and benchmark your company’s performance.',
        unavailableCta: 'Coming soon',
        includedLabel: 'Included in the plan',
        excludedLabel: 'Not included',
        noteLines: [
          'The Plus plan is available. Pro and Team will be available soon.',
          'Pricing for each plan will be announced.',
        ],
      }

  return { recommendedPlan: 'plus', plans, pricingCopy }
}

export function usePricingData(): PricingContent {
  const { lang } = useLanguage()
  return buildContent(lang)
}

/**
 * Conteúdo da segunda secção da landing page ("o problema").
 *
 * Os valores financeiros são ilustrativos e coerentes com o dashboard
 * demonstrativo da Hero. Não representam nenhuma empresa real.
 * Nenhum nome de banco, ERP ou software real é utilizado.
 *
 * BILINGUE: ver useDemoDashboardData em demoDashboard.ts para o padrão.
 */

import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'

export type MarginPoint = { month: string; value: number; label: string }

export type ProblemSectionContent = {
  businessQuestions: string[]
  /** Índice de destaque inicial em businessQuestions — "Posso contratar?" / "Can I hire?". */
  highlightedQuestionIndex: number
  /** Degradação de margem ao longo de quatro meses. */
  marginTimeline: MarginPoint[]
  /** Índices da timeline: onde o problema começa e onde costuma ser notado. */
  problemStartIndex: number
  discoveryIndex: number
  /**
   * Fontes que convergem para a pergunta central do card "Decidir exige
   * contexto". Chaves de ícone próprias, partilhadas com systemIcons.
   */
  hubInputs: { label: string; icon: 'revenue' | 'expenses' | 'margin' | 'treasury' | 'clients' }[]
  hubOutputs: { label: string; icon: 'cause' | 'impact' | 'priority' | 'action' }[]
}

function buildContent(lang: Lang): ProblemSectionContent {
  const pt = lang === 'pt'

  return {
    businessQuestions: pt
      ? [
          'Porque caiu a margem?',
          'Posso contratar?',
          'Vou ter pressão de tesouraria?',
          'Onde estou a perder dinheiro?',
          'Que cliente exige atenção?',
        ]
      : [
          'Why did margin drop?',
          'Can I hire?',
          'Will I face cash pressure?',
          'Where am I losing money?',
          'Which client needs attention?',
        ],
    highlightedQuestionIndex: 1,
    marginTimeline: pt
      ? [
          { month: 'Jan', value: 37, label: '37%' },
          { month: 'Fev', value: 35, label: '35%' },
          { month: 'Mar', value: 31, label: '31%' },
          { month: 'Abr', value: 27, label: '27%' },
        ]
      : [
          { month: 'Jan', value: 37, label: '37%' },
          { month: 'Feb', value: 35, label: '35%' },
          { month: 'Mar', value: 31, label: '31%' },
          { month: 'Apr', value: 27, label: '27%' },
        ],
    problemStartIndex: 1,
    discoveryIndex: 3,
    hubInputs: pt
      ? [
          { label: 'Receitas', icon: 'revenue' },
          { label: 'Despesas', icon: 'expenses' },
          { label: 'Margem', icon: 'margin' },
          { label: 'Tesouraria', icon: 'treasury' },
          { label: 'Clientes', icon: 'clients' },
        ]
      : [
          { label: 'Revenue', icon: 'revenue' },
          { label: 'Expenses', icon: 'expenses' },
          { label: 'Margin', icon: 'margin' },
          { label: 'Cash', icon: 'treasury' },
          { label: 'Clients', icon: 'clients' },
        ],
    hubOutputs: pt
      ? [
          { label: 'Causa', icon: 'cause' },
          { label: 'Impacto', icon: 'impact' },
          { label: 'Prioridade', icon: 'priority' },
          { label: 'Recomendação', icon: 'action' },
        ]
      : [
          { label: 'Cause', icon: 'cause' },
          { label: 'Impact', icon: 'impact' },
          { label: 'Priority', icon: 'priority' },
          { label: 'Recommendation', icon: 'action' },
        ],
  }
}

export function useProblemSectionData(): ProblemSectionContent {
  const { lang } = useLanguage()
  return buildContent(lang)
}

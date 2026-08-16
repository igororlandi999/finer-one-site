import { Clock3, TrendingDown, TriangleAlert, WalletCards, CircleCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ChatSuggestion, ChatSuggestionId } from '@/data/demoDashboard'
import { useDemoDashboardData } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const iconById: Record<ChatSuggestionId, LucideIcon> = {
  pmr: Clock3,
  risco: TriangleAlert,
  tesouraria: WalletCards,
  margem: TrendingDown,
  prioridades: CircleCheck,
}

const ariaLabel = { pt: 'Perguntas sugeridas', en: 'Suggested questions' }

export function SuggestedQuestions({
  selected,
  onSelect,
}: {
  selected: ChatSuggestionId
  onSelect: (suggestion: ChatSuggestion) => void
}) {
  const { lang } = useLanguage()
  const { demoChatSuggestions } = useDemoDashboardData()

  return (
    <div role="group" aria-label={ariaLabel[lang]} className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
      {demoChatSuggestions.map((suggestion) => {
        const Icon = iconById[suggestion.id]
        const active = selected === suggestion.id

        return (
          <button
            key={suggestion.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(suggestion)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2 py-1 text-[10px] font-medium transition-colors duration-200',
              active
                ? 'border-accent/[0.45] bg-accent/[0.12] text-white'
                : 'border-white/[0.08] bg-white/[0.02] text-mist hover:text-white',
            )}
          >
            <Icon size={10} className={active ? 'text-glow' : 'text-mist'} aria-hidden="true" />
            {suggestion.question}
          </button>
        )
      })}
    </div>
  )
}

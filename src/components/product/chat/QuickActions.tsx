import { ChartNoAxesColumnIncreasing, ChevronRight, HeartPulse, Target, UserRound, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ChatQuickActionId } from '@/data/demoDashboard'
import { useDemoDashboardData } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'

const iconById: Record<ChatQuickActionId, LucideIcon> = {
  saude: HeartPulse,
  resultado: ChartNoAxesColumnIncreasing,
  'clientes-risco': Users,
  fornecedores: UserRound,
  prioridades: Target,
}

const heading = { pt: 'Ações rápidas', en: 'Quick actions' }

export function QuickActions({ onSelect }: { onSelect: (question: string) => void }) {
  const { lang } = useLanguage()
  const { demoChatQuickActions } = useDemoDashboardData()

  return (
    <section className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 sm:p-3">
      <h3 className="text-[11.5px] font-semibold text-white">{heading[lang]}</h3>
      <ul className="mt-1.5 space-y-0.5">
        {demoChatQuickActions.map((action) => {
          const Icon = iconById[action.id]
          return (
            <li key={action.id}>
              <button
                type="button"
                onClick={() => onSelect(action.question)}
                className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors duration-200 hover:bg-white/[0.03]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/[0.14] text-glow">
                  <Icon size={11} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-medium leading-snug text-white">{action.title}</span>
                  <span className="block text-[9px] leading-snug text-mist">{action.subtitle}</span>
                </span>
                <ChevronRight size={11} className="shrink-0 text-mist" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

import { useDemoDashboardData } from '@/data/demoDashboard'
import type { ChatInsightTone } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const dotClass: Record<ChatInsightTone, string> = {
  good: 'bg-glow',
  attention: 'bg-signal',
}

const copy = { pt: { heading: 'Insights inteligentes', badge: 'Novo' }, en: { heading: 'Smart insights', badge: 'New' } }

export function SmartInsights() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const { demoChatInsights } = useDemoDashboardData()

  return (
    <section className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 sm:p-3">
      <div className="flex items-center gap-1.5">
        <h3 className="text-[11.5px] font-semibold text-white">{t.heading}</h3>
        <span className="rounded-full border border-accent/[0.35] bg-accent/[0.12] px-1.5 py-0 text-[8px] font-semibold uppercase tracking-wider text-glow">
          {t.badge}
        </span>
      </div>
      <ul className="mt-1.5 space-y-1">
        {demoChatInsights.map((insight) => (
          <li key={insight.label} className="flex items-center gap-1.5 text-[10px] leading-snug text-mist">
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClass[insight.tone])} aria-hidden="true" />
            {insight.label}
          </li>
        ))}
      </ul>
    </section>
  )
}

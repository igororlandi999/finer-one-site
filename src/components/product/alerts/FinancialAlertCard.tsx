import { ArrowRight, Target } from 'lucide-react'
import { useSeverityConfig } from '@/components/product/alerts/severityConfig'
import type { FinancialAlert } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const copy = {
  pt: { detail: 'Ver detalhe', impact: 'Impacto', action: 'Ação' },
  en: { detail: 'View details', impact: 'Impact', action: 'Action' },
}

export function FinancialAlertCard({ alert }: { alert: FinancialAlert }) {
  const { lang } = useLanguage()
  const t = copy[lang]
  const severityConfig = useSeverityConfig()
  const config = severityConfig[alert.severity]
  const Icon = config.icon

  return (
    <li className="flex gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2 sm:p-2.5">
      <span className={cn('w-[3px] shrink-0 self-stretch rounded-full', config.bar)} aria-hidden="true" />

      <div className="grid min-w-0 flex-1 gap-2 lg:grid-cols-[1.3fr_1fr_auto] lg:gap-3">
        <div className="flex min-w-0 items-start gap-1.5">
          <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full', config.iconChip)}>
            <Icon size={10} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1">
              <span
                className={cn(
                  'rounded-full border px-1.5 py-0 text-[8px] font-semibold uppercase tracking-wider',
                  config.badge,
                )}
              >
                {config.label}
              </span>
              <span className="rounded-full border border-white/[0.1] bg-white/[0.03] px-1.5 py-0 text-[8px] font-medium uppercase tracking-wider text-mist">
                {alert.category}
              </span>
            </div>
            <h3 className="mt-0.5 text-[11px] font-semibold leading-snug text-white">{alert.title}</h3>
            <p className="mt-0.5 text-[9.5px] leading-snug text-mist">{alert.description}</p>
          </div>
        </div>

        <div className="min-w-0 space-y-0.5">
          <p className="flex items-start gap-1 text-[9.5px] leading-snug text-mist">
            <Icon size={9} className={cn('mt-0.5 shrink-0', config.text)} aria-hidden="true" />
            <span>
              <span className="font-semibold text-white">{t.impact}: </span>
              {alert.impact}
            </span>
          </p>
          <p className="flex items-start gap-1 text-[9.5px] leading-snug text-mist">
            <Target size={9} className="mt-0.5 shrink-0 text-glow" aria-hidden="true" />
            <span>
              <span className="font-semibold text-white">{t.action}: </span>
              {alert.recommendation}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-2 lg:flex-col lg:items-end lg:text-right">
          <div className="lg:text-right">
            <p className="text-[8.5px] text-mist">{alert.updatedLabel}</p>
            <p className={cn('text-[16px] font-semibold tabular leading-tight sm:text-[18px]', config.text)}>
              {alert.metricValue}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/[0.12] bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-medium text-white transition-colors duration-200 hover:border-white/[0.22] hover:bg-white/[0.06]"
          >
            {t.detail}
            <ArrowRight size={9} aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  )
}

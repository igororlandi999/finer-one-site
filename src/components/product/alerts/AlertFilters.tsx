import { CircleAlert, Info, LayoutGrid, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AlertSeverity } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

export type AlertFilterId = 'all' | AlertSeverity

export type AlertCounts = Record<AlertFilterId, number>

type Filter = { id: AlertFilterId; label: string; icon: LucideIcon; iconClass: string }

const FILTERS: Record<'pt' | 'en', Filter[]> = {
  pt: [
    { id: 'all', label: 'Todos', icon: LayoutGrid, iconClass: 'text-glow' },
    { id: 'critical', label: 'Críticos', icon: CircleAlert, iconClass: 'text-signal' },
    { id: 'warning', label: 'Atenção', icon: TriangleAlert, iconClass: 'text-signal' },
    { id: 'info', label: 'Informativos', icon: Info, iconClass: 'text-glow' },
  ],
  en: [
    { id: 'all', label: 'All', icon: LayoutGrid, iconClass: 'text-glow' },
    { id: 'critical', label: 'Critical', icon: CircleAlert, iconClass: 'text-signal' },
    { id: 'warning', label: 'Warning', icon: TriangleAlert, iconClass: 'text-signal' },
    { id: 'info', label: 'Info', icon: Info, iconClass: 'text-glow' },
  ],
}

const ariaLabel = { pt: 'Filtrar alertas por gravidade', en: 'Filter alerts by severity' }

export function AlertFilters({
  counts,
  active,
  onChange,
}: {
  counts: AlertCounts
  active: AlertFilterId
  onChange: (id: AlertFilterId) => void
}) {
  const { lang } = useLanguage()

  return (
    <div role="group" aria-label={ariaLabel[lang]} className="flex flex-wrap gap-1.5">
      {FILTERS[lang].map((filter) => {
        const selected = active === filter.id
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(filter.id)}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-1.5 py-0.5 text-[10px] font-medium transition-colors duration-200',
              selected
                ? 'border-accent/[0.45] bg-accent/[0.12] text-white'
                : 'border-white/[0.08] bg-white/[0.02] text-mist hover:text-white',
            )}
          >
            <filter.icon size={10} className={filter.iconClass} aria-hidden="true" />
            {filter.label}
            <span className="tabular text-[9.5px] text-mist">{counts[filter.id]}</span>
          </button>
        )
      })}
    </div>
  )
}

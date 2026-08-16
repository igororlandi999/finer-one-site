import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

export type PerformanceTabId = 'pnl' | 'balance' | 'cashflow'

const TABS: Record<'pt' | 'en', { id: PerformanceTabId; label: string }[]> = {
  pt: [
    { id: 'pnl', label: 'P&L (Resumo)' },
    { id: 'balance', label: 'Balanço (Resumo)' },
    { id: 'cashflow', label: 'Cashflow (Resumo)' },
  ],
  en: [
    { id: 'pnl', label: 'P&L (Summary)' },
    { id: 'balance', label: 'Balance Sheet (Summary)' },
    { id: 'cashflow', label: 'Cash Flow (Summary)' },
  ],
}

const ariaLabel = { pt: 'Secções da performance financeira', en: 'Financial performance sections' }

/** Controla qual das três tabelas está visível — só uma de cada vez. */
export function PerformanceTabs({
  active,
  onChange,
}: {
  active: PerformanceTabId
  onChange: (id: PerformanceTabId) => void
}) {
  const { lang } = useLanguage()

  return (
    <div role="tablist" aria-label={ariaLabel[lang]} className="flex gap-3 border-b border-white/[0.07]">
      {TABS[lang].map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'border-b-2 pb-1 text-[10.5px] font-medium transition-colors duration-200',
            active === tab.id ? 'border-glow text-glow' : 'border-transparent text-mist hover:text-white',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

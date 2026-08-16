import { InfoTooltip } from '@/components/product/diagnostic/InfoTooltip'
import type { FinancialLineItem } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'
import { formatPercent, formatSignedEuro, variation } from '@/lib/format'
import { cn } from '@/lib/utils'

const HEAD_CLASS = 'py-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-glow'

const headers = {
  pt: { label: 'Rubrica', current: 'Atual', previous: 'Anterior', deltaEur: 'Var. (€)', deltaPct: 'Var. %' },
  en: { label: 'Line item', current: 'Current', previous: 'Previous', deltaEur: 'Chg. (€)', deltaPct: 'Chg. %' },
}

export function FinancialSummaryTable({
  title,
  tooltip,
  rows,
}: {
  title: string
  tooltip: string
  rows: FinancialLineItem[]
}) {
  const { lang } = useLanguage()
  const t = headers[lang]

  return (
    <section className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2 sm:p-2.5">
      <header className="mb-1.5 flex items-center gap-1.5">
        <h3 className="text-[12px] font-semibold text-white">{title}</h3>
        <InfoTooltip text={tooltip} />
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[380px] border-collapse">
          <thead>
            <tr className="border-b border-white/[0.07]">
              <th className={cn(HEAD_CLASS, 'text-left')}>{t.label}</th>
              <th className={cn(HEAD_CLASS, 'text-right')}>{t.current}</th>
              <th className={cn(HEAD_CLASS, 'text-right')}>{t.previous}</th>
              <th className={cn(HEAD_CLASS, 'text-right')}>{t.deltaEur}</th>
              <th className={cn(HEAD_CLASS, 'text-right')}>{t.deltaPct}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const { deltaEur, deltaPct } = variation(row.current, row.previous)
              const tone = deltaPct >= 0 ? 'text-glow' : 'text-signal'
              return (
                <tr key={row.label} className="border-b border-white/[0.04] last:border-0">
                  <td className="py-1 pr-2 text-[10.5px] text-white">{row.label}</td>
                  <td className="py-1 text-right text-[10.5px] tabular text-white">
                    {formatSignedEuro(row.current)}
                  </td>
                  <td className="py-1 text-right text-[10.5px] tabular text-mist">
                    {formatSignedEuro(row.previous)}
                  </td>
                  <td className={cn('py-1 text-right text-[10.5px] font-medium tabular', tone)}>
                    {formatSignedEuro(deltaEur)}
                  </td>
                  <td className={cn('py-1 text-right text-[10.5px] font-medium tabular', tone)}>
                    {formatPercent(deltaPct)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

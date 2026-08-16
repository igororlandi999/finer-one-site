import { TriangleAlert } from 'lucide-react'
import { HighlightedText } from '@/components/product/diagnostic/HighlightedText'
import type { DiagnosticProblem } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'

const heading = { pt: 'Principais problemas identificados', en: 'Main issues identified' }

export function DiagnosticProblems({ problems }: { problems: DiagnosticProblem[] }) {
  const { lang } = useLanguage()

  return (
    <section className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 sm:p-3">
      <header className="mb-2 flex items-center gap-1.5">
        <TriangleAlert size={12} aria-hidden="true" className="text-signal" />
        <h3 className="text-[12.5px] font-semibold text-white">{heading[lang]}</h3>
      </header>

      <ul>
        {problems.map((problem, index) => (
          <li
            key={problem.title}
            className="flex items-start gap-2 border-b border-white/[0.05] py-1.5 first:pt-0 last:border-0 last:pb-0"
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-signal/[0.14] text-[9px] font-semibold text-signal">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium leading-snug text-white">{problem.title}</p>
              <HighlightedText
                parts={problem.description}
                className="mt-0.5 text-[10.5px] leading-snug text-mist"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

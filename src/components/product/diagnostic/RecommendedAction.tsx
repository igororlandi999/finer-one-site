import { ArrowRight, Target, TrendingUp } from 'lucide-react'
import { HighlightedText } from '@/components/product/diagnostic/HighlightedText'
import type { TextPart } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'

const heading = { pt: 'Ação recomendada', en: 'Recommended action' }

export function RecommendedAction({
  title,
  description,
  cta,
}: {
  title: string
  description: TextPart[]
  cta: string
}) {
  const { lang } = useLanguage()

  return (
    <section className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 sm:p-3">
      <header className="mb-2 flex items-center gap-1.5">
        <Target size={12} aria-hidden="true" className="text-glow" />
        <h3 className="text-[12.5px] font-semibold text-white">{heading[lang]}</h3>
      </header>

      <div className="rounded-lg border border-accent/[0.25] bg-accent/[0.06] p-2.5">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/[0.16] text-glow">
            <TrendingUp size={12} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h4 className="text-[12px] font-semibold leading-snug text-white">{title}</h4>
            <HighlightedText
              parts={description}
              className="mt-1 text-[10.5px] leading-snug text-mist"
            />
          </div>
        </div>

        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-[10.5px] font-medium text-white transition-colors duration-200 hover:bg-accent-hover"
        >
          {cta}
          <ArrowRight size={12} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

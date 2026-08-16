import { FileText } from 'lucide-react'
import { HighlightedText } from '@/components/product/diagnostic/HighlightedText'
import type { TextPart } from '@/data/demoDashboard'
import { useLanguage } from '@/i18n/LanguageContext'

const heading = { pt: 'Resumo executivo', en: 'Executive summary' }

export function ExecutiveSummary({ parts }: { parts: TextPart[] }) {
  const { lang } = useLanguage()

  return (
    <section className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 sm:p-3">
      <div className="flex items-start gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/[0.14] text-glow">
          <FileText size={11} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[12.5px] font-semibold text-white">{heading[lang]}</h3>
          <HighlightedText parts={parts} className="mt-1 text-[11.5px] leading-snug text-mist" />
        </div>
      </div>
    </section>
  )
}

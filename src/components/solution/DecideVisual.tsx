import { LogoMark } from '@/components/brand/Logo'
import { systemIcons } from '@/components/problem/sourceIcons'
import { useSolutionSectionData } from '@/data/solutionSection'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

/**
 * 04 — Recomendamos.
 *
 * O fecho da secção. A pergunta é o elemento tipograficamente mais forte de
 * toda a composição; a resposta e a recomendação entram a seguir. Sem
 * moldura de chat, para não repetir o ChatPreview da Hero.
 */
const TargetIcon = systemIcons.target

const questionLabel = { pt: 'Pergunta', en: 'Question' }

export function DecideVisual({ active }: { active: boolean }) {
  const { lang } = useLanguage()
  const { decision } = useSolutionSectionData()

  return (
    <div className="relative w-full">
      <div
        aria-hidden="true"
        className={cn(
          'absolute -inset-y-6 inset-x-0 bg-[radial-gradient(60%_60%_at_30%_35%,rgba(0,82,255,0.16),transparent_70%)] blur-2xl transition-opacity duration-1000',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div className="relative">
        <p
          className={cn(
            'text-[10px] uppercase tracking-[0.22em] text-mist transition-opacity duration-500',
            active ? 'opacity-100' : 'opacity-0',
          )}
        >
          {questionLabel[lang]}
        </p>

        <p
          className={cn(
            'mt-3 font-display text-[22px] font-semibold leading-tight tracking-[-0.02em] text-white transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-[26px]',
            active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
          style={{ transitionDelay: '120ms' }}
        >
          {decision.question}
        </p>

        <div
          className={cn(
            'mt-5 flex gap-3 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
            active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
          style={{ transitionDelay: '300ms' }}
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-accent/[0.4] bg-navy">
            <LogoMark className="h-2.5 text-white" />
          </span>
          <p className="text-[13.5px] leading-relaxed text-mist">{decision.answer}</p>
        </div>

        <div
          className={cn(
            'mt-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
            active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
          style={{ transitionDelay: '480ms' }}
        >
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-glow">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-glow" />
            {decision.recommendationLabel}
          </p>
          <p className="mt-2 text-[13px] leading-snug text-white">{decision.recommendation}</p>
        </div>

        <div
          className={cn(
            'mt-4 flex items-start gap-2.5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
            active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
          style={{ transitionDelay: '620ms' }}
        >
          <TargetIcon size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-glow" />
          <p className="text-[12px] leading-relaxed text-mist">{decision.impact}</p>
        </div>
      </div>
    </div>
  )
}

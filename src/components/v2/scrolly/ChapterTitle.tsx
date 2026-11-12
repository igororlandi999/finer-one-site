import { forwardRef } from 'react'
import { motion, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

/**
 * PROTÓTIPO /historia/ — título de capítulo do scrollytelling.
 * Os três pilares da marca: Compreender hoje · Antecipar amanhã · Decidir melhor
 * ("Understand today. Anticipate tomorrow. Decide better.").
 * Tudo é texto e formas vetoriais: fica nítido em qualquer ecrã e escala.
 */
export const chapters = {
  pt: [
    ['Compreender', 'hoje'],
    ['Antecipar', 'amanhã'],
    ['Decidir', 'melhor'],
  ],
  en: [
    ['Understand', 'today'],
    ['Anticipate', 'tomorrow'],
    ['Decide', 'better'],
  ],
} as const

type Props = {
  /** 0, 1 ou 2 */
  index: number
  theme: 'light' | 'dark'
  /** Progresso do scroll; o título revela-se entre from e from + 0.14. Sem valor = estático. */
  progress?: MotionValue<number>
  from?: number
}

/** O ponto final do título é um círculo real (ref), de onde nasce a transição seguinte. */
export const ChapterTitle = forwardRef<HTMLSpanElement, Props>(function ChapterTitle({ index, theme, progress, from = 0 }, dotRef) {
  const { lang } = useLanguage()
  const [word, when] = chapters[lang][index]
  const dark = theme === 'dark'
  return (
    <div className="flex flex-col items-center px-4 text-center">
      <Rail index={index} dark={dark} progress={progress} from={from} />
      <h2 className={cn('mt-8 font-display text-[clamp(52px,14.6vw,188px)] sm:text-[clamp(52px,12.6vw,188px)] font-bold leading-[0.92] tracking-[-0.055em] sm:mt-10', dark ? 'text-white' : 'text-navy')}>
        <Line progress={progress} at={from + 0.02}>{word}</Line>
        <Line progress={progress} at={from + 0.07} className={dark ? 'text-[#3D86FF]' : 'text-accent-deep'}>
          {when}
          <span ref={dotRef} aria-hidden="true" className="ml-[0.03em] inline-block h-[0.17em] w-[0.17em] rounded-full bg-accent align-baseline" />
          <span className="sr-only">.</span>
        </Line>
      </h2>
    </div>
  )
})

function Line({ children, progress, at, className }: { children: React.ReactNode; progress?: MotionValue<number>; at: number; className?: string }) {
  const fallback = useTransform(() => 0)
  const y = useTransform(progress ?? fallback, [at, at + 0.09], progress ? ['108%', '0%'] : ['0%', '0%'])
  return (
    <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
      <motion.span style={{ y }} className={cn('block', className)}>
        {children}
      </motion.span>
    </span>
  )
}

function Rail({ index, dark, progress, from }: { index: number; dark: boolean; progress?: MotionValue<number>; from: number }) {
  const { lang } = useLanguage()
  const fallback = useTransform(() => 1)
  const opacity = useTransform(progress ?? fallback, [from, from + 0.06], progress ? [0, 1] : [1, 1])
  return (
    <motion.ol style={{ opacity }} className={cn('flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] sm:gap-5 sm:text-[12px] sm:tracking-[0.28em]', dark ? 'text-white/40' : 'text-navy/35')}>
      {chapters[lang].map(([w], i) => (
        <li key={w} className={cn('flex items-center gap-3 sm:gap-5', i !== index && 'max-sm:hidden')}>
          {i > 0 && <span aria-hidden="true" className={cn('h-px w-5 max-sm:hidden sm:w-10', dark ? 'bg-white/20' : 'bg-navy/15')} />}
          <span className={cn('relative', i === index && (dark ? 'text-white' : 'text-navy'))}>
            <span>{w}</span>
            {i === index && <span aria-hidden="true" className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-accent" />}
          </span>
        </li>
      ))}
    </motion.ol>
  )
}

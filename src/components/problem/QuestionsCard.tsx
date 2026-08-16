import { useEffect, useState } from 'react'
import { BentoCard } from '@/components/problem/BentoCard'
import { useProblemSectionData } from '@/data/problemSection'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const INTERVAL = 2600

const copy = {
  pt: { title: 'Números não são respostas', description: 'Os indicadores mostram o que aconteceu. Decidir exige perceber causas, impacto e prioridade.' },
  en: { title: 'Numbers are not answers', description: 'Indicators show what happened. Deciding requires understanding causes, impact and priority.' },
}

export function QuestionsCard({ className }: { className?: string }) {
  const { ref, inView } = useInView<HTMLUListElement>({ threshold: 0.35 })
  const prefersReduced = usePrefersReducedMotion()
  const { lang } = useLanguage()
  const t = copy[lang]
  const { businessQuestions, highlightedQuestionIndex } = useProblemSectionData()
  const [active, setActive] = useState(highlightedQuestionIndex)

  useEffect(() => {
    // O ciclo só corre com o card visível e com movimento permitido.
    if (!inView || prefersReduced) return

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % businessQuestions.length)
    }, INTERVAL)

    return () => window.clearInterval(timer)
  }, [inView, prefersReduced, businessQuestions.length])

  return (
    <BentoCard className={className} delay={80} repeat title={t.title} description={t.description}>
      <ul ref={ref} className="space-y-1.5">
        {businessQuestions.map((question, index) => {
          const isActive = index === active

          return (
            <li
              key={question}
              className={cn(
                'flex items-start gap-2 rounded-lg border-l-2 py-2 pl-2.5 pr-2 text-[13px] leading-snug transition-colors duration-500',
                isActive
                  ? 'border-l-accent bg-white/[0.05] text-white'
                  : 'border-l-white/[0.08] text-mist/70',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500',
                  isActive ? 'bg-glow' : 'bg-white/15',
                )}
              />
              {question}
            </li>
          )
        })}
      </ul>
    </BentoCard>
  )
}

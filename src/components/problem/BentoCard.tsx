import type { ReactNode } from 'react'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  description: string
  children: ReactNode
  className?: string
  delay?: number
  repeat?: boolean
}

/**
 * Invólucro comum dos cards do Bento. Reutiliza a mesma linguagem de
 * superfície dos cards do dashboard da Hero (borda, fundo, raio).
 */
export function BentoCard({ title, description, children, className, delay, repeat }: Props) {
  return (
    <Reveal delay={delay} repeat={repeat} className={cn('flex', className)}>
      <article className="relative flex w-full flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.025]">
        <header className="p-5 sm:p-6">
          <h3 className="font-display text-[17px] font-semibold leading-snug tracking-[-0.01em] text-white sm:text-lg">
            {title}
          </h3>
          <p className="mt-2 max-w-[52ch] text-[13.5px] leading-relaxed text-mist">{description}</p>
        </header>

        <div className="relative mt-auto flex-1 px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
      </article>
    </Reveal>
  )
}

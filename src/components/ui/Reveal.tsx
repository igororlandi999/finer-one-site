import type { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  /** Atraso da entrada, em milissegundos. */
  delay?: number
}

/**
 * Entrada suave quando o elemento chega à viewport.
 * Usa a mesma animação `fade-up` da Hero, por isso é automaticamente
 * neutralizada por prefers-reduced-motion (ver index.css).
 */
export function Reveal({ children, className, delay = 0 }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      style={inView ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(inView ? 'animate-fade-up' : 'opacity-0', className)}
    >
      {children}
    </div>
  )
}

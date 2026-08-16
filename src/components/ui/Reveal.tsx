import type { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  /** Atraso da entrada, em milissegundos. */
  delay?: number
  /** Repete a animação sempre que o elemento volta a entrar na viewport,
   *  em vez de disparar apenas na primeira vez. */
  repeat?: boolean
}

/**
 * Entrada suave quando o elemento chega à viewport.
 * Usa a mesma animação `fade-up` da Hero, por isso é automaticamente
 * neutralizada por prefers-reduced-motion (ver index.css).
 */
export function Reveal({ children, className, delay = 0, repeat = false }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: !repeat })

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

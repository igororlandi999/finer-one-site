import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  show: boolean
  /** Atraso só na entrada; a saída é imediata, para nunca haver sobreposição. */
  delay?: number
  /** Deslocamento vertical de partida, em px. */
  y?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/**
 * Entrada/saída reversível controlada por estado (não por keyframes): o
 * mesmo elemento entra ao chegar e sai ao recuar, em qualquer sentido de
 * scroll. Neutralizada por movimento reduzido via index.css.
 */
export function Rise({ show, delay = 0, y = 12, className, style, children }: Props) {
  return (
    <div
      className={cn('transition-[opacity,transform] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]', className)}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translate3d(0,0,0)' : `translate3d(0,${y}px,0)`,
        transitionDelay: show ? `${delay}ms` : '0ms',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

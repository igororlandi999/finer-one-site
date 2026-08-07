import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Linguagem comum dos cinco cards de decisão.
 *
 * Deliberadamente separada das primitivas da fase 4: aqui as superfícies são
 * muito maiores e os números têm de aguentar mais peso, por isso as escalas
 * são outras. Nenhum destes elementos é usado fora desta secção.
 */

/** Etiqueta de campo — versaletes, sempre o mesmo tamanho e tracking. */
export function DataLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-[10px] uppercase leading-[1.3] tracking-[0.16em] text-mist', className)}>
      {children}
    </p>
  )
}

/** Número financeiro. Sempre tabular, sempre a mesma família de escalas. */
export function DataValue({
  children,
  size = 'md',
  className,
}: {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const scale = {
    sm: 'text-[13px] sm:text-[14px]',
    md: 'text-[17px] sm:text-[19px]',
    lg: 'text-[22px] sm:text-[26px]',
  }[size]

  return (
    <p className={cn('font-semibold tabular leading-tight text-white', scale, className)}>
      {children}
    </p>
  )
}

/** Superfície interna dos visuais. Mesmo raio e borda em todos os cards. */
export function Panel({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li'
}) {
  return (
    <Tag className={cn('rounded-xl border border-white/[0.07] bg-white/[0.025]', className)}>
      {children}
    </Tag>
  )
}

/** Barra horizontal proporcional. O `share` é sempre uma percentagem. */
export function Meter({
  share,
  tone = 'accent',
  className,
  delay = 0,
}: {
  share: number
  tone?: 'accent' | 'glow' | 'signal' | 'muted'
  className?: string
  delay?: number
}) {
  const fill = {
    accent: 'bg-gradient-to-r from-accent to-glow',
    glow: 'bg-glow',
    signal: 'bg-signal/70',
    muted: 'bg-white/[0.16]',
  }[tone]

  return (
    <span
      aria-hidden="true"
      className={cn('block h-1.5 overflow-hidden rounded-full bg-white/[0.07]', className)}
    >
      <span
        className={cn('block h-full origin-left animate-grow-right rounded-full', fill)}
        style={{ width: `${share}%`, animationDelay: `${delay}ms` }}
      />
    </span>
  )
}

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Linguagem comum das seis interfaces desta secção.
 *
 * Mesmos raios, bordas, escalas de etiqueta e densidade. É o que faz os seis
 * módulos parecerem o mesmo produto mesmo com conteúdos completamente
 * diferentes. Nenhum destes elementos é usado fora da secção.
 */

/** Etiqueta de campo — versaletes, sempre o mesmo tamanho e tracking. */
export function FieldLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-[10px] uppercase tracking-[0.16em] text-mist', className)}>{children}</p>
  )
}

/** Número financeiro. Sempre tabular, sempre a mesma família de escalas. */
export function Figure({
  children,
  size = 'md',
  className,
}: {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const scale = {
    sm: 'text-[12.5px] min-[420px]:text-[14px]',
    md: 'text-[17px] sm:text-[18px]',
    lg: 'text-[21px] sm:text-[24px]',
  }[size]

  return (
    <p className={cn('font-semibold tabular leading-tight text-white', scale, className)}>
      {children}
    </p>
  )
}

/** Superfície interna: usada em blocos, linhas de tabela e no visual secundário. */
export function Surface({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li' | 'article'
}) {
  return (
    <Tag className={cn('rounded-lg border border-white/[0.07] bg-white/[0.025]', className)}>
      {children}
    </Tag>
  )
}

/** Estado curto: em dia, disponível, atraso. */
export function Tag({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'warning'
}) {
  const tones = {
    neutral: 'border-white/[0.1] text-mist',
    accent: 'border-accent/[0.35] text-glow',
    warning: 'border-signal/[0.35] text-signal',
  }[tone]

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] leading-none',
        tones,
      )}
    >
      {children}
    </span>
  )
}

/** Régua horizontal fina, o divisor padrão dos módulos. */
export function Rule({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('block h-px bg-white/[0.07]', className)} />
}

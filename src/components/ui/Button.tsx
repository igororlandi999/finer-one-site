import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white shadow-[0_8px_28px_-10px_rgba(0,82,255,0.9)] hover:bg-accent-hover',
  outline: 'border border-white/[0.12] bg-white/[0.03] text-white hover:border-white/25 hover:bg-white/[0.06]',
  ghost: 'text-mist hover:bg-white/[0.06] hover:text-white',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

/**
 * Receita de classes do botão, isolada para poder ser aplicada a um <a>.
 *
 * Um destino de navegação tem de ser uma âncora: só assim há foco, teclado,
 * menu de contexto e leitura correta por tecnologia assistiva. O <button>
 * continua a ser usado para ações; para navegar, usa-se o <a> com estas
 * classes.
 */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(base, variants[variant], sizes[size], className)
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
})

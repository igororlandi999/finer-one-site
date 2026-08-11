import { cn } from '@/lib/utils'

/**
 * Marca "F" oficial da Finer One, vetorizada a partir do ficheiro enviado.
 * Usa currentColor para funcionar sobre qualquer fundo.
 *
 * Quando o logótipo horizontal oficial estiver disponível em ficheiro,
 * substituir apenas o componente <Logo /> — o resto do site não muda.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 326 445"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cn('h-6 w-auto', className)}
    >
      <path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" />
    </svg>
  )
}

export function Logo({
  className,
  markClassName,
  withWordmark = true,
}: {
  className?: string
  markClassName?: string
  withWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-white', className)}>
      <LogoMark className={cn('h-[22px]', markClassName)} />
      {withWordmark ? (
        <span className="font-display text-[15px] font-semibold leading-none tracking-[0.16em] text-white">
          FINER ONE
        </span>
      ) : null}
    </span>
  )
}

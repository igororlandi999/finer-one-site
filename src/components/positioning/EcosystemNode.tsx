import { systemIcons } from '@/components/problem/sourceIcons'
import { cn } from '@/lib/utils'

/**
 * Nós do ecossistema.
 *
 * Duas famílias com o mesmo desenho e pesos diferentes: as origens são
 * neutras — são sistemas que já existem e não pertencem à Finer One — e as
 * saídas são o que a camada devolve, por isso levam glow.
 *
 * Fundo opaco de propósito: a órbita passa por trás dos chips em vez de os
 * atravessar.
 */
export function EcosystemNode({
  label,
  icon,
  tone,
}: {
  label: string
  icon: string
  tone: 'source' | 'output'
}) {
  const Icon = systemIcons[icon]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap rounded-full border bg-navy px-3 py-1.5 text-[12px] leading-none backdrop-blur-sm sm:px-3.5 sm:py-2 sm:text-[12.5px]',
        tone === 'output'
          ? 'border-accent/[0.32] text-white'
          : 'border-white/[0.11] text-mist',
      )}
    >
      <Icon
        size={13}
        aria-hidden="true"
        className={cn('shrink-0', tone === 'output' ? 'text-glow' : 'text-mist')}
      />
      {label}
    </span>
  )
}

import { useRef } from 'react'
import type { MouseEvent } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { Principle, PrincipleId } from '@/data/trustSection'
import { cn } from '@/lib/utils'

/**
 * Princípio com iluminação a seguir o cursor.
 *
 * O spotlight é escrito diretamente em variáveis CSS do elemento, sem estado
 * React — mover o rato não provoca renders. Desligado quando o utilizador
 * pede menos movimento, e irrelevante em toque, onde o evento não ocorre.
 *
 * A iluminação é puramente decorativa: nenhum conteúdo depende dela, aqui ou
 * no painel. Sem cursor, os três princípios e as três zonas do painel leem-se
 * exatamente na mesma.
 */
export function TrustPrinciple({
  principle,
  active,
  onEnter,
  onLeave,
}: {
  principle: Principle
  active: PrincipleId | null
  onEnter: (id: PrincipleId) => void
  onLeave: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const isActive = active === principle.id

  const onMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (prefersReduced) return
    const element = ref.current
    if (!element) return

    const bounds = element.getBoundingClientRect()
    element.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`)
    element.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`)
  }

  return (
    <article
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => onEnter(principle.id)}
      onMouseLeave={onLeave}
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 transition-colors duration-500',
        isActive ? 'border-white/[0.16] bg-white/[0.035]' : 'border-white/[0.07] bg-white/[0.02]',
      )}
    >
      {prefersReduced ? null : (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity duration-300',
            isActive ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            background:
              'radial-gradient(240px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(30,144,255,0.12), transparent 68%)',
          }}
        />
      )}

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-colors duration-500',
              isActive ? 'bg-glow' : 'bg-white/25',
            )}
          />
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-mist">{principle.title}</h3>
        </div>

        <p className="mt-4 max-w-[30ch] font-display text-[17px] font-semibold leading-[1.25] tracking-[-0.015em] text-white sm:text-[18px]">
          {principle.headline}
        </p>

        <p className="mt-3 max-w-[52ch] text-[13px] leading-relaxed text-mist">{principle.body}</p>

        <p
          className={cn(
            'mt-4 text-[10px] uppercase tracking-[0.16em] transition-colors duration-500',
            isActive ? 'text-glow' : 'text-mist/50',
          )}
        >
          {principle.region}
        </p>
      </div>
    </article>
  )
}

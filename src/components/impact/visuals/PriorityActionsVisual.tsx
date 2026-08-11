import { useCaseEntrance } from '@/components/impact/useCaseEntrance'
import type { PriorityGroup, PriorityLevel } from '@/data/impactSection'
import { cn } from '@/lib/utils'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const levelStyles: Record<PriorityLevel, { badge: string; node: string; rail: string }> = {
  Alta: {
    badge: 'border-signal/[0.35] bg-signal/[0.12] text-signal',
    node: 'border-signal/60 bg-signal/20',
    rail: 'bg-signal/25',
  },
  Média: {
    badge: 'border-glow/[0.35] bg-glow/[0.1] text-glow',
    node: 'border-glow/55 bg-glow/15',
    rail: 'bg-glow/20',
  },
  Baixa: {
    badge: 'border-white/[0.12] bg-white/[0.04] text-mist',
    node: 'border-white/25 bg-white/[0.06]',
    rail: 'bg-white/[0.1]',
  },
}

/**
 * Caso 04 — o que fazer primeiro.
 *
 * Este caso não tem números para desenhar: o dado É a ordem. Por isso o
 * visual é um percurso vertical e não um gráfico — nível de prioridade,
 * ações desse nível, nível seguinte. A calha liga os três níveis para deixar
 * claro que existe sequência, e não três listas soltas.
 *
 * As ações entram em cascata pela ordem de prioridade: é a animação a
 * transportar a mensagem do caso, e não decoração.
 *
 * A cor `signal` está reservada ao nível Alta, sempre acompanhada da palavra
 * "Alta" — o nível nunca depende só da cor.
 */
export function PriorityActionsVisual({
  groups,
  visible,
}: {
  groups: PriorityGroup[]
  visible: boolean
}) {
  const { entered, stagger } = useCaseEntrance(visible)

  let order = 0

  return (
    <ol className="space-y-4">
      {groups.map((group, groupIndex) => {
        const styles = levelStyles[group.level]
        const last = groupIndex === groups.length - 1

        return (
          <li key={group.level} className="relative pl-7">
            {/* bottom negativo igual ao space-y-4: a calha atravessa o
                intervalo e encosta ao nó do nível seguinte. */}
            {!last ? (
              <span
                aria-hidden="true"
                className={cn('absolute bottom-[-16px] left-[7px] top-5 w-px', styles.rail)}
              />
            ) : null}

            <span
              aria-hidden="true"
              className={cn(
                'absolute left-0 top-1 flex h-[15px] w-[15px] items-center justify-center rounded-full border',
                styles.node,
              )}
              style={{
                transform: entered ? 'scale(1)' : 'scale(0.4)',
                opacity: entered ? 1 : 0,
                transition: `transform 420ms ${EASE} ${stagger(groupIndex, 130)}ms, opacity 420ms ease ${stagger(groupIndex, 130)}ms`,
              }}
            />

            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'inline-flex rounded-full border px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.12em]',
                  styles.badge,
                )}
              >
                {group.level}
              </span>
              <span className="text-[11px] text-mist/70">
                {group.actions.length === 1 ? '1 ação' : `${group.actions.length} ações`}
              </span>
            </div>

            <ul className="mt-2.5 space-y-1.5">
              {group.actions.map((action) => {
                const delay = stagger(order, 110) + 120
                order += 1

                return (
                  <li
                    key={action}
                    className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3.5 py-2 text-[12.5px] leading-snug text-white/[0.9]"
                    style={{
                      opacity: entered ? 1 : 0,
                      transform: entered ? 'translateY(0)' : 'translateY(8px)',
                      transition: `opacity 460ms ease ${delay}ms, transform 460ms ${EASE} ${delay}ms`,
                    }}
                  >
                    {action}
                  </li>
                )
              })}
            </ul>
          </li>
        )
      })}
    </ol>
  )
}

import { Activity, Database, ListChecks, ScanSearch, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ProcessVisual } from '@/components/process/ProcessVisual'
import type { ProcessStep as Step } from '@/data/processSection'
import { cn } from '@/lib/utils'

const stepIcons: Record<Step['icon'], LucideIcon> = {
  ligar: Database,
  analisar: ScanSearch,
  identificar: Activity,
  antecipar: TrendingUp,
  recomendar: ListChecks,
}

/**
 * Uma etapa da cascata.
 *
 * A calha entre etapas é um segmento reto desenhado de nó a nó. A caixa que o
 * contém vai do fundo do disco desta etapa até ao topo do disco da seguinte
 * (`-bottom-*` = a distância exata entre etapas) e tem exatamente a largura do
 * degrau de indentação. O traço é `M0,0 L1,1` num viewBox unitário com
 * `preserveAspectRatio="none"`: seja qual for a altura real do bloco ou a
 * largura do degrau, os extremos caem sempre no centro dos dois nós. Não há
 * coordenadas fixas nem medição de DOM, e por isso nada se desliga quando o
 * texto quebra em mais linhas.
 *
 * Em telemóvel o degrau é zero e a mesma caixa degenera numa linha vertical —
 * a geometria é a mesma primitiva, não um desenho de desktop reescalado.
 *
 * O traço de progresso por cima usa `pathLength={1}` e um dashoffset de 1
 * para 0: a linha desenha-se sozinha quando a etapa seguinte é alcançada, sem
 * medir o comprimento real do caminho.
 */
export function ProcessStep({
  step,
  index,
  last,
  reached,
  current,
  filled,
  nodeRef,
}: {
  step: Step
  index: number
  last: boolean
  reached: boolean
  current: boolean
  /** O troço até à etapa seguinte já foi percorrido. */
  filled: boolean
  nodeRef: (element: HTMLLIElement | null) => void
}) {
  const Icon = stepIcons[step.icon]

  return (
    <li
      ref={nodeRef}
      data-step-index={index}
      style={{ ['--degrau' as string]: `${index * 32}px` }}
      className="relative lg:[margin-left:var(--degrau)]"
    >
      {/* Troço até à etapa seguinte. */}
      {!last ? (
        <span
          aria-hidden="true"
          className="absolute -bottom-10 left-6 top-12 w-px lg:-bottom-12 lg:w-8"
        >
          <svg
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <line
              x1="0"
              y1="0"
              x2="1"
              y2="1"
              stroke="rgba(255,255,255,0.09)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="0"
              y1="0"
              x2="1"
              y2="1"
              stroke="#1E90FF"
              strokeWidth={1}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={filled ? 0 : 1}
              className="transition-[stroke-dashoffset] duration-[900ms] ease-out motion-reduce:transition-none"
            />
          </svg>
        </span>
      ) : null}

      <div className="flex gap-4 lg:gap-6">
        {/* Nó */}
        <span
          aria-hidden="true"
          className={cn(
            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-700 motion-reduce:transition-none',
            reached
              ? 'border-glow/[0.35] bg-navy-soft text-glow'
              : 'border-white/[0.08] bg-navy-soft/60 text-mist/60',
          )}
        >
          <Icon size={19} />
          {/* Halo local da etapa em curso. Decorativo e muito contido. */}
          <span
            className={cn(
              'pointer-events-none absolute -inset-3 -z-10 rounded-2xl bg-[radial-gradient(closest-side,rgba(0,82,255,0.35),transparent_75%)] blur-md transition-opacity duration-700 motion-reduce:transition-none',
              current ? 'opacity-100' : 'opacity-0',
            )}
          />
        </span>

        <div className="min-w-0 flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-8">
          <div className="min-w-0">
            <p
              className={cn(
                'font-display text-[11px] font-semibold tracking-[0.2em] transition-colors duration-700 motion-reduce:transition-none',
                reached ? 'text-glow' : 'text-mist/50',
              )}
            >
              {step.number}
            </p>
            <h3 className="mt-2 text-balance font-display text-[18px] font-semibold leading-snug tracking-[-0.015em] text-white sm:text-[20px]">
              {step.title}
            </h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist">
              {step.description}
            </p>
          </div>

          <div className="mt-5 min-w-0 lg:mt-0">
            <ProcessVisual id={step.icon} dim={!reached} />
          </div>
        </div>
      </div>
    </li>
  )
}

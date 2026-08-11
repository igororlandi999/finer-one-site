import type { PlanId } from '@/data/pricing'
import { cn } from '@/lib/utils'

/**
 * Detalhe visual de cada card — dá personalidade sem transformar o plano num
 * dashboard. São formas mudas, não demonstrações de funcionalidade:
 *
 *   Plus  barras a subir        acompanhar o que aconteceu
 *   Pro   realizado e previsão  antecipar o que vem a seguir
 *   Team  nós ligados           a mesma informação partilhada
 */
export function PlanMicroVisual({ id }: { id: PlanId }) {
  if (id === 'plus') {
    const bars = [30, 44, 36, 52, 46, 66, 78]

    return (
      <div aria-hidden="true" className="flex h-9 items-end gap-2">
        {bars.map((height, index) => (
          <span
            key={index}
            className={cn(
              'w-[3px] origin-bottom animate-grow-up rounded-full',
              index === bars.length - 1 ? 'bg-white/30' : 'bg-white/[0.16]',
            )}
            style={{ height: `${height}%`, animationDelay: `${index * 60}ms` }}
          />
        ))}
      </div>
    )
  }

  if (id === 'pro') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 160 36"
        preserveAspectRatio="none"
        className="h-9 w-full overflow-visible"
      >
        <path
          d="M2,30 L34,25 L66,27 L94,16"
          fill="none"
          stroke="#1E90FF"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M94,16 L124,10 L158,4"
          fill="none"
          stroke="#0052FF"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="94" cy="16" r="2.5" fill="#070D2B" stroke="#1E90FF" strokeWidth={1.5} />
      </svg>
    )
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 36"
      preserveAspectRatio="none"
      className="h-9 w-full overflow-visible"
    >
      <g stroke="rgba(255,255,255,0.16)" strokeWidth={1} vectorEffect="non-scaling-stroke">
        <line x1="80" y1="18" x2="24" y2="8" />
        <line x1="80" y1="18" x2="24" y2="30" />
        <line x1="80" y1="18" x2="136" y2="8" />
        <line x1="80" y1="18" x2="136" y2="30" />
      </g>
      <g fill="rgba(255,255,255,0.28)">
        <circle cx="24" cy="8" r="2.5" />
        <circle cx="24" cy="30" r="2.5" />
        <circle cx="136" cy="8" r="2.5" />
        <circle cx="136" cy="30" r="2.5" />
      </g>
      <circle cx="80" cy="18" r="3.5" fill="#070D2B" stroke="#1E90FF" strokeWidth={1.5} />
    </svg>
  )
}

import { BentoCard } from '@/components/problem/BentoCard'
import { systemIcons } from '@/components/problem/sourceIcons'
import { dataSources } from '@/data/problemSection'
import { cn } from '@/lib/utils'

/** Inclinação e deriva ligeiras: sugerem dispersão sem parecer desarrumação. */
const tilt = ['-rotate-[1.2deg]', 'rotate-[0.9deg]', 'rotate-[0.6deg]', '-rotate-[0.8deg]', 'rotate-[1.4deg]']
const driftDelay = ['0s', '1.4s', '2.8s', '0.7s', '2.1s']

export function DataSourcesCard({ className }: { className?: string }) {
  return (
    <BentoCard
      className={className}
      title="Informação em demasiados sítios"
      description="Os dados existem. O problema é reuni-los e perceber o que realmente significam."
    >
      <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:grid-cols-3">
        {dataSources.map((source, index) => {
          const Icon = systemIcons[source.icon]

          return (
            <div
              key={source.system}
              className={cn(
                'animate-drift rounded-lg border border-white/[0.08] bg-navy-soft/70 p-2.5 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.9)]',
                tilt[index],
              )}
              style={{ animationDelay: driftDelay[index] }}
            >
              <div className="flex items-start gap-1.5 text-mist">
                <Icon size={11} aria-hidden="true" className="mt-px shrink-0" />
                <span className="text-[10px] font-medium uppercase leading-tight tracking-wider">
                  {source.system}
                </span>
              </div>
              <p className="mt-2 truncate text-[11px] text-mist">{source.label}</p>
              <p className="mt-0.5 truncate text-[15px] font-semibold tabular text-white">
                {source.value}
              </p>
            </div>
          )
        })}

        {/* Reforça que a lista não está fechada. */}
        <div
          aria-hidden="true"
          className="flex items-center justify-center rounded-lg border border-dashed border-white/[0.09] p-2.5 text-center text-[10px] leading-snug text-mist/70"
        >
          e outros ficheiros
          <br />e sistemas
        </div>
      </div>
    </BentoCard>
  )
}

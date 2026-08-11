import { ArrowRight } from 'lucide-react'
import { factors, provenance } from '@/data/trustSection'
import { cn } from '@/lib/utils'

/**
 * Proveniência da análise — o pilar da transparência.
 *
 * Demonstra a filosofia do produto: uma conclusão deve conseguir apresentar
 * os fatores que a sustentam, o período analisado e o limite da informação
 * disponível. Não descreve nenhum motor de explicabilidade implementado.
 */
export function DataProvenance({ lit }: { lit: boolean }) {
  return (
    <div>
      <ul className="space-y-3">
        {factors.map((factor, index) => (
          <li key={factor.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[12.5px] text-white">{factor.label}</span>
              <span className="shrink-0 text-[13px] font-semibold tabular text-white">
                {factor.value}
              </span>
            </div>
            <span aria-hidden="true" className="mt-1.5 block h-1 rounded-full bg-white/[0.07]">
              <span
                className={cn(
                  'block h-full origin-left animate-grow-right rounded-full transition-colors duration-500',
                  lit ? 'bg-gradient-to-r from-accent to-glow' : 'bg-white/25',
                )}
                style={{ width: `${factor.share}%`, animationDelay: `${index * 110}ms` }}
              />
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2">
        {provenance.map((item) => (
          <div key={item.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-[11.5px] text-mist">{item.label}</dt>
            <dd className="shrink-0 text-[11.5px] tabular text-white">{item.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-medium text-glow">
        Ver dados utilizados
        <ArrowRight size={12} aria-hidden="true" />
      </p>
    </div>
  )
}

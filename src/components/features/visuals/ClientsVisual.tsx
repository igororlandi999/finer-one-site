import { FieldLabel, Figure, Rule, Surface, Tag } from '@/components/features/primitives'
import { clients, clientsAgeing, clientsMetrics } from '@/data/featuresSection'
import { cn } from '@/lib/utils'

/** 04 — Clientes & Fornecedores. Exposição, atrasos e concentração. */
export function ClientsVisual() {
  return (
    <div className="flex h-full flex-col">
      {/* Mesmo problema do cashflow: "Contas a receber" e "Concentração top
          5" não cabem em três colunas a 360px. Métrica principal a largura
          completa em telemóvel, fila de três a partir de sm. */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
        {clientsMetrics.map((metric, index) => (
          <Surface
            key={metric.label}
            className={cn('p-2.5', index === 0 && 'col-span-2 sm:col-span-1')}
          >
            <FieldLabel
              className={cn('min-h-[26px] leading-[1.3]', index === 0 && 'max-sm:min-h-0')}
            >
              {metric.label}
            </FieldLabel>
            <Figure size="sm" className={cn('mt-1.5', index === 1 && 'text-signal')}>
              {metric.value}
            </Figure>
          </Surface>
        ))}
      </div>

      <Surface className="mt-2.5 flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[12px] font-semibold text-white">Maiores posições em aberto</p>
          <p className="hidden text-[10px] text-mist sm:block">Valor por receber</p>
        </div>

        <Rule className="mt-3" />

        <ul className="min-h-0 flex-1">
          {clients.map((client, index) => (
            <li
              key={client.name}
              className="flex animate-panel-in items-center gap-3 border-b border-white/[0.05] py-2.5 last:border-b-0"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-white">
                {client.name}
              </span>
              <span className="shrink-0 text-[13px] font-semibold tabular text-white">
                {client.value}
              </span>
              <span className="w-[104px] shrink-0 text-right sm:w-[124px]">
                <Tag tone={client.late ? 'warning' : 'neutral'}>{client.status}</Tag>
              </span>
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  )
}

/** Visual secundário: ageing das contas a receber. */
export function ClientsAside() {
  return (
    <>
      <FieldLabel>Contas a receber por antiguidade</FieldLabel>

      <ul className="mt-3 space-y-2.5">
        {clientsAgeing.map((band, index) => (
          <li key={band.label}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-mist">{band.label}</span>
              <span className="text-[11px] font-semibold tabular text-white">{band.share}%</span>
            </div>
            <span aria-hidden="true" className="mt-1 block h-1 rounded-full bg-white/[0.07]">
              <span
                className={cn(
                  'block h-full origin-left animate-grow-right rounded-full',
                  band.late ? 'bg-signal/70' : 'bg-gradient-to-r from-accent to-glow',
                )}
                style={{ width: `${band.share}%`, animationDelay: `${index * 80}ms` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

import { DataLabel, DataValue, Panel } from '@/components/decisions/primitives'
import type { Decision } from '@/data/decisionsSection'
import { cn } from '@/lib/utils'

/**
 * Único visual desta secção — reutilizado pelos quatro cartões.
 *
 * Grelha 2x2 de princípios (o quarto sempre em destaque azul, mesmo
 * tratamento que já existia nos KPIs desta secção: `border-accent/[0.35]
 * bg-accent/[0.06]` no Panel, `text-glow` no valor) e, quando o cartão tem
 * `flow`, uma faixa horizontal por baixo com um fluxo tipográfico curto —
 * mesma forma que o painel de impacto que já existia aqui, sem SVG nem
 * linhas de conexão, só tipografia.
 *
 * Sem `flow` a grelha centra-se na altura disponível em vez de ficar presa
 * ao topo com espaço vazio por baixo — os cartões 02 e 03 não têm faixa
 * (ver src/data/decisionsSection.ts), por desenho.
 */
export function PrincipleVisual({ decision }: { decision: Decision }) {
  return (
    <div className={cn('flex h-full flex-col gap-3', !decision.flow && 'justify-center')}>
      <div className="grid grid-cols-2 gap-2.5">
        {decision.grid.map((item) => (
          <Panel
            key={item.eyebrow}
            className={cn('p-3 sm:p-3.5', item.highlight && 'border-accent/[0.35] bg-accent/[0.06]')}
          >
            <DataLabel className="min-h-[26px]">{item.eyebrow}</DataLabel>
            <DataValue size="sm" className={cn('mt-2', item.highlight && 'text-glow')}>
              {item.title}
            </DataValue>
          </Panel>
        ))}
      </div>

      {decision.flow ? (
        <Panel className="p-3 sm:p-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <DataLabel>{decision.flow.eyebrow}</DataLabel>
            {decision.flow.note ? (
              <span className="shrink-0 text-[10.5px] text-mist">{decision.flow.note}</span>
            ) : null}
          </div>

          <div className="mt-3 flex items-start justify-between gap-1.5">
            {decision.flow.steps.map((step, index) => (
              <div key={step.label} className="flex min-w-0 flex-1 items-start gap-1.5">
                {index > 0 ? (
                  <span aria-hidden="true" className="mt-1 shrink-0 text-[11px] text-mist/50">
                    →
                  </span>
                ) : null}
                <div className="min-w-0 flex-1 text-center">
                  <p className="truncate text-[11.5px] font-medium text-white sm:text-[12.5px]">
                    {step.label}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-mist">{step.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  )
}

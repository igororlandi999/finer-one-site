import { ImpactReading } from '@/components/impact/ImpactReading'
import { ImpactRecommendation } from '@/components/impact/ImpactRecommendation'
import { CashflowPressureVisual } from '@/components/impact/visuals/CashflowPressureVisual'
import { ClientRiskVisual } from '@/components/impact/visuals/ClientRiskVisual'
import { CostPressureVisual } from '@/components/impact/visuals/CostPressureVisual'
import { PriorityActionsVisual } from '@/components/impact/visuals/PriorityActionsVisual'
import type { ImpactCase } from '@/data/impactSection'
import { cn } from '@/lib/utils'

/**
 * Escolha do microvisual a partir do caso.
 *
 * O `switch` sobre `id` é o que faz a união discriminada valer alguma coisa:
 * dentro de cada ramo o TypeScript já conhece o payload certo, por isso é
 * impossível passar os pontos de tesouraria ao visual dos clientes.
 */
function CaseVisual({ item, visible }: { item: ImpactCase; visible: boolean }) {
  switch (item.id) {
    case 'custos':
      return <CostPressureVisual rows={item.rows} visible={visible} />
    case 'tesouraria':
      return (
        <CashflowPressureVisual
          points={item.points}
          threshold={item.threshold}
          thresholdLabel={item.thresholdLabel}
          zone={item.zone}
          visible={visible}
        />
      )
    case 'clientes':
      return (
        <ClientRiskVisual
          total={item.total}
          rows={item.rows}
          othersLabel={item.othersLabel}
          visible={visible}
        />
      )
    case 'prioridades':
      return <PriorityActionsVisual groups={item.groups} visible={visible} />
  }
}

/**
 * Painel do caso ativo — pergunta, dados, leitura, recomendação.
 *
 * O cabeçalho ocupa a largura toda porque a pergunta comanda tudo o que vem
 * abaixo. O corpo divide-se em duas colunas em `lg`: à esquerda a evidência
 * (métrica e microvisual), à direita a interpretação e a ação. É a mesma
 * sequência em qualquer largura — abaixo de `lg` as colunas empilham e a
 * ordem de leitura mantém-se pergunta → visual → leitura → recomendação.
 *
 * `min-h` em `lg` evita que a página salte de altura ao trocar de caso: os
 * quatro visuais têm alturas naturais diferentes e sem isto o rodapé da
 * secção mexia a cada clique.
 *
 * Este componente é remontado por `key` a cada troca de caso — é isso que faz
 * as transições de entrada dos visuais recomeçarem sem estado extra.
 */
export function ImpactCasePanel({ item, visible }: { item: ImpactCase; visible: boolean }) {
  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.02] sm:rounded-3xl',
        visible ? 'animate-panel-in' : undefined,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(0,82,255,0.1),transparent_75%)]"
      />

      <header className="relative border-b border-white/[0.07] px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="tabular text-[10px] tracking-[0.18em] text-glow">
            CASO {item.index}
          </span>
          <span aria-hidden="true" className="h-px w-5 bg-white/[0.14]" />
          <span className="text-[10px] uppercase tracking-[0.16em] text-mist/70">
            {item.caption}
          </span>
        </div>

        <h3 className="mt-3 text-balance font-display text-[21px] font-semibold leading-[1.16] tracking-[-0.025em] text-white sm:text-[25px] lg:text-[27px]">
          {item.question}
        </h3>
      </header>

      <div className="relative grid lg:min-h-[440px] lg:grid-cols-[minmax(0,1.28fr)_minmax(0,1fr)]">
        <div className="px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <p className="tabular font-display text-[30px] font-semibold leading-none tracking-[-0.025em] text-white sm:text-[34px]">
                {item.metric.value}
              </p>
              <p className="mt-2 text-[11.5px] text-mist">{item.metric.label}</p>
            </div>

            <ul className="flex flex-wrap gap-2">
              {item.chips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border border-white/[0.09] bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/[0.78]"
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <CaseVisual item={item} visible={visible} />
          </div>
        </div>

        <div className="border-t border-white/[0.07] bg-navy-deep/50 px-5 py-6 sm:px-7 lg:border-l lg:border-t-0 lg:px-8 lg:py-7">
          <div className="flex h-full flex-col gap-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-mist/70">
                O que os dados mostram
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mist">{item.evidence}</p>
            </div>

            <span aria-hidden="true" className="h-px w-full bg-white/[0.06]" />

            <ImpactReading>{item.reading}</ImpactReading>

            <div className="mt-auto pt-1">
              <ImpactRecommendation label={item.recommendationLabel}>
                {item.recommendation}
              </ImpactRecommendation>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

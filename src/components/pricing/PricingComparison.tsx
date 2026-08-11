import { useState } from 'react'
import { FeatureValueCell } from '@/components/pricing/PricingFeature'
import { comparison, plans, pricingCopy, recommendedPlan } from '@/data/pricing'
import type { PlanId } from '@/data/pricing'
import { cn } from '@/lib/utils'

/**
 * Comparação completa.
 *
 * Desktop: tabela HTML real, com `<th scope>` nas duas direções, para que um
 * leitor de ecrã anuncie a que plano e a que capacidade pertence cada célula.
 *
 * Telemóvel: a mesma informação sem tabela larga. O visitante escolhe um
 * plano e lê as capacidades em lista — botões reais, com aria-pressed, e o
 * estado nunca depende de cor sozinha.
 */
export function PricingComparison() {
  const [selected, setSelected] = useState<PlanId>(recommendedPlan)

  return (
    <div>
      {/* Telemóvel e tablet */}
      <div className="lg:hidden">
        <div
          role="group"
          aria-label="Escolher plano a consultar"
          className="grid grid-cols-3 gap-2"
        >
          {plans.map((plan) => {
            const isSelected = plan.id === selected

            return (
              <button
                key={plan.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(plan.id)}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors duration-300',
                  isSelected
                    ? 'border-accent/[0.5] bg-accent/[0.12] text-white'
                    : 'border-white/[0.08] bg-white/[0.02] text-mist',
                )}
              >
                {plan.name}
              </button>
            )
          })}
        </div>

        <div className="mt-6 space-y-7">
          {comparison.map((group) => (
            <section key={group.title} aria-label={group.title}>
              <h4 className="text-[10px] uppercase tracking-[0.18em] text-mist">{group.title}</h4>

              <ul className="mt-3">
                {group.rows.map((row) => {
                  const value = row.values[selected]

                  return (
                    <li
                      key={row.label}
                      className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-2.5 last:border-b-0"
                    >
                      <span
                        className={cn(
                          'text-[13px]',
                          value === false ? 'text-mist/50' : 'text-white',
                        )}
                      >
                        {row.label}
                      </span>
                      <span className="shrink-0 text-right">
                        <FeatureValueCell value={value} emphasis={selected === recommendedPlan} />
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            Capacidades incluídas em cada plano da Finer One
          </caption>

          <thead>
            <tr>
              <th scope="col" className="w-[40%] pb-4 text-left">
                <span className="text-[10px] uppercase tracking-[0.18em] text-mist">
                  Capacidade
                </span>
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  scope="col"
                  className={cn(
                    'pb-4 text-center',
                    plan.id === recommendedPlan && 'rounded-t-lg bg-white/[0.03]',
                  )}
                >
                  {plan.id === recommendedPlan ? (
                    <span
                      aria-hidden="true"
                      className="mx-auto mb-2.5 block h-px w-10 bg-accent"
                    />
                  ) : (
                    <span aria-hidden="true" className="mb-2.5 block h-px" />
                  )}
                  <span
                    className={cn(
                      'text-[13px] font-semibold',
                      plan.id === recommendedPlan ? 'text-white' : 'text-mist',
                    )}
                  >
                    {plan.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {comparison.map((group) => (
            <tbody key={group.title}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={4}
                  className="border-t border-white/[0.08] pb-3 pt-6 text-left"
                >
                  <span className="text-[10px] uppercase tracking-[0.18em] text-glow">
                    {group.title}
                  </span>
                </th>
              </tr>

              {group.rows.map((row) => (
                <tr key={row.label} className="border-t border-white/[0.05]">
                  <th scope="row" className="py-3 text-left font-normal">
                    <span className="text-[13.5px] text-white">{row.label}</span>
                  </th>
                  {plans.map((plan) => (
                    <td
                      key={plan.id}
                      className={cn(
                        'py-3 text-center',
                        plan.id === recommendedPlan && 'bg-white/[0.03]',
                      )}
                    >
                      <FeatureValueCell
                        value={row.values[plan.id]}
                        emphasis={plan.id === recommendedPlan}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      <p className="mt-8 text-[12px] leading-relaxed text-mist/70">{pricingCopy.note}</p>
    </div>
  )
}

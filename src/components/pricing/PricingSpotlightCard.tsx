import { PlanMicroVisual } from '@/components/pricing/PlanMicroVisual'
import { Button } from '@/components/ui/Button'
import { useSpotlight } from '@/hooks/useSpotlight'
import { pricingCopy } from '@/data/pricing'
import type { Plan } from '@/data/pricing'
import { cn } from '@/lib/utils'

/**
 * Card de plano com iluminação a seguir o cursor.
 *
 * São três camadas independentes:
 *
 *  1. ambiente — só no plano recomendado, sempre visível, muito ténue. É o
 *     que faz o Pro parecer recomendado antes de qualquer interação.
 *  2. interior — halo localizado que segue o cursor.
 *  3. borda — o mesmo halo recortado por máscara, de forma a acender apenas
 *     o troço de borda junto ao cursor, nunca o contorno inteiro.
 *
 * A posição vem de variáveis CSS escritas por ref (ver useSpotlight); a
 * visibilidade vem de group-hover e group-focus-within. Nenhuma das duas
 * passa por estado React.
 *
 * O focus-within existe para que a navegação por teclado receba a mesma
 * resposta visual que o rato. Tudo isto é decorativo: o card lê-se
 * exatamente igual sem cursor, que é o caso de qualquer ecrã táctil.
 */
export function PricingSpotlightCard({ plan, recommended }: { plan: Plan; recommended: boolean }) {
  const { ref, onPointerMove } = useSpotlight<HTMLDivElement>()

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn(
        'group relative h-full rounded-2xl transition-colors duration-500',
        recommended ? 'bg-white/[0.035]' : 'bg-white/[0.015]',
      )}
      style={{ ['--spot-x' as string]: '50%', ['--spot-y' as string]: '0%' }}
    >
      {/* Borda base */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 rounded-2xl border transition-colors duration-500',
          recommended ? 'border-accent/[0.4]' : 'border-white/[0.08]',
        )}
      />

      {/* Camada 1 — ambiente do plano recomendado */}
      {recommended ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 rounded-b-2xl bg-[radial-gradient(70%_100%_at_50%_100%,rgba(0,82,255,0.14),transparent_72%)]"
        />
      ) : null}

      {/* Camada 2 — halo interior a seguir o cursor */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          background:
            'radial-gradient(380px circle at var(--spot-x) var(--spot-y), rgba(30,144,255,0.10), transparent 62%)',
        }}
      />

      {/* Camada 3 — troço de borda aceso junto ao cursor */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl p-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          background:
            'radial-gradient(260px circle at var(--spot-x) var(--spot-y), rgba(30,144,255,0.75), transparent 60%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      <article className="relative flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[17px] font-semibold tracking-[0.02em] text-white">
            {plan.name}
          </h3>
          {/*
            A etiqueta comunica disponibilidade e não hierarquia comercial: o
            visitante precisa de saber, antes de ler capacidades, o que pode
            contratar hoje. O destaque do plano disponível continua a ser feito
            pela iluminação do card.
          */}
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]',
              plan.available
                ? 'border-accent/[0.45] bg-accent/[0.12] text-glow'
                : 'border-white/[0.12] bg-white/[0.03] text-mist',
            )}
          >
            {plan.statusLabel}
          </span>
        </div>

        <p className="mt-5 min-h-[52px] max-w-[24ch] font-display text-[17px] font-semibold leading-[1.28] tracking-[-0.015em] text-white sm:text-[18px]">
          {plan.promise}
        </p>

        <p className="mt-3.5 min-h-[60px] text-[13px] leading-relaxed text-mist">
          {plan.description}
        </p>

        <div className="mt-7">
          <p className="text-[10px] uppercase tracking-[0.18em] text-mist">{plan.priceNote}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-[28px] font-semibold leading-none tabular text-white/[0.85]">
              {plan.price ?? '€—'}
            </span>
            <span className="text-[12.5px] text-mist">{plan.period}</span>
          </div>
        </div>

        {/*
          Um plano que ainda não existe não recebe botão. Um <button disabled>
          seria igualmente enganador — sugere uma ação que vai destrancar. Aqui
          é uma legenda, sem foco nem cursor de ação.
        */}
        <div className="mt-6">
          {plan.available ? (
            <Button
              variant={recommended ? 'primary' : 'outline'}
              size="lg"
              className="w-full"
              aria-label={`${plan.cta} — plano ${plan.name}`}
            >
              {plan.cta}
            </Button>
          ) : (
            <p className="flex h-12 w-full items-center justify-center rounded-lg border border-dashed border-white/[0.12] px-5 text-[13px] text-mist">
              {pricingCopy.unavailableLabel}
            </p>
          )}
        </div>

        <div className="mt-7 border-t border-white/[0.07] pt-6">
          {plan.inherits ? (
            <p className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-glow">
              <span aria-hidden="true" className="h-px w-4 bg-glow/60" />
              {plan.inherits}
            </p>
          ) : null}

          <ul className="space-y-4">
            {plan.capabilities.map((capability) => (
              <li key={capability.group}>
                <p className="text-[10px] uppercase tracking-[0.16em] text-mist/70">
                  {capability.group}
                </p>
                <p className="mt-1 text-[13.5px] leading-snug text-white">{capability.label}</p>
              </li>
            ))}
          </ul>

          {plan.footnote ? (
            <p className="mt-5 text-[11.5px] leading-snug text-mist/70">{plan.footnote}</p>
          ) : null}
        </div>

        <div className="mt-8 pt-2 lg:mt-auto">
          <PlanMicroVisual id={plan.id} />
        </div>
      </article>
    </div>
  )
}

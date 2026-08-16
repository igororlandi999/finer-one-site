import { Info } from 'lucide-react'
import { PricingSpotlightCard } from '@/components/pricing/PricingSpotlightCard'
import { Reveal } from '@/components/ui/Reveal'
import { usePricingData } from '@/data/pricing'

/**
 * Oitava secção: planos e preços.
 *
 * Três cards independentes, comparáveis lado a lado pela própria leitura —
 * cada um lista o que está incluído (e, quando aplicável, o que falta) sem
 * repetir o que já herda do plano anterior ("Tudo do Plus"/"Tudo do Pro").
 * Sem tabela de comparação: a progressão Plus -> Pro -> Team já fica óbvia
 * pelas listas.
 *
 * PREÇOS: nenhum valor é apresentado enquanto não estiverem definidos. Ver
 * src/data/pricing.ts.
 */
export function PricingSection() {
  const { plans, pricingCopy, recommendedPlan } = usePricingData()

  return (
    <section
      id="precos"
      aria-labelledby="precos-titulo"
      className="relative isolate scroll-mt-24 bg-gradient-to-b from-navy-deep to-navy pb-28 pt-24 sm:pt-28 lg:pb-36 lg:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(65%_100%_at_50%_0%,rgba(0,82,255,0.08),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <h2
            id="precos-titulo"
            className="text-balance font-display text-[28px] font-semibold leading-[1.14] tracking-[-0.03em] text-white sm:text-[36px] lg:text-[42px]"
          >
            {pricingCopy.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-[60ch] text-balance text-[15px] leading-relaxed text-mist">
            {pricingCopy.subheadline}
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-4 sm:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {plans.map((plan, index) => (
            <Reveal
              key={plan.id}
              delay={index * 90}
              className={plan.id === 'team' ? 'h-full md:col-span-2 lg:col-span-1' : 'h-full'}
            >
              <PricingSpotlightCard plan={plan} recommended={plan.id === recommendedPlan} />
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-12 flex max-w-[64ch] items-start justify-center gap-2.5 text-center">
          <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-mist/70" />
          <span className="text-[12px] leading-relaxed text-mist/70">
            {pricingCopy.noteLines[0]}
            <br />
            {pricingCopy.noteLines[1]}
          </span>
        </p>
      </div>
    </section>
  )
}

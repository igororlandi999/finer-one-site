import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PricingComparison } from '@/components/pricing/PricingComparison'
import { PricingSpotlightCard } from '@/components/pricing/PricingSpotlightCard'
import { Reveal } from '@/components/ui/Reveal'
import { plans, pricingCopy, recommendedPlan } from '@/data/pricing'
import { cn } from '@/lib/utils'

/**
 * Oitava secção: planos e preços.
 *
 * Duas camadas de leitura. A primeira resolve-se em segundos — três planos
 * com narrativa própria e o Pro como centro visual. A segunda é racional e só
 * existe para quem a pedir.
 *
 * A ligação entre as duas não é um vazio: uma hairline desce do centro dos
 * cards até ao botão da comparação, para a secção se ler como uma peça só.
 *
 * PREÇOS: nenhum valor é apresentado enquanto não estiverem definidos. Ver
 * src/data/pricing.ts.
 */
export function PricingSection() {
  const [open, setOpen] = useState(false)

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

        <div className="mt-14 grid items-stretch gap-4 sm:mt-16 lg:grid-cols-3 lg:gap-5">
          {plans.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 90} className="h-full">
              <PricingSpotlightCard plan={plan} recommended={plan.id === recommendedPlan} />
            </Reveal>
          ))}
        </div>

        {/* Continuidade dos cards para a comparação */}
        <div className="relative flex flex-col items-center">
          <span
            aria-hidden="true"
            className="h-12 w-px bg-gradient-to-b from-white/[0.14] to-transparent sm:h-16"
          />

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="comparacao-planos"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-navy-deep px-4 py-2.5 text-[13px] text-mist transition-colors duration-300 hover:border-white/25 hover:text-white"
          >
            {open ? pricingCopy.closeComparison : pricingCopy.openComparison}
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={cn('transition-transform duration-300', open && 'rotate-180')}
            />
          </button>
        </div>

        {open ? (
          <div id="comparacao-planos" className="animate-panel-in">
            <div className="mx-auto mt-10 max-w-[920px]">
              <h3 className="text-center font-display text-[20px] font-semibold tracking-[-0.02em] text-white sm:text-[24px]">
                {pricingCopy.comparisonTitle}
              </h3>

              <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 sm:p-7">
                <PricingComparison />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

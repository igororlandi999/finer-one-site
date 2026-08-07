import { useState } from 'react'
import { FeatureShowcase } from '@/components/features/FeatureShowcase'
import { FeatureTabs } from '@/components/features/FeatureTabs'
import { Reveal } from '@/components/ui/Reveal'
import { features } from '@/data/featuresSection'
import type { FeatureId } from '@/data/featuresSection'

/**
 * Quarta secção: as áreas do produto.
 *
 * Exploração controlada pelo utilizador — uma área de cada vez, escolhida
 * manualmente. Não há autoplay: num produto B2B quem decide o que quer ver é
 * quem está a avaliar a plataforma.
 *
 * O estado arranca sempre em Performance Financeira e não é persistido.
 *
 * id="solucoes": assume a âncora do link "Soluções" da Navbar. scroll-mt-24 e
 * ausência de overflow-hidden seguem o padrão já estabelecido nas secções
 * anteriores.
 */
export function FeaturesSection() {
  const [active, setActive] = useState<FeatureId>('performance')
  const feature = features.find((item) => item.id === active) ?? features[0]

  return (
    <section
      id="solucoes"
      aria-labelledby="solucoes-titulo"
      className="relative isolate scroll-mt-24 bg-navy pb-24 pt-20 sm:pb-28 sm:pt-24 lg:pb-24 lg:pt-24"
    >
      {/* Mudança de iluminação: a secção anterior fecha, esta abre mais fria. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(70%_100%_at_50%_0%,rgba(30,144,255,0.09),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-center text-center">
          <h2
            id="solucoes-titulo"
            className="max-w-[760px] text-balance font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[36px] lg:text-[42px]"
          >
            Tudo o que precisa para perceber melhor o seu negócio.
          </h2>

          <p className="mt-5 max-w-2xl text-balance text-[15px] leading-relaxed text-mist">
            Explore as principais áreas da Finer One e veja como cada uma transforma informação
            financeira em clareza para decidir.
          </p>
        </Reveal>

        <div className="mt-12 sm:mt-14 lg:mt-12">
          <div
            role="tabpanel"
            id={`painel-${feature.id}`}
            aria-labelledby={`tab-${feature.id}`}
            tabIndex={0}
            className="rounded-2xl focus-visible:outline-none"
          >
            <FeatureShowcase feature={feature} />
          </div>

          <div className="mt-10 lg:mt-8">
            <FeatureTabs active={active} onChange={setActive} />
          </div>
        </div>

        <p className="mt-10 text-center text-[12px] leading-relaxed text-mist/70 lg:mt-8">
          Os valores apresentados nas interfaces são demonstrativos.
        </p>
      </div>
    </section>
  )
}

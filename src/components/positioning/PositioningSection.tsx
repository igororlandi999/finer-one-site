import { EcosystemStack } from '@/components/positioning/EcosystemStack'
import { OrbitEcosystem } from '@/components/positioning/OrbitEcosystem'
import { PositioningExplainer } from '@/components/positioning/PositioningExplainer'
import { Reveal } from '@/components/ui/Reveal'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Sexta secção: posicionamento.
 *
 * A fase 5 mostra decisões; esta responde de onde vem a informação que as
 * permite — e, sobretudo, que a Finer One não pede à empresa que substitua
 * nada. Assenta por cima do que já existe.
 *
 * A mudança de ritmo é o oposto da fase 5: lá são superfícies pesadas a
 * empilhar-se, aqui é uma única composição centrada com muito ar à volta. O
 * fundo sobe de navy-deep para navy e a luz passa a vir do centro em vez do
 * topo, o que faz a secção abrir depois de a pilha fechar.
 *
 * SECÇÃO CONCEPTUAL: não nomeia produtos, não usa logótipos e não afirma
 * integrações existentes.
 */
export function PositioningSection() {
  const prefersReduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 })

  // Fora do ecrã não há nada a animar. Poupa trabalho de composição enquanto
  // o utilizador percorre as secções anteriores.
  const motion = inView && !prefersReduced

  return (
    <section
      id="posicionamento"
      aria-labelledby="posicionamento-titulo"
      className="relative isolate scroll-mt-24 bg-navy pb-28 pt-24 sm:pt-28 lg:pb-36 lg:pt-32"
    >
      {/* Fecho da fase 5: o navy profundo da pilha dissolve-se sem aresta. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-navy-deep to-transparent"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-[820px] text-center">
          <h2
            id="posicionamento-titulo"
            className="text-balance font-display text-[28px] font-semibold leading-[1.14] tracking-[-0.03em] sm:text-[38px] lg:text-[44px]"
          >
            <span className="block text-white/[0.55]">
              Não precisa de substituir os sistemas que já utiliza.
            </span>
            <span className="mt-2 block text-white">
              Precisa de uma camada que os transforme em inteligência.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-[62ch] text-balance text-[15px] leading-relaxed text-mist">
            A Finer One liga, organiza e interpreta informação financeira proveniente das
            ferramentas que a sua empresa já utiliza, para gerar análises, previsões, alertas e
            decisões mais claras.
          </p>
        </Reveal>

        <div ref={ref} className="mt-14 sm:mt-16 lg:mt-8">
          <OrbitEcosystem motion={motion} />
          <EcosystemStack motion={motion} />
        </div>

        <Reveal className="mt-20 sm:mt-24 lg:mt-16">
          <PositioningExplainer />
        </Reveal>

        <p className="mx-auto mt-12 max-w-[860px] text-[12px] leading-relaxed text-mist/70">
          As categorias apresentadas são ilustrativas e representam tipos de sistema, não
          fornecedores nem integrações específicas.
        </p>
      </div>
    </section>
  )
}

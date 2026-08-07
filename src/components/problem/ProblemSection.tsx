import { DataSourcesCard } from '@/components/problem/DataSourcesCard'
import { QuestionsCard } from '@/components/problem/QuestionsCard'
import { LateDecisionCard } from '@/components/problem/LateDecisionCard'
import { FinerHubCard } from '@/components/problem/FinerHubCard'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Segunda secção: o problema.
 *
 * Narrativa do Bento, por ordem de leitura e de empilhamento em telemóvel:
 * dados dispersos -> falta de interpretação -> decisões tardias -> Finer One.
 *
 * id="problema": esta secção representa o problema, não o produto. O link
 * "Produto" da Navbar apontará para a secção de produto quando existir.
 *
 * scroll-mt-24: 96px = 64px da navbar fixa + 32px de folga visual, para o
 * título não ficar escondido em navegação por âncora.
 *
 * A secção NÃO usa overflow-hidden: isso tornaria-a um contentor de scroll e
 * o Chrome passaria a ignorar o scroll-margin-top na navegação por âncora.
 * Nada aqui transborda — o halo decorativo está contido pelo inset.
 */
export function ProblemSection() {
  return (
    <section
      id="problema"
      aria-labelledby="problema-titulo"
      className="relative isolate scroll-mt-24 bg-gradient-to-b from-navy-deep via-navy to-navy pb-24 pt-6 sm:pb-28 lg:pb-36"
    >
      {/* Continuidade com a Hero: a luz da secção anterior dissolve-se aqui. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(80%_100%_at_50%_0%,rgba(30,144,255,0.08),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-center text-center">
          <h2
            id="problema-titulo"
            className="max-w-[760px] text-balance font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[36px] lg:text-[42px]"
          >
            Os seus dados estão em todo o lado.
            <span className="mt-1 block text-white/[0.7]">A clareza não.</span>
          </h2>

          <p className="mt-5 max-w-2xl text-balance text-[15px] leading-relaxed text-mist">
            Bancos, faturação, contabilidade, folhas de cálculo e outros sistemas geram informação
            todos os dias. A Finer One transforma-a numa visão financeira clara.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6 sm:mt-14">
          <DataSourcesCard className="md:col-span-2 lg:col-span-4" />
          <QuestionsCard className="lg:col-span-2" />
          <LateDecisionCard className="lg:col-span-3" />
          <FinerHubCard className="md:col-span-2 lg:col-span-3" />
        </div>
      </div>
    </section>
  )
}

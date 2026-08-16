import { QuestionsCard } from '@/components/problem/QuestionsCard'
import { LateDecisionCard } from '@/components/problem/LateDecisionCard'
import { FinerHubCard } from '@/components/problem/FinerHubCard'
import { Reveal } from '@/components/ui/Reveal'
import { useLanguage } from '@/i18n/LanguageContext'

const copy = {
  pt: {
    headlineFirst: 'A informação existe.',
    headlineSecond: 'O que falta é transformá-la em decisão.',
    subheadline:
      'A maioria das empresas já tem banco, faturação, ERP, contabilidade e relatórios. O desafio é perceber o que os números significam, antecipar o impacto e saber o que fazer a seguir.',
    closing: 'É aqui que a Finer One começa.',
  },
  en: {
    headlineFirst: 'The information exists.',
    headlineSecond: "What's missing is turning it into a decision.",
    subheadline:
      "Most companies already have banking, invoicing, ERP, accounting and reports. The challenge is understanding what the numbers mean, anticipating the impact, and knowing what to do next.",
    closing: 'This is where Finer One begins.',
  },
}

/**
 * Segunda secção: o problema.
 *
 * Narrativa, por ordem de leitura e de empilhamento em telemóvel: números
 * isolados não bastam -> descobrir tarde custa dinheiro -> decidir exige
 * contexto -> transição para a Finer One.
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
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <section
      id="problema"
      aria-labelledby="problema-titulo"
      className="relative isolate scroll-mt-24 bg-gradient-to-b from-navy-deep via-navy to-navy pb-12 pt-6 sm:pb-14 lg:pb-16"
    >
      {/* Continuidade com a Hero: a luz da secção anterior dissolve-se aqui. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(80%_100%_at_50%_0%,rgba(30,144,255,0.08),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal repeat className="flex flex-col items-center text-center">
          <h2
            id="problema-titulo"
            className="max-w-[760px] text-balance font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[36px] lg:text-[42px]"
          >
            {t.headlineFirst}
            <span className="mt-1 block">{t.headlineSecond}</span>
          </h2>

          <p className="mt-4 max-w-2xl text-balance text-[15px] leading-relaxed text-mist">{t.subheadline}</p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          <QuestionsCard />
          <LateDecisionCard />
          <FinerHubCard />
        </div>

        <Reveal delay={160} repeat className="mt-14 flex flex-col items-center gap-6 sm:mt-16">
          <div aria-hidden="true" className="h-px w-full max-w-xs bg-white/[0.08]" />
          <p className="text-balance text-center text-[15px] font-medium text-glow sm:text-base">
            {t.closing}
          </p>
          <div aria-hidden="true" className="h-px w-full max-w-xs bg-white/[0.08]" />
        </Reveal>
      </div>
    </section>
  )
}

import { SolutionStep } from '@/components/solution/SolutionStep'
import { SolutionVisual } from '@/components/solution/SolutionVisual'
import { SolutionProgress } from '@/components/solution/SolutionProgress'
import { SolutionRail } from '@/components/solution/SolutionRail'
import { useActiveStep } from '@/hooks/useActiveStep'
import { useSolutionSectionData } from '@/data/solutionSection'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const copy = {
  pt: {
    title: 'Da informação à decisão',
    note: 'As composições acima são representações conceptuais do funcionamento da plataforma.',
  },
  en: {
    title: 'From information to decision',
    note: 'The compositions above are conceptual representations of how the platform works.',
  },
}

/**
 * Terceira secção: como a Finer One transforma dados em decisões.
 *
 * Ligamos -> Interpretamos -> Antecipamos -> Recomendamos.
 *
 * Desktop: o texto das quatro etapas corre normalmente à esquerda e o painel
 * visual fica fixo à direita, trocando de cena conforme a etapa que cruza o
 * centro da viewport. O scroll é sempre do utilizador — não há hijacking,
 * nem bloqueio, nem alteração programática da posição.
 *
 * Abaixo de lg o painel fixo desaparece e cada etapa passa a levar o seu
 * próprio visual em fluxo.
 *
 * A grelha NÃO usa items-start: o item precisa de esticar à altura da linha
 * para o sticky ter percurso. Com items-start a coluna encolhe à altura do
 * conteúdo e o painel deixa de colar.
 *
 * id="produto": esta é a secção de produto e assume a âncora da Navbar.
 * scroll-mt-24 e ausência de overflow-hidden seguem o padrão já estabelecido
 * na ProblemSection — overflow-hidden tornaria a secção um contentor de
 * scroll e o Chrome ignoraria o scroll-margin-top.
 */
export function SolutionSection() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const { solutionSteps } = useSolutionSectionData()
  const { register, active } = useActiveStep(solutionSteps.length)

  return (
    <section
      id="produto"
      aria-labelledby="solucao-titulo"
      className="relative isolate scroll-mt-24 bg-navy pb-24 pt-20 sm:pb-28 sm:pt-24 lg:pb-36 lg:pt-28"
    >
      {/* A luz sobe do fim da secção anterior e abre esta. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(75%_100%_at_50%_0%,rgba(0,82,255,0.10),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <h2 id="solucao-titulo" className="sr-only">
          {t.title}
        </h2>

        <div className="lg:grid lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <div className="relative min-w-0 lg:pl-12 xl:pl-16">
            <SolutionRail active={active} className="hidden lg:block" />

            {solutionSteps.map((step, index) => (
              <SolutionStep
                key={step.id}
                step={step}
                index={index}
                active={index === active}
                registerRef={register(index)}
              />
            ))}
          </div>

          {/* Painel fixo — apenas em lg e acima */}
          <div className="hidden min-w-0 lg:block">
            <div className="sticky top-28">
              <div className="relative h-[420px] rounded-2xl border border-white/[0.07] bg-white/[0.02] xl:h-[460px]">
                {solutionSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      'absolute inset-0 flex items-center p-7 transition-all duration-500 ease-out xl:p-8',
                      index === active
                        ? 'translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-2 opacity-0',
                    )}
                  >
                    <SolutionVisual id={step.id} active={index === active} />
                  </div>
                ))}
              </div>

              <SolutionProgress active={active} />
            </div>
          </div>
        </div>

        <p className="mt-16 text-center text-[12px] leading-relaxed text-mist/70 lg:mt-20">{t.note}</p>
      </div>
    </section>
  )
}

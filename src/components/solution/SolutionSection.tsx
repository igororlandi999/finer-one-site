import { SolutionStep } from '@/components/solution/SolutionStep'
import { SolutionVisual } from '@/components/solution/SolutionVisual'
import { SolutionProgress } from '@/components/solution/SolutionProgress'
import { SolutionRail } from '@/components/solution/SolutionRail'
import { Reveal } from '@/components/ui/Reveal'
import { useActiveStep } from '@/hooks/useActiveStep'
import { solutionSteps } from '@/data/solutionSection'
import { cn } from '@/lib/utils'

/**
 * Terceira secção: como a Finer One transforma dados em decisões.
 *
 * Conectar -> Organizar -> Interpretar -> Decidir.
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
        <Reveal className="flex flex-col items-center text-center">
          <h2
            id="solucao-titulo"
            className="max-w-[720px] text-balance font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[36px] lg:text-[42px]"
          >
            Da informação à decisão.
            <span className="mt-1 block text-white/[0.7]">Num único lugar.</span>
          </h2>

          <p className="mt-5 max-w-2xl text-balance text-[15px] leading-relaxed text-mist">
            A Finer One liga, organiza e interpreta a informação financeira da sua empresa para
            transformar dados em decisões mais claras.
          </p>
        </Reveal>

        <div className="mt-14 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-14 xl:gap-20">
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

        <p className="mt-16 text-center text-[12px] leading-relaxed text-mist/70 lg:mt-20">
          As composições acima são representações conceptuais do funcionamento da plataforma.
        </p>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { ImpactCasePanel } from '@/components/impact/ImpactCasePanel'
import { ImpactCaseSelector } from '@/components/impact/ImpactCaseSelector'
import { Reveal } from '@/components/ui/Reveal'
import { impactCases, impactCopy } from '@/data/impactSection'
import type { ImpactCaseId } from '@/data/impactSection'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

/**
 * Secção de impacto — Interactive Financial Case Explorer.
 *
 * A versão anterior mostrava os quatro casos ao mesmo tempo numa grelha 2x2.
 * Tinha o conteúdo certo e a apresentação errada: quatro cards com o mesmo
 * peso lêem-se como um painel de indicadores, e num painel de indicadores a
 * recomendação é apenas mais uma linha de texto. O que a secção precisa de
 * mostrar não é um conjunto de gráficos — é um percurso: pergunta, dados,
 * leitura, ação.
 *
 * Daí um caso de cada vez. O utilizador escolhe a pergunta e recebe a análise
 * completa dessa pergunta, com espaço para a recomendação ter o destaque que
 * lhe compete. Como só um caso está aberto, a secção fica mais larga e mais
 * baixa do que a grelha que substitui.
 *
 * Sem autoplay e sem carrossel: quem avalia uma plataforma financeira decide
 * o que quer ver. O estado é um único `activeCase` e arranca no primeiro.
 *
 * A largura sobe de `max-w-content` (1200) para 1320 apenas nesta secção: o
 * painel tem duas colunas e a coluna da esquerda precisa de espaço para o
 * microvisual respirar. Continua com margem confortável a 1440 e 1920.
 *
 * `scroll-mt-24` e ausência de `overflow-hidden` no <section> seguem o padrão
 * das restantes secções — no Chrome um contentor de scroll faz o
 * `scroll-margin-top` ser ignorado.
 *
 * TUDO É DEMONSTRAÇÃO CONCEPTUAL. Ver as regras de claims em
 * src/data/impactSection.ts.
 */
export function ImpactSection() {
  const [active, setActive] = useState<ImpactCaseId>('custos')
  const item = impactCases.find((entry) => entry.id === active) ?? impactCases[0]

  // Gate das animações dos microvisuais: o painel monta com a página, muito
  // antes de ser visto, e sem isto os gráficos já estariam desenhados quando
  // o utilizador lá chegasse.
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12 })

  return (
    <section
      id="impacto"
      aria-labelledby="impacto-titulo"
      className="relative isolate scroll-mt-24 bg-navy-deep pb-24 pt-24 sm:pt-28 lg:pb-28 lg:pt-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(0,82,255,0.09),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-[820px] text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-glow">{impactCopy.kicker}</p>
          <h2
            id="impacto-titulo"
            className="mt-5 text-balance font-display text-[28px] font-semibold leading-[1.14] tracking-[-0.03em] sm:text-[36px] lg:text-[42px]"
          >
            <span className="block text-white">{impactCopy.headlineFirst}</span>
            <span className="mt-2 block text-white/[0.55]">{impactCopy.headlineSecond}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[62ch] text-balance text-[15px] leading-relaxed text-mist">
            {impactCopy.subheadline}
          </p>
        </Reveal>

        <div
          ref={ref}
          className={cn('mt-12 sm:mt-14', inView ? 'animate-fade-up' : 'opacity-0')}
        >
          <p className="mb-3 text-[11px] text-mist/70">{impactCopy.hint}</p>

          <ImpactCaseSelector active={active} onChange={setActive} />

          <div className="mt-3 sm:mt-4">
            <div
              role="tabpanel"
              id={`impacto-painel-${item.id}`}
              aria-labelledby={`impacto-tab-${item.id}`}
              tabIndex={0}
              className="rounded-2xl sm:rounded-3xl"
            >
              <ImpactCasePanel key={item.id} item={item} visible={inView} />
            </div>
          </div>
        </div>

        {/* Assinatura de fecho e salvaguarda, no mesmo bloco: separadas, a
            salvaguarda ficava perdida num vazio no fim da secção. */}
        <Reveal delay={100}>
          <div className="mt-12 flex flex-col items-center gap-4 sm:mt-14">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-navy-soft">
                <LogoMark className="h-[15px] text-white" />
              </span>

              <p className="flex flex-col items-center gap-1.5 text-center font-display text-[17px] font-semibold tracking-[-0.015em] sm:flex-row sm:gap-4 sm:text-[19px]">
                {impactCopy.signature.map((line, index) => (
                  <span key={line} className="inline-flex items-center gap-4">
                    {index > 0 ? (
                      <span
                        aria-hidden="true"
                        className="hidden h-1 w-1 rounded-full bg-glow/50 sm:block"
                      />
                    ) : null}
                    <span className={index === 2 ? 'text-white' : 'text-white/[0.5]'}>{line}</span>
                  </span>
                ))}
              </p>
            </div>

            <p className="mx-auto max-w-[720px] text-center text-[11.5px] leading-relaxed text-mist/70">
              {impactCopy.disclaimer}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

import type { CSSProperties } from 'react'
import { DecisionCard } from '@/components/decisions/DecisionCard'
import { PrincipleVisual } from '@/components/decisions/visuals/PrincipleVisual'
import { Reveal } from '@/components/ui/Reveal'
import { useDecisionsSectionData } from '@/data/decisionsSection'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useStackedCards } from '@/hooks/useStackedCards'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const copy = {
  pt: {
    headlineFirst: 'Informação financeira exige proteção.',
    headlineSecond: 'Decisões exigem clareza.',
    subheadline:
      'A Finer One foi concebida para tratar informação financeira com controlo, privacidade e rastreabilidade, mantendo claro que a plataforma apoia a decisão — não substitui quem conhece o negócio.',
    note: 'Os cenários e valores apresentados nesta secção são demonstrativos e servem para ilustrar o tipo de leitura financeira que a Finer One pretende oferecer.',
  },
  en: {
    headlineFirst: 'Financial information requires protection.',
    headlineSecond: 'Decisions require clarity.',
    subheadline:
      "Finer One is designed to handle financial information with control, privacy and traceability, while making clear that the platform supports the decision — it doesn't replace whoever knows the business.",
    note: 'The scenarios and values shown in this section are for demonstration and illustrate the kind of financial reading Finer One aims to offer.',
  },
}

/**
 * Topo do primeiro card fixado em telemóvel, em pixels.
 * A Navbar é fixa e tem 64px — este valor deixa-a livre com folga.
 */
const BASE_TOP = 76
/** Fatia de card anterior que fica à vista em cada nível. */
const PEEK = 8

/**
 * Quinta secção: as decisões.
 *
 * A fase 4 mostra o que existe dentro da plataforma. Esta muda a pergunta:
 * que tipo de decisão é que essa informação apoia. A transição é feita por
 * respiração e iluminação — o fundo desce para navy-deep, o espaçamento
 * abre, e o título passa a alinhar à esquerda em escala maior. Sem
 * separador, sem badge.
 *
 * A mecânica é empilhamento por scroll: cada card sobe e cobre o anterior,
 * deixando uma fatia à vista. Feita só com position: sticky e um
 * IntersectionObserver — sem biblioteca de animação, sem scroll hijacking e
 * sem cálculos por evento de scroll. O conteúdo dos quatro cards existe
 * inteiro no DOM e é legível sem qualquer animação.
 *
 * id="decisoes": âncora interna. A Navbar não foi alterada.
 */
export function DecisionsSection() {
  const prefersReduced = usePrefersReducedMotion()
  const { lang } = useLanguage()
  const t = copy[lang]
  const { decisions } = useDecisionsSectionData()

  const { setItem, active, sticky } = useStackedCards({
    count: decisions.length,
    enabled: !prefersReduced,
    maxTop: BASE_TOP + (decisions.length - 1) * PEEK,
  })

  return (
    <section
      id="decisoes"
      aria-labelledby="decisoes-titulo"
      className="relative isolate scroll-mt-24 bg-navy-deep pb-28 pt-24 sm:pt-28 lg:pb-28 lg:pt-28"
    >
      {/* Fecho da secção anterior: o navy da fase 4 dissolve-se no navy mais
          profundo desta, sem aresta entre as duas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-navy to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(80%_100%_at_50%_0%,rgba(0,82,255,0.10),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="max-w-[880px]">
          <h2
            id="decisoes-titulo"
            className="text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-[40px] lg:text-[48px]"
          >
            <span className="block">{t.headlineFirst}</span>
            <span className="block">{t.headlineSecond}</span>
          </h2>

          <p className="mt-6 max-w-[58ch] text-[15px] leading-relaxed text-mist sm:text-[16px]">{t.subheadline}</p>
        </Reveal>
      </div>

      <div
        className={cn(
          'relative mx-auto mt-14 max-w-content px-5 sm:px-6 lg:mt-16 lg:px-8',
          // Prolonga o bloco de contenção do sticky para lá do último card,
          // senão ele chegava ao topo e saía no mesmo instante. É o tempo em
          // que o último card fica pousado: abaixo de ~12vh a leitura fica
          // curta, acima de ~16vh sobra ecrã vazio por baixo dele.
          sticky && 'pb-[12vh] lg:pb-[14vh]',
        )}
      >
        {decisions.map((decision, index) => {
          return (
            <div
              key={decision.id}
              ref={setItem}
              data-stack-index={index}
              style={{ '--stack-top': `${BASE_TOP + index * PEEK}px` } as CSSProperties}
              className={cn(
                'mb-10 last:mb-0 lg:mb-16',
                // As caixas altas só existem para dar percurso ao
                // empilhamento. Sem a mecânica ligada seriam apenas ecrãs de
                // espaço vazio, por isso os cards voltam à altura do conteúdo.
                sticky &&
                  'sticky top-[var(--stack-top)] lg:mb-0 lg:flex lg:h-[82vh] lg:min-h-[640px] lg:items-center lg:top-0',
              )}
            >
              <DecisionCard
                decision={decision}
                depth={active - index}
                shift={index * 14}
                stacked={sticky}
              >
                <PrincipleVisual decision={decision} />
              </DecisionCard>
            </div>
          )
        })}
      </div>

      <div className="relative mx-auto mt-16 max-w-content px-5 sm:px-6 lg:mt-12 lg:px-8">
        <p className="max-w-[62ch] text-[12px] leading-relaxed text-mist/70">{t.note}</p>
      </div>
    </section>
  )
}

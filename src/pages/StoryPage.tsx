import { useMemo } from 'react'
import { MotionConfig, useReducedMotion } from 'motion/react'
import { HeroDemo } from '@/components/v2/HeroDemo'
import { HomeExperience } from '@/components/v2/HomeExperience'
import { FinancialDiscovery } from '@/components/v2/FinancialDiscovery'
import { HowItWorksSteps } from '@/components/v2/HowItWorksSteps'
import { ForWhom } from '@/components/v2/ForWhom'
import { SecurityTrust } from '@/components/v2/SecurityTrust'
import { PlansSection } from '@/components/v2/PlansSection'
import { FAQHome } from '@/components/v2/FAQHome'
import { FinalCTAWorld } from '@/components/v2/FinalCTAWorld'
import { StoryFinale } from '@/components/v2/scrolly/StoryFinale'
import { StoryStack } from '@/components/v2/scrolly/StoryStack'
import type { Layer } from '@/components/v2/scrolly/StoryStack'
import type { Rect } from '@/components/v2/scrolly/shapes'

/**
 * PROTÓTIPO — homepage em scrollytelling (só em desenvolvimento, /historia/,
 * localhost:5174). Não entra no build nem toca na homepage aprovada.
 *
 * Uma transição diferente entre cada secção, todas ligadas ao scroll e
 * vetoriais (nítidas), com as imagens de identidade como referência:
 *  1→2 entramos no ecrã do produto (a janela da hero abre-se e é a secção 2)
 *  2→3 a pergunta é "enviada": o botão azul abre-se num círculo
 *  3→4 as peças juntam-se ("A informação já existe. Falta reuni-la.")
 *  4→5 rastos de luz, como a estrada da identidade
 *  5→6 persianas que fecham — segurança
 *  6→7 uma montanha que sobe, com o ponto de luz no cume
 *  7→FAQ portas que se abrem
 *  FAQ→8 o branco encolhe até à luz em Portugal e volta o mundo (CTA)
 */
const box = (el: Element | null | undefined): Rect | undefined => {
  if (!el) return undefined
  const r = el.getBoundingClientRect()
  const vh = window.innerHeight
  // Se o elemento estiver fora do ecrã, aproxima-o da margem visível.
  const y = Math.min(Math.max(r.top, 0), vh - Math.max(r.height, 1))
  return { x: r.left, y, w: r.width, h: r.height }
}

export function StoryPage() {
  const reduced = useReducedMotion() ?? false
  const layers = useMemo<Layer[]>(
    () => [
      { key: 'hero', node: <HeroDemo />, bg: '#070D2B' },
      { key: 's2', node: <HomeExperience />, bg: '#FFFFFF', kind: 'window', zoomPrev: true, origin: (a) => box(a.querySelector('.aspect-video')) },
      { key: 's3', node: <FinancialDiscovery />, bg: '#FFFFFF', kind: 'circle', lead: '#0052FF', origin: (a) => box(a.querySelector('span.h-9.w-9.rounded-full.bg-accent')) },
      {
        key: 's4',
        node: (
          <div className="rounded-b-[28px] bg-gradient-to-b from-[#F8FAFF] via-white to-ice sm:rounded-b-[40px]">
            <HowItWorksSteps />
          </div>
        ),
        bg: '#F8FAFF',
        kind: 'tiles',
        lead: '#070D2B',
      },
      { key: 's5', node: <ForWhom />, bg: '#FFFFFF', kind: 'streaks', lead: 'linear-gradient(90deg,#070D2B 0%,#0A2A8F 55%,#0052FF 85%,#7CB8FF 100%)' },
      { key: 's6', node: <SecurityTrust />, bg: '#FFFFFF', kind: 'blinds', lead: '#070D2B' },
      { key: 's7', node: <PlansSection />, bg: '#FFFFFF', kind: 'ridge', lead: 'linear-gradient(180deg,#0B1640 0%,#070D2B 45%,#03060F 100%)' },
      { key: 'faq', node: <FAQHome />, bg: '#FFFFFF', kind: 'doors', lead: '#0052FF' },
    ],
    [],
  )

  if (reduced) {
    return (
      <MotionConfig reducedMotion="user">
        {layers.map((l) => (
          <div key={l.key}>{l.node}</div>
        ))}
        <FinalCTAWorld />
      </MotionConfig>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <StoryStack layers={layers} />
      <StoryFinale />
    </MotionConfig>
  )
}

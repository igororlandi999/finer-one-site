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
import { StoryDive } from '@/components/v2/scrolly/StoryDive'
import { StoryChapter } from '@/components/v2/scrolly/StoryChapter'
import { StoryFinale } from '@/components/v2/scrolly/StoryFinale'
import { ChapterTitle } from '@/components/v2/scrolly/ChapterTitle'

/**
 * PROTÓTIPO — homepage em scrollytelling (só em desenvolvimento, /historia/).
 * Não faz parte do build nem da homepage aprovada.
 *
 * Fio condutor: uma luz. Abre no mundo, acende-se em Portugal e torna-se a
 * página; três capítulos com os pilares da marca (Compreender hoje · Antecipar
 * amanhã · Decidir melhor); no fim a página volta a ser a luz no mundo e
 * aparece o CTA. As secções são as mesmas da homepage aprovada.
 */
export function StoryPage() {
  const reduced = useReducedMotion() ?? false
  return (
    <MotionConfig reducedMotion="user">
      <HeroDemo />
      {reduced ? <StaticChapter index={0} light /> : <StoryDive />}
      <HomeExperience />
      <FinancialDiscovery />
      <div className="relative z-10 rounded-b-[28px] bg-gradient-to-b from-[#F8FAFF] via-white to-ice sm:rounded-b-[40px]">
        <HowItWorksSteps />
      </div>
      {reduced ? <StaticChapter index={1} /> : <StoryChapter index={1} />}
      <ForWhom />
      <SecurityTrust />
      {reduced ? <StaticChapter index={2} /> : <StoryChapter index={2} />}
      <PlansSection />
      <FAQHome />
      {reduced ? <FinalCTAWorld /> : <StoryFinale />}
    </MotionConfig>
  )
}

function StaticChapter({ index, light }: { index: number; light?: boolean }) {
  return (
    <section className={light ? 'bg-white py-28' : 'bg-navy-deep py-28'}>
      <ChapterTitle index={index} theme={light ? 'light' : 'dark'} />
    </section>
  )
}

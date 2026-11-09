import { useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { HeroV2 } from '@/components/v2/HeroV2'
import { ProblemSection } from '@/components/problem/ProblemSection'
import { PillarsScrolly } from '@/components/v2/PillarsScrolly'
import { DemoAdvisor } from '@/components/v2/DemoAdvisor'
import { Benefits } from '@/components/v2/Benefits'
import { HowItWorks } from '@/components/v2/HowItWorks'
import { Security } from '@/components/v2/Security'
import { PricingSection } from '@/components/pricing/PricingSection'
import { EarlyAccess } from '@/components/v2/EarlyAccess'
import { FAQSection } from '@/components/faq/FAQSection'
import { FinalCTA } from '@/components/footer/FinalCTA'
import { SiteFooter } from '@/components/footer/SiteFooter'

/**
 * Homepage v2 (branch dev/homepage-v2).
 *
 * Narrativa: Hero → problema → Compreender/Antecipar/Decidir (scroll) →
 * demonstração → benefícios → como funciona → segurança → planos →
 * acesso antecipado → FAQ → encerramento.
 *
 * As secções da v1 que esta substitui (SolutionSection, DecisionsSection,
 * Hero) continuam no repositório, sem uso, até a v2 ser aprovada.
 */
export default function App() {
  // O browser tenta resolver a âncora do URL antes do React renderizar a
  // página, por isso um link direto para /#problema não chegava ao destino.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return

    const target = document.getElementById(id)
    target?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [])

  return (
    <div className="min-h-screen bg-navy">
      <Navbar />
      <main id="conteudo">
        <HeroV2 />
        <ProblemSection />
        <PillarsScrolly />
        <DemoAdvisor />
        <Benefits />
        <HowItWorks />
        <Security />
        <PricingSection />
        <EarlyAccess />
        <FAQSection />
        <FinalCTA />
      </main>

      <SiteFooter />
    </div>
  )
}

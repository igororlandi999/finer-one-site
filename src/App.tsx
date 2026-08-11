import { useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/hero/Hero'
import { ProblemSection } from '@/components/problem/ProblemSection'
import { SolutionSection } from '@/components/solution/SolutionSection'
import { ProcessSection } from '@/components/process/ProcessSection'
import { FeaturesSection } from '@/components/features/FeaturesSection'
import { DecisionsSection } from '@/components/decisions/DecisionsSection'
import { ImpactSection } from '@/components/impact/ImpactSection'
import { PositioningSection } from '@/components/positioning/PositioningSection'
import { TrustSection } from '@/components/trust/TrustSection'
import { SecuritySection } from '@/components/security/SecuritySection'
import { PricingSection } from '@/components/pricing/PricingSection'
import { FAQSection } from '@/components/faq/FAQSection'
import { FinalCTA } from '@/components/footer/FinalCTA'
import { SiteFooter } from '@/components/footer/SiteFooter'

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
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <ProcessSection />
        <FeaturesSection />
        <DecisionsSection />
        <ImpactSection />
        <PositioningSection />
        <TrustSection />
        <SecuritySection />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>

      <SiteFooter />
    </div>
  )
}

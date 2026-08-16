import { useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/hero/Hero'
import { ProblemSection } from '@/components/problem/ProblemSection'
import { SolutionSection } from '@/components/solution/SolutionSection'
import { DecisionsSection } from '@/components/decisions/DecisionsSection'
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
        <DecisionsSection />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>

      <SiteFooter />
    </div>
  )
}

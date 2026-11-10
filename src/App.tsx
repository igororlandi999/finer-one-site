import { useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { HeroDemo } from '@/components/v2/HeroDemo'
import { ProblemSection } from '@/components/problem/ProblemSection'
import { Challenges } from '@/components/v2/Challenges'
import { FinancialStory } from '@/components/v2/story/FinancialStory'
import { FinanceDemo } from '@/components/v2/story/FinanceDemo'
import { PillarsScrolly } from '@/components/v2/PillarsScrolly'
import { ProductTour } from '@/components/v2/ProductTour'
import { CinematicBand } from '@/components/v2/CinematicBand'
import { Benefits } from '@/components/v2/Benefits'
import { HowItWorks } from '@/components/v2/HowItWorks'
import { Security } from '@/components/v2/Security'
import { PricingSection } from '@/components/pricing/PricingSection'
import { EarlyAccess } from '@/components/v2/EarlyAccess'
import { FAQSection } from '@/components/faq/FAQSection'
import { FinalCTA } from '@/components/footer/FinalCTA'
import { SiteFooter } from '@/components/footer/SiteFooter'

// Comparação na versão de desenvolvimento: ?secao=antiga mostra a segunda secção anterior.
// ?secao=antiga (original) · ?secao=desafios (três desafios) · ?secao=scroll (scrollytelling).
const SECOND = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('secao') : null

/**
 * Homepage v2 (branch dev/homepage-v2).
 *
 * Narrativa: Hero (Finer Home) → problema → Compreender/Antecipar/Decidir
 * (scroll) → [folha clara: demonstração Finer Home/Advisor → benefícios →
 * como funciona] → faixa cinematográfica → segurança → planos → acesso
 * antecipado → FAQ → encerramento.
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
        <HeroDemo />
        {SECOND === 'antiga' ? <ProblemSection /> : SECOND === 'desafios' ? <Challenges /> : SECOND === 'scroll' ? <FinancialStory /> : <FinanceDemo />}
        <PillarsScrolly />
        {/* Folha clara contínua: demonstração, benefícios e funcionamento.
            Cantos arredondados sobre o navy, em vez de cortes retos entre
            secções escuras e claras. */}
        <div className="relative z-10 rounded-[28px] bg-gradient-to-b from-ice via-white to-ice sm:mx-3 sm:rounded-[40px]">
          <ProductTour />
          <Benefits />
          <HowItWorks />
        </div>
        <CinematicBand />
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

import { useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { HeroDemo } from '@/components/v2/HeroDemo'
import { HomeExperience } from '@/components/v2/HomeExperience'
import { ProblemSection } from '@/components/problem/ProblemSection'
import { Challenges } from '@/components/v2/Challenges'
import { FinancialStory } from '@/components/v2/story/FinancialStory'
import { FinanceDemo } from '@/components/v2/story/FinanceDemo'
import { ClarityShowcase } from '@/components/v2/story/ClarityShowcase'
import { ClarityStage } from '@/components/v2/story/ClarityStage'
import { ClarityMotion } from '@/components/v2/story/ClarityMotion'
import { PillarsScrolly } from '@/components/v2/PillarsScrolly'
import { ProductTour } from '@/components/v2/ProductTour'
import { CinematicBand } from '@/components/v2/CinematicBand'
import { PlatformShowcase } from '@/components/v2/PlatformShowcase'
import { PlatformShowcaseV1 } from '@/components/v2/PlatformShowcaseV1'
import { Benefits } from '@/components/v2/Benefits'
import { BenefitsStrip } from '@/components/v2/BenefitsStrip'
import { BenefitsCards } from '@/components/v2/BenefitsCards'
import { BenefitsMotion } from '@/components/v2/BenefitsMotion'
import { HowItWorks } from '@/components/v2/HowItWorks'
import { HowItWorksMotion } from '@/components/v2/HowItWorksMotion'
import { HowItWorksDemo } from '@/components/v2/HowItWorksDemo'
import { HowItWorksDemoV1 } from '@/components/v2/HowItWorksDemoV1'
import { HowItWorksDemoV2 } from '@/components/v2/HowItWorksDemoV2'
import { Security } from '@/components/v2/Security'
import { PricingSection } from '@/components/pricing/PricingSection'
import { EarlyAccess } from '@/components/v2/EarlyAccess'
import { FAQSection } from '@/components/faq/FAQSection'
import { FinalCTA } from '@/components/footer/FinalCTA'
import { SiteFooter } from '@/components/footer/SiteFooter'

// Comparação na versão de desenvolvimento: ?secao=antiga mostra a segunda secção anterior.
// ?secao=antiga · desafios · scroll · exemplos · paineis (versões anteriores).
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
        {/* Nova secção 2: experiência Finer Home (destino do CTA principal da hero) */}
        <HomeExperience />
        {SECOND === 'antiga' ? <ProblemSection /> : SECOND === 'desafios' ? <Challenges /> : SECOND === 'scroll' ? <FinancialStory /> : SECOND === 'exemplos' ? <FinanceDemo /> : SECOND === 'paineis' ? <ClarityShowcase /> : SECOND === 'etapas' ? <ClarityStage /> : <ClarityMotion />}
        {/* Os três pilares já são demonstrados na secção anterior; versão antiga em ?pilares=sim */}
        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('pilares') === 'sim' && <PillarsScrolly />}
        {/* Folha clara contínua: demonstração, benefícios e funcionamento.
            Cantos arredondados sobre o navy, em vez de cortes retos entre
            secções escuras e claras. */}
        <div className={typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('fundo') === 'antigo' ? 'relative z-10 rounded-[28px] bg-gradient-to-b from-ice via-white to-ice sm:mx-3 sm:rounded-[40px]' : 'relative z-10 rounded-b-[28px] bg-gradient-to-b from-[#F8FAFF] via-white to-ice sm:rounded-b-[40px]'}>
          {/* Demonstração interativa retirada: a plataforma já aparece no vídeo da hero. Versão antiga em ?tour=sim */}
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tour') === 'sim' && <ProductTour />}
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('beneficios') === 'antigo' ? <Benefits /> : typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('beneficios') === 'cartoes' ? <BenefitsCards /> : typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('beneficios') === 'faixa' ? <BenefitsStrip /> : <BenefitsMotion />}
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('funcionamento') === 'antigo' ? <HowItWorks /> : typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('funcionamento') === 'v2' ? <HowItWorksMotion /> : typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('funcionamento') === 'v3' ? <HowItWorksDemoV1 /> : typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('funcionamento') === 'v4' ? <HowItWorksDemoV2 /> : <HowItWorksDemo />}
          {/* Secção 5, versão anterior (clara, quatro áreas) em ?plataforma=v1 */}
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('plataforma') === 'v1' && <PlatformShowcaseV1 />}
        </div>
        {(typeof window === 'undefined' || new URLSearchParams(window.location.search).get('plataforma') !== 'v1') && <PlatformShowcase />}
        {/* Banda cinematográfica retirada (pedido do fundador, 11/11/2026). Versão anterior em ?banda=sim */}
        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('banda') === 'sim' && <CinematicBand />}
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

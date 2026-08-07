import { FooterBrand } from '@/components/footer/FooterBrand'
import { FooterLinks } from '@/components/footer/FooterLinks'
import { FooterVisual } from '@/components/footer/FooterVisual'
import { LinkedInStrip } from '@/components/footer/LinkedInStrip'
import { footerCopy } from '@/data/footer'

/**
 * Rodapé institucional.
 *
 * Sequência: faixa visual -> LinkedIn -> navegação -> marca em grande escala
 * -> copyright. A faixa faz a passagem do CTA para o rodapé sem divisor.
 *
 * Fica fora do <main>, que é onde deve estar semanticamente.
 */
export function SiteFooter() {
  return (
    <footer className="relative isolate bg-navy-deep">
      <FooterVisual />
      <div className="mx-auto max-w-content">
        <LinkedInStrip />
        <FooterLinks />
      </div>

      <FooterBrand />

      {/* Alinhado com a grelha do rodapé, não centrado: fecha a coluna que
          começa no logótipo em vez de flutuar sob a marca gigante. */}
      <div className="mx-auto max-w-content px-5 pb-10 pt-8 sm:px-6 lg:px-8">
        <p className="border-t border-white/[0.06] pt-6 text-[12px] text-mist/60">
          {footerCopy.copyright}
        </p>
      </div>
    </footer>
  )
}

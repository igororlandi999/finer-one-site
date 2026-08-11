import { Logo } from '@/components/brand/Logo'
import { footerCopy, footerGroups } from '@/data/footer'

/**
 * Navegação institucional.
 *
 * Só âncoras que existem mesmo. Sobre, Contacto, Privacidade e Termos ficam
 * de fora até haver destino — ver a nota em src/data/footer.ts.
 */
export function FooterLinks() {
  return (
    <div className="grid gap-10 px-5 py-12 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-16 lg:px-8">
      <div>
        <Logo />
        <p className="mt-5 max-w-[34ch] text-[13.5px] leading-relaxed text-mist">
          {footerCopy.tagline}
        </p>
      </div>

      {/* lg:pt-1 alinha a altura de maiúscula dos títulos com a do logótipo:
          sem o ajuste, os títulos de 11px parecem começar acima da marca. */}
      <nav aria-label="Navegação do rodapé" className="lg:pt-1">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:gap-x-16">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-[13.5px] text-mist transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}

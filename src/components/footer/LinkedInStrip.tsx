import { ArrowUpRight } from 'lucide-react'
import { useFooterData } from '@/data/footer'

/**
 * Faixa do LinkedIn.
 *
 * O LinkedIn é a única rede que a Finer One utiliza. Em vez de montar uma
 * grelha de células com uma preenchida e as outras vazias, ocupa a largura
 * toda — assim parece uma decisão e não uma falta.
 *
 * O glifo está desenhado aqui em SVG porque o lucide-react 1.x deixou de
 * publicar ícones de marca. É usado apenas para identificar a ligação ao
 * perfil da própria empresa.
 */
function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.44v6.3zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}
export function LinkedInStrip() {
  const { linkedIn } = useFooterData()

  return (
    <a
      href={linkedIn.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={linkedIn.ariaLabel}
      className="group flex items-center gap-4 border-b border-white/[0.06] px-5 py-8 transition-colors duration-300 hover:bg-white/[0.025] sm:gap-5 sm:px-6 sm:py-9 lg:px-8"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] text-white transition-colors duration-300 group-hover:border-accent/[0.5] group-hover:bg-accent/[0.1] group-hover:text-glow">
        <LinkedInGlyph />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-[0.18em] text-mist/70">
          {linkedIn.network}
        </span>
        <span className="mt-1.5 block text-[15.5px] font-medium leading-snug text-white">
          {linkedIn.title}
        </span>
        <span className="mt-1 block text-[13px] text-mist">{linkedIn.description}</span>
      </span>

      <ArrowUpRight
        size={18}
        aria-hidden="true"
        className="shrink-0 text-mist transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-glow"
      />
    </a>
  )
}

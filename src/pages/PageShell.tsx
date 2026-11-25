import type { ReactNode } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { SiteFooter } from '@/components/footer/SiteFooter'

/**
 * Moldura comum das páginas independentes (navegação, conteúdo e rodapé).
 * Usada no navegador (renderPage) e na pré-renderização do build (src/ssr/entry-server.tsx),
 * para que o HTML gerado no build seja exatamente o que o React monta no navegador.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-navy">
      <Navbar />
      <main id="conteudo" className="relative z-10 bg-navy">{children}</main>
      <SiteFooter />
    </div>
  )
}

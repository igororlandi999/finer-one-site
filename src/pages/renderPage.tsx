import { StrictMode } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Navbar } from '@/components/layout/Navbar'
import { SiteFooter } from '@/components/footer/SiteFooter'
import { LanguageProvider } from '@/i18n/LanguageContext'
import '@/index.css'

/**
 * Arranque comum das páginas independentes (Finer Pioneers, Lista de Espera,
 * Privacidade). Cada página tem o seu próprio index.html — funciona no GitHub
 * Pages sem truques de redirecionamento.
 */
export function renderPage(page: ReactNode) {
  if (new URLSearchParams(window.location.search).get('motion') === 'reduce') {
    document.documentElement.dataset.motion = 'reduce'
  }

  const container = document.getElementById('root')
  if (!container) throw new Error('Elemento #root não encontrado')

  createRoot(container).render(
    <StrictMode>
      <LanguageProvider>
        <div className="min-h-screen bg-navy">
          <Navbar />
          <main id="conteudo">{page}</main>
          <SiteFooter />
        </div>
      </LanguageProvider>
    </StrictMode>,
  )
}

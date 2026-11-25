import { StrictMode } from 'react'
import type { ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { PageShell } from '@/pages/PageShell'
import { LanguageProvider } from '@/i18n/LanguageContext'
import '@fontsource-variable/inter'
import '@fontsource-variable/inter-tight'
import '@/index.css'
import { initTitleSweep } from '@/lib/titleSweep'

/**
 * Arranque comum das páginas independentes (Finer Pioneers, Lista de Espera,
 * Privacidade). Cada página tem o seu próprio index.html — funciona no GitHub
 * Pages sem truques de redirecionamento.
 *
 * O HTML de cada página já vem pré-renderizado do build (scripts/prerender.mjs), para os
 * motores de busca e para a primeira pintura. Aqui o React hidrata esse HTML (hydrateRoot); sem
 * HTML pré-renderizado (npm run dev), monta a página do zero (createRoot), como antes.
 */
export function renderPage(page: ReactNode) {
  if (new URLSearchParams(window.location.search).get('motion') === 'reduce') {
    document.documentElement.dataset.motion = 'reduce'
  }

  const container = document.getElementById('root')
  if (!container) throw new Error('Elemento #root não encontrado')

  const tree = (
    <StrictMode>
      <LanguageProvider>
        <PageShell>{page}</PageShell>
      </LanguageProvider>
    </StrictMode>
  )
  // HTML pré-renderizado: hidratar. __foHydrating faz o primeiro render coincidir com esse HTML
  // (idioma predefinido; ver LanguageProvider). Uma recuperação do React (reconstrução) fica registada.
  window.__foHydrating = container.hasChildNodes()
  if (window.__foHydrating) hydrateRoot(container, tree, { onRecoverableError: (e) => console.warn('[hydrate]', e) })
  else createRoot(container).render(tree)
  initTitleSweep()
}

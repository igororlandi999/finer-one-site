import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from '@/App'
import { LanguageProvider } from '@/i18n/LanguageContext'
import '@fontsource-variable/inter'
import '@fontsource-variable/inter-tight'
import '@/index.css'
import { initTitleSweep } from '@/lib/titleSweep'

// Pré-visualização do modo de movimento reduzido: /?motion=reduce
if (new URLSearchParams(window.location.search).get('motion') === 'reduce') {
  document.documentElement.dataset.motion = 'reduce'
}

const container = document.getElementById('root')

if (!container) {
  throw new Error('Elemento #root não encontrado no index.html')
}

const tree = (
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
)
// HTML pré-renderizado: hidratar. __foHydrating faz o primeiro render coincidir com esse HTML
// (idioma predefinido; ver LanguageProvider). Uma recuperação do React (reconstrução) fica registada.
window.__foHydrating = container.hasChildNodes()
if (window.__foHydrating) hydrateRoot(container, tree, { onRecoverableError: (e) => console.warn('[hydrate]', e) })
else createRoot(container).render(tree)

initTitleSweep()

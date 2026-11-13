import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import { LanguageProvider } from '@/i18n/LanguageContext'
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

createRoot(container).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)

initTitleSweep()

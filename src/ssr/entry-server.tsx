/**
 * Pré-renderização das páginas públicas no build (scripts/prerender.mjs).
 *
 * Gera, para cada rota, o mesmo HTML que o React monta no navegador, para que os motores de
 * busca (e quem não executa JavaScript) recebam o conteúdo, os títulos e os links internos
 * no próprio HTML. Sempre em português (o idioma predefinido e o que o HTML declara).
 *
 * No navegador, as entradas (main.tsx e renderPage) hidratam este HTML com hydrateRoot. Para o
 * HTML coincidir com o primeiro render do navegador, o que depende do navegador é lido depois
 * de montar (useMediaQuery, usePrefersReducedMotion, lib/currentPath). Se não coincidir (por
 * exemplo, visitante com o inglês guardado), o React refaz a página no navegador, como antes.
 */
import { StrictMode } from 'react'
import type { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import App from '@/App'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { PageShell } from '@/pages/PageShell'
import { AboutPage } from '@/pages/AboutPage'
import { ExplorePage } from '@/pages/ExplorePage'
import { PioneersPage } from '@/pages/PioneersPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { WaitlistPage } from '@/pages/WaitlistPage'
import { LiquidityGuidePage } from '@/pages/guides/LiquidityGuidePage'

const page = (el: ReactElement) => <PageShell>{el}</PageShell>

/** Rota pública → ficheiro gerado pelo Vite (relativo a dist/) e conteúdo. */
export const routes: Record<string, { file: string; render: () => ReactElement }> = {
  '/': { file: 'index.html', render: () => <App /> },
  '/sobre/': { file: 'sobre/index.html', render: () => page(<AboutPage />) },
  '/explorar/': { file: 'explorar/index.html', render: () => page(<ExplorePage />) },
  '/pioneers/': { file: 'pioneers/index.html', render: () => page(<PioneersPage />) },
  '/lista-espera/': { file: 'lista-espera/index.html', render: () => page(<WaitlistPage />) },
  '/privacidade/': { file: 'privacidade/index.html', render: () => page(<PrivacyPage />) },
  '/guias/falta-de-liquidez/': { file: 'guias/falta-de-liquidez/index.html', render: () => page(<LiquidityGuidePage />) },
}

export function render(path: string): string {
  const route = routes[path]
  if (!route) throw new Error(`Rota sem pré-renderização: ${path}`)
  return renderToString(
    <StrictMode>
      <LanguageProvider>{route.render()}</LanguageProvider>
    </StrictMode>,
  )
}

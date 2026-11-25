/** Mês do build (AAAA-MM, UTC), definido em vite.config.ts. Ver src/hooks/useCurrentMonth.ts. */
declare const __FO_BUILD_MONTH__: string

interface Window {
  /** true enquanto o React está a hidratar o HTML pré-renderizado (definido em main.tsx / renderPage). */
  __foHydrating?: boolean
}

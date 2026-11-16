import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'pt' | 'en'

const STORAGE_KEY = 'finer-one-lang'

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

/**
 * Título e descrição da página no idioma escolhido. O HTML de cada página traz a
 * versão PT (a que os motores de busca indexam); em EN trocamos no browser.
 */
const EN_META: Record<string, { title: string; description: string }> = {
  '/': { title: 'Finer One — Financial intelligence for clear decisions', description: 'Finer One turns your company’s financial data into analysis, forecasts, alerts and clear decisions, before problems become urgent.' },
  '/sobre/': { title: 'About us | Finer One', description: 'Finer One is building the financial operating system for Portuguese SMEs. Read our story, meet the founders and see what we believe in.' },
  '/pioneers/': { title: 'Finer Pioneers — Apply | Finer One', description: 'We are looking for 10 business owners to try Finer One first-hand and help shape how the platform evolves.' },
  '/lista-espera/': { title: 'Waitlist | Finer One', description: 'Be among the first to hear about access to Finer One. Signing up does not require a bank connection.' },
  '/privacidade/': { title: 'Privacy notice | Finer One', description: 'How Finer One handles the data collected through the Waitlist and Finer Pioneers forms.' },
}
let ptMeta: { title: string; description: string } | null = null

function applyPageMeta(lang: Lang) {
  if (typeof document === 'undefined') return
  const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  ptMeta ??= { title: document.title, description: desc?.content ?? '' }
  const path = window.location.pathname.replace(/\/?$/, '/').replace(/\/index\.html\/$/, '/')
  const meta = lang === 'en' ? EN_META[path] : ptMeta
  if (!meta) return
  document.title = meta.title
  if (desc) desc.content = meta.description
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/** Default 'pt' quando não há nada guardado — o pedido foi um botão manual, não deteção automática do browser. */
function readStoredLang(): Lang {
  if (typeof window === 'undefined') return 'pt'
  return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'pt'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-PT'
    applyPageMeta(lang)
  }, [lang])

  const setLang = (next: Lang) => {
    setLangState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  const toggleLang = () => setLang(lang === 'pt' ? 'en' : 'pt')

  return <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage precisa de um LanguageProvider acima na árvore.')
  return context
}

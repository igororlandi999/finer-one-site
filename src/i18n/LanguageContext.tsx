import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'pt' | 'en'

const STORAGE_KEY = 'finer-one-lang'

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
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

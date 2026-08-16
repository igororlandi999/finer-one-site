import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

/**
 * "Produto" leva ao dashboard interativo da Hero (#produto-demo — o próprio
 * produto). "Como funciona" leva à narrativa Conectar/Organizar/Interpretar/
 * Decidir da SolutionSection (#produto — mesmo destino do CTA "Ver como
 * funciona" da Hero, para não haver dois links com significados diferentes
 * para o mesmo sítio). Os hrefs não mudam com o idioma — são âncoras internas.
 */
const links = {
  pt: [
    { label: 'Produto', href: '#produto-demo' },
    { label: 'Como funciona', href: '#produto' },
    { label: 'Preços', href: '#precos' },
  ],
  en: [
    { label: 'Product', href: '#produto-demo' },
    { label: 'How it works', href: '#produto' },
    { label: 'Pricing', href: '#precos' },
  ],
}

const copy = {
  pt: { skip: 'Saltar para o conteúdo', home: 'Finer One — página inicial', signIn: 'Entrar', cta: 'Agendar Demo', open: 'Abrir menu', close: 'Fechar menu' },
  en: { skip: 'Skip to content', home: 'Finer One — homepage', signIn: 'Sign In', cta: 'Book a Demo', open: 'Open menu', close: 'Close menu' },
}

/** Botão "PT"/"EN": troca para o idioma que ainda NÃO está ativo. */
function LanguageToggle({ className }: { className?: string }) {
  const { lang, toggleLang } = useLanguage()
  const next = lang === 'pt' ? 'en' : 'pt'

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={lang === 'pt' ? 'Switch language to English' : 'Mudar idioma para português'}
      aria-pressed={lang === 'en'}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-white/[0.12] bg-white/[0.03] px-3 text-[12px] font-medium uppercase tracking-wide text-mist transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.06] hover:text-white',
        className,
      )}
    >
      <span className={lang === 'pt' ? 'text-white' : undefined}>PT</span>
      <span aria-hidden="true" className="text-white/25">/</span>
      <span className={lang === 'en' ? 'text-white' : undefined}>EN</span>
      <span className="sr-only">
        {lang === 'pt' ? `— switch to ${next.toUpperCase()}` : `— mudar para ${next.toUpperCase()}`}
      </span>
    </button>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { lang } = useLanguage()
  const t = copy[lang]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
          scrolled || open
            ? 'border-b border-white/[0.07] bg-navy/[0.85] backdrop-blur-xl'
            : 'border-b border-transparent bg-navy/40 backdrop-blur-sm',
        )}
      >
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          {t.skip}
        </a>

        <nav
          aria-label={lang === 'pt' ? 'Principal' : 'Main'}
          className="mx-auto flex h-16 max-w-content items-center justify-between px-5 sm:px-6 lg:px-8"
        >
          <a href="/" aria-label={t.home} className="shrink-0 rounded-md">
            <Logo />
          </a>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 lg:flex">
            {links[lang].map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-sm text-mist transition-colors hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageToggle />
            <Button variant="ghost" size="sm">
              {t.signIn}
            </Button>
            <Button size="sm">{t.cta}</Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageToggle />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? t.close : t.open}
              aria-expanded={open}
              aria-controls="menu-mobile"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/[0.06]"
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </header>

      {/*
        O overlay vive fora do <header> de propósito: o backdrop-blur do header
        cria um bloco de contenção que impediria o position: fixed de se ancorar
        à viewport. z-40 mantém-no por baixo da navbar.
      */}
      {open ? (
        <div
          id="menu-mobile"
          className="fixed inset-x-0 bottom-0 top-16 z-40 animate-slide-down overflow-y-auto border-t border-white/[0.07] bg-navy lg:hidden"
        >
          <div className="mx-auto flex min-h-full max-w-content flex-col px-5 pb-8 pt-2 sm:px-6">
            <ul>
              {links[lang].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-white/[0.05] py-3.5 text-[15px] text-mist transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-2 pt-8">
              <Button variant="outline" size="lg" onClick={() => setOpen(false)}>
                {t.signIn}
              </Button>
              <Button size="lg" onClick={() => setOpen(false)}>
                {t.cta}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

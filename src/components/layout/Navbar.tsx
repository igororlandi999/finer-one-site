import { useEffect, useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { buttonClasses } from '@/components/ui/Button'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

/**
 * v2: "Produto" → #demo (demonstração interativa). Texto abaixo é da v1:
 * "Produto" leva ao dashboard interativo da Hero (#produto-demo — o próprio
 * produto). "Como funciona" leva à narrativa Conectar/Organizar/Interpretar/
 * Decidir da SolutionSection (#produto — mesmo destino do CTA "Ver como
 * funciona" da Hero, para não haver dois links com significados diferentes
 * para o mesmo sítio). Os hrefs não mudam com o idioma — são âncoras internas.
 */
const links = {
  pt: [
    { label: 'Produto', href: '/#demo' },
    { label: 'Como funciona', href: '/#funcionamento' },
    { label: 'Segurança', href: '/#seguranca' },
    { label: 'Preços', href: '/#precos' },
    { label: 'Sobre nós', href: '/sobre/' },
  ],
  en: [
    { label: 'Product', href: '/#demo' },
    { label: 'How it works', href: '/#funcionamento' },
    { label: 'Security', href: '/#seguranca' },
    { label: 'Pricing', href: '/#precos' },
    { label: 'About us', href: '/sobre/' },
  ],
}

/** Página atual: só links para páginas (não âncoras) podem ficar ativos. */
function isCurrent(href: string) {
  if (typeof window === 'undefined' || href.includes('#')) return false
  return window.location.pathname.replace(/\/?$/, '/') === href
}

const copy = {
  pt: { bar: 'Finer Pioneers: primeiro mês grátis + 10% de desconto nos planos mensal e anual.', barShort: 'Finer Pioneers: 1.º mês grátis + 10%', barCta: 'Candidatar-me', barClose: 'Fechar aviso', skip: 'Saltar para o conteúdo', home: 'Finer One — página inicial', signIn: 'Lista de espera', cta: 'Ser Finer Pioneer', open: 'Abrir menu', close: 'Fechar menu' },
  en: { bar: 'Finer Pioneers: first month free + 10% off the monthly and annual plans.', barShort: 'Finer Pioneers: 1st month free + 10% off', barCta: 'Apply', barClose: 'Close notice', skip: 'Skip to content', home: 'Finer One — homepage', signIn: 'Join the waitlist', cta: 'Become a Finer Pioneer', open: 'Open menu', close: 'Close menu' },
}

/** Botão "PT"/"EN": troca para o idioma que ainda NÃO está ativo. */
function LanguageToggle({ className, light }: { className?: string; light?: boolean }) {
  const { lang, toggleLang } = useLanguage()
  const next = lang === 'pt' ? 'en' : 'pt'

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={lang === 'pt' ? 'Switch language to English' : 'Mudar idioma para português'}
      aria-pressed={lang === 'en'}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-1 rounded-lg border px-3 text-[12px] font-medium uppercase tracking-wide transition-colors duration-300',
        light ? 'border-[#0B1030]/[0.12] text-[#0B1030]/45 hover:border-[#0B1030]/25 hover:text-[#070D2B]' : 'border-white/[0.12] bg-white/[0.03] text-mist hover:border-white/25 hover:bg-white/[0.06] hover:text-white',
        className,
      )}
    >
      <span className={lang === 'pt' ? (light ? 'text-[#070D2B]' : 'text-white') : undefined}>PT</span>
      <span aria-hidden="true" className={light ? 'text-[#0B1030]/20' : 'text-white/25'}>/</span>
      <span className={lang === 'en' ? (light ? 'text-[#070D2B]' : 'text-white') : undefined}>EN</span>
      <span className="sr-only">
        {lang === 'pt' ? `— switch to ${next.toUpperCase()}` : `— mudar para ${next.toUpperCase()}`}
      </span>
    </button>
  )
}

/**
 * Verifica se o que está por baixo da barra é claro: procura, no ponto logo abaixo
 * dela, o primeiro elemento com fundo (cor ou gradiente). Imagens e vídeos contam
 * como escuros (a hero e o CTA final). Sem fundo encontrado = escuro (página navy).
 */
function isLightBehind(): boolean {
  const x = Math.round(window.innerWidth / 2)
  for (const el of document.elementsFromPoint(x, 40)) {
    if (el.closest('header')) continue
    if (el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'CANVAS') return false
    const cs = getComputedStyle(el)
    let rgb = cs.backgroundColor.match(/rgba?\(([^)]+)\)/)?.[1]
    if (rgb && rgb.split(',').length === 4 && parseFloat(rgb.split(',')[3]) < 0.5) rgb = undefined
    if (!rgb && cs.backgroundImage.includes('gradient')) rgb = cs.backgroundImage.match(/rgba?\(([^)]+)\)/)?.[1]
    if (!rgb) continue
    const [r, g, b] = rgb.split(',').map((v) => parseFloat(v))
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6
  }
  return false
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // Por cima de secções claras a barra fica clara (como na Ramp, Lovable e Searchable).
  const [lightBg, setLightBg] = useState(false)
  const { lang } = useLanguage()
  const t = copy[lang]
  // Faixa de anúncio no topo (como na Ramp e na Lovable): a oferta real dos Finer Pioneers.
  // Só no topo da página; desaparece com o scroll; pode ser fechada; não aparece na própria página Pioneers.
  const [barClosed, setBarClosed] = useState(() => {
    try {
      return window.location.pathname.startsWith('/pioneers') || window.sessionStorage.getItem('fo-bar') === '0'
    } catch {
      return false
    }
  })
  const closeBar = () => {
    setBarClosed(true)
    try {
      window.sessionStorage.setItem('fo-bar', '0')
    } catch {
      /* sem armazenamento: fecha só nesta visita */
    }
  }

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      setScrolled(window.scrollY > 12)
      setLightBg(isLightBehind())
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    // Releitura depois de a página assentar (imagens, fontes, animações de entrada).
    const late = [window.setTimeout(onScroll, 250), window.setTimeout(onScroll, 1200)]
    window.addEventListener('load', onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      late.forEach((id) => window.clearTimeout(id))
      window.removeEventListener('load', onScroll)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
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

  const light = lightBg && !open
  const showBar = !barClosed && !scrolled && !open

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300',
          light
            ? 'border-b border-[#0B1030]/[0.07] bg-white/[0.82] backdrop-blur-xl'
            : scrolled || open
              ? 'border-b border-white/[0.07] bg-navy-deep/[0.8] backdrop-blur-xl'
              : 'border-b border-transparent bg-navy/40 backdrop-blur-sm',
        )}
      >
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          {t.skip}
        </a>

        <div className={cn('grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out', showBar ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')} aria-hidden={!showBar}>
          <div className="min-h-0">
            <div className="relative flex h-9 items-center justify-center border-b border-white/[0.08] bg-[linear-gradient(90deg,#070D2B,#0A1E6B_50%,#070D2B)] px-10 text-[12.5px] text-white/85">
              <a href="/pioneers/" tabIndex={showBar ? 0 : -1} className="group inline-flex min-w-0 max-w-full items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow">
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-glow shadow-[0_0_8px_rgba(30,144,255,0.9)]" />
                <span className="hidden truncate sm:inline">{t.bar}</span>
                <span className="truncate sm:hidden">{t.barShort}</span>
                <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-white underline decoration-white/30 underline-offset-4 transition-colors group-hover:decoration-white">
                  <span className="max-sm:sr-only">{t.barCta}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </a>
              <button type="button" onClick={closeBar} tabIndex={showBar ? 0 : -1} aria-label={t.barClose} className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow">
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <nav
          aria-label={lang === 'pt' ? 'Principal' : 'Main'}
          className="mx-auto flex h-16 max-w-content items-center justify-between px-5 sm:px-6 lg:px-8"
        >
          <a href="/" aria-label={t.home} className="shrink-0 rounded-md">
            <Logo className={cn('transition-colors duration-300', light && 'text-[#070D2B]')} />
          </a>

          <ul className="mx-4 hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex xl:gap-9">
            {links[lang].map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  aria-current={isCurrent(link.href) ? 'page' : undefined}
                  className={cn(
                    'whitespace-nowrap rounded-md text-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4',
                    light ? 'text-[#0B1030]/65 hover:text-[#070D2B] aria-[current=page]:text-[#070D2B]' : 'text-mist hover:text-white aria-[current=page]:text-white',
                    light ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-navy',
                    'aria-[current=page]:font-medium',
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageToggle light={light} />
            <a href="/lista-espera/" className={buttonClasses({ variant: 'ghost', size: 'sm', className: light ? 'text-[#070D2B] hover:bg-[#0B1030]/[0.05] hover:text-[#070D2B]' : 'text-white/85' })}>
              {t.signIn}
            </a>
            <a href="/pioneers/" className={buttonClasses({ size: "sm", className: "font-semibold" })}>{t.cta}</a>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageToggle light={light} />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? t.close : t.open}
              aria-expanded={open}
              aria-controls="menu-mobile"
              className={cn('flex h-10 w-10 items-center justify-center rounded-lg transition-colors', light ? 'text-[#070D2B] hover:bg-[#0B1030]/[0.05]' : 'text-white hover:bg-white/[0.06]')}
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
                    aria-current={isCurrent(link.href) ? 'page' : undefined}
                    className="block border-b border-white/[0.05] py-3.5 text-[15px] text-mist transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none aria-[current=page]:font-medium aria-[current=page]:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-2 pt-8">
              <a href="/lista-espera/" className={buttonClasses({ variant: "outline", size: "lg" })} onClick={() => setOpen(false)}>
                {t.signIn}
              </a>
              <a href="/pioneers/" className={buttonClasses({ size: "lg", className: "font-semibold" })} onClick={() => setOpen(false)}>
                {t.cta}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

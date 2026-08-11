import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Produto', href: '#produto' },
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Preços', href: '#precos' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
          Saltar para o conteúdo
        </a>

        <nav
          aria-label="Principal"
          className="mx-auto flex h-16 max-w-content items-center justify-between px-5 sm:px-6 lg:px-8"
        >
          <a href="/" aria-label="Finer One — página inicial" className="shrink-0 rounded-md">
            <Logo />
          </a>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-mist transition-colors hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
            <Button size="sm">Começar Agora</Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="menu-mobile"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/[0.06] lg:hidden"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
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
              {links.map((link) => (
                <li key={link.href}>
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
                Entrar
              </Button>
              <Button size="lg" onClick={() => setOpen(false)}>
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

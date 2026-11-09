import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { ScaledCanvas } from '@/components/v2/finer-ui/ScaledCanvas'
import { LuminousLine } from '@/components/v2/LuminousLine'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useLanguage } from '@/i18n/LanguageContext'

const copy = {
  pt: {
    eyebrow: 'The Financial Operating System',
    first: 'A sua empresa já tem os números.',
    secondPrefix: 'Agora precisa de ',
    highlight: 'respostas',
    sub: 'Compreenda a situação financeira da sua empresa, saiba quanto tem por receber, acompanhe a tesouraria e descubra onde precisa de agir.',
    primary: 'Conhecer a Finer One',
    secondary: 'Ser Finer Pioneer',
    hint: 'Interface Finer Home · dados fictícios',
    signature: ['Where Finance ', 'Meets Strategy'],
  },
  en: {
    eyebrow: 'The Financial Operating System',
    first: 'Your company already has the numbers.',
    secondPrefix: 'Now it needs ',
    highlight: 'answers',
    sub: "Understand your company's financial position, know what you're owed, keep track of cash and find out where you need to act.",
    primary: 'Discover Finer One',
    secondary: 'Become a Finer Pioneer',
    hint: 'Finer Home interface · fictitious data',
    signature: ['Where Finance ', 'Meets Strategy'],
  },
}

/**
 * Hero v2.
 *
 * Narrativa: título → linha luminosa da marca a desenhar-se → o produto
 * "levanta-se" à medida que se faz scroll (inclinado em perspetiva, fica
 * plano e em escala total ao chegar ao centro do ecrã).
 */
export function HeroV2() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const showcaseRef = useScrollProgress<HTMLDivElement>({ mode: 'enter', endAt: 0.35 })

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-32 sm:pt-36 lg:pb-28 lg:pt-44">
      {/* Fundo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_-10%,#0E1A4A_0%,#070D2B_48%,#050A20_100%)]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(60% 50% at 50% 30%, #000, transparent)',
            WebkitMaskImage: 'radial-gradient(60% 50% at 50% 30%, #000, transparent)',
          }}
        />
        {/* Linha luminosa: sobe da esquerda e atravessa o título, como nas peças de marca. */}
        <LuminousLine
          viewBox="0 0 1600 700"
          d="M -40 610 C 300 600, 520 520, 760 420 S 1240 170, 1660 120"
          className="absolute left-1/2 top-[6%] h-[640px] w-[1600px] max-w-none -translate-x-1/2 opacity-80"
          delay={350}
          sparkDuration={7}
        />
        <div className="absolute left-1/2 top-[52%] h-[480px] w-[min(1200px,100vw)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(30,144,255,0.28),rgba(0,82,255,0.10)_50%,transparent)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-navy-deep" />
      </div>

      <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-glow backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-glow shadow-[0_0_12px_2px_rgba(30,144,255,0.8)]" aria-hidden="true" />
            {t.eyebrow}
          </p>

          <h1 className="mt-7 max-w-[1180px] text-balance font-display text-[34px] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-[48px] lg:text-[58px]">
            <span className="block animate-fade-up [animation-delay:80ms]">{t.first}</span>
            <span className="mt-1 block animate-fade-up [animation-delay:200ms]">
              {t.secondPrefix}
              <span className="bg-gradient-to-r from-accent via-glow to-[#7CC4FF] bg-clip-text text-transparent">{t.highlight}</span>
              <span className="text-accent">.</span>
            </span>
          </h1>

          <p className="mt-6 max-w-2xl animate-fade-up text-balance text-[15px] leading-relaxed text-white/80 [animation-delay:320ms] sm:text-[17px]">
            {t.sub}
          </p>

          <div className="mt-9 flex w-full animate-fade-up flex-col items-center gap-3 [animation-delay:420ms] sm:w-auto sm:flex-row">
            <a href="#demo" className={buttonClasses({ size: 'lg', className: 'group w-full font-semibold sm:w-auto' })}>
              {t.primary}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <a href="/pioneers/" className={buttonClasses({ variant: 'outline', size: 'lg', className: 'group w-full sm:w-auto' })}>
              {t.secondary}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>

          <p className="mt-8 animate-fade-up text-[11px] font-semibold uppercase tracking-[0.3em] text-white/75 [animation-delay:520ms]">
            {t.signature[0]}
            <span className="text-glow">{t.signature[1]}</span>.
          </p>
        </div>

        {/* Produto: perspetiva → plano com o scroll. Valores em --p (0–1). */}
        <div id="produto-demo" className="relative mt-14 scroll-mt-24 animate-fade-up [animation-delay:600ms] [perspective:1800px] sm:mt-20">
          <div
            ref={showcaseRef}
            className="relative origin-top will-change-transform"
            style={{
              transform:
                'rotateX(calc((1 - var(--p, 0)) * 22deg)) scale(calc(0.9 + var(--p, 0) * 0.1)) translateY(calc((1 - var(--p, 0)) * 24px))',
            }}
          >
            <div aria-hidden="true" className="absolute inset-x-0 -top-10 bottom-10 rounded-[40px] bg-[radial-gradient(70%_60%_at_50%_0%,rgba(0,82,255,0.35),transparent_70%)] blur-3xl" />
            <div className="relative mb-3 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-navy-deep/90 px-3 py-1.5 text-[11.5px] font-medium text-white/85">
                <span className="h-1.5 w-1.5 rounded-full bg-glow" aria-hidden="true" />
                {t.hint}
              </span>
            </div>
            <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.18] via-white/[0.06] to-transparent p-px shadow-frame">
              <div className="overflow-hidden rounded-[15px] bg-white" inert>
                {/* Imagem viva da Finer Home; a versão interativa está em #demo. */}
                <ScaledCanvas width={1320}>
                  <AppShell view="home">
                    <FinerHomeView interactive={false} />
                  </AppShell>
                </ScaledCanvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

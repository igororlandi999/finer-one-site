import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, Pause, Play, PlayCircle } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import { LuminousLine } from '@/components/v2/LuminousLine'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { ScaledCanvas } from '@/components/v2/finer-ui/ScaledCanvas'
import { DEMO_VIDEO, HERO_BACKGROUND } from '@/config/demo'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'

const copy: Record<Lang, {
  eyebrow: string; first: string; secondPrefix: string; highlight: string; sub: string
  primary: string; secondary: string; waitlistPrefix: string; waitlist: string
  badge: string; play: string; pause: string; videoLabel: string; posterLabel: string
}> = {
  pt: {
    eyebrow: 'The Financial Operating System',
    first: 'A sua empresa já tem os números.',
    secondPrefix: 'Agora precisa de ',
    highlight: 'respostas',
    sub: 'Saiba quanto tem por receber, acompanhe a tesouraria e descubra o que merece a sua atenção. A Finer One transforma informação financeira em clareza para decidir.',
    primary: 'Ser Finer Pioneer',
    secondary: 'Ver a Finer One em ação',
    waitlistPrefix: 'Prefere acompanhar à distância?',
    waitlist: 'Entrar na lista de espera',
    badge: 'Dados fictícios',
    play: 'Reproduzir vídeo',
    pause: 'Pausar vídeo',
    videoLabel: 'Vídeo de demonstração da plataforma Finer One, com dados fictícios',
    posterLabel: 'Finer Home, o ecrã inicial da plataforma Finer One, com dados fictícios',
  },
  en: {
    eyebrow: 'The Financial Operating System',
    first: 'Your company already has the numbers.',
    secondPrefix: 'Now it needs ',
    highlight: 'answers',
    sub: 'Know what you are owed, keep track of cash and discover what deserves your attention. Finer One turns financial information into clarity to decide.',
    primary: 'Become a Finer Pioneer',
    secondary: 'See Finer One in action',
    waitlistPrefix: 'Prefer to follow along?',
    waitlist: 'Join the waitlist',
    badge: 'Fictitious data',
    play: 'Play video',
    pause: 'Pause video',
    videoLabel: 'Finer One platform demo video, with fictitious data',
    posterLabel: 'Finer Home, the Finer One start screen, with fictitious data',
  },
}
type T = (typeof copy)['pt']

/**
 * Hero em duas colunas, à maneira da Searchable mas com a identidade Finer One:
 * mensagem à esquerda; vídeo da plataforma à direita, assente num painel com
 * a fotografia oficial (montanha + linha azul). No telemóvel o vídeo fica por
 * baixo do texto.
 *
 * Vídeo: definido em src/config/demo.ts (MP4 16:9, sem som, em loop, inline,
 * com poster). Até existir o vídeo final, mostra a Finer Home estática.
 */
export function HeroDemo() {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <section
      aria-labelledby="hero-titulo"
      className="relative isolate overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-32 lg:flex lg:min-h-[max(720px,100svh)] lg:items-center lg:pb-20 lg:pt-28"
    >
      <Backdrop />

      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] lg:gap-16 lg:px-12 xl:gap-[72px]">
        {/* Mensagem */}
        <div className="max-w-[580px]">
          <p className="inline-flex animate-fade-up items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.28em] text-[#7CB8FF]">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-glow" aria-hidden="true" />
            {t.eyebrow}
          </p>
          <h1 id="hero-titulo" className="mt-7 font-display text-[38px] font-bold leading-[1.06] tracking-[-0.035em] text-white sm:text-[50px] lg:text-[46px] xl:text-[54px]">
            <span className="block text-balance animate-fade-up [animation-delay:90ms]">{t.first}</span>
            <span className="mt-1 block text-balance animate-fade-up [animation-delay:200ms]">
              {t.secondPrefix}
              <span className="text-accent [text-shadow:0_0_40px_rgba(0,82,255,0.5)]">{t.highlight}</span>
              <span className="text-accent">.</span>
            </span>
          </h1>
          <p className="mt-7 max-w-[520px] animate-fade-up text-[16.5px] leading-[1.65] text-white/80 [animation-delay:300ms] sm:text-[18px]">{t.sub}</p>
          <div className="mt-10 flex animate-fade-up flex-col gap-3 [animation-delay:400ms] sm:flex-row sm:items-center sm:gap-4">
            <a href="/pioneers/" className={buttonClasses({ size: 'lg', className: 'group px-7 font-semibold' })}>
              {t.primary}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <a href="#demo" className={buttonClasses({ variant: 'ghost', size: 'lg', className: 'text-white/90 hover:text-white' })}>
              <PlayCircle className="h-[18px] w-[18px] text-glow" aria-hidden="true" />
              {t.secondary}
            </a>
          </div>
          <p className="mt-6 animate-fade-up text-[13.5px] text-white/70 [animation-delay:480ms]">
            {t.waitlistPrefix}{' '}
            <a href="/lista-espera/" className="font-medium text-white/90 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-glow">
              {t.waitlist}
            </a>
          </p>
        </div>

        {/* Vídeo da plataforma */}
        <div className="relative pb-8 pr-4 opacity-0 [animation:fo-enter-right_1s_cubic-bezier(0.22,1,0.36,1)_450ms_forwards] sm:pb-10 sm:pr-8 lg:pb-12 lg:pr-10">
          {/* Painel de fundo com a fotografia oficial, desencontrado da moldura */}
          <div aria-hidden="true" className="absolute bottom-0 left-8 right-0 top-10 rounded-[24px] border border-white/[0.12] bg-[linear-gradient(140deg,rgba(11,26,74,0.55),rgba(3,6,15,0.35))] backdrop-blur-[2px] sm:left-12 lg:left-16" />
          <LuminousLine
            viewBox="0 0 1000 600"
            d="M -80 560 C 220 560, 380 500, 520 430 S 800 220, 1080 170"
            className="absolute -bottom-6 -left-24 h-[75%] w-[calc(100%+6rem)] max-w-none opacity-60"
            delay={900}
            spark={false}
          />
          <div className="relative">{DEMO_VIDEO.src ? <DemoVideo t={t} /> : <Poster t={t} />}</div>
        </div>
      </div>
    </section>
  )
}

/**
 * Fundo cinematográfico: a Terra vista do espaço em movimento muito lento.
 * Os gradientes navy mantêm o texto e a plataforma legíveis; a Terra fica
 * visível sobretudo em baixo e nas extremidades.
 */
function Backdrop() {
  const reduced = usePrefersReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)')
  const saveData = typeof navigator !== 'undefined' && Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
  const useVideo = wide && !reduced && !saveData

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#03060F]">
      {useVideo ? (
        <video
          className="absolute inset-0 h-full w-full translate-y-[16%] scale-[1.12] object-cover object-[50%_60%] animate-fade-in"
          src={HERO_BACKGROUND.video}
          poster={HERO_BACKGROUND.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
        />
      ) : (
        <img src={HERO_BACKGROUND.poster} alt="" className="absolute inset-0 h-full w-full translate-y-[16%] scale-[1.12] object-cover object-[50%_60%]" />
      )}
      {/* Leitura: navy forte à esquerda (texto), aliviando para a direita */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(3,6,15,0.94)_0%,rgba(3,6,15,0.78)_36%,rgba(3,6,15,0.35)_68%,rgba(3,6,15,0.45)_100%)]" />
      {/* Topo limpo por baixo da navegação; centro sem competir com o título */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,6,15,0.95)_0%,rgba(3,6,15,0.55)_28%,rgba(3,6,15,0.1)_60%,transparent_100%)]" />
      {/* Transição para a secção seguinte */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-navy-deep" />
    </div>
  )
}

/** Moldura de aplicação 16:9 — a mesma para o vídeo final e para o poster. */
function Frame({ t, children, controls }: { t: T; children: ReactNode; controls?: ReactNode }) {
  return (
    <div className="rounded-[16px] bg-gradient-to-b from-white/30 via-white/[0.08] to-white/[0.03] p-px shadow-[0_50px_110px_-40px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="relative overflow-hidden rounded-[15px] bg-white">
        <div className="relative aspect-video bg-[#F7F9FE]">{children}</div>
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-[#0B1030]/75 px-2.5 py-1 text-[10.5px] font-semibold text-white backdrop-blur">{t.badge}</span>
        {controls}
      </div>
    </div>
  )
}

/** Imagem de substituição: a Finer Home reconstruída, estática. */
function Poster({ t }: { t: T }) {
  return (
    <Frame t={t}>
      <div role="img" aria-label={t.posterLabel} className="absolute inset-0">
        <div inert className="absolute inset-0">
          <ScaledCanvas width={1600}>
            <div className="h-[900px] overflow-hidden">
              <AppShell view="home">
                <FinerHomeView interactive={false} />
              </AppShell>
            </div>
          </ScaledCanvas>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------- Vídeo final ---------------- */

function DemoVideo({ t }: { t: T }) {
  const reduced = usePrefersReducedMotion()
  const video = useRef<HTMLVideoElement>(null)
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.3, rootMargin: '0px' })
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)

  // Só reproduz quando visível, sem pausa do visitante e sem preferência por menos movimento.
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (inView && !reduced && !userPaused) v.play().catch(() => setPlaying(false))
    else v.pause()
  }, [inView, reduced, userPaused])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) {
      setUserPaused(false)
      v.play().catch(() => undefined)
    } else {
      setUserPaused(true)
      v.pause()
    }
  }

  return (
    <div ref={ref}>
      <Frame
        t={t}
        controls={
          !reduced && (
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? t.pause : t.play}
              className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1030]/75 text-white backdrop-blur transition-colors hover:bg-[#0B1030]"
            >
              {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="ml-0.5 h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          )
        }
      >
        <video
          ref={video}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload={reduced ? 'none' : 'metadata'}
          poster={DEMO_VIDEO.poster}
          aria-label={t.videoLabel}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          {DEMO_VIDEO.webm && <source src={DEMO_VIDEO.webm} type="video/webm" />}
          <source src={DEMO_VIDEO.src} type="video/mp4" />
        </video>
      </Frame>
    </div>
  )
}

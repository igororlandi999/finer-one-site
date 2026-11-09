import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, Home, Lightbulb, Pause, Play, PlayCircle } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import { LuminousLine } from '@/components/v2/LuminousLine'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import type { View } from '@/components/v2/finer-ui/AppShell'
import { FinerAdvisorView } from '@/components/v2/finer-ui/FinerAdvisorView'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { ScaledCanvas } from '@/components/v2/finer-ui/ScaledCanvas'
import { DEMO_VIDEO } from '@/config/demo'
import { useInView } from '@/hooks/useInView'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const copy: Record<Lang, {
  eyebrow: string; first: string; secondPrefix: string; highlight: string; sub: string
  primary: string; secondary: string; waitlistPrefix: string; waitlist: string
  badge: string; badgeShort: string; play: string; pause: string; tabsLabel: string
  tabs: Record<View, { label: string; hint: string }>; explore: string; videoLabel: string
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
    badge: 'Demonstração · dados fictícios',
    badgeShort: 'Dados fictícios',
    play: 'Reproduzir demonstração',
    pause: 'Pausar demonstração',
    tabsLabel: 'Áreas da plataforma',
    tabs: { home: { label: 'Finer Home', hint: 'Visão do dia' }, advisor: { label: 'Finer Advisor', hint: 'O que fazer a seguir' } },
    explore: 'Clique para explorar',
    videoLabel: 'Vídeo de demonstração da plataforma Finer One',
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
    badge: 'Demo · fictitious data',
    badgeShort: 'Fictitious data',
    play: 'Play demo',
    pause: 'Pause demo',
    tabsLabel: 'Platform areas',
    tabs: { home: { label: 'Finer Home', hint: 'Daily view' }, advisor: { label: 'Finer Advisor', hint: 'What to do next' } },
    explore: 'Click to explore',
    videoLabel: 'Finer One platform demo video',
  },
}

/**
 * Hero: mensagem + uma única janela da plataforma.
 *
 * O scroll da página é sempre natural; o movimento acontece só dentro da
 * janela. Com vídeo configurado (config/demo.ts) mostra a gravação real; sem
 * vídeo, mostra a demonstração interativa fiel às capturas, com visita
 * automática que o visitante pode pausar ou interromper ao explorar.
 */
export function HeroDemo() {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <section aria-labelledby="hero-titulo" className="relative isolate overflow-hidden pb-20 pt-[104px] sm:pt-32 lg:pb-28 lg:pt-36">
      <Backdrop />

      <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <p className="inline-flex animate-fade-up items-center gap-2.5 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-[#7CB8FF]">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-glow" aria-hidden="true" />
          {t.eyebrow}
        </p>
        <h1 id="hero-titulo" className="mt-6 font-display text-[36px] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-[50px] lg:text-[58px] xl:text-[66px]">
          <span className="block text-balance animate-fade-up [animation-delay:90ms]">{t.first}</span>
          <span className="block text-balance animate-fade-up [animation-delay:200ms]">
            {t.secondPrefix}
            <span className="text-accent [text-shadow:0_0_42px_rgba(0,82,255,0.55)]">{t.highlight}</span>
            <span className="text-accent">.</span>
          </span>
        </h1>
        <p className="mt-6 max-w-[620px] animate-fade-up text-[16px] leading-relaxed text-white/80 [animation-delay:300ms] sm:text-[18px]">{t.sub}</p>
        <div className="mt-8 flex animate-fade-up flex-col gap-3 [animation-delay:400ms] sm:flex-row sm:items-center">
          <a href="/pioneers/" className={buttonClasses({ size: 'lg', className: 'group font-semibold' })}>
            {t.primary}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
          <a href="#plataforma" className={buttonClasses({ variant: 'ghost', size: 'lg', className: 'text-white/90 hover:text-white' })}>
            <PlayCircle className="h-[18px] w-[18px] text-glow" aria-hidden="true" />
            {t.secondary}
          </a>
        </div>
        <p className="mt-5 animate-fade-up text-[13.5px] text-white/70 [animation-delay:480ms]">
          {t.waitlistPrefix}{' '}
          <a href="/lista-espera/" className="font-medium text-white/90 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-glow">
            {t.waitlist}
          </a>
        </p>
      </div>

      {/* Janela da plataforma */}
      <div id="plataforma" className="relative mx-auto mt-14 max-w-[1240px] scroll-mt-24 animate-fade-up px-3 [animation-delay:550ms] sm:mt-16 sm:px-6 lg:px-8">
        {/* Linha luminosa discreta: horizonte por trás do topo da janela */}
        <LuminousLine
          viewBox="0 0 1600 200"
          d="M -40 150 C 360 150, 560 70, 800 70 S 1240 150, 1640 150"
          className="absolute inset-x-0 -top-[70px] h-[200px] w-full opacity-70"
          delay={600}
          sparkDuration={10}
        />
        <div aria-hidden="true" className="absolute inset-x-[10%] top-10 h-[60%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,82,255,0.22),transparent)] blur-3xl" />
        <div className="relative">{DEMO_VIDEO.src ? <DemoVideo t={t} /> : <InteractiveDemo t={t} />}</div>
      </div>
    </section>
  )
}

type T = (typeof copy)['pt']

function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#040817]">
      <div className="absolute left-1/2 top-[-20%] h-[90%] w-[120%] -translate-x-1/2 bg-[radial-gradient(45%_55%_at_50%_0%,rgba(0,82,255,0.18),rgba(0,82,255,0.05)_45%,transparent_70%)]" />
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          maskImage: 'radial-gradient(70% 45% at 50% 15%, #000, transparent)',
          WebkitMaskImage: 'radial-gradient(70% 45% at 50% 15%, #000, transparent)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-navy-deep" />
    </div>
  )
}

/** Moldura premium comum ao vídeo e à demonstração interativa. */
function Frame({ t, toolbar, children }: { t: T; toolbar?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-[20px] bg-gradient-to-b from-white/25 via-white/[0.08] to-white/[0.03] p-px shadow-[0_60px_140px_-50px_rgba(0,0,0,0.95)]">
      <div className="overflow-hidden rounded-[19px] bg-white">
        <div className="flex items-center gap-3 border-b border-[#0B1030]/[0.08] bg-[#FBFCFF] px-3 py-2 sm:px-4">
          <div className="hidden gap-1.5 sm:flex" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0B1030]/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#0B1030]/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#0B1030]/15" />
          </div>
          <div className="min-w-0 flex-1">{toolbar}</div>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-[#EEF3FF] px-2.5 py-1 text-[10.5px] font-semibold text-accent">
            <span className="sm:hidden">{t.badgeShort}</span>
            <span className="hidden sm:inline">{t.badge}</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ---------------- Vídeo real (quando existir) ---------------- */

function DemoVideo({ t }: { t: T }) {
  const reduced = usePrefersReducedMotion()
  const video = useRef<HTMLVideoElement>(null)
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.3, rootMargin: '0px' })
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)

  // Reproduz só quando visível e se o visitante não pausou nem pediu menos movimento.
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
      <Frame t={t}>
        <div className="relative bg-[#F7F9FE]">
          <video
            ref={video}
            className="block aspect-[16/10] w-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            poster={DEMO_VIDEO.poster}
            aria-label={t.videoLabel}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            {DEMO_VIDEO.webm && <source src={DEMO_VIDEO.webm} type="video/webm" />}
            <source src={DEMO_VIDEO.src} type="video/mp4" />
          </video>
          <PlayToggle playing={playing} onToggle={toggle} t={t} className="absolute bottom-3 right-3" />
        </div>
      </Frame>
    </div>
  )
}

function PlayToggle({ playing, onToggle, t, className }: { playing: boolean; onToggle: () => void; t: T; className?: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? t.pause : t.play}
      className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-navy/85 text-white shadow-lg backdrop-blur transition-colors hover:bg-navy', className)}
    >
      {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />}
    </button>
  )
}

/* ---------------- Demonstração interativa (até haver vídeo) ---------------- */

/** Visita automática: cada passo mostra uma vista e uma posição (0 = topo, 1 = fim). */
const TOUR: { view: View; at: number; ms: number }[] = [
  { view: 'home', at: 0, ms: 4200 },
  { view: 'home', at: 1, ms: 4600 },
  { view: 'advisor', at: 0, ms: 4200 },
  { view: 'advisor', at: 0.55, ms: 4200 },
  { view: 'advisor', at: 1, ms: 4800 },
]

const VIEWS: { id: View; Icon: typeof Home }[] = [
  { id: 'home', Icon: Home },
  { id: 'advisor', Icon: Lightbulb },
]

function InteractiveDemo({ t }: { t: T }) {
  const reduced = usePrefersReducedMotion()
  const wide = useMediaQuery('(min-width: 1024px)')
  const { ref: inViewRef, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.25, rootMargin: '0px' })

  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [manual, setManual] = useState(false)
  const [manualView, setManualView] = useState<View>('home')
  const [pan, setPan] = useState(0)

  const viewport = useRef<HTMLDivElement>(null)
  const content = useRef<Record<View, HTMLDivElement | null>>({ home: null, advisor: null })

  const autoplay = playing && !manual && !reduced
  const view: View = manual || reduced ? manualView : TOUR[step].view

  // Avança a visita (pausa fora do ecrã e com o separador do browser escondido).
  useEffect(() => {
    if (!autoplay || !inView) return
    const id = window.setTimeout(() => setStep((s) => (s + 1) % TOUR.length), TOUR[step].ms)
    return () => window.clearTimeout(id)
  }, [autoplay, inView, step])

  // Calcula a deslocação interna do passo atual (em píxeis reais).
  useLayoutEffect(() => {
    if (manual || reduced) return
    const vp = viewport.current
    const el = content.current[TOUR[step].view]
    if (!vp || !el) return
    setPan(Math.max(0, el.offsetHeight - vp.clientHeight) * TOUR[step].at)
  }, [step, manual, reduced, wide])

  // Entrar em modo manual conserva a posição atual (sem saltos).
  useEffect(() => {
    if (manual && viewport.current) viewport.current.scrollTop = pan
  }, [manual])

  const takeControl = () => {
    if (manual) return
    setManualView(TOUR[step].view)
    setManual(true)
    setPlaying(false)
  }

  const selectView = (v: View) => {
    if (!manual) {
      setManual(true)
      setPlaying(false)
    }
    setManualView(v)
    setPan(0)
    if (viewport.current) viewport.current.scrollTop = 0
  }

  const togglePlay = () => {
    if (autoplay) {
      setPlaying(false)
      return
    }
    // Retoma a visita a partir da vista que está a ser vista.
    const idx = TOUR.findIndex((s) => s.view === view)
    if (viewport.current) viewport.current.scrollTop = 0
    setStep(idx < 0 ? 0 : idx)
    setManual(false)
    setPlaying(true)
  }

  const renderView = (v: View) => {
    const body =
      v === 'home' ? <FinerHomeView onOpenAdvisor={() => selectView('advisor')} /> : <FinerAdvisorView />
    const app = (
      <AppShell view={v} onNavigate={selectView}>
        {body}
      </AppShell>
    )
    return wide ? <ScaledCanvas width={1320}>{app}</ScaledCanvas> : app
  }

  const toolbar = (
    <div role="tablist" aria-label={t.tabsLabel} className="flex items-center gap-1">
      {VIEWS.map(({ id, Icon }) => {
        const active = view === id
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls="demo-janela"
            onClick={() => selectView(id)}
            className={cn(
              'relative flex items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors sm:gap-2 sm:px-3',
              active ? 'bg-white text-[#0B1030] shadow-[0_1px_0_rgba(11,16,48,0.06),0_0_0_1px_rgba(11,16,48,0.08)]' : 'text-[#0B1030]/65 hover:text-[#0B1030]',
            )}
          >
            <Icon className={cn('h-3.5 w-3.5', active ? 'text-accent' : '')} aria-hidden="true" />
            {t.tabs[id].label}
            <span className="hidden font-normal text-[#0B1030]/60 xl:inline">· {t.tabs[id].hint}</span>
            {/* Progresso da visita automática */}
            {active && autoplay && (
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-accent/15">
                <span
                  key={step}
                  className="block h-full origin-left bg-accent"
                  style={{ animation: `fo-progress ${TOUR[step].ms}ms linear forwards`, animationPlayState: inView ? 'running' : 'paused' }}
                />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )

  return (
    <div ref={inViewRef}>
      <Frame t={t} toolbar={toolbar}>
        <div className="relative">
          <div
            id="demo-janela"
            ref={viewport}
            role="tabpanel"
            aria-label={t.tabs[view].label}
            onPointerDown={takeControl}
            className={cn('relative h-[460px] bg-[#F7F9FE] sm:h-[520px] lg:h-[clamp(460px,64vh,640px)]', manual || reduced ? 'overflow-y-auto overscroll-auto' : 'overflow-hidden')}
          >
            {VIEWS.map(({ id }) => (
              <div
                key={id}
                ref={(el) => {
                  content.current[id] = el
                }}
                aria-hidden={view !== id}
                className={cn(
                  'transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.45,0,0.2,1)]',
                  view === id ? 'relative opacity-100' : 'pointer-events-none absolute inset-x-0 top-0 opacity-0',
                )}
                style={{ transform: !manual && !reduced && view === id ? `translate3d(0, ${-pan}px, 0)` : undefined }}
              >
                {renderView(id)}
              </div>
            ))}
          </div>

          {!reduced && (
            <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2">
              {autoplay && (
                <span className="hidden rounded-full bg-navy/80 px-3 py-1.5 text-[11.5px] font-medium text-white backdrop-blur sm:inline">{t.explore}</span>
              )}
              <PlayToggle playing={autoplay} onToggle={togglePlay} t={t} className="pointer-events-auto" />
            </div>
          )}
        </div>
      </Frame>
    </div>
  )
}

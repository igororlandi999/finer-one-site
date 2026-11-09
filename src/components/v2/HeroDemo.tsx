import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, Pause, Play, PlayCircle } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import { LuminousLine } from '@/components/v2/LuminousLine'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import type { View } from '@/components/v2/finer-ui/AppShell'
import { FinerAdvisorView } from '@/components/v2/finer-ui/FinerAdvisorView'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { ScaledCanvas } from '@/components/v2/finer-ui/ScaledCanvas'
import { AlertasView, CashflowView, ClientesView, DespesasView, ReceitasView } from '@/components/v2/finer-ui/screens'
import { DEMO_VIDEO } from '@/config/demo'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const copy: Record<Lang, {
  eyebrow: string; first: string; secondPrefix: string; highlight: string; sub: string
  primary: string; secondary: string; waitlistPrefix: string; waitlist: string
  badge: string; play: string; pause: string; chapters: string; videoLabel: string
  names: Record<View, string>
}> = {
  pt: {
    eyebrow: 'The Financial Operating System',
    first: 'A sua empresa já tem os números.',
    secondPrefix: 'Agora precisa de ',
    highlight: 'respostas',
    sub: 'A Finer One reúne a informação financeira da sua empresa, explica o que está a acontecer e mostra onde agir primeiro.',
    primary: 'Ser Finer Pioneer',
    secondary: 'Ver a Finer One em ação',
    waitlistPrefix: 'Prefere acompanhar à distância?',
    waitlist: 'Entrar na lista de espera',
    badge: 'Dados fictícios',
    play: 'Reproduzir demonstração',
    pause: 'Pausar demonstração',
    chapters: 'Ecrãs da demonstração',
    videoLabel: 'Vídeo de demonstração da plataforma Finer One',
    names: { home: 'Finer Home', cashflow: 'Cashflow', receitas: 'Receitas', despesas: 'Despesas', clientes: 'Clientes', advisor: 'Finer Advisor', alertas: 'Alertas' },
  },
  en: {
    eyebrow: 'The Financial Operating System',
    first: 'Your company already has the numbers.',
    secondPrefix: 'Now it needs ',
    highlight: 'answers',
    sub: 'Finer One brings your company’s financial information together, explains what is happening and shows where to act first.',
    primary: 'Become a Finer Pioneer',
    secondary: 'See Finer One in action',
    waitlistPrefix: 'Prefer to follow along?',
    waitlist: 'Join the waitlist',
    badge: 'Fictitious data',
    play: 'Play demo',
    pause: 'Pause demo',
    chapters: 'Demo screens',
    videoLabel: 'Finer One platform demo video',
    names: { home: 'Finer Home', cashflow: 'Cash flow', receitas: 'Revenue', despesas: 'Expenses', clientes: 'Customers', advisor: 'Finer Advisor', alertas: 'Alerts' },
  },
}
type T = (typeof copy)['pt']

/**
 * Hero em duas colunas: mensagem comercial à esquerda, demonstração da
 * plataforma à direita (por baixo do texto no telemóvel).
 *
 * A demonstração é um "vídeo de produto": com DEMO_VIDEO.src definido
 * (config/demo.ts) mostra a gravação real; até lá, mostra uma visita
 * automática aos ecrãs reais reconstruídos (dados fictícios), com movimento
 * de câmara suave, capítulos e pausa. O scroll da página é sempre natural.
 */
export function HeroDemo() {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <section aria-labelledby="hero-titulo" className="relative isolate overflow-hidden pb-20 pt-[104px] sm:pt-32 lg:pb-28 lg:pt-36">
      <Backdrop />

      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] lg:gap-14 lg:px-8">
        {/* Mensagem */}
        <div>
          <p className="inline-flex animate-fade-up items-center gap-2.5 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-[#7CB8FF]">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-glow" aria-hidden="true" />
            {t.eyebrow}
          </p>
          <h1 id="hero-titulo" className="mt-6 font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-[48px] lg:text-[46px] xl:text-[54px]">
            <span className="block text-balance animate-fade-up [animation-delay:90ms]">{t.first}</span>
            <span className="mt-1 block text-balance animate-fade-up [animation-delay:200ms]">
              {t.secondPrefix}
              <span className="text-accent [text-shadow:0_0_40px_rgba(0,82,255,0.55)]">{t.highlight}</span>
              <span className="text-accent">.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-[520px] animate-fade-up text-[16px] leading-relaxed text-white/80 [animation-delay:300ms] sm:text-[17.5px]">{t.sub}</p>
          <div className="mt-8 flex animate-fade-up flex-col gap-3 [animation-delay:400ms] sm:flex-row sm:items-center">
            <a href="/pioneers/" className={buttonClasses({ size: 'lg', className: 'group font-semibold' })}>
              {t.primary}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <a href="#demo" className={buttonClasses({ variant: 'ghost', size: 'lg', className: 'text-white/90 hover:text-white' })}>
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

        {/* Demonstração */}
        <div className="relative animate-fade-up [animation-delay:350ms]">
          <LuminousLine
            viewBox="0 0 1000 600"
            d="M -60 520 C 200 520, 330 470, 470 420 S 760 260, 1060 210"
            className="absolute -inset-x-16 -bottom-10 h-[70%] w-[calc(100%+8rem)] max-w-none opacity-70"
            delay={700}
            sparkDuration={11}
          />
          <div aria-hidden="true" className="absolute inset-[8%] rounded-[40%] bg-[radial-gradient(closest-side,rgba(0,82,255,0.30),transparent)] blur-3xl" />
          <div className="relative">{DEMO_VIDEO.src ? <DemoVideo t={t} /> : <ScreenTour t={t} />}</div>
        </div>
      </div>
    </section>
  )
}

function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#040817]">
      <div className="absolute right-[-10%] top-[-20%] h-[110%] w-[80%] bg-[radial-gradient(50%_50%_at_60%_40%,rgba(0,82,255,0.20),rgba(0,82,255,0.05)_50%,transparent_75%)]" />
      <div className="absolute left-[-10%] top-[-30%] h-[80%] w-[60%] bg-[radial-gradient(closest-side,rgba(30,144,255,0.08),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '88px 88px',
          maskImage: 'radial-gradient(60% 60% at 30% 30%, #000, transparent)',
          WebkitMaskImage: 'radial-gradient(60% 60% at 30% 30%, #000, transparent)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-navy-deep" />
    </div>
  )
}

/** Moldura de aplicação premium (comum ao vídeo real e à visita). */
function Frame({ title, badge, children }: { title: string; badge: string; children: ReactNode }) {
  return (
    <div className="rounded-[18px] bg-gradient-to-b from-white/30 via-white/[0.08] to-white/[0.03] p-px shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="overflow-hidden rounded-[17px] bg-white">
        <div className="flex items-center gap-3 border-b border-[#0B1030]/[0.08] bg-[#FBFCFF] px-3.5 py-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[#0B1030]/15" />
            <span className="h-2 w-2 rounded-full bg-[#0B1030]/15" />
            <span className="h-2 w-2 rounded-full bg-[#0B1030]/15" />
          </div>
          <span className="min-w-0 flex-1 truncate text-center text-[11px] font-semibold text-[#0B1030]/70">{title}</span>
          <span className="shrink-0 rounded-full bg-[#EEF3FF] px-2 py-0.5 text-[10px] font-semibold text-accent">{badge}</span>
        </div>
        {children}
      </div>
    </div>
  )
}

function PlayToggle({ playing, onToggle, t, className }: { playing: boolean; onToggle: () => void; t: T; className?: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? t.pause : t.play}
      className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.12]', className)}
    >
      {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="ml-0.5 h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  )
}

/* ---------------- Vídeo real (quando existir) ---------------- */

function DemoVideo({ t }: { t: T }) {
  const reduced = usePrefersReducedMotion()
  const video = useRef<HTMLVideoElement>(null)
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.3, rootMargin: '0px' })
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)

  // Só reproduz visível, sem pausa do visitante e sem preferência por menos movimento.
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
      <Frame title="Finer One" badge={t.badge}>
        <video
          ref={video}
          className="block aspect-[16/10] w-full bg-[#F7F9FE] object-cover"
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
      </Frame>
      <div className="mt-4 flex justify-end">
        <PlayToggle playing={playing} onToggle={toggle} t={t} />
      </div>
    </div>
  )
}

/* ---------------- Visita aos ecrãs (até haver vídeo) ---------------- */

type Focus = { x: number; y: number; s: number } | null

/**
 * Guião da visita: ecrã + enquadramento da "câmara" (origem em % do ecrã e
 * zoom). Cada ecrã abre em plano geral e aproxima-se do bloco que importa.
 */
const SCRIPT: { view: View; focus: Focus; ms: number }[] = [
  { view: 'home', focus: null, ms: 3400 },
  { view: 'home', focus: { x: 30, y: 85, s: 1.55 }, ms: 3800 },
  { view: 'cashflow', focus: null, ms: 3000 },
  { view: 'cashflow', focus: { x: 35, y: 70, s: 1.45 }, ms: 3600 },
  { view: 'receitas', focus: null, ms: 3000 },
  { view: 'receitas', focus: { x: 90, y: 72, s: 1.55 }, ms: 3600 },
  { view: 'despesas', focus: { x: 20, y: 30, s: 1.35 }, ms: 3400 },
  { view: 'clientes', focus: { x: 15, y: 30, s: 1.5 }, ms: 3800 },
  { view: 'advisor', focus: null, ms: 3200 },
  { view: 'advisor', focus: { x: 92, y: 88, s: 1.55 }, ms: 4400 },
  { view: 'alertas', focus: { x: 40, y: 45, s: 1.3 }, ms: 4000 },
]

const ORDER: View[] = ['home', 'cashflow', 'receitas', 'despesas', 'clientes', 'advisor', 'alertas']

function Screen({ view }: { view: View }) {
  const body = {
    home: <FinerHomeView interactive={false} />,
    cashflow: <CashflowView />,
    receitas: <ReceitasView />,
    despesas: <DespesasView />,
    clientes: <ClientesView />,
    advisor: <FinerAdvisorView />,
    alertas: <AlertasView />,
  }[view]
  return (
    <div className="h-[900px] overflow-hidden">
      <AppShell view={view}>{body}</AppShell>
    </div>
  )
}

function ScreenTour({ t }: { t: T }) {
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.3, rootMargin: '0px' })
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const autoplay = playing && !reduced

  useEffect(() => {
    if (!autoplay || !inView) return
    const id = window.setTimeout(() => setStep((s) => (s + 1) % SCRIPT.length), SCRIPT[step].ms)
    return () => window.clearTimeout(id)
  }, [autoplay, inView, step])

  const current = SCRIPT[step]
  const focus = reduced ? null : current.focus
  const chapter = ORDER.indexOf(current.view)

  const goTo = (v: View) => setStep(SCRIPT.findIndex((s) => s.view === v))

  // Mantém o capítulo ativo visível na fila (telemóvel), sem mexer no scroll da página.
  const chips = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const row = chips.current
    const el = row?.children[chapter] as HTMLElement | undefined
    if (row && el) row.scrollTo({ left: el.offsetLeft - row.clientWidth / 2 + el.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' })
  }, [chapter, reduced])

  return (
    <div ref={ref}>
      <Frame title={`Finer One · ${t.names[current.view]}`} badge={t.badge}>
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F7F9FE]" aria-label={t.videoLabel} role="img">
          <div
            inert
            className="absolute inset-0 transition-transform duration-[1600ms] ease-[cubic-bezier(0.45,0,0.2,1)] will-change-transform"
            style={{ transformOrigin: focus ? `${focus.x}% ${focus.y}%` : '50% 50%', transform: `scale(${focus ? focus.s : 1})` }}
          >
            {ORDER.map((v) => (
              <div
                key={v}
                className="absolute inset-0 transition-opacity duration-700 ease-out"
                style={{ opacity: v === current.view ? 1 : 0 }}
              >
                <ScaledCanvas width={1440}>
                  <Screen view={v} />
                </ScaledCanvas>
              </div>
            ))}
          </div>
        </div>
      </Frame>

      {/* Capítulos + reprodução */}
      <div className="mt-4 flex items-center gap-3">
        <div ref={chips} role="group" aria-label={t.chapters} className="no-scrollbar relative flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {ORDER.map((v, i) => {
            const active = i === chapter
            return (
              <button
                key={v}
                type="button"
                onClick={() => goTo(v)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'relative shrink-0 overflow-hidden whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors',
                  active ? 'bg-white/[0.10] text-white' : 'text-white/65 hover:text-white',
                )}
              >
                {t.names[v]}
                {active && autoplay && (
                  <span aria-hidden="true" className="absolute inset-x-3 bottom-0.5 h-px bg-white/15">
                    <span
                      key={step}
                      className="block h-full origin-left bg-glow"
                      style={{
                        animation: `fo-progress ${SCRIPT[step].ms}ms linear forwards`,
                        animationPlayState: inView ? 'running' : 'paused',
                      }}
                    />
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {!reduced && <PlayToggle playing={autoplay} onToggle={() => setPlaying((p) => !p)} t={t} />}
      </div>
    </div>
  )
}

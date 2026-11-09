import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import { Rise } from '@/components/v2/Rise'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import { FinerAdvisorView } from '@/components/v2/finer-ui/FinerAdvisorView'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { ScaledCanvas } from '@/components/v2/finer-ui/ScaledCanvas'
import { useInView } from '@/hooks/useInView'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

type Callout = { label: string; value: string; note: string }

const copy: Record<Lang, {
  eyebrow: string
  first: string
  secondPrefix: string
  highlight: string
  sub: string
  primary: string
  secondary: string
  waitlistPrefix: string
  waitlist: string
  demoBadge: string
  window: string
  scenes: { n: string; title: string; text: string }[]
  homeCallouts: Callout[]
  advisorCallouts: Callout[]
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
    demoBadge: 'Demonstração · dados fictícios',
    window: 'Finer One',
    scenes: [
      { n: '01', title: 'Compreender', text: 'A Finer Home reúne receitas, despesas, tesouraria e faturas por receber num só ecrã.' },
      { n: '02', title: 'Decidir', text: 'O Finer Advisor não se limita a mostrar indicadores: explica o que significam e o que pode ser feito.' },
    ],
    homeCallouts: [
      { label: 'Receitas recebidas', value: '€ 61.870', note: '+8,1% vs. mês anterior' },
      { label: 'Despesas pagas', value: '€ 44.150', note: '+11,6% vs. mês anterior' },
      { label: 'Tesouraria', value: '€ 48.320', note: 'Saldo disponível hoje' },
      { label: 'Faturas por receber', value: '€ 18.640', note: '7 faturas em atraso' },
    ],
    advisorCallouts: [
      { label: 'O problema', value: '€ 18.640 em atraso', note: '7 faturas por receber há, em média, 24 dias.' },
      { label: 'O que os dados mostram', value: '72% em 3 clientes', note: 'A concentração aumenta o risco para a tesouraria.' },
      { label: 'Recomendação Finer One', value: 'Contactar primeiro', note: 'Os 3 clientes com maior valor em atraso, com plano de pagamento.' },
    ],
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
    demoBadge: 'Demo · fictitious data',
    window: 'Finer One',
    scenes: [
      { n: '01', title: 'Understand', text: 'Finer Home brings revenue, expenses, cash and receivables together on one screen.' },
      { n: '02', title: 'Decide', text: 'Finer Advisor goes beyond indicators: it explains what they mean and what can be done.' },
    ],
    homeCallouts: [
      { label: 'Revenue received', value: '€61,870', note: '+8.1% vs. last month' },
      { label: 'Expenses paid', value: '€44,150', note: '+11.6% vs. last month' },
      { label: 'Cash', value: '€48,320', note: 'Available balance today' },
      { label: 'Receivables', value: '€18,640', note: '7 overdue invoices' },
    ],
    advisorCallouts: [
      { label: 'The problem', value: '€18,640 overdue', note: '7 invoices outstanding for 24 days on average.' },
      { label: 'What the data shows', value: '72% in 3 customers', note: 'Concentration increases the risk to cash.' },
      { label: 'Finer One recommendation', value: 'Contact first', note: 'The 3 customers with the largest overdue amounts, with a payment plan.' },
    ],
  },
}

/* ------------------------------------------------------------------ */

/**
 * Hero com narrativa em três momentos, ligada ao scroll:
 *   1. A promessa — título, linha luminosa e a plataforma a espreitar.
 *   2. Compreender — a Finer Home sobe e ganha protagonismo; surgem receitas,
 *      despesas, tesouraria e faturas por receber.
 *   3. Decidir — a interface passa ao Finer Advisor: o problema, o que os
 *      dados mostram e a recomendação.
 *
 * Desktop (≥1024px, com movimento): palco sticky. Movimento contínuo em CSS
 * (--p, sem renders por frame); mudanças de cena por estado, reversíveis.
 * Sem scroll-jacking: o scroll é sempre o do browser.
 * Tablet, telemóvel e movimento reduzido: composição estática equivalente.
 */
export function HeroStory() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const reduced = usePrefersReducedMotion()
  return isDesktop && !reduced ? <HeroPinned /> : <HeroStatic wide={isDesktop} />
}

/* ---------- Partes comuns ---------- */

function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#040817]">
      {/* Cone de luz controlado, vindo de cima */}
      <div className="absolute left-1/2 top-[-30%] h-[110%] w-[120%] -translate-x-1/2 bg-[radial-gradient(45%_55%_at_50%_0%,rgba(0,82,255,0.20),rgba(0,82,255,0.06)_45%,transparent_70%)]" />
      {/* Profundidade lateral muito discreta */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_35%,rgba(30,144,255,0.07),transparent_70%)]" />
      {/* Grelha técnica quase impercetível */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          maskImage: 'radial-gradient(70% 60% at 50% 20%, #000, transparent)',
          WebkitMaskImage: 'radial-gradient(70% 60% at 50% 20%, #000, transparent)',
        }}
      />
      {/* Grão fino: tira o aspeto "digital chapado" ao gradiente */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />
    </div>
  )
}

function HeroText({ t, className, style }: { t: (typeof copy)['pt']; className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={style}>
      <p className="inline-flex animate-fade-up items-center gap-2.5 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-[#7CB8FF]">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-glow" aria-hidden="true" />
        {t.eyebrow}
      </p>
      <h1 id="hero-titulo" className="mt-6 font-display text-[36px] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-[52px] lg:text-[56px] xl:text-[66px]">
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
        <a href="#demo" className={buttonClasses({ variant: 'ghost', size: 'lg', className: 'group text-white/90 hover:text-white' })}>
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
  )
}

/** Moldura da aplicação (janela com barra e etiqueta de dados fictícios). */
function AppFrame({ children, badge, title, className }: { children: ReactNode; badge: string; title: string; className?: string }) {
  return (
    <div className={cn('relative rounded-[18px] bg-gradient-to-b from-white/25 via-white/[0.08] to-white/[0.02] p-px shadow-[0_60px_140px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)]', className)}>
      <div className="overflow-hidden rounded-[17px] bg-white">
        <div className="flex items-center gap-3 border-b border-[#0B1030]/[0.08] bg-[#FBFCFF] px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0B1030]/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#0B1030]/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#0B1030]/15" />
          </div>
          <span className="truncate text-[11.5px] font-semibold text-[#0B1030]/70">{title}</span>
          <span className="ml-auto shrink-0 whitespace-nowrap rounded-full bg-[#EEF3FF] px-2.5 py-1 text-[10.5px] font-semibold text-accent">
            <span className="sm:hidden">{badge.split(' · ').pop()}</span>
            <span className="hidden sm:inline">{badge}</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}

function CalloutCard({ c, index, numbered, className }: { c: Callout; index?: number; numbered?: boolean; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-white/15 bg-[#081033]/90 p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md', className)}>
      <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#7CB8FF]">
        {numbered ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] text-white">{(index ?? 0) + 1}</span>
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-glow shadow-[0_0_10px_2px_rgba(30,144,255,0.8)]" aria-hidden="true" />
        )}
        {c.label}
      </p>
      <p className="tabular mt-2 font-display text-[19px] font-bold leading-tight text-white">{c.value}</p>
      <p className="mt-1 text-[12.5px] leading-snug text-white/75">{c.note}</p>
    </div>
  )
}

/* ---------- Desktop com movimento: palco sticky ---------- */

/** Limiares de progresso (0–1) de cada momento. */
const SCENES = [0, 0.2, 0.48, 0.66, 0.83]
/** Deslocação interna da interface (px da moldura) em cada momento. */
const PAN = [0, 110, 0, 170, 285]
/** Cartões de destaque sobre o menu lateral, sem nunca sair do ecrã. */
const CALLOUT_LEFT = 'max(-150px, calc((min(1080px, 80vw) - 100vw) / 2 + 16px))'

function HeroPinned() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const [scene, setScene] = useState(0)

  const trackRef = useScrollProgress<HTMLDivElement>({
    mode: 'through',
    reducedValue: null,
    onProgress: (p) => {
      let next = 0
      SCENES.forEach((start, i) => {
        if (p >= start) next = i
      })
      setScene((cur) => (cur === next ? cur : next))
    },
  })

  const advisor = scene >= 2
  // Avanço contínuo da 1.ª transição (texto sai, plataforma sobe): 0→1 entre p=0.02 e p=0.22.
  const rise = 'clamp(0, calc((var(--p, 0) - 0.02) * 5), 1)'

  return (
    <section aria-labelledby="hero-titulo" className="relative">
      <div ref={trackRef} className="relative" style={{ height: '360vh' }}>
        <div className="sticky top-0 isolate h-screen overflow-hidden">
          <Backdrop />

          {/* Linha luminosa: atravessa o palco e toca o topo da plataforma */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ opacity: `calc(1 - ${rise} * 0.75)` }}
          >
            <defs>
              <linearGradient id="hero-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#0052FF" stopOpacity="0" />
                <stop offset="0.45" stopColor="#1E90FF" stopOpacity="0.95" />
                <stop offset="0.6" stopColor="#9FD3FF" />
                <stop offset="1" stopColor="#1E90FF" stopOpacity="0" />
              </linearGradient>
              <filter id="hero-line-blur" x="-10%" y="-50%" width="120%" height="200%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>
            <g style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'fo-draw 2.6s cubic-bezier(0.65,0,0.35,1) 300ms forwards' }}>
              <path d="M -40 360 C 380 360, 560 550, 720 576 S 1180 530, 1480 400" pathLength={1} stroke="url(#hero-line)" strokeWidth="12" opacity="0.45" fill="none" filter="url(#hero-line-blur)" />
              <path d="M -40 360 C 380 360, 560 550, 720 576 S 1180 530, 1480 400" pathLength={1} stroke="url(#hero-line)" strokeWidth="2" fill="none" />
            </g>
          </svg>

          {/* 1. A promessa */}
          <div
            className="absolute inset-x-0 top-[calc(64px+6vh)] z-10"
            style={{ opacity: `calc(1 - ${rise} * 1.4)`, transform: `translate3d(0, calc(${rise} * -90px), 0)`, pointerEvents: scene === 0 ? 'auto' : 'none' }}
          >
            <div className="mx-auto max-w-content px-8">
              <HeroText t={t} />
            </div>
          </div>

          {/* Legenda das cenas 2 e 3 */}
          <div className="absolute inset-x-0 top-[calc(64px+3vh)] z-10">
            <div className="relative mx-auto h-[64px] max-w-[1120px] px-8">
              {t.scenes.map((s, i) => (
                <Rise key={s.n} show={(i === 0 && scene === 1) || (i === 1 && advisor)} delay={250} className="absolute inset-x-8 top-0">
                  <p className="flex items-baseline gap-3">
                    <span className="font-display text-[13px] font-bold tracking-[0.2em] text-glow">{s.n}</span>
                    <span className="font-display text-[22px] font-bold tracking-[-0.01em] text-white">{s.title}</span>
                    <span className="hidden text-[15px] text-white/75 xl:inline">— {s.text}</span>
                  </p>
                  <p className="mt-1 text-[14px] text-white/75 xl:hidden">{s.text}</p>
                </Rise>
              ))}
            </div>
          </div>

          {/* A plataforma */}
          <div
            className="absolute left-1/2 w-[min(1080px,80vw)] will-change-transform"
            style={{
              top: `calc(64vh - ${rise} * 44vh)`,
              transform: `translateX(-50%) scale(calc(0.94 + ${rise} * 0.06))`,
              transformOrigin: '50% 0%',
            }}
          >
            {/* Nó luminoso onde a linha toca a plataforma */}
            <span aria-hidden="true" className="absolute -top-[5px] left-1/2 z-20 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_14px_4px_rgba(30,144,255,0.9)]" style={{ opacity: `calc(1 - ${rise})` }} />

            <AppFrame badge={t.demoBadge} title={`${t.window} · ${advisor ? 'Finer Advisor' : 'Finer Home'}`}>
              <div className="relative h-[min(68vh,640px)] overflow-hidden" inert>
                {[false, true].map((isAdvisor) => (
                  <div
                    key={String(isAdvisor)}
                    aria-hidden={isAdvisor !== advisor}
                    className="absolute inset-x-0 top-0 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      opacity: isAdvisor === advisor ? 1 : 0,
                      transform: `translate3d(0, ${-(isAdvisor === advisor ? PAN[scene] : isAdvisor ? 0 : PAN[1])}px, 0) scale(${isAdvisor === advisor ? 1 : 0.985})`,
                    }}
                  >
                    <ScaledCanvas width={1320}>
                      <AppShell view={isAdvisor ? 'advisor' : 'home'}>
                        {isAdvisor ? <FinerAdvisorView /> : <FinerHomeView interactive={false} />}
                      </AppShell>
                    </ScaledCanvas>
                  </div>
                ))}
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white/95" />
              </div>
            </AppFrame>

            {/* Compreender: indicadores em destaque nas margens */}
            <div className="absolute top-[11%] z-20 w-[220px] space-y-3" style={{ left: CALLOUT_LEFT }}>
              {t.homeCallouts.map((c, i) => (
                <Rise key={c.label} show={scene === 1} delay={300 + i * 110} y={14}>
                  <CalloutCard c={c} />
                </Rise>
              ))}
            </div>

            {/* Decidir: problema → o que os dados mostram → recomendação */}
            <div className="absolute top-[11%] z-20 w-[250px] space-y-3" style={{ left: CALLOUT_LEFT }}>
              {t.advisorCallouts.map((c, i) => (
                <Rise key={c.label} show={scene >= 2 + i} delay={i === scene - 2 ? 350 : 0} y={14}>
                  <CalloutCard c={c} index={i} numbered className={cn(scene - 2 === i && 'border-accent/60 shadow-[0_0_0_1px_rgba(0,82,255,0.35),0_24px_60px_-20px_rgba(0,82,255,0.55)]')} />
                </Rise>
              ))}
            </div>
          </div>

          {/* Progresso discreto da narrativa */}
          <ol aria-hidden="true" className="absolute right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
            {[0, 1, 2].map((i) => {
              const on = (i === 0 && scene === 0) || (i === 1 && scene === 1) || (i === 2 && advisor)
              return <li key={i} className={cn('w-1 rounded-full transition-all duration-500', on ? 'h-8 bg-glow' : 'h-3 bg-white/25')} />
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ---------- Tablet, telemóvel e movimento reduzido ---------- */

function HeroStatic({ wide }: { wide: boolean }) {
  const { lang } = useLanguage()
  const t = copy[lang]

  const homeFrame = wide ? (
    <ScaledCanvas width={1320}>
      <AppShell view="home">
        <FinerHomeView interactive={false} />
      </AppShell>
    </ScaledCanvas>
  ) : (
    <AppShell view="home">
      <FinerHomeView interactive={false} showAsk={false} />
    </AppShell>
  )

  return (
    <section aria-labelledby="hero-titulo" className="relative isolate overflow-hidden pb-16 pt-[96px] sm:pt-28">
      <Backdrop />
      <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <HeroText t={t} />

        <div className="relative mt-10 sm:mt-14">
          <span aria-hidden="true" className="absolute -top-8 left-0 h-8 w-px bg-gradient-to-b from-transparent to-glow sm:left-8" />
          <AppFrame badge={t.demoBadge} title="Finer Home">
            <div className={cn('relative overflow-hidden', wide ? 'max-h-[620px]' : 'max-h-[440px] sm:max-h-[560px]')} inert>
              {homeFrame}
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" />
            </div>
          </AppFrame>
        </div>

        <StaticScene title={t.scenes[0]} callouts={t.homeCallouts} />

        <div className="mt-14">
          <AppFrame badge={t.demoBadge} title="Finer Advisor">
            <div className={cn('relative overflow-hidden', wide ? 'max-h-[620px]' : 'max-h-[480px] sm:max-h-[560px]')} inert>
              {wide ? (
                <ScaledCanvas width={1320}>
                  <AppShell view="advisor">
                    <FinerAdvisorView />
                  </AppShell>
                </ScaledCanvas>
              ) : (
                <AppShell view="advisor">
                  <FinerAdvisorView />
                </AppShell>
              )}
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" />
            </div>
          </AppFrame>
        </div>

        <StaticScene title={t.scenes[1]} callouts={t.advisorCallouts} numbered />
      </div>
    </section>
  )
}

function StaticScene({ title, callouts, numbered }: { title: { n: string; title: string; text: string }; callouts: Callout[]; numbered?: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: true, threshold: 0.15 })
  return (
    <div ref={ref} className="mt-8">
      <p className="flex items-baseline gap-3">
        <span className="font-display text-[13px] font-bold tracking-[0.2em] text-glow">{title.n}</span>
        <span className="font-display text-[22px] font-bold text-white">{title.title}</span>
      </p>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/80">{title.text}</p>
      <div className={cn('mt-5 grid gap-3', numbered ? 'md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4')}>
        {callouts.map((c, i) => (
          <Rise key={c.label} show={inView} delay={i * 90}>
            <CalloutCard c={c} index={i} numbered={numbered} className="h-full" />
          </Rise>
        ))}
      </div>
    </div>
  )
}

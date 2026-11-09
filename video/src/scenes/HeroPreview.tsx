import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { Navbar } from '@/components/layout/Navbar'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { ScaledCanvas } from '@/components/v2/finer-ui/ScaledCanvas'
import { EarthBackground } from './EarthBackground'

const ease = Easing.bezier(0.22, 1, 0.36, 1)
const enter = (f: number, from: number, dur = 24) => interpolate(f, [from, from + dur], [0, 1], { easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

/**
 * Pré-visualização animada da Hero (1440×900, como no ecrã de computador):
 * mesma composição, mesmos componentes e o mesmo fundo da Terra; a entrada
 * (texto → linha → plataforma) é recriada fotograma a fotograma.
 */
export function HeroPreview() {
  const f = useCurrentFrame()
  const text = (d: number) => ({ opacity: enter(f, d), transform: `translateY(${(1 - enter(f, d)) * 14}px)` })
  const line = interpolate(f, [24, 84], [1, 0], { easing: Easing.bezier(0.65, 0, 0.35, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const product = enter(f, 20, 30)

  return (
    <AbsoluteFill className="bg-[#03060F] font-sans text-white">
      {/* Fundo: o mesmo da Hero, enquadrado como no site */}
      <AbsoluteFill style={{ transform: 'translateY(16%) scale(1.12)' }}>
        <EarthBackground />
      </AbsoluteFill>
      <AbsoluteFill className="bg-[linear-gradient(to_right,rgba(3,6,15,0.94)_0%,rgba(3,6,15,0.78)_36%,rgba(3,6,15,0.35)_68%,rgba(3,6,15,0.45)_100%)]" />
      <AbsoluteFill className="bg-[linear-gradient(to_bottom,rgba(3,6,15,0.95)_0%,rgba(3,6,15,0.55)_28%,rgba(3,6,15,0.1)_60%,transparent_100%)]" />

      <Navbar />

      <div className="absolute inset-0 flex items-center pt-16">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] items-center gap-[72px] px-12">
          <div className="max-w-[580px]">
            <p className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.28em] text-[#7CB8FF]" style={text(0)}>
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-glow" />
              The Financial Operating System
            </p>
            <h1 className="mt-7 font-display text-[54px] font-bold leading-[1.06] tracking-[-0.035em]">
              <span className="block text-balance" style={text(4)}>A sua empresa já tem os números.</span>
              <span className="mt-1 block text-balance" style={text(10)}>
                Agora precisa de <span className="text-accent [text-shadow:0_0_40px_rgba(0,82,255,0.5)]">respostas</span>
                <span className="text-accent">.</span>
              </span>
            </h1>
            <p className="mt-7 max-w-[520px] text-[18px] leading-[1.65] text-white/80" style={text(16)}>
              Saiba quanto tem por receber, acompanhe a tesouraria e descubra o que merece a sua atenção. A Finer One transforma informação financeira em clareza para decidir.
            </p>
            <div className="mt-10 flex items-center gap-4" style={text(22)}>
              <span className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-[15px] font-semibold shadow-[0_8px_28px_-10px_rgba(0,82,255,0.9)]">Ser Finer Pioneer →</span>
              <span className="inline-flex h-12 items-center gap-2 px-6 text-[15px] font-medium text-white/90">▷ Ver a Finer One em ação</span>
            </div>
          </div>

          <div className="relative pb-12 pr-10" style={{ opacity: product, transform: `translateX(${(1 - product) * 28}px)` }}>
            <div className="absolute bottom-0 left-16 right-0 top-10 rounded-[24px] border border-white/[0.12] bg-[linear-gradient(140deg,rgba(11,26,74,0.55),rgba(3,6,15,0.35))]" />
            <div className="relative rounded-[16px] bg-gradient-to-b from-white/30 via-white/[0.08] to-white/[0.03] p-px shadow-[0_50px_110px_-40px_rgba(0,0,0,0.95)]">
              <div className="relative aspect-video overflow-hidden rounded-[15px] bg-[#F7F9FE]">
                <ScaledCanvas width={1600}>
                  <div className="h-[900px] overflow-hidden">
                    <AppShell view="home" className="min-h-[900px]">
                      <FinerHomeView interactive={false} />
                    </AppShell>
                  </div>
                </ScaledCanvas>
                <span className="absolute bottom-3 left-3 rounded-full bg-[#0B1030]/75 px-2.5 py-1 text-[10.5px] font-semibold text-white">Dados fictícios</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linha luminosa: desenha-se uma vez na parte inferior e aproxima-se da plataforma */}
      <svg viewBox="0 0 1440 900" className="absolute inset-0" fill="none">
        <defs>
          <linearGradient id="hp-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0052FF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#1E90FF" stopOpacity="0.9" />
            <stop offset="0.85" stopColor="#9FD3FF" />
            <stop offset="1" stopColor="#1E90FF" stopOpacity="0" />
          </linearGradient>
          <filter id="hp-blur"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <path d="M -40 820 C 300 820, 520 790, 700 740 S 980 640, 1180 610" pathLength={1} stroke="url(#hp-line)" strokeWidth="10" opacity="0.4" filter="url(#hp-blur)" style={{ strokeDasharray: 1, strokeDashoffset: line }} />
        <path d="M -40 820 C 300 820, 520 790, 700 740 S 980 640, 1180 610" pathLength={1} stroke="url(#hp-line)" strokeWidth="2" style={{ strokeDasharray: 1, strokeDashoffset: line }} />
      </svg>
    </AbsoluteFill>
  )
}

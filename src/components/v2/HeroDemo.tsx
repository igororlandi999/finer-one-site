import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, Pause, Play } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import { LuminousLine } from '@/components/v2/LuminousLine'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { ScaledCanvas } from '@/components/v2/finer-ui/ScaledCanvas'
import { DEMO_VIDEO, DEMO_VIDEO_SAMPLES, HERO_BACKGROUND, TRY_DEMO_ANCHOR } from '@/config/demo'
import type { DemoVideoSource } from '@/config/demo'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'

const copy: Record<Lang, {
  eyebrow: string; first: string; secondPrefix: string; highlight: string; sub: string
  primary: string; secondary: string
  badge: string; play: string; pause: string; videoLabel: string; posterLabel: string
}> = {
  pt: {
    eyebrow: 'The Financial Operating System',
    first: 'A sua empresa já tem os números.',
    secondPrefix: 'Agora precisa de ',
    highlight: 'respostas',
    sub: 'Faça perguntas sobre o seu negócio, acompanhe a tesouraria e descubra o que merece a sua atenção.',
    primary: 'Experimentar demonstração',
    secondary: 'Ser Finer Pioneer',
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
    sub: 'Ask questions about your business, follow your cash and find out what deserves your attention.',
    primary: 'Try the demo',
    secondary: 'Become a Finer Pioneer',
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
  // Vídeo final (config) ou, só para aprovação, uma amostra pedida com ?video=amostra
  const sampleKey = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('video') : null
  const activeVideo = (sampleKey && DEMO_VIDEO_SAMPLES[sampleKey]) || (DEMO_VIDEO.src ? DEMO_VIDEO : null)

  return (
    <section
      aria-labelledby="hero-titulo"
      className="relative isolate overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-32 lg:flex lg:min-h-[max(600px,100svh)] lg:items-center lg:pb-14 lg:pt-24"
    >
      <Backdrop />

      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.14fr)] lg:gap-14 lg:px-12 xl:gap-[76px] xl:px-14">
        {/* Mensagem */}
        <div className="max-w-[580px]">
          <p className="inline-flex animate-fade-up items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7CB8FF] sm:tracking-[0.3em]">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-glow" aria-hidden="true" />
            {t.eyebrow}
          </p>
          <h1 id="hero-titulo" className="mt-7 font-display text-[36px] font-bold leading-[1.05] tracking-[-0.032em] text-white [font-feature-settings:'kern'] sm:text-[46px] lg:text-[41px] xl:text-[48px]">
            <span className="block text-balance animate-fade-up [animation-delay:90ms]">{t.first}</span>
            <span className="mt-1.5 block text-balance animate-fade-up [animation-delay:200ms]">
              {t.secondPrefix}
              <span className="relative whitespace-nowrap text-accent [text-shadow:0_0_32px_rgba(0,82,255,0.45)]">
                {t.highlight}
                <span className="text-accent">.</span>
              </span>
            </span>
          </h1>
          <p className="mt-10 max-w-[500px] animate-fade-up text-[16.5px] leading-[1.6] tracking-[-0.003em] text-white/[0.78] [animation-delay:300ms] sm:text-[18px]">
            {t.sub}
          </p>
          <div className="mt-11 flex animate-fade-up flex-col gap-3 [animation-delay:400ms] sm:flex-row sm:items-center sm:gap-3.5">
            <a
              href={TRY_DEMO_ANCHOR}
              className={buttonClasses({
                size: 'lg',
                className:
                  'group h-[52px] px-7 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_30px_-10px_rgba(0,82,255,0.95)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_16px_40px_-12px_rgba(30,144,255,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-[#03060F]',
              })}
            >
              {t.primary}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <a
              href="/pioneers/"
              className={buttonClasses({
                variant: 'outline',
                size: 'lg',
                className:
                  'group h-[52px] border-white/[0.14] bg-white/[0.04] px-6 text-white/90 backdrop-blur-sm transition-[border-color,background-color,color] duration-300 hover:border-white/30 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow',
              })}
            >
              {t.secondary}
              <ArrowRight className="h-4 w-4 text-white/60 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Vídeo da plataforma — apresentado como peça de produto */}
        <div className="relative opacity-0 [animation:fo-enter-right_1.1s_cubic-bezier(0.22,1,0.36,1)_420ms_forwards]">
          {/* Halo azul muito suave por trás da janela */}
          <div aria-hidden="true" className="absolute -inset-x-8 -inset-y-10 rounded-[48px] bg-[radial-gradient(closest-side,rgba(0,82,255,0.2),transparent)] blur-2xl" />
          {/* Luz refletida por baixo da janela (dá peso e profundidade) */}
          <div aria-hidden="true" className="absolute -bottom-10 left-[12%] right-[12%] h-16 rounded-[50%] bg-[radial-gradient(closest-side,rgba(30,144,255,0.32),transparent)] blur-xl" />
          <LuminousLine
            viewBox="0 0 1000 600"
            d="M -80 560 C 220 560, 380 500, 520 430 S 800 220, 1080 170"
            className="absolute -bottom-6 -left-24 h-[75%] w-[calc(100%+6rem)] max-w-none opacity-50"
            delay={900}
            spark={false}
          />
          <div className="relative">{activeVideo ? <DemoVideo t={t} video={activeVideo} /> : <Poster t={t} />}</div>
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
          className="absolute inset-0 h-full w-full translate-y-[3%] scale-[1.03] object-cover object-[50%_72%] animate-fade-in"
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
        <img src={HERO_BACKGROUND.poster} alt="" className="absolute inset-0 h-full w-full translate-y-[3%] scale-[1.03] object-cover object-[50%_72%]" />
      )}
      {/* Leitura: navy forte à esquerda (texto), aliviando para a direita */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(3,6,15,0.93)_0%,rgba(3,6,15,0.72)_34%,rgba(3,6,15,0.12)_66%,rgba(3,6,15,0.22)_100%)]" />
      {/* Topo limpo por baixo da navegação; centro sem competir com o título */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,6,15,0.9)_0%,rgba(3,6,15,0.35)_22%,transparent_45%)]" />
      {/* Transição para a secção seguinte */}
      {/* Acalma o brilho por trás dos botões (esquerda/baixo) e aprofunda o navy */}
      <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_18%_80%,rgba(3,6,15,0.6),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_30%,transparent_58%,rgba(2,4,10,0.6)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-navy-deep" />
    </div>
  )
}

/** Moldura de aplicação 16:9 — a mesma para o vídeo final e para o poster. */
function Frame({ children, controls, portrait }: { t: T; children: ReactNode; controls?: ReactNode; portrait?: boolean }) {
  return (
    // Moldura de vidro: aro translúcido, orla superior com a linha azul da marca,
    // sombra longa e um contorno interior fino para separar o ecrã do fundo.
    <div className="relative rounded-[18px] border border-white/[0.11] bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-[6px] shadow-[0_50px_110px_-40px_rgba(0,0,0,0.95),0_0_70px_-24px_rgba(30,144,255,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:p-[7px]">
      <span aria-hidden="true" className="pointer-events-none absolute -top-px left-[14%] right-[14%] h-px bg-[linear-gradient(90deg,transparent,rgba(90,180,255,0.9),transparent)]" />
      <div className="relative overflow-hidden rounded-[12px] bg-white ring-1 ring-black/10">
        <div className={portrait ? 'relative aspect-[4/5] bg-[#F7F9FE]' : 'relative aspect-video bg-[#F7F9FE]'}>{children}</div>
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

function DemoVideo({ t, video: source }: { t: T; video: DemoVideoSource }) {
  const reduced = usePrefersReducedMotion()
  const video = useRef<HTMLVideoElement>(null)
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.3, rootMargin: '0px' })
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  // Com movimento reduzido, o vídeo só corre se o visitante o pedir.
  const [userStarted, setUserStarted] = useState(false)
  const allowed = !reduced || userStarted
  // No telemóvel, a versão vertical (interface em formato de telemóvel), se existir.
  const small = !useMediaQuery('(min-width: 768px)')
  const portrait = small && !!source.portrait

  // Só reproduz quando visível, sem pausa do visitante e (com movimento reduzido) só por pedido.
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (inView && allowed && !userPaused) v.play().catch(() => setPlaying(false))
    else v.pause()
  }, [inView, allowed, userPaused])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) {
      setUserStarted(true)
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
        portrait={portrait}
        controls={
          <>
            {/* Movimento reduzido: imagem estática com um botão claro para ver a demonstração */}
            {reduced && !userStarted && (
              <button
                type="button"
                onClick={toggle}
                className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-[#070D2B]/85 px-5 py-3 text-[14px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(7,13,43,0.9)] backdrop-blur transition-colors hover:bg-[#070D2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {t.play}
              </button>
            )}
            {(!reduced || userStarted) && (
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? t.pause : t.play}
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1030]/75 text-white backdrop-blur transition-colors hover:bg-[#0B1030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
              >
                {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="ml-0.5 h-3.5 w-3.5" aria-hidden="true" />}
              </button>
            )}
          </>
        }
      >
        <video
          key={portrait ? 'vertical' : 'horizontal'}
          ref={video}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload={reduced && !userStarted ? 'none' : 'metadata'}
          poster={portrait ? source.portraitPoster : source.poster}
          aria-label={t.videoLabel}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          {portrait ? (
            <source src={source.portrait} type="video/mp4" />
          ) : (
            <>
              {source.mobile && <source src={source.mobile} type="video/mp4" media="(max-width: 767px)" />}
              {source.webm && <source src={source.webm} type="video/webm" />}
              <source src={source.src} type="video/mp4" />
            </>
          )}
        </video>
      </Frame>
    </div>
  )
}

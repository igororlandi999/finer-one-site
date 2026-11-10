import { useRef } from 'react'
import type { ReactNode } from 'react'
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import { FinerAdvisorView } from '@/components/v2/finer-ui/FinerAdvisorView'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { useAnchors } from '../lib/anchors'
import { cameraAt, cameraTransform, toStage, WIDE } from '../lib/camera'
import type { Shot } from '../lib/camera'
import { CANVAS_H, CANVAS_W, HEIGHT, NAVY, WIDTH } from '../lib/constants'
import { Comet, curve, Pulse } from '../parts/Comet'
import { Cursor } from '../parts/Cursor'
import { Highlight } from '../parts/Highlight'

const QUESTION = 'Como está a tesouraria da minha empresa?'
const ANSWER = 'A tesouraria está estável, mas € 18.640 em faturas em atraso merecem atenção.'
const WORDS = ANSWER.split(' ')
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const ease = Easing.bezier(0.45, 0, 0.2, 1)
const maskEase = Easing.bezier(0.55, 0, 0.25, 1)

/**
 * Mapa de tempos (30 fps, 300 fotogramas = 10 s).
 * Alterna movimento e pequenas pausas para o olhar acompanhar.
 */
const T = {
  comet1: [2, 26], // a linha entra e "acende" o campo de pergunta
  click: 30,
  type: 32, // início da escrita (ritmo humano)
  send: 82,
  answer: [86, 110],
  reveal: [104, 142], // resumo e indicadores entram em sequência
  comet2: [130, 152], // da resposta para a prioridade
  priority: 152,
  comet3: [158, 172], // da prioridade para o botão "Ver plano de ação"
  ctaClick: 176,
  open: [178, 204], // o clique abre o Finer Advisor a partir do botão
  shows: [200, 226],
  recs: [220, 240],
  comet4: [222, 244], // do diagnóstico para a recomendação
  climax: [244, 256],
  close: [282, 300], // regresso à Finer Home (loop)
}

/** Escrita humana: intervalos variáveis entre teclas, pausas em espaços. */
const KEY_FRAMES = (() => {
  const out: number[] = []
  let f = 0
  for (let i = 0; i < QUESTION.length; i++) {
    const ch = QUESTION[i]
    f += 0.75 + random(`k${i}`) * 0.9 + (ch === ' ' ? 0.6 : 0)
    out.push(f)
  }
  const scale = (T.send - 6 - T.type) / f // ajusta para terminar antes do envio
  return out.map((v) => v * scale)
})()

export function HeroSampleV3() {
  const frame = useCurrentFrame()
  const homeRoot = useRef<HTMLDivElement>(null)
  const advRoot = useRef<HTMLDivElement>(null)
  const loopRoot = useRef<HTMLDivElement>(null)
  const h = useAnchors(homeRoot)
  const a = useAnchors(advRoot)

  const ask = h['ask-input']
  const send = h['ask-send']
  const pri = h['priority']
  const ans = h['answer']
  const cta = h['priority-cta']

  // ---------- Guião da Finer Home ----------
  const typedQ = KEY_FRAMES.filter((k) => frame - T.type >= k).length
  const words = Math.round(interpolate(frame, T.answer, [0, WORDS.length], clamp))
  const typedA = words === 0 ? 0 : WORDS.slice(0, words).join(' ').length
  const reveal = interpolate(frame, T.reveal, [0, 3.1], clamp)

  // ---------- Câmaras ----------
  const askF = { x: ask ? ask.cx : WIDE.x, y: ask ? ask.cy + 85 : WIDE.y }
  const midF = { x: ask ? ask.cx - 60 : WIDE.x, y: ask ? ask.cy + 230 : WIDE.y }
  const priF = { x: pri && cta ? (pri.x + cta.x + cta.w) / 2 : WIDE.x, y: pri ? pri.cy - 10 : WIDE.y }
  const opening: Shot = { f: 0, s: 1.36, ...askF, x: askF.x - 82 }
  const homeShots: Shot[] = [
    opening,
    { f: T.send, s: 1.62, ...askF, x: askF.x - 30 }, // aproximação lenta durante a escrita
    { f: T.answer[1], s: 1.5, x: askF.x - 40, y: askF.y + 50 },
    { f: T.reveal[1], s: 1.38, ...midF }, // abre para ver a informação a ganhar significado
    { f: T.priority + 4, s: 1.72, ...priF }, // aproxima a situação importante e a ação
    { f: T.ctaClick, s: 1.76, ...priF },
    { f: T.open[1], s: 1.86, ...priF },
  ]
  const homeCam = cameraAt(frame, homeShots)

  const shows = a['adv-shows']
  const rec0 = a['adv-rec-0']
  const showsF = { x: shows ? shows.cx + 50 : WIDE.x, y: shows ? shows.cy + 30 : WIDE.y }
  const recF = { x: rec0 ? rec0.cx + 40 : WIDE.x, y: rec0 ? rec0.cy - 70 : WIDE.y }
  const advShots: Shot[] = [
    { f: T.open[0], s: 2.3, ...showsF },
    { f: T.shows[1], s: 2.26, ...showsF },
    { f: T.climax[0], s: 2.28, ...recF },
    { f: T.close[0], s: 2.34, ...recF }, // pequena aproximação contínua no clímax
    { f: T.close[1], s: 2.38, ...recF },
  ]
  const advCam = cameraAt(frame, advShots)

  // ---------- Profundidade na passagem Home → Advisor ----------
  const depth = interpolate(frame, T.open, [0, 1], { ...clamp, easing: maskEase })
  const maxR = Math.hypot(WIDTH, HEIGHT)
  const ctaCam = cameraAt(T.ctaClick, homeShots)
  const openPoint = cta ? toStage(ctaCam, cta.cx, cta.cy) : { x: WIDTH * 0.84, y: HEIGHT * 0.44 }
  const radius = interpolate(frame, T.open, [0, maxR], { ...clamp, easing: maskEase })

  // ---------- Loop: a Finer Home regressa a partir da recomendação ----------
  const recStage = rec0 ? toStage(advCam, rec0.x + 30, rec0.cy) : { x: 600, y: 600 }
  const closeR = interpolate(frame, T.close, [0, maxR], { ...clamp, easing: maskEase })

  // ---------- Fios de luz (coordenadas do ecrã) ----------
  const inputStage = ask ? toStage(homeCam, ask.x + 20, ask.cy) : { x: 700, y: 400 }
  const ansStage = ans ? toStage(homeCam, ans.x + ans.w * 0.42, ans.y + ans.h * 0.72) : { x: 900, y: 500 }
  const priStage = pri ? toStage(homeCam, pri.x + 24, pri.y + pri.h + 6) : { x: 700, y: 700 }
  const priEnd = pri ? toStage(homeCam, pri.x + pri.w + 6, pri.cy + 2) : { x: 1300, y: 600 }
  const ctaStage = cta ? toStage(homeCam, cta.x - 2, cta.cy) : { x: 1400, y: 600 }
  const showsStage = shows ? toStage(advCam, shows.x + 10, shows.y + 18) : { x: 500, y: 300 }
  const comet4End = rec0 ? toStage(advCam, rec0.x - 4, rec0.cy) : { x: 500, y: 700 }

  const advDemo = {
    shows: interpolate(frame, T.shows, [0, 4], clamp),
    recs: interpolate(frame, T.recs, [0, 4], clamp),
    focus: interpolate(frame, T.climax, [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }),
  }

  const cursorPath = [
    { f: 10, x: ask ? ask.x + ask.w * 0.7 : 1000, y: ask ? ask.cy + 150 : 450 },
    { f: 28, x: ask ? ask.x + 70 : 600, y: ask ? ask.cy + 4 : 300 },
    { f: T.click, x: ask ? ask.x + 70 : 600, y: ask ? ask.cy + 4 : 300, click: true },
    { f: 46, x: ask ? ask.x + 120 : 640, y: ask ? ask.cy + 62 : 360 },
    { f: T.send - 4, x: send ? send.cx - 4 : 900, y: send ? send.cy + 4 : 300 },
    { f: T.send, x: send ? send.cx - 4 : 900, y: send ? send.cy + 4 : 300, click: true },
    { f: 112, x: send ? send.cx + 50 : 950, y: send ? send.cy + 110 : 420 },
  ]

  const layer = (cam: { s: number; x: number; y: number }, children: ReactNode) => (
    <div style={{ position: 'absolute', left: 0, top: 0, width: CANVAS_W, height: CANVAS_H, transformOrigin: '0 0', transform: cameraTransform(cam) }}>{children}</div>
  )
  const canvas = (ref: React.RefObject<HTMLDivElement | null>, children: ReactNode) => (
    <div ref={ref} style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, overflow: 'hidden' }}>
      {children}
    </div>
  )

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      {/* 1. Finer Home — visível desde o primeiro fotograma */}
      <AbsoluteFill style={{ transform: `scale(${1 - depth * 0.035})`, transformOrigin: `${openPoint.x}px ${openPoint.y}px` }}>
        {layer(
          homeCam,
          canvas(
            homeRoot,
            <>
              <AppShell view="home" className="min-h-[900px]">
                <FinerHomeView interactive={false} script={{ question: QUESTION, typedQ, answer: ANSWER, typedA, reveal }} />
              </AppShell>
              <Highlight frame={frame} rect={pri} from={T.priority} to={T.open[1] + 10} pad={10} radius={12} />
              {send && <Pulse frame={frame} at={T.send} x={send.cx} y={send.cy} size={70} />}
              <Cursor frame={frame} path={cursorPath} visible={[10, 116]} />
              {cta && <Pulse frame={frame} at={T.ctaClick} x={cta.cx} y={cta.cy} size={90} />}
              {cta && (
                <Cursor
                  frame={frame}
                  path={[
                    { f: 148, x: cta.cx + 90, y: cta.cy + 120 },
                    { f: 171, x: cta.cx - 8, y: cta.cy + 4 },
                    { f: T.ctaClick, x: cta.cx - 8, y: cta.cy + 4, click: true },
                  ]}
                  visible={[148, 196]}
                />
              )}
            </>,
          ),
        )}
        <AbsoluteFill style={{ backgroundColor: NAVY, opacity: depth * 0.16 }} />
      </AbsoluteFill>

      {/* 2. Finer Advisor — aberto pela máscara circular no fim da linha */}
      <AbsoluteFill style={{ clipPath: `circle(${radius}px at ${openPoint.x}px ${openPoint.y}px)` }}>
        <AbsoluteFill style={{ backgroundColor: '#F7F9FE' }} />
        <AbsoluteFill style={{ transform: `scale(${1.04 - depth * 0.04})`, transformOrigin: `${openPoint.x}px ${openPoint.y}px` }}>
          {layer(
            advCam,
            canvas(
              advRoot,
              <>
                <AppShell view="advisor" className="min-h-[900px]">
                  <FinerAdvisorView demo={advDemo} />
                </AppShell>
                <Highlight frame={frame} rect={rec0} from={T.climax[0] - 2} to={T.close[1] + 30} pad={5} radius={12} />
              </>,
            ),
          )}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* 3. Regresso à Finer Home no estado inicial — fecha o loop sem corte */}
      {frame >= T.close[0] && (
        <AbsoluteFill style={{ clipPath: `circle(${closeR}px at ${recStage.x}px ${recStage.y}px)` }}>
          {layer(
            opening,
            canvas(
              loopRoot,
              <AppShell view="home" className="min-h-[900px]">
                <FinerHomeView interactive={false} script={{ question: QUESTION, typedQ: 0, answer: ANSWER, typedA: 0, reveal: 0 }} />
              </AppShell>,
            ),
          )}
        </AbsoluteFill>
      )}

      {/* Orlas luminosas das máscaras */}
      <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 65 }}>
        {radius > 0 && radius < maxR - 1 && (
          <circle cx={openPoint.x} cy={openPoint.y} r={radius} fill="none" stroke="#1E90FF" strokeWidth={2.5} opacity={0.85 * (1 - radius / maxR)} style={{ filter: 'drop-shadow(0 0 12px rgba(30,144,255,0.9))' }} />
        )}
        {closeR > 0 && closeR < maxR - 1 && (
          <circle cx={recStage.x} cy={recStage.y} r={closeR} fill="none" stroke="#1E90FF" strokeWidth={2.5} opacity={0.85 * (1 - closeR / maxR)} style={{ filter: 'drop-shadow(0 0 12px rgba(30,144,255,0.9))' }} />
        )}
      </svg>

      {/* Fio narrativo: entrada → resposta → prioridade → Advisor → recomendação */}
      <Comet id="c1" frame={frame} from={T.comet1[0]} to={T.comet1[1]} d={curve({ x: -60, y: inputStage.y + 220 }, inputStage, 0.55)} fadeOut={10} />
      <Comet id="c2" frame={frame} from={T.comet2[0]} to={T.comet2[1]} d={curve(ansStage, priStage, 0.5)} />
      <Comet id="c3" frame={frame} from={T.comet3[0]} to={T.comet3[1]} d={curve(priEnd, ctaStage, 0.5)} fadeOut={12} />
      <Comet
        id="c4"
        frame={frame}
        from={T.comet4[0]}
        to={T.comet4[1]}
        d={`M ${showsStage.x} ${showsStage.y} C ${showsStage.x - 70} ${showsStage.y + 120}, ${comet4End.x - 70} ${comet4End.y - 80}, ${comet4End.x} ${comet4End.y}`}
        fadeOut={20}
      />

      {/* Vinheta cinematográfica muito discreta */}
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(120% 120% at 50% 45%, transparent 70%, rgba(4,8,23,0.18) 100%)' }} />
    </AbsoluteFill>
  )
}

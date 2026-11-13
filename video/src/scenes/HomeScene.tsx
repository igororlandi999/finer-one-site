import { useRef } from 'react'
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { useAnchors } from '../lib/anchors'
import { cameraAt, cameraTransform, WIDE } from '../lib/camera'
import type { Shot } from '../lib/camera'
import { CANVAS_H, CANVAS_W, HEIGHT, NAVY } from '../lib/constants'
import { Beam, beamX } from '../parts/Beam'
import { Cursor } from '../parts/Cursor'
import { Glow, Highlight } from '../parts/Highlight'

const QUESTION = 'Como está a situação financeira da minha empresa?'
const ANSWER =
  'A empresa está a crescer, com um ponto de atenção: as receitas subiram 8,1% e o resultado mantém-se positivo, mas há € 18.640 em faturas em atraso a pressionar a tesouraria.'

/** Inclinação do feixe (skewX -14°) em píxeis, entre o topo e o fundo do ecrã. */
const SKEW = Math.tan((14 * Math.PI) / 180) * (HEIGHT / 2 + 100)

/**
 * Cenas 1 e 2 do storyboard: abertura com a linha azul a revelar a Finer Home,
 * pergunta escrita no "Ask Finer", resposta da Finer One e aproximação aos
 * indicadores principais; termina em plano geral. 300 fotogramas (10 s a 30 fps).
 */
export function HomeScene() {
  const frame = useCurrentFrame()
  const root = useRef<HTMLDivElement>(null)
  const a = useAnchors(root)

  const ask = a['ask-input']
  const send = a['ask-send']
  const kpis = a['kpis']

  // Guião da pergunta e da resposta
  const typedQ = Math.round(interpolate(frame, [100, 150], [0, QUESTION.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const typedA = Math.round(interpolate(frame, [172, 218], [0, ANSWER.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))

  // Câmara
  const shots: Shot[] = [
    { f: 0, s: 1.07, x: WIDE.x, y: WIDE.y },
    { f: 60, ...WIDE },
    { f: 100, s: 1.18, x: ask ? ask.cx : WIDE.x, y: ask ? ask.cy + 40 : WIDE.y },
    { f: 168, s: 1.18, x: ask ? ask.cx : WIDE.x, y: ask ? ask.cy + 40 : WIDE.y },
    { f: 200, s: 1.14, x: ask ? ask.cx : WIDE.x, y: ask ? ask.cy + 90 : WIDE.y },
    { f: 236, s: 1.36, x: kpis ? kpis.cx : WIDE.x, y: kpis ? kpis.cy : WIDE.y },
    { f: 266, s: 1.4, x: kpis ? kpis.cx : WIDE.x, y: kpis ? kpis.cy : WIDE.y },
    // A câmara recua para o plano geral antes da passagem ao Cashflow
    { f: 300, ...WIDE },
  ]
  const cam = cameraAt(frame, shots)

  // Revelação pela linha azul
  const bx = beamX(frame, 4, 46)
  const logo = interpolate(frame, [0, 10, 24, 34], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const cursorPath = [
    { f: 58, x: 1180, y: 760 },
    { f: 94, x: ask ? ask.x + 150 : 600, y: ask ? ask.cy : 300 },
    { f: 98, x: ask ? ask.x + 150 : 600, y: ask ? ask.cy : 300, click: true },
    { f: 112, x: ask ? ask.x + 210 : 660, y: ask ? ask.cy + 70 : 370 },
    { f: 150, x: ask ? ask.x + 230 : 680, y: ask ? ask.cy + 76 : 376 },
    { f: 164, x: send ? send.cx : 900, y: send ? send.cy : 300 },
    { f: 166, x: send ? send.cx : 900, y: send ? send.cy : 300, click: true },
    { f: 230, x: send ? send.cx + 60 : 960, y: send ? send.cy + 140 : 440 },
  ]

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      {/* Antes da revelação: navy profundo com a assinatura discreta */}
      <AbsoluteFill style={{ background: 'radial-gradient(60% 60% at 50% 45%, rgba(0,82,255,0.16), transparent 70%)' }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: logo }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, transform: `translateY(${(1 - logo) * 6}px)` }}>
          <Img src={staticFile('finer-one-icon.svg')} style={{ height: 46 }} />
          <span style={{ fontFamily: 'Montserrat', color: 'white', fontSize: 26, letterSpacing: '0.42em', fontWeight: 700 }}>
            FINER <span style={{ fontWeight: 400, opacity: 0.7 }}>ONE</span>
          </span>
        </div>
      </AbsoluteFill>

      {/* Interface, revelada pela linha */}
      <AbsoluteFill style={{ clipPath: `polygon(0 0, ${bx + SKEW}px 0, ${bx - SKEW}px 100%, 0 100%)` }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: CANVAS_W, height: CANVAS_H, transformOrigin: '0 0', transform: cameraTransform(cam) }}>
          <div ref={root} style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, overflow: 'hidden' }}>
            <AppShell view="home" className="min-h-[900px]">
              <FinerHomeView interactive={false} script={{ question: QUESTION, typedQ, answer: ANSWER, typedA }} />
            </AppShell>
            <Highlight frame={frame} rect={kpis} from={226} to={284} pad={10} radius={22} />
            <Glow frame={frame} rect={a['kpi-0']} from={234} to={252} />
            <Glow frame={frame} rect={a['kpi-1']} from={246} to={264} />
            <Glow frame={frame} rect={a['kpi-2']} from={258} to={276} />
            <Glow frame={frame} rect={a['kpi-3']} from={270} to={290} />
            <Cursor frame={frame} path={cursorPath} visible={[58, 232]} />
          </div>
        </div>
      </AbsoluteFill>

      <Beam x={bx} />
    </AbsoluteFill>
  )
}

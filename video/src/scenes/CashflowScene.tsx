import { useRef } from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { CashflowView } from '@/components/v2/finer-ui/screens'
import { useAnchors } from '../lib/anchors'
import { cameraAt, cameraTransform, WIDE } from '../lib/camera'
import type { Shot } from '../lib/camera'
import { CANVAS_H, CANVAS_W, HEIGHT } from '../lib/constants'
import { Beam, beamX } from '../parts/Beam'
import { Cursor } from '../parts/Cursor'
import { Glow, Highlight } from '../parts/Highlight'

const SKEW = Math.tan((14 * Math.PI) / 180) * (HEIGHT / 2 + 100)
const QUESTION = 'Como está a situação financeira da minha empresa?'
const ANSWER =
  'A empresa está a crescer, com um ponto de atenção: as receitas subiram 8,1% e o resultado mantém-se positivo, mas há € 18.640 em faturas em atraso a pressionar a tesouraria.'

/**
 * Cena 3 (Acompanhar): a linha azul passa da Finer Home ao Cashflow; as barras
 * crescem mês a mês, a câmara aproxima-se do gráfico, o cursor revela o
 * detalhe de setembro e o foco termina no cashflow líquido. 210 fotogramas.
 */
export function CashflowScene() {
  const frame = useCurrentFrame()
  const root = useRef<HTMLDivElement>(null)
  const a = useAnchors(root)

  const chart = a['cf-chart']
  const bar = a['cf-bar-3']
  const activity = a['cf-activity']
  const net = a['cf-net']

  const bx = beamX(frame, 0, 36)
  const progress = interpolate(frame, [26, 86], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const tooltip = interpolate(frame, [104, 116], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const shots: Shot[] = [
    { f: 0, ...WIDE },
    { f: 44, ...WIDE },
    { f: 84, s: 1.3, x: chart ? chart.cx : WIDE.x, y: chart ? chart.cy : WIDE.y },
    { f: 134, s: 1.3, x: chart ? chart.cx : WIDE.x, y: chart ? chart.cy : WIDE.y },
    { f: 168, s: 1.45, x: activity ? activity.cx : WIDE.x, y: net ? net.cy - 80 : WIDE.y },
    { f: 210, s: 1.48, x: activity ? activity.cx : WIDE.x, y: net ? net.cy - 80 : WIDE.y },
  ]
  const cam = cameraAt(frame, shots)

  const cursorPath = [
    { f: 60, x: chart ? chart.x + chart.w * 0.25 : 500, y: chart ? chart.y + chart.h - 40 : 700 },
    { f: 100, x: bar ? bar.cx : 800, y: bar ? bar.y + bar.h * 0.45 : 500 },
    { f: 132, x: bar ? bar.cx + 10 : 810, y: bar ? bar.y + bar.h * 0.45 : 500 },
    { f: 162, x: net ? net.x + net.w * 0.7 : 1300, y: net ? net.cy : 700 },
  ]

  const scene = (children: React.ReactNode) => (
    <div style={{ position: 'absolute', left: 0, top: 0, width: CANVAS_W, height: CANVAS_H, transformOrigin: '0 0', transform: cameraTransform(cam) }}>
      {children}
    </div>
  )

  return (
    <AbsoluteFill style={{ backgroundColor: '#F7F9FE' }}>
      {/* Por baixo: a Finer Home, tal como terminou a cena anterior */}
      <AbsoluteFill>
        {scene(
          <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, overflow: 'hidden' }}>
            <AppShell view="home" className="min-h-[900px]">
              <FinerHomeView interactive={false} script={{ question: QUESTION, typedQ: QUESTION.length, answer: ANSWER, typedA: ANSWER.length }} />
            </AppShell>
          </div>,
        )}
      </AbsoluteFill>

      {/* Por cima: o Cashflow, revelado pela linha azul */}
      <AbsoluteFill style={{ clipPath: `polygon(0 0, ${bx + SKEW}px 0, ${bx - SKEW}px 100%, 0 100%)` }}>
        {scene(
          <div ref={root} style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, overflow: 'hidden' }}>
            <AppShell view="cashflow" className="min-h-[900px]">
              <CashflowView progress={progress} tooltip={tooltip} />
            </AppShell>
            <Glow frame={frame} rect={bar} from={100} to={140} pad={6} radius={8} />
            <Highlight frame={frame} rect={net} from={158} to={230} pad={6} radius={16} />
            <Cursor frame={frame} path={cursorPath} visible={[60, 200]} />
          </div>,
        )}
      </AbsoluteFill>

      <Beam x={bx} />
    </AbsoluteFill>
  )
}

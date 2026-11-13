import { Easing, interpolate } from 'remotion'
import { CANVAS_H, CANVAS_W, HEIGHT, K, WIDTH } from './constants'

/** Plano de câmara: no fotograma `f`, zoom `s` centrado no ponto (x, y) da interface. */
export type Shot = { f: number; s: number; x: number; y: number }

const ease = Easing.bezier(0.45, 0, 0.2, 1)

export const WIDE: Omit<Shot, 'f'> = { s: 1, x: CANVAS_W / 2, y: CANVAS_H / 2 }

/** Interpola entre planos com aceleração suave (sem movimentos lineares). */
export function cameraAt(frame: number, shots: Shot[]) {
  if (frame <= shots[0].f) return shots[0]
  for (let i = 0; i < shots.length - 1; i++) {
    const a = shots[i]
    const b = shots[i + 1]
    if (frame >= a.f && frame <= b.f) {
      const t = interpolate(frame, [a.f, b.f], [0, 1], { easing: ease })
      return { f: frame, s: a.s + (b.s - a.s) * t, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    }
  }
  return shots[shots.length - 1]
}

/** Transformação do palco: o ponto focado fica no centro do ecrã. Limita para nunca mostrar fora da interface. */
export function cameraTransform({ s, x, y }: { s: number; x: number; y: number }) {
  const scale = K * s
  let tx = WIDTH / 2 - x * scale
  let ty = HEIGHT / 2 - y * scale
  tx = Math.min(0, Math.max(WIDTH - CANVAS_W * scale, tx))
  ty = Math.min(0, Math.max(HEIGHT - CANVAS_H * scale, ty))
  return `translate(${tx}px, ${ty}px) scale(${scale})`
}

/** Escala e deslocação do palco (as mesmas de cameraTransform), para converter pontos. */
export function cameraParams({ s, x, y }: { s: number; x: number; y: number }) {
  const scale = K * s
  const tx = Math.min(0, Math.max(WIDTH - CANVAS_W * scale, WIDTH / 2 - x * scale))
  const ty = Math.min(0, Math.max(HEIGHT - CANVAS_H * scale, HEIGHT / 2 - y * scale))
  return { scale, tx, ty }
}

/** Converte um ponto da interface para coordenadas do ecrã (1920×1080). */
export function toStage(cam: { s: number; x: number; y: number }, px: number, py: number) {
  const { scale, tx, ty } = cameraParams(cam)
  return { x: tx + px * scale, y: ty + py * scale }
}

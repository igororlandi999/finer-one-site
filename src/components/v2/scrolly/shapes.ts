/**
 * PROTÓTIPO /historia/ — formas das transições entre secções.
 * Cada função devolve um caminho SVG (px do ecrã) para clip-path: path(...).
 * Tudo vetorial: nítido em qualquer ecrã.
 */
export type Kind = 'window' | 'circle' | 'tiles' | 'streaks' | 'blinds' | 'ridge' | 'doors'
export type Rect = { x: number; y: number; w: number; h: number }

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2)
export const easeOut = (v: number) => 1 - Math.pow(1 - v, 3)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const f = (n: number) => n.toFixed(1)

/** Pseudo-aleatório determinístico (as formas não "tremem" entre frames). */
function rand(i: number) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

function rect(x: number, y: number, w: number, h: number) {
  if (w <= 0 || h <= 0) return ''
  return `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`
}

function roundRect(x: number, y: number, w: number, h: number, r: number) {
  r = Math.max(0, Math.min(r, w / 2, h / 2))
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`
}

function circle(cx: number, cy: number, r: number) {
  if (r <= 0) return ''
  return `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`
}

/** Pontos do cume (0..1 em x, 0 = topo do cume, 1 = base) — o pico à direita, como na imagem de identidade. */
export const RIDGE: [number, number][] = [
  [0, 0.78], [0.08, 0.62], [0.14, 0.7], [0.22, 0.5], [0.3, 0.58], [0.38, 0.4], [0.45, 0.47],
  [0.52, 0.3], [0.58, 0.36], [0.66, 0.12], [0.7, 0], [0.75, 0.1], [0.82, 0.2], [0.88, 0.16], [0.94, 0.34], [1, 0.42],
]
export const PEAK = RIDGE[10]

export type ShapeCtx = { w: number; h: number; origin?: Rect }

export function shape(kind: Kind, u: number, { w, h, origin }: ShapeCtx): string {
  if (u <= 0) return 'M0 0Z'
  switch (kind) {
    case 'window': {
      const o = origin ?? { x: w * 0.3, y: h * 0.3, w: w * 0.4, h: h * 0.4 }
      const e = easeInOut(u)
      return roundRect(lerp(o.x, 0, e), lerp(o.y, 0, e), lerp(o.w, w, e), lerp(o.h, h, e), lerp(18, 0, e))
    }
    case 'circle': {
      const o = origin ?? { x: w / 2, y: h / 2, w: 0, h: 0 }
      const cx = o.x + o.w / 2
      const cy = o.y + o.h / 2
      const far = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy)) + 2
      const r0 = Math.max(o.w, o.h) / 2
      return circle(cx, cy, r0 + (far - r0) * Math.pow(u, 2.2))
    }
    case 'tiles': {
      // As peças juntam-se: quadrados que nascem do centro para fora ("falta reuni-la").
      const cell = w > 900 ? 96 : 64
      const cols = Math.ceil(w / cell)
      const rows = Math.ceil(h / cell)
      const ox = (w - cols * cell) / 2
      const oy = (h - rows * cell) / 2
      const maxD = Math.hypot(cols / 2, rows / 2)
      let d = ''
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const dist = Math.hypot(c + 0.5 - cols / 2, r + 0.5 - rows / 2) / maxD
          const delay = dist * 0.55 + rand(r * 97 + c) * 0.15
          const p = easeOut(clamp01((u - delay) / 0.3))
          if (p <= 0) continue
          const s = cell * p + (p >= 1 ? 1 : 0)
          d += rect(ox + c * cell + (cell - s) / 2, oy + r * cell + (cell - s) / 2, s, s)
        }
      return d || 'M0 0Z'
    }
    case 'streaks': {
      // Rastos de luz (como a estrada da identidade): faixas que correm da esquerda.
      let d = ''
      let y = 0
      let i = 0
      while (y < h) {
        const bh = Math.max(10, h * (0.03 + rand(i + 3) * 0.09))
        const delay = rand(i + 41) * 0.45
        const p = easeInOut(clamp01((u - delay) / 0.55))
        d += rect(0, y, w * p + (p >= 1 ? 1 : 0), bh + 1)
        y += bh
        i++
      }
      return d || 'M0 0Z'
    }
    case 'blinds': {
      // Persianas a fechar: "fica tudo protegido".
      const n = 9
      const sh = h / n
      let d = ''
      for (let i = 0; i < n; i++) {
        const p = easeInOut(clamp01((u - i * 0.045) / 0.64))
        d += rect(0, i * sh, w, sh * p + (p >= 1 ? 1 : 0))
      }
      return d || 'M0 0Z'
    }
    case 'ridge': {
      // Uma montanha que sobe: a zona revelada fica por baixo do cume.
      const amp = h * 0.42
      const base = (h + amp + 4) * (1 - easeInOut(u))
      let d = `M0 ${f(h + 2)}`
      for (const [x, y] of RIDGE) d += `L${f(x * w)} ${f(base - amp + y * amp)}`
      d += `L${f(w)} ${f(h + 2)}Z`
      return d
    }
    case 'doors': {
      const e = easeInOut(u)
      const half = (w / 2) * e
      return rect(w / 2 - half, 0, half * 2 + (e >= 1 ? 1 : 0), h)
    }
  }
}

/** Posição do cume (pico) da montanha num dado momento — para o ponto de luz que sobe. */
export function peakAt(u: number, w: number, h: number) {
  const amp = h * 0.42
  const base = (h + amp + 4) * (1 - easeInOut(u))
  return { x: PEAK[0] * w, y: base - amp + PEAK[1] * amp }
}

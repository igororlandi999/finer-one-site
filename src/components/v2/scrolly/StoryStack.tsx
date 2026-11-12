import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { clamp01, easeInOut, peakAt, shape } from './shapes'
import type { Kind, Rect } from './shapes'

/**
 * PROTÓTIPO /historia/ — pilha de secções com uma transição própria entre cada par.
 *
 * Como funciona: cada secção fica presa pelo fundo quando acaba (sticky), e a
 * seguinte entra por cima dela, parada no ecrã durante um ecrã de scroll,
 * revelada por uma forma (clip-path: path) — com uma "cortina" de cor da marca
 * à frente. Não acrescenta comprimento à página: a transição acontece no
 * mesmo scroll em que a secção seguinte normalmente entraria.
 * As secções são as mesmas da homepage aprovada; nenhuma é alterada.
 */
export type Layer = {
  key: string
  node: ReactNode
  /** Fundo da camada (as zonas por revelar ficam transparentes). */
  bg: string
  /** Transição de entrada desta camada (a partir da segunda). */
  kind?: Kind
  /** Cor da "cortina" que vai à frente da secção (opcional). */
  lead?: string
  /** Ponto de partida da forma, lido na secção anterior (ex.: a janela do produto). */
  origin?: (prev: HTMLElement) => Rect | undefined
  /** A secção anterior aproxima-se (zoom) em vez de recuar. */
  zoomPrev?: boolean
}

export function StoryStack({ layers }: { layers: Layer[] }) {
  const n = layers.length
  const wraps = useRef<(HTMLDivElement | null)[]>([])
  const sticks = useRef<(HTMLDivElement | null)[]>([])
  const contents = useRef<(HTMLDivElement | null)[]>([])
  const leads = useRef<(HTMLDivElement | null)[]>([])
  const dims = useRef<(HTMLDivElement | null)[]>([])
  const nodes = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const origins: (Rect | undefined | null)[] = Array(n).fill(null)
    let raf = 0

    const pinTops = () => {
      const vh = window.innerHeight
      sticks.current.forEach((el) => {
        if (el) el.style.top = `${Math.min(0, vh - el.offsetHeight)}px`
      })
    }

    const frame = () => {
      raf = 0
      const vh = window.innerHeight
      const vw = document.documentElement.clientWidth
      const ts: number[] = [1]
      for (let i = 1; i < n; i++) {
        const w = wraps.current[i]
        ts[i] = w ? clamp01(1 - w.getBoundingClientRect().top / vh) : 0
      }
      let cur = 0
      for (let i = 1; i < n; i++) if (ts[i] > 0) cur = i

      for (let i = 0; i < n; i++) {
        const el = sticks.current[i]
        if (!el) continue
        // Só a secção atual e a anterior precisam de ser pintadas.
        const visible = i >= cur - 1 && !(i === cur - 1 && ts[cur] >= 1)
        el.style.visibility = visible ? '' : 'hidden'
      }

      // Transformações acumuladas por camada (fixar no ecrã + recuar), escritas uma só vez.
      const tf: string[] = Array(n).fill('')
      const origin: string[] = Array(n).fill('')
      for (let i = 1; i < n; i++) {
        const L = layers[i]
        const B = sticks.current[i]
        const C = contents.current[i]
        const A = sticks.current[i - 1]
        const lead = leads.current[i]
        const dot = nodes.current[i]
        const dim = dims.current[i - 1]
        if (!B || !C || !A || !L.kind) continue
        const t = ts[i]
        const top = wraps.current[i]!.getBoundingClientRect().top
        if (t <= 0 || t >= 1) {
          C.style.clipPath = ''
          if (lead) lead.style.display = 'none'
          if (dot) dot.style.display = 'none'
          if (t <= 0) origins[i] = null
          if (dim) dim.style.opacity = '0'
          continue
        }
        // A secção que entra fica parada no ecrã durante a revelação.
        tf[i] = `translateY(${(-top).toFixed(1)}px) ` + tf[i]
        if (origins[i] === null) origins[i] = L.origin ? L.origin(A) : undefined
        const ctx = { w: vw, h: vh, origin: origins[i] ?? undefined }
        const hasLead = !!L.lead
        const uLead = clamp01(t / 0.86)
        const uContent = hasLead ? clamp01((t - 0.14) / 0.86) : t
        C.style.clipPath = `path('${shape(L.kind, uContent, ctx)}')`
        if (lead) {
          lead.style.display = uContent >= 1 ? 'none' : ''
          lead.style.clipPath = `path('${shape(L.kind, uLead, ctx)}')`
        }
        if (dot && L.kind === 'ridge') {
          const pk = peakAt(uLead, vw, vh)
          dot.style.display = uLead > 0 && uLead < 1 ? '' : 'none'
          dot.style.transform = `translate(${pk.x.toFixed(1)}px, ${pk.y.toFixed(1)}px)`
        }
        // A secção anterior recua (ou aproxima-se, quando entramos "dentro" dela).
        const e = easeInOut(t)
        const aTop = A.getBoundingClientRect().top
        if (L.zoomPrev && ctx.origin) {
          const cx = ctx.origin.x + ctx.origin.w / 2
          const cy = ctx.origin.y + ctx.origin.h / 2
          origin[i - 1] = `${cx.toFixed(0)}px ${(cy - aTop).toFixed(0)}px`
          tf[i - 1] += `scale(${(1 + 0.14 * e).toFixed(4)})`
        } else {
          origin[i - 1] = `50% ${(vh / 2 - aTop).toFixed(0)}px`
          tf[i - 1] += `scale(${(1 - 0.06 * e).toFixed(4)})`
        }
        if (dim) dim.style.opacity = (0.12 * e).toFixed(3)
      }
      for (let i = 0; i < n; i++) {
        const el = sticks.current[i]
        if (!el) continue
        el.style.transform = tf[i].trim()
        if (origin[i]) el.style.transformOrigin = origin[i]
      }
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const onResize = () => {
      pinTops()
      onScroll()
    }
    const ro = new ResizeObserver(onResize)
    sticks.current.forEach((el) => el && ro.observe(el))
    pinTops()
    frame()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [layers, n])

  const render = (i: number): ReactNode => {
    const L = layers[i]
    return (
      <div key={L.key} ref={(el) => void (wraps.current[i] = el)} className="relative">
        <div ref={(el) => void (sticks.current[i] = el)} className="sticky top-0 will-change-transform">
          {i > 0 && L.lead && (
            <div ref={(el) => void (leads.current[i] = el)} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[100vh]" style={{ background: L.lead, display: 'none' }} />
          )}
          <div ref={(el) => void (contents.current[i] = el)} className="relative min-h-[100svh]" style={{ background: L.bg }}>
            {L.node}
          </div>
          <div ref={(el) => void (dims.current[i] = el)} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#03060F] opacity-0" />
          {i > 0 && L.kind === 'ridge' && (
            <div ref={(el) => void (nodes.current[i] = el)} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-0 w-0" style={{ display: 'none' }}>
              <span className="absolute -left-[7px] -top-[7px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_0_0_5px_rgba(30,144,255,0.35),0_0_30px_8px_rgba(30,144,255,0.9)]" />
            </div>
          )}
        </div>
        {i + 1 < n && render(i + 1)}
      </div>
    )
  }

  return <>{render(0)}</>
}

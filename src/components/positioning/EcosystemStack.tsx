import { useLayoutEffect, useRef, useState } from 'react'
import { EcosystemNode } from '@/components/positioning/EcosystemNode'
import { IntelligenceCore } from '@/components/positioning/IntelligenceCore'
import { outputs, sources } from '@/data/positioningSection'

/** Distância entre uma fila de chips e a barra que a recolhe, em pixels. */
const STUB = 10
/** Tolerância para considerar que dois chips estão na mesma fila. */
const ROW_TOLERANCE = 4

type Chip = { cx: number; top: number; bottom: number }

type Wiring = {
  width: number
  height: number
  /** Ramos origem -> barra -> espinha. */
  inTree: string
  /** Ramos espinha -> barra -> saída. */
  outTree: string
  /** Só a espinha, para o impulso animado. */
  inSpine: string
  outSpine: string
  /** Extremos verticais de cada gradiente, em unidades do palco. */
  inFrom: number
  inTo: number
  outFrom: number
  outTo: number
}

/** Agrupa os chips por fila. O flex-wrap decide quantas filas existem. */
function groupRows(chips: Chip[]) {
  const rows: Chip[][] = []

  for (const chip of [...chips].sort((a, b) => a.top - b.top || a.cx - b.cx)) {
    const current = rows[rows.length - 1]
    if (current && Math.abs(current[0].top - chip.top) < ROW_TOLERANCE) current.push(chip)
    else rows.push([chip])
  }

  return rows
}

/** Y da barra que recolhe uma fila, do lado virado ao núcleo. */
function busOf(row: Chip[], direction: 'in' | 'out') {
  return direction === 'in'
    ? Math.max(...row.map((chip) => chip.bottom)) + STUB
    : Math.min(...row.map((chip) => chip.top)) - STUB
}

/**
 * Desenha a árvore de um bloco: um troço curto a sair de cada chip, uma barra
 * horizontal que recolhe a fila e uma espinha vertical até ao núcleo.
 *
 * `in` desce dos sistemas para o núcleo, `out` desce do núcleo para os
 * resultados. Em ambos os casos a espinha corre no eixo central e atravessa a
 * barra de todas as filas, por isso uma única linha vertical liga tudo.
 */
function buildTree(chips: Chip[], spineX: number, coreEdge: number, direction: 'in' | 'out') {
  const rows = groupRows(chips)
  if (rows.length === 0) return null

  const segments: string[] = []
  const n = (value: number) => value.toFixed(1)

  for (const row of rows) {
    const busY = busOf(row, direction)

    for (const chip of row) {
      const edge = direction === 'in' ? chip.bottom : chip.top
      segments.push(`M${n(chip.cx)},${n(edge)} L${n(chip.cx)},${n(busY)}`)
    }

    const xs = row.map((chip) => chip.cx)
    const left = Math.min(...xs)
    const right = Math.max(...xs)
    if (right - left > 1) segments.push(`M${n(left)},${n(busY)} L${n(right)},${n(busY)}`)
  }

  // A espinha arranca da barra mais afastada do núcleo e termina encostada à
  // moldura dele.
  const busYs = rows.map((row) => busOf(row, direction))
  const far = direction === 'in' ? Math.min(...busYs) : Math.max(...busYs)
  const spine =
    direction === 'in'
      ? `M${n(spineX)},${n(far)} L${n(spineX)},${n(coreEdge)}`
      : `M${n(spineX)},${n(coreEdge)} L${n(spineX)},${n(far)}`

  segments.push(spine)

  const edges = chips.map((chip) => (direction === 'in' ? chip.top : chip.bottom))
  const outer = direction === 'in' ? Math.min(...edges) : Math.max(...edges)

  return {
    tree: segments.join(' '),
    spine,
    from: direction === 'in' ? outer : coreEdge,
    to: direction === 'in' ? coreEdge : outer,
  }
}

/**
 * Ecossistema em telemóvel — até md.
 *
 * A órbita não sobrevive a 360px: os rótulos ficariam ilegíveis e o palco
 * quadrado ocuparia a altura toda. A mesma leitura passa a vertical —
 * origens em cima, núcleo ao meio, saídas em baixo.
 *
 * A geometria dos conectores é calculada para este layout e não herdada do
 * desktop. Os chips distribuem-se por flex-wrap, portanto o número de filas e
 * a posição horizontal de cada um dependem da largura real: são medidos com um
 * ResizeObserver e as coordenadas do SVG são as posições verdadeiras, em
 * pixels, dentro do palco. Sem isto qualquer traçado fixo erra o alvo assim
 * que a linha quebra noutro sítio.
 *
 * O SVG vem antes dos chips na árvore para as linhas passarem POR TRÁS deles —
 * os chips têm fundo opaco, tal como no desktop, por isso nada atravessa
 * texto.
 *
 * A versão desktop está em display:none aqui, e vice-versa, por isso não há
 * conteúdo duplicado na árvore de acessibilidade.
 */
export function EcosystemStack({ motion }: { motion: boolean }) {
  const frame = useRef<HTMLDivElement>(null)
  const core = useRef<HTMLDivElement>(null)
  const sourceChips = useRef<(HTMLLIElement | null)[]>([])
  const outputChips = useRef<(HTMLLIElement | null)[]>([])
  const [wiring, setWiring] = useState<Wiring | null>(null)

  useLayoutEffect(() => {
    const frameEl = frame.current
    const coreEl = core.current
    if (!frameEl || !coreEl) return

    let last = ''

    const read = () => {
      const box = frameEl.getBoundingClientRect()
      // A partir de md este bloco está em display:none e mede zero. Sair sem
      // escrever evita gravar geometria degenerada.
      if (box.width === 0 || box.height === 0) return

      const toChip = (element: HTMLElement): Chip => {
        const rect = element.getBoundingClientRect()
        return {
          cx: rect.left - box.left + rect.width / 2,
          top: rect.top - box.top,
          bottom: rect.bottom - box.top,
        }
      }

      const list = (refs: (HTMLLIElement | null)[]) =>
        refs.filter((element): element is HTMLLIElement => element !== null).map(toChip)

      const coreRect = coreEl.getBoundingClientRect()
      const coreTop = coreRect.top - box.top
      const coreBottom = coreRect.bottom - box.top
      const spineX = coreRect.left - box.left + coreRect.width / 2

      const incoming = buildTree(list(sourceChips.current), spineX, coreTop, 'in')
      const outgoing = buildTree(list(outputChips.current), spineX, coreBottom, 'out')
      if (!incoming || !outgoing) return

      const next: Wiring = {
        width: box.width,
        height: box.height,
        inTree: incoming.tree,
        outTree: outgoing.tree,
        inSpine: incoming.spine,
        outSpine: outgoing.spine,
        inFrom: incoming.from,
        inTo: incoming.to,
        outFrom: outgoing.from,
        outTo: outgoing.to,
      }

      // O SVG é absoluto e não altera o layout, por isso não há ciclo com o
      // observer. A comparação evita renders inúteis na mesma medida.
      const signature = JSON.stringify(next)
      if (signature === last) return
      last = signature
      setWiring(next)
    }

    read()

    const observer = new ResizeObserver(read)
    observer.observe(frameEl)
    for (const element of [...sourceChips.current, ...outputChips.current]) {
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={frame} className="relative md:hidden">
      {wiring ? (
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${wiring.width} ${wiring.height}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient
              id="eco-mobile-in"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1={wiring.inFrom}
              x2="0"
              y2={wiring.inTo}
            >
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(30,144,255,0.42)" />
            </linearGradient>
            <linearGradient
              id="eco-mobile-out"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1={wiring.outFrom}
              x2="0"
              y2={wiring.outTo}
            >
              <stop offset="0%" stopColor="rgba(0,82,255,0.48)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
            </linearGradient>
          </defs>

          <path
            d={wiring.inTree}
            fill="none"
            stroke="url(#eco-mobile-in)"
            strokeWidth={1}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={wiring.outTree}
            fill="none"
            stroke="url(#eco-mobile-out)"
            strokeWidth={1}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {motion ? (
            <>
              <path
                d={wiring.inSpine}
                fill="none"
                stroke="#1E90FF"
                strokeWidth={1.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="6 320"
                className="animate-flow"
                style={{ animationDuration: '4.4s' }}
              />
              <path
                d={wiring.outSpine}
                fill="none"
                stroke="#1E90FF"
                strokeWidth={1.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="6 320"
                className="animate-flow"
                style={{ animationDuration: '4.4s', animationDelay: '1.9s' }}
              />
            </>
          ) : null}
        </svg>
      ) : null}

      <ul
        aria-label="Sistemas que a empresa já utiliza"
        className="relative flex flex-wrap items-center justify-center gap-x-2 gap-y-7"
      >
        {sources.map((node, index) => (
          <li
            key={node.label}
            ref={(element) => {
              sourceChips.current[index] = element
            }}
          >
            <EcosystemNode label={node.label} icon={node.icon} tone="source" />
          </li>
        ))}
      </ul>

      <div ref={core} className="relative mt-12 flex justify-center">
        <IntelligenceCore />
      </div>

      <ul
        aria-label="Resultados gerados pela Finer One"
        className="relative mt-12 flex flex-wrap items-center justify-center gap-x-2 gap-y-7"
      >
        {outputs.map((node, index) => (
          <li
            key={node.label}
            ref={(element) => {
              outputChips.current[index] = element
            }}
          >
            <EcosystemNode label={node.label} icon={node.icon} tone="output" />
          </li>
        ))}
      </ul>
    </div>
  )
}

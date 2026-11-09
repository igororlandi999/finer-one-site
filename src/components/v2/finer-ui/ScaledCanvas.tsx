import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Desenha o conteúdo a uma largura fixa de "ecrã de computador" e escala-o
 * para caber no contentor — como uma captura de ecrã viva e nítida.
 * A altura do contentor acompanha a altura real escalada.
 */
export function ScaledCanvas({ width = 1280, children }: { width?: number; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const measure = () => {
      const s = o.clientWidth / width
      setScale(s)
      setHeight(i.offsetHeight * s)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(o)
    ro.observe(i)
    return () => ro.disconnect()
  }, [width])

  return (
    <div ref={outer} className="relative w-full overflow-hidden" style={{ height }}>
      <div ref={inner} className="absolute left-0 top-0 origin-top-left" style={{ width, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}

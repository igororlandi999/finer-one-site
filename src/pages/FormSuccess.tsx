import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Info } from 'lucide-react'

/** Confirmação após envio. Recebe o foco para ser anunciada por leitores de ecrã. */
export function FormSuccess({ title, body, preview, previewNote, children }: { title: string; body: string; preview: boolean; previewNote: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => ref.current?.focus(), [])

  return (
    <div ref={ref} tabIndex={-1} role="status" className="fo-rise text-center outline-none">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
        <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-[24px] font-bold tracking-[-0.01em] text-navy">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-navy/80">{body}</p>
      {preview && (
        <p className="mx-auto mt-5 flex max-w-md items-start gap-2 rounded-xl border border-accent/25 bg-ice p-3 text-left text-[12.5px] text-navy/80">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          {previewNote}
        </p>
      )}
      {children}
    </div>
  )
}

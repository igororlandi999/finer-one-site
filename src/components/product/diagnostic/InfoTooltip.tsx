import { Info } from 'lucide-react'

/** Ícone "(i)" com tooltip discreto ao focar/passar o rato. Sem dependência nova. */
export function InfoTooltip({ text }: { text: string }) {
  return (
    <span tabIndex={0} className="group relative inline-flex outline-none">
      <Info size={11} aria-hidden="true" className="text-mist/70" />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-max max-w-[180px] -translate-x-1/2 rounded-md border border-white/10 bg-navy-deep px-2 py-1 text-[10px] normal-case leading-snug text-mist opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {text}
      </span>
    </span>
  )
}

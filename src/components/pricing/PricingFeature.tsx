import { CircleCheck, CircleX } from 'lucide-react'

/** Linha da lista "Incluído no plano" — check azul circular. */
export function IncludedFeature({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <CircleCheck size={14} aria-hidden="true" className="shrink-0 text-glow" />
      <span className="text-[13px] leading-snug text-white">{label}</span>
    </li>
  )
}

/** Linha da lista "Não incluído" — mais apagada que os itens incluídos. */
export function ExcludedFeature({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <CircleX size={14} aria-hidden="true" className="shrink-0 text-white/25" />
      <span className="text-[13px] leading-snug text-mist/60">{label}</span>
    </li>
  )
}

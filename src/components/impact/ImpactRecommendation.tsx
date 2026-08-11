import { ArrowRight } from 'lucide-react'

/**
 * Recomendação — o elemento com maior peso do painel.
 *
 * É o argumento da secção: o produto não fica no número, chega à ação. Por
 * isso é o único bloco com superfície própria, moldura em accent e texto
 * maior do que a leitura.
 *
 * O rótulo varia por caso ("Próximo passo sugerido", "Ações a considerar",
 * "Nota") para nunca soar a ordem fechada.
 */
export function ImpactRecommendation({
  label,
  children,
}: {
  label: string
  children: string
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-accent/[0.28] bg-accent/[0.07] p-4 sm:p-[18px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/70 to-transparent"
      />

      <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-glow">
        <ArrowRight aria-hidden="true" className="h-3 w-3" strokeWidth={2.25} />
        {label}
      </p>
      <p className="mt-2 text-[14.5px] font-medium leading-relaxed text-white sm:text-[15px]">
        {children}
      </p>
    </div>
  )
}

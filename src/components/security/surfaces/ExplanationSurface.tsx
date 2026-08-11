import { ArrowDown } from 'lucide-react'
import { explanation } from '@/data/securitySection'

/**
 * Explicabilidade: o indicador e os fatores que o sustentam.
 *
 * A pergunta está no topo de propósito — é a superfície a interrogar-se a si
 * própria, que é exatamente o comportamento que a secção defende. O valor
 * aparece com seta e com a palavra "descida": a direção nunca depende só do
 * símbolo.
 *
 * Sem verde nem vermelho de mercado. Uma variação de margem num contexto
 * institucional não é um sinal de trading.
 */
export function ExplanationSurface() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-navy-deep/60 p-4">
      <p className="text-[11.5px] font-medium text-glow">{explanation.label}</p>

      <div className="mt-3.5 flex items-end justify-between gap-3 border-b border-white/[0.06] pb-3.5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-mist/70">
            {explanation.metric}
          </p>
          <p className="tabular mt-1.5 flex items-center gap-1.5 font-display text-[24px] font-semibold leading-none text-white">
            <ArrowDown aria-hidden="true" className="h-4 w-4 text-mist" strokeWidth={2.5} />
            {explanation.value}
          </p>
        </div>
        <p className="max-w-[13ch] text-right text-[11px] leading-snug text-mist/70">
          {explanation.trend}
        </p>
      </div>

      <p className="mt-3.5 text-[10px] uppercase tracking-[0.16em] text-mist/70">
        {explanation.factorsLabel}
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {explanation.factors.map((factor) => (
          <li key={factor} className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-glow/70" />
            <span className="text-[12.5px] leading-snug text-white/[0.85]">{factor}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3.5 text-[11px] text-mist/70">{explanation.note}</p>
    </div>
  )
}

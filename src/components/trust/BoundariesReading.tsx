import { boundaries } from '@/data/trustSection'

/**
 * Leitura complementar: o que a Finer One acrescenta e o que não pretende
 * substituir.
 *
 * A coluna da direita é sobre âmbito, não sobre limitações técnicas. Não
 * afirma o que a plataforma não consegue ou não pode fazer — afirma o que
 * não se propõe ser.
 */
export function BoundariesReading() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-glow">{boundaries.addsLabel}</p>
        <ul className="mt-4 space-y-2.5">
          {boundaries.adds.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span aria-hidden="true" className="h-px w-4 shrink-0 bg-glow/60" />
              <span className="text-[14px] text-white">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-mist">{boundaries.keepsLabel}</p>
        <ul className="mt-4 space-y-2.5">
          {boundaries.keeps.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span aria-hidden="true" className="h-px w-4 shrink-0 bg-white/[0.16]" />
              <span className="text-[14px] text-mist">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

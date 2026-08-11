import { organizeFigures, organizeRows } from '@/data/solutionSection'
import { cn } from '@/lib/utils'

/**
 * 02 — Organizar.
 *
 * O mesmo material da etapa anterior lido como uma peça editorial: réguas
 * finas que se estendem da esquerda, figuras alinhadas em coluna e números
 * tabulares. A leitura é de estrutura, não de dashboard — evita repetir a
 * composição do produto que já aparece na Hero.
 */
export function OrganizeVisual({ active }: { active: boolean }) {
  return (
    <div className="w-full">
      <p
        className={cn(
          'text-[10px] uppercase tracking-[0.22em] text-mist transition-opacity duration-500',
          active ? 'opacity-100' : 'opacity-0',
        )}
      >
        Visão consolidada
      </p>

      {/* Régua superior */}
      <span
        aria-hidden="true"
        className={cn(
          'mt-3 block h-px origin-left bg-white/15 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
          active ? 'scale-x-100' : 'scale-x-0',
        )}
      />

      <div className="grid grid-cols-3">
        {organizeFigures.map((figure, index) => (
          <div
            key={figure.label}
            className={cn(
              'border-white/[0.08] py-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:py-5',
              index > 0 && 'border-l pl-2.5 xl:pl-4',
              active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: `${120 + index * 110}ms` }}
          >
            <p className="text-[10px] uppercase tracking-wider text-mist">{figure.label}</p>
            <p className="mt-1.5 text-[14px] font-semibold tabular leading-tight text-white sm:text-[17px] xl:text-[21px]">
              {figure.value}
            </p>
          </div>
        ))}
      </div>

      <span
        aria-hidden="true"
        className={cn(
          'block h-px origin-left bg-white/[0.08] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transition-delay:420ms]',
          active ? 'scale-x-100' : 'scale-x-0',
        )}
      />

      <dl>
        {organizeRows.map((row, index) => (
          <div
            key={row.label}
            className={cn(
              'flex items-baseline justify-between gap-4 border-b border-white/[0.06] py-3 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
              active ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: `${480 + index * 110}ms` }}
          >
            <dt className="text-[12px] text-mist">{row.label}</dt>
            <dd className="text-[15px] font-semibold tabular text-white">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

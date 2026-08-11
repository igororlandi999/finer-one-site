import { useRef } from 'react'
import { impactCases } from '@/data/impactSection'
import type { ImpactCaseId } from '@/data/impactSection'
import { cn } from '@/lib/utils'

/**
 * Seletor das quatro perguntas — padrão tablist acessível.
 *
 * Foco itinerante (só a tab ativa é focável), setas esquerda/direita com
 * ciclo, Home e End. O clique define o caso; nada depende de hover.
 *
 * Grelha 2x2 em telemóvel e quatro colunas a partir de `lg`. Deliberadamente
 * grelha e não fila deslizável: com quatro perguntas longas, o deslize
 * esconderia sempre metade das opções e obrigaria a uma affordance extra
 * para dizer que há mais conteúdo de lado.
 *
 * Hierarquia: o seletor mostra o rótulo curto (e, em ecrãs largos, a pergunta
 * em texto secundário). A pergunta completa em tamanho grande pertence ao
 * painel — é isso que impede os seletores de competirem com ele.
 */
export function ImpactCaseSelector({
  active,
  onChange,
}: {
  active: ImpactCaseId
  onChange: (id: ImpactCaseId) => void
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const activeIndex = impactCases.findIndex((item) => item.id === active)

  const focusAt = (index: number) => {
    const next = (index + impactCases.length) % impactCases.length
    onChange(impactCases[next].id)
    // preventScroll: o painel fica logo abaixo e o browser tentaria reenquadrar
    // a página a cada seta, o que faria a secção saltar sob o teclado.
    buttons.current[next]?.focus({ preventScroll: true })
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      focusAt(activeIndex + 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusAt(activeIndex - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusAt(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusAt(impactCases.length - 1)
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Perguntas de gestão"
      onKeyDown={onKeyDown}
      className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4"
    >
      {impactCases.map((item, index) => {
        const selected = item.id === active

        return (
          <button
            key={item.id}
            ref={(element) => {
              buttons.current[index] = element
            }}
            type="button"
            role="tab"
            id={`impacto-tab-${item.id}`}
            aria-selected={selected}
            aria-controls={`impacto-painel-${item.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={cn(
              'group relative overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-colors duration-300 sm:px-4 sm:py-3.5',
              selected
                ? 'border-accent/45 bg-accent/[0.08]'
                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.045]',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow to-transparent transition-opacity duration-300',
                selected ? 'opacity-100' : 'opacity-0',
              )}
            />

            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'tabular text-[10px] tracking-[0.18em] transition-colors duration-300',
                  selected ? 'text-glow' : 'text-mist/60',
                )}
              >
                {item.index}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'h-px flex-1 transition-colors duration-300',
                  selected ? 'bg-glow/25' : 'bg-white/[0.06]',
                )}
              />
            </span>

            <span
              className={cn(
                'mt-2 block font-display text-[13.5px] font-semibold leading-tight tracking-[-0.01em] transition-colors duration-300 sm:text-[14.5px]',
                selected ? 'text-white' : 'text-white/[0.78] group-hover:text-white',
              )}
            >
              {item.tab}
            </span>

            <span className="mt-1 hidden text-[11.5px] leading-snug text-mist lg:block">
              {item.question}
            </span>
          </button>
        )
      })}
    </div>
  )
}

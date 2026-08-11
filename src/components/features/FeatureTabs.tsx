import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { features } from '@/data/featuresSection'
import type { FeatureId } from '@/data/featuresSection'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

/**
 * Navegação entre áreas — padrão tablist acessível.
 *
 * Foco itinerante (só a tab ativa é focável), setas esquerda/direita com
 * ciclo, Home e End. A ativação acompanha o foco, que é o comportamento
 * esperado quando o painel é leve como aqui.
 *
 * Em ecrãs estreitos a fila desliza na horizontal; a barra de deslocamento é
 * escondida visualmente mas o deslocamento por toque e por teclado continua a
 * funcionar. Duas correções de leitura em telemóvel:
 *
 * 1. Uma tab cortada a meio na extremidade parece defeito, não conteúdo. Um
 *    esbatimento curto assinala que há mais para o lado — e só do lado onde
 *    realmente há. É feito com duas sobreposições de gradiente e não com
 *    mask-image: a máscara recorta pela border-box e comeria o brilho do
 *    indicador da tab ativa, que se estende abaixo da fila.
 *
 * 2. Ao trocar de área, a tab escolhida é centrada na fila. É feito com
 *    scrollLeft no próprio contentor e não com scrollIntoView: este último
 *    também atua no eixo vertical e faria a página saltar quando a secção
 *    ainda não está totalmente visível.
 */
export function FeatureTabs({
  active,
  onChange,
}: {
  active: FeatureId
  onChange: (id: FeatureId) => void
}) {
  const list = useRef<HTMLDivElement | null>(null)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const [edges, setEdges] = useState({ start: false, end: false })
  const prefersReduced = usePrefersReducedMotion()

  const activeIndex = features.findIndex((feature) => feature.id === active)

  const readEdges = useCallback(() => {
    const element = list.current
    if (!element) return

    const max = element.scrollWidth - element.clientWidth
    const left = element.scrollLeft

    // Tolerância de 1px: larguras fracionárias impedem que scrollLeft chegue
    // exatamente ao máximo.
    setEdges({ start: left > 1, end: left < max - 1 })
  }, [])

  useLayoutEffect(() => {
    const element = list.current
    if (!element) return

    readEdges()

    const observer = new ResizeObserver(readEdges)
    observer.observe(element)
    for (const button of buttons.current) if (button) observer.observe(button)

    return () => observer.disconnect()
  }, [readEdges])

  useEffect(() => {
    const element = list.current
    const button = buttons.current[activeIndex]
    if (!element || !button) return
    if (element.scrollWidth <= element.clientWidth) return

    const target = button.offsetLeft - (element.clientWidth - button.offsetWidth) / 2

    element.scrollTo({
      left: target,
      behavior: prefersReduced ? 'auto' : 'smooth',
    })
  }, [activeIndex, prefersReduced])

  const focusTab = (index: number) => {
    const next = (index + features.length) % features.length
    onChange(features[next].id)
    // preventScroll: a centragem da fila é tratada acima; deixar o browser
    // resolver o foco sozinho voltaria a mexer no deslocamento vertical.
    buttons.current[next]?.focus({ preventScroll: true })
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusTab(activeIndex + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusTab(activeIndex - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusTab(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusTab(features.length - 1)
    }
  }

  return (
    <div className="relative">
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/[0.08]" />

      <div
        ref={list}
        role="tablist"
        aria-label="Áreas da Finer One"
        onKeyDown={onKeyDown}
        onScroll={readEdges}
        className={cn(
          'no-scrollbar flex gap-1 overflow-x-auto overscroll-x-contain',
          // safe center: quando as seis tabs não cabem, centrar deixaria a
          // primeira inacessível do lado esquerdo. Em browsers sem suporte a
          // declaração cai e a fila fica alinhada à esquerda, que é seguro.
          'sm:[justify-content:safe_center]',
        )}
      >
        {features.map((feature, index) => {
          const selected = feature.id === active

          return (
            <button
              key={feature.id}
              ref={(element) => {
                buttons.current[index] = element
              }}
              type="button"
              role="tab"
              id={`tab-${feature.id}`}
              aria-selected={selected}
              aria-controls={`painel-${feature.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(feature.id)}
              className={cn(
                'relative shrink-0 whitespace-nowrap px-3.5 pb-3 pt-2 text-[13px] transition-colors duration-300 sm:px-5',
                selected ? 'text-white' : 'text-mist hover:text-white',
              )}
            >
              {feature.tab}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-2 bottom-0 h-px origin-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-x-4',
                  selected
                    ? 'scale-x-100 bg-accent shadow-[0_0_12px_0_rgba(0,82,255,0.7)]'
                    : 'scale-x-0 bg-transparent',
                )}
              />
            </button>
          )
        })}
      </div>

      {/* bottom-px: a régua da fila continua visível de ponta a ponta. */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute bottom-px left-0 top-0 w-7 bg-gradient-to-r from-navy to-transparent transition-opacity duration-300',
          edges.start ? 'opacity-100' : 'opacity-0',
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute bottom-px right-0 top-0 w-7 bg-gradient-to-l from-navy to-transparent transition-opacity duration-300',
          edges.end ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}

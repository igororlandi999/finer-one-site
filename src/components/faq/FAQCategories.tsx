import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { faqCategories } from '@/data/faq'
import type { FaqCategoryId } from '@/data/faq'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

/**
 * Categorias — padrão tablist acessível.
 *
 * Foco itinerante (só a categoria ativa é focável), setas esquerda e direita
 * com ciclo, Home e End. A ativação acompanha o foco, tal como na fase 4.
 *
 * Em ecrãs estreitos a fila desliza na horizontal, com o mesmo cuidado já
 * usado na fase 4: esbatimento apenas do lado onde há mais conteúdo, e
 * centragem da categoria escolhida através de scrollLeft — nunca
 * scrollIntoView, que atua também no eixo vertical e faria a página saltar.
 */
export function FAQCategories({
  active,
  onChange,
}: {
  active: FaqCategoryId
  onChange: (id: FaqCategoryId) => void
}) {
  const list = useRef<HTMLDivElement | null>(null)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const [edges, setEdges] = useState({ start: false, end: false })
  const prefersReduced = usePrefersReducedMotion()

  const activeIndex = faqCategories.findIndex((category) => category.id === active)

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
    element.addEventListener('scroll', readEdges, { passive: true })

    const observer = new ResizeObserver(readEdges)
    observer.observe(element)

    return () => {
      element.removeEventListener('scroll', readEdges)
      observer.disconnect()
    }
  }, [readEdges])

  // Centra a categoria ativa na fila, sem tocar no scroll vertical da página.
  useEffect(() => {
    const element = list.current
    const button = buttons.current[activeIndex]
    if (!element || !button) return

    const target = button.offsetLeft - (element.clientWidth - button.offsetWidth) / 2
    element.scrollTo({
      left: Math.max(0, target),
      behavior: prefersReduced ? 'auto' : 'smooth',
    })
  }, [activeIndex, prefersReduced])

  const focusCategory = (index: number) => {
    const next = (index + faqCategories.length) % faqCategories.length
    onChange(faqCategories[next].id)
    buttons.current[next]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusCategory(activeIndex + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusCategory(activeIndex - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusCategory(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusCategory(faqCategories.length - 1)
    }
  }

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-navy to-transparent transition-opacity duration-300 sm:hidden',
          edges.start ? 'opacity-100' : 'opacity-0',
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-navy to-transparent transition-opacity duration-300 sm:hidden',
          edges.end ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={list}
        role="tablist"
        aria-label="Categorias de perguntas"
        onKeyDown={onKeyDown}
        className="no-scrollbar flex gap-2 overflow-x-auto py-1 sm:flex-wrap sm:justify-center sm:overflow-visible"
      >
        {faqCategories.map((category, index) => {
          const selected = category.id === active

          return (
            <button
              key={category.id}
              ref={(element) => {
                buttons.current[index] = element
              }}
              type="button"
              role="tab"
              id={`faq-tab-${category.id}`}
              aria-selected={selected}
              aria-controls={`faq-painel-${category.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(category.id)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] transition-colors duration-300',
                selected
                  ? 'border-accent/[0.45] bg-accent/[0.1] text-white'
                  : 'border-white/[0.08] bg-white/[0.02] text-mist hover:border-white/[0.16] hover:text-white',
              )}
            >
              {category.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

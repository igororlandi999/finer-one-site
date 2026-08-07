import { Plus } from 'lucide-react'
import type { FaqEntry } from '@/data/faq'
import { cn } from '@/lib/utils'

/**
 * Uma pergunta.
 *
 * A pergunta é um <button> real com aria-expanded e aria-controls; a resposta
 * tem id próprio e region associada. Nada depende de clique em div.
 *
 * A abertura usa grid-template-rows de 0fr para 1fr: anima suavemente sem
 * altura fixa nem medição em JavaScript, por isso respostas de qualquer
 * comprimento funcionam e nada é truncado. A transição é neutralizada pelo
 * prefers-reduced-motion global definido em index.css.
 */
export function FAQItem({
  entry,
  id,
  open,
  onToggle,
}: {
  entry: FaqEntry
  id: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        'rounded-xl border transition-colors duration-300',
        open
          ? 'border-accent/[0.3] bg-white/[0.035]'
          : 'border-white/[0.07] bg-white/[0.015] hover:border-white/[0.14]',
      )}
    >
      <h3>
        <button
          type="button"
          id={`faq-pergunta-${id}`}
          aria-expanded={open}
          aria-controls={`faq-resposta-${id}`}
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
        >
          <span className="text-[14.5px] font-medium leading-snug text-white sm:text-[15px]">
            {entry.question}
          </span>
          <Plus
            size={16}
            aria-hidden="true"
            className={cn(
              'mt-0.5 shrink-0 transition-all duration-300',
              open ? 'rotate-45 text-glow' : 'text-mist',
            )}
          />
        </button>
      </h3>

      <div
        id={`faq-resposta-${id}`}
        role="region"
        aria-labelledby={`faq-pergunta-${id}`}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-mist sm:px-6 sm:pb-6 sm:text-[14px]">
            {entry.answer}
          </p>
        </div>
      </div>
    </div>
  )
}

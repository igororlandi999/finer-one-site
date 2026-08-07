import { FAQItem } from '@/components/faq/FAQItem'
import { faq } from '@/data/faq'
import type { FaqCategoryId } from '@/data/faq'

/**
 * Lista de perguntas da categoria ativa.
 *
 * Só as quatro perguntas da categoria escolhida existem no DOM — nunca as
 * dezasseis. A `key` no contentor força a remontagem ao trocar de categoria,
 * o que reinicia a animação de entrada; o estado de abertura é reposto pela
 * secção, para não ficar um índice da categoria anterior aberto.
 */
export function FAQAccordion({
  category,
  open,
  onToggle,
}: {
  category: FaqCategoryId
  open: number | null
  onToggle: (index: number) => void
}) {
  return (
    <div
      key={category}
      role="tabpanel"
      id={`faq-painel-${category}`}
      aria-labelledby={`faq-tab-${category}`}
      tabIndex={0}
      className="animate-panel-in space-y-3 focus-visible:outline-none"
    >
      {faq[category].map((entry, index) => (
        <FAQItem
          key={entry.question}
          entry={entry}
          id={`${category}-${index}`}
          open={open === index}
          onToggle={() => onToggle(index)}
        />
      ))}
    </div>
  )
}

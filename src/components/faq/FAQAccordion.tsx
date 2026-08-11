import { FAQItem } from '@/components/faq/FAQItem'
import { faq } from '@/data/faq'

/**
 * Lista de perguntas.
 *
 * São seis e vivem todas no mesmo accordion — não há categorias a filtrar. O
 * estado de abertura é do pai, para que abrir uma pergunta feche a anterior.
 */
export function FAQAccordion({
  open,
  onToggle,
}: {
  open: number | null
  onToggle: (index: number) => void
}) {
  return (
    <div className="space-y-3">
      {faq.map((entry, index) => (
        <FAQItem
          key={entry.question}
          entry={entry}
          id={String(index)}
          open={open === index}
          onToggle={() => onToggle(index)}
        />
      ))}
    </div>
  )
}

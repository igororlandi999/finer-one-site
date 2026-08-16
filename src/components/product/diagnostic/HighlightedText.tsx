import type { TextPart } from '@/data/demoDashboard'

/** Parágrafo com trechos financeiros destacados a azul, sem recorrer a HTML solto. */
export function HighlightedText({ parts, className }: { parts: TextPart[]; className?: string }) {
  return (
    <p className={className}>
      {parts.map((part, index) =>
        part.highlight ? (
          <span key={index} className="font-semibold text-glow">
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </p>
  )
}

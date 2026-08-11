import { TrustCard } from '@/components/security/TrustCard'
import { Reveal } from '@/components/ui/Reveal'
import { trustColumns } from '@/data/securitySection'

/**
 * Mural em três colunas temáticas.
 *
 * Colunas explícitas e não CSS `columns` nem masonry: com colunas de CSS a
 * ordem de leitura passa a ser vertical dentro de cada coluna mas o browser
 * decide onde quebrar, o que faria um card partir-se a meio ao mudar de
 * largura. Aqui cada coluna é um tema fechado, e em telemóvel empilham pela
 * ordem narrativa — origem e controlo, transparência, proteção.
 *
 * As alturas desencontram-se sozinhas: a superfície de produto está no
 * primeiro card das colunas 1 e 2 e no primeiro da coluna 3, e o callout
 * ocupa posições diferentes em cada coluna. É ritmo intencional, não masonry
 * — os topos das colunas ficam alinhados, o que é o que separa um mural
 * desenhado de um mural caótico.
 *
 * O rótulo da coluna existe sobretudo para telemóvel: sem ele, ao empilhar,
 * os nove cards leriam-se como uma lista sem estrutura.
 */
export function TrustColumns() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
      {trustColumns.map((column, columnIndex) => (
        <div key={column.id} className="flex flex-col gap-4 lg:gap-5">
          <Reveal delay={columnIndex * 90}>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.18em] text-glow">
                {column.label}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-white/[0.08]" />
            </div>
          </Reveal>

          {column.cards.map((card, cardIndex) => (
            <Reveal key={card.id} delay={columnIndex * 90 + (cardIndex + 1) * 70}>
              <TrustCard card={card} />
            </Reveal>
          ))}
        </div>
      ))}
    </div>
  )
}

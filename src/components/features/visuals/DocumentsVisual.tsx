import { FileText, Landmark, Receipt, TrendingUp } from 'lucide-react'
import { FieldLabel, Figure, Rule, Surface, Tag } from '@/components/features/primitives'
import { documents, documentsAside } from '@/data/featuresSection'

/**
 * 05 — Documentos.
 *
 * Área de organização documental. Não representa leitura automática,
 * reconhecimento de conteúdo nem qualquer processamento por IA: mostra
 * apenas nome, categoria, data e estado.
 */
const icons = [FileText, Landmark, Receipt, TrendingUp]

export function DocumentsVisual() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-white">Documentos financeiros</p>
        <div className="flex items-center gap-1.5">
          {['Todos', 'Relatórios', 'Extratos'].map((filter, index) => (
            <span
              key={filter}
              className={
                index === 0
                  ? 'rounded-full border border-accent/[0.4] bg-accent/[0.12] px-2.5 py-0.5 text-[10px] leading-none text-glow'
                  : 'rounded-full border border-white/[0.08] px-2.5 py-0.5 text-[10px] leading-none text-mist'
              }
            >
              {filter}
            </span>
          ))}
        </div>
      </div>

      <Surface className="mt-3 flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
        <div className="hidden items-center gap-3 pb-2 sm:flex">
          <span className="flex-1 text-[10px] uppercase tracking-[0.16em] text-mist">Nome</span>
          <span className="w-[92px] text-[10px] uppercase tracking-[0.16em] text-mist">
            Categoria
          </span>
          <span className="w-[84px] text-[10px] uppercase tracking-[0.16em] text-mist">Data</span>
          <span className="w-[96px] text-right text-[10px] uppercase tracking-[0.16em] text-mist">
            Estado
          </span>
        </div>

        <Rule className="hidden sm:block" />

        <ul className="min-h-0 flex-1">
          {documents.map((document, index) => {
            const Icon = icons[index] ?? FileText

            return (
              <li
                key={document.name}
                className="flex animate-panel-in items-start gap-3 border-b border-white/[0.05] py-2.5 last:border-b-0 sm:items-center"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <span className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center">
                  <Icon
                    size={13}
                    aria-hidden="true"
                    className="mt-[3px] shrink-0 text-mist sm:mt-0"
                  />
                  <span className="min-w-0 flex-1">
                    {/* Em telemóvel o nome manda: ocupa a largura toda e
                        quebra em vez de ser cortado. A partir de sm volta a
                        ser uma célula de tabela e o corte é o comportamento
                        correto. */}
                    <span className="block text-[12.5px] leading-snug text-white sm:truncate">
                      {document.name}
                    </span>
                    {/* Meta e estado partilham a linha seguinte e quebram
                        entre si se preciso. Evita a coluna fixa de 96px que
                        a 360px comia um terço da linha. */}
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 sm:hidden">
                      <span className="text-[10px] text-mist">
                        {document.category} · {document.date}
                      </span>
                      <Tag>{document.state}</Tag>
                    </span>
                  </span>
                </span>
                <span className="hidden w-[92px] shrink-0 text-[11px] text-mist sm:block">
                  {document.category}
                </span>
                <span className="hidden w-[84px] shrink-0 text-[11px] tabular text-mist sm:block">
                  {document.date}
                </span>
                <span className="hidden w-[96px] shrink-0 text-right sm:block">
                  <Tag>{document.state}</Tag>
                </span>
              </li>
            )
          })}
        </ul>
      </Surface>
    </div>
  )
}

/** Visual secundário: pré-visualização mínima de um relatório. */
export function DocumentsAside() {
  return (
    <>
      <FieldLabel>Pré-visualização</FieldLabel>

      <div className="mt-2.5 rounded-md border border-white/[0.08] bg-navy p-3">
        <p className="text-[12px] font-semibold leading-tight text-white">
          {documentsAside.title}
        </p>
        <p className="mt-0.5 text-[10px] text-mist">{documentsAside.period}</p>

        <Rule className="my-2.5" />

        <div className="space-y-2">
          {documentsAside.figures.map((figure) => (
            <div key={figure.label}>
              <p className="text-[10px] text-mist">{figure.label}</p>
              <Figure size="sm">{figure.value}</Figure>
            </div>
          ))}
        </div>

        <div aria-hidden="true" className="mt-3 space-y-1.5">
          <span className="block h-px w-full bg-white/[0.08]" />
          <span className="block h-px w-[82%] bg-white/[0.06]" />
          <span className="block h-px w-[64%] bg-white/[0.05]" />
        </div>
      </div>
    </>
  )
}

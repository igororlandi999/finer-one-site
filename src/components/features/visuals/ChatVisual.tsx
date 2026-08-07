import { LogoMark } from '@/components/brand/Logo'
import { FieldLabel, Figure, Surface } from '@/components/features/primitives'
import { chatAside, chatExchange } from '@/data/featuresSection'

/** 06 — Chat Financeiro. Uma troca curta, ligada aos dados do período. */
export function ChatVisual() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-3">
        <div className="flex animate-panel-in justify-end">
          <p className="max-w-[86%] rounded-xl rounded-br-sm bg-accent/[0.16] px-3.5 py-2.5 text-[13px] leading-snug text-white">
            {chatExchange.question}
          </p>
        </div>

        <div
          className="flex animate-panel-in items-start gap-2.5"
          style={{ animationDelay: '140ms' }}
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-accent/[0.4] bg-navy">
            <LogoMark className="h-2.5 text-white" />
          </span>
          <Surface className="px-3.5 py-2.5">
            <p className="text-[13px] leading-relaxed text-mist">{chatExchange.answer}</p>
          </Surface>
        </div>
      </div>

      <div className="mt-4">
        <FieldLabel>Continuar a explorar</FieldLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {chatExchange.suggestions.map((suggestion) => (
            <span
              key={suggestion}
              className="rounded-full border border-white/[0.1] px-3 py-1.5 text-[11.5px] leading-none text-mist"
            >
              {suggestion}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Visual secundário: o indicador citado na resposta. */
export function ChatAside() {
  return (
    <>
      <FieldLabel>{chatAside.label}</FieldLabel>
      <Figure size="lg" className="mt-1.5 text-signal">
        {chatAside.value}
      </Figure>
      <p className="mt-1 text-[11px] text-mist">{chatAside.note}</p>

      <ul className="mt-3 space-y-2">
        {chatAside.bars.map((bar, index) => (
          <li key={bar.label}>
            <p className="text-[11px] text-mist">{bar.label}</p>
            <span aria-hidden="true" className="mt-1 block h-1 rounded-full bg-white/[0.07]">
              <span
                className="block h-full origin-left animate-grow-right rounded-full bg-gradient-to-r from-accent to-glow"
                style={{ width: `${bar.share}%`, animationDelay: `${index * 80}ms` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

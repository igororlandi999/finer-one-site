import type { ProcessStep } from '@/data/processSection'
import { cn } from '@/lib/utils'

/**
 * Microvisuais das etapas.
 *
 * São o argumento da secção: lidos da esquerda para a direita, ou de cima
 * para baixo, mostram a informação a passar de dispersa a ordenada, de
 * ordenada a selecionada, de selecionada a projetada, e de projetada a
 * resposta. Nenhum é um dashboard — são formas, não interfaces.
 *
 * DEMONSTRAÇÃO CONCEPTUAL. Não afirmam integrações, volumes, velocidade,
 * modelos nem precisão. Os únicos textos com aparência de dado são rótulos
 * genéricos de categoria.
 *
 * `dim` reduz o visual enquanto a etapa ainda não foi alcançada, para que a
 * progressão se leia também nas formas e não só na calha.
 */

const surface = 'rounded-xl border border-white/[0.07] bg-navy-deep/50 p-4'

/** 01 — três origens genéricas a convergir num ponto comum. */
function ConnectVisual() {
  const sources = ['ERP', 'Faturação', 'Fontes financeiras']

  return (
    <div className={cn(surface, 'flex items-center gap-3')}>
      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {sources.map((source) => (
          <li
            key={source}
            className="truncate rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-[11.5px] text-mist"
          >
            {source}
          </li>
        ))}
      </ul>

      <svg
        viewBox="0 0 60 96"
        aria-hidden="true"
        className="h-[96px] w-[60px] shrink-0"
        preserveAspectRatio="none"
      >
        {[16, 48, 80].map((y) => (
          <path
            key={y}
            d={`M0,${y} C28,${y} 32,48 60,48`}
            fill="none"
            stroke="rgba(30,144,255,0.45)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <span
        aria-hidden="true"
        className="h-8 w-8 shrink-0 rounded-lg border border-glow/[0.35] bg-accent/[0.16]"
      />
    </div>
  )
}

/** 02 — blocos soltos que passam a linhas alinhadas. */
function OrganiseVisual() {
  const scattered = [
    { x: 4, y: 8, w: 26 },
    { x: 42, y: 22, w: 18 },
    { x: 12, y: 40, w: 22 },
    { x: 52, y: 58, w: 14 },
    { x: 22, y: 72, w: 20 },
  ]
  const rows = [92, 74, 58]

  return (
    <div className={cn(surface, 'flex items-center gap-4')}>
      <div className="relative h-[88px] min-w-0 flex-1" aria-hidden="true">
        {scattered.map((block) => (
          <span
            key={`${block.x}-${block.y}`}
            className="absolute h-1.5 rounded-full bg-white/[0.16]"
            style={{ left: `${block.x}%`, top: `${block.y}%`, width: `${block.w}%` }}
          />
        ))}
      </div>

      <span aria-hidden="true" className="h-[88px] w-px shrink-0 bg-white/[0.09]" />

      <ul className="flex min-w-0 flex-1 flex-col justify-center gap-2.5" aria-hidden="true">
        {rows.map((width) => (
          <li
            key={width}
            className="h-1.5 rounded-full bg-gradient-to-r from-accent/70 to-glow/50"
            style={{ width: `${width}%` }}
          />
        ))}
      </ul>
    </div>
  )
}

/** 03 — muitos sinais, poucos a merecer atenção. */
function DetectVisual() {
  const highlighted = new Set([7, 16, 27])

  return (
    <div className={cn(surface)}>
      <div className="grid grid-cols-12 gap-1.5" aria-hidden="true">
        {Array.from({ length: 36 }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-4 rounded-sm',
              highlighted.has(index) ? 'bg-glow' : 'bg-white/[0.08]',
            )}
            style={highlighted.has(index) ? undefined : { opacity: 0.4 + ((index * 7) % 5) / 12 }}
          />
        ))}
      </div>

      <p className="mt-3 text-[11px] text-mist">
        <span className="text-glow">3</span> sinais relevantes — exemplo demonstrativo
      </p>
    </div>
  )
}

/** 04 — a linha realizada continua como projeção. */
function ForecastVisual() {
  return (
    <div className={cn(surface)}>
      <svg viewBox="0 0 200 68" aria-hidden="true" className="h-[68px] w-full">
        <path
          d="M0,52 L28,46 L56,50 L84,38 L112,32"
          fill="none"
          stroke="#1E90FF"
          strokeWidth={1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M112,32 L140,26 L168,28 L200,14"
          fill="none"
          stroke="rgba(30,144,255,0.6)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="112"
          y1="6"
          x2="112"
          y2="62"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="112" cy="32" r="3" fill="#1E90FF" />
      </svg>

      <div className="mt-2 flex items-center justify-between text-[10.5px] text-mist">
        <span>Realizado</span>
        <span className="text-glow">Previsão</span>
      </div>
    </div>
  )
}

/** 05 — sinal, causa, ação. A leitura completa em três passos. */
function RecommendVisual() {
  const chain = [
    { label: 'Sinal', value: 'Margem sob pressão', tone: 'signal' as const },
    { label: 'Causa', value: 'Custos operacionais', tone: 'neutral' as const },
    { label: 'Ação', value: 'Rever estrutura de custos', tone: 'glow' as const },
  ]

  return (
    <ol className={cn(surface, 'space-y-2')}>
      {chain.map((link, index) => (
        <li key={link.label} className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              'h-1.5 w-1.5 shrink-0 rounded-full',
              link.tone === 'signal'
                ? 'bg-signal'
                : link.tone === 'glow'
                  ? 'bg-glow'
                  : 'bg-white/30',
            )}
          />
          <span className="w-[42px] shrink-0 text-[10px] uppercase tracking-[0.12em] text-mist/70">
            {link.label}
          </span>
          <span
            className={cn(
              'min-w-0 flex-1 truncate rounded-md border px-2.5 py-1.5 text-[11.5px]',
              index === chain.length - 1
                ? 'border-glow/[0.3] bg-accent/[0.12] text-white'
                : 'border-white/[0.07] bg-white/[0.02] text-mist',
            )}
          >
            {link.value}
          </span>
        </li>
      ))}
    </ol>
  )
}

const visuals: Record<ProcessStep['icon'], () => React.ReactElement> = {
  ligar: ConnectVisual,
  analisar: OrganiseVisual,
  identificar: DetectVisual,
  antecipar: ForecastVisual,
  recomendar: RecommendVisual,
}

export function ProcessVisual({ id, dim }: { id: ProcessStep['icon']; dim: boolean }) {
  const Visual = visuals[id]

  return (
    <div
      className={cn(
        'transition-opacity duration-700 ease-out motion-reduce:opacity-100',
        dim ? 'opacity-55' : 'opacity-100',
      )}
    >
      <Visual />
    </div>
  )
}

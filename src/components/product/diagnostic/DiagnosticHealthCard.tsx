import { HeartPulse } from 'lucide-react'
import { InfoTooltip } from '@/components/product/diagnostic/InfoTooltip'
import { useCountUp } from '@/hooks/useCountUp'
import { useLanguage } from '@/i18n/LanguageContext'

const copy = {
  pt: { label: 'Saúde financeira', tooltip: 'Score consolidado da situação financeira da empresa.' },
  en: { label: 'Financial health', tooltip: "Consolidated score of the company's financial situation." },
}

const RING_SIZE = 44
const STROKE = 5
const RADIUS = (RING_SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Distribuição decorativa do ring: não é a leitura literal do score, é a
 * composição dos fatores de saúde financeira — maioria estável (azul), uma
 * fatia de atenção (amarelo) e um detalhe crítico (vermelho, tom único do
 * dashboard fora da paleta de marca, reservado a este acento).
 */
const SEGMENTS = [
  { ratio: 0.7, color: '#1E90FF' },
  { ratio: 0.22, color: '#F0B429' },
  { ratio: 0.08, color: '#B4463F' },
]

export function DiagnosticHealthCard({ score, state }: { score: number; state: string }) {
  const animated = useCountUp(score, 1200, 220)
  const { lang } = useLanguage()
  const t = copy[lang]
  let offset = 0

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 sm:p-3">
      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="-rotate-90"
            aria-hidden="true"
          >
            {SEGMENTS.map((segment, index) => {
              const length = CIRCUMFERENCE * segment.ratio
              const dashoffset = -offset
              offset += length
              return (
                <circle
                  key={index}
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                />
              )
            })}
          </svg>
          <span className="absolute inset-[6px] flex items-center justify-center rounded-full bg-navy-deep text-glow">
            <HeartPulse size={13} aria-hidden="true" />
          </span>
        </div>

        <div className="min-w-0">
          <p className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-mist">
            {t.label}
            <InfoTooltip text={t.tooltip} />
          </p>
          <p className="mt-0.5 leading-none">
            <span className="text-[20px] font-semibold tabular text-white sm:text-[22px]">
              {Math.round(animated)}
            </span>
            <span className="text-[11px] text-mist">/100</span>
          </p>
          <span className="mt-1 inline-flex rounded-full border border-signal/[0.4] bg-navy-deep px-1.5 py-0.5 text-[9.5px] font-medium text-signal">
            {state}
          </span>
        </div>
      </div>
    </div>
  )
}

import { FieldLabel, Rule, Surface } from '@/components/features/primitives'
import { alertLevelLabel, alerts, alertsAside } from '@/data/featuresSection'
import type { AlertLevel } from '@/data/featuresSection'
import { cn } from '@/lib/utils'

/**
 * 03 — Alertas.
 *
 * Três níveis com peso visual diferente. `signal` fica reservado a atenção e
 * risco; informação usa Glow Blue. A lista não é um mural de avisos
 * vermelhos: a maioria das linhas mantém-se neutra.
 */
const dot: Record<AlertLevel, string> = {
  info: 'bg-glow',
  atencao: 'bg-signal/70',
  risco: 'bg-signal',
}

const edge: Record<AlertLevel, string> = {
  info: 'border-l-white/[0.12]',
  atencao: 'border-l-signal/40',
  risco: 'border-l-signal',
}

export function AlertsVisual() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold text-white">Central de alertas</p>
        <div className="flex items-center gap-3 text-[10px] text-mist">
          {(['info', 'atencao', 'risco'] as AlertLevel[]).map((level) => (
            <span key={level} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', dot[level])} />
              {alertLevelLabel[level]}
            </span>
          ))}
        </div>
      </div>

      <Rule className="mt-3" />

      <ul className="mt-3 flex min-h-0 flex-1 flex-col gap-2">
        {alerts.map((alert, index) => (
          <Surface
            as="li"
            key={alert.title}
            className={cn(
              'animate-panel-in border-l-2 p-3',
              edge[alert.level],
              index === 0 && 'bg-white/[0.05]',
            )}
          >
            <div style={{ animationDelay: `${index * 60}ms` }}>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dot[alert.level])}
                />
                <FieldLabel>{alertLevelLabel[alert.level]}</FieldLabel>
              </div>
              <p className="mt-1.5 text-[13px] font-medium leading-snug text-white">
                {alert.title}
              </p>
              <p className="mt-1 text-[11px] text-mist">{alert.meta}</p>
            </div>
          </Surface>
        ))}
      </ul>
    </div>
  )
}

/** Visual secundário: detalhe do alerta selecionado. */
export function AlertsAside() {
  return (
    <>
      <FieldLabel>Detalhe do alerta</FieldLabel>
      <p className="mt-2 text-[13px] font-semibold leading-snug text-white">{alertsAside.title}</p>

      <Rule className="my-3" />

      <p className="text-[10px] uppercase tracking-[0.16em] text-mist">
        {alertsAside.impactLabel}
      </p>
      <p className="mt-1 text-[13px] font-semibold tabular text-signal">{alertsAside.impact}</p>

      <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-mist">
        {alertsAside.suggestionLabel}
      </p>
      <p className="mt-1 text-[12px] leading-snug text-mist">{alertsAside.suggestion}</p>
    </>
  )
}

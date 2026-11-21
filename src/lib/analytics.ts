/**
 * Eventos de utilização (sem ferramenta de medição instalada).
 *
 * Cada evento é emitido como `fo:analytics` na janela e, se um dia existir uma
 * camada de dados (window.dataLayer) autorizada pelos fundadores, é lá colocado.
 * Nunca enviar dados pessoais nem valores financeiros: só as propriedades da
 * lista ALLOWED são aceites.
 *
 * Estratégia de registo: 'after' (experimentar primeiro, registar depois).
 * Fica preparado para um teste A/B futuro com 'before'.
 */
export type ExploreEvent =
  | 'explore_view'
  | 'simulation_started'
  | 'simulation_completed'
  | 'first_insight_viewed'
  | 'lead_form_opened'
  | 'lead_form_submitted'
  | 'lead_form_success'
  | 'full_report_viewed'
  | 'pioneers_cta_clicked'

export type RegisterStrategy = 'before' | 'after'
export const REGISTER_STRATEGY: RegisterStrategy = 'after'

const ALLOWED = ['scenario', 'horizon', 'strategy', 'lang', 'preview', 'location'] as const
type Props = Partial<Record<(typeof ALLOWED)[number], string | number | boolean>>

const sent = new Set<string>()

export function track(name: ExploreEvent, props: Props = {}, opts: { once?: boolean } = {}) {
  if (typeof window === 'undefined') return
  if (opts.once) {
    if (sent.has(name)) return
    sent.add(name)
  }
  const detail: Record<string, unknown> = { event: name, strategy: REGISTER_STRATEGY }
  for (const k of ALLOWED) if (props[k] !== undefined) detail[k] = props[k]
  window.dispatchEvent(new CustomEvent('fo:analytics', { detail }))
  const layer = (window as unknown as { dataLayer?: unknown[] }).dataLayer
  if (Array.isArray(layer)) layer.push(detail)
  if (import.meta.env.DEV) console.debug('[analytics]', detail)
}

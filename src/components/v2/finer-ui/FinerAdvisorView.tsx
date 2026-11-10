import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CalendarDays, ChevronDown, ChevronRight, Clock, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { ViewTitle } from './AppShell'
import { getUiData } from './data'
import type { AdvisorAction } from './data'

/** Finer Advisor recriado a partir da captura real, com dados fictícios. */
/**
 * `demo` (vídeo Remotion): quantos pontos de "O que os dados mostram" e quantas
 * recomendações estão visíveis (valores contínuos para entradas suaves) e a
 * intensidade do destaque da primeira recomendação. Sem `demo`, mostra tudo.
 */
export type AdvisorDemo = { shows: number; recs: number; focus: number }

export function FinerAdvisorView({ demo }: { demo?: AdvisorDemo } = {}) {
  const { lang } = useLanguage()
  const { advisor } = getUiData(lang)
  const [selectedId, setSelectedId] = useState(advisor.actions[0].id)
  const [recalc, setRecalc] = useState<'idle' | 'busy' | 'done'>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onRecalc = () => {
    if (recalc === 'busy') return
    setRecalc('busy')
    timer.current = window.setTimeout(() => setRecalc('done'), 1100)
  }

  const selected = advisor.actions.find((a) => a.id === selectedId) ?? advisor.actions[0]

  return (
    <div className={cn('px-4 pb-6 pt-4 @xl:px-8 @xl:pb-8')}>
      <p className={cn('inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11.5px] text-[#0B1030]/75')}>
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {recalc === 'done' ? advisor.updatedNow : advisor.updated}
      </p>

      <div className={cn('mt-3 flex flex-col gap-4 @4xl:flex-row @4xl:items-center @4xl:justify-between')}>
        <ViewTitle>Finer Advisor</ViewTitle>
        <div className={cn('flex flex-wrap items-center gap-2')}>
          <span className={cn('hidden text-[12.5px] text-[#0B1030]/75 @xl:inline')}>{advisor.period}</span>
          <span className={cn('inline-flex items-center gap-2 rounded-full border border-[#0B1030]/10 bg-white px-3.5 py-2 text-[12.5px] font-semibold')}>
            <CalendarDays className="h-3.5 w-3.5 text-[#0B1030]/60" aria-hidden="true" />
            {advisor.periodValue}
            <ChevronDown className="h-3.5 w-3.5 text-[#0B1030]/60" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onRecalc}
            className={cn('inline-flex items-center gap-2 rounded-full border border-[#0B1030]/10 bg-white px-3.5 py-2 text-[12.5px] font-semibold transition-colors hover:border-accent/40')}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', recalc === 'busy' && 'animate-spin')} aria-hidden="true" />
            {recalc === 'busy' ? advisor.recalcBusy : advisor.recalc}
          </button>
        </div>
      </div>

      <div className={cn('mt-6 grid gap-5 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]')}>
        {/* Lista de ações */}
        <div>
          <div className={cn('mb-3 flex items-center justify-end gap-2 text-[12.5px]')}>
            <span className="font-semibold">{advisor.sortBy}</span>
            <span className={cn('inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-medium')}>
              {advisor.sortValue}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
          <ul className="space-y-3" aria-label="Finer Advisor">
            {advisor.actions.map((action) => (
              <li key={action.id}>
                <ActionCard action={action} identified={advisor.identified} active={action.id === selected.id} onSelect={() => setSelectedId(action.id)} />
              </li>
            ))}
          </ul>
          <span className={cn('mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[12.5px] font-semibold shadow-sm')}>
            {advisor.fullPlan}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>

        {/* Painel de detalhe */}
        <ActionDetail key={selected.id + lang} action={selected} labels={advisor} demo={demo} />
      </div>
    </div>
  )
}

const severityStyle = {
  critical: 'bg-red-50 text-red-700',
  high: 'bg-amber-50 text-amber-800',
  medium: 'bg-[#EEF3FF] text-accent',
}

function ActionCard({ action, identified, active, onSelect }: { action: AdvisorAction; identified: string; active: boolean; onSelect: () => void }) {
  const tone = action.valueTone === 'in' ? 'text-emerald-700' : 'text-[#0B1030]'

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'group flex w-full flex-col gap-3 rounded-2xl border bg-white p-4 text-left transition-all duration-300 @xl:flex-row @xl:items-center @xl:gap-5 @xl:p-5',
        active ? 'border-accent shadow-[0_14px_36px_-20px_rgba(0,82,255,0.7)]' : 'border-transparent shadow-[0_10px_30px_-24px_rgba(11,16,48,0.5)] hover:-translate-y-0.5 hover:border-[#0B1030]/15',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#0B1030]/75">{action.area}</span>
          <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-semibold', severityStyle[action.level])}>
            <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
            {action.severity}
          </span>
        </p>
        <p className="mt-1.5 text-[15px] font-bold">{action.title}</p>
        <p className="mt-1 text-[12.5px] text-[#0B1030]/75">{action.summary}</p>
      </div>
      <div className={cn('flex items-center justify-between gap-3 border-t border-[#0B1030]/[0.08] pt-3 @xl:block @xl:border-l @xl:border-t-0 @xl:pl-5 @xl:pt-0')}>
        <div>
          <p className="text-[11.5px] text-[#0B1030]/70">{identified}</p>
          <p className={cn('tabular text-[18px] font-bold @xl:text-[20px]', tone)}>{action.value}</p>
          <p className="text-[11.5px] text-[#0B1030]/70">{action.valueNote}</p>
        </div>
        <ChevronRight className={cn('h-4 w-4 text-accent transition-transform @xl:hidden', active && 'translate-x-0.5')} aria-hidden="true" />
      </div>
    </button>
  )
}

type Labels = ReturnType<typeof getUiData>['advisor']

function ActionDetail({ action, labels, demo }: { action: AdvisorAction; labels: Labels; demo?: AdvisorDemo }) {
  const reveal = (n: number | undefined, i: number) => (n === undefined ? 1 : Math.min(1, Math.max(0, n - i)))
  const [value, setValue] = useState(action.simulator.initial)
  const [explain, setExplain] = useState(false)
  const results = action.simulator.results(value)

  return (
    <div data-demo="adv-detail" aria-live="polite" className={cn(demo ? '' : 'fo-rise', 'rounded-2xl border border-[#0B1030]/[0.07] bg-white p-5 shadow-[0_16px_50px_-28px_rgba(11,16,48,0.45)] @xl:p-6')}>
      <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-accent">{action.area}</p>
      <p className="mt-1 text-[17px] font-bold">{action.title}</p>
      <p className="mt-1 text-[13px] text-[#0B1030]/75">{action.summary}</p>

      <div className={cn('mt-4 grid grid-cols-3 divide-x divide-[#0B1030]/[0.08] rounded-xl border border-[#0B1030]/[0.08]')}>
        {action.stats.map(([v, l]) => (
          <div key={l} className={cn('px-2.5 py-3 @xl:px-4')}>
            <p className={cn('tabular text-[13px] font-bold @xl:text-[15px]')}>{v}</p>
            <p className="mt-0.5 text-[11px] text-[#0B1030]/70">{l}</p>
          </div>
        ))}
      </div>

      {/* Simulador interativo */}
      <div className="mt-4 rounded-xl bg-[#F3F6FD] p-4">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={`sim-${action.id}`} className="text-[13px] font-bold">
            {labels.simulator} · <span className="font-medium text-[#0B1030]/80">{action.simulator.label}</span>
          </label>
          <span className="tabular shrink-0 rounded-md bg-white px-2 py-0.5 text-[13px] font-bold text-accent">{action.simulator.format(value)}</span>
        </div>
        <input
          id={`sim-${action.id}`}
          type="range"
          min={action.simulator.min}
          max={action.simulator.max}
          step={action.simulator.step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="mt-3 w-full accent-[#0052FF]"
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {results.map(([l, v]) => (
            <div key={l} className="rounded-lg bg-white p-3">
              <p className="text-[11px] text-[#0B1030]/70">{l}</p>
              <p className={cn('tabular mt-0.5 text-[14px] font-bold @xl:text-[15px]')}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div data-demo="adv-shows" className="mt-4 rounded-xl bg-[#F3F6FD] p-4">
        <p className="text-[13px] font-bold">{labels.shows}</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-[12.5px] leading-relaxed text-[#0B1030]/85">
          {action.shows.map((s, i) => (
            <li key={s} style={{ opacity: reveal(demo?.shows, i), transform: `translateY(${(1 - reveal(demo?.shows, i)) * 6}px)` }}>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <p data-demo="adv-recs-title" className="mt-4 text-[13px] font-bold">{labels.recs}</p>
      <ul data-demo="adv-recs" className="mt-2 divide-y divide-[#0B1030]/[0.07] rounded-xl border border-[#0B1030]/[0.08]">
        {action.recs.map(([t, d], i) => (
          <li
            key={t}
            data-demo={`adv-rec-${i}`}
            className="flex items-center gap-3 px-3.5 py-2.5"
            style={{
              opacity: reveal(demo?.recs, i),
              transform: `translateY(${(1 - reveal(demo?.recs, i)) * 6}px)${i === 0 && demo?.focus ? ` scale(${1 + 0.025 * demo.focus})` : ''}`,
              ...(i === 0 && demo?.focus
                ? {
                    position: 'relative',
                    zIndex: 1,
                    borderRadius: 10,
                    backgroundColor: `rgba(238,243,255,${demo.focus})`,
                    boxShadow: `inset 3px 0 0 rgba(0,82,255,${demo.focus}), 0 14px 32px -14px rgba(0,82,255,${0.55 * demo.focus})`,
                  }
                : {}),
            }}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium">{t}</span>
              <span className="block text-[11.5px] text-[#0B1030]/70">{d}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          </li>
        ))}
      </ul>

      {explain && <p className="fo-rise mt-4 rounded-xl border border-accent/20 bg-[#EEF3FF] p-4 text-[13px] leading-relaxed text-[#0B1030]/90">{action.explain}</p>}

      <div className={cn('mt-5 flex flex-col gap-2 @xl:flex-row @xl:justify-between')}>
        <button
          type="button"
          onClick={() => setExplain((v) => !v)}
          aria-expanded={explain}
          className="rounded-full border border-[#0B1030]/15 bg-white px-4 py-2.5 text-[13px] font-semibold transition-colors hover:border-accent/50"
        >
          {explain ? labels.hideExplain : labels.explainCta}
        </button>
        <span className="inline-flex items-center justify-center gap-1 rounded-full bg-accent px-4 py-2.5 text-[13px] font-semibold text-white">
          {labels.partners}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

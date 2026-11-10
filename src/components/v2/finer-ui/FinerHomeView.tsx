import { useEffect, useState } from 'react'
import { ArrowUp, CalendarDays, ChevronRight, MessageSquare, Sparkles } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { ViewTitle } from './AppShell'
import { getUiData } from './data'

type Props = {
  /** false = só imagem (Hero): sem foco nem cliques. */
  interactive?: boolean
  onOpenAdvisor?: () => void
  /** false = só o Finer Brief e os indicadores (pré-visualizações compactas). */
  showAsk?: boolean
  /**
   * Guião do vídeo de demonstração (Remotion): pergunta e resposta escritas
   * até ao carácter indicado, controladas pelo fotograma. Ignora o estado interno.
   */
  script?: { question: string; typedQ: number; answer: string; typedA: number; reveal?: number }
}

/** Finer Home recriada a partir da captura real, com dados fictícios. */
export function FinerHomeView({ interactive = true, onOpenAdvisor, showAsk = true, script }: Props) {
  const { lang } = useLanguage()
  const { home } = getUiData(lang)
  const reduced = usePrefersReducedMotion()
  const [selected, setSelected] = useState<number | null>(null)
  const [typed, setTyped] = useState(0)

  const scripted = Boolean(script && script.typedA > 0)
  // Entrada progressiva dos blocos no vídeo (0 → escondidos; ≥ 3 → todos visíveis)
  const enter = (at: number) => {
    if (script?.reveal === undefined) return undefined
    const t = Math.min(1, Math.max(0, script.reveal - at))
    const e = 1 - Math.pow(1 - t, 3)
    return { opacity: e, transform: `translateY(${(1 - e) * 14}px)` }
  }
  const answer = script ? script.answer : selected === null ? '' : home.questions[selected].a
  const shown = script ? script.typedA : typed

  // Efeito de escrita da resposta (instantâneo em movimento reduzido).
  useEffect(() => {
    if (selected === null) return
    if (reduced) {
      setTyped(answer.length)
      return
    }
    setTyped(0)
    const id = window.setInterval(() => {
      setTyped((n) => {
        if (n >= answer.length) {
          window.clearInterval(id)
          return n
        }
        return Math.min(answer.length, n + 3)
      })
    }, 16)
    return () => window.clearInterval(id)
  }, [selected, answer, reduced])

  const tab = interactive ? undefined : -1

  return (
    <div className={cn('px-4 pb-6 pt-5 @xl:px-8 @xl:pb-8 @xl:pt-6')}>
      <div className={cn('flex items-start justify-between gap-4')}>
        <div>
          <p className={cn('text-[13px] text-[#0B1030]/75')}>{home.greeting}</p>
          <ViewTitle>Finer Home</ViewTitle>
        </div>
        <div className={cn('text-right')}>
          <p className={cn('text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B1030]/65')}>{home.period}</p>
          <p className={cn('mt-1 inline-flex items-center gap-1.5 text-[14px] font-semibold')}>
            <CalendarDays className={cn('h-4 w-4 text-[#0B1030]/60')} aria-hidden="true" />
            {home.month}
          </p>
        </div>
      </div>

      {/* Pergunte à Finer */}
      {showAsk && (
      <div className={cn('mt-6 rounded-2xl border border-[#0B1030]/[0.07] bg-white p-5 shadow-[0_12px_40px_-24px_rgba(11,16,48,0.35)] @xl:p-7')}>
        <p className={cn('text-center font-display text-[18px] font-bold @xl:text-[22px]')}>
          {home.askTitle[0]}
          <span className={cn('text-accent')}>{home.askTitle[1]}</span>
        </p>
        <div data-demo="ask-input" className={cn('mx-auto mt-5 flex max-w-[640px] items-center gap-2 rounded-full border bg-white py-1.5 pl-5 pr-1.5 shadow-sm', script && script.typedQ > 0 ? 'border-accent/60 shadow-[0_0_0_4px_rgba(0,82,255,0.10)]' : 'border-[#0B1030]/12')}>
          {script ? (
            <span className={cn('min-w-0 flex-1 truncate text-[14px]', script.typedQ > 0 ? 'text-[#0B1030]' : 'text-[#0B1030]/65')}>
              {script.typedQ > 0 ? script.question.slice(0, script.typedQ) : home.placeholder}
              {script.typedQ > 0 && script.typedQ < script.question.length && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-accent" />}
            </span>
          ) : (
          <span className={cn('min-w-0 flex-1 truncate text-[14px]', selected === null ? 'text-[#0B1030]/65' : 'text-[#0B1030]')}>
            {selected === null ? home.placeholder : home.questions[selected].q}
          </span>
          )}
          <span data-demo="ask-send" className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_6px_16px_-6px_rgba(0,82,255,0.9)]')}>
            <ArrowUp className={cn('h-4 w-4')} aria-hidden="true" />
          </span>
        </div>
        <div className={cn('mt-4 flex flex-wrap justify-center gap-2')} role={interactive ? 'group' : undefined} aria-label={interactive ? home.askTitle.join('') : undefined}>
          {home.questions.map((item, i) => (
            <button
              key={item.q}
              type="button"
              tabIndex={tab}
              aria-pressed={selected === i}
              onClick={interactive ? () => setSelected(i) : undefined}
              className={cn(
                'rounded-full border px-3.5 py-2 text-[12.5px] transition-all duration-200',
                selected === i
                  ? 'border-accent bg-accent text-white shadow-[0_8px_20px_-10px_rgba(0,82,255,0.9)]'
                  : 'border-[#0B1030]/15 bg-white text-[#0B1030]/85',
                interactive && selected !== i && 'hover:-translate-y-0.5 hover:border-accent/50 hover:text-[#0B1030]',
              )}
            >
              {item.q}
            </button>
          ))}
        </div>

        <div className={cn('mt-6 border-t border-[#0B1030]/[0.08] pt-4')}>
          {(script ? !scripted : selected === null) ? (
            <>
              <p className={cn('text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#0B1030]/65')}>{home.historyTitle}</p>
              <p className={cn('mt-3 flex items-center gap-3 text-[13px] text-[#0B1030]/75')}>
                <MessageSquare className={cn('h-4 w-4 shrink-0 text-[#0B1030]/50')} aria-hidden="true" />
                {home.historyEmpty}
              </p>
            </>
          ) : (
            <div data-demo="answer" aria-live="polite" className={cn('flex gap-3')}>
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1030] text-white')}>
                <Sparkles className={cn('h-4 w-4')} aria-hidden="true" />
              </span>
              <div className={cn('min-w-0')}>
                <p className={cn('text-[12px] font-semibold text-accent')}>{home.answerBy}</p>
                <p className={cn('mt-1 text-[14px] leading-relaxed text-[#0B1030]')}>
                  <span className={cn('sr-only')}>{answer}</span>
                  <span aria-hidden="true">
                    {answer.slice(0, shown)}
                    {shown < answer.length && <span className={cn('ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-accent')} />}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Brief + indicadores */}
      <div className={cn('mt-5 grid gap-5 @6xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]')}>
        <div data-demo="brief" style={enter(0)} className={cn('rounded-2xl border border-[#0B1030]/[0.07] bg-white p-5 shadow-[0_12px_40px_-24px_rgba(11,16,48,0.35)] @xl:p-7')}>
          <div className={cn('flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B1030]/70')}>
            <span className={cn('inline-flex items-center gap-2')}>
              <span className={cn('h-px w-5 bg-accent')} aria-hidden="true" />
              {home.briefLabel}
            </span>
            <span className={cn('hidden @xl:inline')}>{home.briefDate}</span>
          </div>
          <p className={cn('mt-4 font-display text-[22px] font-bold leading-tight tracking-[-0.01em] @xl:text-[26px]')}>
            {home.briefTitle[0]}
            <span className={cn('block text-accent')}>{home.briefTitle[1]}</span>
          </p>
          <p className={cn('mt-3 text-[14px] leading-relaxed text-[#0B1030]/80')}>
            {home.briefBody[0]}
            <strong className={cn('text-[#0B1030]')}>{home.briefBody[1]}</strong>
            {home.briefBody[2]}
            <strong className={cn('text-[#0B1030]')}>{home.briefBody[3]}</strong>
            {home.briefBody[4]}
          </p>
          <div className={cn('mt-5 flex flex-col gap-4 rounded-xl border border-accent/15 bg-[#EEF3FF] p-4 @xl:flex-row @xl:items-center')}>
            <div className={cn('min-w-0 flex-1')}>
              <p className={cn('inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent')}>
                <span className={cn('h-1.5 w-1.5 rounded-full bg-accent')} aria-hidden="true" />
                {home.priorityLabel}
              </p>
              <p data-demo="priority" className={cn('mt-1.5 text-[14.5px] font-bold')}>{home.priority}</p>
              <p className={cn('mt-1 text-[12px] text-[#0B1030]/70')}>{home.priorityMeta}</p>
            </div>
            <button
              type="button"
              tabIndex={tab}
              onClick={interactive ? onOpenAdvisor : undefined}
              className={cn('inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-accent px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,82,255,0.9)] transition-colors hover:bg-accent-hover')}
            >
              {home.priorityCta}
              <ChevronRight className={cn('h-4 w-4')} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div data-demo="kpis" style={enter(0.4)} className={cn('rounded-2xl border border-[#0B1030]/[0.07] bg-white p-5 shadow-[0_12px_40px_-24px_rgba(11,16,48,0.35)] @xl:p-7')}>
          <div className={cn('flex items-baseline justify-between gap-3')}>
            <p className={cn('text-[16px] font-bold')}>{home.kpiTitle}</p>
            <p className={cn('text-[12px] text-[#0B1030]/65')}>{home.kpiMonth}</p>
          </div>
          <div className={cn('mt-4 grid grid-cols-1 border-t border-[#0B1030]/[0.08] @xl:grid-cols-2')}>
            {home.kpis.map((kpi, i) => (
              <div key={kpi.label} data-demo={`kpi-${i}`} style={enter(0.9 + i * 0.35)} className={cn('py-4 @xl:px-1', i % 2 === 1 && '@xl:border-l @xl:pl-5', i > 1 && '@xl:border-t', i > 0 && 'border-t @xl:border-t-0', i > 1 && '@xl:border-t', 'border-[#0B1030]/[0.08]')}>
                <p className={cn('text-[12.5px] text-[#0B1030]/70')}>{kpi.label}</p>
                <p className={cn('tabular mt-1 text-[20px] font-bold @xl:text-[22px]')}>{kpi.value}</p>
                <p className={cn('mt-1 text-[12px]')}>
                  <span className={cn('font-semibold', kpi.positive ? 'text-emerald-700' : 'text-red-700')}>{kpi.delta}</span>
                  <span className={cn('ml-1.5 text-[#0B1030]/65')}>{home.vs}</span>
                </p>
                <p className={cn('mt-1 text-[11.5px] text-[#0B1030]/65')}>{kpi.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

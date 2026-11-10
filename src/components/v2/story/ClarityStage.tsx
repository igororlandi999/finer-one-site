import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { AVG_DAYS_LATE, CASH_GAP, MAIN_CLIENT_SHARE, MAIN_CLIENT_TOTAL, OVERDUE_COUNT, TOTAL_OVERDUE, eur, pct } from './storyData'

type Step = { n: string; name: string; hint: string; tag: string; summary: string; short: string }

const copy: Record<Lang, { title: [string, string]; sub: string; note: string; window: string; steps: Step[] }> = {
  pt: {
    title: ['Dos números ', 'à decisão.'],
    sub: 'Veja como a Finer One transforma informação financeira em prioridades concretas.',
    note: 'Exemplo com dados fictícios.',
    window: 'Análise · Recebimentos',
    steps: [
      { n: '01', name: 'Compreender', hint: 'O que está a acontecer', tag: 'Indicador', summary: `Faturas por receber · ${eur(TOTAL_OVERDUE)}`, short: eur(TOTAL_OVERDUE) },
      { n: '02', name: 'Antecipar', hint: 'O que merece atenção', tag: 'Descoberta', summary: `Um cliente concentra ${pct(MAIN_CLIENT_SHARE)} do valor`, short: `${pct(MAIN_CLIENT_SHARE)} num cliente` },
      { n: '03', name: 'Decidir', hint: 'O próximo passo', tag: 'Recomendação', summary: 'Contactar o Cliente A', short: 'Contactar o Cliente A' },
    ],
  },
  en: {
    title: ['From numbers ', 'to decisions.'],
    sub: 'See how Finer One turns financial information into concrete priorities.',
    note: 'Example with fictitious data.',
    window: 'Analysis · Receivables',
    steps: [
      { n: '01', name: 'Understand', hint: 'What is happening', tag: 'Indicator', summary: `Invoices receivable · ${eur(TOTAL_OVERDUE, 'en')}`, short: eur(TOTAL_OVERDUE, 'en') },
      { n: '02', name: 'Anticipate', hint: 'What deserves attention', tag: 'Discovery', summary: `One customer holds ${pct(MAIN_CLIENT_SHARE, 'en')} of the amount`, short: `${pct(MAIN_CLIENT_SHARE, 'en')} in one customer` },
      { n: '03', name: 'Decide', hint: 'The next step', tag: 'Recommendation', summary: 'Contact Customer A', short: 'Contact Customer A' },
    ],
  },
}

/**
 * Segunda secção: uma única janela do Finer Advisor com um foco de cada vez.
 * A etapa escolhida (clique/toque/teclado) abre-se em destaque; as outras
 * ficam reduzidas a uma linha. A linha azul percorre a janela do indicador
 * até à recomendação e pára na etapa ativa. Sem scroll preso.
 * Versões anteriores: ?secao=paineis, ?secao=exemplos.
 */
export function ClarityStage() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState(0)
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const on = reduced || inView
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (i + d + 3) % 3
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <section id="problema" aria-labelledby="clareza-titulo" className="relative z-10 -mt-10 scroll-mt-16 pb-4 sm:-mt-14 sm:pb-6">
      <div className="relative rounded-[28px] bg-[linear-gradient(180deg,#FFFFFF_0%,#F5F8FE_100%)] shadow-[0_-30px_80px_-40px_rgba(0,82,255,0.45)] sm:mx-3 sm:rounded-[40px]">
        {/* Orla superior com a linha azul: assinala a passagem da hero para a análise */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-[18%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(30,144,255,0.9),transparent)]" />

        <div ref={ref} className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] gap-10 px-5 py-14 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-center lg:gap-14 lg:px-12 lg:py-20">
          {/* Esquerda: mensagem e escolha da etapa */}
          <div className={cn(on ? 'animate-fade-up' : 'opacity-0')}>
            <h2 id="clareza-titulo" className="font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[44px] lg:text-[50px]">
              {t.title[0]}
              <span className="text-accent">{t.title[1]}</span>
            </h2>
            <p className="mt-4 max-w-[420px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[17.5px]">{t.sub}</p>

            <div role="tablist" aria-orientation="vertical" aria-label={t.title.join('')} className="mt-8 grid gap-2">
              {t.steps.map((s, i) => (
                <button
                  key={s.n}
                  ref={(el) => { tabs.current[i] = el }}
                  type="button"
                  role="tab"
                  id={`etapa-${i}`}
                  aria-selected={active === i}
                  aria-controls="etapa-painel"
                  tabIndex={active === i ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn(
                    'group flex items-center gap-4 rounded-[16px] border px-4 py-3.5 text-left transition-[background-color,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    active === i
                      ? 'border-[#070D2B] bg-[#070D2B] shadow-[0_16px_34px_-20px_rgba(7,13,43,0.9)]'
                      : 'border-[#0B1030]/[0.08] bg-white hover:border-[#0B1030]/20',
                  )}
                >
                  <span className={cn('font-display text-[13px] font-bold tabular-nums', active === i ? 'text-glow' : 'text-accent')}>{s.n}</span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-[17px] font-bold tracking-[-0.01em]', active === i ? 'text-white' : 'text-[#070D2B]')}>{s.name}</span>
                    <span className={cn('block text-[14px]', active === i ? 'text-white/70' : 'text-[#0B1030]/60')}>{s.hint}</span>
                  </span>
                  <ChevronRight className={cn('h-4 w-4 shrink-0 transition-transform duration-300', active === i ? 'translate-x-0.5 text-glow' : 'text-[#0B1030]/30')} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {/* Direita: janela do Finer Advisor */}
          <div className={cn('min-w-0', on ? 'animate-fade-up [animation-delay:120ms]' : 'opacity-0')}>
            <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_40px_90px_-45px_rgba(11,16,48,0.55),0_0_0_1px_rgba(11,16,48,0.07)]">
              <div className="flex h-12 items-center justify-between border-b border-[#0B1030]/[0.07] px-5">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#070D2B]">
                    <svg viewBox="0 0 326 445" className="h-3.5 w-3.5 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
                  </span>
                  <span className="whitespace-nowrap text-[14px] font-bold text-[#070D2B]">Finer Advisor</span>
                  <span className="hidden truncate text-[13.5px] text-[#0B1030]/50 sm:inline">{t.window}</span>
                </span>
                <span className="shrink-0 text-[12px] font-medium text-[#0B1030]/50">{t.note}</span>
              </div>

              <Flow steps={t.steps} active={active} setActive={setActive} on={on} reduced={reduced} lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Fluxo indicador → descoberta → recomendação ---------------- */
function Flow({ steps, active, setActive, on, reduced, lang }: { steps: Step[]; active: number; setActive: (i: number) => void; on: boolean; reduced: boolean; lang: Lang }) {
  // A linha cresce do primeiro nó até ao nó ativo; a cabeça de luz acompanha.
  const rows = useRef<(HTMLDivElement | null)[]>([])
  const box = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<number[]>([0, 0, 0])

  useEffect(() => {
    const measure = () => {
      const top = box.current?.getBoundingClientRect().top ?? 0
      setNodes(rows.current.map((r) => (r ? r.getBoundingClientRect().top - top + 26 : 0)))
    }
    measure()
    // Reavalia depois da transição de abertura/fecho das etapas.
    const id = window.setTimeout(measure, reduced ? 0 : 520)
    window.addEventListener('resize', measure)
    return () => { window.clearTimeout(id); window.removeEventListener('resize', measure) }
  }, [active, reduced, lang])

  const start = nodes[0]
  const end = on ? nodes[active] : start
  const height = Math.max(0, end - start)

  return (
    <div ref={box} id="etapa-painel" role="tabpanel" aria-labelledby={`etapa-${active}`} className="relative px-5 py-5 sm:px-6 sm:py-6">
      {/* Trilho e linha azul */}
      <span aria-hidden="true" className="absolute left-[33px] w-px bg-[#0B1030]/[0.09] sm:left-[37px]" style={{ top: nodes[0], height: Math.max(0, nodes[2] - nodes[0]) }} />
      <span
        aria-hidden="true"
        className="absolute left-[33px] w-px bg-gradient-to-b from-accent to-glow shadow-[0_0_10px_rgba(30,144,255,0.85)] transition-[height] duration-[650ms] ease-[cubic-bezier(0.65,0,0.35,1)] sm:left-[37px]"
        style={{ top: start, height }}
      />
      <span
        aria-hidden="true"
        className="absolute left-[33px] h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(30,144,255,0.35),0_0_14px_4px_rgba(30,144,255,0.75)] transition-[top] duration-[650ms] ease-[cubic-bezier(0.65,0,0.35,1)] sm:left-[37px]"
        style={{ top: end }}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
        {steps.map((s, i) => {
          const open = active === i
          const passed = on && i <= active
          return (
            <div key={s.n} ref={(el) => { rows.current[i] = el }} className={cn('relative rounded-[16px] transition-colors duration-300', open ? 'bg-[#F5F8FE]' : 'hover:bg-[#F8FAFE]')}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 rounded-[16px] py-3.5 pl-11 pr-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:pl-12"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-[8px] top-[26px] h-[11px] w-[11px] -translate-y-1/2 rounded-full border-2 transition-all duration-500"
                  style={{
                    borderColor: passed ? '#0052FF' : 'rgba(11,16,48,0.22)',
                    backgroundColor: passed ? '#0052FF' : '#FFFFFF',
                    boxShadow: passed ? '0 0 0 4px rgba(0,82,255,0.12)' : 'none',
                  }}
                />
                <span className={cn('text-[12px] font-bold uppercase tracking-[0.14em]', open ? 'text-accent' : 'text-[#0B1030]/50')}>{s.tag}</span>
                {!open && <span className="min-w-0 flex-1 truncate text-right text-[14.5px] font-semibold text-[#0B1030]/75"><span className="sm:hidden">{s.short}</span><span className="hidden sm:inline">{s.summary}</span></span>}
              </button>
              <div className={cn('grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                <div className="overflow-hidden" inert={!open}>
                  <div className="pb-5 pl-11 pr-4 sm:pl-12 sm:pr-5">
                    {i === 0 && <Indicator lang={lang} show={open && on} />}
                    {i === 1 && <Discovery lang={lang} show={open && on} />}
                    {i === 2 && <Recommendation lang={lang} show={open && on} />}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const grow = (show: boolean, delay = 0) => ({ transform: `scaleX(${show ? 1 : 0})`, transitionDelay: show ? `${delay}ms` : '0ms' })

function Reveal({ show, delay = 0, children }: { show: boolean; delay?: number; children: ReactNode }) {
  return (
    <div className="transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ opacity: show ? 1 : 0, transform: show ? 'none' : 'translate3d(0,6px,0)', transitionDelay: show ? `${delay}ms` : '0ms' }}>
      {children}
    </div>
  )
}

function Indicator({ lang, show }: { lang: Lang; show: boolean }) {
  const pt = lang === 'pt'
  return (
    <div>
      <p className="text-[15px] font-medium text-[#0B1030]/70">{pt ? 'Faturas por receber' : 'Invoices receivable'}</p>
      <Reveal show={show}>
        <p className="mt-1 font-display text-[40px] font-bold leading-none tracking-[-0.035em] text-[#070D2B] tabular-nums sm:text-[48px]">{eur(TOTAL_OVERDUE, lang)}</p>
      </Reveal>
      <Reveal show={show} delay={150}>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#FFF1E6] px-3 py-1.5 text-[14px] font-semibold text-[#9A3F0A]">{pt ? `${OVERDUE_COUNT} faturas em atraso` : `${OVERDUE_COUNT} overdue invoices`}</span>
          <span className="rounded-full bg-white px-3 py-1.5 text-[14px] font-semibold text-[#0B1030]/75 ring-1 ring-[#0B1030]/[0.08]">{pt ? `${AVG_DAYS_LATE} dias de atraso médio` : `${AVG_DAYS_LATE} days late on average`}</span>
        </div>
      </Reveal>
    </div>
  )
}

function Discovery({ lang, show }: { lang: Lang; show: boolean }) {
  const pt = lang === 'pt'
  return (
    <div>
      <div className="flex items-end gap-4">
        <Reveal show={show}>
          <p className="font-display text-[40px] font-bold leading-none tracking-[-0.035em] text-accent tabular-nums sm:text-[48px]">{pct(MAIN_CLIENT_SHARE, lang)}</p>
        </Reveal>
        <p className="pb-1 text-[15px] leading-snug text-[#070D2B]">{pt ? 'do valor em atraso está num único cliente.' : 'of the overdue amount sits with one customer.'}</p>
      </div>
      <span className="mt-4 block h-[10px] overflow-hidden rounded-full bg-[#0B1030]/[0.08]">
        <span className="block h-full origin-left rounded-full bg-gradient-to-r from-accent to-glow shadow-[0_0_10px_rgba(30,144,255,0.6)] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ width: `${MAIN_CLIENT_SHARE * 100}%`, ...grow(show, 120) }} />
      </span>
      <p className="mt-2 text-[14px] text-[#0B1030]/65">{pt ? 'Cliente A' : 'Customer A'} · {eur(MAIN_CLIENT_TOTAL, lang, 0)} {pt ? 'de' : 'of'} {eur(TOTAL_OVERDUE, lang)}</p>
      <Reveal show={show} delay={350}>
        <p className="mt-4 rounded-[12px] border border-[#D9480F]/20 bg-[#FFF4EC] px-3.5 py-2.5 text-[14.5px] leading-snug text-[#7A2F06]">
          {pt ? 'Sem novas entradas, faltariam ' : 'With no new inflows, you would be short by '}
          <strong className="text-[#C2410C]">{eur(Math.abs(CASH_GAP), lang)}</strong>
          {pt ? ' nos próximos 15 dias.' : ' over the next 15 days.'}
        </p>
      </Reveal>
    </div>
  )
}

function Recommendation({ lang, show }: { lang: Lang; show: boolean }) {
  const pt = lang === 'pt'
  return (
    <Reveal show={show}>
      <div className="rounded-[16px] border border-accent/45 bg-white p-4 shadow-[inset_3px_0_0_#0052FF,0_18px_36px_-22px_rgba(0,82,255,0.7)] sm:p-5">
        <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-[12px] font-semibold text-white">{pt ? 'Prioridade' : 'Priority'}</span>
        <p className="mt-3 text-[19px] font-bold leading-[1.35] tracking-[-0.015em] text-[#070D2B] sm:text-[20px]">
          {pt ? 'Contactar o Cliente A e confirmar uma data de pagamento.' : 'Contact Customer A and confirm a payment date.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#0B1030]/[0.07] pt-3 text-[14px] text-[#0B1030]/70">
          <span>{pt ? 'Valor em causa' : 'Amount at stake'} <strong className="text-[#070D2B] tabular-nums">{eur(MAIN_CLIENT_TOTAL, lang, 0)}</strong></span>
          <span>{pt ? 'Prazo sugerido' : 'Suggested deadline'} <strong className="text-[#070D2B]">{pt ? '15 dias' : '15 days'}</strong></span>
        </div>
      </div>
    </Reveal>
  )
}

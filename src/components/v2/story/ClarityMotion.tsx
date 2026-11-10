import { useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { AVG_DAYS_LATE, CASH_GAP, MAIN_CLIENT_SHARE, MAIN_CLIENT_TOTAL, OVERDUE_COUNT, TOTAL_OVERDUE, eur, pct } from './storyData'

type Step = { n: string; name: string; hint: string; tag: string }

const copy: Record<Lang, { title: [string, string]; sub: string; note: string; window: string; focus: string; steps: Step[] }> = {
  pt: {
    title: ['Dos números ', 'à decisão.'],
    sub: 'Veja como a Finer One transforma informação financeira em prioridades concretas.',
    note: 'Exemplo com dados fictícios.',
    window: 'Análise · Recebimentos',
    focus: 'Em foco',
    steps: [
      { n: '01', name: 'Compreender', hint: 'O que está a acontecer', tag: 'Indicador' },
      { n: '02', name: 'Antecipar', hint: 'O que merece atenção', tag: 'Descoberta' },
      { n: '03', name: 'Decidir', hint: 'O próximo passo', tag: 'Recomendação' },
    ],
  },
  en: {
    title: ['From numbers ', 'to decisions.'],
    sub: 'See how Finer One turns financial information into concrete priorities.',
    note: 'Example with fictitious data.',
    window: 'Analysis · Receivables',
    focus: 'In focus',
    steps: [
      { n: '01', name: 'Understand', hint: 'What is happening', tag: 'Indicator' },
      { n: '02', name: 'Anticipate', hint: 'What deserves attention', tag: 'Discovery' },
      { n: '03', name: 'Decide', hint: 'The next step', tag: 'Recommendation' },
    ],
  },
}

const EASE = [0.22, 1, 0.36, 1] as const

/** Versão anterior dos fundos (contentor arredondado sobre navy) em ?fundo=antigo. */
const OLD_BG = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('fundo') === 'antigo'

/**
 * Segunda secção com Motion (motion.dev):
 * 1) revelação da janela por máscara (clip-path) ao entrar no ecrã, uma vez;
 * 2) shared layout: o indicador da etapa ativa desloca-se (layoutId) e o
 *    conteúdo troca com AnimatePresence, em painel de altura estável;
 * 3) destaque do elemento financeiro relevante em cada etapa;
 * 4) "number trend": o indicador em foco troca por deslizamento de carateres,
 *    sem valores intermédios;
 * 5) linha Finer One desenhada (pathLength) a ligar as três etapas.
 * Versão anterior em ?secao=etapas.
 */
export function ClarityMotion() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = useReducedMotion() ?? false
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.3 })
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (i + d + 3) % 3
    setActive(next)
    tabs.current[next]?.focus()
  }

  const focusValue = [eur(TOTAL_OVERDUE, lang), pct(MAIN_CLIENT_SHARE, lang), eur(MAIN_CLIENT_TOTAL, lang, 0)][active]
  const focusLabel = lang === 'pt'
    ? ['por receber', 'num único cliente', 'valor em causa'][active]
    : ['receivable', 'in one customer', 'amount at stake'][active]

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease: EASE }}>
      <section id="problema" aria-labelledby="clareza-titulo" className={OLD_BG ? 'relative z-10 -mt-4 scroll-mt-16 pb-4 sm:-mt-6 sm:pb-6' : 'relative z-10 -mt-4 scroll-mt-16 bg-white sm:-mt-6'}>
        <div className={OLD_BG ? 'relative rounded-[28px] bg-[linear-gradient(180deg,#FFFFFF_0%,#F5F8FE_100%)] shadow-[0_-30px_80px_-40px_rgba(0,82,255,0.45)] sm:mx-3 sm:rounded-[40px]' : 'relative bg-white shadow-[0_-30px_80px_-40px_rgba(0,82,255,0.45)]'}>
          <span id="demo" aria-hidden="true" className="absolute -top-20" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-[18%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(30,144,255,0.9),transparent)]" />

          <div ref={sectionRef} className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] gap-9 px-5 py-14 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-center lg:gap-14 lg:px-12 lg:py-20">
            {/* Esquerda: título, subtítulo e navegação pelas etapas */}
            <div>
              <motion.h2
                id="clareza-titulo"
                initial={{ opacity: 0, y: 14 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.6, ease: EASE }}
                className="font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[44px] lg:text-[50px]"
              >
                {t.title[0]}
                <span className="text-accent">{t.title[1]}</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
                className="mt-4 max-w-[420px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[17.5px]"
              >
                {t.sub}
              </motion.p>

              <div role="tablist" aria-orientation="vertical" aria-label={t.title.join('')} className="mt-7 grid grid-cols-3 gap-1.5 lg:mt-8 lg:grid-cols-1 lg:gap-2">
                {t.steps.map((s, i) => {
                  const on = active === i
                  return (
                    <button
                      key={s.n}
                      ref={(el) => { tabs.current[i] = el }}
                      type="button"
                      role="tab"
                      id={`etapa-${i}`}
                      aria-selected={on}
                      aria-controls="etapa-painel"
                      tabIndex={on ? 0 : -1}
                      onClick={() => setActive(i)}
                      onKeyDown={(e) => onKey(e, i)}
                      className={cn(
                        'group relative flex min-h-[52px] items-center justify-center gap-3 rounded-[14px] border px-2 py-2.5 text-center transition-[border-color,background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:justify-start lg:px-4 lg:py-3.5 lg:text-left',
                        on ? 'border-transparent' : 'border-[#0B1030]/[0.1] bg-white hover:border-accent/45 hover:bg-[#F7F9FE] hover:shadow-[0_10px_24px_-18px_rgba(0,82,255,0.6)]',
                      )}
                    >
                      {/* Indicador ativo partilhado: desloca-se entre etapas */}
                      {on && (
                        <motion.span
                          layoutId="etapa-ativa"
                          transition={{ duration: 0.3, ease: EASE }}
                          className="absolute inset-0 rounded-[14px] bg-[#070D2B] shadow-[0_14px_30px_-18px_rgba(7,13,43,0.9)]"
                        />
                      )}
                      <span className={cn('relative hidden font-display text-[13px] font-bold tabular-nums transition-colors duration-300 lg:inline', on ? 'text-glow' : 'text-accent')}>{s.n}</span>
                      <span className="relative min-w-0">
                        <span className={cn('block text-[13.5px] font-bold leading-tight tracking-[-0.01em] transition-colors duration-300 sm:text-[15px] lg:text-[17px]', on ? 'text-white' : 'text-[#070D2B]')}>{s.name}</span>
                        <span className={cn('hidden text-[14px] transition-colors duration-300 lg:block', on ? 'text-white/70' : 'text-[#0B1030]/60')}>{s.hint}</span>
                      </span>
                      {/* Seta: sinaliza que a etapa se pode abrir */}
                      <svg viewBox="0 0 16 16" aria-hidden="true" className={cn('relative ml-auto hidden h-4 w-4 shrink-0 transition-[transform,color] duration-300 lg:block', on ? 'translate-x-0.5 text-glow' : 'text-[#0B1030]/30 group-hover:translate-x-0.5 group-hover:text-accent')}>
                        <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Direita: janela do Finer Advisor, revelada por máscara ao entrar no ecrã */}
            <motion.div
              className="min-w-0"
              initial={reduced ? false : { clipPath: 'inset(10% 6% 14% 6% round 28px)', opacity: 0, y: 18 }}
              animate={inView ? { clipPath: 'inset(0% 0% 0% 0% round 22px)', opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.85, ease: EASE, delay: 0.12 }}
            >
              <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_40px_90px_-45px_rgba(11,16,48,0.55),0_0_0_1px_rgba(11,16,48,0.07)]">
                {/* Barra da janela + indicador em foco (troca de valor sem contagem) */}
                <div className="flex h-12 items-center justify-between gap-3 border-b border-[#0B1030]/[0.07] px-5">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#070D2B]">
                      <svg viewBox="0 0 326 445" className="h-3.5 w-3.5 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
                    </span>
                    <span className="whitespace-nowrap text-[14px] font-bold text-[#070D2B]">Finer Advisor</span>
                    <span className="hidden whitespace-nowrap text-[13.5px] text-[#0B1030]/50 md:inline">{t.window}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-2" aria-live="polite">
                    <span className="sr-only">{t.focus}</span>
                    <RollingValue value={focusValue} />
                    <span className="hidden text-[12.5px] text-[#0B1030]/55 sm:inline">{focusLabel}</span>
                  </span>
                </div>

                <StepLine steps={t.steps} active={active} setActive={setActive} draw={inView} />

                {/* Conteúdo da etapa: altura estável, troca com AnimatePresence */}
                <div id="etapa-painel" role="tabpanel" aria-labelledby={`etapa-${active}`} className="relative min-h-[318px] px-5 pb-5 pt-2 sm:min-h-[236px] sm:px-7">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.32, ease: EASE }}
                    >
                      {active === 0 && <Understand lang={lang} />}
                      {active === 1 && <Anticipate lang={lang} />}
                      {active === 2 && <Decide lang={lang} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <p className="border-t border-[#0B1030]/[0.06] px-5 py-2.5 text-[12px] text-[#0B1030]/50 sm:px-7">{t.note}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}

/* ---------------- Linha Finer One a ligar as três etapas ---------------- */
function StepLine({ steps, active, setActive, draw }: { steps: Step[]; active: number; setActive: (i: number) => void; draw: boolean }) {
  // A linha vai do centro da 1.ª coluna (1/6) ao centro da 3.ª (5/6): contínua,
  // desenhada da esquerda para a direita na entrada e preenchida até à etapa ativa.
  return (
    <div className="relative px-5 pb-1 pt-5 sm:px-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 top-[25.5px] h-[2px] sm:inset-x-7">
        <div className="absolute left-[16.667%] right-[16.667%] top-0 h-full">
          <motion.div
            className="absolute inset-0 origin-left rounded-full bg-[#0B1030]/[0.1]"
            initial={{ scaleX: 0 }} animate={{ scaleX: draw ? 1 : 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          />
          <motion.div
            className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-accent to-glow shadow-[0_0_8px_rgba(30,144,255,0.8)]"
            initial={{ scaleX: 0 }} animate={{ scaleX: draw ? active / 2 : 0 }} transition={{ duration: 0.45, ease: EASE }}
          />
        </div>
      </div>
      <div className="relative grid grid-cols-3">
        {steps.map((s, i) => {
          const lit = draw && i <= active
          return (
            <button
              key={s.n}
              type="button"
              tabIndex={-1}
              onClick={() => setActive(i)}
              className="flex flex-col items-center gap-2 focus:outline-none"
            >
              <motion.span
                className="relative block h-[13px] w-[13px] rounded-full border-2"
                animate={{
                  borderColor: lit ? '#0052FF' : 'rgba(11,16,48,0.22)',
                  backgroundColor: i === active && draw ? '#0052FF' : '#FFFFFF',
                  scale: i === active && draw ? 1.15 : 1,
                  boxShadow: i === active && draw ? '0 0 0 5px rgba(0,82,255,0.14), 0 0 14px rgba(30,144,255,0.7)' : '0 0 0 0 rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.3, ease: EASE, delay: draw && i > 0 ? 0 : 0 }}
              />
              <span className={cn('text-[9.5px] font-bold uppercase tracking-[0.06em] transition-colors duration-300 sm:text-[11.5px] sm:tracking-[0.13em]', i === active ? 'text-accent' : 'text-[#0B1030]/45')}>{s.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- "Number trend": troca de valor por deslizamento ---------------- */
function RollingValue({ value }: { value: string }) {
  // Cada carater desliza de baixo para cima; nunca mostra valores intermédios.
  return (
    <span className="relative inline-flex min-w-[96px] justify-end overflow-hidden font-display text-[16px] font-bold tabular-nums tracking-[-0.01em] text-accent sm:min-w-[110px] sm:text-[17px]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="whitespace-nowrap"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* ---------------- Conteúdos das etapas (mesmo cenário) ---------------- */

/** Destaque do elemento financeiro relevante (princípio do "scroll highlight"). */
function Highlight({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn('rounded-[16px]', className)}
      initial={{ backgroundColor: 'rgba(238,243,255,0)', boxShadow: 'inset 0 0 0 1px rgba(0,82,255,0)' }}
      animate={{ backgroundColor: 'rgba(238,243,255,1)', boxShadow: 'inset 0 0 0 1px rgba(0,82,255,0.22)' }}
      transition={{ duration: 0.45, ease: EASE, delay: 0.15 }}
    >
      {children}
    </motion.div>
  )
}

function Understand({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  return (
    <div>
      <div className="sm:flex sm:items-end sm:justify-between sm:gap-4">
      <Highlight className="-mx-3 px-3 py-3">
        <p className="text-[15px] font-medium text-[#0B1030]/70">{pt ? 'Faturas por receber' : 'Invoices receivable'}</p>
        <p className="mt-1 font-display text-[40px] font-bold leading-none tracking-[-0.035em] text-[#070D2B] tabular-nums sm:text-[44px]">{eur(TOTAL_OVERDUE, lang)}</p>
      </Highlight>
      <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:flex-col sm:items-end sm:pb-3">
        <span className="rounded-full bg-[#FFF1E6] px-3 py-1.5 text-[14px] font-semibold text-[#9A3F0A]">{pt ? `${OVERDUE_COUNT} faturas em atraso` : `${OVERDUE_COUNT} overdue invoices`}</span>
        <span className="rounded-full bg-white px-3 py-1.5 text-[14px] font-semibold text-[#0B1030]/75 ring-1 ring-[#0B1030]/[0.08]">{pt ? `${AVG_DAYS_LATE} dias de atraso médio` : `${AVG_DAYS_LATE} days late on average`}</span>
      </div>
      </div>
      {/* Repartição por cliente: explica o número e prepara a descoberta seguinte */}
      <div className="mt-5 grid gap-2">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#0B1030]/50">{pt ? 'Valor em atraso por cliente' : 'Overdue amount by customer'}</p>
        {[
          { l: pt ? 'Cliente A' : 'Customer A', v: MAIN_CLIENT_TOTAL },
          { l: pt ? `Outros ${OVERDUE_COUNT - 3} clientes` : `Other ${OVERDUE_COUNT - 3} customers`, v: TOTAL_OVERDUE - MAIN_CLIENT_TOTAL },
        ].map((r, k) => (
          <div key={r.l} className="grid grid-cols-[minmax(0,132px)_minmax(0,1fr)_auto] items-center gap-2.5 sm:gap-3 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)_auto]">
            <span className="truncate text-[14px] text-[#0B1030]/75">{r.l}</span>
            <span className="h-[8px] overflow-hidden rounded-full bg-[#0B1030]/[0.07]">
              <motion.span
                className="block h-full origin-left rounded-full bg-[#070D2B]/70"
                style={{ width: `${(r.v / TOTAL_OVERDUE) * 100}%` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.2 + k * 0.08 }}
              />
            </span>
            <span className="text-[14px] font-semibold text-[#070D2B] tabular-nums">{eur(r.v, lang)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Anticipate({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  return (
    <div>
      <Highlight className="-mx-3 px-3 py-3">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
          <p className="font-display text-[40px] font-bold leading-none tracking-[-0.035em] text-accent tabular-nums sm:text-[48px]">{pct(MAIN_CLIENT_SHARE, lang)}</p>
          <p className="pb-1 text-[15px] leading-snug text-[#070D2B]">{pt ? 'do valor em atraso está num único cliente.' : 'of the overdue amount sits with one customer.'}</p>
        </div>
        <span className="mt-4 block h-[10px] overflow-hidden rounded-full bg-[#0B1030]/[0.08]">
          <motion.span
            className="block h-full origin-left rounded-full bg-gradient-to-r from-accent to-glow"
            style={{ width: `${MAIN_CLIENT_SHARE * 100}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          />
        </span>
        <p className="mt-2 text-[14px] text-[#0B1030]/65">{pt ? 'Cliente A' : 'Customer A'} · {eur(MAIN_CLIENT_TOTAL, lang, 0)} {pt ? 'de' : 'of'} {eur(TOTAL_OVERDUE, lang)}</p>
      </Highlight>
      <p className="mt-4 rounded-[12px] border border-[#D9480F]/20 bg-[#FFF4EC] px-3.5 py-2.5 text-[14.5px] leading-snug text-[#7A2F06]">
        {pt ? 'Sem novas entradas, faltariam ' : 'With no new inflows, you would be short by '}
        <strong className="text-[#C2410C]">{eur(Math.abs(CASH_GAP), lang)}</strong>
        {pt ? ' nos próximos 15 dias.' : ' over the next 15 days.'}
      </p>
    </div>
  )
}

function Decide({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  return (
    <Highlight className="border border-accent/30 p-4 shadow-[inset_3px_0_0_#0052FF] sm:p-5">
      <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-[12px] font-semibold text-white">{pt ? 'Prioridade' : 'Priority'}</span>
      <p className="mt-3 text-[19px] font-bold leading-[1.35] tracking-[-0.015em] text-[#070D2B] sm:text-[21px]">
        {pt ? 'Contactar o Cliente A e confirmar uma data de pagamento.' : 'Contact Customer A and confirm a payment date.'}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#0B1030]/[0.07] pt-3 text-[14px] text-[#0B1030]/70">
        <span>{pt ? 'Valor em causa' : 'Amount at stake'} <strong className="text-[#070D2B] tabular-nums">{eur(MAIN_CLIENT_TOTAL, lang, 0)}</strong></span>
        <span>{pt ? 'Prazo sugerido' : 'Suggested deadline'} <strong className="text-[#070D2B]">{pt ? '15 dias' : '15 days'}</strong></span>
      </div>
    </Highlight>
  )
}

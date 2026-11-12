import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { AnimatePresence, MotionConfig, animate, motion, useInView, useMotionValue, useReducedMotion } from 'motion/react'
import type { MotionValue, Variants } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
/** Cada momento fica 7 s no ecrã; depois avança e, no fim, recomeça. */
const STEP_MS = 7000

const copy: Record<Lang, {
  eyebrow: string; title: [string, string]; sub: string; nav: string; note: string
  steps: { title: string; desc: string }[]
  bank: string; mail: string; tokenBank: string; tokenMail: string
  summaryTitle: string; arrived: string; summary: { label: string; source: string; value: string; positive?: boolean }[]
}> = {
  pt: {
    eyebrow: 'Como funciona',
    title: ['A informação já existe. ', 'Falta reuni-la.'],
    sub: 'Ligue as fontes suportadas e acompanhe os dados da empresa sem andar de ferramenta em ferramenta.',
    nav: 'Passos para começar',
    note: 'Demonstração ilustrativa · dados fictícios',
    steps: [
      { title: 'Ligue as suas contas.', desc: 'Reúna os movimentos das contas bancárias suportadas.' },
      { title: 'Envie as suas faturas.', desc: 'Reúna documentos através do email de faturas da Finer One.' },
      { title: 'Tudo mais claro, num só lugar.', desc: 'Consulte a informação disponível e explore as análises.' },
    ],
    bank: 'Conta bancária',
    mail: 'Email de faturas',
    tokenBank: '+ € 3.150,00 · Transferência',
    tokenMail: 'FT 2026/207 · € 2.460,00',
    summaryTitle: 'Num só lugar',
    arrived: 'Acabou de chegar',
    summary: [
      { label: 'Transferência · Cliente E', source: 'Banco', value: '+ € 3.150,00', positive: true },
      { label: 'FT 2026/207 · Fornecedor H', source: 'Fatura', value: '€ 2.460,00' },
      { label: 'Débito direto · Energia', source: 'Banco', value: '− € 412,30' },
    ],
  },
  en: {
    eyebrow: 'How it works',
    title: ['The information already exists. ', 'It just needs bringing together.'],
    sub: 'Connect supported sources and follow your company data without jumping between tools.',
    nav: 'Steps to get started',
    note: 'Illustrative demo · fictitious data',
    steps: [
      { title: 'Connect your accounts.', desc: 'Bring together transactions from supported bank accounts.' },
      { title: 'Send your invoices.', desc: 'Bring documents in through the Finer One invoice email.' },
      { title: 'Everything clearer, in one place.', desc: 'See the available information and explore the analyses.' },
    ],
    bank: 'Bank account',
    mail: 'Invoice email',
    tokenBank: '+ €3,150.00 · Transfer',
    tokenMail: 'FT 2026/207 · €2,460.00',
    summaryTitle: 'In one place',
    arrived: 'Just arrived',
    summary: [
      { label: 'Transfer · Customer E', source: 'Bank', value: '+ €3,150.00', positive: true },
      { label: 'FT 2026/207 · Supplier H', source: 'Invoice', value: '€2,460.00' },
      { label: 'Direct debit · Energy', source: 'Bank', value: '− €412.30' },
    ],
  },
}

/* Palco em coordenadas fixas (escala com a largura). Duas fontes convergem na Finer One. */
const VB_W = 640
const VB_H = 410
const HUB = { x: 400, y: 150 }
const SRC = { bank: 52, mail: 252 }
const PATHS = {
  bank: `M 40 ${SRC.bank} C 190 ${SRC.bank}, 250 ${HUB.y - 20}, ${HUB.x - 34} ${HUB.y - 6}`,
  mail: `M 40 ${SRC.mail} C 190 ${SRC.mail}, 250 ${HUB.y + 24}, ${HUB.x - 34} ${HUB.y + 6}`,
}
const pct = (v: number, total: number) => `${(v / total) * 100}%`

/** Amostra pontos ao longo de um caminho SVG (para a "peça" de informação o percorrer). */
function samplePath(d: string, n = 24) {
  if (typeof document === 'undefined') return { left: [] as string[], top: [] as string[] }
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  p.setAttribute('d', d)
  const len = p.getTotalLength()
  const left: string[] = []
  const top: string[] = []
  for (let i = 0; i <= n; i++) {
    const pt = p.getPointAtLength((len * i) / n)
    left.push(pct(pt.x, VB_W))
    top.push(pct(pt.y, VB_H))
  }
  return { left, top }
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }

/**
 * Secção 4 — Como funciona, "a convergência". Sem ecrãs de software: duas fontes
 * (conta bancária e email de faturas) ligadas por linhas de luz à Finer One.
 * Em cada momento a linha ativa acende e uma peça de informação percorre-a;
 * no terceiro, tudo fica reunido. Avança sozinho a cada 7 s e recomeça; o
 * visitante pode escolher um momento (a reprodução continua a partir daí).
 * Pausa fora do ecrã; sem reprodução automática com movimento reduzido.
 * Versão anterior em ?funcionamento=v6.
 */
export function HowItWorksFlow() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = useReducedMotion() ?? false
  const [step, setStep] = useState(0)
  const [token, setToken] = useState(0)
  const progress = useMotionValue(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const visible = useInView(stageRef, { amount: 0.4 })
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const running = visible && !reduced

  // Um único motor: anima o progresso do momento; ao terminar, avança (e volta ao início no fim).
  useEffect(() => {
    if (!running) return
    const remaining = (STEP_MS / 1000) * (1 - progress.get())
    const controls = animate(progress, 1, {
      duration: Math.max(0.05, remaining),
      ease: 'linear',
      onComplete: () => {
        progress.set(0)
        setStep((s) => (s + 1) % 3)
      },
    })
    return () => controls.stop()
  }, [running, step, token, progress])

  const choose = (i: number) => {
    progress.set(0)
    setStep(i)
    setToken((n) => n + 1)
  }
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = ['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(e.key) ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (i + d + 3) % 3
    choose(next)
    tabs.current[next]?.focus()
  }

  return (
    <MotionConfig reducedMotion="user">
      <section id="funcionamento" aria-labelledby="funcionamento-titulo" className="relative scroll-mt-20 bg-white text-navy">
        <motion.div className="mx-auto max-w-content px-5 py-14 sm:px-6 lg:px-8 lg:py-20" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          <div className="mx-auto max-w-[820px] text-center">
            <motion.p variants={item} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{t.eyebrow}</motion.p>
            <motion.h2 variants={item} id="funcionamento-titulo" className="mt-3 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[48px] lg:text-[58px]">
              {t.title[0]}
              <span className="text-accent-deep">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={item} className="mx-auto mt-5 max-w-[600px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          <motion.div variants={item} className="mt-10 grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:mt-14 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-12">
            {/* Momentos editoriais com progresso de 7 s */}
            <div role="tablist" aria-label={t.nav} aria-orientation="vertical" className="order-2 lg:order-1">
              {t.steps.map((s, i) => {
                const on = step === i
                return (
                  <button
                    key={s.title}
                    ref={(el) => { tabs.current[i] = el }}
                    type="button"
                    role="tab"
                    id={`flow-tab-${i}`}
                    aria-selected={on}
                    aria-controls="flow-stage"
                    tabIndex={on ? 0 : -1}
                    onClick={() => choose(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className="group relative block w-full border-t border-[#0B1030]/10 py-5 text-left first:border-t-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 lg:py-6"
                  >
                    {/* Linha de progresso (azul elétrico, a assinatura) */}
                    <span aria-hidden="true" className="absolute inset-x-0 -top-px h-[2px] overflow-hidden">
                      {on && <Progress value={progress} reduced={reduced} />}
                    </span>
                    <span className="flex items-baseline gap-4">
                      <span className={cn('font-display text-[15px] font-bold tabular-nums transition-colors duration-300', on ? 'text-accent-deep' : 'text-[#0B1030]/30 group-hover:text-[#0B1030]/50')}>0{i + 1}</span>
                      <span className="min-w-0">
                        <span data-sweep className={cn('block font-display text-[21px] font-bold leading-snug tracking-[-0.02em] transition-colors duration-300 sm:text-[24px]', on ? 'text-[#070D2B]' : 'text-[#0B1030]/40 group-hover:text-[#0B1030]/65')}>{s.title}</span>
                        <AnimatePresence initial={false}>
                          {on && (
                            <motion.span className="block overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                              <span className="block pt-2 text-[15.5px] leading-[1.6] text-[#0B1030]/70">{s.desc}</span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Palco da convergência */}
            <div className="order-1 min-w-0 lg:order-2">
              <div ref={stageRef} id="flow-stage" role="tabpanel" aria-labelledby={`flow-tab-${step}`} className="relative" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
                <Stage step={step} token={token} t={t} reduced={reduced} />
              </div>
              <div className="mt-4 min-h-[150px] sm:hidden"><Ledger step={step} k={`${step}-${token}`} t={t} reduced={reduced} /></div>
              <p className="mt-2 text-center text-[12px] text-[#0B1030]/45">{t.note}</p>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

function Progress({ value, reduced }: { value: MotionValue<number>; reduced: boolean }) {
  return <motion.span className="block h-full origin-left bg-accent shadow-[0_0_8px_rgba(30,144,255,0.9)]" style={{ scaleX: reduced ? 1 : value }} />
}

type Copy = (typeof copy)['pt']

function Stage({ step, token, t, reduced }: { step: number; token: number; t: Copy; reduced: boolean }) {
  const bankPts = useMemo(() => samplePath(PATHS.bank), [])
  const mailPts = useMemo(() => samplePath(PATHS.mail), [])
  const bankOn = step === 0 || step === 2
  const mailOn = step === 1 || step === 2
  const k = `${step}-${token}`

  return (
    <>
      {/* Um só momento de atmosfera: luz azul suave por trás da Finer One */}
      <div aria-hidden="true" className="pointer-events-none absolute rounded-full bg-[radial-gradient(closest-side,rgba(30,144,255,0.18),rgba(141,184,246,0.08)_55%,transparent)]" style={{ left: pct(HUB.x - 230, VB_W), top: pct(HUB.y - 200, VB_H), width: pct(460, VB_W), height: pct(400, VB_H) }} />

      <svg aria-hidden="true" viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full overflow-visible">
        {(['bank', 'mail'] as const).map((key) => {
          const on = key === 'bank' ? bankOn : mailOn
          return (
            <g key={key}>
              <path d={PATHS[key]} fill="none" stroke="rgba(11,16,48,0.1)" strokeWidth="1.5" />
              {on && (
                <>
                  <motion.path key={`g-${k}`} d={PATHS[key]} fill="none" stroke="rgba(30,144,255,0.22)" strokeWidth="9" strokeLinecap="round" initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: EASE }} />
                  <motion.path key={`l-${k}`} d={PATHS[key]} fill="none" stroke="#0052FF" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: EASE }} />
                </>
              )}
            </g>
          )
        })}
      </svg>

      {/* Fontes */}
      <Source label={t.bank} x={40} y={SRC.bank} on={bankOn} icon="bank" />
      <Source label={t.mail} x={40} y={SRC.mail} on={mailOn} icon="mail" />

      {/* Peça de informação que percorre a linha ativa (momentos 1 e 2) */}
      <AnimatePresence>
        {step < 2 && (
          <motion.span
            key={`tok-${k}`}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-[#070D2B] shadow-[0_10px_30px_-12px_rgba(7,13,43,0.45)] ring-1 ring-[#0B1030]/10 sm:text-[13.5px]"
            initial={{ left: (step === 0 ? bankPts : mailPts).left[5], top: (step === 0 ? bankPts : mailPts).top[5], opacity: 0 }}
            animate={reduced
              ? { left: (step === 0 ? bankPts : mailPts).left[(step === 0 ? bankPts : mailPts).left.length - 1], top: (step === 0 ? bankPts : mailPts).top[(step === 0 ? bankPts : mailPts).top.length - 1], opacity: 1 }
              : { left: (step === 0 ? bankPts : mailPts).left.slice(5), top: (step === 0 ? bankPts : mailPts).top.slice(5), opacity: [0, 1, 1, 1, 0.0] }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 2.4, ease: [0.45, 0, 0.25, 1], delay: 0.5, opacity: { duration: 2.4, times: [0, 0.12, 0.6, 0.92, 1], delay: 0.5 } }}
          >
            <span className={cn('mr-1.5 inline-block h-1.5 w-1.5 -translate-y-px rounded-full', step === 0 ? 'bg-[#16A34A]' : 'bg-accent')} />
            {step === 0 ? t.tokenBank : t.tokenMail}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Finer One: o ponto onde tudo se junta */}
      <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: pct(HUB.x, VB_W), top: pct(HUB.y, VB_H) }}>
        {!reduced && (
          <motion.span
            key={`pulse-${k}`}
            aria-hidden="true"
            className="absolute inset-0 rounded-full ring-2 ring-accent/60"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: step < 2 ? 2.7 : 1.1 }}
          />
        )}
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#070D2B] shadow-[0_0_0_8px_rgba(255,255,255,0.9),0_18px_40px_-12px_rgba(7,13,43,0.6),0_0_40px_rgba(30,144,255,0.35)] sm:h-20 sm:w-20">
          <svg viewBox="0 0 326 445" className="h-6 w-5 fill-white sm:h-7 sm:w-6" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
        </span>
        <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.22em] text-[#070D2B]">Finer One</span>
      </div>

      {/* Registo tipográfico (sem moldura de software), sobre o palco a partir de sm */}
      <div className="absolute z-10 hidden sm:block" style={{ left: pct(232, VB_W), top: pct(270, VB_H), width: pct(400, VB_W) }}>
        <Ledger step={step} k={k} t={t} reduced={reduced} />
      </div>
    </>
  )
}

function Source({ label, x, y, on, icon }: { label: string; x: number; y: number; on: boolean; icon: 'bank' | 'mail' }) {
  return (
    <div className="absolute z-10 -translate-y-1/2" style={{ left: pct(x - 22, VB_W), top: pct(y, VB_H) }}>
      <span className={cn('flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 transition-all duration-500', on ? 'bg-white shadow-[0_12px_30px_-14px_rgba(0,82,255,0.6)] ring-1 ring-accent/30' : 'bg-white/70 ring-1 ring-[#0B1030]/10')}>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-500', on ? 'bg-accent-deep text-white' : 'bg-[#EEF3FF] text-[#0B1030]/50')}>
          {icon === 'bank' ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10h18M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18M12 3l9 5H3z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
          )}
        </span>
        <span className={cn('whitespace-nowrap text-[12.5px] font-semibold transition-colors duration-500 sm:text-[14px]', on ? 'text-[#070D2B]' : 'text-[#0B1030]/50')}>{label}</span>
      </span>
    </div>
  )
}

/** Nos momentos 1 e 2 mostra o que acabou de chegar; no 3, tudo reunido. */
export function Ledger({ step, k, t, reduced }: { step: number; k: string; t: Copy; reduced: boolean }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`sum-${k}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay: reduced ? 0 : step < 2 ? 2.6 : 1.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-deep">{step < 2 ? t.arrived : t.summaryTitle}</p>
        <ul className="mt-1.5 divide-y divide-[#0B1030]/[0.08]">
          {t.summary.filter((_, i) => step === 2 || i === step).map((r, i) => (
            <motion.li key={r.label} className="flex items-baseline justify-between gap-3 py-1.5 text-[14px]" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: EASE, delay: reduced ? 0 : (step < 2 ? 2.75 : 1.4) + i * 0.12 }}>
              <span className="min-w-0 text-[#070D2B]">
                {r.label} <span className="ml-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1030]/45">{r.source}</span>
              </span>
              <span className={cn('shrink-0 font-semibold tabular-nums', r.positive ? 'text-[#0B6B40]' : 'text-[#070D2B]')}>{r.value}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </AnimatePresence>
  )
}

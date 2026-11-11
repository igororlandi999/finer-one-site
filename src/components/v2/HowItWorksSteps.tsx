import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { AnimatePresence, MotionConfig, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
/** Cada momento fica 7 s; depois avança e, no fim, recomeça. */
const STEP_MS = 7000

const copy: Record<Lang, {
  eyebrow: string; title: [string, string]; sub: string; nav: string; note: string
  steps: { title: string; desc: string; tag: string }[]
}> = {
  pt: {
    eyebrow: 'Como funciona',
    title: ['A informação já existe. ', 'Falta reuni-la.'],
    sub: 'Ligue as fontes suportadas e acompanhe os dados da empresa sem andar de ferramenta em ferramenta.',
    nav: 'Passos para começar',
    note: 'Demonstração ilustrativa · dados fictícios',
    steps: [
      { title: 'Ligue as suas contas.', desc: 'Reúna os movimentos das contas bancárias suportadas.', tag: 'Contas bancárias' },
      { title: 'Envie as suas faturas.', desc: 'Reúna documentos através do email de faturas da Finer One.', tag: 'Faturas' },
      { title: 'Tudo mais claro, num só lugar.', desc: 'Consulte a informação disponível e explore as análises.', tag: 'Num só lugar' },
    ],
  },
  en: {
    eyebrow: 'How it works',
    title: ['The information already exists. ', 'It just needs bringing together.'],
    sub: 'Connect supported sources and follow your company data without jumping between tools.',
    nav: 'Steps to get started',
    note: 'Illustrative demo · fictitious data',
    steps: [
      { title: 'Connect your accounts.', desc: 'Bring together transactions from supported bank accounts.', tag: 'Bank accounts' },
      { title: 'Send your invoices.', desc: 'Bring documents in through the Finer One invoice email.', tag: 'Invoices' },
      { title: 'Everything clearer, in one place.', desc: 'See the available information and explore the analyses.', tag: 'One place' },
    ],
  },
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }

/**
 * Secção 4 — Como funciona (nova homepage, fase 4). Três momentos escolhidos
 * pelo visitante, ligados pela linha Finer One que avança até ao momento ativo.
 * Avança sozinho a cada 7 s e recomeça (clique opcional; pausa fora do ecrã). Reutiliza as peças de interface da versão anterior
 * (HowItWorksDemo, em ?funcionamento=v5).
 */
export function HowItWorksSteps() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = useReducedMotion() ?? false
  const [step, setStep] = useState(0)
  const [token, setToken] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const zone = useRef<HTMLDivElement>(null)
  const visible = useInView(zone, { amount: 0.35 })
  const progress = useMotionValue(0)
  // A linha dos passos enche-se com o tempo: do ponto ativo até ao seguinte.
  const fill = useMotionValue(0)
  useMotionValueEvent(progress, 'change', (p) => fill.set(Math.min(1, (step + (step < 2 ? p : 0)) / 2)))
  useEffect(() => { fill.set(step / 2) }, [step, fill])

  const run = useRef<{ stop: () => void } | null>(null)
  // Um único motor: 7 s por momento, avança e recomeça; pausa fora do ecrã; sem automático com movimento reduzido.
  useEffect(() => {
    if (!visible || reduced) return
    const remaining = (STEP_MS / 1000) * (1 - progress.get())
    const controls = animate(progress, 1, {
      duration: Math.max(0.05, remaining),
      ease: 'linear',
      onComplete: () => { progress.set(0); setStep((v) => (v + 1) % 3) },
    })
    run.current = controls
    return () => controls.stop()
  }, [visible, reduced, step, token, progress])

  // Escolha do visitante: pára o ciclo em curso antes de mudar (evita que o avanço automático a ultrapasse).
  const choose = (i: number) => { run.current?.stop(); progress.set(0); setStep(i); setToken((n) => n + 1) }

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (i + d + 3) % 3
    choose(next)
    refs.current[next]?.focus()
  }

  return (
    <MotionConfig reducedMotion="user">
      <section id="funcionamento" aria-labelledby="funcionamento-titulo" className="relative scroll-mt-20 bg-white text-navy">
        <motion.div className="mx-auto max-w-content px-5 py-14 sm:px-6 lg:px-8 lg:py-16" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="mx-auto max-w-[820px] text-center">
            <motion.p variants={item} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{t.eyebrow}</motion.p>
            <motion.h2 variants={item} id="funcionamento-titulo" className="mt-3 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[48px] lg:text-[56px]">
              {t.title[0]}
              <span className="text-accent-deep">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={item} className="mx-auto mt-4 max-w-[600px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          {/* Três momentos ligados pela linha Finer One (avança até ao momento ativo) */}
          <motion.div ref={zone} variants={item} className="relative mx-auto mt-10 max-w-[980px] lg:mt-12">
            <svg aria-hidden="true" viewBox="0 0 100 4" preserveAspectRatio="none" className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[13px] h-1 w-[66.68%] overflow-visible">
              <line x1="0" y1="2" x2="100" y2="2" stroke="rgba(11,16,48,0.1)" strokeWidth="1.5" />
              <motion.line x1="0" y1="2" x2="100" y2="2" stroke="rgba(30,144,255,0.25)" strokeWidth="6" strokeLinecap="round" style={{ pathLength: fill }} />
              <motion.line x1="0" y1="2" x2="100" y2="2" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" style={{ pathLength: fill }} />
            </svg>
            <div role="tablist" aria-label={t.nav} className="relative grid grid-cols-3 gap-2">
              {t.steps.map((s, i) => {
                const on = step === i
                const done = i < step
                return (
                  <button
                    key={s.title}
                    ref={(el) => { refs.current[i] = el }}
                    type="button"
                    role="tab"
                    id={`func-tab-${i}`}
                    aria-selected={on}
                    aria-controls="func-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => choose(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className="group flex flex-col items-center rounded-xl px-1 pb-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
                  >
                    <span className={cn('relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-colors duration-300', on ? 'bg-accent text-white shadow-[0_0_0_6px_rgba(0,82,255,0.12),0_0_18px_rgba(30,144,255,0.6)]' : done ? 'bg-accent-deep text-white' : 'bg-white text-[#0B1030]/55 ring-1 ring-[#0B1030]/15 group-hover:text-[#0B1030] group-hover:ring-accent/40')}>
                      0{i + 1}
                    </span>
                    <span className={cn('mt-3 block font-display text-[14px] font-bold leading-snug tracking-[-0.015em] transition-colors duration-300 sm:text-[20px]', on ? 'text-[#070D2B]' : 'text-[#0B1030]/45 group-hover:text-[#0B1030]/75')}>
                      <span className="sm:hidden">{s.tag}</span>
                      <span className="hidden sm:inline">{s.title}</span>
                    </span>
                    <span className={cn('mt-1.5 hidden max-w-[270px] text-[14.5px] leading-snug transition-colors duration-300 sm:block', on ? 'text-[#0B1030]/70' : 'text-[#0B1030]/40')}>{s.desc}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Uma única demonstração: só o conteúdo muda */}
          <motion.div variants={item} className="mt-8 overflow-hidden rounded-[28px] bg-white shadow-[0_40px_90px_-60px_rgba(11,16,48,0.55),0_0_0_1px_rgba(11,16,48,0.06)]">
            {/* Topo com o céu Finer (o "mundo" da plataforma), como nos ecrãs reais */}
            <div className="relative h-16 overflow-hidden sm:h-[72px]">
              <img src="/images/finer-sky.webp" alt="" aria-hidden="true" decoding="async" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white" />
              <div className="relative flex h-full items-center justify-between gap-2 px-4 sm:px-6">
                <span className="flex items-center gap-2 rounded-full bg-white/90 py-1 pl-1 pr-3 shadow-[0_6px_18px_-10px_rgba(7,13,43,0.5)]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#070D2B]">
                    <svg viewBox="0 0 326 445" className="h-3 w-3 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
                  </span>
                  <span className="text-[13px] font-bold">Finer One</span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={step} className="text-[13px] text-[#0B1030]/55" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.2 }}>· {t.steps[step].tag}</motion.span>
                  </AnimatePresence>
                </span>
                <span className="hidden rounded-full bg-[#070D2B]/45 px-3 py-1 text-[11.5px] font-semibold text-white backdrop-blur-sm sm:inline">{t.note}</span>
              </div>
            </div>
            {/* Mobile: descrição do momento ativo por cima da demonstração */}
            <p className="px-4 pb-1 pt-2 text-[14px] leading-snug text-[#0B1030]/75 sm:hidden">
              <span className="font-semibold text-[#070D2B]">{t.steps[step].title}</span> {t.steps[step].desc}
            </p>
            <div id="func-panel" role="tabpanel" aria-labelledby={`func-tab-${step}`} className="relative grid lg:h-[490px]" data-func-panel>
              <AnimatePresence initial={false}>
                <motion.div
                  key={step}
                  className="col-start-1 row-start-1 grid grid-cols-[minmax(0,1fr)] content-start gap-4 p-4 sm:p-6 lg:grid-cols-2 lg:gap-6 lg:p-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE, delay: 0.06 } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                  {step === 0 && <MomentBank lang={lang} />}
                  {step === 1 && <MomentInvoice lang={lang} />}
                  {step === 2 && <MomentTogether lang={lang} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

/* ---------------- Peças de interface ---------------- */

function Card({ title, children, className, glow }: { title: string; children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={cn('relative rounded-[20px] bg-white p-5 sm:p-6', glow ? 'shadow-[0_24px_50px_-30px_rgba(0,82,255,0.55),0_0_0_1px_rgba(0,82,255,0.18)]' : 'shadow-[0_18px_40px_-34px_rgba(11,16,48,0.45),0_0_0_1px_rgba(11,16,48,0.06)]', className)}>
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-[#0B1030]/50">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

const rise = (i: number, base = 0.4, gap = 0.18) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  // Ritmo mais curto do que na versão automática: o visitante controla e não deve esperar.
  transition: { duration: 0.35, ease: EASE, delay: (base + i * gap) * 0.4 },
})

const Label = ({ children }: { children: ReactNode }) => <span className="text-[13px] text-[#0B1030]/60">{children}</span>

/* 01 · Conta bancária ligada → movimento recebido */
function MomentBank({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const rows = pt
    ? [['05 nov', 'Débito direto · Energia', '− € 412,30'], ['04 nov', 'Pagamento a fornecedor · Fornecedor G', '− € 1.230,00'], ['04 nov', 'Subscrição de software', '− € 89,00']]
    : [['5 Nov', 'Direct debit · Energy', '− €412.30'], ['4 Nov', 'Supplier payment · Supplier G', '− €1,230.00'], ['4 Nov', 'Software subscription', '− €89.00']]
  const steps = pt
    ? ['Escolheu o seu banco', 'Autorizou a ligação junto do banco', 'Conta ligada à Finer One']
    : ['You chose your bank', 'You authorised the connection with your bank', 'Account connected to Finer One']
  return (
    <>
      <Card title={pt ? 'Conta bancária' : 'Bank account'}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[19px] font-bold text-[#070D2B]">{pt ? 'Conta à ordem' : 'Current account'}</p>
            <p className="mt-1 text-[14.5px] text-[#0B1030]/65">{pt ? 'Banco Exemplo' : 'Example Bank'} · PT50 •••• •••• 4821</p>
          </div>
          <motion.span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E3F5EC] px-3 py-1 text-[13px] font-bold text-[#0B6B40]" {...rise(0, 0.2)}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            {pt ? 'Ligada' : 'Connected'}
          </motion.span>
        </div>
        <div className="mt-5 border-t border-[#0B1030]/[0.08] pt-4">
          <Label>{pt ? 'Saldo disponível' : 'Available balance'}</Label>
          <p className="mt-1 font-display text-[28px] font-bold leading-none tracking-[-0.03em] text-[#070D2B] tabular-nums sm:text-[32px]">€&nbsp;28.540,32</p>
        </div>
        {/* Como a conta foi ligada: o gesto do empresário, sem detalhes técnicos */}
        <ol className="mt-5 space-y-2.5 border-t border-[#0B1030]/[0.08] pt-4">
          {steps.map((s, i) => (
            <motion.li key={s} className="flex items-center gap-3 text-[14.5px] text-[#070D2B]" {...rise(i, 0.5, 0.3)}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true"><path d="m2.5 6.2 2.2 2.2 4.8-4.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              {s}
            </motion.li>
          ))}
        </ol>
      </Card>

      <Card title={pt ? 'Movimentos' : 'Transactions'} glow>
        {/* Movimento recebido: chega com destaque */}
        <motion.div className="rounded-[12px] border border-accent/30 bg-[#EEF3FF] px-4 py-3.5" {...rise(0, 1.5)}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-accent-deep">{pt ? 'Movimento recebido' : 'Incoming transaction'}</span>
            <span className="text-[13px] tabular-nums text-[#0B1030]/60">05 nov 2026</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-3">
            <span className="text-[16px] font-semibold text-[#070D2B]">{pt ? 'Transferência · Cliente E' : 'Transfer · Customer E'}</span>
            <span className="font-display text-[22px] font-bold tracking-[-0.02em] text-[#0B6B40] tabular-nums">+&nbsp;€&nbsp;3.150,00</span>
          </div>
        </motion.div>
        <ul className="mt-2 divide-y divide-[#0B1030]/[0.07]">
          {rows.map(([d, desc, v], i) => (
            <motion.li key={desc} {...rise(i, 1.9, 0.15)} className={cn("grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 py-3 sm:grid sm:grid-cols-[56px_minmax(0,1fr)_auto]", i === 2 ? "hidden" : "grid")}>
              <span className="text-[13px] tabular-nums text-[#0B1030]/55">{d}</span>
              <span className="text-[15px] leading-snug text-[#070D2B] sm:truncate">{desc}</span>
              <span className="text-[15px] font-semibold tabular-nums text-[#070D2B]">{v}</span>
            </motion.li>
          ))}
        </ul>
      </Card>
    </>
  )
}

/* 02 · Fatura recebida por email → leitura do documento → dados organizados */
function MomentInvoice({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const fields = pt
    ? [['Fornecedor', 'Fornecedor H'], ['Número', 'FT 2026/207'], ['Data', '3 nov 2026'], ['Vencimento', '3 dez 2026'], ['Valor total', '€ 2.460,00'], ['IVA incluído', '€ 460,00']]
    : [['Supplier', 'Supplier H'], ['Number', 'FT 2026/207'], ['Date', '3 Nov 2026'], ['Due date', '3 Dec 2026'], ['Total', '€2,460.00'], ['VAT included', '€460.00']]
  return (
    <>
      <Card title={pt ? 'Email de faturas' : 'Invoice email'}>
        {/* Para onde se enviam: o endereço de faturas da empresa na Finer One (sem inventar domínio) */}
        <motion.div className="mb-3 flex items-center gap-2 rounded-[10px] bg-[#EEF3FF] px-3.5 py-2.5 text-[14px]" {...rise(0, 0.15)}>
          <span className="font-semibold text-accent-deep">{pt ? 'Para:' : 'To:'}</span>
          <span className="min-w-0 text-[#070D2B]">{pt ? 'o endereço de faturas da sua empresa na Finer One' : "your company's Finer One invoice address"}</span>
        </motion.div>
        <motion.div className="flex items-start gap-3 rounded-[12px] border border-[#0B1030]/[0.08] bg-white p-3.5" {...rise(0, 0.4)}>
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#070D2B] text-[13px] font-bold text-white">H</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[15.5px] font-semibold text-[#070D2B]">{pt ? 'Fornecedor H' : 'Supplier H'}</p>
              <span className="text-[13px] text-[#0B1030]/55">{pt ? 'Hoje' : 'Today'}</span>
            </div>
            <p className="text-[14.5px] text-[#0B1030]/70">{pt ? 'Fatura FT 2026/207' : 'Invoice FT 2026/207'}</p>
          </div>
        </motion.div>
        {/* Documento recebido, lido pela Finer One (linha azul percorre o PDF) */}
        <motion.div className="relative mt-3 overflow-hidden rounded-[12px] border border-[#0B1030]/[0.09] bg-white p-4" {...rise(0, 0.6)}>
          <div className="flex items-center gap-2">
            <span className="rounded-[4px] bg-[#C2410C] px-1.5 py-0.5 text-[10.5px] font-bold text-white">PDF</span>
            <span className="text-[14px] font-semibold text-[#070D2B]">FT-2026-207.pdf</span>
          </div>
          <div aria-hidden="true" className="mt-3 space-y-2">
            {[92, 70, 84, 56, 76, 40].map((w, i) => (
              <span key={i} className="block h-[7px] rounded-full bg-[#0B1030]/[0.08]" style={{ width: `${w}%` }} />
            ))}
          </div>
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-glow to-transparent shadow-[0_0_10px_rgba(30,144,255,0.9)]"
            initial={{ top: '18%', opacity: 0 }}
            animate={{ top: ['18%', '92%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.35 }}
          />
        </motion.div>
        <p className="mt-3 text-[13.5px] text-[#0B1030]/60">{pt ? 'Envie ou reencaminhe as faturas para este endereço.' : 'Send or forward your invoices to this address.'}</p>
      </Card>

      <Card title={pt ? 'Informação da fatura' : 'Invoice information'} glow>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
          {fields.map(([k, v], i) => (
            <motion.div key={k} {...rise(i, 1.8, 0.2)}>
              <dt className="text-[13px] text-[#0B1030]/60">{k}</dt>
              <dd className={cn('mt-0.5 font-semibold text-[#070D2B] tabular-nums', i === 4 ? 'font-display text-[22px] tracking-[-0.02em] text-accent-deep' : 'text-[16px]')}>{v}</dd>
            </motion.div>
          ))}
        </dl>
      </Card>
    </>
  )
}

/* 03 · Informação organizada: banco e faturas no mesmo sítio, com consulta por origem */
type Filter = 'all' | 'bank' | 'invoice'
function MomentTogether({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const [filter, setFilter] = useState<Filter>('all')

  // As duas entradas das etapas anteriores (n) aparecem assinaladas como novas.
  const rows = (pt
    ? [
        { d: '05 nov', t: 'Transferência recebida · Cliente E', s: 'bank', v: '+ € 3.150,00', n: true },
        { d: '05 nov', t: 'Fatura FT 2026/207 · Fornecedor H', s: 'invoice', v: '€ 2.460,00', n: true },
        { d: '05 nov', t: 'Débito direto · Energia', s: 'bank', v: '− € 412,30' },
        { d: '04 nov', t: 'Fatura FT 2026/198 · Fornecedor F', s: 'invoice', v: '€ 1.920,00' },
        { d: '04 nov', t: 'Pagamento a fornecedor · Fornecedor G', s: 'bank', v: '− € 1.230,00' },
        { d: '04 nov', t: 'Subscrição de software', s: 'bank', v: '− € 89,00' },
      ]
    : [
        { d: '5 Nov', t: 'Incoming transfer · Customer E', s: 'bank', v: '+ €3,150.00', n: true },
        { d: '5 Nov', t: 'Invoice FT 2026/207 · Supplier H', s: 'invoice', v: '€2,460.00', n: true },
        { d: '5 Nov', t: 'Direct debit · Energy', s: 'bank', v: '− €412.30' },
        { d: '4 Nov', t: 'Invoice FT 2026/198 · Supplier F', s: 'invoice', v: '€1,920.00' },
        { d: '4 Nov', t: 'Supplier payment · Supplier G', s: 'bank', v: '− €1,230.00' },
        { d: '4 Nov', t: 'Software subscription', s: 'bank', v: '− €89.00' },
      ]) as { d: string; t: string; s: Filter; v: string; n?: boolean }[]
  const shown = rows.filter((r) => filter === 'all' || r.s === filter)
  const chips: [Filter, string][] = [['all', pt ? 'Tudo' : 'All'], ['bank', pt ? 'Banco' : 'Bank'], ['invoice', pt ? 'Faturas' : 'Invoices']]
  const source = (s: Filter) => (s === 'invoice' ? (pt ? 'Fatura' : 'Invoice') : (pt ? 'Banco' : 'Bank'))

  return (
    <div className="lg:col-span-2">
      <div className="relative rounded-[16px] border border-accent/30 bg-white shadow-[0_18px_40px_-28px_rgba(0,82,255,0.7)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0B1030]/[0.08] px-4 py-4 sm:px-5">
          <div>
            <p className="text-[18px] font-bold text-[#070D2B]">{pt ? 'Movimentos e faturas' : 'Transactions and invoices'}</p>
            <p className="text-[13.5px] text-[#0B1030]/60">{pt ? 'Conta à ordem · Email de faturas' : 'Current account · Invoice email'}</p>
          </div>
          <div className="relative flex gap-1 rounded-full bg-[#E9EEF8] p-1" role="group" aria-label={pt ? 'Filtrar por origem' : 'Filter by source'}>
            {chips.map(([k, l]) => (
              <button
                key={k}
                type="button"
                aria-pressed={filter === k}
                onClick={() => setFilter(k)}
                className="relative rounded-full px-3.5 py-1.5 text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {filter === k && <motion.span layoutId="func-filter" transition={{ duration: 0.3, ease: EASE }} className="absolute inset-0 rounded-full bg-[#070D2B]" />}
                <span className={cn('relative', filter === k ? 'text-white' : 'text-[#0B1030]/70')}>{l}</span>
              </button>
            ))}
          </div>
        </div>
        <ul className="min-h-[300px] px-4 sm:px-5">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((r, i) => (
              <motion.li
                key={r.t}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE, delay: 0.2 + i * 0.08 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-[#0B1030]/[0.07] py-3 last:border-b-0 sm:grid-cols-[64px_minmax(0,1fr)_76px_120px]"
              >
                {/* Linha Finer One: assinala o que acabou de chegar das etapas 1 e 2 */}
                {r.n && (
                  <motion.span aria-hidden="true" className="absolute -left-4 bottom-3 top-3 w-[3px] origin-top rounded-full bg-gradient-to-b from-accent to-glow shadow-[0_0_8px_rgba(30,144,255,0.8)] sm:-left-5" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, ease: EASE, delay: 1 + i * 0.25 }} />
                )}
                <span className="hidden text-[13px] tabular-nums text-[#0B1030]/55 sm:block">{r.d}</span>
                <div className="min-w-0">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[15px] font-medium leading-snug text-[#070D2B] sm:flex-nowrap sm:text-[15.5px]">
                    <span className="min-w-0 sm:truncate">{r.t}</span>
                    {r.n && (
                      <motion.span className="shrink-0 rounded-full bg-accent px-2 py-px text-[11px] font-bold uppercase tracking-[0.06em] text-white" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: EASE, delay: 1.2 + i * 0.25 }}>
                        {pt ? 'Novo' : 'New'}
                      </motion.span>
                    )}
                  </span>
                  {/* Mobile: data e origem por baixo da descrição */}
                  <span className="mt-0.5 block text-[12.5px] text-[#0B1030]/60 sm:hidden">
                    {r.d} · <span className={cn('font-semibold', r.s === 'invoice' ? 'text-accent-deep' : 'text-[#0B1030]/75')}>{source(r.s)}</span>
                  </span>
                </div>
                <span className={cn('hidden justify-self-start rounded-full px-2.5 py-0.5 text-[12.5px] font-bold sm:inline', r.s === 'invoice' ? 'bg-accent/[0.1] text-accent-deep' : 'bg-[#0B1030]/[0.06] text-[#0B1030]/70')}>
                  {source(r.s)}
                </span>
                <span className={cn('text-right text-[15px] font-semibold tabular-nums sm:text-[15.5px]', r.v.startsWith('+') ? 'text-[#0B6B40]' : 'text-[#070D2B]')}>{r.v}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  )
}

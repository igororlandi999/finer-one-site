import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { AnimatePresence, MotionConfig, animate, motion, useInView, useMotionValue, useReducedMotion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
/** Duração de cada momento (s) e pausa no fim antes de recomeçar (ms). Ajustáveis. */
const DURATIONS = [8, 10, 10]
const HOLD_MS = 3000

const copy: Record<Lang, {
  eyebrow: string; title: [string, string]; sub: string; note: string
  moments: { label: string; short: string; tiny: string }[]
  play: string; pause: string; restart: string; next: string; controls: string
}> = {
  pt: {
    eyebrow: 'Como funciona',
    title: ['Contas ligadas. Faturas recebidas. ', 'Tudo organizado.'],
    sub: 'Ligue as contas bancárias e envie as faturas por email. A Finer One reúne a informação para ter tudo à mão.',
    note: 'Exemplo com dados fictícios.',
    moments: [
      { label: 'Ligue o banco', short: 'Ligue o banco', tiny: 'Banco' },
      { label: 'Envie as faturas', short: 'Envie as faturas', tiny: 'Faturas' },
      { label: 'Consulte tudo', short: 'Consulte tudo', tiny: 'Tudo' },
    ],
    play: 'Reproduzir', pause: 'Pausar', restart: 'Recomeçar', next: 'Etapa seguinte', controls: 'Controlo da demonstração',
  },
  en: {
    eyebrow: 'How it works',
    title: ['Accounts connected. Invoices received. ', 'Everything organised.'],
    sub: 'Connect your bank accounts and send invoices by email. Finer One brings the information together so you have it all at hand.',
    note: 'Example with fictitious data.',
    moments: [
      { label: 'Connect your bank', short: 'Connect your bank', tiny: 'Bank' },
      { label: 'Send your invoices', short: 'Send your invoices', tiny: 'Invoices' },
      { label: 'See everything', short: 'See everything', tiny: 'All' },
    ],
    play: 'Play', pause: 'Pause', restart: 'Restart', next: 'Next step', controls: 'Demo controls',
  },
}

/**
 * Secção 4 — demonstração de produto em três momentos, com reprodução própria:
 * começa quando está visível, pausa fora do ecrã e retoma ao voltar, não
 * depende da velocidade do scroll e recomeça sozinha (exceto se o visitante
 * assumir o controlo). Um único motor (animate de Motion num MotionValue) evita
 * temporizadores duplicados. Versões anteriores: ?funcionamento=v3, v2, antigo.
 */
export function HowItWorksDemo() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, amount: 0.2 })
  // A reprodução só começa quando o palco (e não apenas o título) está visível.
  const visible = useInView(stageRef, { amount: 0.6 })
  const [started, setStarted] = useState(false)
  useEffect(() => { if (visible) setStarted(true) }, [visible])
  const [moment, setMoment] = useState(0)
  const [paused, setPaused] = useState(false) // pausa por decisão do visitante
  const [token, setToken] = useState(0) // força um novo ciclo (recomeçar)
  const progress = useMotionValue(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const running = started && visible && !paused && !reduced

  // Motor de reprodução: anima o progresso do momento atual; ao terminar avança.
  useEffect(() => {
    if (!running) return
    let hold: number | undefined
    const remaining = DURATIONS[moment] * (1 - progress.get())
    const controls = animate(progress, 1, {
      duration: Math.max(0.05, remaining),
      ease: 'linear',
      onComplete: () => {
        if (moment < 2) {
          progress.set(0)
          setMoment(moment + 1)
        } else {
          hold = window.setTimeout(() => {
            progress.set(0)
            setMoment(0)
            setToken((n) => n + 1)
          }, HOLD_MS)
        }
      },
    })
    return () => {
      controls.stop()
      if (hold) window.clearTimeout(hold)
    }
  }, [running, moment, token, progress])

  const choose = (i: number) => {
    setPaused(true)
    progress.set(0)
    setMoment(i)
  }
  const togglePlay = () => {
    if (paused && progress.get() >= 1 && moment === 2) {
      progress.set(0)
      setMoment(0)
    }
    setPaused((p) => !p)
  }
  const restart = () => {
    progress.set(0)
    setMoment(0)
    setPaused(false)
    setToken((n) => n + 1)
  }
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (i + d + 3) % 3
    choose(next)
    tabs.current[next]?.focus()
  }

  return (
    <MotionConfig reducedMotion="user">
      <section id="funcionamento" aria-labelledby="funcionamento-titulo" className="relative scroll-mt-24 bg-white py-14 text-navy lg:py-20">
        <div ref={ref} className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <motion.div className="mx-auto max-w-[880px] text-center" initial={{ opacity: 0, y: 16 }} animate={seen ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.45, ease: EASE }}>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent">{t.eyebrow}</p>
            <h2 id="funcionamento-titulo" className="mt-3 text-balance font-display text-[32px] font-bold leading-[1.06] tracking-[-0.035em] text-[#070D2B] sm:text-[44px] lg:text-[52px]">
              {t.title[0]}
              <span className="text-accent">{t.title[1]}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[620px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</p>
          </motion.div>

          {/* Demonstração */}
          <motion.div
            className="mt-10 lg:mt-12"
            initial={reduced ? false : { clipPath: 'inset(6% 4% 8% 4% round 24px)', opacity: 0, y: 20 }}
            animate={seen ? { clipPath: 'inset(0% 0% 0% 0% round 22px)', opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.85, ease: EASE, delay: 0.12 }}
          >
            <div className="overflow-clip rounded-[22px] bg-white shadow-[0_50px_100px_-55px_rgba(11,16,48,0.55),0_0_0_1px_rgba(11,16,48,0.08)]">
              {/* Barra da aplicação com as três etapas e os controlos (fixa no mobile enquanto o palco está no ecrã) */}
              <div className="sticky top-16 z-20 flex flex-col gap-2.5 rounded-t-[22px] border-b border-[#0B1030]/[0.08] bg-white/95 px-4 py-2.5 backdrop-blur sm:static sm:flex-row sm:items-center sm:justify-between sm:bg-white sm:px-5 sm:py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#070D2B]">
                    <svg viewBox="0 0 326 445" className="h-3.5 w-3.5 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
                  </span>
                  <span className="text-[14px] font-bold text-[#070D2B]">Finer One</span>
                  <span className="text-[12.5px] text-[#0B1030]/55">{t.note}</span>
                </div>

                <div className="flex items-center gap-2" role="group" aria-label={t.controls}>
                  <div role="tablist" aria-label={t.controls} className="relative grid flex-1 grid-cols-3 gap-1 rounded-full bg-[#E9EEF8] p-1 sm:flex-none">
                    {t.moments.map((m, i) => (
                      <button
                        key={m.label}
                        ref={(el) => { tabs.current[i] = el }}
                        type="button"
                        role="tab"
                        aria-selected={moment === i}
                        aria-controls="func-demo"
                        tabIndex={moment === i ? 0 : -1}
                        onClick={() => choose(i)}
                        onKeyDown={(e) => onKey(e, i)}
                        className="relative overflow-hidden rounded-full px-3 py-1.5 text-[12.5px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-3.5"
                      >
                        {moment === i && <motion.span layoutId="func-step" transition={{ duration: 0.3, ease: EASE }} className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_-2px_rgba(11,16,48,0.25)]" />}
                        <span className={cn('relative whitespace-nowrap', moment === i ? 'text-[#070D2B]' : 'text-[#0B1030]/70')}>
                          <span className="mr-1 hidden text-accent sm:inline">0{i + 1}</span>
                          <span className="sm:hidden">{m.tiny}</span>
                          <span className="hidden sm:inline">{m.short}</span>
                        </span>
                        {/* Progresso fino da etapa */}
                        <span aria-hidden="true" className="absolute inset-x-3 bottom-0.5 h-[2px] overflow-hidden rounded-full">
                          {i < moment && <span className="block h-full w-full rounded-full bg-accent/40" />}
                          {i === moment && <ProgressFill value={progress} />}
                        </span>
                      </button>
                    ))}
                  </div>
                  <IconButton label={reduced ? t.next : paused ? t.play : t.pause} onClick={reduced ? () => choose((moment + 1) % 3) : togglePlay}>
                    {reduced ? (
                      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                    ) : paused ? (
                      <path d="M5.5 3.8v8.4L12.5 8 5.5 3.8Z" fill="currentColor" />
                    ) : (
                      <path d="M5 3.5v9M11 3.5v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    )}
                  </IconButton>
                  <IconButton label={t.restart} onClick={reduced ? () => choose(0) : restart}>
                    <path d="M3 8a5 5 0 1 0 1.6-3.7M3 3v3h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </IconButton>
                </div>
              </div>

              {/* Palco: altura estável */}
              <div ref={stageRef} id="func-demo" role="tabpanel" aria-label={t.moments[moment].label} className="relative grid min-h-[790px] bg-[#F7F9FE] sm:min-h-[520px] lg:min-h-[470px]" data-demo-stage>
                {/* Cruzamento: a etapa seguinte entra enquanto a anterior sai (sem ecrã vazio). */}
                <AnimatePresence initial={false}>
                  {(started || reduced) && (
                    <motion.div
                      key={`${moment}-${token}`}
                      className="col-start-1 row-start-1 grid h-full grid-cols-[minmax(0,1fr)] gap-4 p-4 sm:p-6 lg:grid-cols-2 lg:gap-6 lg:p-8"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE, delay: 0.08 } }}
                      exit={{ opacity: 0, transition: { duration: 0.25 } }}
                    >
                      {moment === 0 && <MomentBank lang={lang} />}
                      {moment === 1 && <MomentInvoice lang={lang} />}
                      {moment === 2 && <MomentTogether lang={lang} />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}

function ProgressFill({ value }: { value: MotionValue<number> }) {
  return <motion.span className="block h-full origin-left rounded-full bg-accent" style={{ scaleX: value }} />
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0B1030]/[0.1] bg-white text-[#070D2B] transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">{children}</svg>
    </button>
  )
}

/* ---------------- Peças de interface ---------------- */

function Card({ title, children, className, glow }: { title: string; children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={cn('relative rounded-[16px] border bg-white p-5 sm:p-6', glow ? 'border-accent/35 shadow-[0_18px_40px_-26px_rgba(0,82,255,0.7)]' : 'border-[#0B1030]/[0.09]', className)}>
      <p className="text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#0B1030]/60">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

const rise = (i: number, base = 0.4, gap = 0.18) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: EASE, delay: base + i * gap },
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
            <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-accent">{pt ? 'Movimento recebido' : 'Incoming transaction'}</span>
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
          <span className="font-semibold text-accent">{pt ? 'Para:' : 'To:'}</span>
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
            transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.9 }}
          />
        </motion.div>
        <p className="mt-3 text-[13.5px] text-[#0B1030]/60">{pt ? 'Envie ou reencaminhe as faturas para este endereço.' : 'Send or forward your invoices to this address.'}</p>
      </Card>

      <Card title={pt ? 'Informação da fatura' : 'Invoice information'} glow>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
          {fields.map(([k, v], i) => (
            <motion.div key={k} {...rise(i, 1.8, 0.2)}>
              <dt className="text-[13px] text-[#0B1030]/60">{k}</dt>
              <dd className={cn('mt-0.5 font-semibold text-[#070D2B] tabular-nums', i === 4 ? 'font-display text-[22px] tracking-[-0.02em] text-accent' : 'text-[16px]')}>{v}</dd>
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
                    {r.d} · <span className={cn('font-semibold', r.s === 'invoice' ? 'text-accent' : 'text-[#0B1030]/75')}>{source(r.s)}</span>
                  </span>
                </div>
                <span className={cn('hidden justify-self-start rounded-full px-2.5 py-0.5 text-[12.5px] font-bold sm:inline', r.s === 'invoice' ? 'bg-accent/[0.1] text-accent' : 'bg-[#0B1030]/[0.06] text-[#0B1030]/70')}>
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

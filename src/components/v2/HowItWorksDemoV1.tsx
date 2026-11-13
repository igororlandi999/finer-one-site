import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
const STEP_MS = 3600 // duração de cada momento na reprodução automática

const copy: Record<Lang, { eyebrow: string; title: [string, string]; sub: string; moments: string[]; replay: string; note: string }> = {
  pt: {
    eyebrow: 'Simples desde o primeiro passo',
    title: ['Do banco às faturas. ', 'Tudo na Finer One.'],
    sub: 'Ligue as suas contas bancárias e envie as faturas por email. A Finer One reúne a informação financeira num único lugar.',
    moments: ['Conta bancária ligada', 'Fatura recebida por email', 'Informação reunida'],
    replay: 'Ver de novo',
    note: 'Exemplo com dados fictícios.',
  },
  en: {
    eyebrow: 'Simple from the first step',
    title: ['From bank to invoices. ', 'All in Finer One.'],
    sub: 'Connect your bank accounts and send your invoices by email. Finer One brings your financial information together in one place.',
    moments: ['Bank account connected', 'Invoice received by email', 'Information brought together'],
    replay: 'Play again',
    note: 'Example with fictitious data.',
  },
}

/**
 * Secção 4 — demonstração de produto em três momentos (Motion).
 * Reproduz-se uma vez ao entrar no ecrã e pode ser controlada manualmente
 * (momentos clicáveis + "Ver de novo"). Sem pinning nem scroll-jacking.
 * Versões anteriores: ?funcionamento=v2 (diagrama) e ?funcionamento=antigo.
 */
export function HowItWorksDemoV1() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const [moment, setMoment] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [runId, setRunId] = useState(0)

  // Reprodução automática única ao entrar no ecrã (não com movimento reduzido).
  useEffect(() => {
    if (inView && !reduced) setPlaying(true)
  }, [inView, reduced])

  useEffect(() => {
    if (!playing) return
    if (moment >= 2) { setPlaying(false); return }
    const id = window.setTimeout(() => setMoment((m) => m + 1), STEP_MS)
    return () => window.clearTimeout(id)
  }, [playing, moment, runId])

  const choose = (i: number) => { setPlaying(false); setMoment(i) }
  const replay = () => { setMoment(0); setRunId((r) => r + 1); setPlaying(true) }

  return (
    <MotionConfig reducedMotion="user">
      <section id="funcionamento" aria-labelledby="funcionamento-titulo" className="relative scroll-mt-24 bg-white py-14 text-navy lg:py-20">
        <div ref={ref} className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <motion.div className="mx-auto max-w-[820px] text-center" initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.45, ease: EASE }}>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent">{t.eyebrow}</p>
            <h2 id="funcionamento-titulo" className="mt-3 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[46px] lg:text-[56px]">
              {t.title[0]}
              <span className="text-accent">{t.title[1]}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[600px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</p>
          </motion.div>

          {/* Demonstração */}
          <motion.div
            className="mt-10 lg:mt-12"
            initial={reduced ? false : { clipPath: 'inset(6% 4% 8% 4% round 24px)', opacity: 0, y: 20 }}
            animate={inView ? { clipPath: 'inset(0% 0% 0% 0% round 22px)', opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.85, ease: EASE, delay: 0.12 }}
          >
            <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_50px_100px_-55px_rgba(11,16,48,0.55),0_0_0_1px_rgba(11,16,48,0.08)]">
              {/* Barra da aplicação */}
              <div className="flex h-12 items-center justify-between border-b border-[#0B1030]/[0.07] px-5">
                <span className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#070D2B]">
                    <svg viewBox="0 0 326 445" className="h-3.5 w-3.5 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
                  </span>
                  <span className="text-[14px] font-bold text-[#070D2B]">Finer One</span>
                  <span className="hidden text-[13.5px] text-[#0B1030]/50 sm:inline">· {t.moments[moment]}</span>
                </span>
                <span className="text-[12px] text-[#0B1030]/50">{t.note}</span>
              </div>

              <div data-demo-stage className="relative grid min-h-[660px] grid-cols-[minmax(0,1fr)] bg-[#F7F9FE] sm:min-h-[430px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={moment}
                    className="col-span-full grid grid-cols-[minmax(0,1fr)] gap-4 p-4 sm:p-6 lg:grid-cols-2 lg:gap-6 lg:p-8"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    {moment === 0 && <MomentBank lang={lang} />}
                    {moment === 1 && <MomentInvoice lang={lang} />}
                    {moment === 2 && <MomentTogether lang={lang} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Controlos: três momentos com progresso + repetir */}
            <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <ol className="grid w-full grid-cols-3 gap-2 sm:max-w-[640px]">
                {t.moments.map((m, i) => (
                  <li key={m}>
                    <button
                      type="button"
                      onClick={() => choose(i)}
                      aria-current={moment === i ? 'step' : undefined}
                      className="group w-full text-left focus-visible:outline-none"
                    >
                      <span className="block h-[3px] overflow-hidden rounded-full bg-[#0B1030]/[0.1] group-focus-visible:ring-2 group-focus-visible:ring-accent">
                        <motion.span
                          key={`${i}-${moment}-${runId}-${playing}`}
                          className="block h-full origin-left rounded-full bg-accent"
                          initial={{ scaleX: i < moment ? 1 : 0 }}
                          animate={{ scaleX: i < moment ? 1 : i === moment ? 1 : 0 }}
                          transition={{ duration: i === moment && playing ? STEP_MS / 1000 : 0.3, ease: 'linear' }}
                        />
                      </span>
                      <span className={cn('mt-2 block text-[12.5px] font-semibold leading-tight transition-colors sm:text-[13.5px]', moment === i ? 'text-[#070D2B]' : 'text-[#0B1030]/50 group-hover:text-[#070D2B]')}>
                        <span className="mr-1 text-accent">0{i + 1}</span>{m}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={replay}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#0B1030]/[0.12] px-4 py-2 text-[13.5px] font-semibold text-[#070D2B] transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.6-3.7M3 3v3h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t.replay}
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}

/* ---------------- Peças de interface ---------------- */

function Card({ title, children, className, glow }: { title: string; children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={cn('relative rounded-[16px] border bg-white p-5 transition-shadow', glow ? 'border-accent/35 shadow-[0_18px_40px_-26px_rgba(0,82,255,0.7)]' : 'border-[#0B1030]/[0.08]', className)}>
      <p className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#0B1030]/50">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

/** Linha Finer One curta que "transporta" a informação para dentro do cartão seguinte. */
function FlowLine({ delay = 0.25, className }: { delay?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('pointer-events-none absolute h-[2px] overflow-hidden rounded-full', className)}>
      <motion.span
        className="block h-full origin-left bg-gradient-to-r from-accent to-glow shadow-[0_0_8px_rgba(30,144,255,0.8)]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay }}
      />
    </span>
  )
}

const rise = (i: number, base = 0.35) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: EASE, delay: base + i * 0.12 },
})

function Row({ left, sub, right, tone, i }: { left: string; sub?: string; right: string; tone?: 'pos' | 'neg'; i: number }) {
  return (
    <motion.li {...rise(i)} className="flex items-center justify-between gap-3 py-2.5">
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-medium text-[#070D2B]">{left}</span>
        {sub && <span className="block text-[13px] text-[#0B1030]/55">{sub}</span>}
      </span>
      <span className={cn('shrink-0 text-[15px] font-semibold tabular-nums', tone === 'pos' ? 'text-[#0F7A4A]' : 'text-[#070D2B]')}>{right}</span>
    </motion.li>
  )
}

/* 01 · Conta bancária ligada → movimentos entram na Finer One */
function MomentBank({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  return (
    <>
      <Card title={pt ? 'Conta bancária' : 'Bank account'} glow>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[18px] font-bold text-[#070D2B]">{pt ? 'Conta à ordem' : 'Current account'}</p>
            <p className="mt-0.5 text-[14px] text-[#0B1030]/60">{pt ? 'Banco Exemplo' : 'Example Bank'} · PT50 •••• •••• 4821</p>
          </div>
          <motion.span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E8F6EF] px-3 py-1 text-[13px] font-semibold text-[#0F7A4A]"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: EASE, delay: 0.2 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            {pt ? 'Ligada' : 'Connected'}
          </motion.span>
        </div>
        <div className="mt-5 border-t border-[#0B1030]/[0.07] pt-4">
          <p className="text-[14px] text-[#0B1030]/60">{pt ? 'Saldo disponível' : 'Available balance'}</p>
          <p className="mt-1 font-display text-[34px] font-bold leading-none tracking-[-0.03em] text-[#070D2B] tabular-nums">€&nbsp;28.540,32</p>
        </div>
        <p className="mt-4 text-[13px] text-[#0B1030]/55">{pt ? 'Ligação autorizada por si, apenas de leitura.' : 'Connection authorised by you, read-only.'}</p>
        <FlowLine className="-right-6 top-1/2 hidden w-6 lg:block" delay={0.3} />
      </Card>
      <Card title={pt ? 'Movimentos recentes' : 'Recent transactions'}>
        <ul className="divide-y divide-[#0B1030]/[0.06]">
          <Row i={0} left={pt ? 'Transferência recebida' : 'Incoming transfer'} sub={pt ? 'Cliente E' : 'Customer E'} right="+ € 3.150,00" tone="pos" />
          <Row i={1} left={pt ? 'Débito direto · Energia' : 'Direct debit · Energy'} sub={pt ? 'Fornecedor' : 'Supplier'} right="− € 412,30" />
          <Row i={2} left={pt ? 'Pagamento a fornecedor' : 'Supplier payment'} sub={pt ? 'Fornecedor G' : 'Supplier G'} right="− € 1.230,00" />
          <Row i={3} left={pt ? 'Subscrição de software' : 'Software subscription'} sub={pt ? 'Serviços' : 'Services'} right="− € 89,00" />
        </ul>
      </Card>
    </>
  )
}

/* 02 · Fatura recebida pelo email dedicado → dados organizados */
function MomentInvoice({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const fields = pt
    ? [['Fornecedor', 'Fornecedor H'], ['Número', 'FT 2026/207'], ['Data', '3 nov 2026'], ['Vencimento', '3 dez 2026'], ['Valor total', '€ 2.460,00'], ['IVA incluído', '€ 460,00']]
    : [['Supplier', 'Supplier H'], ['Number', 'FT 2026/207'], ['Date', '3 Nov 2026'], ['Due date', '3 Dec 2026'], ['Total', '€2,460.00'], ['VAT included', '€460.00']]
  return (
    <>
      <Card title={pt ? 'Email de faturas' : 'Invoice email'} glow>
        <div className="flex items-start gap-3 rounded-[12px] bg-[#F7F9FE] p-3.5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#070D2B] text-[13px] font-bold text-white">H</span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-[#070D2B]">{pt ? 'Fornecedor H' : 'Supplier H'}</p>
            <p className="truncate text-[14px] text-[#0B1030]/65">{pt ? 'Fatura FT 2026/207' : 'Invoice FT 2026/207'}</p>
            <motion.span {...rise(0, 0.25)} className="mt-2 inline-flex items-center gap-1.5 rounded-[8px] border border-[#0B1030]/[0.1] bg-white px-2.5 py-1.5 text-[13px] font-medium text-[#070D2B]">
              <span className="rounded-[4px] bg-[#D9480F] px-1 text-[10px] font-bold text-white">PDF</span>
              FT-2026-207.pdf
            </motion.span>
          </div>
        </div>
        <p className="mt-4 text-[13px] text-[#0B1030]/55">{pt ? 'Reencaminhada para o endereço dedicado da Finer One, sem acesso à sua caixa de correio.' : 'Forwarded to your dedicated Finer One address, without access to your inbox.'}</p>
        <FlowLine className="-right-6 top-1/2 hidden w-6 lg:block" delay={0.35} />
      </Card>
      <Card title={pt ? 'Dados da fatura' : 'Invoice details'}>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-3">
          {fields.map(([k, v], i) => (
            <motion.div key={k} {...rise(i, 0.4)}>
              <dt className="text-[13px] text-[#0B1030]/55">{k}</dt>
              <dd className={cn('mt-0.5 text-[15.5px] font-semibold text-[#070D2B] tabular-nums', i === 4 && 'text-[19px] text-accent')}>{v}</dd>
            </motion.div>
          ))}
        </dl>
      </Card>
    </>
  )
}

/* 03 · Informação reunida: movimentos e faturas no mesmo sítio, para consulta */
function MomentTogether({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const rows = pt
    ? [
        { d: '05 nov', t: 'Transferência recebida · Cliente E', s: 'Banco', v: '+ € 3.150,00' },
        { d: '05 nov', t: 'Fatura FT 2026/207 · Fornecedor H', s: 'Fatura', v: '€ 2.460,00' },
        { d: '05 nov', t: 'Débito direto · Energia', s: 'Banco', v: '− € 412,30' },
        { d: '04 nov', t: 'Pagamento a fornecedor · Fornecedor G', s: 'Banco', v: '− € 1.230,00' },
        { d: '04 nov', t: 'Subscrição de software', s: 'Banco', v: '− € 89,00' },
      ]
    : [
        { d: '5 Nov', t: 'Incoming transfer · Customer E', s: 'Bank', v: '+ €3,150.00' },
        { d: '5 Nov', t: 'Invoice FT 2026/207 · Supplier H', s: 'Invoice', v: '€2,460.00' },
        { d: '5 Nov', t: 'Direct debit · Energy', s: 'Bank', v: '− €412.30' },
        { d: '4 Nov', t: 'Supplier payment · Supplier G', s: 'Bank', v: '− €1,230.00' },
        { d: '4 Nov', t: 'Software subscription', s: 'Bank', v: '− €89.00' },
      ]
  return (
    <div className="lg:col-span-2">
      <div className="relative rounded-[16px] border border-accent/30 bg-white shadow-[0_18px_40px_-28px_rgba(0,82,255,0.7)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0B1030]/[0.07] px-5 py-4">
          <p className="text-[17px] font-bold text-[#070D2B]">{pt ? 'Movimentos e faturas' : 'Transactions and invoices'}</p>
          <div className="flex gap-2">
            <span className="rounded-full bg-[#070D2B] px-3 py-1 text-[12.5px] font-semibold text-white">{pt ? 'Tudo' : 'All'}</span>
            <span className="rounded-full bg-[#0B1030]/[0.05] px-3 py-1 text-[12.5px] font-semibold text-[#0B1030]/65">{pt ? 'Banco' : 'Bank'}</span>
            <span className="rounded-full bg-[#0B1030]/[0.05] px-3 py-1 text-[12.5px] font-semibold text-[#0B1030]/65">{pt ? 'Faturas' : 'Invoices'}</span>
          </div>
        </div>
        {/* A linha azul percorre o topo da lista: as duas origens passam a estar no mesmo sítio */}
        <FlowLine className="left-0 right-0 top-[57px] w-full" delay={0.15} />
        <ul className="divide-y divide-[#0B1030]/[0.06] px-5">
          {rows.map((r, i) => (
            <motion.li key={r.t} {...rise(i, 0.3)} className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 py-3 sm:grid-cols-[64px_minmax(0,1fr)_88px_auto]">
              <span className="text-[13px] tabular-nums text-[#0B1030]/50">{r.d}</span>
              <span className="truncate text-[15px] font-medium text-[#070D2B]">{r.t}</span>
              <span className={cn('hidden justify-self-start rounded-full px-2.5 py-0.5 text-[12px] font-semibold sm:inline', r.s === 'Fatura' || r.s === 'Invoice' ? 'bg-accent/[0.08] text-accent' : 'bg-[#0B1030]/[0.05] text-[#0B1030]/65')}>{r.s}</span>
              <span className="text-right text-[15px] font-semibold tabular-nums text-[#070D2B]">{r.v}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  )
}

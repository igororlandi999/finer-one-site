import { useEffect, useRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { CASH, CASH_GAP, COMMITMENTS_TOTAL, COSTS, MAIN_CLIENT_SHARE, MAIN_CLIENT_TOTAL, OVERDUE_COUNT, AVG_DAYS_LATE, TOTAL_OVERDUE, eur, pct } from './storyData'

const copy: Record<Lang, { eyebrow: string; title: [string, string]; sub: string; note: string; steps: { n: string; name: string; line: string }[] }> = {
  pt: {
    eyebrow: 'Compreender · Antecipar · Decidir',
    title: ['Dos números ', 'à decisão.'],
    sub: 'Os dados já existem. A Finer One mostra o que está a acontecer, o que vem aí e por onde começar.',
    note: 'Exemplos com dados fictícios.',
    steps: [
      { n: '01', name: 'Compreender', line: 'O que está a acontecer, num relance.' },
      { n: '02', name: 'Antecipar', line: 'O que vem aí, antes de ser urgente.' },
      { n: '03', name: 'Decidir', line: 'Por onde começar, por ordem de impacto.' },
    ],
  },
  en: {
    eyebrow: 'Understand · Anticipate · Decide',
    title: ['From numbers ', 'to decisions.'],
    sub: 'The data already exists. Finer One shows what is happening, what is coming and where to start.',
    note: 'Examples with fictitious data.',
    steps: [
      { n: '01', name: 'Understand', line: 'What is happening, at a glance.' },
      { n: '02', name: 'Anticipate', line: 'What is coming, before it becomes urgent.' },
      { n: '03', name: 'Decide', line: 'Where to start, ranked by impact.' },
    ],
  },
}

/**
 * Segunda secção (versão compacta "produto"): título fixo à esquerda e três
 * painéis de produto compactos à direita, percorridos com scroll natural.
 * A linha azul à esquerda acompanha o painel em leitura. Sem pinning.
 * Versão anterior (exemplos com separadores) em ?secao=exemplos.
 */
export function ClarityShowcase() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const [active, setActive] = useState(0)
  const cards = useRef<(HTMLElement | null)[]>([])
  const { ref: headRef, inView: headIn } = useInView<HTMLDivElement>({ threshold: 0.2 })

  // Painel ativo = o que está mais perto do centro do ecrã.
  useEffect(() => {
    const els = cards.current.filter(Boolean) as HTMLElement[]
    if (!els.length || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const goTo = (i: number) => cards.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <section id="problema" aria-labelledby="clareza-titulo" className="relative z-10 scroll-mt-16 bg-navy">
      <div className="relative rounded-[28px] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F7FD_100%)] sm:mx-3 sm:rounded-[40px]">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-16 lg:px-12 lg:py-24">
          {/* Esquerda: título fixo + índice com a linha azul */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div ref={headRef} className={cn(headIn ? 'animate-fade-up' : 'opacity-0')}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-accent">{t.eyebrow}</p>
              <h2 id="clareza-titulo" className="mt-4 font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[44px] lg:text-[48px]">
                {t.title[0]}
                <span className="text-accent">{t.title[1]}</span>
              </h2>
              <p className="mt-4 max-w-[420px] text-[16px] leading-[1.6] text-[#0B1030]/70 sm:text-[17px]">{t.sub}</p>
            </div>

            <ol className="relative mt-9 hidden space-y-1 lg:block" aria-label={t.eyebrow}>
              <span aria-hidden="true" className="absolute bottom-[22px] left-[5px] top-[22px] w-px bg-[#0B1030]/[0.08]" />
              <span
                aria-hidden="true"
                className="absolute left-[5px] top-[22px] w-px origin-top bg-gradient-to-b from-accent to-glow shadow-[0_0_8px_rgba(30,144,255,0.8)] transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ height: `calc(${active / 2} * (100% - 44px))` }}
              />
              {t.steps.map((s, i) => (
                <li key={s.n}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active === i ? 'step' : undefined}
                    className="group relative flex w-full items-center gap-4 rounded-xl py-2.5 pl-7 pr-3 text-left transition-colors hover:bg-[#0B1030]/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span
                      aria-hidden="true"
                      className={cn('absolute left-0 top-1/2 h-[11px] w-[11px] -translate-y-1/2 rounded-full border-2 transition-all duration-300', i <= active ? 'border-accent bg-accent shadow-[0_0_0_4px_rgba(0,82,255,0.12),0_0_10px_rgba(30,144,255,0.6)]' : 'border-[#0B1030]/20 bg-white')}
                    />
                    <span className={cn('font-display text-[16px] font-bold tracking-[-0.01em] transition-colors', active === i ? 'text-[#070D2B]' : 'text-[#0B1030]/40')}>
                      <span className="mr-2 text-[12px] text-accent">{s.n}</span>{s.name}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-6 hidden text-[12px] text-[#0B1030]/45 lg:block">{t.note}</p>
          </div>

          {/* Direita: três painéis de produto compactos */}
          <div className="grid gap-5">
            {t.steps.map((s, i) => (
              <article
                key={s.n}
                ref={(el) => { cards.current[i] = el }}
                data-i={i}
                className={cn(
                  'rounded-[22px] bg-white p-2 shadow-[0_30px_70px_-45px_rgba(11,16,48,0.55),0_0_0_1px_rgba(11,16,48,0.06)] transition-[box-shadow,transform] duration-500',
                  active === i && 'lg:shadow-[0_34px_80px_-40px_rgba(0,82,255,0.45),0_0_0_1px_rgba(0,82,255,0.18)]',
                )}
              >
                <header className="flex items-baseline justify-between gap-3 px-4 pb-3 pt-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold tracking-[0.14em] text-accent">{s.n} · <span className="uppercase">{s.name}</span></p>
                    <h3 className="mt-1 text-[17px] font-bold tracking-[-0.015em] text-[#070D2B] sm:text-[18px]">{s.line}</h3>
                  </div>
                </header>
                <Panel i={i} lang={lang} />
              </article>
            ))}
            <p className="text-[12px] text-[#0B1030]/45 lg:hidden">{t.note}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Painéis (estilo Finer Advisor) ---------------- */

function useOnce() {
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.35 })
  return { ref, on: reduced || inView }
}

function Frame({ title, children, innerRef }: { title: string; children: ReactNode; innerRef: Ref<HTMLDivElement> }) {
  return (
    <div ref={innerRef} className="overflow-hidden rounded-[16px] border border-[#0B1030]/[0.06] bg-[#F7F9FE]">
      <div className="flex h-10 items-center justify-between border-b border-[#0B1030]/[0.06] bg-white px-4">
        <span className="flex items-center gap-2 text-[12.5px] font-bold text-[#070D2B]">
          <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#070D2B]">
            <svg viewBox="0 0 326 445" className="h-2.5 w-2.5 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
          </span>
          {title}
        </span>
        <span className="rounded-full bg-[#0B1030]/[0.05] px-2 py-0.5 text-[10.5px] font-semibold text-[#0B1030]/50">Demo</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

const grow = (on: boolean, delay = 0) => ({ transform: `scaleX(${on ? 1 : 0})`, transitionDelay: `${delay}ms` })
const barCls = 'block h-full origin-left rounded-full transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]'

function Panel({ i, lang }: { i: number; lang: Lang }) {
  const { ref, on } = useOnce()
  const pt = lang === 'pt'

  if (i === 0) {
    return (
      <Frame innerRef={ref} title={pt ? 'Finer Home · Recebimentos' : 'Finer Home · Receivables'}>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-end">
          <div>
            <p className="text-[13px] font-semibold text-[#0B1030]/55">{pt ? 'Faturas por receber' : 'Invoices receivable'}</p>
            <p className="mt-1 font-display text-[32px] font-bold leading-none tracking-[-0.035em] text-[#070D2B] tabular-nums">{eur(TOTAL_OVERDUE, lang)}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[#FFF1E6] px-2.5 py-1 text-[12px] font-semibold text-[#B4530A]">{pt ? `${OVERDUE_COUNT} em atraso` : `${OVERDUE_COUNT} overdue`}</span>
              <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-[#0B1030]/65 ring-1 ring-[#0B1030]/[0.06]">{pt ? `${AVG_DAYS_LATE} dias em média` : `${AVG_DAYS_LATE} days on average`}</span>
            </div>
          </div>
          <div className="rounded-[12px] bg-white p-3.5 ring-1 ring-[#0B1030]/[0.05]">
            <p className="text-[13px] leading-snug text-[#070D2B]">
              {pt ? 'Um cliente concentra ' : 'One customer holds '}<strong className="text-accent">{pct(MAIN_CLIENT_SHARE, lang)}</strong>{pt ? ' do valor em atraso.' : ' of the overdue amount.'}
            </p>
            <span className="mt-2.5 block h-[8px] overflow-hidden rounded-full bg-[#0B1030]/[0.07]">
              <span className={cn(barCls, 'bg-gradient-to-r from-accent to-glow shadow-[0_0_8px_rgba(30,144,255,0.6)]')} style={{ width: `${MAIN_CLIENT_SHARE * 100}%`, ...grow(on, 200) }} />
            </span>
            <p className="mt-1.5 text-[11.5px] text-[#0B1030]/50">{pt ? 'Cliente A' : 'Customer A'} · {eur(MAIN_CLIENT_TOTAL, lang, 0)}</p>
          </div>
        </div>
      </Frame>
    )
  }

  if (i === 1) {
    const max = COMMITMENTS_TOTAL
    return (
      <Frame innerRef={ref} title={pt ? 'Tesouraria · próximos 15 dias' : 'Cash · next 15 days'}>
        <div className="space-y-3">
          {[
            { l: pt ? 'Saldo disponível' : 'Available balance', v: CASH.available, c: 'bg-gradient-to-r from-accent to-glow' },
            { l: pt ? 'Compromissos' : 'Commitments', v: COMMITMENTS_TOTAL, c: 'bg-[#94A3C8]' },
          ].map((r, k) => (
            <div key={r.l} className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)_auto] items-center gap-3">
              <span className="text-[13px] text-[#0B1030]/65">{r.l}</span>
              <span className="h-[8px] overflow-hidden rounded-full bg-[#0B1030]/[0.07]">
                <span className={cn(barCls, r.c)} style={{ width: `${(r.v / max) * 100}%`, ...grow(on, k * 150) }} />
              </span>
              <span className="text-[14px] font-bold text-[#070D2B] tabular-nums">{eur(r.v, lang, 0)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[#D9480F]/20 bg-[#FFF4EC] px-3.5 py-2.5 transition-opacity duration-500" style={{ opacity: on ? 1 : 0, transitionDelay: '500ms' }}>
          <span className="text-[13px] text-[#9A3F0A]">{pt ? 'Sem novas entradas, faltariam' : 'With no new inflows, short by'}</span>
          <strong className="font-display text-[18px] font-bold tracking-[-0.02em] text-[#D9480F] tabular-nums">{eur(Math.abs(CASH_GAP), lang)}</strong>
        </div>
      </Frame>
    )
  }

  const opexG = Math.round((COSTS.opex / COSTS.opexPrev - 1) * 100)
  const revG = Math.round((COSTS.revenue / COSTS.revenuePrev - 1) * 100)
  const recs = pt
    ? [
        { t: 'Contactar o Cliente A e confirmar uma data de pagamento', v: eur(MAIN_CLIENT_TOTAL, lang, 0) },
        { t: 'Rever o calendário de pagamentos dos próximos 15 dias', v: eur(COMMITMENTS_TOTAL, lang, 0) },
        { t: `Analisar as despesas: +${opexG}% face a +${revG}% nas receitas`, v: `+${opexG}%` },
      ]
    : [
        { t: 'Contact Customer A and confirm a payment date', v: eur(MAIN_CLIENT_TOTAL, lang, 0) },
        { t: 'Review the payment schedule for the next 15 days', v: eur(COMMITMENTS_TOTAL, lang, 0) },
        { t: `Review expenses: +${opexG}% vs +${revG}% revenue`, v: `+${opexG}%` },
      ]
  return (
    <Frame innerRef={ref} title={pt ? 'Finer Advisor · Recomendações' : 'Finer Advisor · Recommendations'}>
      <ol className="space-y-2">
        {recs.map((r, k) => (
          <li
            key={r.t}
            className={cn(
              'flex items-center gap-3 rounded-[12px] border px-3 py-2.5 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              k === 0 ? 'border-accent/45 bg-[#EEF3FF] shadow-[inset_3px_0_0_#0052FF,0_12px_26px_-18px_rgba(0,82,255,0.7)]' : 'border-[#0B1030]/[0.06] bg-white',
            )}
            style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translate3d(0,6px,0)', transitionDelay: `${150 + k * 130}ms` }}
          >
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold', k === 0 ? 'bg-accent text-white' : 'text-accent ring-1 ring-accent/25')}>{k + 1}</span>
            <span className="min-w-0 flex-1 text-[13.5px] font-semibold leading-snug text-[#070D2B]">{r.t}</span>
            <span className="hidden shrink-0 text-[12.5px] font-semibold text-[#0B1030]/55 tabular-nums sm:inline">{r.v}</span>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

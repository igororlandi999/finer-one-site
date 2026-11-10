import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import {
  AVG_DAYS_LATE, CASH, CASH_GAP, COMMITMENTS_TOTAL, COSTS, MAIN_CLIENT_SHARE, MAIN_CLIENT_TOTAL,
  OVERDUE_COUNT, TOTAL_OVERDUE, eur, pct,
} from './storyData'

type Key = 'receivables' | 'costs' | 'treasury'
type Lang = 'pt' | 'en'
const KEYS: Key[] = ['receivables', 'costs', 'treasury']

const revG = COSTS.revenue / COSTS.revenuePrev - 1 // +4%
const opexG = COSTS.opex / COSTS.opexPrev - 1 // +18%
const opexDelta = COSTS.opex - COSTS.opexPrev // 6.735
const revDelta = COSTS.revenue - COSTS.revenuePrev // 2.380

type Copy = {
  tab: string
  title: [string, string, string]
  sub: string
  indicatorLabel: string
  found: ReactNode
  next: string
  details: { data: string; interpretation: string; risks: string[]; recs: string[]; assumptions: string }
}

function content(lang: Lang): Record<Key, Copy> {
  const pt = lang === 'pt'
  return {
    receivables: {
      tab: pt ? 'Recebimentos' : 'Receivables',
      title: pt ? ['Faturar não é o mesmo que ', 'receber', '.'] : ['Invoicing is not the same as ', 'getting paid', '.'],
      sub: pt ? 'Descubra o que está por receber, o impacto na tesouraria e por onde começar.' : 'See what you are owed, the impact on cash and where to start.',
      indicatorLabel: pt ? 'Faturas por receber' : 'Invoices receivable',
      found: pt
        ? <>Um cliente concentra <Hl>{eur(MAIN_CLIENT_TOTAL, lang)}</Hl>, cerca de <Hl>{pct(MAIN_CLIENT_SHARE, lang)}</Hl> do valor em atraso.</>
        : <>One customer accounts for <Hl>{eur(MAIN_CLIENT_TOTAL, lang)}</Hl>, about <Hl>{pct(MAIN_CLIENT_SHARE, lang)}</Hl> of the overdue amount.</>,
      next: pt ? 'Priorizar o contacto com esse cliente e confirmar uma data de pagamento.' : 'Contact that customer first and confirm a payment date.',
      details: {
        data: pt
          ? `${OVERDUE_COUNT} faturas vencidas e não pagas, com valor, cliente e dias de atraso (média de ${AVG_DAYS_LATE} dias).`
          : `${OVERDUE_COUNT} overdue unpaid invoices, with amount, customer and days late (${AVG_DAYS_LATE} days on average).`,
        interpretation: pt
          ? 'Quase todo o valor em atraso depende de um único pagamento. Se este cliente atrasar mais, a entrada prevista desaparece quase por completo.'
          : 'Almost all of the overdue amount depends on one payment. If this customer delays further, the expected inflow almost disappears.',
        risks: pt
          ? ['Dependência de um único cliente.', `Atraso médio de ${AVG_DAYS_LATE} dias a pressionar a tesouraria.`]
          : ['Dependence on a single customer.', `${AVG_DAYS_LATE}-day average delay putting pressure on cash.`],
        recs: pt
          ? ['Contactar o cliente com maior valor em atraso.', 'Confirmar uma data de pagamento ou negociar uma solução.', 'Acompanhar as cobranças semanalmente.']
          : ['Contact the customer with the largest overdue amount.', 'Confirm a payment date or negotiate an arrangement.', 'Track collections weekly.'],
        assumptions: pt ? 'Considera apenas faturas já vencidas. Valores fictícios.' : 'Only past-due invoices are considered. Fictitious values.',
      },
    },
    costs: {
      tab: pt ? 'Custos' : 'Costs',
      title: pt ? ['As despesas crescem. ', 'E as receitas?', ''] : ['Expenses are growing. ', 'What about revenue?', ''],
      sub: pt ? 'Compare o crescimento das despesas com o das receitas e veja o que analisar primeiro.' : 'Compare expense growth with revenue growth and see what to look at first.',
      indicatorLabel: pt ? 'Face ao mês anterior' : 'Versus last month',
      found: pt
        ? <>As despesas estão a crescer <Hl>mais depressa</Hl> do que as receitas.</>
        : <>Expenses are growing <Hl>faster</Hl> than revenue.</>,
      next: pt ? 'Analisar as categorias de custos que mais contribuíram para o aumento.' : 'Review the cost categories that contributed most to the increase.',
      details: {
        data: pt ? 'Receitas e despesas operacionais do mês, comparadas com o mês anterior.' : 'Revenue and operating expenses for the month, compared with last month.',
        interpretation: pt
          ? `As despesas subiram ${eur(opexDelta, lang, 0)} (+${pct(opexG, lang, 0)}) e as receitas ${eur(revDelta, lang, 0)} (+${pct(revG, lang, 0)}). As despesas crescem mais de quatro vezes mais depressa.`
          : `Expenses rose ${eur(opexDelta, lang, 0)} (+${pct(opexG, lang, 0)}) and revenue ${eur(revDelta, lang, 0)} (+${pct(revG, lang, 0)}). Expenses are growing more than four times faster.`,
        risks: pt
          ? ['Se o ritmo se mantiver, as despesas podem pressionar o resultado.', `Três categorias concentram o aumento: fornecedores (+${eur(4120, lang, 0)}), subscrições (+${eur(1385, lang, 0)}) e energia (+${eur(1230, lang, 0)}).`]
          : ['If the pace continues, expenses may put pressure on results.', `Three categories account for the increase: suppliers (+${eur(4120, lang, 0)}), subscriptions (+${eur(1385, lang, 0)}) and energy (+${eur(1230, lang, 0)}).`],
        recs: pt
          ? ['Analisar as categorias que mais contribuíram.', 'Confirmar se o aumento é pontual ou recorrente.', 'Rever contratos e condições onde fizer sentido.']
          : ['Review the categories that contributed most.', 'Check whether the increase is one-off or recurring.', 'Review contracts and terms where it makes sense.'],
        assumptions: pt ? 'Comparação mês a mês. A análise indica onde investigar; não identifica causas. Valores fictícios.' : 'Month-on-month comparison. It shows where to look; it does not identify causes. Fictitious values.',
      },
    },
    treasury: {
      tab: pt ? 'Tesouraria' : 'Cash',
      title: pt ? ['Ter saldo não significa ter ', 'folga', '.'] : ['Having a balance does not mean having ', 'room', '.'],
      sub: pt ? 'Compare o saldo com os compromissos dos próximos 15 dias e saiba o que rever primeiro.' : 'Compare your balance with the next 15 days of commitments and know what to review first.',
      indicatorLabel: pt ? 'Próximos 15 dias' : 'Next 15 days',
      found: pt
        ? <>Sem novas entradas, existe um desfasamento potencial de <Hl tone="neg">{eur(Math.abs(CASH_GAP), lang)}</Hl>.</>
        : <>With no new inflows, there is a potential gap of <Hl tone="neg">{eur(Math.abs(CASH_GAP), lang)}</Hl>.</>,
      next: pt ? 'Rever o calendário de pagamentos e confirmar os recebimentos previstos.' : 'Review the payment schedule and confirm expected collections.',
      details: {
        data: pt
          ? `Saldo disponível hoje e compromissos previstos para 15 dias: salários ${eur(19600, lang, 0)}, fornecedores ${eur(12430, lang, 0)}, impostos e Segurança Social ${eur(6170, lang, 0)}.`
          : `Balance available today and commitments expected over 15 days: salaries ${eur(19600, lang, 0)}, suppliers ${eur(12430, lang, 0)}, taxes and social security ${eur(6170, lang, 0)}.`,
        interpretation: pt
          ? `${eur(CASH.available, lang)} − ${eur(COMMITMENTS_TOTAL, lang)} = ${eur(CASH_GAP, lang)}. Os compromissos das próximas duas semanas superam o saldo atual.`
          : `${eur(CASH.available, lang)} − ${eur(COMMITMENTS_TOTAL, lang)} = ${eur(CASH_GAP, lang)}. Commitments over the next two weeks exceed the current balance.`,
        risks: pt
          ? ['Pressão de tesouraria nas próximas duas semanas.', 'Dependência de recebimentos ainda não confirmados.']
          : ['Cash pressure over the next two weeks.', 'Dependence on collections not yet confirmed.'],
        recs: pt
          ? ['Rever o calendário de pagamentos.', 'Confirmar os recebimentos previstos.', 'Ordenar os pagamentos por vencimento e importância.']
          : ['Review the payment schedule.', 'Confirm expected collections.', 'Rank payments by due date and importance.'],
        assumptions: pt ? 'Cenário ilustrativo sem novas entradas no período; não é uma previsão. Valores fictícios.' : 'Illustrative scenario with no new inflows in the period; not a forecast. Fictitious values.',
      },
    },
  }
}

function Hl({ children, tone }: { children: ReactNode; tone?: 'neg' }) {
  return <strong className={cn('font-bold', tone === 'neg' ? 'text-[#D9480F]' : 'text-accent')}>{children}</strong>
}

/** Conta até ao valor ao mudar de exemplo (curto; imediato com movimento reduzido). */
function useCountUp(target: number, run: unknown, ms = 650) {
  const reduced = usePrefersReducedMotion()
  const [v, setV] = useState(target)
  useEffect(() => {
    if (reduced) { setV(target); return }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms)
      setV(target * (1 - Math.pow(1 - k, 3)))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, ms, reduced])
  return v
}

/** Barras e linha que "crescem" um instante depois de montar. */
function useGrow(dep: unknown) {
  const reduced = usePrefersReducedMotion()
  const [on, setOn] = useState(reduced)
  useEffect(() => {
    if (reduced) { setOn(true); return }
    setOn(false)
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)))
    return () => cancelAnimationFrame(id)
  }, [dep, reduced])
  return on
}

/**
 * Segunda secção: demonstração compacta e interativa.
 * O visitante escolhe Recebimentos, Custos ou Tesouraria e vê, numa só
 * composição, o indicador → o que a Finer One identifica → o próximo passo.
 * A análise completa abre-se dentro do próprio componente. Sem scroll preso.
 */
export function FinanceDemo() {
  const { lang } = useLanguage()
  const pt = lang === 'pt'
  const data = content(lang)
  const [key, setKey] = useState<Key>('receivables')
  const [open, setOpen] = useState(false)
  const c = data[key]
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 })
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const detailsId = useId()

  const select = (k: Key) => setKey(k)
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? KEYS.length - 1 : (i + dir + KEYS.length) % KEYS.length
    select(KEYS[next])
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="problema" aria-labelledby="demo-financeira-titulo" className="relative z-10 scroll-mt-16 bg-navy">
      <div className="relative rounded-[28px] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F7FD_100%)] sm:mx-3 sm:rounded-[40px]">
        <div ref={ref} className={cn('relative mx-auto grid max-w-[1200px] gap-8 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-center lg:gap-14 lg:px-12 lg:py-20', inView ? 'animate-fade-up' : 'opacity-0')}>
          {/* Texto (≈40%): o título acompanha o exemplo escolhido */}
          <div>
            <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-accent">
              <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-accent" />
              {pt ? 'Exemplos práticos · dados fictícios' : 'Practical examples · fictitious data'}
            </p>
            <div className="min-h-[76px] sm:min-h-[96px] lg:min-h-[150px]">
              <h2 id="demo-financeira-titulo" key={`t-${key}`} className="fo-swap mt-4 text-balance font-display text-[30px] font-bold leading-[1.08] tracking-[-0.032em] text-[#070D2B] sm:text-[40px] lg:text-[42px] xl:text-[46px]">
                {c.title[0]}<span className="text-accent">{c.title[1]}</span>{c.title[2]}
              </h2>
            </div>
            <p key={`s-${key}`} className="fo-swap mt-3 min-h-[78px] max-w-[460px] text-[16px] leading-[1.6] text-[#0B1030]/70 sm:min-h-[56px] sm:text-[17px] lg:min-h-[82px]">{c.sub}</p>
            <div role="tablist" aria-label={pt ? 'Escolha um exemplo' : 'Choose an example'} className="mt-6 grid grid-cols-3 rounded-full border border-[#0B1030]/[0.08] bg-white p-1 shadow-[0_10px_30px_-20px_rgba(11,16,48,0.45)] sm:max-w-[460px]">
              {KEYS.map((k, i) => (
                <button
                  key={k}
                  ref={(el) => { tabRefs.current[i] = el }}
                  type="button"
                  role="tab"
                  id={`demo-tab-${k}`}
                  aria-selected={key === k}
                  aria-controls="demo-painel"
                  tabIndex={key === k ? 0 : -1}
                  onClick={() => select(k)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={cn(
                    'min-h-[44px] whitespace-nowrap rounded-full px-1.5 text-[13px] font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:px-3 sm:text-[14.5px]',
                    key === k ? 'bg-[#070D2B] text-white shadow-[0_6px_16px_-8px_rgba(7,13,43,0.8)]' : 'text-[#0B1030]/60 hover:text-[#070D2B]',
                  )}
                >
                  {data[k].tab}
                </button>
              ))}
            </div>
          </div>

          {/* Painel (≈60%) no estilo do Finer Advisor */}
          <div id="demo-painel" role="tabpanel" aria-labelledby={`demo-tab-${key}`} className="overflow-hidden rounded-[24px] bg-white shadow-[0_40px_100px_-50px_rgba(11,16,48,0.55),0_0_0_1px_rgba(11,16,48,0.06)]">
            <div className="flex h-[52px] items-center justify-between border-b border-[#0B1030]/[0.07] px-5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#070D2B]">
                  <svg viewBox="0 0 326 445" className="h-3.5 w-3.5 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
                </span>
                <span className="whitespace-nowrap text-[14px] font-bold text-[#070D2B]">Finer Advisor</span>
                <span className="hidden truncate text-[13px] text-[#0B1030]/45 sm:inline">{pt ? 'Análise' : 'Analysis'} · {c.tab}</span>
              </div>
              <span className="shrink-0 rounded-full bg-[#0B1030]/[0.05] px-2.5 py-1 text-[11px] font-semibold text-[#0B1030]/55">{pt ? 'Dados fictícios' : 'Fictitious data'}</span>
            </div>

            <Flow k={key} c={c} lang={lang} />

            {/* Análise completa (expansão no próprio componente) */}
            <div className="border-t border-[#0B1030]/[0.07]">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={detailsId}
                onClick={() => setOpen((o) => !o)}
                className="group flex w-full items-center justify-center gap-2 py-4 text-[14px] font-semibold text-accent transition-colors hover:bg-[#F7F9FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
              >
                {open ? (pt ? 'Fechar a análise completa' : 'Close the full analysis') : (pt ? 'Explorar a análise completa' : 'Explore the full analysis')}
                <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} aria-hidden="true" />
              </button>
              <div id={detailsId} className={cn('grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                <div className="overflow-hidden" inert={!open}>
                  <Details key={key} c={c} lang={lang} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Indicador → Descoberta → Próximo passo ---------------- */
function Flow({ k, c, lang }: { k: Key; c: Copy; lang: Lang }) {
  const pt = lang === 'pt'
  const on = useGrow(k)
  const steps = pt ? ['Indicador', 'O que a Finer One identifica', 'Próximo passo'] : ['Indicator', 'What Finer One finds', 'Next step']

  return (
    <div className="relative min-h-[700px] px-5 py-6 sm:min-h-[600px] sm:px-7 sm:py-7">
      {/* Linha azul: liga o indicador à descoberta e à recomendação */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-12 left-[25px] top-[34px] w-px bg-[#0B1030]/[0.08] sm:left-[33px] sm:top-[36px]">
        <span
          className={cn('absolute inset-0 origin-top bg-gradient-to-b from-accent to-glow shadow-[0_0_10px_rgba(30,144,255,0.75)] transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]', on ? 'scale-y-100' : 'scale-y-0')}
        />
      </div>

      <ol className="relative grid gap-6">
        {steps.map((label, i) => (
          <li key={label} className="relative pl-8">
            <span
              aria-hidden="true"
              className="absolute left-0 top-[2px] h-[11px] w-[11px] rounded-full border-2 transition-all duration-500"
              style={{
                borderColor: on ? '#0052FF' : 'rgba(11,16,48,0.2)',
                backgroundColor: on ? '#0052FF' : '#fff',
                boxShadow: on ? '0 0 0 4px rgba(0,82,255,0.12), 0 0 12px rgba(30,144,255,0.6)' : 'none',
                transitionDelay: on ? `${i * 280}ms` : '0ms',
              }}
            />
            <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#0B1030]/50">
              <span className="mr-1.5 text-accent">0{i + 1}</span>{label}
            </p>
            <div key={`${k}-${i}`} className={cn('fo-swap mt-2.5', i === 0 && 'min-h-[132px] sm:min-h-[118px]', i === 1 && 'min-h-[118px] sm:min-h-[96px]')} style={{ animationDelay: `${i * 90}ms` }}>
              {i === 0 && <Indicator k={k} c={c} lang={lang} on={on} />}
              {i === 1 && <Discovery k={k} c={c} lang={lang} on={on} />}
              {i === 2 && <NextStep c={c} lang={lang} />}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Indicator({ k, c, lang, on }: { k: Key; c: Copy; lang: Lang; on: boolean }) {
  const pt = lang === 'pt'
  const total = useCountUp(TOTAL_OVERDUE, k)
  if (k === 'receivables') {
    return (
      <div>
        <p className="text-[14px] font-semibold text-[#0B1030]/55">{c.indicatorLabel}</p>
        <p className="mt-1 font-display text-[34px] font-bold leading-none tracking-[-0.035em] text-[#070D2B] tabular-nums sm:text-[40px]">{eur(total, lang)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#FFF1E6] px-3 py-1.5 text-[13.5px] font-semibold text-[#B4530A]">{pt ? `${OVERDUE_COUNT} faturas em atraso` : `${OVERDUE_COUNT} overdue invoices`}</span>
          <span className="rounded-full bg-[#0B1030]/[0.05] px-3 py-1.5 text-[13.5px] font-semibold text-[#0B1030]/70">{pt ? `${AVG_DAYS_LATE} dias de atraso médio` : `${AVG_DAYS_LATE} days late on average`}</span>
        </div>
      </div>
    )
  }
  if (k === 'costs') {
    return (
      <div className="space-y-4">
        <p className="text-[14px] font-semibold text-[#0B1030]/55">{c.indicatorLabel}</p>
        <GrowthRow label={pt ? 'Despesas' : 'Expenses'} value={`+${pct(opexG, lang, 0)}`} ratio={opexG / 0.2} tone="neg" on={on} />
        <GrowthRow label={pt ? 'Receitas' : 'Revenue'} value={`+${pct(revG, lang, 0)}`} ratio={revG / 0.2} on={on} delay={120} />
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <p className="text-[14px] font-semibold text-[#0B1030]/55">{c.indicatorLabel}</p>
      <GrowthRow label={pt ? 'Saldo disponível' : 'Available balance'} value={eur(CASH.available, lang)} ratio={CASH.available / COMMITMENTS_TOTAL} on={on} big />
      <GrowthRow label={pt ? 'Compromissos' : 'Commitments'} value={eur(COMMITMENTS_TOTAL, lang)} ratio={1} tone="muted" on={on} delay={120} big />
    </div>
  )
}

function GrowthRow({ label, value, ratio, tone = 'accent', on, delay = 0, big }: { label: string; value: string; ratio: number; tone?: 'accent' | 'neg' | 'muted'; on: boolean; delay?: number; big?: boolean }) {
  const color = tone === 'neg' ? 'bg-[#D9480F]' : tone === 'muted' ? 'bg-[#94A3C8]' : 'bg-gradient-to-r from-accent to-glow'
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-medium text-[#0B1030]/70">{label}</span>
        <span className={cn('font-display font-bold tracking-[-0.03em] tabular-nums', big ? 'text-[20px]' : 'text-[28px]', tone === 'neg' ? 'text-[#D9480F]' : 'text-[#070D2B]')}>{value}</span>
      </div>
      <span className="mt-2 block h-[8px] overflow-hidden rounded-full bg-[#0B1030]/[0.06]">
        <span className={cn('block h-full origin-left rounded-full transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]', color)} style={{ width: `${Math.min(100, Math.max(3, ratio * 100))}%`, transform: `scaleX(${on ? 1 : 0})`, transitionDelay: `${delay}ms` }} />
      </span>
    </div>
  )
}

function Discovery({ k, c, lang, on }: { k: Key; c: Copy; lang: Lang; on: boolean }) {
  const pt = lang === 'pt'
  return (
    <div>
      <p className="text-[17px] font-semibold leading-[1.45] tracking-[-0.01em] text-[#070D2B] sm:text-[18px]">{c.found}</p>
      <div className="mt-5">
        {k === 'receivables' && (
          <div>
            <div className="flex h-[10px] overflow-hidden rounded-full bg-[#0B1030]/[0.07]">
              <span className="block h-full origin-left rounded-full bg-gradient-to-r from-accent to-glow shadow-[0_0_10px_rgba(30,144,255,0.6)] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ width: `${MAIN_CLIENT_SHARE * 100}%`, transform: `scaleX(${on ? 1 : 0})`, transitionDelay: '200ms' }} />
            </div>
            <div className="mt-2 flex justify-between text-[12.5px] text-[#0B1030]/55">
              <span>{pt ? 'Cliente A' : 'Customer A'} · {pct(MAIN_CLIENT_SHARE, lang)}</span>
              <span>{pt ? 'Outros 3 clientes' : 'Other 3 customers'} · {pct(1 - MAIN_CLIENT_SHARE, lang)}</span>
            </div>
          </div>
        )}
        {k === 'costs' && (
          <p className="inline-flex items-baseline gap-2 rounded-[12px] bg-[#FFF4EC] px-3.5 py-2.5 text-[13.5px] text-[#9A3F0A]">
            <strong className="font-display text-[22px] font-bold tracking-[-0.02em]">{Math.round((opexG - revG) * 100)} p.p.</strong>
            {pt ? 'de diferença no crescimento' : 'growth gap'}
          </p>
        )}
        {k === 'treasury' && (
          <p className="inline-flex items-baseline gap-2 rounded-[12px] bg-[#FFF4EC] px-3.5 py-2.5 text-[13.5px] text-[#9A3F0A]">
            <strong className="font-display text-[22px] font-bold tracking-[-0.02em]">{pct(CASH.available / COMMITMENTS_TOTAL, lang, 0)}</strong>
            {pt ? 'dos compromissos cobertos pelo saldo' : 'of commitments covered by the balance'}
          </p>
        )}
      </div>
    </div>
  )
}

function NextStep({ c, lang }: { c: Copy; lang: Lang }) {
  const pt = lang === 'pt'
  return (
    <div className="rounded-[16px] border border-accent/40 bg-[#EEF3FF] p-4 shadow-[inset_3px_0_0_#0052FF,0_16px_34px_-20px_rgba(0,82,255,0.7)]">
      <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">{pt ? 'Prioridade' : 'Priority'}</span>
      <p className="mt-3 text-[16px] font-semibold leading-[1.45] text-[#070D2B]">{c.next}</p>
    </div>
  )
}

/* ---------------- Análise completa ---------------- */
function Details({ c, lang }: { c: Copy; lang: Lang }) {
  const pt = lang === 'pt'
  const d = c.details
  return (
    <div className="grid gap-3 bg-[#F7F9FE] px-5 pb-6 pt-2 sm:grid-cols-2 sm:px-7">
      <Block title={pt ? 'Dados utilizados' : 'Data used'}><p>{d.data}</p></Block>
      <Block title={pt ? 'Interpretação financeira' : 'Financial interpretation'}><p>{d.interpretation}</p></Block>
      <Block title={pt ? 'Riscos identificados' : 'Risks identified'}>
        <ul className="space-y-1.5">{d.risks.map((r) => <li key={r} className="flex gap-2"><span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[#D9480F]" />{r}</li>)}</ul>
      </Block>
      <Block title={pt ? 'Recomendações Finer One' : 'Finer One recommendations'} className="sm:col-span-2">
        <ol className="grid gap-2 sm:grid-cols-3">
          {d.recs.map((r, i) => (
            <li key={r} className={cn('flex items-start gap-2.5 rounded-[12px] border px-3 py-2.5', i === 0 ? 'border-accent/40 bg-[#EEF3FF]' : 'border-[#0B1030]/[0.07] bg-white')}>
              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', i === 0 ? 'bg-accent text-white' : 'text-accent ring-1 ring-accent/25')}>{i + 1}</span>
              {r}
            </li>
          ))}
        </ol>
      </Block>
      <Block title={pt ? 'Pressupostos' : 'Assumptions'}><p>{d.assumptions}</p></Block>
    </div>
  )
}

function Block({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[16px] bg-white p-5 text-[14px] leading-[1.55] text-[#0B1030]/75 shadow-[0_0_0_1px_rgba(11,16,48,0.05)]', className)}>
      <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#070D2B]">{title}</p>
      {children}
    </div>
  )
}

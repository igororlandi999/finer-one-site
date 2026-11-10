import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowUp } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import {
  AVG_DAYS_LATE, COSTS, MAIN_CLIENT_SHARE, MAIN_CLIENT_TOTAL, OVERDUE_COUNT, TOTAL_OVERDUE,
  TREASURY, TREASURY_COMMITMENTS, TREASURY_GAP, eur, pct,
} from './storyData'

type Key = 'receivables' | 'costs' | 'treasury'
type Lang = 'pt' | 'en'

type Scenario = {
  tab: string
  question: string
  context: string
  kpis: { label: string; value: string; tone?: 'neg' | 'accent' }[]
  chartTitle: string
  shows: string[]
  recs: string[]
}

function scenarios(lang: Lang): Record<Key, Scenario> {
  const pt = lang === 'pt'
  const revG = COSTS.revenue / COSTS.revenuePrev - 1
  const opexG = COSTS.opex / COSTS.opexPrev - 1
  const opexDelta = COSTS.opex - COSTS.opexPrev
  return {
    receivables: {
      tab: pt ? 'Recebimentos' : 'Receivables',
      question: pt ? 'Quem ainda não pagou?' : 'Who still hasn’t paid?',
      context: pt
        ? 'O caso que acabou de ver: valor em atraso concentrado num cliente, com impacto na tesouraria das próximas semanas.'
        : 'The case you just saw: overdue amount concentrated in one customer, with an impact on the coming weeks’ cash.',
      kpis: [
        { label: pt ? 'Por receber' : 'Receivable', value: eur(TOTAL_OVERDUE, lang) },
        { label: pt ? 'Faturas em atraso' : 'Overdue invoices', value: String(OVERDUE_COUNT) },
        { label: pt ? 'Concentração' : 'Concentration', value: pct(MAIN_CLIENT_SHARE, lang), tone: 'accent' },
      ],
      chartTitle: pt ? 'Valor em atraso por cliente' : 'Overdue amount by customer',
      shows: pt
        ? [`Atraso médio de ${AVG_DAYS_LATE} dias.`, `O Cliente A concentra ${eur(MAIN_CLIENT_TOTAL, lang)} do total.`]
        : [`${AVG_DAYS_LATE} days late on average.`, `Customer A accounts for ${eur(MAIN_CLIENT_TOTAL, lang)} of the total.`],
      recs: pt
        ? ['Contactar primeiro o Cliente A.', 'Confirmar datas de pagamento.', 'Acompanhar as cobranças semanalmente.']
        : ['Contact Customer A first.', 'Confirm payment dates.', 'Track collections weekly.'],
    },
    costs: {
      tab: pt ? 'Custos' : 'Costs',
      question: pt ? 'Onde estou a perder margem?' : 'Where am I losing margin?',
      context: pt
        ? 'Face ao mês anterior, as despesas operacionais cresceram bem mais do que as receitas. O resultado sente-se na margem.'
        : 'Compared with last month, operating expenses grew much faster than revenue. The margin feels it.',
      kpis: [
        { label: pt ? 'Receitas' : 'Revenue', value: `+${pct(revG, lang, 0)}` },
        { label: pt ? 'Despesas operacionais' : 'Operating expenses', value: `+${pct(opexG, lang, 0)}`, tone: 'neg' },
        { label: pt ? 'Aumento das despesas' : 'Expense increase', value: eur(opexDelta, lang, 0) },
      ],
      chartTitle: pt ? 'Crescimento face ao mês anterior' : 'Growth vs. last month',
      shows: pt
        ? [`As despesas subiram ${eur(opexDelta, lang, 0)}, sobretudo em três categorias.`, 'O desfasamento entre receitas e despesas reduz a margem do período.']
        : [`Expenses rose ${eur(opexDelta, lang, 0)}, mostly in three categories.`, 'The gap between revenue and expense growth reduces the period’s margin.'],
      recs: pt
        ? ['Analisar as três categorias com maior aumento.', 'Confirmar se o aumento é pontual ou recorrente.', 'Rever contratos e condições onde fizer sentido.']
        : ['Review the three categories with the biggest increase.', 'Check whether the increase is one-off or recurring.', 'Review contracts and terms where it makes sense.'],
    },
    treasury: {
      tab: pt ? 'Tesouraria' : 'Cash',
      question: pt ? 'Tenho dinheiro para os próximos 30 dias?' : 'Do I have enough cash for the next 30 days?',
      context: pt
        ? 'Os compromissos previstos para os próximos 30 dias superam o saldo disponível somado às entradas já confirmadas.'
        : 'Commitments expected over the next 30 days exceed the available balance plus confirmed inflows.',
      kpis: [
        { label: pt ? 'Disponível + entradas confirmadas' : 'Available + confirmed inflows', value: eur(TREASURY.available + TREASURY.confirmedInflows, lang) },
        { label: pt ? 'Compromissos (30 dias)' : 'Commitments (30 days)', value: eur(TREASURY_COMMITMENTS, lang) },
        { label: pt ? 'Diferença' : 'Difference', value: eur(TREASURY_GAP, lang), tone: 'neg' },
      ],
      chartTitle: pt ? 'Liquidez vs. compromissos (30 dias)' : 'Liquidity vs. commitments (30 days)',
      shows: pt
        ? ['Pressupõe só entradas já confirmadas; não inclui vendas futuras.', 'Salários e fornecedores representam a maior parte dos compromissos.']
        : ['Assumes only confirmed inflows; excludes future sales.', 'Salaries and suppliers make up most of the commitments.'],
      recs: pt
        ? ['Ordenar os pagamentos por data e importância.', 'Acelerar os recebimentos com maior valor.', 'Negociar prazos onde houver margem.']
        : ['Rank payments by date and importance.', 'Speed up the largest collections.', 'Negotiate terms where there is room.'],
    },
  }
}

/**
 * Outros exemplos: o empresário escolhe uma preocupação e a análise
 * atualiza-se (contexto, indicadores, gráfico, interpretação e recomendações).
 * Demonstração ilustrativa com dados fictícios.
 */
export function ScenarioExplorer() {
  const { lang } = useLanguage()
  const pt = lang === 'pt'
  const data = scenarios(lang)
  const [key, setKey] = useState<Key>('receivables')
  const s = data[key]

  return (
    <div className="mt-24 lg:mt-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">{pt ? 'Outros exemplos' : 'More examples'}</p>
          <h3 className="mt-3 font-display text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-[#070D2B] sm:text-[34px]">
            {pt ? 'Escolha uma preocupação.' : 'Pick a concern.'} <span className="text-accent">{pt ? 'Veja a análise.' : 'See the analysis.'}</span>
          </h3>
        </div>
        <div role="tablist" aria-label={pt ? 'Exemplos de análise' : 'Analysis examples'} className="inline-flex w-full rounded-full border border-[#0B1030]/[0.08] bg-white p-1 shadow-[0_8px_24px_-18px_rgba(11,16,48,0.4)] sm:w-auto">
          {(Object.keys(data) as Key[]).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              id={`tab-${k}`}
              aria-selected={key === k}
              aria-controls="cenario-painel"
              onClick={() => setKey(k)}
              className={cn(
                'flex-1 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex-none sm:px-5',
                key === k ? 'bg-[#070D2B] text-white' : 'text-[#0B1030]/60 hover:text-[#070D2B]',
              )}
            >
              {data[k].tab}
            </button>
          ))}
        </div>
      </div>

      <div id="cenario-painel" role="tabpanel" aria-labelledby={`tab-${key}`} className="mt-8 overflow-hidden rounded-[24px] border border-[#0B1030]/[0.07] bg-white shadow-[0_30px_80px_-50px_rgba(11,16,48,0.5)]">
        <div key={key} className="grid animate-fade-up lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Contexto, indicadores e gráfico */}
          <div className="p-6 sm:p-8">
            <div className="flex max-w-[420px] items-center gap-3 rounded-full border border-[#0B1030]/[0.1] bg-[#FBFCFF] py-1.5 pl-4 pr-1.5">
              <span className="min-w-0 flex-1 text-[14px] font-medium text-[#070D2B]">{s.question}</span>
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white"><ArrowUp className="h-3.5 w-3.5" /></span>
            </div>
            <p className="mt-5 max-w-[520px] text-[15.5px] leading-[1.6] text-[#0B1030]/75">{s.context}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {s.kpis.map((k) => (
                <div key={k.label} className="rounded-[14px] border border-[#0B1030]/[0.07] bg-[#FBFCFF] px-4 py-3">
                  <p className="text-[12px] font-semibold text-[#0B1030]/50">{k.label}</p>
                  <p className={cn('mt-1 text-[19px] font-bold tracking-[-0.02em] text-[#070D2B] tabular-nums', k.tone === 'neg' && 'text-[#D9480F]', k.tone === 'accent' && 'text-accent')}>{k.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-7 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#0B1030]/45">{s.chartTitle}</p>
            <div className="mt-3">
              {key === 'receivables' && <ReceivablesChart lang={lang} />}
              {key === 'costs' && <CostsChart lang={lang} />}
              {key === 'treasury' && <TreasuryChart lang={lang} />}
            </div>
          </div>

          {/* Interpretação e recomendações (composição do Finer Advisor) */}
          <div className="border-t border-[#0B1030]/[0.07] bg-[#F7F9FE] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="rounded-[14px] bg-white p-5 shadow-[0_0_0_1px_rgba(11,16,48,0.05)]">
              <p className="text-[15px] font-bold text-[#070D2B]">{pt ? 'O que os dados mostram' : 'What the data shows'}</p>
              <ul className="mt-3 space-y-2">
                {s.shows.map((x) => (
                  <li key={x} className="flex gap-2 text-[14px] leading-[1.5] text-[#0B1030]/75"><span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[#0B1030]/60" />{x}</li>
                ))}
              </ul>
            </div>
            <p className="mt-6 text-[15px] font-bold text-[#070D2B]">{pt ? 'Recomendações Finer One' : 'Finer One recommendations'}</p>
            <ol className="mt-3 space-y-2">
              {s.recs.map((r, i) => (
                <li key={r} className={cn('flex items-center gap-3 rounded-[12px] border px-3.5 py-3 text-[14px] font-medium text-[#070D2B]', i === 0 ? 'border-accent/50 bg-[#EEF3FF] shadow-[inset_3px_0_0_#0052FF,0_12px_26px_-16px_rgba(0,82,255,0.6)]' : 'border-[#0B1030]/[0.07] bg-white')}>
                  <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold', i === 0 ? 'bg-accent text-white' : 'bg-white text-accent ring-1 ring-accent/25')}>{i + 1}</span>
                  {r}
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[12px] text-[#0B1030]/45">{pt ? 'Exemplo ilustrativo · dados fictícios. Não constitui uma previsão nem aconselhamento.' : 'Illustrative example · fictitious data. Not a forecast or advice.'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Barras que crescem ao montar (cada troca de exemplo volta a animar). */
function useGrow() {
  const reduced = usePrefersReducedMotion()
  const [on, setOn] = useState(reduced)
  useEffect(() => {
    if (reduced) return
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)))
    return () => cancelAnimationFrame(id)
  }, [reduced])
  return on
}

function Bar({ label, value, ratio, tone = 'accent', delay = 0, on }: { label: ReactNode; value: string; ratio: number; tone?: 'accent' | 'muted' | 'neg'; delay?: number; on: boolean }) {
  const color = tone === 'accent' ? 'bg-gradient-to-r from-accent to-glow' : tone === 'neg' ? 'bg-[#D9480F]' : 'bg-[#0B1030]/20'
  return (
    <div className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)_auto] items-center gap-3 text-[13.5px]">
      <span className="truncate text-[#0B1030]/70">{label}</span>
      <span className="h-[10px] overflow-hidden rounded-full bg-[#0B1030]/[0.06]">
        <span className={cn('block h-full origin-left rounded-full transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]', color)} style={{ width: `${Math.max(2, ratio * 100)}%`, transform: `scaleX(${on ? 1 : 0})`, transitionDelay: `${delay}ms` }} />
      </span>
      <span className="text-right font-semibold tabular-nums text-[#070D2B]">{value}</span>
    </div>
  )
}

function ReceivablesChart({ lang }: { lang: Lang }) {
  const on = useGrow()
  const pt = lang === 'pt'
  const rows = [
    { l: pt ? 'Cliente A' : 'Customer A', v: MAIN_CLIENT_TOTAL },
    { l: pt ? 'Cliente B' : 'Customer B', v: 2480 },
    { l: pt ? 'Cliente C' : 'Customer C', v: 1968.6 },
    { l: pt ? 'Cliente D' : 'Customer D', v: 1500 },
  ]
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <Bar key={r.l} on={on} delay={i * 90} label={r.l} value={eur(r.v, lang, 0)} ratio={r.v / MAIN_CLIENT_TOTAL} tone={i === 0 ? 'accent' : 'muted'} />
      ))}
    </div>
  )
}

function CostsChart({ lang }: { lang: Lang }) {
  const on = useGrow()
  const pt = lang === 'pt'
  const revG = COSTS.revenue / COSTS.revenuePrev - 1
  const opexG = COSTS.opex / COSTS.opexPrev - 1
  const names: Record<string, string> = pt
    ? { suppliers: 'Fornecedores', subscriptions: 'Subscrições e serviços', energy: 'Energia' }
    : { suppliers: 'Suppliers', subscriptions: 'Subscriptions & services', energy: 'Energy' }
  const maxDelta = Math.max(...COSTS.categories.map((c) => c.delta))
  return (
    <div>
      <div className="space-y-2.5">
        <Bar on={on} label={pt ? 'Receitas' : 'Revenue'} value={`+${pct(revG, lang, 0)}`} ratio={revG / 0.2} tone="muted" />
        <Bar on={on} delay={90} label={pt ? 'Despesas' : 'Expenses'} value={`+${pct(opexG, lang, 0)}`} ratio={opexG / 0.2} tone="neg" />
      </div>
      <p className="mt-5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#0B1030]/45">{pt ? 'Categorias a analisar' : 'Categories to review'}</p>
      <div className="mt-3 space-y-2.5">
        {COSTS.categories.map((c, i) => (
          <Bar key={c.key} on={on} delay={180 + i * 90} label={names[c.key]} value={`+${eur(c.delta, lang, 0)}`} ratio={c.delta / maxDelta} />
        ))}
      </div>
    </div>
  )
}

function TreasuryChart({ lang }: { lang: Lang }) {
  const on = useGrow()
  const pt = lang === 'pt'
  const max = TREASURY_COMMITMENTS
  const names: Record<string, string> = pt
    ? { salaries: 'Salários', suppliers: 'Fornecedores', taxes: 'Impostos e SS' }
    : { salaries: 'Salaries', suppliers: 'Suppliers', taxes: 'Taxes & SS' }
  return (
    <div className="space-y-2.5">
      <Bar on={on} label={pt ? 'Saldo disponível' : 'Available'} value={eur(TREASURY.available, lang, 0)} ratio={TREASURY.available / max} />
      <Bar on={on} delay={90} label={pt ? 'Entradas confirmadas' : 'Confirmed inflows'} value={eur(TREASURY.confirmedInflows, lang, 0)} ratio={TREASURY.confirmedInflows / max} />
      {TREASURY.commitments.map((c, i) => (
        <Bar key={c.key} on={on} delay={180 + i * 90} label={names[c.key]} value={`−${eur(c.amount, lang, 0)}`} ratio={c.amount / max} tone="muted" />
      ))}
      <Bar on={on} delay={480} label={<strong className="text-[#070D2B]">{pt ? 'Diferença' : 'Difference'}</strong>} value={eur(TREASURY_GAP, lang, 0)} ratio={Math.abs(TREASURY_GAP) / max} tone="neg" />
    </div>
  )
}

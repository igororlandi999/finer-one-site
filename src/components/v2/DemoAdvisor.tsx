import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ArrowUpRight, CheckCircle2, Search, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

type Answer = {
  question: string
  metricLabel: string
  metric: string
  bars: { label: string; value: number }[]
  shows: string
  recommendation: string
}

const copy: Record<Lang, { kicker: string; title: [string, string]; sub: string; app: string; pick: string; ask: string; example: string; showsLabel: string; recLabel: string; note: string; answers: Answer[] }> = {
  pt: {
    kicker: 'Demonstração',
    title: ['Pergunte. ', 'A Finer One responde.'],
    sub: 'Escolha uma pergunta e veja como a plataforma transforma números em respostas e recomendações.',
    app: 'Finer Home',
    pick: 'Escolha uma pergunta sobre a empresa',
    ask: 'O que gostaria de saber sobre a sua empresa?',
    example: 'Exemplo',
    showsLabel: 'O que os dados mostram',
    recLabel: 'Recomendação Finer One',
    note: 'Valores demonstrativos. Não correspondem a nenhuma empresa real.',
    answers: [
      {
        question: 'Quanto tenho por receber?',
        metricLabel: 'Recebimentos por acompanhar',
        metric: '€12.450',
        bars: [
          { label: 'Até 30 dias', value: 46 },
          { label: '31–60 dias', value: 32 },
          { label: '+60 dias', value: 22 },
        ],
        shows: 'Existem valores por receber que podem afetar a disponibilidade de caixa.',
        recommendation: 'Reveja os pagamentos vencidos e identifique os clientes a contactar primeiro.',
      },
      {
        question: 'Como está a minha tesouraria?',
        metricLabel: 'Saldo disponível hoje',
        metric: '€48.320',
        bars: [
          { label: 'Entradas previstas', value: 58 },
          { label: 'Saídas previstas', value: 72 },
          { label: 'Margem de segurança', value: 30 },
        ],
        shows: 'As saídas previstas para as próximas semanas são superiores às entradas já confirmadas.',
        recommendation: 'Antecipe a cobrança das faturas de maior valor e reavalie pagamentos não urgentes.',
      },
      {
        question: 'Onde estou a gastar mais?',
        metricLabel: 'Maior categoria de despesa',
        metric: 'Fornecedores · 38%',
        bars: [
          { label: 'Fornecedores', value: 38 },
          { label: 'Pessoal', value: 31 },
          { label: 'Serviços e subscrições', value: 17 },
        ],
        shows: 'Os custos com fornecedores cresceram face ao trimestre anterior, acima do ritmo das receitas.',
        recommendation: 'Compare condições com fornecedores alternativos e renegocie prazos de pagamento.',
      },
    ],
  },
  en: {
    kicker: 'Demo',
    title: ['Ask. ', 'Finer One answers.'],
    sub: 'Pick a question and see how the platform turns numbers into answers and recommendations.',
    app: 'Finer Home',
    pick: 'Pick a question about the company',
    ask: 'What would you like to know about your company?',
    example: 'Example',
    showsLabel: 'What the data shows',
    recLabel: 'Finer One recommendation',
    note: 'Demo values. They do not correspond to any real company.',
    answers: [
      {
        question: 'How much am I owed?',
        metricLabel: 'Receivables to follow up',
        metric: '€12,450',
        bars: [
          { label: 'Up to 30 days', value: 46 },
          { label: '31–60 days', value: 32 },
          { label: '60+ days', value: 22 },
        ],
        shows: 'There are outstanding amounts that may affect cash availability.',
        recommendation: 'Review overdue payments and identify which customers to contact first.',
      },
      {
        question: 'How is my cash position?',
        metricLabel: 'Available balance today',
        metric: '€48,320',
        bars: [
          { label: 'Expected inflows', value: 58 },
          { label: 'Expected outflows', value: 72 },
          { label: 'Safety margin', value: 30 },
        ],
        shows: 'Expected outflows for the coming weeks exceed the inflows already confirmed.',
        recommendation: 'Bring forward collection of the largest invoices and reassess non-urgent payments.',
      },
      {
        question: 'Where am I spending the most?',
        metricLabel: 'Largest expense category',
        metric: 'Suppliers · 38%',
        bars: [
          { label: 'Suppliers', value: 38 },
          { label: 'Payroll', value: 31 },
          { label: 'Services and subscriptions', value: 17 },
        ],
        shows: 'Supplier costs grew versus the previous quarter, faster than revenue.',
        recommendation: 'Compare terms with alternative suppliers and renegotiate payment terms.',
      },
    ],
  },
}

/**
 * Demonstração interativa (secção clara), a partir da proposta "Finer Home —
 * Demonstração" do documento de ideias do site. Tablist acessível; a resposta
 * reentra a cada troca (key = índice) para as barras e o texto se animarem.
 */
export function DemoAdvisor() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const [selected, setSelected] = useState(0)
  const answer = t.answers[selected]

  const onKeyDown = (event: KeyboardEvent) => {
    const last = t.answers.length - 1
    let next = selected
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = selected === last ? 0 : selected + 1
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = selected === 0 ? last : selected - 1
    else return
    event.preventDefault()
    setSelected(next)
    document.getElementById(`demo-tab-${next}`)?.focus()
  }

  return (
    <section id="demo" aria-labelledby="demo-titulo" className="relative scroll-mt-24 bg-ice py-24 text-navy lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">{t.kicker}</p>
          <h2 id="demo-titulo" className="mt-4 text-balance font-display text-[30px] font-bold leading-[1.1] tracking-[-0.025em] sm:text-[44px]">
            {t.title[0]}
            <span className="text-accent">{t.title[1]}</span>
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-navy/65">{t.sub}</p>
        </Reveal>

        <Reveal delay={120} className="mt-12 lg:mt-16">
          <div className="rounded-3xl border border-navy/[0.08] bg-white p-4 shadow-[0_40px_100px_-40px_rgba(7,13,43,0.35)] sm:p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-[0_8px_24px_-8px_rgba(0,82,255,0.8)]">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-[17px] font-bold">{t.app}</p>
                <p className="text-[12px] text-navy/55">{t.pick}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-navy/10 bg-ice/70 px-4 py-3 text-[13.5px] text-navy/45">
              <Search className="h-4 w-4" aria-hidden="true" />
              {t.ask}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div role="tablist" aria-orientation="vertical" aria-label={t.pick} className="flex flex-col gap-2.5" onKeyDown={onKeyDown}>
                {t.answers.map((a, i) => {
                  const isActive = i === selected
                  return (
                    <button
                      key={a.question}
                      id={`demo-tab-${i}`}
                      role="tab"
                      type="button"
                      aria-selected={isActive}
                      aria-controls="demo-painel"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setSelected(i)}
                      className={cn(
                        'group flex items-center justify-between rounded-xl border px-4 py-4 text-left text-[15px] transition-all duration-300',
                        isActive
                          ? 'border-accent bg-white font-semibold shadow-[0_10px_30px_-14px_rgba(0,82,255,0.6)]'
                          : 'border-transparent bg-ice text-navy/75 hover:-translate-y-0.5 hover:border-navy/10 hover:bg-white',
                      )}
                    >
                      {a.question}
                      {isActive ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-navy/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div id="demo-painel" role="tabpanel" aria-labelledby={`demo-tab-${selected}`} aria-live="polite" className="relative overflow-hidden rounded-2xl bg-navy p-6 text-white sm:p-7">
                <div aria-hidden="true" className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
                <div key={selected} className="relative">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-[15px] font-bold">
                      FINER ONE <span className="text-white/35">|</span> Advisor
                    </p>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">{t.example}</span>
                  </div>

                  <p className="fo-rise mt-6 text-[13px] text-white/60">{answer.metricLabel}</p>
                  <p className="fo-rise tabular mt-1 font-display text-[34px] font-bold tracking-[-0.02em] sm:text-[40px]" style={{ animationDelay: '80ms' }}>
                    {answer.metric}
                  </p>

                  <div className="mt-5 space-y-2.5">
                    {answer.bars.map((bar, i) => (
                      <div key={bar.label} className="fo-rise grid grid-cols-[minmax(0,7rem)_1fr_2.5rem] sm:grid-cols-[minmax(0,10rem)_1fr_2.5rem] items-center gap-3 text-[12px]" style={{ animationDelay: `${160 + i * 90}ms` }}>
                        <span className="truncate text-white/60">{bar.label}</span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <span
                            className="block h-full origin-left animate-grow-right rounded-full bg-gradient-to-r from-accent to-glow"
                            style={{ width: `${bar.value}%`, animationDelay: `${260 + i * 90}ms` }}
                          />
                        </span>
                        <span className="tabular text-right text-white/70">{bar.value}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="my-6 h-px bg-white/10" />

                  <div className="fo-rise" style={{ animationDelay: '450ms' }}>
                    <p className="text-[14px] font-semibold text-glow">{t.showsLabel}</p>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/85">{answer.shows}</p>
                  </div>
                  <div className="fo-rise mt-5" style={{ animationDelay: '600ms' }}>
                    <p className="text-[14px] font-semibold text-glow">{t.recLabel}</p>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/85">{answer.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-[12px] text-navy/45">{t.note}</p>
        </Reveal>
      </div>
    </section>
  )
}

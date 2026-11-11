import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { AVG_DAYS_LATE, OVERDUE_COUNT, TOTAL_OVERDUE, eur } from '@/components/v2/story/storyData'

const EASE = [0.22, 1, 0.36, 1] as const

type QA = {
  q: string
  a: string
  evidence?: { value: string; label: string; extra: string }
  next: string
}

/**
 * Perguntas e respostas PREDEFINIDAS (sem IA, sem API, sem dados do visitante),
 * coerentes com o cenário fictício central (storyData: € 50.948,60 em 6 faturas
 * em atraso, atraso médio de 15 dias).
 */
function getCopy(lang: Lang) {
  const pt = lang === 'pt'
  const total = eur(TOTAL_OVERDUE, lang)
  const qa: QA[] = pt
    ? [
        {
          q: 'O que merece mais atenção este mês?',
          a: `A cobrança de clientes. Neste cenário, há ${total} por receber em ${OVERDUE_COUNT} faturas que já passaram o prazo.`,
          evidence: { value: total, label: 'Por receber', extra: `${OVERDUE_COUNT} faturas em atraso` },
          next: 'Analise os recebimentos em aberto e identifique os clientes com maior impacto.',
        },
        {
          q: 'Quanto tenho por receber?',
          a: `Neste cenário, tem ${total} por receber, em ${OVERDUE_COUNT} faturas. Todas já passaram a data de vencimento.`,
          evidence: { value: total, label: 'Total por receber', extra: `Atraso médio de ${AVG_DAYS_LATE} dias` },
          next: 'Consulte os prazos, os clientes envolvidos e a distribuição dos valores.',
        },
        {
          q: 'Porque é que a tesouraria está mais apertada?',
          a: 'Ter faturação não significa ter dinheiro disponível: recebimentos e pagamentos podem acontecer em momentos diferentes. Com os dados desta demonstração, não é possível apontar uma causa única.',
          next: 'Compare as entradas, saídas e compromissos financeiros para compreender os períodos de maior pressão.',
        },
      ]
    : [
        {
          q: 'What needs the most attention this month?',
          a: `Collecting from customers. In this scenario, ${total} is outstanding across ${OVERDUE_COUNT} invoices that are past due.`,
          evidence: { value: total, label: 'Outstanding', extra: `${OVERDUE_COUNT} overdue invoices` },
          next: 'Review open receivables and identify the customers with the biggest impact.',
        },
        {
          q: 'How much is owed to me?',
          a: `In this scenario, ${total} is owed to you, across ${OVERDUE_COUNT} invoices. All of them are past their due date.`,
          evidence: { value: total, label: 'Total receivable', extra: `Average delay of ${AVG_DAYS_LATE} days` },
          next: 'Check the due dates, the customers involved and how the amounts are distributed.',
        },
        {
          q: 'Why is cash tighter?',
          a: 'Invoicing does not mean having cash available: collections and payments can happen at different times. With the data in this demo, a single cause cannot be identified.',
          next: 'Compare cash in, cash out and financial commitments to understand the periods of greatest pressure.',
        },
      ]
  return {
    eyebrow: pt ? 'Experimente a Finer One' : 'Try Finer One',
    title: pt ? ['E se pudesse perguntar tudo sobre ', 'a sua empresa?'] : ['What if you could ask anything about ', 'your company?'],
    sub: pt ? 'Faça uma pergunta e veja como a Finer One ajuda a interpretar dados financeiros.' : 'Ask a question and see how Finer One helps you make sense of financial data.',
    note: pt ? 'Demonstração com dados fictícios' : 'Demo with fictitious data',
    noteShort: pt ? 'Dados fictícios' : 'Fictitious data',
    ask: pt ? ['O que gostaria de saber sobre a sua ', 'empresa?'] : ['What would you like to know about your ', 'company?'],
    suggested: pt ? 'Perguntas sugeridas' : 'Suggested questions',
    answerLabel: pt ? 'Resposta' : 'Answer',
    nextLabel: pt ? 'Próximo passo' : 'Next step',
    qa,
  }
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }

/**
 * Nova secção 2 — Experiência Finer Home. O visitante escolhe uma pergunta e vê
 * uma resposta com evidência e próximo passo. Destino do CTA "Experimentar
 * demonstração" da hero (#experimentar-finer).
 */
export function HomeExperience() {
  const { lang } = useLanguage()
  const t = getCopy(lang)
  // A primeira pergunta já aparece respondida: o painel nunca fica vazio.
  const [sel, setSel] = useState(0)
  const cur = t.qa[sel]

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="experimentar-finer"
        aria-labelledby="experimentar-titulo"
        className="relative z-20 -mt-4 scroll-mt-20 bg-white text-navy shadow-[0_-30px_80px_-40px_rgba(0,82,255,0.45)] sm:-mt-6"
      >
        <motion.div
          className="mx-auto grid max-w-content grid-cols-[minmax(0,1fr)] items-center gap-9 px-5 pb-12 pt-14 sm:px-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-14 lg:px-8 lg:py-[76px]"
          variants={group}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {/* Mensagem */}
          <div>
            <motion.p variants={item} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent">{t.eyebrow}</motion.p>
            <motion.h2 variants={item} id="experimentar-titulo" className="mt-4 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[44px] lg:text-[46px] xl:text-[50px]">
              {t.title[0]}
              <span className="whitespace-nowrap text-accent">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={item} className="mt-5 max-w-[420px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          {/* Demonstração Finer Home */}
          <motion.div variants={item} className="min-w-0 overflow-hidden rounded-[20px] border border-[#0B1030]/[0.08] bg-white shadow-[0_30px_70px_-48px_rgba(11,16,48,0.45)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#0B1030]/[0.07] px-4 py-3 sm:px-6">
              <span className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#070D2B]">
                  <svg viewBox="0 0 326 445" className="h-3 w-3 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
                </span>
                <span className="whitespace-nowrap text-[13.5px] font-bold">Finer Home</span>
              </span>
              <span className="text-right text-[12px] font-medium text-[#0B1030]/60"><span className="sm:hidden">{t.noteShort}</span><span className="hidden sm:inline">{t.note}</span></span>
            </div>

            <div className="p-4 sm:p-6">
              <p className="font-display text-[17px] font-bold leading-snug text-[#070D2B] sm:text-[19px]">
                {t.ask[0]}
                <span className="text-accent">{t.ask[1]}</span>
              </p>

              {/* Perguntas: seleção discreta, com a linha Finer One a acompanhar a ativa */}
              <div role="group" aria-label={t.suggested} className="mt-4 divide-y divide-[#0B1030]/[0.07] overflow-hidden rounded-xl border border-[#0B1030]/[0.09]">
                {t.qa.map((x, i) => {
                  const on = sel === i
                  return (
                    <button
                      key={x.q}
                      type="button"
                      aria-pressed={on}
                      aria-controls="experimentar-resposta"
                      onClick={() => setSel(i)}
                      className={cn(
                        'group relative flex w-full items-center gap-3.5 px-4 py-3.5 text-left text-[15px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:px-5',
                        on ? 'bg-[#F3F7FF] font-semibold text-[#070D2B]' : 'bg-white font-medium text-[#0B1030]/75 hover:bg-[#F8FAFF] hover:text-[#070D2B]',
                      )}
                    >
                      {on && (
                        <motion.span
                          layoutId="experimentar-linha"
                          transition={{ duration: 0.26, ease: EASE }}
                          aria-hidden="true"
                          className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-accent shadow-[0_0_10px_rgba(30,144,255,0.85)]"
                        />
                      )}
                      <span className={cn('w-5 shrink-0 font-display text-[12px] font-bold tabular-nums', on ? 'text-accent' : 'text-[#0B1030]/35')}>0{i + 1}</span>
                      <span className="min-w-0 flex-1">{x.q}</span>
                      <ArrowRight className={cn('h-4 w-4 shrink-0 transition-[transform,color] duration-200', on ? 'text-accent' : 'text-[#0B1030]/25 group-hover:translate-x-0.5 group-hover:text-[#0B1030]/50')} aria-hidden="true" />
                    </button>
                  )
                })}
              </div>

              {/* Resposta: o elemento principal; altura estável entre perguntas */}
              <div id="experimentar-resposta" aria-live="polite" className="mt-5 grid min-h-[326px] sm:min-h-[248px]" data-resposta>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={sel}
                    className="col-start-1 row-start-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.26, ease: EASE } }}
                    exit={{ opacity: 0, y: -4, transition: { duration: 0.16 } }}
                  >
                    <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      {t.answerLabel}
                    </p>
                    <p className="mt-2 text-[17px] font-medium leading-[1.55] text-[#070D2B] sm:text-[18px]">{cur.a}</p>

                    {cur.evidence && (
                      <motion.div
                        className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t border-[#0B1030]/[0.08] pt-4"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.26, ease: EASE, delay: 0.06 }}
                      >
                        <span>
                          <span className="block text-[12.5px] font-semibold text-[#0B1030]/60">{cur.evidence.label}</span>
                          <span className="font-display text-[32px] font-bold leading-none tracking-[-0.025em] text-[#070D2B] tabular-nums sm:text-[36px]">{cur.evidence.value}</span>
                        </span>
                        <span className="rounded-full bg-[#EEF3FF] px-3 py-1 text-[13px] font-semibold text-accent">{cur.evidence.extra}</span>
                      </motion.div>
                    )}

                    <p className="mt-4 border-t border-[#0B1030]/[0.08] pt-4 text-[14.5px] leading-[1.55] text-[#0B1030]/75">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1030]/50">{t.nextLabel}</span>
                      {cur.next}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

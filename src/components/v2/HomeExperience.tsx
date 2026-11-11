import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight, MessageSquare, Sparkles } from 'lucide-react'
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
    title: pt ? ['E se pudesse perguntar ', 'tudo sobre a sua empresa?'] : ['What if you could ask ', 'anything about your company?'],
    sub: pt ? 'Faça uma pergunta e veja como a Finer One ajuda a interpretar dados financeiros.' : 'Ask a question and see how Finer One helps you make sense of financial data.',
    note: pt ? 'Demonstração com dados fictícios' : 'Demo with fictitious data',
    noteShort: pt ? 'Dados fictícios' : 'Fictitious data',
    ask: pt ? ['O que gostaria de saber sobre a sua ', 'empresa?'] : ['What would you like to know about your ', 'company?'],
    suggested: pt ? 'Perguntas sugeridas' : 'Suggested questions',
    empty: pt ? 'Escolha uma pergunta para ver a resposta.' : 'Pick a question to see the answer.',
    nextLabel: pt ? 'Próximo passo' : 'Next step',
    more: pt ? 'Conhecer o Finer Home' : 'Discover Finer Home',
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
  const [sel, setSel] = useState<number | null>(null)
  const cur = sel === null ? null : t.qa[sel]

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="experimentar-finer"
        aria-labelledby="experimentar-titulo"
        className="relative z-20 -mt-4 scroll-mt-20 bg-white text-navy shadow-[0_-30px_80px_-40px_rgba(0,82,255,0.45)] sm:-mt-6"
      >
        <motion.div
          className="mx-auto grid max-w-content grid-cols-[minmax(0,1fr)] items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14 lg:px-8 lg:py-20"
          variants={group}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {/* Mensagem */}
          <div>
            <motion.p variants={item} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent">{t.eyebrow}</motion.p>
            <motion.h2 variants={item} id="experimentar-titulo" className="mt-3 text-balance font-display text-[32px] font-bold leading-[1.06] tracking-[-0.035em] text-[#070D2B] sm:text-[42px] lg:text-[46px]">
              {t.title[0]}
              <span className="text-accent">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={item} className="mt-5 max-w-[440px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          {/* Demonstração Finer Home */}
          <motion.div variants={item} className="min-w-0 overflow-hidden rounded-[20px] border border-[#0B1030]/[0.08] bg-white shadow-[0_30px_70px_-45px_rgba(11,16,48,0.45)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#0B1030]/[0.07] px-4 py-3 sm:px-5">
              <span className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#070D2B]">
                  <svg viewBox="0 0 326 445" className="h-3 w-3 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
                </span>
                <span className="whitespace-nowrap text-[13.5px] font-bold">Finer Home</span>
              </span>
              <span className="text-right text-[12px] font-medium text-[#0B1030]/60"><span className="sm:hidden">{t.noteShort}</span><span className="hidden sm:inline">{t.note}</span></span>
            </div>

            <div className="bg-[linear-gradient(180deg,#F3F7FF_0%,#FFFFFF_140px)] p-4 sm:p-6">
              <p className="text-center font-display text-[19px] font-bold leading-snug sm:text-[22px]">
                {t.ask[0]}
                <span className="text-accent">{t.ask[1]}</span>
              </p>

              {/* Perguntas sugeridas, com indicador de seleção partilhado */}
              <div role="group" aria-label={t.suggested} className="mx-auto mt-5 grid max-w-[620px] gap-2">
                {t.qa.map((x, i) => {
                  const on = sel === i
                  return (
                    <motion.button
                      key={x.q}
                      type="button"
                      aria-pressed={on}
                      aria-controls="experimentar-resposta"
                      onClick={() => setSel(i)}
                      whileHover={on ? undefined : { y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                        on ? 'border-accent text-white' : 'border-[#0B1030]/[0.12] bg-white text-[#0B1030] hover:border-accent/50',
                      )}
                    >
                      {on && <motion.span layoutId="experimentar-sel" transition={{ duration: 0.3, ease: EASE }} className="absolute inset-0 rounded-[11px] bg-accent shadow-[0_10px_24px_-12px_rgba(0,82,255,0.9)]" />}
                      <span className={cn('relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', on ? 'bg-white/20 text-white' : 'bg-[#EEF3FF] text-accent')}>{i + 1}</span>
                      <span className="relative min-w-0 flex-1">{x.q}</span>
                      <ArrowRight className={cn('relative h-4 w-4 shrink-0', on ? 'text-white' : 'text-[#0B1030]/35')} aria-hidden="true" />
                    </motion.button>
                  )
                })}
              </div>

              {/* Resposta: ocupa sempre o mesmo espaço */}
              <div id="experimentar-resposta" aria-live="polite" className="mx-auto mt-5 grid min-h-[312px] max-w-[620px] border-t border-[#0B1030]/[0.08] pt-5 sm:min-h-[246px]">
                <AnimatePresence mode="wait" initial={false}>
                  {cur === null ? (
                    <motion.p key="empty" className="flex items-center gap-3 self-start text-[14px] text-[#0B1030]/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                      <MessageSquare className="h-4 w-4 shrink-0 text-[#0B1030]/40" aria-hidden="true" />
                      {t.empty}
                    </motion.p>
                  ) : (
                    <motion.div
                      key={sel}
                      className="flex gap-3"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }}
                      exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#070D2B] text-white">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-accent">Finer One</p>
                        <p className="mt-1 text-[15px] leading-[1.6] text-[#0B1030]">{cur.a}</p>

                        {cur.evidence && (
                          <motion.div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-1 rounded-xl border border-accent/20 bg-[#EEF3FF] px-4 py-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE, delay: 0.08 }}>
                            <span>
                              <span className="block text-[12.5px] font-semibold text-[#0B1030]/65">{cur.evidence.label}</span>
                              <span className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#070D2B] tabular-nums">{cur.evidence.value}</span>
                            </span>
                            <span className="pb-1 text-[13.5px] font-medium text-[#0B1030]/75">{cur.evidence.extra}</span>
                          </motion.div>
                        )}

                        <motion.p className="mt-3 flex gap-2 text-[14px] leading-snug text-[#0B1030]/80" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE, delay: 0.14 }}>
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                          <span><span className="font-semibold text-[#070D2B]">{t.nextLabel}: </span>{cur.next}</span>
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ligação discreta, depois da interação (destino existente: Finer Home interativo) */}
              <div className="mx-auto mt-2 flex h-6 max-w-[620px] justify-end">
                <AnimatePresence>
                  {sel !== null && (
                    <motion.a
                      href="#plataforma"
                      className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.2 } }}
                      exit={{ opacity: 0 }}
                    >
                      {t.more}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </motion.a>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

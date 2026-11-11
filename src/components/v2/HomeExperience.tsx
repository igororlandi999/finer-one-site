import { useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight, ArrowUp, Sparkles } from 'lucide-react'
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
 * Céu Finer — o "mundo" azul com nuvens do topo dos ecrãs da plataforma,
 * recriado em SVG (nuvens procedimentais com feTurbulence): nítido em qualquer
 * tamanho, sem imagem a carregar e estático (só se move com o scroll).
 * Quando existir o ficheiro original do céu (sem texto), pode substituir isto.
 */
function FinerSky() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="fs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1F5FD6" />
          <stop offset="0.4" stopColor="#5E97EE" />
          <stop offset="0.78" stopColor="#B9D3FA" />
          <stop offset="1" stopColor="#F4F8FF" />
        </linearGradient>
        <radialGradient id="fs-sun" cx="0.78" cy="0.12" r="0.55">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id="fs-clouds" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0042 0.0095" numOctaves="6" seed="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 3.2 -1.45" />
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        <filter id="fs-wisps" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0012 0.02" numOctaves="3" seed="21" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.4 -1.1" />
        </filter>
        <linearGradient id="fs-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="fs-mask"><rect width="1200" height="800" fill="url(#fs-fade)" /></mask>
      </defs>
      <rect width="1200" height="800" fill="url(#fs-sky)" />
      <g mask="url(#fs-mask)">
        <rect width="1200" height="800" filter="url(#fs-wisps)" opacity="0.55" />
        <rect width="1200" height="800" filter="url(#fs-clouds)" opacity="1" />
      </g>
      <rect width="1200" height="800" fill="url(#fs-sun)" />
    </svg>
  )
}

/**
 * Nova secção 2 — Experiência Finer Home. A pergunta flutua sobre o céu Finer
 * (sem moldura de software); a resposta aparece em estilo cartaz, ligada à
 * pergunta pela linha de luz Finer One. Destino do CTA "Experimentar
 * demonstração" da hero (#experimentar-finer).
 */
export function HomeExperience() {
  const { lang } = useLanguage()
  const t = getCopy(lang)
  const reduced = useReducedMotion() ?? false
  // A primeira pergunta já aparece respondida: o palco nunca fica vazio.
  const [sel, setSel] = useState(0)
  const cur = t.qa[sel]

  // Scroll: o palco abre-se do centro (cortina) e as nuvens descem mais devagar (parallax leve).
  const stageRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'start 0.35'] })
  const clipPath = useTransform(scrollYProgress, [0, 1], ['inset(0% 14% 0% 14% round 32px)', 'inset(0% 0% 0% 0% round 32px)'])
  const { scrollYProgress: pass } = useScroll({ target: stageRef, offset: ['start end', 'end start'] })
  const skyY = useTransform(pass, [0, 1], ['-6%', '6%'])

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="experimentar-finer"
        aria-labelledby="experimentar-titulo"
        className="relative z-20 -mt-4 scroll-mt-20 bg-white text-navy shadow-[0_-30px_80px_-40px_rgba(0,82,255,0.45)] sm:-mt-6"
      >
        <motion.div
          className="mx-auto grid max-w-content grid-cols-[minmax(0,1fr)] items-center gap-9 px-5 pb-12 pt-14 sm:px-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-12 lg:px-8 lg:py-[76px]"
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
            <motion.p variants={item} className="mt-5 max-w-[400px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          {/* Palco: céu Finer com a pergunta a flutuar */}
          <motion.div variants={item} className="min-w-0">
            <motion.div
              ref={stageRef}
              style={reduced ? undefined : { clipPath }}
              className="relative isolate overflow-hidden rounded-[32px] px-4 pb-5 pt-16 shadow-[0_40px_90px_-50px_rgba(0,82,255,0.55)] sm:px-10 sm:pb-10 sm:pt-24 lg:px-12"
            >
              <motion.div aria-hidden="true" className="absolute inset-x-0 -inset-y-[8%] -z-10" style={reduced ? undefined : { y: skyY }}>
                <FinerSky />
              </motion.div>

              {/* Identificação discreta sobre o céu */}
              <div className="absolute inset-x-4 top-4 flex items-center justify-between sm:inset-x-10 sm:top-7 lg:inset-x-12">
                <span className="flex items-center gap-2 rounded-full bg-white/90 py-1 pl-1 pr-3 text-[#070D2B] shadow-[0_6px_18px_-10px_rgba(7,13,43,0.5)] backdrop-blur-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#070D2B]">
                    <svg viewBox="0 0 326 445" className="h-3 w-3 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
                  </span>
                  <span className="text-[13px] font-bold">Finer Home</span>
                </span>
                <span className="rounded-full bg-[#070D2B]/45 px-3 py-1 text-[11.5px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm">
                  <span className="sm:hidden">{t.noteShort}</span>
                  <span className="hidden sm:inline">{t.note}</span>
                </span>
              </div>

              {/* Cartão translúcido: pergunta, sugestões e resposta */}
              <div className="mx-auto max-w-[560px] rounded-[24px] bg-white/[0.88] p-4 shadow-[0_30px_70px_-35px_rgba(7,13,43,0.45)] ring-1 ring-white/70 backdrop-blur-xl sm:p-6">
                {/* Campo "Ask Finer" com a pergunta escolhida */}
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_1px_0_rgba(11,16,48,0.04),0_8px_24px_-18px_rgba(11,16,48,0.5)] ring-1 ring-[#0B1030]/[0.08]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={sel} className="min-w-0 flex-1 text-[15.5px] font-semibold text-[#070D2B] sm:text-[16.5px]" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }} exit={{ opacity: 0, y: -3, transition: { duration: 0.12 } }}>
                      {cur.q}
                    </motion.span>
                  </AnimatePresence>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_6px_16px_-6px_rgba(0,82,255,0.9)]" aria-hidden="true">
                    <ArrowUp className="h-4 w-4" />
                  </span>
                </div>

                {/* Sugestões em cápsulas */}
                <div role="group" aria-label={t.suggested} className="mt-3 flex flex-wrap gap-2">
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
                          'group relative rounded-full px-3.5 py-2 text-left text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                          on ? 'text-accent' : 'text-[#0B1030]/70 hover:text-[#070D2B]',
                        )}
                      >
                        {on && <motion.span layoutId="experimentar-chip" transition={{ duration: 0.26, ease: EASE }} className="absolute inset-0 rounded-full bg-[#EAF1FF] ring-1 ring-accent/30" />}
                        {!on && <span aria-hidden="true" className="absolute inset-0 rounded-full ring-1 ring-[#0B1030]/10 transition-colors group-hover:ring-[#0B1030]/20" />}
                        <span className="relative">{x.q}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Linha de luz Finer One: liga a pergunta à resposta (desenha-se a cada resposta) */}
                <div className="relative mt-5 h-px bg-[#0B1030]/[0.07]" aria-hidden="true">
                  <motion.span
                    key={sel}
                    className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-accent via-glow to-transparent shadow-[0_0_10px_rgba(30,144,255,0.9)]"
                    initial={{ scaleX: 0, opacity: 1 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </div>

                {/* Resposta em estilo cartaz; altura estável */}
                <div id="experimentar-resposta" aria-live="polite" className="mt-5 grid min-h-[340px] sm:min-h-[250px]" data-resposta>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={sel}
                      className="col-start-1 row-start-1"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.26, ease: EASE } }}
                      exit={{ opacity: 0, y: -4, transition: { duration: 0.16 } }}
                    >
                      <p className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-accent">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        {t.answerLabel}
                      </p>
                      {cur.evidence && (
                        <motion.p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE, delay: 0.08 }}>
                          <span className="font-display text-[44px] font-bold leading-none tracking-[-0.04em] text-[#070D2B] tabular-nums sm:text-[58px]">{cur.evidence.value}</span>
                          <span className="text-[14px] font-semibold text-[#0B1030]/60">{cur.evidence.label.toLowerCase()} · <span className="text-accent">{cur.evidence.extra}</span></span>
                        </motion.p>
                      )}
                      <p className={cn('text-[#070D2B]', cur.evidence ? 'mt-3 text-[16px] leading-[1.55] text-[#0B1030]/80' : 'mt-3 font-display text-[19px] font-bold leading-[1.35] tracking-[-0.015em] sm:text-[22px]')}>{cur.a}</p>
                      <p className="mt-4 flex gap-2 text-[14.5px] leading-[1.55] text-[#0B1030]/70">
                        <ArrowRight className="mt-[3px] h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                        <span><span className="font-semibold text-[#070D2B]">{t.nextLabel}: </span>{cur.next}</span>
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

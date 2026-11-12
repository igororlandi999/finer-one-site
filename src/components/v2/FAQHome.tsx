import { useId, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * FAQ da homepage (12/11/2026) — composição editorial em duas colunas, à
 * maneira da Lovable; respostas diretas, à maneira da Searchable.
 *
 * TEXTOS: fornecidos pelo fundador. Frases que dependem de validação antes de
 * publicar (ver relatório): perguntas em linguagem natural (02), exemplos de
 * perguntas (03), confirmação de banco "junto da equipa" (04), mecanismos de
 * receção de documentos (06), condições do programa Finer Pioneers (07).
 * Segurança, dados, IA, faturação e cancelamento ficam fora (secção de
 * Segurança / página de Preços).
 */
type QA = { q: string; a: string; link?: { label: string; href: string } }

const copy: Record<Lang, { eyebrow: string; title: string; sub: string; items: QA[] }> = {
  pt: {
    eyebrow: 'Perguntas frequentes',
    title: 'Ainda tem dúvidas?',
    sub: 'Tudo o que precisa de saber para dar o próximo passo.',
    items: [
      {
        q: 'O que é a Finer One e como funciona?',
        a: 'A Finer One é uma plataforma de inteligência financeira que ajuda as empresas a transformar informação em respostas úteis para a gestão. Reúne dados das fontes financeiras ligadas, organiza indicadores e permite explorar análises e recomendações para apoiar decisões.',
      },
      {
        q: 'Preciso de conhecimentos financeiros para utilizar a Finer One?',
        a: 'Não. A Finer One foi pensada para tornar a informação financeira mais fácil de compreender. Pode fazer perguntas em linguagem natural, acompanhar indicadores e perceber o que merece atenção, sem precisar de ser especialista em finanças.',
      },
      {
        q: 'Que respostas posso obter sobre as finanças da minha empresa?',
        a: 'Pode explorar questões como «Quanto tenho por receber?», «Como evoluiu a minha tesouraria?» ou «Que despesas merecem atenção?». As respostas dependem dos dados disponíveis e das funcionalidades incluídas no seu acesso à plataforma.',
      },
      {
        q: 'A Finer One é compatível com o meu banco?',
        a: 'A compatibilidade depende das instituições bancárias e das integrações suportadas. Antes de avançar, pode confirmar junto da equipa Finer One se o seu banco está abrangido pelas ligações disponíveis.',
      },
      {
        q: 'A Finer One substitui o meu contabilista?',
        a: 'Não. A Finer One complementa o trabalho contabilístico, ajudando-o a acompanhar a situação financeira da empresa e a compreender melhor os números. O objetivo é apoiar a gestão e a tomada de decisões, não substituir os serviços de contabilidade.',
      },
      {
        q: 'O que preciso de ter para começar?',
        a: 'O primeiro passo é escolher a modalidade de acesso adequada e identificar as fontes de informação financeira que pretende utilizar. A configuração depende das integrações disponíveis, como contas bancárias suportadas e mecanismos de receção de documentos.',
      },
      {
        q: 'O que é o programa Finer Pioneers?',
        a: 'É uma iniciativa destinada a empresários interessados em conhecer a Finer One numa fase inicial e contribuir para a sua evolução. Os participantes poderão partilhar necessidades e sugestões, de acordo com as condições de participação do programa.',
        link: { label: 'Conhecer os Finer Pioneers', href: '/pioneers/' },
      },
    ],
  },
  en: {
    eyebrow: 'Frequently asked questions',
    title: 'Still have questions?',
    sub: 'Everything you need to know to take the next step.',
    items: [
      {
        q: 'What is Finer One and how does it work?',
        a: 'Finer One is a financial intelligence platform that helps companies turn information into useful answers for management. It brings together data from connected financial sources, organises indicators and lets you explore analyses and recommendations to support decisions.',
      },
      {
        q: 'Do I need financial knowledge to use Finer One?',
        a: 'No. Finer One was designed to make financial information easier to understand. You can ask questions in natural language, follow indicators and see what deserves attention, without being a finance specialist.',
      },
      {
        q: 'What answers can I get about my company’s finances?',
        a: 'You can explore questions such as “How much is owed to me?”, “How has my cash evolved?” or “Which expenses deserve attention?”. Answers depend on the data available and the features included in your access to the platform.',
      },
      {
        q: 'Is Finer One compatible with my bank?',
        a: 'Compatibility depends on the banking institutions and integrations supported. Before going ahead, you can check with the Finer One team whether your bank is covered by the available connections.',
      },
      {
        q: 'Does Finer One replace my accountant?',
        a: 'No. Finer One complements the accounting work, helping you follow the company’s financial position and better understand the numbers. The goal is to support management and decision-making, not to replace accounting services.',
      },
      {
        q: 'What do I need to get started?',
        a: 'The first step is to choose the right access option and identify the financial information sources you want to use. Setup depends on the integrations available, such as supported bank accounts and document-receiving mechanisms.',
      },
      {
        q: 'What is the Finer Pioneers programme?',
        a: 'It is an initiative for business owners who want to get to know Finer One at an early stage and contribute to its evolution. Participants will be able to share needs and suggestions, under the programme’s participation conditions.',
        link: { label: 'Discover Finer Pioneers', href: '/pioneers/' },
      },
    ],
  },
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
/** Revelação única: ~400 ms, até 12 px. */
const rise: Variants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }

export function FAQHome() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const [open, setOpen] = useState<number | null>(null)
  const uid = useId()

  return (
    <MotionConfig reducedMotion="user">
      <section id="faq" aria-labelledby="faq-titulo" className="relative scroll-mt-24 bg-white text-navy">
        <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-[minmax(0,1fr)] gap-8 border-t border-[#0B1030]/[0.08] pb-16 pt-12 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] lg:gap-16 lg:pb-20 lg:pt-16"
            variants={group}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Esquerda: eyebrow, título, subtítulo — alinhados com o início das perguntas */}
            <div className="lg:sticky lg:top-28 lg:self-start lg:pt-5">
              <motion.p variants={rise} className="flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
                <span aria-hidden="true" className="h-px w-6 bg-accent" />
                {t.eyebrow}
              </motion.p>
              <motion.h2 variants={rise} id="faq-titulo" className="mt-4 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[44px] lg:text-[48px]">
                {t.title}
              </motion.h2>
              <motion.p variants={rise} className="mt-4 max-w-[360px] text-[16.5px] leading-[1.6] text-[#0B1030]/65 sm:text-[17px]">
                {t.sub}
              </motion.p>
            </div>

            {/* Direita: sete perguntas em acordeão (uma aberta de cada vez) */}
            <motion.div variants={rise} className="border-t border-[#0B1030]/10">
              {t.items.map((x, i) => {
                const isOpen = open === i
                const bid = `${uid}-b${i}`
                const pid = `${uid}-p${i}`
                return (
                  <div key={x.q} className="group relative border-b border-[#0B1030]/10 transition-colors duration-200 hover:border-[#0B1030]/20">
                    {/* Indicador de seleção Finer One */}
                    <span aria-hidden="true" className={cn('absolute -left-px top-0 h-full w-[2px] origin-top bg-accent transition-transform duration-300', isOpen ? 'scale-y-100' : 'scale-y-0')} />
                    <h3>
                      <button
                        id={bid}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={pid}
                        onClick={() => setOpen(isOpen ? null : i)}
                        className="flex w-full items-center gap-5 py-5 pl-4 pr-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:py-6 sm:pl-5"
                      >
                        <span className={cn('flex-1 text-[17px] font-semibold leading-snug tracking-[-0.01em] transition-colors duration-200 sm:text-[18px]', isOpen ? 'text-[#070D2B]' : 'text-[#070D2B]/80 group-hover:text-[#070D2B]')}>{x.q}</span>
                        <PlusMinus open={isOpen} />
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={pid}
                          role="region"
                          aria-labelledby={bid}
                          className="overflow-hidden"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.26, ease: EASE }, opacity: { duration: 0.2, delay: 0.04 } } }}
                          exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.22, ease: EASE }, opacity: { duration: 0.12 } } }}
                        >
                          <div className="max-w-[640px] pb-6 pl-4 pr-10 sm:pl-5">
                            <p className="text-[16px] leading-[1.65] text-[#0B1030]/70">{x.a}</p>
                            {x.link && (
                              <a href={x.link.href} className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent-deep underline decoration-accent-deep/30 underline-offset-4 transition-colors hover:decoration-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                                {x.link.label} <span aria-hidden="true">→</span>
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}

/** Indicador + que passa a −: a barra vertical recolhe ao abrir; fica azul ao passar o rato. */
function PlusMinus({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200',
        open ? 'border-accent bg-accent text-white' : 'border-[#0B1030]/15 text-[#0B1030]/60 group-hover:border-accent group-hover:text-accent',
      )}
    >
      <span className="absolute h-[1.5px] w-3 rounded-full bg-current" />
      <span className={cn('absolute h-3 w-[1.5px] rounded-full bg-current transition-transform duration-200', open ? 'scale-y-0' : 'scale-y-100')} />
    </span>
  )
}

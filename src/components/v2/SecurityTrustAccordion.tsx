import { useId, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { Plus } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * VERIFICAÇÃO DAS RESPOSTAS (11/11/2026) — só `published: true` aparece no site.
 *
 * Fontes disponíveis: CLAUDE.md (indicações do fundador de 10/11/2026: ligação
 * bancária por Open Banking e receção de faturas por email dedicado são reais;
 * fornecedores em avaliação; sem nomear bancos, tempos ou garantias), FAQ
 * publicada em main ("a informação da empresa é utilizada para produzir as
 * análises"). NÃO existem neste repositório: código da plataforma, política de
 * privacidade aprovada (só um rascunho dos formulários), documentação de
 * permissões, nem documentação/contratos dos serviços de IA.
 *
 * 01 Informação utilizada ........ PARCIALMENTE CONFIRMADO → publicada (só o verificado)
 * 02 Ligações bancárias .......... PARCIALMENTE CONFIRMADO → publicada (sem prestador nem cobertura)
 * 03 Gerir/revogar permissões .... NÃO CONFIRMADO → preparada, não visível
 * 04 Dados e inteligência artificial NÃO CONFIRMADO → preparada, não visível
 *
 * As respostas 03 e 04 são PROVISÓRIAS e precisam de validação dos fundadores
 * (e jurídica, no caso da 04) antes de passarem a `published: true`.
 */
type QA = { q: string; a: string; published: boolean }

const copy: Record<Lang, { eyebrow: string; title: [string, string]; sub: string; qa: QA[] }> = {
  pt: {
    eyebrow: 'Segurança e transparência',
    title: ['A sua informação. ', 'O seu controlo.'],
    sub: 'Conheça as permissões, as ligações e a forma como a Finer One trata os seus dados financeiros.',
    qa: [
      {
        q: 'Que informação é utilizada pela Finer One?',
        a: 'A informação que a empresa decide ligar ou enviar: os movimentos das contas bancárias ligadas e as faturas enviadas para o endereço de faturas da empresa na Finer One. Essa informação é utilizada para a organizar e produzir as análises da plataforma.',
        published: true,
      },
      {
        q: 'Como funcionam as ligações bancárias?',
        a: 'A ligação é feita através de Open Banking e só fica ativa depois de a autorizar junto do seu banco. Nem todas as instituições bancárias estão necessariamente disponíveis.',
        published: true,
      },
      {
        // PROVISÓRIO — por validar: existe gestão de permissões na plataforma? Como se revoga a autorização junto do prestador/banco? O que acontece aos dados já guardados?
        q: 'Posso gerir ou revogar as permissões?',
        a: '[Provisório — por validar com os fundadores.]',
        published: false,
      },
      {
        // PROVISÓRIO — por validar (fundadores + jurídico): que dados vão para serviços de IA, que fornecedores, retenção, utilização para treino, controlos disponíveis.
        q: 'Como são utilizados os meus dados pela inteligência artificial?',
        a: '[Provisório — por validar com os fundadores e aconselhamento jurídico.]',
        published: false,
      },
    ],
  },
  en: {
    eyebrow: 'Security and transparency',
    title: ['Your information. ', 'Your control.'],
    sub: 'See the permissions, the connections and how Finer One handles your financial data.',
    qa: [
      {
        q: 'What information does Finer One use?',
        a: 'The information your company chooses to connect or send: transactions from connected bank accounts and invoices sent to your company’s Finer One invoice address. It is used to organise that information and produce the platform’s analyses.',
        published: true,
      },
      {
        q: 'How do bank connections work?',
        a: 'Connections are made through Open Banking and only become active after you authorise them with your bank. Not every banking institution is necessarily available.',
        published: true,
      },
      { q: 'Can I manage or revoke permissions?', a: '[Provisional — to be validated.]', published: false },
      { q: 'How is my data used by artificial intelligence?', a: '[Provisional — to be validated.]', published: false },
    ],
  },
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }

/**
 * Nova secção 6 — Segurança e confiança. Layout editorial branco (40/60) com
 * acordeões acessíveis (um aberto de cada vez). Só mostra respostas verificadas.
 * Sem ligação: não existe página de segurança e a política de privacidade é um
 * rascunho por aprovar. Versão anterior em ?seguranca=antiga.
 */
export function SecurityTrustAccordion() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const visible = t.qa.filter((x) => x.published)
  const [open, setOpen] = useState<number | null>(null)
  const uid = useId()

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="seguranca"
        aria-labelledby="seguranca-titulo"
        className="relative z-10 -mt-6 scroll-mt-20 rounded-t-[28px] bg-white text-navy sm:-mt-8 sm:rounded-t-[40px]"
      >
        <motion.div
          className="mx-auto grid max-w-content grid-cols-[minmax(0,1fr)] gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:gap-16 lg:px-8 lg:py-24"
          variants={group}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div>
            <motion.p variants={item} className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
              <span aria-hidden="true" className="h-px w-6 bg-accent shadow-[0_0_6px_rgba(0,82,255,0.6)]" />
              {t.eyebrow}
            </motion.p>
            <motion.h2 variants={item} id="seguranca-titulo" className="mt-4 text-balance font-display text-[32px] font-bold leading-[1.06] tracking-[-0.035em] text-[#070D2B] sm:text-[42px] lg:text-[46px]">
              {t.title[0]}
              <span className="text-accent-deep">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={item} className="mt-5 max-w-[420px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          <motion.div variants={item} className="self-center border-t border-[#0B1030]/10">
            {visible.map((x, i) => {
              const isOpen = open === i
              const bid = `${uid}-b${i}`
              const pid = `${uid}-p${i}`
              return (
                <div key={x.q} className="relative border-b border-[#0B1030]/10">
                  {/* Linha Finer One no item aberto */}
                  <span aria-hidden="true" className={cn('absolute -left-px top-0 h-full w-[2px] origin-top bg-accent transition-transform duration-300', isOpen ? 'scale-y-100' : 'scale-y-0')} />
                  <h3>
                    <button
                      id={bid}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={pid}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full items-center gap-4 py-5 pl-4 pr-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:py-6 sm:pl-5"
                    >
                      <span className="w-6 shrink-0 font-display text-[13px] font-bold tabular-nums text-accent-deep">0{i + 1}</span>
                      <span className={cn('flex-1 font-display text-[18px] font-bold leading-snug tracking-[-0.01em] transition-colors sm:text-[20px]', isOpen ? 'text-[#070D2B]' : 'text-[#070D2B]/80 group-hover:text-[#070D2B]')}>{x.q}</span>
                      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200', isOpen ? 'border-accent bg-accent text-white' : 'border-[#0B1030]/15 text-[#0B1030]/60 group-hover:border-accent group-hover:text-accent-deep')}>
                        <Plus className={cn('h-4 w-4 transition-transform duration-300', isOpen && 'rotate-45')} aria-hidden="true" />
                      </span>
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
                        animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.28, ease: EASE }, opacity: { duration: 0.2, delay: 0.05 } } }}
                        exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.24, ease: EASE }, opacity: { duration: 0.12 } } }}
                      >
                        <p className="max-w-[600px] pb-6 pl-[46px] pr-2 text-[15.5px] leading-[1.65] text-[#0B1030]/75 sm:pl-[60px] sm:pr-10">{x.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

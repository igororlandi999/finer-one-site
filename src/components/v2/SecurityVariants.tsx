import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { MotionValue, Variants } from 'motion/react'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

/**
 * Opções de visual para a secção 6 (pré-visualização):
 *  D · ?painel=atmosfera — atmosfera de cor à maneira da Lovable + cartão de ligações
 *  E · ?painel=manifesto — texto grande que se ilumina palavra a palavra com o scroll
 * Só factos confirmados: o que a empresa liga ou envia; Open Banking; ativa só
 * depois da autorização junto do banco; nem todos os bancos disponíveis.
 * Nada sugere gerir ou revogar permissões (pergunta 03, por validar).
 */

const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }

const facts: Record<Lang, { t: string; d: string }[]> = {
  pt: [
    { t: 'Só o que decide ligar ou enviar', d: 'Os movimentos das contas que liga e as faturas que envia para o endereço da empresa.' },
    { t: 'Open Banking', d: 'A ligação bancária é feita através de Open Banking.' },
    { t: 'Ativa só com a sua autorização', d: 'A ligação só fica ativa depois de a autorizar junto do seu banco.' },
  ],
  en: [
    { t: 'Only what you choose to connect or send', d: 'Transactions from the accounts you connect and invoices you send to your company address.' },
    { t: 'Open Banking', d: 'Bank connections are made through Open Banking.' },
    { t: 'Active only with your authorisation', d: 'A connection only becomes active after you authorise it with your bank.' },
  ],
}
const note: Record<Lang, string> = {
  pt: 'Nem todas as instituições bancárias estão necessariamente disponíveis.',
  en: 'Not every banking institution is necessarily available.',
}

/* =================== D · Atmosfera (Lovable) =================== */

/**
 * Atmosfera com várias tonalidades da marca a misturar-se (como a Lovable):
 * céu claro em cima, azul elétrico e azul-glow no meio, azul profundo e navy em baixo.
 */
const ATMOS = {
  background: [
    'radial-gradient(38% 30% at 18% 44%, rgba(30,144,255,0.55) 0%, rgba(30,144,255,0) 100%)',
    'radial-gradient(34% 28% at 84% 40%, rgba(141,184,246,0.75) 0%, rgba(141,184,246,0) 100%)',
    'radial-gradient(46% 34% at 62% 58%, rgba(0,82,255,0.7) 0%, rgba(0,82,255,0) 100%)',
    'radial-gradient(40% 30% at 10% 80%, rgba(10,36,112,0.9) 0%, rgba(10,36,112,0) 100%)',
    'radial-gradient(42% 32% at 92% 86%, rgba(7,13,43,0.85) 0%, rgba(7,13,43,0) 100%)',
    'radial-gradient(70% 40% at 50% -6%, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
    'linear-gradient(180deg, #F4F8FF 0%, #CFE0FF 20%, #5A92F8 40%, #0A4AD6 58%, #0A2E96 78%, #08184F 100%)',
  ].join(', '),
}

/** Grão fino (imagem estática gerada uma vez) para dar textura de fotografia à cor. */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

export function SecurityAtmosphere({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // A cor "sobe" lentamente com o scroll
  const bgY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['12%', '-12%'])
  const cardY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -30])

  // A conta à ordem mostra o momento da autorização com o scroll: não ligada → a aguardar → autorizada por si
  const card = useRef<HTMLDivElement>(null)
  const { scrollYProgress: auth } = useScroll({ target: card, offset: ['start 0.7', 'end 0.25'] })
  const [stage, setStage] = useState(reduced ? 2 : 0)
  useMotionValueEvent(auth, 'change', (p) => { if (!reduced) setStage(p < 0.25 ? 0 : p < 0.6 ? 1 : 2) })
  const stages = [
    { state: pt ? 'Não ligada' : 'Not connected', sub: pt ? 'Banco Exemplo' : 'Example Bank', tone: 'text-[#0B1030]/40', name: 'text-[#070D2B]/55' },
    { state: pt ? 'A aguardar a sua autorização' : 'Waiting for your authorisation', sub: pt ? 'Banco Exemplo · autorização junto do banco' : 'Example Bank · authorisation with your bank', tone: 'text-[#0B1030]/70', name: 'text-[#070D2B]' },
    { state: pt ? 'Autorizada por si' : 'Authorised by you', sub: pt ? 'Banco Exemplo · Open Banking' : 'Example Bank · Open Banking', tone: 'text-accent-deep', name: 'text-[#070D2B]' },
  ]
  const st = stages[stage]
  const poster: [string, string] = pt ? ['Nada fica ligado', 'sem a sua autorização.'] : ['Nothing gets connected', 'without your authorisation.']
  const rowIn = (d: number): Variants => ({ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE, delay: d } } })

  return (
    <motion.div
      ref={ref}
      className="relative isolate mt-10 overflow-hidden rounded-[36px] px-5 pb-8 pt-10 sm:px-10 sm:pb-12 sm:pt-14 lg:mt-12 lg:px-16 lg:pb-14 lg:pt-16"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={group}
    >
      <motion.div aria-hidden="true" className="absolute inset-x-0 -top-[15%] -z-10 h-[130%]" style={{ ...ATMOS, y: bgY }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[0.14] mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px' }} />

      {/* Cartão ilustrativo (decorativo para leitores de ecrã: a frase e os factos dizem o mesmo em texto) */}
      <motion.div ref={card} style={{ y: cardY }} className="relative mx-auto max-w-[500px]" aria-hidden="true">
        <motion.div variants={rise} className="rounded-[22px] bg-white p-5 shadow-[0_40px_90px_-40px_rgba(7,13,43,0.6),0_0_0_1px_rgba(11,16,48,0.05)] sm:px-6 sm:py-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-[17px] font-bold tracking-[-0.02em] text-[#070D2B] sm:text-[18px]">{pt ? 'Ligações da sua empresa' : 'Your company’s connections'}</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B1030]/35">{pt ? 'Ilustrativo' : 'Illustrative'}</p>
          </div>
          <ul className="mt-2 divide-y divide-[#0B1030]/[0.07]">
            <motion.li className="flex items-baseline justify-between gap-4 py-4" variants={rowIn(0.35)}>
              <span className="min-w-0 flex-1">
                <span className={cn('block text-[15.5px] font-semibold transition-colors duration-500', st.name)}>{pt ? 'Conta à ordem' : 'Current account'}</span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={stage} className="block text-[13px] leading-snug text-[#0B1030]/55" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}>
                    {st.sub}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="relative max-w-[46%] shrink-0 text-right text-[13.5px] font-semibold leading-snug sm:max-w-none">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={stage} className={cn('block', st.tone)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
                    {st.state}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.li>
            <motion.li className="flex items-baseline justify-between gap-4 py-4" variants={rowIn(0.53)}>
              <span className="min-w-0 flex-1">
                <span className="block text-[15.5px] font-semibold text-[#070D2B]">{pt ? 'Faturas por email' : 'Invoices by email'}</span>
                <span className="block text-[13px] leading-snug text-[#0B1030]/55">{pt ? 'Endereço de faturas da empresa' : 'Company invoice address'}</span>
              </span>
              <span className="shrink-0 text-right text-[13.5px] font-semibold text-accent-deep">{pt ? 'A receber' : 'Receiving'}</span>
            </motion.li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Frase-cartaz: branco + navy da marca (sobre uma faixa branca, como o logótipo), sobe por máscara */}
      <motion.h3 variants={group} className="relative mt-12 font-display text-[clamp(24px,7.4vw,36px)] font-bold leading-[1.06] tracking-[-0.045em] sm:text-[58px] lg:mt-16 lg:text-[80px]">
        <span className="block overflow-hidden pb-[0.08em]">
          <motion.span className="block text-white" variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.9, ease: EASE } } }}>{poster[0]}</motion.span>
        </span>
        <span className="relative isolate mt-1 inline-block">
          <motion.span
            aria-hidden="true"
            className="absolute -inset-x-[0.12em] bottom-[0.06em] top-[0.1em] -z-10 origin-left rounded-[6px] bg-white sm:rounded-[8px]"
            variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: EASE, delay: 0.35 } } }}
          />
          <span className="block overflow-hidden pb-[0.08em]">
            <motion.span className="block text-[#070D2B]" variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.9, ease: EASE, delay: 0.55 } } }}>{poster[1]}</motion.span>
          </span>
        </span>
      </motion.h3>

      {/* Três factos sobre a cor, em branco */}
      <motion.ul variants={group} className="relative mt-8 grid gap-6 text-white sm:grid-cols-3 sm:gap-8 lg:mt-10">
        {facts[lang].map((f) => (
          <motion.li key={f.t} variants={rise} className="border-t border-white/30 pt-4">
            <p className="text-[16px] font-semibold">{f.t}</p>
            <p className="mt-1.5 text-[14.5px] leading-[1.55] text-white/80">{f.d}</p>
          </motion.li>
        ))}
      </motion.ul>
      <motion.p variants={rise} className="relative mt-6 text-[13px] text-white/65">{note[lang]}</motion.p>
    </motion.div>
  )
}

/* =================== E · Manifesto (Searchable) =================== */

const manifesto: Record<Lang, { text: string; strong: string[] }> = {
  pt: {
    text: 'A Finer One só trabalha com o que decide ligar ou enviar: os movimentos das contas que liga e as faturas que envia para o endereço da empresa. As ligações bancárias são feitas por Open Banking e só ficam ativas depois de as autorizar junto do seu banco.',
    strong: ['decide', 'ligar', 'ou', 'enviar:', 'Open', 'Banking', 'autorizar'],
  },
  en: {
    text: 'Finer One only works with what you choose to connect or send: transactions from the accounts you connect and invoices you send to your company address. Bank connections are made through Open Banking and only become active after you authorise them with your bank.',
    strong: ['choose', 'connect', 'or', 'send:', 'Open', 'Banking', 'authorise'],
  },
}

export function SecurityManifesto({ lang }: { lang: Lang }) {
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const m = manifesto[lang]
  const words = m.text.split(' ')
  return (
    <div className="mt-10 lg:mt-14">
      <p ref={ref} className="max-w-[1080px] font-display text-[30px] font-semibold leading-[1.18] tracking-[-0.03em] sm:text-[42px] lg:text-[54px]">
        {words.map((w, i) => (
          <Word key={i} w={w} i={i} n={words.length} p={scrollYProgress} strong={m.strong.includes(w)} reduced={reduced} />
        ))}
      </p>
      <motion.div className="mt-12 grid gap-6 sm:grid-cols-3 sm:gap-8 lg:mt-16" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
        {facts[lang].map((f, i) => (
          <motion.div key={f.t} variants={rise} className="relative pt-5">
            <motion.span aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-[#0B1030]/12" variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: EASE } } }} />
            <span aria-hidden="true" className="absolute left-0 top-0 h-[2px] w-10 bg-accent-deep" />
            <p className="font-display text-[13px] font-bold tracking-[0.1em] text-accent-deep">0{i + 1}</p>
            <p className="mt-2 text-[17px] font-semibold text-[#070D2B]">{f.t}</p>
            <p className="mt-1.5 text-[15px] leading-[1.6] text-[#0B1030]/65">{f.d}</p>
          </motion.div>
        ))}
      </motion.div>
      <p className="mt-6 text-[13.5px] text-[#0B1030]/50">{note[lang]}</p>
    </div>
  )
}

function Word({ w, i, n, p, strong, reduced }: { w: string; i: number; n: number; p: MotionValue<number>; strong: boolean; reduced: boolean }) {
  const a = i / n
  const opacity = useTransform(p, [a - 0.04, a + 0.04], reduced ? [1, 1] : [0.14, 1])
  return (
    <>
      <motion.span style={{ opacity }} className={strong ? 'text-accent-deep' : 'text-[#070D2B]'}>{w}</motion.span>{' '}
    </>
  )
}

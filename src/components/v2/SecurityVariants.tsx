import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
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

const ATMOS = {
  background:
    'radial-gradient(60% 70% at 15% 105%, #0052FF 0%, rgba(0,82,255,0) 70%), radial-gradient(55% 70% at 85% 110%, #1E90FF 0%, rgba(30,144,255,0) 70%), radial-gradient(80% 60% at 50% 120%, #7FB2FF 0%, rgba(127,178,255,0) 75%), radial-gradient(70% 50% at 50% -10%, #EAF1FF 0%, rgba(234,241,255,0) 70%), linear-gradient(180deg, #F7F9FF 0%, #D3E2FF 34%, #5B95FF 64%, #1A5CF0 100%)',
}

export function SecurityAtmosphere({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // A cor "sobe" lentamente com o scroll
  const bgY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['12%', '-12%'])
  const cardY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -30])

  const rows = [
    { name: pt ? 'Conta à ordem' : 'Current account', sub: pt ? 'Banco Exemplo · Open Banking' : 'Example Bank · Open Banking', state: pt ? 'Autorizada por si' : 'Authorised by you', on: true },
    { name: pt ? 'Faturas por email' : 'Invoices by email', sub: pt ? 'Endereço de faturas da empresa' : 'Company invoice address', state: pt ? 'A receber' : 'Receiving', on: true },
    { name: pt ? 'Conta poupança' : 'Savings account', sub: pt ? 'Banco Exemplo' : 'Example Bank', state: pt ? 'Não ligada' : 'Not connected', on: false },
  ]

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

      <motion.div style={{ y: cardY }} className="relative mx-auto max-w-[620px]">
        <motion.div variants={rise} className="rounded-[26px] bg-white/95 p-5 shadow-[0_40px_90px_-40px_rgba(7,13,43,0.55),0_0_0_1px_rgba(11,16,48,0.05)] backdrop-blur sm:p-7">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-[20px] font-bold tracking-[-0.02em] text-[#070D2B] sm:text-[22px]">{pt ? 'Ligações da sua empresa' : 'Your company’s connections'}</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B1030]/35">{pt ? 'Ilustrativo' : 'Illustrative'}</p>
          </div>
          <ul className="mt-4 divide-y divide-[#0B1030]/[0.07]">
            {rows.map((r, i) => (
              <motion.li
                key={r.name}
                className="flex items-center gap-4 py-3.5"
                variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE, delay: 0.35 + i * 0.18 } } }}
              >
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', r.on ? 'bg-[#EEF3FF] text-accent-deep' : 'bg-[#F3F5F9] text-[#0B1030]/35')}>
                  <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    {i === 1 ? <><rect x="2.5" y="4.5" width="15" height="11" rx="2" /><path d="m3 6 7 5 7-5" strokeLinejoin="round" /></> : <path d="M3 8h14M4 8v7m4-7v7m4-7v7m4-7v7M2.5 16.5h15M10 3l7 3.5H3z" strokeLinejoin="round" />}
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-[#070D2B]">{r.name}</span>
                  <span className="block truncate text-[13px] text-[#0B1030]/55">{r.sub}</span>
                </span>
                <motion.span
                  className={cn('flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-semibold', r.on ? 'bg-[#EEF3FF] text-accent-deep' : 'text-[#0B1030]/45 ring-1 ring-[#0B1030]/12')}
                  variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE, delay: 0.8 + i * 0.22 } } }}
                >
                  {r.on && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true"><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                  {r.state}
                </motion.span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* Três factos sobre a cor, em branco */}
      <motion.ul variants={group} className="relative mt-10 grid gap-6 text-white sm:grid-cols-3 sm:gap-8 lg:mt-14">
        {facts[lang].map((f) => (
          <motion.li key={f.t} variants={rise} className="border-t border-white/40 pt-4">
            <p className="text-[16px] font-semibold">{f.t}</p>
            <p className="mt-1.5 text-[14.5px] leading-[1.55] text-white/85">{f.d}</p>
          </motion.li>
        ))}
      </motion.ul>
      <motion.p variants={rise} className="relative mt-6 text-[13px] text-white/75">{note[lang]}</motion.p>
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

import { useRef } from 'react'
import type { ReactNode } from 'react'
import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { Variants } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { SecurityAtmosphere, SecurityManifesto } from './SecurityVariants'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * VERIFICAÇÃO DOS TEXTOS (11/11/2026) — só o que está confirmado.
 * Fonte: CLAUDE.md (indicações do fundador de 10/11/2026) e FAQ publicada.
 * 01 Informação utilizada → confirmado: só o que a empresa liga ou envia.
 * 02 Ligações bancárias → confirmado: Open Banking, ativa só depois da
 *    autorização junto do banco; nem todas as instituições disponíveis.
 * NÃO afirmar: encriptação, certificações, RGPD, prestadores, bancos
 * suportados, tempos de atualização, revogação de permissões ou uso de IA
 * (as respostas 03 e 04 continuam por validar — ver SecurityTrustAccordion).
 */
type Row = { tag: string; title: string; text: string; note?: string }

const copy: Record<Lang, {
  eyebrow: string
  title: [string, string]
  sub: string
  rows: [Row, Row]
  v1: { sources: [string, string]; hub: string; hubSub: string; caption: string }
  v2: { company: string; bank: string; finer: string; waiting: string; done: string; caption: string }
}> = {
  pt: {
    eyebrow: 'Segurança e transparência',
    title: ['A sua informação. ', 'O seu controlo.'],
    sub: 'Conheça as ligações e a forma como a Finer One trata os seus dados financeiros.',
    rows: [
      {
        tag: 'Informação utilizada',
        title: 'Só entra o que decide ligar ou enviar.',
        text: 'Os movimentos das contas bancárias que liga e as faturas enviadas para o endereço de faturas da empresa na Finer One. Essa informação é utilizada para a organizar e produzir as análises da plataforma.',
      },
      {
        tag: 'Ligações bancárias',
        title: 'Nada fica ligado sem a sua autorização.',
        text: 'A ligação é feita através de Open Banking e só fica ativa depois de a autorizar junto do seu banco.',
        note: 'Nem todas as instituições bancárias estão necessariamente disponíveis.',
      },
    ],
    v1: { sources: ['Contas bancárias ligadas', 'Faturas enviadas por email'], hub: 'Finer One', hubSub: 'Organização e análises', caption: 'Ilustrativo' },
    v2: { company: 'A sua empresa', bank: 'Banco Exemplo', finer: 'Finer One', waiting: 'A aguardar a sua autorização', done: 'Autorizada por si', caption: 'Ilustrativo · banco fictício' },
  },
  en: {
    eyebrow: 'Security and transparency',
    title: ['Your information. ', 'Your control.'],
    sub: 'See the connections and how Finer One handles your financial data.',
    rows: [
      {
        tag: 'Information used',
        title: 'Only what you choose to connect or send.',
        text: 'Transactions from the bank accounts you connect and invoices sent to your company’s Finer One invoice address. It is used to organise that information and produce the platform’s analyses.',
      },
      {
        tag: 'Bank connections',
        title: 'Nothing is connected without your authorisation.',
        text: 'Connections are made through Open Banking and only become active after you authorise them with your bank.',
        note: 'Not every banking institution is necessarily available.',
      },
    ],
    v1: { sources: ['Connected bank accounts', 'Invoices sent by email'], hub: 'Finer One', hubSub: 'Organisation and analyses', caption: 'Illustrative' },
    v2: { company: 'Your company', bank: 'Example Bank', finer: 'Finer One', waiting: 'Waiting for your authorisation', done: 'Authorised by you', caption: 'Illustrative · fictitious bank' },
  },
}

/** PRÉ-VISUALIZAÇÃO: ?painel=ramp | lovable | searchable (sem parâmetro = céu Finer One). */
const PANEL = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('painel') : null

/** Atmosfera de cor à maneira da Lovable, nas cores Finer One. */
const LOVABLE_BG = {
  background:
    'radial-gradient(70% 65% at 12% 108%, rgba(0,82,255,0.9), transparent 62%), radial-gradient(60% 60% at 92% 104%, rgba(30,144,255,0.8), transparent 62%), radial-gradient(90% 55% at 50% 112%, rgba(141,184,246,0.95), transparent 72%), radial-gradient(60% 40% at 70% -10%, rgba(185,211,250,0.55), transparent 70%), #F8FAFF',
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }

/**
 * Secção 6 — Segurança e confiança.
 * À maneira da página de segurança da Ramp: linhas alternadas com o texto de um
 * lado e um painel do outro. O painel usa o "céu" Finer One (o mundo das
 * secções 2 e 3) com um cartão branco por cima, como na secção 2.
 * Movimento: o painel abre ligeiramente com o scroll, o céu desliza (parallax)
 * e o conteúdo do cartão anima quando entra no ecrã.
 */
export function SecurityTrust() {
  const { lang } = useLanguage()
  const t = copy[lang]
  return (
    <MotionConfig reducedMotion="user">
      <section id="seguranca" aria-labelledby="seguranca-titulo" className="relative scroll-mt-20 bg-white text-navy">
        <div className="mx-auto max-w-content px-5 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
          <motion.div className="max-w-[760px] text-left" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
            <motion.p variants={item} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">{t.eyebrow}</motion.p>
            <motion.h2 variants={item} id="seguranca-titulo" className="mt-3 text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[48px] lg:text-[56px]">
              {t.title[0]}
              <span className="text-accent-deep">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={item} className="mt-4 max-w-[560px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </motion.div>

          {PANEL === 'atmosfera' ? (
            <SecurityAtmosphere lang={lang} />
          ) : PANEL === 'manifesto' ? (
            <SecurityManifesto lang={lang} />
          ) : PANEL === 'searchable' ? (
            <SearchableList lang={lang} />
          ) : (
            <div className="mt-10 space-y-6 lg:mt-12 lg:space-y-8">
              <FeatureRow row={t.rows[0]} index={0} flip={false}>
                <Sources t={t.v1} />
              </FeatureRow>
              <FeatureRow row={t.rows[1]} index={1} flip>
                <Authorise t={t.v2} />
              </FeatureRow>
            </div>
          )}
        </div>
      </section>
    </MotionConfig>
  )
}

function FeatureRow({ row, index, flip, children }: { row: Row; index: number; flip: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.35'] })
  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [0.94, 1])
  const skyY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-8%', '0%'])

  return (
    <motion.div
      ref={ref}
      className="grid items-center gap-6 lg:grid-cols-2 lg:gap-14"
      variants={group}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
    >
      {/* Texto */}
      <div className={cn('lg:px-4', flip && 'lg:order-2')}>
        <motion.p variants={item} className="flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#0B1030]/50">
          <span className="font-display text-[13px] font-bold tracking-[0.1em] text-accent-deep">0{index + 1}</span>
          <span aria-hidden="true" className="h-px w-6 bg-[#0B1030]/20" />
          {row.tag}
        </motion.p>
        <motion.h3 variants={item} className="mt-4 text-balance font-display text-[28px] font-bold leading-[1.06] tracking-[-0.035em] text-[#070D2B] sm:text-[36px] lg:text-[40px]">{row.title}</motion.h3>
        <motion.p variants={item} className="mt-4 max-w-[480px] text-[16px] leading-[1.65] text-[#0B1030]/70">{row.text}</motion.p>
        {row.note && <motion.p variants={item} className="mt-3 max-w-[480px] text-[14px] leading-relaxed text-[#0B1030]/50">{row.note}</motion.p>}
      </div>

      {/* Painel: céu Finer One + cartão branco */}
      <motion.div
        className={cn(
          'relative isolate h-[300px] overflow-hidden rounded-[32px] sm:h-[360px] lg:h-[400px]',
          PANEL === 'ramp' && 'bg-[#F2F4F8] bg-[radial-gradient(rgba(11,16,48,0.09)_1px,transparent_1px)] [background-size:14px_14px]',
          flip && 'lg:order-1',
        )}
        style={PANEL === 'lovable' ? { ...LOVABLE_BG, scale } : { scale }}
      >
        {!PANEL && (<>
        <motion.img
          src="/images/finer-sky.webp"
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="lazy"
          className="absolute inset-x-0 -top-[8%] -z-10 h-[116%] w-full object-cover"
          style={{ y: skyY }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/0 to-white/25" />
        </>)}
        {/* O conteúdo do cartão anima (variantes off → on) quando o painel entra no ecrã */}
        <motion.div className="absolute inset-0 flex items-center justify-center p-5 sm:p-8" initial="off" whileInView="on" viewport={{ once: true, amount: 0.6 }}>
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

const card = 'w-full max-w-[420px] rounded-[22px] bg-white/95 p-5 shadow-[0_30px_60px_-30px_rgba(7,13,43,0.45),0_0_0_1px_rgba(11,16,48,0.05)] sm:p-6'

/* ---------- Painel 01: só entra o que decide ligar ou enviar ---------- */

const grow = (axis: 'x' | 'y', d: number): Variants =>
  axis === 'x'
    ? { off: { scaleX: 0 }, on: { scaleX: 1, transition: { duration: 0.35, ease: EASE, delay: d } } }
    : { off: { scaleY: 0 }, on: { scaleY: 1, transition: { duration: 0.3, ease: EASE, delay: d } } }

function Sources({ t }: { t: (typeof copy)['pt']['v1'] }) {
  const pop = (d: number): Variants => ({ off: { opacity: 0, y: 10 }, on: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay: d } } })
  return (
    <div className={card}>
      <div className="grid grid-cols-2 gap-3">
        {t.sources.map((s, i) => (
          <motion.div key={s} variants={pop(0.1 + i * 0.12)} className="rounded-[14px] bg-[#F4F7FC] px-3.5 py-3">
            <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-accent-deep shadow-[0_0_0_1px_rgba(11,16,48,0.06)]">
              {i === 0 ? (
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8h14M4 8v7m4-7v7m4-7v7m4-7v7M2.5 16.5h15M10 3l7 3.5H3z" strokeLinejoin="round" /></svg>
              ) : (
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2.5" y="4.5" width="15" height="11" rx="2" /><path d="m3 6 7 5 7-5" strokeLinejoin="round" /></svg>
              )}
            </span>
            <p className="mt-2.5 text-[13.5px] font-semibold leading-snug text-[#070D2B]">{s}</p>
          </motion.div>
        ))}
      </div>
      {/* Duas origens que convergem na Finer One (linhas finas, desenhadas em sequência) */}
      <div aria-hidden="true" className="relative h-9">
        <motion.span className="absolute left-1/4 top-0 h-1/2 w-px origin-top bg-accent-deep" variants={grow('y', 0.45)} />
        <motion.span className="absolute right-1/4 top-0 h-1/2 w-px origin-top bg-accent-deep" variants={grow('y', 0.45)} />
        <motion.span className="absolute left-1/4 right-1/4 top-1/2 h-px origin-center bg-accent-deep" variants={grow('x', 0.65)} />
        <motion.span className="absolute left-1/2 top-1/2 h-1/2 w-px origin-top bg-accent-deep" variants={grow('y', 0.85)} />
      </div>
      <motion.div variants={pop(0.95)} className="flex items-center gap-3 rounded-[14px] bg-[#070D2B] px-4 py-3.5 text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
          <svg viewBox="0 0 326 445" className="h-3.5 w-3.5 fill-[#070D2B]" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
        </span>
        <span>
          <span className="block text-[14px] font-bold">{t.hub}</span>
          <span className="block text-[12.5px] text-white/65">{t.hubSub}</span>
        </span>
      </motion.div>
      <p className="mt-3 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B1030]/35">{t.caption}</p>
    </div>
  )
}

/* ---------- Painel 02: nada fica ligado sem a sua autorização ---------- */

function Authorise({ t }: { t: (typeof copy)['pt']['v2'] }) {
  const pop = (d: number): Variants => ({ off: { opacity: 0, y: 10 }, on: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay: d } } })
  const node = (label: string, dark?: boolean) => (
    <span className={cn('flex-1 rounded-[12px] px-2 py-2.5 text-center text-[12.5px] font-semibold leading-tight', dark ? 'bg-[#070D2B] text-white' : 'bg-[#F4F7FC] text-[#070D2B]')}>{label}</span>
  )
  return (
    <div className={card}>
      <motion.div variants={pop(0.1)} className="flex items-center gap-2">
        {node(t.company)}
        <Link d={0.5} />
        {node(t.bank)}
        <Link d={0.9} />
        {node(t.finer, true)}
      </motion.div>
      {/* Estado da autorização: passa de "a aguardar" para "autorizada por si" */}
      <motion.div variants={pop(0.3)} className="relative mt-4 h-[52px] overflow-hidden rounded-[14px] ring-1 ring-[#0B1030]/[0.06]">
        <motion.div
          className="absolute inset-0 flex items-center gap-3 px-4 text-[14px] font-medium text-[#0B1030]/60"
          variants={{ off: { opacity: 1 }, on: { opacity: 0, transition: { delay: 1.6, duration: 0.3 } } }}
        >
          <span className="h-2 w-2 rounded-full bg-[#0B1030]/25" />
          {t.waiting}
        </motion.div>
        <motion.div
          className="absolute inset-0 flex items-center gap-3 bg-[#EEF3FF] px-4 text-[14px] font-semibold text-accent-deep"
          variants={{ off: { opacity: 0, y: 8 }, on: { opacity: 1, y: 0, transition: { delay: 1.75, duration: 0.45, ease: EASE } } }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-deep text-white">
            <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true"><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          {t.done}
        </motion.div>
      </motion.div>
      <p className="mt-3 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B1030]/35">{t.caption}</p>
    </div>
  )
}

function Link({ d }: { d: number }) {
  return (
    <svg viewBox="0 0 24 8" className="h-2 w-6 shrink-0" aria-hidden="true">
      <line x1="0" y1="4" x2="24" y2="4" stroke="rgba(11,16,48,0.15)" strokeWidth="1.5" strokeDasharray="2 3" />
      <motion.line x1="0" y1="4" x2="24" y2="4" stroke="#0A40C8" strokeWidth="1.5" variants={{ off: { pathLength: 0 }, on: { pathLength: 1, transition: { duration: 0.5, ease: EASE, delay: d } } }} />
    </svg>
  )
}

/* ---------- Opção Searchable: painel cinzento com lista de pontos (como a página Enterprise) ---------- */

const listCopy: Record<Lang, { title: string; text: string; caption: string; items: { icon: 'bank' | 'mail' | 'link' | 'info'; t: string; d: string }[] }> = {
  pt: {
    title: 'Nada entra nem fica ligado sem a sua decisão.',
    text: 'A informação que liga ou envia é utilizada para a organizar e produzir as análises da plataforma.',
    caption: 'Segurança e transparência',
    items: [
      { icon: 'bank', t: 'Contas bancárias que decide ligar', d: 'Os movimentos das contas que escolhe ligar à Finer One.' },
      { icon: 'mail', t: 'Faturas que decide enviar', d: 'As faturas enviadas para o endereço de faturas da empresa na Finer One.' },
      { icon: 'link', t: 'Ligação por Open Banking', d: 'Só fica ativa depois de a autorizar junto do seu banco.' },
      { icon: 'info', t: 'Disponibilidade', d: 'Nem todas as instituições bancárias estão necessariamente disponíveis.' },
    ],
  },
  en: {
    title: 'Nothing comes in or gets connected without your decision.',
    text: 'The information you connect or send is used to organise it and produce the platform’s analyses.',
    caption: 'Security and transparency',
    items: [
      { icon: 'bank', t: 'Bank accounts you choose to connect', d: 'Transactions from the accounts you choose to connect to Finer One.' },
      { icon: 'mail', t: 'Invoices you choose to send', d: 'Invoices sent to your company’s Finer One invoice address.' },
      { icon: 'link', t: 'Open Banking connection', d: 'Only becomes active after you authorise it with your bank.' },
      { icon: 'info', t: 'Availability', d: 'Not every banking institution is necessarily available.' },
    ],
  },
}

const ICONS = {
  bank: <path d="M3 8h14M4 8v7m4-7v7m4-7v7m4-7v7M2.5 16.5h15M10 3l7 3.5H3z" strokeLinejoin="round" />,
  mail: <><rect x="2.5" y="4.5" width="15" height="11" rx="2" /><path d="m3 6 7 5 7-5" strokeLinejoin="round" /></>,
  link: <path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.9.9M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.9-.9" strokeLinecap="round" />,
  info: <><circle cx="10" cy="10" r="7.5" /><path d="M10 9v5M10 6.2v.1" strokeLinecap="round" /></>,
}

function SearchableList({ lang }: { lang: Lang }) {
  const t = listCopy[lang]
  const row: Variants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }
  const rule: Variants = { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.7, ease: EASE } } }
  return (
    <motion.div
      className="mt-10 grid gap-10 rounded-[28px] bg-[#F3F5F9] p-6 sm:p-10 lg:mt-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:p-14"
      variants={group}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="lg:self-end">
        <motion.p variants={row} className="text-[14px] font-medium text-[#0B1030]/55">{t.caption}</motion.p>
        <motion.h3 variants={row} className="mt-3 text-balance font-display text-[28px] font-bold leading-[1.06] tracking-[-0.035em] text-[#070D2B] sm:text-[36px] lg:text-[40px]">{t.title}</motion.h3>
        <motion.p variants={row} className="mt-4 max-w-[440px] text-[16px] leading-[1.65] text-[#0B1030]/70">{t.text}</motion.p>
      </div>
      <motion.ul variants={group}>
        {t.items.map((x, i) => (
          <motion.li key={x.t} variants={row} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 gap-y-1 py-5 sm:grid-cols-[28px_minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-x-6">
            {i === 0 && <motion.span aria-hidden="true" variants={rule} className="absolute inset-x-0 top-0 h-px origin-left border-t border-dashed border-[#0B1030]/20" />}
            <motion.span aria-hidden="true" variants={rule} className="absolute inset-x-0 bottom-0 h-px origin-left border-t border-dashed border-[#0B1030]/20" />
            <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 text-accent-deep" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{ICONS[x.icon]}</svg>
            <p className="text-[15.5px] font-semibold leading-snug text-[#070D2B]">{x.t}</p>
            <p className="col-start-2 text-[14.5px] leading-[1.6] text-[#0B1030]/65 sm:col-start-3 sm:row-start-1">{x.d}</p>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  )
}

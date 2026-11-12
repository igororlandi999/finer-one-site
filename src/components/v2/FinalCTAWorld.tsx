import { ArrowRight } from 'lucide-react'
import { MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { buttonClasses } from '@/components/ui/Button'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Secção 8 — CTA final (12/11/2026). O "mundo" da hero (a Terra vista do
 * espaço) numa versão estática nítida (public/images/cta-earth.webp, a partir
 * do poster da hero, com nitidez reforçada). Duas ações, por indicação do
 * fundador: Ser Finer Pioneer (principal) e lista de espera (secundária).
 *
 * PRÉ-VISUALIZAÇÃO de três composições: ?ctaestilo=lovable | searchable | ramp.
 */
const IMG = '/images/cta-earth.webp'
const STYLE = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ctaestilo') : null) ?? 'lovable'

const copy: Record<Lang, { eyebrow: string; title: [string, string]; sub: string; primary: string; secondary: string; pill: string; or: string }> = {
  pt: {
    eyebrow: 'Where Finance Meets Strategy',
    title: ['O futuro do seu negócio merece ', 'decisões mais claras.'],
    sub: 'Descubra uma nova forma de acompanhar as finanças da sua empresa.',
    primary: 'Ser Finer Pioneer',
    secondary: 'Entrar na lista de espera',
    pill: 'Junte-se aos primeiros empresários',
    or: 'ou entrar na lista de espera',
  },
  en: {
    eyebrow: 'Where Finance Meets Strategy',
    title: ['Your business’s future deserves ', 'clearer decisions.'],
    sub: 'Discover a new way to follow your company’s finances.',
    primary: 'Become a Finer Pioneer',
    secondary: 'Join the waitlist',
    pill: 'Join the first business owners',
    or: 'or join the waitlist',
  },
}
type T = (typeof copy)['pt']

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const rise: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }

const primaryBtn = buttonClasses({
  size: 'lg',
  className:
    'group h-[52px] px-7 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_30px_-10px_rgba(0,82,255,0.95)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_16px_40px_-12px_rgba(30,144,255,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-[#03060F]',
})
const secondaryBtn = buttonClasses({
  variant: 'outline',
  size: 'lg',
  className:
    'group h-[52px] border-white/[0.16] bg-white/[0.04] px-6 text-white/90 backdrop-blur-sm transition-[border-color,background-color,color] duration-300 hover:border-white/30 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow',
})

function Title({ t, center }: { t: T; center?: boolean }) {
  return (
    <>
      <motion.p variants={rise} className={cn('inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7CB8FF] sm:tracking-[0.3em]', center && 'justify-center')}>
        <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-glow" />
        {t.eyebrow}
        {center && <span aria-hidden="true" className="h-px w-8 bg-gradient-to-l from-transparent to-glow" />}
      </motion.p>
      <motion.h2 variants={rise} id="cta-final-titulo" className="mt-6 text-balance font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-[48px] lg:text-[56px]">
        {t.title[0]}
        <span className="text-[#3D86FF] [text-shadow:0_0_28px_rgba(0,82,255,0.5)]">{t.title[1]}</span>
      </motion.h2>
      <motion.p variants={rise} className={cn('mt-6 max-w-[520px] text-[16.5px] leading-[1.6] text-white/[0.8] sm:text-[18px]', center && 'mx-auto')}>{t.sub}</motion.p>
    </>
  )
}

function Buttons({ t, center }: { t: T; center?: boolean }) {
  return (
    <motion.div variants={rise} className={cn('mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3.5', center && 'sm:justify-center')}>
      <a href="/pioneers/" className={primaryBtn}>
        {t.primary}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
      </a>
      <a href="/lista-espera/" className={secondaryBtn}>
        {t.secondary}
        <ArrowRight className="h-4 w-4 text-white/60 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
      </a>
    </motion.div>
  )
}

export function FinalCTAWorld() {
  const { lang } = useLanguage()
  const t = copy[lang]
  return (
    <MotionConfig reducedMotion="user">
      {STYLE === 'searchable' ? <SearchableCTA t={t} /> : STYLE === 'ramp' ? <RampCTA t={t} /> : <LovableCTA t={t} />}
    </MotionConfig>
  )
}

/* A · Lovable — tudo ao centro, o mundo a nascer por baixo da frase */
function LovableCTA({ t }: { t: T }) {
  return (
    <section aria-labelledby="cta-final-titulo" className="relative isolate overflow-hidden bg-[#03060F] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <img src={IMG} alt="" loading="lazy" decoding="async" className="absolute inset-x-0 bottom-0 h-[78%] w-full object-cover object-[50%_62%]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#03060F_0%,#03060F_24%,rgba(3,6,15,0.55)_48%,rgba(3,6,15,0.05)_72%,rgba(3,6,15,0.35)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-navy-deep" />
      </div>
      <motion.div className="mx-auto max-w-[900px] px-6 pb-[min(34vw,340px)] pt-24 text-center sm:pt-28 lg:pt-32" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
        <Title t={t} center />
        <Buttons t={t} center />
      </motion.div>
    </section>
  )
}

/* B · Searchable — bloco escuro com cantos, texto à esquerda, o mundo à direita */
function SearchableCTA({ t }: { t: T }) {
  return (
    <section aria-labelledby="cta-final-titulo" className="relative bg-white px-3 pb-0 sm:px-5">
      <div className="mx-auto max-w-[1320px]">
        <motion.div
          className="relative isolate grid overflow-hidden rounded-t-[28px] bg-[#03060F] text-white lg:min-h-[520px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
          variants={group}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <div className="relative z-10 flex flex-col justify-center px-6 py-16 sm:px-12 lg:py-20 lg:pl-16 lg:pr-4">
            <Title t={t} />
            <Buttons t={t} />
          </div>
          <div aria-hidden="true" className="relative h-[280px] sm:h-[340px] lg:h-auto">
            <img src={IMG} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[60%_70%]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#03060F_0%,transparent_30%)] lg:bg-[linear-gradient(to_right,#03060F_0%,rgba(3,6,15,0.4)_30%,transparent_60%)]" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* C · Ramp — frase curta ao centro e uma "pílula" branca com a ação principal; o mundo em faixa por baixo */
function RampCTA({ t }: { t: T }) {
  return (
    <section aria-labelledby="cta-final-titulo" className="relative isolate overflow-hidden bg-[#03060F] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <img src={IMG} alt="" loading="lazy" decoding="async" className="absolute inset-x-0 bottom-0 h-[62%] w-full object-cover object-[50%_58%]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#03060F_0%,#03060F_40%,rgba(3,6,15,0.4)_62%,rgba(3,6,15,0.1)_80%,rgba(3,6,15,0.5)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-navy-deep" />
      </div>
      <motion.div className="mx-auto max-w-[860px] px-6 pb-[min(30vw,300px)] pt-24 text-center sm:pt-28 lg:pt-32" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
        <motion.h2 variants={rise} id="cta-final-titulo" className="text-balance font-display text-[34px] font-bold leading-[1.06] tracking-[-0.035em] sm:text-[46px] lg:text-[54px]">
          {t.title[0]}
          <span className="text-[#3D86FF] [text-shadow:0_0_28px_rgba(0,82,255,0.5)]">{t.title[1]}</span>
        </motion.h2>
        <motion.p variants={rise} className="mx-auto mt-5 max-w-[520px] text-[16.5px] leading-[1.6] text-white/[0.8] sm:text-[18px]">{t.sub}</motion.p>
        {/* Pílula à maneira da Ramp (sem formulário: a ação leva à página dos Finer Pioneers) */}
        <motion.div variants={rise} className="mx-auto mt-9 flex max-w-[560px] flex-col items-stretch gap-2 rounded-[14px] bg-white p-1.5 sm:flex-row sm:items-center">
          <span className="px-4 py-3 text-left text-[15px] text-[#0B1030]/60 sm:flex-1">{t.pill}</span>
          <a href="/pioneers/" className="group inline-flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-accent px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#1A63FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            {t.primary}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </motion.div>
        <motion.p variants={rise} className="mt-4">
          <a href="/lista-espera/" className="text-[14.5px] font-medium text-white/75 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow">
            {t.or}
          </a>
        </motion.p>
      </motion.div>
    </section>
  )
}

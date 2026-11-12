import { ArrowRight } from 'lucide-react'
import { MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { buttonClasses } from '@/components/ui/Button'
import { HERO_BACKGROUND } from '@/config/demo'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Secção 8 — CTA final (12/11/2026). Volta ao "mundo" da hero: a Terra vista
 * do espaço, sobre navy profundo (o mesmo vídeo e o mesmo poster da hero,
 * já em cache). Texto à esquerda sobre o céu escuro; a linha luminosa da marca
 * desenha-se uma vez ao entrar. Duas ações, por indicação do fundador:
 * Ser Finer Pioneer (principal) e entrar na lista de espera (secundária).
 */
const copy: Record<Lang, { eyebrow: string; title: [string, string]; sub: string; primary: string; secondary: string }> = {
  pt: {
    eyebrow: 'Where Finance Meets Strategy',
    title: ['O futuro do seu negócio merece ', 'decisões mais claras.'],
    sub: 'Descubra uma nova forma de acompanhar as finanças da sua empresa.',
    primary: 'Ser Finer Pioneer',
    secondary: 'Entrar na lista de espera',
  },
  en: {
    eyebrow: 'Where Finance Meets Strategy',
    title: ['Your business’s future deserves ', 'clearer decisions.'],
    sub: 'Discover a new way to follow your company’s finances.',
    primary: 'Become a Finer Pioneer',
    secondary: 'Join the waitlist',
  },
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const rise: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }

export function FinalCTAWorld() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = usePrefersReducedMotion()
  const wide = useMediaQuery('(min-width: 768px)')
  const saveData = typeof navigator !== 'undefined' && Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
  const useVideo = wide && !reduced && !saveData

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="cta-final-titulo" className="relative isolate overflow-hidden bg-[#03060F] text-white">
        {/* O mundo da hero */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {useVideo ? (
            <video className="absolute inset-0 h-full w-full object-cover object-[50%_78%]" src={HERO_BACKGROUND.video} poster={HERO_BACKGROUND.poster} autoPlay muted loop playsInline preload="none" tabIndex={-1} />
          ) : (
            <img src={HERO_BACKGROUND.poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[62%_82%]" />
          )}
          {/* Leitura: navy à esquerda e em cima (texto), Terra visível em baixo e à direita */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(3,6,15,0.92)_0%,rgba(3,6,15,0.66)_38%,rgba(3,6,15,0.1)_72%,rgba(3,6,15,0.2)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,6,15,0.85)_0%,rgba(3,6,15,0.2)_40%,transparent_60%)]" />
          {/* Passagem para o rodapé (navy profundo) */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-navy-deep" />
        </div>

        {/* Linha luminosa da marca: desenha-se uma vez ao entrar, termina com um brilho subtil */}
        <svg aria-hidden="true" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 -z-[5] h-full w-full">
          <defs>
            <linearGradient id="cta-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0052FF" stopOpacity="0" />
              <stop offset="0.4" stopColor="#1E90FF" stopOpacity="0.85" />
              <stop offset="1" stopColor="#7CC0FF" stopOpacity="1" />
            </linearGradient>
            <filter id="cta-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
            <radialGradient id="cta-spark"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.4" stopColor="#9FD3FF" stopOpacity="0.85" /><stop offset="1" stopColor="#1E90FF" stopOpacity="0" /></radialGradient>
          </defs>
          {(['blur', 'core'] as const).map((k) => (
            <motion.path
              key={k}
              d="M 420 560 C 560 520, 660 440, 760 330 S 900 150, 980 110"
              stroke="url(#cta-line)"
              strokeWidth={k === 'blur' ? 9 : 2}
              strokeLinecap="round"
              fill="none"
              opacity={k === 'blur' ? 0.5 : 1}
              filter={k === 'blur' ? 'url(#cta-blur)' : undefined}
              initial={{ pathLength: reduced ? 1 : 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 2.1, ease: [0.65, 0, 0.35, 1], delay: 0.3 }}
            />
          ))}
          <motion.circle
            cx="980"
            cy="110"
            r="14"
            fill="url(#cta-spark)"
            initial={{ opacity: reduced ? 1 : 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 2.3 }}
          />
        </svg>

        <motion.div
          className="mx-auto flex min-h-[560px] max-w-[1280px] flex-col justify-center px-6 py-20 sm:min-h-[600px] sm:px-10 lg:min-h-[min(640px,calc(100svh-64px))] lg:px-12 lg:py-16 xl:px-14"
          variants={group}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="max-w-[640px]">
            <motion.p variants={rise} className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7CB8FF] sm:tracking-[0.3em]">
              <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-glow" />
              {t.eyebrow}
            </motion.p>
            <motion.h2 variants={rise} id="cta-final-titulo" className="mt-6 text-balance font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[48px] lg:text-[56px]">
              {t.title[0]}
              <span className="text-accent [text-shadow:0_0_32px_rgba(0,82,255,0.45)]">{t.title[1]}</span>
            </motion.h2>
            <motion.p variants={rise} className="mt-6 max-w-[520px] text-[16.5px] leading-[1.6] text-white/[0.78] sm:text-[18px]">{t.sub}</motion.p>
            <motion.div variants={rise} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3.5">
              <a
                href="/pioneers/"
                className={buttonClasses({
                  size: 'lg',
                  className:
                    'group h-[52px] px-7 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_30px_-10px_rgba(0,82,255,0.95)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_16px_40px_-12px_rgba(30,144,255,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-[#03060F]',
                })}
              >
                {t.primary}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <a
                href="/lista-espera/"
                className={buttonClasses({
                  variant: 'outline',
                  size: 'lg',
                  className:
                    'group h-[52px] border-white/[0.16] bg-white/[0.04] px-6 text-white/90 backdrop-blur-sm transition-[border-color,background-color,color] duration-300 hover:border-white/30 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow',
                })}
              >
                {t.secondary}
                <ArrowRight className="h-4 w-4 text-white/60 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

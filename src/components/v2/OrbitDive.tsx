import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useLanguage } from '@/i18n/LanguageContext'

/**
 * PROTÓTIPO (?mergulho=sim) — "Da órbita à sua empresa".
 * Entre a hero e a secção 2: a secção fica presa e a câmara mergulha do mundo
 * (imagem de identidade) até Portugal, atravessa as nuvens (o "céu" Finer da
 * secção 2) e termina em branco, onde começa a experiência Finer Home.
 * Só desktop e sem movimento reduzido; caso contrário não aparece.
 * As duas legendas são propostas — por aprovar pelos fundadores.
 */
const EARTH = '/images/cta-earth.webp' // 2244×1130
const SKY = '/images/finer-sky.webp'
/** Portugal na imagem do mundo (fração da largura/altura). */
const PT = { x: 0.385, y: 0.665 }

const copy = {
  pt: { a: 'Do mundo dos números', b: 'às respostas da sua empresa.', pin: 'Portugal' },
  en: { a: 'From a world of numbers', b: 'to answers for your company.', pin: 'Portugal' },
}

export function OrbitDive() {
  const wide = useMediaQuery('(min-width: 1024px)')
  const reduced = useReducedMotion() ?? false
  if (!wide || reduced) return null
  return <Dive />
}

function Dive() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.5 })

  // 1) Aproximação a Portugal
  const earthScale = useTransform(p, [0, 0.62], [1, 4.2])
  const earthOpacity = useTransform(p, [0.52, 0.62], [1, 0])
  // 2) Ponto de Portugal
  const pinOpacity = useTransform(p, [0.16, 0.26, 0.5, 0.58], [0, 1, 1, 0])
  // 3) Atravessar as nuvens (o céu Finer)
  const skyOpacity = useTransform(p, [0.5, 0.6], [0, 1])
  const skyScale = useTransform(p, [0.5, 1], [1.5, 1])
  // 4) Chegada ao branco da secção 2
  const whiteOpacity = useTransform(p, [0.84, 1], [0, 1])
  // Legendas
  const aOpacity = useTransform(p, [0.04, 0.12, 0.3, 0.38], [0, 1, 1, 0])
  const bOpacity = useTransform(p, [0.6, 0.68, 0.84, 0.92], [0, 1, 1, 0])
  const aY = useTransform(p, [0.04, 0.38], [16, -16])
  const bY = useTransform(p, [0.6, 0.92], [16, -16])

  return (
    <section ref={ref} aria-hidden="true" className="relative h-[260vh] bg-[#03060F]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Mundo — escala com origem em Portugal */}
        <motion.div className="absolute inset-0" style={{ opacity: earthOpacity }}>
          <div className="absolute left-1/2 top-1/2 aspect-[2244/1130] w-[max(100vw,198.6svh)] -translate-x-1/2 -translate-y-1/2">
            <motion.img src={EARTH} alt="" decoding="async" className="h-full w-full object-cover will-change-transform" style={{ scale: earthScale, transformOrigin: `${PT.x * 100}% ${PT.y * 100}%` }} />
            {/* Ponto de luz em Portugal */}
            <motion.span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_6px_rgba(30,144,255,0.35),0_0_28px_rgba(30,144,255,0.9)]" style={{ left: `${PT.x * 100}%`, top: `${PT.y * 100}%`, opacity: pinOpacity }} />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,6,15,0.85)_0%,rgba(3,6,15,0.2)_35%,rgba(3,6,15,0.2)_70%,rgba(3,6,15,0.6)_100%)]" />
        </motion.div>

        {/* Nuvens: o céu Finer da secção 2 */}
        <motion.img src={SKY} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover will-change-transform" style={{ opacity: skyOpacity, scale: skyScale }} />

        {/* Chegada: branco da secção seguinte */}
        <motion.div className="absolute inset-0 bg-white" style={{ opacity: whiteOpacity }} />

        {/* Legendas */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
          <motion.p style={{ opacity: aOpacity, y: aY }} className="absolute font-display text-[44px] font-bold tracking-[-0.035em] text-white [text-shadow:0_2px_30px_rgba(3,6,15,0.6)] xl:text-[56px]">
            {t.a}
          </motion.p>
          <motion.p style={{ opacity: bOpacity, y: bY }} className="absolute font-display text-[44px] font-bold tracking-[-0.035em] text-[#070D2B] xl:text-[56px]">
            {t.b}
          </motion.p>
        </div>
      </div>
    </section>
  )
}

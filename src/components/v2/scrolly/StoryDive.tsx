import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import { ChapterTitle } from './ChapterTitle'
import { useFloodClip } from './flood'

/**
 * PROTÓTIPO /historia/ — abertura: "Do mundo dos números" → acende-se uma luz
 * em Portugal → a luz cresce até encher o ecrã → Capítulo 01 · Compreender hoje.
 * Nitidez: o mundo nunca é ampliado mais do que 1,12x (antes chegava a 4,2x);
 * a "aproximação" é feita pela luz, que é vetorial.
 */
export const EARTH = '/images/cta-earth.webp' // 2244×1130
/** Portugal na imagem. Com object-position igual a estas frações, o ponto fica
 * sempre nesta posição do ecrã, qualquer que seja o formato do ecrã. */
export const PT = { x: 0.385, y: 0.665 }
export const earthPos = { objectPosition: `${PT.x * 100}% ${PT.y * 100}%`, transformOrigin: `${PT.x * 100}% ${PT.y * 100}%` }

const caption = { pt: 'Do mundo dos números', en: 'From a world of numbers' }

export function StoryDive() {
  const { lang } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })

  const earthScale = useTransform(p, [0, 0.5], [1, 1.12])
  const capOpacity = useTransform(p, [0.02, 0.1, 0.26, 0.34], [0, 1, 1, 0])
  const capY = useTransform(p, [0.02, 0.34], [18, -18])
  const pinOpacity = useTransform(p, [0.24, 0.32], [0, 1])
  const pinScale = useTransform(p, [0.24, 0.42], [0.4, 1.25])
  const flood = useTransform(p, [0.4, 0.7], [0, 1])
  const clipPath = useFloodClip(flood, stage, { fx: PT.x, fy: PT.y })
  const glow = useTransform(p, [0.3, 0.46, 0.66], [0, 1, 0.6])

  return (
    <section ref={ref} className="relative h-[280vh] bg-[#03060F]">
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.img src={EARTH} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ ...earthPos, scale: earthScale }} />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,6,15,0.9)_0%,rgba(3,6,15,0.25)_32%,rgba(3,6,15,0.15)_70%,rgba(3,6,15,0.55)_100%)]" />

        <motion.div aria-hidden="true" style={{ opacity: glow }} className="absolute inset-0 bg-[radial-gradient(circle_at_38.5%_66.5%,rgba(200,222,255,0.55),rgba(30,144,255,0.18)_22%,transparent_48%)]" />
        {/* A luz em Portugal */}
        <motion.span aria-hidden="true" className="absolute -ml-[7px] -mt-[7px] h-[14px] w-[14px]" style={{ left: `${PT.x * 100}%`, top: `${PT.y * 100}%`, opacity: pinOpacity, scale: pinScale }}>
          <span className="absolute inset-0 animate-ping rounded-full bg-white/70 [animation-duration:2.2s]" />
          <span className="absolute inset-0 rounded-full bg-white shadow-[0_0_0_5px_rgba(30,144,255,0.35),0_0_34px_8px_rgba(30,144,255,0.85)]" />
        </motion.span>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
          <motion.p style={{ opacity: capOpacity, y: capY }} className="font-display text-[clamp(34px,5.4vw,76px)] font-bold leading-[1.02] tracking-[-0.045em] text-white [text-shadow:0_2px_40px_rgba(3,6,15,0.7)]">
            {caption[lang]}
          </motion.p>
        </div>

        {/* A luz cresce até ser a página — e começa o capítulo 01 */}
        <motion.div className="absolute inset-0 flex items-center justify-center bg-white" style={{ clipPath }}>
          <ChapterTitle index={0} theme="light" progress={p} from={0.68} />
        </motion.div>
      </div>
    </section>
  )
}

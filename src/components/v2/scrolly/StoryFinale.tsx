import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import { Buttons, Title, copy, group } from '@/components/v2/FinalCTAWorld'
import { EARTH, PT, earthPos } from './earth'
import { useFloodClip } from './flood'

/**
 * PROTÓTIPO /historia/ — fecho: o branco da página encolhe até ser outra vez
 * a luz em Portugal; a câmara afasta-se até ver o mundo inteiro e aparece o
 * CTA final (o mesmo texto e as mesmas duas ações da homepage aprovada).
 * A história fecha como abriu.
 */
export function StoryFinale() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const ref = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })

  const shrink = useTransform(p, [0.03, 0.36], [1, 0.0001])
  const clipPath = useFloodClip(shrink, stage, { fx: PT.x, fy: PT.y })
  const earthScale = useTransform(p, [0.03, 0.6], [1.12, 1])
  const pinOpacity = useTransform(p, [0.3, 0.38, 0.62, 0.72], [0, 1, 1, 0.75])
  const glow = useTransform(p, [0.04, 0.3, 0.46], [0.6, 1, 0])
  const veil = useTransform(p, [0.42, 0.6], [0, 1])

  const [live, setLive] = useState(false)
  useMotionValueEvent(p, 'change', (v) => setLive(v > 0.5))

  return (
    <section ref={ref} aria-labelledby="cta-final-titulo" className="relative h-[250vh] bg-[#03060F] text-white">
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.img src={EARTH} alt="" decoding="async" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ ...earthPos, scale: earthScale }} />
        <motion.div aria-hidden="true" style={{ opacity: veil }} className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,6,15,0.92)_0%,rgba(3,6,15,0.7)_38%,rgba(3,6,15,0.1)_62%,rgba(3,6,15,0)_85%,rgba(7,13,43,0.9)_100%)]" />

        <motion.div aria-hidden="true" style={{ opacity: glow }} className="absolute inset-0 bg-[radial-gradient(circle_at_38.5%_66.5%,rgba(200,222,255,0.55),rgba(30,144,255,0.18)_22%,transparent_48%)]" />
        <motion.span aria-hidden="true" className="absolute -ml-[7px] -mt-[7px] h-[14px] w-[14px]" style={{ left: `${PT.x * 100}%`, top: `${PT.y * 100}%`, opacity: pinOpacity }}>
          <span className="absolute inset-0 animate-ping rounded-full bg-white/70 [animation-duration:2.2s]" />
          <span className="absolute inset-0 rounded-full bg-white shadow-[0_0_0_5px_rgba(30,144,255,0.35),0_0_34px_8px_rgba(30,144,255,0.85)]" />
        </motion.span>

        <motion.div
          className={live ? 'absolute inset-x-0 top-[13svh] mx-auto max-w-[900px] px-6 text-center' : 'pointer-events-none absolute inset-x-0 top-[13svh] mx-auto max-w-[900px] px-6 text-center'}
          variants={group}
          initial="hidden"
          animate={live ? 'show' : 'hidden'}
        >
          <Title t={t} center />
          <Buttons t={t} center />
        </motion.div>

        {/* O branco da FAQ, que encolhe até à luz em Portugal */}
        <motion.div aria-hidden="true" className="absolute inset-0 bg-white" style={{ clipPath }} />
      </div>
    </section>
  )
}

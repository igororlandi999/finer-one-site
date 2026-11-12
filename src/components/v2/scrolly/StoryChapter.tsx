import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { ChapterTitle } from './ChapterTitle'
import { useFloodClip } from './flood'

/**
 * PROTÓTIPO /historia/ — capítulo escuro (02 Antecipar amanhã, 03 Decidir melhor).
 * O título sobe por máscara; depois o ponto final azul cresce até encher o
 * ecrã e passa a ser o fundo claro da secção seguinte.
 */
export function StoryChapter({ index, to = '#FFFFFF' }: { index: number; to?: string }) {
  const ref = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLSpanElement>(null)
  // Começa a contar quando a secção entra por baixo, para o título já subir à chegada.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })

  const titleScale = useTransform(p, [0.3, 0.88], [1, 1.06])
  const flood = useTransform(p, [0.6, 0.93], [0, 1])
  const clipPath = useFloodClip(flood, stage, { el: dot })
  const floodColor = useTransform(flood, [0, 0.3, 0.55], ['#0052FF', '#D6E4FF', to])

  return (
    <section ref={ref} className="relative z-10 -mt-10 h-[230vh] rounded-t-[32px] bg-navy-deep sm:rounded-t-[44px]">
      <div ref={stage} className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_55%,rgba(0,82,255,0.16),transparent_70%)]" />
        <motion.div style={{ scale: titleScale }} className="relative">
          <ChapterTitle ref={dot} index={index} theme="dark" progress={p} from={0.12} />
        </motion.div>
        <motion.div aria-hidden="true" className="absolute inset-0" style={{ clipPath, backgroundColor: floodColor }} />
      </div>
    </section>
  )
}

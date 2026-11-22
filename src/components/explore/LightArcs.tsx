import { useId } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { RefObject } from 'react'

/**
 * Arcos de luz da identidade Finer One (como na imagem da marca): duas faixas
 * azuis luminosas — uma a entrar pelo canto superior direito, outra pelo canto
 * inferior esquerdo — com halo largo, faixa média e um núcleo quase branco.
 * Os arcos deslizam ligeiramente com o scroll (sem animações em ciclo). Com movimento reduzido ficam parados.
 */
type ArcsProps = { target?: RefObject<HTMLElement | null>; variant?: 'hero' | 'card' | 'mobile'; className?: string }

const PATHS = {
  hero: {
    top: 'M1010,-70 C1120,110 1290,225 1530,262',
    bottom: 'M-90,610 C110,606 270,650 430,820',
    view: '0 0 1440 900',
  },
  mobile: {
    top: 'M250,-30 C292,70 340,118 440,140',
    bottom: 'M-40,600 C52,598 118,632 190,760',
    view: '0 0 400 820',
  },
  card: {
    top: 'M640,-40 C760,90 900,160 1080,180',
    bottom: 'M-40,330 C140,326 300,380 470,480',
    view: '0 0 1040 440',
  },
}

export function LightArcs({ target, variant = 'hero', className }: ArcsProps) {
  const reduced = useReducedMotion() ?? false
  const uid = useId().replace(/:/g, '')
  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end start'] })
  const yTop = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -60])
  const yBottom = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 50])
  const p = PATHS[variant]
  const halo = variant === 'hero' ? 150 : variant === 'mobile' ? 70 : 90
  const mid = variant === 'hero' ? 32 : variant === 'mobile' ? 16 : 20

  const arc = (d: string, id: string, fade: 'start' | 'end') => (
    <g>
      <linearGradient id={`${id}-g-${uid}`} x1="0" x2="1" y1="0" y2="0">
        {fade === 'start' ? (
          <>
            <stop offset="0" stopColor="#0052FF" stopOpacity="0" />
            <stop offset="0.35" stopColor="#1E6BFF" />
            <stop offset="1" stopColor="#3D86FF" />
          </>
        ) : (
          <>
            <stop offset="0" stopColor="#3D86FF" />
            <stop offset="0.65" stopColor="#1E6BFF" />
            <stop offset="1" stopColor="#0052FF" stopOpacity="0" />
          </>
        )}
      </linearGradient>
      <path d={d} fill="none" stroke={`url(#${id}-g-${uid})`} strokeWidth={halo} opacity="0.5" filter={`url(#blurL-${uid})`} />
      <path d={d} fill="none" stroke={`url(#${id}-g-${uid})`} strokeWidth={mid} opacity="0.9" filter={`url(#blurM-${uid})`} />
      <path d={d} fill="none" stroke="#F4F8FF" strokeWidth="2.6" style={{ filter: 'drop-shadow(0 0 6px #7CB8FF) drop-shadow(0 0 18px #1E6BFF) drop-shadow(0 0 42px #0052FF)' }} />
    </g>
  )

  return (
    <div aria-hidden="true" className={className ?? 'pointer-events-none absolute inset-0 -z-10 overflow-hidden'}>
      <svg viewBox={p.view} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <filter id={`blurL-${uid}`} filterUnits="userSpaceOnUse" x="-400" y="-400" width="2400" height="1800">
            <feGaussianBlur stdDeviation={variant === 'hero' ? 36 : variant === 'mobile' ? 18 : 22} />
          </filter>
          <filter id={`blurM-${uid}`} filterUnits="userSpaceOnUse" x="-400" y="-400" width="2400" height="1800">
            <feGaussianBlur stdDeviation={variant === 'hero' ? 11 : variant === 'mobile' ? 6 : 7} />
          </filter>
        </defs>
        <motion.g style={{ y: yTop }}>{arc(p.top, 'top', 'start')}</motion.g>
        <motion.g style={{ y: yBottom }}>{arc(p.bottom, 'bottom', 'end')}</motion.g>
      </svg>
    </div>
  )
}

/** Nevoeiro azul à maneira da Lovable: manchas desfocadas, paradas. */
export function BlueFog({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={className ?? 'pointer-events-none absolute inset-0 -z-10 overflow-hidden'}>
      <div className="absolute left-1/2 top-[48%] h-[720px] w-[1300px] -translate-x-1/2"><div className="h-full w-full rounded-full bg-[radial-gradient(closest-side,rgba(30,144,255,0.62),rgba(0,82,255,0.3)_55%,transparent)] blur-[90px]" /></div>
      <div className="absolute left-1/2 top-[64%] h-[380px] w-[900px] -translate-x-1/2"><div className="h-full w-full rounded-full bg-[radial-gradient(closest-side,rgba(200,226,255,0.42),transparent)] blur-[80px]" /></div>
      <div className="absolute left-[4%] top-[58%] h-[420px] w-[640px]"><div className="h-full w-full rounded-full bg-[radial-gradient(closest-side,rgba(124,184,255,0.32),transparent)] blur-[90px]" /></div>
      <div className="absolute right-[2%] top-[54%] h-[380px] w-[600px]"><div className="h-full w-full rounded-full bg-[radial-gradient(closest-side,rgba(61,134,255,0.34),transparent)] blur-[90px]" /></div>
    </div>
  )
}

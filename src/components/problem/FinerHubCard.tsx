import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { Ref } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { BentoCard } from '@/components/problem/BentoCard'
import { systemIcons } from '@/components/problem/sourceIcons'
import { hubInputs, hubOutputs } from '@/data/problemSection'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

// Coordenadas em percentagem do card. As colunas usam grelhas de linhas
// iguais, por isso o centro de cada chip é previsível e os conectores
// encaixam sem medições em JavaScript.
const INPUT_EDGE = 34
const OUTPUT_EDGE = 68
const HUB_LEFT = 45
const HUB_RIGHT = 55

const inputY = (index: number) => ((index + 0.5) / hubInputs.length) * 100
const outputY = (index: number) => ((index + 0.5) / hubOutputs.length) * 100

const inputPath = (index: number) => {
  const y = inputY(index)
  const mid = (INPUT_EDGE + HUB_LEFT) / 2
  return `M${INPUT_EDGE},${y} C${mid},${y} ${mid},50 ${HUB_LEFT},50`
}

const outputPath = (index: number) => {
  const y = outputY(index)
  const mid = (HUB_RIGHT + OUTPUT_EDGE) / 2
  return `M${HUB_RIGHT},50 C${mid},50 ${mid},${y} ${OUTPUT_EDGE},${y}`
}

function Chip({
  label,
  icon,
  tone = 'input',
  className,
  ref,
}: {
  label: string
  icon: string
  tone?: 'input' | 'output'
  className?: string
  ref?: Ref<HTMLSpanElement>
}) {
  const Icon = systemIcons[icon]

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-navy-soft/70 px-2 py-1 text-[11px] leading-none text-mist',
        className,
      )}
    >
      <Icon
        size={11}
        aria-hidden="true"
        className={tone === 'output' ? 'text-glow' : undefined}
      />
      <span className="truncate">{label}</span>
    </span>
  )
}

function Hub({ innerRef }: { innerRef?: Ref<HTMLSpanElement> }) {
  return (
    <span
      ref={innerRef}
      className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-accent/[0.4] bg-navy"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-glow/[0.22] blur-xl animate-glow-breathe"
      />
      <LogoMark className="relative h-4 text-white" />
    </span>
  )
}

export function FinerHubCard({ className }: { className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const prefersReduced = usePrefersReducedMotion()
  const showPulses = inView && !prefersReduced

  return (
    <BentoCard
      className={className}
      delay={120}
      title="Uma visão. Decisões mais claras."
      description="A Finer One centraliza e interpreta informação financeira para transformar dados dispersos em inteligência acionável."
    >
      <div ref={ref}>
        {/* Composição horizontal — tablet e desktop */}
        <div className="relative hidden h-[228px] sm:block">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          >
            {hubInputs.map((input, index) => (
              <path
                key={input.label}
                d={inputPath(index)}
                fill="none"
                stroke="rgba(30,144,255,0.28)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {hubOutputs.map((output, index) => (
              <path
                key={output.label}
                d={outputPath(index)}
                fill="none"
                stroke="rgba(0,82,255,0.3)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* Impulsos de informação a convergir e a sair do hub */}
            {showPulses
              ? hubInputs.map((input, index) => (
                  <path
                    key={`pulse-in-${input.label}`}
                    d={inputPath(index)}
                    fill="none"
                    stroke="#1E90FF"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="6 320"
                    className="animate-flow"
                    style={{ animationDelay: `${index * 0.55}s` }}
                  />
                ))
              : null}
            {showPulses
              ? hubOutputs.map((output, index) => (
                  <path
                    key={`pulse-out-${output.label}`}
                    d={outputPath(index)}
                    fill="none"
                    stroke="#1E90FF"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="6 320"
                    className="animate-flow"
                    style={{ animationDelay: `${1.6 + index * 0.55}s` }}
                  />
                ))
              : null}
          </svg>

          <div className="absolute inset-y-0 left-0 grid w-[34%] grid-rows-5">
            {hubInputs.map((input) => (
              <span key={input.label} className="flex items-center justify-end">
                <Chip label={input.label} icon={input.icon} className="max-w-full" />
              </span>
            ))}
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Hub />
          </div>

          <div className="absolute inset-y-0 right-0 grid w-[30%] grid-rows-4">
            {hubOutputs.map((output) => (
              <span key={output.label} className="flex items-center justify-start">
                <Chip label={output.label} icon={output.icon} tone="output" className="max-w-full" />
              </span>
            ))}
          </div>
        </div>

        {/* Composição vertical — telemóvel */}
        <MobileHub showPulses={showPulses} />
      </div>
    </BentoCard>
  )
}

/**
 * Versão para telemóvel.
 *
 * Os chips fazem wrap consoante a largura disponível, por isso as posições
 * não são previsíveis com percentagens como no desktop. Os conectores são
 * desenhados a partir das posições reais medidas no DOM, o que garante que
 * todas as entradas e todas as saídas ficam ligadas ao hub em qualquer
 * largura de ecrã.
 */
type Link = { d: string; kind: 'in' | 'out' }

function MobileHub({ showPulses }: { showPulses: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const hubRef = useRef<HTMLSpanElement>(null)
  const inputRefs = useRef<(HTMLSpanElement | null)[]>([])
  const outputRefs = useRef<(HTMLSpanElement | null)[]>([])

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [links, setLinks] = useState<Link[]>([])

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current
    const hub = hubRef.current
    if (!wrapper || !hub) return

    const area = wrapper.getBoundingClientRect()
    if (area.width === 0) return

    const hubBox = hub.getBoundingClientRect()
    const hubX = hubBox.left - area.left + hubBox.width / 2
    const hubTop = hubBox.top - area.top
    const hubBottom = hubBox.bottom - area.top

    const build = (elements: (HTMLSpanElement | null)[], kind: 'in' | 'out'): Link[] =>
      elements.flatMap((element) => {
        if (!element) return []
        const box = element.getBoundingClientRect()
        const x = box.left - area.left + box.width / 2
        const y = kind === 'in' ? box.bottom - area.top : box.top - area.top
        const target = kind === 'in' ? hubTop : hubBottom
        const mid = (y + target) / 2
        return [{ kind, d: `M${x},${y} C${x},${mid} ${hubX},${mid} ${hubX},${target}` }]
      })

    const next = [...build(inputRefs.current, 'in'), ...build(outputRefs.current, 'out')]

    setSize((current) =>
      Math.abs(current.width - area.width) < 0.5 && Math.abs(current.height - area.height) < 0.5
        ? current
        : { width: area.width, height: area.height },
    )
    setLinks((current) =>
      current.length === next.length && current.every((link, i) => link.d === next[i].d)
        ? current
        : next,
    )
  }, [])

  useLayoutEffect(() => {
    measure()
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const observer = new ResizeObserver(measure)
    observer.observe(wrapper)
    // As fontes web mudam a largura dos chips depois de carregarem.
    document.fonts?.ready.then(measure).catch(() => {})

    return () => observer.disconnect()
  }, [measure])

  return (
    <div ref={wrapperRef} className="relative sm:hidden">
      <svg
        aria-hidden="true"
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${Math.max(size.width, 1)} ${Math.max(size.height, 1)}`}
        className="pointer-events-none absolute inset-0"
      >
        {links.map((link, index) => (
          <path
            key={`${link.kind}-${index}`}
            d={link.d}
            fill="none"
            stroke={link.kind === 'in' ? 'rgba(30,144,255,0.28)' : 'rgba(0,82,255,0.34)'}
            strokeWidth={1}
          />
        ))}

        {showPulses
          ? links.map((link, index) => (
              <path
                key={`pulse-${link.kind}-${index}`}
                d={link.d}
                fill="none"
                stroke="#1E90FF"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray="5 121"
                className="animate-flow-short"
                style={{ animationDelay: `${(link.kind === 'in' ? 0 : 1.2) + index * 0.28}s` }}
              />
            ))
          : null}
      </svg>

      <div className="relative flex flex-wrap justify-center gap-1.5">
        {hubInputs.map((input, index) => (
          <Chip
            key={input.label}
            ref={(element) => {
              inputRefs.current[index] = element
            }}
            label={input.label}
            icon={input.icon}
          />
        ))}
      </div>

      <div className="relative my-7 flex justify-center">
        <Hub innerRef={hubRef} />
      </div>

      <div className="relative flex flex-wrap justify-center gap-1.5">
        {hubOutputs.map((output, index) => (
          <Chip
            key={output.label}
            ref={(element) => {
              outputRefs.current[index] = element
            }}
            label={output.label}
            icon={output.icon}
            tone="output"
          />
        ))}
      </div>
    </div>
  )
}

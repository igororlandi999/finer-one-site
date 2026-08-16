import { LogoMark } from '@/components/brand/Logo'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const copy = {
  pt: { scattered: 'Informação dispersa', organized: 'Inteligência organizada' },
  en: { scattered: 'Scattered information', organized: 'Organized intelligence' },
}

/**
 * Faixa de transição entre o CTA final e o rodapé.
 *
 * Representa, de forma abstrata, o que a Finer One faz: à esquerda cinco
 * sinais separados, com origens desalinhadas — informação dispersa. Convergem
 * para o núcleo da marca ao centro. À direita saem três linhas paralelas,
 * regulares e mais claras — inteligência organizada.
 *
 * A animação existe por essa razão e não por decoração: os impulsos entram
 * pela esquerda, atravessam o núcleo e saem pela direita, sempre no mesmo
 * sentido. Os das saídas arrancam mais tarde, para a leitura ser
 * sequencial e não simultânea.
 *
 * Nada aqui representa dados reais — não há valores, escalas nem eixos.
 *
 * Desenho em SVG com preserveAspectRatio="none" e traço de espessura
 * constante: as curvas esticam com a largura da viewport, as linhas mantêm
 * sempre 1px. Sem canvas, sem shaders, sem bibliotecas.
 */

// Cinco entradas: origens em x diferentes, para a dispersão se ler logo.
// Começam depois da etiqueta da esquerda, para as linhas não lhe passarem
// por trás nas larguras onde a etiqueta é mostrada.
const inputs = [
  { start: 268, y: 16 },
  { start: 322, y: 38 },
  { start: 256, y: 60 },
  { start: 336, y: 82 },
  { start: 288, y: 104 },
]

// Três saídas paralelas e igualmente espaçadas.
const outputs = [32, 60, 88]

const inputPath = ({ start, y }: { start: number; y: number }) =>
  `M${start},${y} C${start + 190},${y} 420,60 556,60`

const outputPath = (y: number) => `M644,60 C800,60 830,${y} 1010,${y}`

export function FooterVisual() {
  const prefersReduced = usePrefersReducedMotion()
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <div className="relative border-y border-white/[0.06]">
      <div className="relative mx-auto h-[104px] max-w-content sm:h-[120px] lg:h-[128px]">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="faixa-entrada" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="1" stopColor="#1E90FF" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="faixa-saida" x1="600" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E90FF" stopOpacity="0.55" />
              <stop offset="1" stopColor="#0052FF" stopOpacity="0.14" />
            </linearGradient>
          </defs>

          {inputs.map((input) => (
            <path
              key={`entrada-${input.y}`}
              d={inputPath(input)}
              fill="none"
              stroke="url(#faixa-entrada)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {outputs.map((y) => (
            <path
              key={`saida-${y}`}
              d={outputPath(y)}
              fill="none"
              stroke="url(#faixa-saida)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Impulsos: entram, atravessam o núcleo, saem organizados. */}
          {prefersReduced ? null : (
            <>
              {inputs.map((input, index) => (
                <path
                  key={`pulso-entrada-${input.y}`}
                  d={inputPath(input)}
                  fill="none"
                  stroke="#1E90FF"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeDasharray="8 1392"
                  vectorEffect="non-scaling-stroke"
                  className="animate-flow-band"
                  style={{ animationDelay: `${index * 0.42}s` }}
                />
              ))}
              {outputs.map((y, index) => (
                <path
                  key={`pulso-saida-${y}`}
                  d={outputPath(y)}
                  fill="none"
                  stroke="#1E90FF"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeDasharray="8 1392"
                  vectorEffect="non-scaling-stroke"
                  className="animate-flow-band"
                  style={{ animationDelay: `${2.1 + index * 0.42}s` }}
                />
              ))}
            </>
          )}
        </svg>

        {/* Núcleo da marca */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-accent/[0.45] bg-navy-deep sm:h-10 sm:w-10">
            <span
              className={cn(
                // inset-0 e não margem negativa: um absoluto maior que o
                // contentor aumenta o scrollWidth. O alcance do brilho vem do
                // blur, que é pintura e não afeta o layout.
                'absolute inset-0 rounded-full bg-glow/[0.22] blur-xl',
                prefersReduced ? null : 'animate-glow-breathe',
              )}
            />
            <LogoMark className="relative h-3 text-white sm:h-3.5" />
          </span>
        </div>

        {/* Leitura explícita, só onde há largura para ela respirar */}
        <span className="pointer-events-none absolute left-8 top-1/2 hidden -translate-y-1/2 text-[10px] uppercase tracking-[0.18em] text-mist/60 lg:block">
          {t.scattered}
        </span>
        <span className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 text-[10px] uppercase tracking-[0.18em] text-mist/60 lg:block">
          {t.organized}
        </span>
      </div>
    </div>
  )
}

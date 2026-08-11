import { LogoMark } from '@/components/brand/Logo'

/**
 * Leitura Finer One — a interpretação, separada da descrição dos dados.
 *
 * A marca aparece aqui de propósito: é o único bloco da secção em que a
 * plataforma fala. O que está acima é o dado; isto é o que a Finer One diz
 * sobre ele.
 */
export function ImpactReading({ children }: { children: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-mist/70">
        <span className="flex h-4 w-4 items-center justify-center">
          <LogoMark className="h-[11px] text-glow" />
        </span>
        Leitura Finer One
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-white/[0.9] sm:text-[14.5px]">
        {children}
      </p>
    </div>
  )
}

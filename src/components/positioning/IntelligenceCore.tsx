import { LogoMark } from '@/components/brand/Logo'
import { core } from '@/data/positioningSection'
import { cn } from '@/lib/utils'

/**
 * Núcleo da composição.
 *
 * Uma placa contida, não um objeto luminoso: o brilho vive atrás dela e
 * respira devagar, a moldura é a mesma linguagem de gradiente das outras
 * secções. O halo em anel é o que faz a placa parecer uma camada e não mais
 * um card.
 */
export function IntelligenceCore({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {/* Fonte de luz da composição inteira. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 animate-glow-breathe rounded-full bg-[radial-gradient(closest-side,rgba(0,82,255,0.30),transparent_78%)] blur-2xl md:h-[360px] md:w-[360px]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-glow/[0.16] md:h-[284px] md:w-[284px]"
      />

      <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.22] via-white/[0.07] to-transparent p-px shadow-[0_28px_80px_-24px_rgba(0,0,0,0.95)]">
        <div className="flex flex-col items-center rounded-[15px] bg-navy-soft px-5 py-4 text-center sm:px-6 sm:py-5">
          <LogoMark className="h-5 text-white sm:h-[22px]" />

          <p className="mt-2.5 font-display text-[14px] font-semibold leading-none tracking-[0.16em] text-white sm:text-[15px]">
            FINER ONE
          </p>
          <p className="mt-2 text-[9.5px] uppercase leading-none tracking-[0.12em] text-glow">
            {core.role}
          </p>
        </div>
      </div>

      <span className="sr-only">
        {core.name} — camada de inteligência entre os sistemas existentes e as decisões.
      </span>
    </div>
  )
}

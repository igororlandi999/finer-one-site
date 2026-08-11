import { LogoMark } from '@/components/brand/Logo'
import { sourceFlow } from '@/data/securitySection'

/**
 * Origem da informação: categorias de sistema a convergir para a Finer One.
 *
 * A convergência é desenhada com uma calha e derivações em CSS, não em SVG:
 * são três linhas e um canto, e um SVG obrigaria a medir o elemento para o
 * traço não ficar distorcido. Tudo aqui é decorativo e está marcado como tal;
 * a informação real são os rótulos.
 */
export function SourceFlowSurface() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-navy-deep/60 p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-mist/70">{sourceFlow.label}</p>

      <div className="mt-3.5 flex gap-3">
        <ul className="flex-1 space-y-2">
          {sourceFlow.systems.map((system) => (
            <li
              key={system}
              className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[12.5px] leading-none text-white/[0.85]"
            >
              {system}
            </li>
          ))}
        </ul>

        {/* Calha de convergência. Decorativa. */}
        <div aria-hidden="true" className="relative w-7 shrink-0">
          <span className="absolute left-0 top-[15px] h-px w-3 bg-white/[0.14]" />
          <span className="absolute left-0 top-1/2 h-px w-3 bg-white/[0.14]" />
          <span className="absolute bottom-[15px] left-0 h-px w-3 bg-white/[0.14]" />
          <span className="absolute left-3 top-[15px] bottom-[15px] w-px bg-white/[0.14]" />
          <span className="absolute left-3 top-1/2 h-px w-4 bg-gradient-to-r from-white/[0.14] to-glow/60" />
        </div>

        <div className="flex shrink-0 items-center">
          <span className="inline-flex items-center gap-2 rounded-lg border border-accent/[0.35] bg-accent/[0.1] px-3 py-2">
            <LogoMark className="h-3.5 text-glow" />
            <span className="text-[12.5px] font-medium leading-none text-white">
              {sourceFlow.destination}
            </span>
          </span>
        </div>
      </div>

      <p className="mt-3.5 text-[11px] leading-snug text-mist/70">{sourceFlow.note}</p>
    </div>
  )
}

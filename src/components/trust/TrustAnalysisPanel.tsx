import { LogoMark } from '@/components/brand/Logo'
import { AccessScope } from '@/components/trust/AccessScope'
import { DataProvenance } from '@/components/trust/DataProvenance'
import { ResponsibilityFlow } from '@/components/trust/ResponsibilityFlow'
import { analysis } from '@/data/trustSection'
import type { PrincipleId } from '@/data/trustSection'
import { cn } from '@/lib/utils'

/**
 * Painel central da secção.
 *
 * É a espinha da composição: cada um dos três princípios corresponde a uma
 * zona deste painel. Ao passar o cursor sobre um princípio, a zona
 * correspondente ganha contraste e as outras recuam ligeiramente — nunca
 * desaparecem, nunca ficam ilegíveis. Sem cursor, tudo é lido em pé de
 * igualdade.
 *
 * Usa a mesma linguagem de moldura das secções de produto (mesma borda em
 * gradiente, mesmo raio, mesma barra superior) para se ler como a mesma
 * plataforma.
 *
 * DEMONSTRAÇÃO CONCEPTUAL com mock data — ver src/data/trustSection.ts.
 */
function Region({
  id,
  active,
  label,
  children,
}: {
  id: PrincipleId
  active: PrincipleId | null
  label: string
  children: React.ReactNode
}) {
  const lit = active === id
  const recessed = active !== null && !lit

  return (
    <section
      aria-label={label}
      className={cn(
        'rounded-xl border p-4 transition-all duration-500 sm:p-5',
        lit ? 'border-accent/[0.35] bg-white/[0.035]' : 'border-white/[0.06] bg-white/[0.015]',
        recessed && 'opacity-60',
      )}
    >
      <p
        className={cn(
          'text-[10px] uppercase tracking-[0.18em] transition-colors duration-500',
          lit ? 'text-glow' : 'text-mist',
        )}
      >
        {label}
      </p>
      <div className="mt-3.5">{children}</div>
    </section>
  )
}

export function TrustAnalysisPanel({ active }: { active: PrincipleId | null }) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent p-px shadow-frame">
      <div className="overflow-hidden rounded-[15px] bg-navy-deep">
        <div className="flex h-11 items-center justify-between gap-3 border-b border-white/[0.07] px-3.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <LogoMark className="h-3 shrink-0 text-white" />
            <span className="hidden text-[10px] font-semibold tracking-[0.14em] text-white sm:inline">
              FINER ONE
            </span>
            <span aria-hidden="true" className="hidden h-3 w-px bg-white/15 sm:block" />
            <span className="truncate text-[11.5px] text-white">{analysis.module}</span>
          </div>
          <span className="hidden shrink-0 text-[10px] tabular text-mist sm:block">
            {analysis.updatedAt}
          </span>
        </div>

        <div className="p-3.5 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-mist">
            {analysis.conclusionLabel}
          </p>
          <p className="mt-2.5 max-w-[26ch] font-display text-[19px] font-semibold leading-[1.2] tracking-[-0.02em] text-white sm:text-[22px]">
            {analysis.conclusion}
          </p>
          <p className="mt-2 max-w-[46ch] text-[13px] leading-relaxed text-mist">
            {analysis.reading}
          </p>

          <div className="mt-5 space-y-2.5">
            <Region id="transparencia" active={active} label="Fatores considerados">
              <DataProvenance lit={active === 'transparencia'} />
            </Region>

            <Region id="controlo" active={active} label="Informação disponível">
              <AccessScope />
            </Region>

            <Region id="responsabilidade" active={active} label="Da informação à decisão">
              <ResponsibilityFlow lit={active === 'responsabilidade'} />
            </Region>
          </div>
        </div>
      </div>
    </div>
  )
}

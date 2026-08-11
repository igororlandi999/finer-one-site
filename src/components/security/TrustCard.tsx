import { Database, Eye, Layers, ScanSearch, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ExplanationSurface } from '@/components/security/surfaces/ExplanationSurface'
import { ProtectionSurface } from '@/components/security/surfaces/ProtectionSurface'
import { SourceFlowSurface } from '@/components/security/surfaces/SourceFlowSurface'
import type { TrustCard as TrustCardData, TrustIconId, TrustSurfaceId } from '@/data/securitySection'

/**
 * Ícones contidos e neutros. Um único escudo, na proteção, e nada mais:
 * a secção tem de parecer SaaS financeiro institucional e não uma empresa de
 * cibersegurança.
 */
const icons: Record<TrustIconId, LucideIcon> = {
  origem: Database,
  controlo: SlidersHorizontal,
  explicabilidade: ScanSearch,
  contexto: Layers,
  protecao: ShieldCheck,
  privacidade: Eye,
}

const surfaces: Record<TrustSurfaceId, ComponentType> = {
  origem: SourceFlowSurface,
  explicacao: ExplanationSurface,
  protecao: ProtectionSurface,
}

/**
 * Callout — afirmação curta em três tempos.
 *
 * É o mesmo recurso tipográfico usado no fecho da secção de impacto: as
 * primeiras linhas em tom apagado e a última a cheio, para a leitura ganhar
 * cadência e terminar num ponto forte. Sem ícone e com tipografia display,
 * para contrastar com os painéis e dar respiração à coluna.
 */
function Callout({ lines }: { lines: string[] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/[0.22] bg-accent/[0.055] p-5 sm:p-6">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/60 to-transparent"
      />

      <p className="font-display text-[17px] font-semibold leading-[1.32] tracking-[-0.02em] sm:text-[18px]">
        {lines.map((line, index) => (
          <span
            key={line}
            className={index === lines.length - 1 ? 'block text-white' : 'block text-white/[0.5]'}
          >
            {line}
          </span>
        ))}
      </p>
    </div>
  )
}

export function TrustCard({ card }: { card: TrustCardData }) {
  if (card.kind === 'callout') return <Callout lines={card.lines} />

  const Icon = icons[card.icon]
  const Surface = card.surface ? surfaces[card.surface] : null

  return (
    <article className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.09] bg-navy-soft text-glow">
        <Icon size={16} aria-hidden="true" />
      </span>

      <h3 className="mt-4 text-balance font-display text-[16px] font-semibold leading-snug tracking-[-0.015em] text-white sm:text-[17px]">
        {card.title}
      </h3>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist">{card.body}</p>

      {Surface ? (
        <div className="mt-5">
          <Surface />
        </div>
      ) : null}
    </article>
  )
}

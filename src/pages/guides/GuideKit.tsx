import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Blocos do modelo editorial dos guias (/guias/…), partilhados por todos os guias.
 * Extraídos sem alterações do guia "Falta de liquidez" (16/11/2026): o HTML gerado é o mesmo.
 */

export type GuideSection = { id: string; title: string }
export type GuideSource = { label: string; href: string }

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`h-${id}`} className="scroll-mt-36 pt-14 lg:scroll-mt-28">
      <h2 id={`h-${id}`} className="font-display text-[26px] font-bold leading-[1.15] tracking-[-0.025em] text-[#070D2B] sm:text-[32px]">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[16.5px] leading-[1.75] text-[#0B1030]/80">{children}</p>
}

export function Ref({ n }: { n: number }) {
  return (
    <sup className="ml-0.5">
      <a href={`#fonte-${n}`} aria-label={`Fonte ${n}`} className="font-semibold text-accent-deep no-underline hover:underline">[{n}]</a>
    </sup>
  )
}

/** Ligação dentro do texto corrido de um guia. */
export function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="font-semibold text-accent-deep underline decoration-accent-deep/30 underline-offset-4 hover:decoration-accent-deep">
      {children}
    </a>
  )
}

export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="mt-7 rounded-2xl border-l-[3px] border-accent bg-[#F3F6FD] px-5 py-5 sm:px-6">
      <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-accent-deep">{title}</p>
      <p className="mt-2 text-[15.5px] leading-[1.7] text-[#0B1030]/80">{children}</p>
    </aside>
  )
}

export function ActionList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-[#0B1030]/[0.08] p-6">
      <h3 className="font-display text-[18px] font-bold text-[#070D2B]">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it} className="relative pl-5 text-[15px] leading-[1.6] text-[#0B1030]/80">
            <span aria-hidden="true" className="absolute left-0 top-[9px] h-1.5 w-1.5 rounded-full bg-accent" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Caixa "Em resumo" no topo do guia. */
export function Summary({ items }: { items: string[] }) {
  return (
    <section id="resumo" aria-labelledby="h-resumo" className="scroll-mt-36 lg:scroll-mt-28 rounded-2xl border border-[#0B1030]/[0.08] bg-ice p-6 sm:p-7">
      <h2 id="h-resumo" className="font-display text-[20px] font-bold tracking-[-0.02em] text-[#070D2B]">Em resumo</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="relative pl-5 text-[15.5px] leading-[1.65] text-[#0B1030]/80">
            <span aria-hidden="true" className="absolute left-0 top-[10px] h-1.5 w-1.5 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Bloco final "Finer Pioneers" (mesma composição em todos os guias). */
export function PioneersCta() {
  return (
    <div className="relative mt-10 overflow-hidden rounded-[24px] bg-[#070D2B] p-7 text-white sm:p-9">
      <img src="/images/sobre-linha.webp" alt="" aria-hidden="true" className="absolute inset-x-0 bottom-[-6%] h-[50%] w-full object-cover object-[80%_50%] opacity-70 mix-blend-screen" style={{ maskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)' }} />
      <div className="relative">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#3D86FF]">Finer Pioneers</p>
        <p className="mt-3 font-display text-[26px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[30px]">
          Quer conhecer a Finer One <span className="text-[#3D86FF]">em primeira mão?</span>
        </p>
        <p className="mt-3 max-w-[500px] text-[15px] leading-[1.6] text-white/70">
          Procuramos empresários que queiram usar a plataforma em primeira mão e ajudar a definir a sua evolução.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a href="/pioneers/" className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow">
            Candidatar-me a Finer Pioneer
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
          <a href="/lista-espera/" className="text-[14.5px] font-medium text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white/70">
            Prefere só acompanhar? Entre na lista de espera
          </a>
        </div>
      </div>
    </div>
  )
}

/** Lista de fontes numeradas, aviso legal e "Continue a explorar" (fim do guia). */
export function SourcesBlock({ sources, checked, next }: { sources: GuideSource[]; checked: string; next: [string, string][] }) {
  return (
    <>
      <p className="mt-4 text-[13.5px] text-[#0B1030]/55">Fontes consultadas a {checked}.</p>
      <ol className="mt-5 space-y-3">
        {sources.map((s, i) => (
          <li key={s.href} id={`fonte-${i + 1}`} className="scroll-mt-24 text-[14.5px] leading-[1.6] text-[#0B1030]/70">
            <span className="mr-2 font-semibold tabular-nums text-[#070D2B]">[{i + 1}]</span>
            <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline underline decoration-[#0B1030]/20 underline-offset-4 hover:text-[#070D2B] hover:decoration-accent-deep">
              {s.label}
              <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
      <p className="mt-8 rounded-xl border border-[#0B1030]/[0.08] bg-[#F7F9FE] p-5 text-[13.5px] leading-[1.6] text-[#0B1030]/60">
        Este guia é informativo e não constitui aconselhamento financeiro, fiscal ou jurídico. Os valores em euros são demonstrativos. Para decisões sobre a sua empresa, fale com o seu contabilista ou com um especialista.
      </p>
      <div className="mt-10 border-t border-[#0B1030]/[0.08] pt-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0B1030]/45">Continue a explorar</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {next.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="group flex h-full items-center justify-between rounded-xl border border-[#0B1030]/[0.08] px-4 py-3.5 text-[14.5px] font-medium text-[#070D2B] transition-colors hover:border-accent-deep/40">
                {label}
                <ArrowRight className="h-4 w-4 text-accent-deep transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

/** Índice fixo à direita (desktop). */
export function GuideToc({ sections }: { sections: GuideSection[] }) {
  const active = useActiveSection(sections.map((s) => s.id))
  return (
    <nav aria-label="Neste guia" className="hidden lg:block">
      <div className="sticky top-28">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0B1030]/45">Neste guia</p>
        <ol className="relative mt-5 border-l border-[#0B1030]/10">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? 'location' : undefined}
                className={cn(
                  '-ml-px block border-l-2 py-2 pl-4 text-[14px] leading-snug transition-colors',
                  active === s.id ? 'border-accent font-semibold text-[#070D2B]' : 'border-transparent text-[#0B1030]/55 hover:text-[#070D2B]',
                )}
              >
                {s.title}
              </a>
            </li>
          ))}
        </ol>
        <a href="/pioneers/" className="mt-8 inline-flex items-center gap-2 text-[13.5px] font-semibold text-accent-deep hover:text-[#070D2B]">
          Ser Finer Pioneer
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </nav>
  )
}

/** Índice recolhível (mobile e tablet). */
export function MobileToc({ sections }: { sections: GuideSection[] }) {
  return (
    <details className="group mb-8 rounded-2xl border border-[#0B1030]/[0.08] lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[14px] font-semibold text-[#070D2B] [&::-webkit-details-marker]:hidden">
        Neste guia
        <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <ol className="border-t border-[#0B1030]/[0.08] px-5 py-3">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="block py-2 text-[14.5px] text-[#0B1030]/70 hover:text-[#070D2B]">{s.title}</a>
          </li>
        ))}
      </ol>
    </details>
  )
}

/** Secção visível no momento (para destacar no índice). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const onScroll = () => {
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return active
}

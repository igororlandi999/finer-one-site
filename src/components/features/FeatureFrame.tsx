import type { ReactNode } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { Rule } from '@/components/features/primitives'

/**
 * Moldura estável do produto.
 *
 * É a mesma em todas as áreas — mesma barra superior, mesmo raio, mesma
 * borda, mesma densidade. Só mudam o nome do módulo, o contexto e o
 * conteúdo, o que dá a sensação de navegar dentro da mesma plataforma em vez
 * de saltar entre seis slides.
 */
export function FeatureFrame({
  name,
  context,
  children,
}: {
  name: string
  context: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent p-px shadow-frame">
      <div className="overflow-hidden rounded-[15px] bg-navy-deep">
        <div className="flex h-11 items-center justify-between gap-3 px-3.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <LogoMark className="h-3 shrink-0 text-white" />
            <span className="hidden text-[10px] font-semibold tracking-[0.14em] text-white sm:inline">
              FINER ONE
            </span>
            <span aria-hidden="true" className="hidden h-3 w-px bg-white/15 sm:block" />
            <span className="truncate text-[11.5px] text-white">{name}</span>
          </div>
          <span className="hidden shrink-0 text-[10px] text-mist sm:block">{context}</span>
        </div>

        <Rule />

        {/* lg:pb-[72px] — banda inferior livre onde o visual secundário
            encaixa sem cobrir conteúdo do módulo. */}
        <div className="p-3.5 sm:p-4 lg:h-[430px] lg:pb-[72px]">{children}</div>
      </div>
    </div>
  )
}

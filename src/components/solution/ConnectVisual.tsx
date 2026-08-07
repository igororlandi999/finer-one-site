import { systemIcons } from '@/components/problem/sourceIcons'
import { connectSources } from '@/data/solutionSection'
import { cn } from '@/lib/utils'

/**
 * 01 — Conectar.
 *
 * As fontes começam desalinhadas, cada uma com o seu recuo, e encostam a uma
 * espinha vertical comum quando a etapa fica ativa. É deliberadamente
 * diferente do leque radial da secção anterior: aqui a leitura é de encaixe,
 * não de convergência num ponto.
 */
/*
 * Recuos NEGATIVOS de propósito. Deslocar para a direita aumentaria o
 * scrollWidth do contentor (só o transbordo à direita conta) e propagaria
 * overflow horizontal por toda a página. À esquerda não conta, e o
 * movimento de encaixe passa a ser da esquerda para a espinha — mais
 * coerente com a leitura.
 */
const offsets = [
  '-translate-x-6',
  '-translate-x-3',
  '-translate-x-8',
  '-translate-x-4',
  '-translate-x-7',
]

export function ConnectVisual({ active }: { active: boolean }) {
  return (
    <div className="relative w-full">
      {/* Espinha comum */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-glow/50 to-transparent transition-opacity duration-700',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-y-6 right-0 w-16 bg-[radial-gradient(closest-side,rgba(30,144,255,0.16),transparent)] blur-xl transition-opacity duration-700',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />

      <ul className="space-y-2.5">
        {connectSources.map((source, index) => {
          const Icon = systemIcons[source.icon]

          return (
            <li
              key={source.label}
              className={cn(
                'flex items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                active ? 'translate-x-0 opacity-100' : cn(offsets[index], 'opacity-45'),
              )}
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-white/[0.08] bg-navy-soft/70 px-3 py-2.5">
                <Icon size={13} aria-hidden="true" className="shrink-0 text-mist" />
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-medium text-white">
                    {source.label}
                  </span>
                  <span className="block truncate text-[11px] text-mist">{source.detail}</span>
                </span>
              </span>

              {/* Ligação à espinha */}
              <span
                aria-hidden="true"
                className={cn(
                  'h-px shrink-0 bg-gradient-to-r from-white/10 to-glow/70 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  active ? 'w-8 opacity-100 sm:w-12' : 'w-0 opacity-0',
                )}
                style={{ transitionDelay: `${180 + index * 90}ms` }}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

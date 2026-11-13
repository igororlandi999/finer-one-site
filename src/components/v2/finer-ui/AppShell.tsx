import type { ReactNode } from 'react'
import { ArrowUpDown, Bell, Building2, ChevronDown, CircleCheck, Home, Lightbulb, LogOut, MessageSquare, Moon, SlidersHorizontal, TrendingDown, TrendingUp, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { getUiData } from './data'

export type View = 'home' | 'cashflow' | 'receitas' | 'despesas' | 'clientes' | 'advisor' | 'alertas'

const icons: LucideIcon[] = [Home, ArrowUpDown, TrendingUp, TrendingDown, Users, Lightbulb, MessageSquare, Bell, CircleCheck]
/** Índices do menu que correspondem às vistas demonstradas. */
const viewIndex: Record<View, number> = { home: 0, cashflow: 1, receitas: 2, despesas: 3, clientes: 4, advisor: 5, alertas: 7 }
const groups = [[0, 1, 2, 3], [4, 5, 6], [7, 8]]

type Props = {
  view: View
  onNavigate?: (view: View) => void
  /** Vistas que o menu permite abrir (as restantes aparecem só como referência). */
  navigable?: View[]
  /** Classes extra para a raiz (ex.: altura mínima no vídeo). */
  className?: string
  /** Imagem do topo ("mundo") fornecida pelo vídeo; no site usa-se /images/finer-mundo.webp. */
  sky?: ReactNode
  children: ReactNode
}

/**
 * Moldura da aplicação Finer One recriada a partir das capturas reais:
 * menu lateral claro, cabeçalho com textura azul-gelo e área de conteúdo.
 */
export function AppShell({ view, onNavigate, navigable = ['home', 'advisor'], className, sky, children }: Props) {
  const { lang } = useLanguage()
  const { shell } = getUiData(lang)

  return (
    <div className={cn('@container flex bg-[#F7F9FE] text-[#0B1030]', className)}>
      <aside className={cn('w-[232px] shrink-0 flex-col border-r border-[#0B1030]/[0.08] bg-white px-4 pb-4 pt-6', 'hidden @4xl:flex')}>
        <div className={cn('flex items-center gap-2.5 px-2')}>
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-[5px] bg-[#0B1030]')}>
            <svg viewBox="0 0 326 445" className="h-4 w-3" aria-hidden="true"><path fill="#FFFFFF" d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
          </span>
          <span className={cn('text-[12px] font-bold tracking-[0.3em]')}>
            FINER <span className={cn('font-normal text-[#0B1030]/60')}>ONE</span>
          </span>
        </div>

        <nav className={cn('mt-7 flex-1')} aria-label={lang === 'pt' ? 'Menu da plataforma (demonstração)' : 'Platform menu (demo)'}>
          {groups.map((group, g) => (
            <ul key={g} className={cn('space-y-0.5', g > 0 && 'mt-3 border-t border-[#0B1030]/[0.08] pt-3')}>
              {group.map((i) => {
                const Icon = icons[i]
                const target = (Object.keys(viewIndex) as View[]).find((v) => viewIndex[v] === i)
                const isActive = viewIndex[view] === i
                const content = (
                  <>
                    <Icon className={cn('h-4 w-4 shrink-0')} aria-hidden="true" />
                    <span className={cn('truncate')}>{shell.nav[i]}</span>
                  </>
                )
                const base = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px]'
                return (
                  <li key={i} data-demo={`nav-${i}`}>
                    {target && onNavigate && navigable.includes(target) ? (
                      <button
                        type="button"
                        onClick={() => onNavigate(target)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(base, 'transition-colors', isActive ? 'bg-[#E6EEFF] font-semibold text-[#0B1030]' : 'text-[#0B1030]/75 hover:bg-[#F1F5FE]')}
                      >
                        {content}
                      </button>
                    ) : (
                      <span className={cn(base, isActive ? 'bg-[#E6EEFF] font-semibold' : 'text-[#0B1030]/60')}>{content}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          ))}
        </nav>

        <div className={cn('space-y-3 border-t border-[#0B1030]/[0.08] pt-4 text-[12.5px]')}>
          <div className={cn('flex items-center gap-3 px-2 text-[#0B1030]/75')}>
            <SlidersHorizontal className={cn('h-4 w-4')} aria-hidden="true" />
            <span className={cn('flex-1')}>{shell.settings}</span>
            <Moon className={cn('h-3.5 w-3.5')} aria-hidden="true" />
          </div>
          <div className={cn('flex items-center gap-2.5 px-2')}>
            <span className={cn('flex h-7 w-7 items-center justify-center rounded-full bg-[#E6EEFF] text-[10px] font-bold text-accent')}>UD</span>
            <span className={cn('min-w-0 flex-1 leading-tight')}>
              <span className={cn('block truncate font-semibold')}>{shell.user}</span>
              <span className={cn('text-[11px] text-[#0B1030]/60')}>{shell.role}</span>
            </span>
            <LogOut className={cn('h-3.5 w-3.5 text-[#0B1030]/50')} aria-hidden="true" />
          </div>
          <div className={cn('flex items-center gap-2.5 px-2')}>
            <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg border border-[#0B1030]/10')}>
              <Building2 className={cn('h-3.5 w-3.5 text-[#0B1030]/60')} aria-hidden="true" />
            </span>
            <span className={cn('min-w-0 flex-1 leading-tight')}>
              <span className={cn('block truncate font-semibold')}>{shell.company}</span>
              <span className={cn('mt-0.5 inline-block rounded bg-[#E6EEFF] px-1.5 text-[9.5px] font-bold text-accent')}>PLUS</span>
            </span>
            <ChevronDown className={cn('h-3.5 w-3.5 text-[#0B1030]/50')} aria-hidden="true" />
          </div>
        </div>
      </aside>

      <div className={cn('relative min-w-0 flex-1')}>
        {/* O "mundo" no topo de cada página, como na plataforma real: céu com nuvens
            vistas de cima, a desvanecer para o fundo. No vídeo (Remotion) a imagem chega
            pela propriedade sky, para garantir que está carregada antes de cada fotograma. */}
        <div aria-hidden="true" className={cn('pointer-events-none absolute inset-x-0 top-0 h-[150px] overflow-hidden')}>
          {sky ?? <img src="/images/finer-mundo.webp" alt="" className={cn('h-full w-full object-cover object-top')} />}
          <div className={cn('absolute inset-0')} style={{ background: 'linear-gradient(to bottom, rgba(247,249,254,0) 70%, #F7F9FE 100%)' }} />
        </div>
        <div className={cn('relative')}>{children}</div>
      </div>
    </div>
  )
}

/** Título de vista com o ponto azul característico. */
export function ViewTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className={cn('font-display text-[28px] font-bold tracking-[-0.02em] text-[#0B1030] @xl:text-[36px]')}>
      {children}
      <span className={cn('text-accent')}>.</span>
    </h3>
  )
}

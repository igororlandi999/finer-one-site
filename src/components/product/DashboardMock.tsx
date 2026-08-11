import { useState } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  FileText,
  LayoutGrid,
  MessageSquare,
  Receipt,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LogoMark } from '@/components/brand/Logo'
import { DashboardView } from '@/components/product/DashboardViews'
import { dashboardTabs } from '@/data/demoDashboard'
import type { DashboardTabId } from '@/data/demoDashboard'
import { cn } from '@/lib/utils'

/**
 * Ícone de cada área. Fica no componente e não nos dados para o ficheiro de
 * dados não passar a depender da biblioteca de ícones.
 */
const tabIcons: Record<DashboardTabId, LucideIcon> = {
  resumo: LayoutGrid,
  diagnostico: Activity,
  receitas: TrendingUp,
  despesas: Receipt,
  relacoes: Users,
  documentos: FileText,
  performance: BarChart3,
  alertas: Bell,
  chat: MessageSquare,
}

/**
 * Representação do produto usada na Hero.
 *
 * Interface real em React alimentada por dados demonstrativos (ver
 * src/data/demoDashboard.ts). Não existe qualquer ligação a dados reais, nem
 * backend, router ou pedido de rede: a troca de área é apenas estado local.
 *
 * As áreas correspondem exatamente às do plano Plus, que é o MVP inicial.
 * Nenhum módulo Pro ou Team aparece aqui.
 *
 * A navegação são botões reais com aria-pressed, por isso o teclado funciona
 * sem código adicional e o estado ativo não depende de hover nem de cor
 * sozinha — a área ativa também aparece escrita na barra superior.
 *
 * Em ecrãs estreitos a coluna lateral não cabe, por isso as áreas passam a
 * uma fila horizontal deslizante. A fila tem overflow próprio e está dentro
 * da moldura, que já recorta: não alarga a página.
 */
export function DashboardMock() {
  const [tab, setTab] = useState<DashboardTabId>('resumo')
  const active = dashboardTabs.find((item) => item.id === tab) ?? dashboardTabs[0]

  return (
    <div className="bg-navy-deep">
      {/* Barra superior */}
      <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-3.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <LogoMark className="h-3.5 text-white" />
          <span className="text-[11px] font-semibold tracking-[0.14em] text-white">FINER ONE</span>
          <span className="hidden h-3 w-px bg-white/15 sm:block" />
          <span className="hidden truncate text-[12px] text-mist sm:block">{active.label}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-mist sm:inline-flex">
            Últimos 12 meses
            <ChevronDown size={12} aria-hidden="true" />
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/[0.18] text-[10px] font-semibold text-glow">
            OV
          </span>
        </div>
      </div>

      {/* Fila de áreas em ecrãs estreitos */}
      <div className="border-b border-white/[0.06] lg:hidden">
        <div
          role="group"
          aria-label="Áreas do plano Plus"
          className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 py-2 sm:px-4"
        >
          {dashboardTabs.map((item) => {
            const selected = item.id === tab
            const Icon = tabIcons[item.id]

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setTab(item.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11.5px] transition-colors duration-200',
                  selected
                    ? 'border-accent/[0.45] bg-accent/[0.12] font-medium text-white'
                    : 'border-white/[0.07] bg-white/[0.02] text-mist',
                )}
              >
                <Icon size={12} aria-hidden="true" className={selected ? 'text-glow' : undefined} />
                {item.short}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex">
        {/* Navegação lateral do produto */}
        <nav
          aria-label="Áreas do plano Plus"
          className="hidden w-[172px] shrink-0 border-r border-white/[0.06] p-2.5 lg:block"
        >
          {dashboardTabs.map((item) => {
            const selected = item.id === tab
            const Icon = tabIcons[item.id]

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setTab(item.id)}
                className={cn(
                  'mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[11.5px] leading-tight transition-colors duration-200',
                  selected
                    ? 'bg-white/[0.06] font-medium text-white'
                    : 'text-mist hover:bg-white/[0.03] hover:text-white',
                )}
              >
                <Icon
                  size={14}
                  aria-hidden="true"
                  className={cn('shrink-0', selected && 'text-glow')}
                />
                <span className="min-w-0">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/*
          key={tab} remonta a vista, o que reinicia a animação de entrada e
          garante que nenhum estado interno de uma área passa para a seguinte.
          A animação é a mesma `panel-in` já usada na fase 4 — opacidade mais
          8px de deslocação, neutralizada pelo prefers-reduced-motion global.

          A altura mínima a partir de lg fixa a moldura na área mais alta
          (Resumo, 520px): sem ela o dashboard encolhia até 355px ao trocar de
          aba e empurrava a página inteira para cima. Abaixo de lg não se
          aplica — aí a diferença entre áreas é grande demais para reservar, e
          a fila de abas fica no topo do mock, por isso nada salta debaixo do
          cursor.
        */}
        <div className="min-w-0 flex-1 p-3 sm:p-4 lg:min-h-[520px]">
          <div key={tab} className="animate-panel-in">
            <DashboardView tab={tab} />
          </div>
        </div>
      </div>
    </div>
  )
}

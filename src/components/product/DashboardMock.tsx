import { BarChart3, Bell, ChevronDown, Receipt, Users, Wallet, LayoutGrid } from 'lucide-react'
import { LogoMark } from '@/components/brand/Logo'
import { CashflowChart } from '@/components/product/CashflowChart'
import { KpiCard } from '@/components/product/KpiCard'
import { InsightCard } from '@/components/product/InsightCard'
import { ForecastCard } from '@/components/product/ForecastCard'
import { ChatPreview } from '@/components/product/ChatPreview'
import { demoCashflow, demoKpis } from '@/data/demoDashboard'
import { cn } from '@/lib/utils'

const navigation = [
  { label: 'Resumo', icon: LayoutGrid, active: true },
  { label: 'Tesouraria', icon: Wallet, active: false },
  { label: 'Receitas', icon: BarChart3, active: false },
  { label: 'Despesas', icon: Receipt, active: false },
  { label: 'Clientes', icon: Users, active: false },
  { label: 'Alertas', icon: Bell, active: false },
]

/**
 * Representação do produto usada na Hero.
 * Interface real em React, alimentada por dados demonstrativos (ver
 * src/data/demoDashboard.ts). Não existe qualquer ligação a dados reais.
 */
export function DashboardMock() {
  return (
    <div className="bg-navy-deep">
      {/* Barra superior */}
      <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-3.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-3.5 text-white" />
          <span className="text-[11px] font-semibold tracking-[0.14em] text-white">FINER ONE</span>
          <span className="hidden h-3 w-px bg-white/15 sm:block" />
          <span className="hidden text-[12px] text-mist sm:block">Visão Geral</span>
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

      <div className="flex">
        {/* Navegação lateral do produto */}
        <nav
          aria-hidden="true"
          className="hidden w-[172px] shrink-0 border-r border-white/[0.06] p-2.5 lg:block"
        >
          {navigation.map(({ label, icon: Icon, active }) => (
            <span
              key={label}
              className={cn(
                'mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px]',
                active ? 'bg-white/[0.06] font-medium text-white' : 'text-mist',
              )}
            >
              <Icon size={14} aria-hidden="true" className={active ? 'text-glow' : undefined} />
              {label}
            </span>
          ))}
        </nav>

        {/* Conteúdo */}
        <div className="min-w-0 flex-1 p-3 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="min-w-0 space-y-3 lg:col-span-2">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {demoKpis.map((kpi, index) => (
                  <KpiCard key={kpi.id} kpi={kpi} index={index} />
                ))}
              </div>

              <section className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 sm:p-3.5">
                <header className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-white">Evolução da tesouraria</h3>
                  <div className="flex items-center gap-3 text-[10px] text-mist">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-px w-4 bg-glow" aria-hidden="true" />
                      Realizado
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-px w-4 bg-[repeating-linear-gradient(to_right,#0052FF_0_4px,transparent_4px_8px)]"
                        aria-hidden="true"
                      />
                      Previsão
                    </span>
                  </div>
                </header>
                <CashflowChart data={demoCashflow} />
              </section>
            </div>

            <div className="grid min-w-0 gap-3 md:grid-cols-2 lg:grid-cols-1">
              <InsightCard />
              <ForecastCard />
              <div className="md:col-span-2 lg:col-span-1">
                <ChatPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { AbsoluteFill } from 'remotion'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import type { View } from '@/components/v2/finer-ui/AppShell'
import { FinerAdvisorView } from '@/components/v2/finer-ui/FinerAdvisorView'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { AlertasView, CashflowView, ClientesView, DespesasView, ReceitasView } from '@/components/v2/finer-ui/screens'
import { CANVAS_H, CANVAS_W, K } from '../lib/constants'

/** Ecrã estático (plano geral) — usado para o storyboard. */
export function ScreenStill({ view }: { view: View }) {
  const body = {
    home: <FinerHomeView interactive={false} />,
    cashflow: <CashflowView />,
    receitas: <ReceitasView />,
    despesas: <DespesasView />,
    clientes: <ClientesView />,
    advisor: <FinerAdvisorView />,
    alertas: <AlertasView />,
  }[view]
  return (
    <AbsoluteFill style={{ backgroundColor: '#F7F9FE' }}>
      <div style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${K})`, transformOrigin: '0 0', overflow: 'hidden' }}>
        <AppShell view={view} className="min-h-[900px]">
          {body}
        </AppShell>
      </div>
    </AbsoluteFill>
  )
}

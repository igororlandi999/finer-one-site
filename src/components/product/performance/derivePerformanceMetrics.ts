import type { FinancialLineItem } from '@/data/demoDashboard'
import { variation } from '@/lib/format'

function line(items: FinancialLineItem[], label: string): FinancialLineItem {
  const item = items.find((row) => row.label === label)
  if (!item) throw new Error(`Rubrica "${label}" não encontrada em demoDashboard.`)
  return item
}

/**
 * Métricas derivadas de demoPnl/demoBalance/demoCashflowStatement — fonte
 * única usada pelos KPIs, pelas tabelas e pela análise interpretativa da
 * Performance Financeira, para nenhum número aparecer calculado de forma
 * diferente em dois sítios.
 *
 * Função (não constante de módulo) porque os rótulos de rubrica ("Receitas",
 * "Ativo Total", ...) vêm do hook useDemoDashboardData e mudam com o idioma —
 * uma constante de módulo não pode reagir a isso.
 */
export function derivePerformanceMetrics(
  demoPnl: FinancialLineItem[],
  demoBalance: FinancialLineItem[],
  demoCashflowStatement: FinancialLineItem[],
) {
  const receitas = line(demoPnl, demoPnl[0].label)
  const ebitda = line(demoPnl, demoPnl[2].label)
  const lucroLiquido = line(demoPnl, demoPnl[4].label)
  const ativoTotal = line(demoBalance, demoBalance[0].label)
  const capitalProprio = line(demoBalance, demoBalance[1].label)
  const investimento = line(demoCashflowStatement, demoCashflowStatement[1].label)
  const variacaoCaixa = line(demoCashflowStatement, demoCashflowStatement[3].label)

  const solvabilidadeAtual = (capitalProprio.current / ativoTotal.current) * 100
  const solvabilidadeAnterior = (capitalProprio.previous / ativoTotal.previous) * 100

  return {
    receitas: { ...receitas, ...variation(receitas.current, receitas.previous) },
    ebitda: {
      ...ebitda,
      ...variation(ebitda.current, ebitda.previous),
      marginPct: (ebitda.current / receitas.current) * 100,
    },
    lucroLiquido: {
      ...lucroLiquido,
      ...variation(lucroLiquido.current, lucroLiquido.previous),
      marginPct: (lucroLiquido.current / receitas.current) * 100,
    },
    ativoTotal: { ...ativoTotal, ...variation(ativoTotal.current, ativoTotal.previous) },
    solvabilidade: {
      current: solvabilidadeAtual,
      previous: solvabilidadeAnterior,
      deltaPP: solvabilidadeAtual - solvabilidadeAnterior,
    },
    investimento: { ...investimento, ...variation(investimento.current, investimento.previous) },
    variacaoCaixa: { ...variacaoCaixa, ...variation(variacaoCaixa.current, variacaoCaixa.previous) },
  }
}

export type PerformanceMetrics = ReturnType<typeof derivePerformanceMetrics>

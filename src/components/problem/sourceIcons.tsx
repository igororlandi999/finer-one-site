import { Bell, Calculator, Boxes, CheckCircle2, LineChart, Landmark, Receipt, Table2, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Ícones genéricos por tipo de sistema. Nunca logótipos de marcas reais.
 * Partilhado pelo card de dados dispersos e pelo hub da Finer One.
 */
export const systemIcons: Record<string, LucideIcon> = {
  bank: Landmark,
  invoice: Receipt,
  sheet: Table2,
  accounting: Calculator,
  erp: Boxes,
  analysis: LineChart,
  forecast: TrendingUp,
  alert: Bell,
  decision: CheckCircle2,
}

/**
 * Explorar — validação do pedido da análise completa e resumo da simulação.
 *
 * O navegador envia só os valores introduzidos no simulador. Os resultados guardados
 * (e enviados na notificação) são recalculados aqui com o mesmo módulo de cálculo do
 * site (src/lib/explore/monthly.ts), para nunca guardar números que não correspondem
 * aos valores — nem números forjados por quem chama o recetor diretamente.
 */
import { deepen, simulate } from '../../../src/lib/explore/monthly'
import type { MonthlyInputs } from '../../../src/lib/explore/monthly'
import { LIMITS, text } from './shared'

export const EXPLORE_LIMITS = { phone: 20, money: 999_999_999, days: 120 } as const
export const CURRENCIES = ['EUR', 'GBP', 'USD', 'CHF', 'BRL', 'AOA', 'MZN'] as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type ExploreLead = {
  name: string
  email: string
  company: string
  phone: string | null
  contact: boolean
  marketing: boolean
}

export type ExploreSimulation = {
  id: string
  scenario: 'treasury' | 'clients'
  horizon: 3 | 6
  currency: string
  /** Só o que entra no cálculo. */
  inputs: { balance: number | null; receipts: number[]; payments: number[] | null; delayShare: number; delayDays: number; hasBalance: boolean }
}

export type ExploreSummary = {
  v: 1
  lowestBalance: number | null
  lowestBalanceMonth: number | null
  lowestBalanceNoDelay: number | null
  firstNegativeMonth: number | null
  maxGap: number
  maxGapMonth: number
  pressureMonths: number[]
  pushedOut: number
  totalIn: number
  totalOut: number | null
  tied: number
  dsoIncrease: number
  fundingNeed: number | null
  minHeadroom: number | null
  kpis: { days: number | null; cover: number | null; margin: number | null; variation: number | null }
}

const flag = (v: unknown) => v === true || v === 1 || v === '1' || v === 'sim' || v === 'true'

/** Telefone opcional: "+351 912 345 678" → "+351912345678". Inválido → erro. */
export function phone(value: unknown): string | null | false {
  const raw = text(value, 40)
  if (!raw) return null
  if (!/^\+\d[\d\s()-]*$/.test(raw)) return false
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return false
  return '+' + digits
}

/** Devolve o lead limpo, ou o nome do primeiro campo inválido. */
export function cleanLead(fields: unknown): ExploreLead | string {
  const f = (fields && typeof fields === 'object' ? fields : {}) as Record<string, unknown>
  const name = text(f.name, LIMITS.name)
  const email = text(f.email, LIMITS.email).toLowerCase()
  const company = text(f.company, LIMITS.company)
  const tel = phone(f.phone)
  if (name.length < 2) return 'name'
  if (!EMAIL_RE.test(email)) return 'email'
  if (company.length < 2) return 'company'
  if (tel === false) return 'phone'
  // Pedido da análise e tratamento para esse fim: obrigatório e separado das novidades.
  if (!flag(f.privacy)) return 'privacy'
  return { name, email, company, phone: tel, contact: flag(f.contact), marketing: flag(f.marketing) }
}

const money = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= EXPLORE_LIMITS.money
const int = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max

/** Valida os valores da simulação. Rejeita (não corrige) tudo o que o simulador não produz. */
export function cleanSimulation(value: unknown): ExploreSimulation | string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'simulation'
  const s = value as Record<string, unknown>
  const id = text(s.id, 64)
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) return 'simulation'
  if (s.scenario !== 'treasury' && s.scenario !== 'clients') return 'scenario'
  if (s.horizon !== 3 && s.horizon !== 6) return 'horizon'
  if (typeof s.currency !== 'string' || !(CURRENCIES as readonly string[]).includes(s.currency)) return 'currency'
  const inp = (s.inputs && typeof s.inputs === 'object' ? s.inputs : null) as Record<string, unknown> | null
  if (!inp) return 'inputs'
  const H = s.horizon
  const receipts = inp.receipts
  const payments = inp.payments
  if (!Array.isArray(receipts) || receipts.length < H || receipts.length > 6 || !receipts.every(money)) return 'inputs'
  if (!int(inp.delayShare, 0, 100) || !int(inp.delayDays, 0, EXPLORE_LIMITS.days)) return 'inputs'
  if (typeof inp.hasBalance !== 'boolean') return 'inputs'
  // "A minha tesouraria" usa sempre saldo e pagamentos; "Os meus clientes" só se o visitante os indicou.
  const hasBalance = s.scenario === 'treasury' ? true : inp.hasBalance
  if (hasBalance && (!money(inp.balance) || !Array.isArray(payments) || payments.length < H || payments.length > 6 || !payments.every(money))) return 'inputs'
  return {
    id,
    scenario: s.scenario,
    horizon: H,
    currency: s.currency,
    inputs: {
      balance: hasBalance ? (inp.balance as number) : null,
      receipts: (receipts as number[]).slice(0, H),
      payments: hasBalance ? (payments as number[]).slice(0, H) : null,
      delayShare: inp.delayShare as number,
      delayDays: inp.delayDays as number,
      hasBalance,
    },
  }
}

const r0 = (v: number) => Math.round(v)
const r3 = (v: number | null) => (v === null || !Number.isFinite(v) ? null : Math.round(v * 1000) / 1000)

/** Recalcula, com o módulo do site, os principais resultados mostrados na análise. */
export function summarize(sim: ExploreSimulation): ExploreSummary {
  const i = sim.inputs
  const pad = (a: number[]) => [...a, ...new Array(6 - a.length).fill(0)]
  const inp: MonthlyInputs = {
    balance: i.balance ?? 0,
    receipts: pad(i.receipts),
    payments: pad(i.payments ?? []),
    delayShare: i.delayShare,
    delayDays: i.delayDays,
    horizon: sim.horizon,
    hasBalance: i.hasBalance,
  }
  const r = simulate(inp)
  const d = deepen(inp)
  const k = Object.fromEntries(r.kpis.delayed.map((x) => [x.id, r3(x.value)])) as ExploreSummary['kpis']
  const firstNeg = r.delayed.months.findIndex((m) => m.closing < 0)
  return {
    v: 1,
    lowestBalance: i.hasBalance ? r0(r.delayed.minClosing) : null,
    lowestBalanceMonth: i.hasBalance ? r.delayed.minMonth : null,
    lowestBalanceNoDelay: i.hasBalance ? r0(r.base.minClosing) : null,
    firstNegativeMonth: i.hasBalance && firstNeg >= 0 ? firstNeg : null,
    maxGap: r0(r.maxGap),
    maxGapMonth: r.maxGapMonth,
    pressureMonths: r.pressure,
    pushedOut: r0(r.delayed.pushedOut),
    totalIn: r0(r.base.totalIn),
    totalOut: i.hasBalance ? r0(r.base.totalOut) : null,
    tied: r0(d.tied),
    dsoIncrease: r3(d.dsoIncrease) ?? 0,
    fundingNeed: i.hasBalance ? r0(d.fundingNeed) : null,
    minHeadroom: i.hasBalance ? r0(d.minHeadroom) : null,
    kpis: { days: k.days ?? null, cover: k.cover ?? null, margin: k.margin ?? null, variation: k.variation ?? null },
  }
}

/** Primeiro mês simulado (o simulador começa no mês seguinte ao atual), em AAAA-MM. */
export function referenceMonth(now: number): string {
  const d = new Date(now)
  const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
  return `${m.getUTCFullYear()}-${String(m.getUTCMonth() + 1).padStart(2, '0')}`
}

/** Impressão digital dos valores (mesma simulação = mesmo hash). */
export async function simHash(sim: ExploreSimulation): Promise<string> {
  const canonical = JSON.stringify([sim.scenario, sim.horizon, sim.currency, sim.inputs])
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

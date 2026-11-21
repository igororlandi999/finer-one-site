/**
 * Simulador mensal do Explore (cálculo puro, sem interface).
 *
 * Regras (pedido do fundador, 21/11/2026, e "Previsão de tesouraria e KPIs"):
 *  - Saldo final do mês = saldo inicial do mês + entradas do mês − saídas do mês.
 *  - O saldo final de um mês passa a saldo inicial do mês seguinte.
 *  - Um atraso desloca a parte afetada dos recebimentos para meses posteriores;
 *    o valor sai do mês original e entra no mês em que é recebido (nunca duas vezes).
 *  - Recebimentos deslocados para depois do horizonte ficam fora da análise e são
 *    mostrados à parte.
 *  - Assume-se que, dentro de cada mês, os recebimentos se distribuem de forma
 *    uniforme: um atraso de D dias leva a fração (D mod 30)/30 um mês mais longe.
 */

export type ScenarioKind = 'treasury' | 'clients'
export type Horizon = 3 | 6

export type MonthlyInputs = {
  balance: number // saldo inicial disponível (pode ser 0 se desconhecido)
  receipts: number[] // recebimentos previstos por mês (6 valores; usa-se o horizonte)
  payments: number[] // pagamentos previstos por mês
  delayShare: number // % dos recebimentos sujeitos a atraso (0–100)
  delayDays: number // atraso adicional em dias (0–90)
  horizon: Horizon
  hasBalance: boolean // o visitante indicou saldo e pagamentos (necessário para o saldo projetado)
}

export type MonthRow = { inflow: number; outflow: number; net: number; opening: number; closing: number }

export type Projection = { months: MonthRow[]; minClosing: number; minMonth: number; pushedOut: number; totalIn: number; totalOut: number }

export type Light = 'green' | 'amber' | 'red' | 'na'
export type Kpi = { id: string; value: number | null; light: Light }

export type Result = {
  base: Projection
  delayed: Projection
  /** Maior diferença entre o saldo de fim de mês sem e com atrasos (liquidez a menos). */
  maxGap: number
  maxGapMonth: number
  /** Meses com pressão no cenário com atrasos (saldo final negativo ou saídas acima das entradas). */
  pressure: number[]
  /** Mês com maior concentração de recebimentos (base) e a sua quota no total. */
  concentration: { month: number; share: number }
  kpis: { base: Kpi[]; delayed: Kpi[] }
}

const n = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0)

function shiftReceipts(receipts: number[], H: number, share: number, days: number) {
  const out = new Array(H).fill(0)
  let pushedOut = 0
  const f = Math.max(0, Math.min(100, share)) / 100
  const k = Math.floor(days / 30)
  const frac = (days % 30) / 30
  for (let m = 0; m < H; m++) {
    const r = n(receipts[m])
    const late = days > 0 ? r * f : 0
    out[m] += r - late
    const add = (target: number, value: number) => {
      if (value <= 0) return
      if (target < H) out[target] += value
      else pushedOut += value
    }
    add(m + k, late * (1 - frac))
    add(m + k + 1, late * frac)
  }
  return { out, pushedOut }
}

function project(inflows: number[], outflows: number[], balance: number, pushedOut: number): Projection {
  let opening = n(balance)
  const months: MonthRow[] = inflows.map((inflow, m) => {
    const outflow = outflows[m]
    const net = inflow - outflow
    const row = { inflow, outflow, net, opening, closing: opening + net }
    opening = row.closing
    return row
  })
  let minMonth = 0
  months.forEach((r, m) => {
    if (r.closing < months[minMonth].closing) minMonth = m
  })
  return {
    months,
    minClosing: months[minMonth]?.closing ?? 0,
    minMonth,
    pushedOut,
    totalIn: inflows.reduce((a, b) => a + b, 0),
    totalOut: outflows.reduce((a, b) => a + b, 0),
  }
}

/** Indicadores do documento "Previsão de tesouraria e KPIs", calculáveis com estes dados. */
function kpis(p: Projection, inp: MonthlyInputs): Kpi[] {
  const m1 = p.months[0]
  const avgOut = p.totalOut / Math.max(1, p.months.length)
  const daily = avgOut / 30
  // Dias de tesouraria = saldo ÷ média diária das saídas (aqui: das saídas previstas)
  const days = inp.hasBalance && daily > 0 ? n(inp.balance) / daily : null
  // Cobertura a 30 dias = (saldo + a receber em 30 dias) ÷ (a pagar em 30 dias)
  const cover = inp.hasBalance && m1 && m1.outflow > 0 ? (n(inp.balance) + m1.inflow) / m1.outflow : null
  // Margem líquida de caixa = (entradas − saídas) ÷ entradas, no mês mais fraco do horizonte
  const margins = p.months.filter((r) => r.inflow > 0).map((r) => r.net / r.inflow)
  const margin = margins.length && inp.hasBalance ? Math.min(...margins) : null
  // Variação das entradas = entradas do mês ÷ entradas do mês anterior − 1 (pior variação)
  const vars = p.months.slice(1).map((r, i) => (p.months[i].inflow > 0 ? r.inflow / p.months[i].inflow - 1 : null)).filter((v): v is number => v !== null)
  const variation = vars.length ? Math.min(...vars) : null
  const light = (v: number | null, g: number, a: number): Light => (v === null ? 'na' : v >= g ? 'green' : v >= a ? 'amber' : 'red')
  return [
    { id: 'days', value: days, light: light(days, 60, 30) },
    { id: 'cover', value: cover, light: light(cover, 1.2, 1) },
    { id: 'margin', value: margin, light: light(margin, 0.05, 0) },
    { id: 'variation', value: variation, light: light(variation, 0, -0.1) },
  ]
}

export function simulate(inp: MonthlyInputs): Result {
  const H = inp.horizon
  const baseIn = Array.from({ length: H }, (_, m) => n(inp.receipts[m]))
  const out = Array.from({ length: H }, (_, m) => (inp.hasBalance ? n(inp.payments[m]) : 0))
  const shifted = shiftReceipts(inp.receipts, H, inp.delayShare, inp.delayDays)
  const base = project(baseIn, out, inp.hasBalance ? inp.balance : 0, 0)
  const delayed = project(shifted.out, out, inp.hasBalance ? inp.balance : 0, shifted.pushedOut)

  let maxGap = 0
  let maxGapMonth = 0
  base.months.forEach((r, m) => {
    const gap = r.closing - delayed.months[m].closing
    if (gap > maxGap) {
      maxGap = gap
      maxGapMonth = m
    }
  })
  const pressure = delayed.months.map((r, m) => (inp.hasBalance && (r.closing < 0 || r.net < 0) ? m : -1)).filter((m) => m >= 0)
  const total = base.totalIn || 1
  let cm = 0
  baseIn.forEach((v, m) => {
    if (v > baseIn[cm]) cm = m
  })
  return { base, delayed, maxGap, maxGapMonth, pressure, concentration: { month: cm, share: baseIn[cm] / total }, kpis: { base: kpis(base, inp), delayed: kpis(delayed, inp) } }
}

// ---------- Leitura do Finer Advisor (regras da simulação, não IA) ----------

export type Note = { tone: 'info' | 'warn' | 'risk'; pt: string; en: string }

export function advise(inp: MonthlyInputs, r: Result, fmt: { money: (v: number) => string; month: (m: number, lang: 'pt' | 'en') => string }): Note[] {
  const out: Note[] = []
  const d = r.delayed
  if (!inp.hasBalance) {
    out.push({
      tone: 'info',
      pt: 'Para avaliar este cenário com maior precisão, será necessário conhecer o saldo disponível e o calendário dos pagamentos.',
      en: 'To assess this scenario more precisely, the available balance and the payment calendar are needed.',
    })
  }
  if (r.concentration.share >= 0.3 && inp.horizon > 1) {
    out.push({
      tone: 'info',
      pt: `Uma parte relevante dos recebimentos previstos (${Math.round(r.concentration.share * 100)}%) está concentrada em ${fmt.month(r.concentration.month, 'pt')}. Vale a pena acompanhar os respetivos prazos.`,
      en: `A relevant share of expected receipts (${Math.round(r.concentration.share * 100)}%) is concentrated in ${fmt.month(r.concentration.month, 'en')}. It is worth following their due dates.`,
    })
  }
  if (inp.hasBalance && d.minClosing < 0) {
    out.push({
      tone: 'risk',
      pt: `Neste cenário, os pagamentos previstos ultrapassam a disponibilidade de caixa estimada em ${fmt.month(d.minMonth, 'pt')} (saldo de ${fmt.money(d.minClosing)}). Reveja o calendário de entradas e saídas.`,
      en: `In this scenario, expected payments exceed the estimated cash available in ${fmt.month(d.minMonth, 'en')} (balance of ${fmt.money(d.minClosing)}). Review the calendar of inflows and outflows.`,
    })
  }
  if (r.maxGap > 0) {
    out.push({
      tone: 'warn',
      pt: `O atraso retira até ${fmt.money(r.maxGap)} ao dinheiro disponível em ${fmt.month(r.maxGapMonth, 'pt')}. Pode testar reduzir a parte dos recebimentos sujeita a atraso ou o número de dias.`,
      en: `The delay removes up to ${fmt.money(r.maxGap)} from available cash in ${fmt.month(r.maxGapMonth, 'en')}. You can test reducing the share of receipts subject to delay or the number of days.`,
    })
  }
  if (d.pushedOut > 0) {
    out.push({
      tone: 'warn',
      pt: `${fmt.money(d.pushedOut)} de recebimentos passam para depois do período analisado e não contam para a tesouraria destes meses.`,
      en: `${fmt.money(d.pushedOut)} of receipts move beyond the analysed period and do not count towards these months' cash.`,
    })
  }
  if (inp.hasBalance && d.minClosing >= 0 && r.pressure.length === 0) {
    out.push({
      tone: 'info',
      pt: 'Com estes pressupostos, o saldo mantém-se positivo em todos os meses. Teste um atraso maior para conhecer a sua margem de segurança.',
      en: 'With these assumptions, the balance stays positive every month. Test a longer delay to find your safety margin.',
    })
  }
  return out
}

// ---------- Valores de exemplo (empresa de exemplo, demonstrativos) ----------

export const SAMPLE: Record<ScenarioKind, MonthlyInputs> = {
  treasury: {
    balance: 25000,
    receipts: [42000, 38000, 45000, 40000, 47000, 43000],
    payments: [41000, 43000, 40000, 44000, 41000, 42000],
    delayShare: 40,
    delayDays: 30,
    horizon: 6,
    hasBalance: true,
  },
  clients: {
    balance: 25000,
    receipts: [30000, 52000, 28000, 46000, 35000, 41000],
    payments: [38000, 38000, 38000, 38000, 38000, 38000],
    delayShare: 35,
    delayDays: 30,
    horizon: 6,
    hasBalance: false,
  },
}

// ---------- Análise ao estilo das consultoras (liquidez, cenários, fundo de maneio) ----------
/**
 * Método inspirado nas práticas públicas de PwC, Deloitte e KPMG para previsão de
 * tesouraria: previsão direta (recebimentos e pagamentos), ponto mais baixo de
 * liquidez face a uma reserva mínima ("headroom"), cenários base / o seu / stress,
 * capital preso em fundo de maneio e ponte de tesouraria. Tudo calculado só com os
 * valores introduzidos pelo visitante.
 */
export type Scenario3 = { id: 'base' | 'yours' | 'stress'; share: number; days: number; r: Result }

export type Deep = {
  buffer: number // reserva mínima de referência: 1 mês de pagamentos médios
  headroom: number[] // saldo final − reserva, por mês (cenário do visitante)
  minHeadroom: number
  minHeadroomMonth: number
  fundingNeed: number // valor a assegurar para manter a reserva no pior mês
  tied: number // capital preso em recebimentos pelo atraso
  dsoIncrease: number // aumento do prazo médio de recebimento ponderado (dias)
  scenarios: Scenario3[]
  bridge: { opening: number; inflow: number; delayEffect: number; outflow: number; closing: number }
  sensitivity: { shares: number[]; days: number[]; cells: number[][] } // ponto mais baixo (ou maior quebra mensal)
  levers: { id: 'share' | 'days'; gain: number; to: number }[]
}

const maxDrop = (r: Result) => Math.max(0, ...r.base.months.map((m, i) => m.inflow - r.delayed.months[i].inflow))

export function deepen(inp: MonthlyInputs): Deep {
  const r = simulate(inp)
  const H = inp.horizon
  const avg = (a: number[]) => a.slice(0, H).reduce((x, y) => x + Math.max(0, y), 0) / H
  const buffer = inp.hasBalance ? avg(inp.payments) : 0
  const headroom = r.delayed.months.map((m) => m.closing - buffer)
  let minHeadroomMonth = 0
  headroom.forEach((h, i) => { if (h < headroom[minHeadroomMonth]) minHeadroomMonth = i })
  const minHeadroom = headroom[minHeadroomMonth] ?? 0
  const dsoIncrease = (inp.delayShare / 100) * inp.delayDays
  const tied = (avg(inp.receipts) / 30) * dsoIncrease
  const mk = (id: Scenario3['id'], share: number, days: number): Scenario3 => ({ id, share, days, r: simulate({ ...inp, delayShare: share, delayDays: days }) })
  const stressShare = Math.min(100, inp.delayShare + 20)
  const stressDays = Math.min(120, Math.max(30, inp.delayDays * 2))
  const scenarios = [mk('base', 0, 0), mk('yours', inp.delayShare, inp.delayDays), mk('stress', stressShare, stressDays)]
  const last = r.delayed.months[H - 1]
  const bridge = { opening: inp.hasBalance ? Math.max(0, inp.balance) : 0, inflow: r.base.totalIn, delayEffect: r.delayed.totalIn - r.base.totalIn, outflow: -r.base.totalOut, closing: last?.closing ?? 0 }
  const shares = [20, 40, 60, 80]
  const days = [15, 30, 60, 90]
  const cells = shares.map((s) => days.map((d) => { const x = simulate({ ...inp, delayShare: s, delayDays: d }); return inp.hasBalance ? x.delayed.minClosing : -maxDrop(x) }))
  const metric = (x: Result) => (inp.hasBalance ? x.delayed.minClosing : -maxDrop(x))
  const now = metric(r)
  const levers: Deep['levers'] = []
  if (inp.delayShare > 0 && inp.delayDays > 0) {
    const s2 = Math.max(0, inp.delayShare - 10)
    levers.push({ id: 'share', to: s2, gain: metric(simulate({ ...inp, delayShare: s2 })) - now })
    if (inp.delayDays > 15) levers.push({ id: 'days', to: 15, gain: metric(simulate({ ...inp, delayDays: 15 })) - now })
  }
  return { buffer, headroom, minHeadroom, minHeadroomMonth, fundingNeed: Math.max(0, -minHeadroom), tied, dsoIncrease, scenarios, bridge, sensitivity: { shares, days, cells }, levers }
}

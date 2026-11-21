/**
 * Motor do simulador "Explorar" — cálculo puro, sem interface.
 *
 * Projeta o saldo de tesouraria dia a dia num horizonte de 90 dias a partir do
 * saldo atual e dos recebimentos/pagamentos indicados pelo visitante, e compara o
 * "Cenário atual" com o "Cenário simulado" (datas ajustadas, atrasos reduzidos,
 * uma encomenda nova). Todos os resultados são estimativas das premissas dadas.
 */

export const HORIZON = 90

export type ScenarioKind = 'treasury' | 'clients' | 'order'

export type Flow = { id: string; label: string; amount: number; date: string }
export type Invoice = { id: string; label: string; amount: number; due: string; delay: number }
export type Order = { cost: number; costDate: string; value: number; receiptDate: string }

export type Inputs = {
  balance: number
  receipts: Flow[] // A minha tesouraria / Financiar uma oportunidade
  payments: Flow[]
  invoices: Invoice[] // Os meus clientes
  order: Order // Financiar uma oportunidade
  rate: number // taxa anual (%) para estimar o custo de financiar um défice; 0 = não indicada
}

/** Ajustes do cenário simulado (o cenário atual não tem nenhum). */
export type Adjust = {
  receiptShift: number // dias (negativo = mais cedo) aplicado a todos os recebimentos
  paymentShift: number // dias (positivo = mais tarde) aplicado a todos os pagamentos
  delayReduction: number // dias a menos de atraso em todas as faturas (clientes)
  itemShift: Record<string, number> // ajuste a um movimento concreto (recomendações)
}

export const NO_ADJUST: Adjust = { receiptShift: 0, paymentShift: 0, delayReduction: 0, itemShift: {} }

export type Event = { id: string; label: string; amount: number; day: number; kind: 'in' | 'out' }

export type Projection = {
  series: number[] // saldo no fim de cada dia, 0..HORIZON
  events: Event[]
  min: number
  minDay: number
  shortfall: number
  daysNegative: number
  financingCost: number
  end: number
}

// ---------- Datas (locais, formato AAAA-MM-DD) ----------

export function today(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
export function iso(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
export function addDays(base: Date, n: number) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + n)
}
export function fromIso(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  return new Date(+m[1], +m[2] - 1, +m[3])
}
export function dayIndex(s: string, start = today()) {
  const d = fromIso(s)
  if (!d) return 0
  return Math.round((d.getTime() - start.getTime()) / 86400000)
}
export const inDays = (n: number, start = today()) => iso(addDays(start, n))

// ---------- Projeção ----------

function buildEvents(kind: ScenarioKind, inp: Inputs, adj: Adjust, withOrder: boolean): Event[] {
  const ev: Event[] = []
  const shift = (id: string) => adj.itemShift[id] ?? 0
  if (kind === 'clients') {
    for (const inv of inp.invoices) {
      if (!(inv.amount > 0)) continue
      const delay = Math.max(0, inv.delay - adj.delayReduction)
      ev.push({ id: inv.id, label: inv.label, amount: inv.amount, day: dayIndex(inv.due) + delay + shift(inv.id), kind: 'in' })
    }
  } else {
    for (const r of inp.receipts) {
      if (!(r.amount > 0)) continue
      ev.push({ id: r.id, label: r.label, amount: r.amount, day: dayIndex(r.date) + adj.receiptShift + shift(r.id), kind: 'in' })
    }
  }
  for (const p of inp.payments) {
    if (!(p.amount > 0)) continue
    ev.push({ id: p.id, label: p.label, amount: p.amount, day: dayIndex(p.date) + adj.paymentShift + shift(p.id), kind: 'out' })
  }
  if (kind === 'order' && withOrder) {
    const o = inp.order
    if (o.cost > 0) ev.push({ id: 'order-cost', label: 'order-cost', amount: o.cost, day: dayIndex(o.costDate) + shift('order-cost'), kind: 'out' })
    if (o.value > 0) ev.push({ id: 'order-receipt', label: 'order-receipt', amount: o.value, day: dayIndex(o.receiptDate) + shift('order-receipt'), kind: 'in' })
  }
  // Movimentos já vencidos contam hoje; fora do horizonte não entram na projeção.
  return ev.map((e) => ({ ...e, day: Math.max(0, e.day) })).filter((e) => e.day <= HORIZON)
}

export function project(kind: ScenarioKind, inp: Inputs, adj: Adjust, withOrder: boolean): Projection {
  const events = buildEvents(kind, inp, adj, withOrder)
  const delta = new Array(HORIZON + 1).fill(0)
  for (const e of events) delta[e.day] += e.kind === 'in' ? e.amount : -e.amount
  const series: number[] = []
  let bal = inp.balance || 0
  for (let d = 0; d <= HORIZON; d++) {
    bal += delta[d]
    series.push(bal)
  }
  let min = series[0]
  let minDay = 0
  series.forEach((v, d) => {
    if (v < min) {
      min = v
      minDay = d
    }
  })
  const negative = series.filter((v) => v < 0)
  // Custo de financiar o défice: juros simples diários sobre o valor em falta, à taxa indicada.
  const financingCost = inp.rate > 0 ? negative.reduce((a, v) => a + -v, 0) * (inp.rate / 100 / 365) : 0
  return { series, events, min, minDay, shortfall: Math.max(0, -min), daysNegative: negative.length, financingCost, end: series[HORIZON] }
}

export type Comparison = {
  current: Projection
  simulated: Projection
  minImprovement: number // saldo mínimo simulado - atual (liquidez libertada no ponto mais apertado)
  pressure: { id: string; label: string; amount: number; day: number; score: number }[]
  order?: { cashRequired: number; margin: number; marginPct: number; extraFinancing: number; marginAfterFinancing: number; minDrop: number }
}

export function compare(kind: ScenarioKind, inp: Inputs, adj: Adjust): Comparison {
  const current = project(kind, inp, NO_ADJUST, false)
  // Na oportunidade, o cenário simulado inclui a encomenda (o atual é sem ela).
  const simulated = project(kind, inp, adj, kind === 'order')

  // Recebimentos que mais pressionam: os que chegam depois do ponto mais apertado
  // (no cenário atual) — quanto maior o valor e o atraso, maior a pressão.
  const pressure =
    kind === 'clients'
      ? inp.invoices
          .filter((i) => i.amount > 0 && i.delay > 0)
          .map((i) => ({ id: i.id, label: i.label, amount: i.amount, day: Math.max(0, dayIndex(i.due) + i.delay), score: i.amount * i.delay }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
      : current.events
          .filter((e) => e.kind === 'in' && e.day > current.minDay && e.id !== 'order-receipt')
          .map((e) => ({ id: e.id, label: e.label, amount: e.amount, day: e.day, score: e.amount }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)

  let order: Comparison['order']
  if (kind === 'order') {
    const o = inp.order
    const margin = o.value - o.cost
    const extraFinancing = Math.max(0, simulated.financingCost - current.financingCost)
    order = {
      cashRequired: o.cost,
      margin,
      marginPct: o.value > 0 ? margin / o.value : 0,
      extraFinancing,
      marginAfterFinancing: margin - extraFinancing,
      minDrop: current.min - simulated.min,
    }
  }
  return { current, simulated, minImprovement: simulated.min - current.min, pressure, order }
}

// ---------- Finer Advisor (regras a partir das premissas) ----------

export type Recommendation = {
  key: string
  text: { pt: string; en: string }
  adjust?: Partial<Adjust> & { itemShift?: Record<string, number> }
  effect?: number // melhoria do saldo mínimo se aplicada
}

export type AdvisorReading = {
  identified: { pt: string; en: string }[]
  pressure: { pt: string; en: string }[]
  tests: Recommendation[]
}

type Fmt = { money: (n: number) => string; date: (day: number) => string }

function labelOf(e: { label: string }, lang: 'pt' | 'en') {
  if (e.label === 'order-cost') return lang === 'pt' ? 'o custo da encomenda' : 'the order cost'
  if (e.label === 'order-receipt') return lang === 'pt' ? 'o pagamento do cliente pela encomenda' : 'the customer payment for the order'
  return e.label || (lang === 'pt' ? 'este movimento' : 'this item')
}

/** Lê o cenário simulado e propõe testes derivados dos próprios valores. */
export function advise(kind: ScenarioKind, inp: Inputs, adj: Adjust, cmp: Comparison, fmt: { pt: Fmt; en: Fmt }): AdvisorReading {
  const s = cmp.simulated
  const both = (pt: string, en: string) => ({ pt, en })
  const identified: AdvisorReading['identified'] = []
  const pressure: AdvisorReading['pressure'] = []
  const tests: Recommendation[] = []

  identified.push(
    both(
      `O saldo projetado chega ao valor mais baixo, ${fmt.pt.money(s.min)}, a ${fmt.pt.date(s.minDay)}.`,
      `The projected balance reaches its lowest point, ${fmt.en.money(s.min)}, on ${fmt.en.date(s.minDay)}.`,
    ),
  )
  if (s.shortfall > 0) {
    identified.push(
      both(
        `Nesse momento faltariam cerca de ${fmt.pt.money(s.shortfall)}. O saldo fica negativo durante ${s.daysNegative} ${s.daysNegative === 1 ? 'dia' : 'dias'} nos próximos ${HORIZON}.`,
        `At that point there would be a gap of about ${fmt.en.money(s.shortfall)}. The balance stays negative for ${s.daysNegative} ${s.daysNegative === 1 ? 'day' : 'days'} in the next ${HORIZON}.`,
      ),
    )
  } else {
    identified.push(both(`Com estas premissas, o saldo mantém-se positivo nos próximos ${HORIZON} dias.`, `With these assumptions, the balance stays positive over the next ${HORIZON} days.`))
  }
  if (kind === 'order' && cmp.order) {
    identified.push(
      both(
        `A encomenda exige ${fmt.pt.money(cmp.order.cashRequired)} antes de ser paga e baixa o saldo mínimo em ${fmt.pt.money(Math.max(0, cmp.order.minDrop))}.`,
        `The order needs ${fmt.en.money(cmp.order.cashRequired)} before it is paid and lowers the minimum balance by ${fmt.en.money(Math.max(0, cmp.order.minDrop))}.`,
      ),
    )
  }

  // O que pressiona: maior saída até ao ponto mais baixo e maior entrada que chega depois dele.
  const outs = s.events.filter((e) => e.kind === 'out' && e.day <= s.minDay).sort((a, b) => b.amount - a.amount)
  const lateIns = s.events.filter((e) => e.kind === 'in' && e.day > s.minDay).sort((a, b) => b.amount - a.amount)
  if (outs[0]) {
    pressure.push(
      both(
        `A maior saída antes desse momento é ${labelOf(outs[0], 'pt')} (${fmt.pt.money(outs[0].amount)}, ${fmt.pt.date(outs[0].day)}).`,
        `The largest outflow before that point is ${labelOf(outs[0], 'en')} (${fmt.en.money(outs[0].amount)}, ${fmt.en.date(outs[0].day)}).`,
      ),
    )
  }
  if (lateIns[0]) {
    pressure.push(
      both(
        `${cap(labelOf(lateIns[0], 'pt'))} (${fmt.pt.money(lateIns[0].amount)}) só entra a ${fmt.pt.date(lateIns[0].day)}, depois do ponto mais apertado.`,
        `${cap(labelOf(lateIns[0], 'en'))} (${fmt.en.money(lateIns[0].amount)}) only arrives on ${fmt.en.date(lateIns[0].day)}, after the tightest point.`,
      ),
    )
  }
  if (kind === 'clients') {
    const top = cmp.pressure[0]
    if (top) {
      const inv = inp.invoices.find((i) => i.id === top.id)
      if (inv) {
        pressure.push(
          both(
            `A fatura de ${inv.label} (${fmt.pt.money(inv.amount)}) tem ${Math.max(0, inv.delay - adj.delayReduction)} dias de atraso previstos — é a que mais pesa.`,
            `${inv.label}'s invoice (${fmt.en.money(inv.amount)}) has ${Math.max(0, inv.delay - adj.delayReduction)} expected days of delay — the heaviest one.`,
          ),
        )
      }
    }
  }
  if (!pressure.length) pressure.push(both('Nenhum movimento concentra a pressão neste horizonte.', 'No single item concentrates the pressure in this horizon.'))

  // Testes: só os que melhoram o saldo mínimo com os valores indicados.
  const tryShift = (id: string, by: number) => {
    const next: Adjust = { ...adj, itemShift: { ...adj.itemShift, [id]: (adj.itemShift[id] ?? 0) + by } }
    return project(kind, inp, next, kind === 'order').min - s.min
  }
  // Escolhe, entre os recebimentos depois do ponto mais baixo, o que mais ajuda se chegar antes dele.
  const bestIn = lateIns.slice(0, 6).map((e) => ({ e, by: -(e.day - s.minDay + 1) })).map((c) => ({ ...c, gain: tryShift(c.e.id, c.by) })).sort((a, b) => b.gain - a.gain)[0]
  if (bestIn && s.shortfall > 0) {
    const { e, by, gain } = bestIn
    if (gain > 0) {
      tests.push({
        key: 'earlier-' + e.id,
        text: both(
          `Receber ${labelOf(e, 'pt')} ${-by} dias mais cedo (até ${fmt.pt.date(s.minDay - 1)}). O saldo mínimo melhoraria cerca de ${fmt.pt.money(gain)}.`,
          `Collect ${labelOf(e, 'en')} ${-by} days earlier (by ${fmt.en.date(s.minDay - 1)}). The minimum balance would improve by about ${fmt.en.money(gain)}.`,
        ),
        adjust: { itemShift: { [e.id]: by } },
        effect: gain,
      })
    }
  }
  // E, entre os pagamentos até esse ponto, o que mais ajuda se passar para depois dele.
  const bestOut = outs.slice(0, 6).map((e) => ({ e, by: s.minDay - e.day + 1 })).map((c) => ({ ...c, gain: tryShift(c.e.id, c.by) })).sort((a, b) => b.gain - a.gain)[0]
  if (bestOut && s.shortfall > 0) {
    const { e, by, gain } = bestOut
    if (gain > 0) {
      tests.push({
        key: 'later-' + e.id,
        text: both(
          `Mudar ${labelOf(e, 'pt')} para ${fmt.pt.date(e.day + by)} (${by} dias depois). O saldo mínimo melhoraria cerca de ${fmt.pt.money(gain)}.`,
          `Move ${labelOf(e, 'en')} to ${fmt.en.date(e.day + by)} (${by} days later). The minimum balance would improve by about ${fmt.en.money(gain)}.`,
        ),
        adjust: { itemShift: { [e.id]: by } },
        effect: gain,
      })
    }
  }
  if (s.shortfall > 0) {
    tests.push(
      inp.rate > 0
        ? {
            key: 'finance',
            text: both(
              `Comparar com financiar o défice: a ${inp.rate}% ao ano, cobrir os dias negativos custaria cerca de ${fmt.pt.money(s.financingCost)} neste cenário.`,
              `Compare with financing the gap: at ${inp.rate}% a year, covering the negative days would cost about ${fmt.en.money(s.financingCost)} in this scenario.`,
            ),
          }
        : {
            key: 'finance-rate',
            text: both(
              'Indicar uma taxa de financiamento para comparar o custo de cobrir o défice com as outras opções.',
              'Enter a financing rate to compare the cost of covering the gap with the other options.',
            ),
          },
    )
  }
  if (s.shortfall === 0) {
    const biggest = s.events.filter((e) => e.kind === 'in').sort((a, b) => b.amount - a.amount)[0]
    if (biggest) {
      tests.push({
        key: 'stress-' + biggest.id,
        text: both(
          `Testar a margem de segurança: e se ${labelOf(biggest, 'pt')} (${fmt.pt.money(biggest.amount)}) atrasar 15 dias?`,
          `Test your safety margin: what if ${labelOf(biggest, 'en')} (${fmt.en.money(biggest.amount)}) is 15 days late?`,
        ),
        adjust: { itemShift: { [biggest.id]: 15 } },
      })
    }
  }
  return { identified, pressure, tests: tests.slice(0, 3) }
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ---------- Exemplo (empresa de exemplo, valores demonstrativos) ----------

export function sampleInputs(start = today()): Inputs {
  const d = (n: number) => inDays(n, start)
  return {
    balance: 18000,
    receipts: [
      { id: 'r1', label: 'Cliente A', amount: 12500, date: d(10) },
      { id: 'r2', label: 'Cliente B', amount: 7800, date: d(38) },
      { id: 'r3', label: 'Cliente C', amount: 9400, date: d(55) },
      { id: 'r4', label: 'Cliente D', amount: 15000, date: d(70) },
      { id: 'r5', label: 'Cliente E', amount: 11000, date: d(82) },
    ],
    payments: [
      { id: 'p1', label: 'Salários', amount: 14200, date: d(6) },
      { id: 'p2', label: 'Fornecedor principal', amount: 9600, date: d(18) },
      { id: 'p3', label: 'Renda e serviços', amount: 3100, date: d(28) },
      { id: 'p4', label: 'Salários', amount: 14200, date: d(36) },
      { id: 'p5', label: 'Impostos', amount: 4800, date: d(48) },
      { id: 'p6', label: 'Salários', amount: 14200, date: d(66) },
    ],
    invoices: [
      { id: 'i1', label: 'Cliente A', amount: 12500, due: d(-5), delay: 15 },
      { id: 'i2', label: 'Cliente B', amount: 7800, due: d(20), delay: 18 },
      { id: 'i3', label: 'Cliente C', amount: 9400, due: d(40), delay: 15 },
      { id: 'i4', label: 'Cliente D', amount: 15000, due: d(50), delay: 20 },
      { id: 'i5', label: 'Cliente E', amount: 11000, due: d(70), delay: 12 },
    ],
    order: { cost: 22000, costDate: d(7), value: 31000, receiptDate: d(75) },
    rate: 8,
  }
}

/** Ponto de partida quando o visitante prefere introduzir os seus valores do zero. */
export function emptyInputs(start = today()): Inputs {
  const d = (n: number) => inDays(n, start)
  return {
    balance: 0,
    receipts: [{ id: 'r1', label: '', amount: 0, date: d(15) }],
    payments: [{ id: 'p1', label: '', amount: 0, date: d(10) }],
    invoices: [{ id: 'i1', label: '', amount: 0, due: d(15), delay: 0 }],
    order: { cost: 0, costDate: d(7), value: 0, receiptDate: d(60) },
    rate: 0,
  }
}

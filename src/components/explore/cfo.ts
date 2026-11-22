/**
 * Leitura de CFO da simulação: diagnóstico, análise escrita, cálculos explicados,
 * recomendações priorizadas com impacto e plano de ação.
 * Regras determinísticas sobre os valores introduzidos — não é inteligência
 * artificial e não promete resultados; os impactos são recalculados pelo motor.
 */
import { simulate } from '@/lib/explore/monthly'
import type { Deep, MonthlyInputs, Result } from '@/lib/explore/monthly'
import type { Fmt } from './Simulator'
import type { Lang } from './content'

export type Level = 'ok' | 'watch' | 'risk'
export type Rec = { priority: 'high' | 'medium'; title: string; why: string; impact: string }
export type Step = { when: string; action: string; owner: string; kpi: string; target: string }
export type Cfo = { level: Level; diagnosis: string; analysis: string[]; calc: { label: string; formula: string }[]; recs: Rec[]; plan: Step[] }

export function buildCfo(inp: MonthlyInputs, r: Result, d: Deep, f: Fmt, lang: Lang): Cfo {
  const L = (pt: string, en: string) => (lang === 'pt' ? pt : en)
  const H = inp.horizon
  const n = (v: number, dec = 1) => v.toLocaleString(lang === 'pt' ? 'pt-PT' : 'en-GB', { maximumFractionDigits: dec })
  const avg = (a: number[]) => a.slice(0, H).reduce((x, y) => x + Math.max(0, y), 0) / H
  const avgIn = avg(inp.receipts)
  const avgOut = inp.hasBalance ? avg(inp.payments) : 0
  const bal = inp.hasBalance
  const dl = r.delayed
  const low = dl.minClosing
  const lowM = f.monthLong(dl.minMonth)
  const below = d.headroom.filter((h) => h < 0).length
  const stress = d.scenarios[2].r.delayed
  const m1drop = r.base.months[0].inflow - dl.months[0].inflow
  const structural = avgIn > 0 && bal ? (avgIn - avgOut) / avgIn : 0
  const daysCash = bal && avgOut > 0 ? inp.balance / (avgOut / 30) : 0

  // Diagnóstico
  const level: Level = !bal ? (d.tied > avgIn * 0.25 ? 'watch' : 'ok') : low < 0 ? 'risk' : below > 0 || stress.minClosing < 0 ? 'watch' : 'ok'
  const diagnosis = !bal
    ? L('Calendário de recebimentos sob pressão: sem saldo e pagamentos, a liquidez não pode ser avaliada.', 'Receipts calendar under pressure: without balance and payments, liquidity cannot be assessed.')
    : level === 'risk'
      ? L(`Tesouraria em risco: o saldo fica negativo em ${lowM}.`, `Cash at risk: the balance turns negative in ${lowM}.`)
      : level === 'watch'
        ? L(`Tesouraria sob pressão: ${below > 0 ? `${below} ${below === 1 ? 'mês' : 'meses'} abaixo da reserva mínima` : 'o cenário de stress leva o saldo abaixo de zero'}.`, `Cash under pressure: ${below > 0 ? `${below} month${below === 1 ? '' : 's'} below the minimum reserve` : 'the stress scenario takes the balance below zero'}.`)
        : L('Tesouraria confortável: a reserva mínima mantém-se em todos os meses.', 'Comfortable cash position: the minimum reserve holds every month.')

  // Análise escrita
  const analysis: string[] = []
  if (bal) {
    analysis.push(
      L(
        `Ponto de partida. O saldo de ${f.money(inp.balance)} cobre ${n(daysCash, 0)} dias de pagamentos. Os recebimentos médios (${f.money(avgIn)} por mês) ${structural >= 0 ? `superam os pagamentos médios (${f.money(avgOut)}) em ${n(structural * 100)}%` : `ficam abaixo dos pagamentos médios (${f.money(avgOut)}): a operação consome ${f.money(avgOut - avgIn)} por mês, mesmo sem atrasos`}.`,
        `Starting point. The ${f.money(inp.balance)} balance covers ${n(daysCash, 0)} days of payments. Average receipts (${f.money(avgIn)} a month) ${structural >= 0 ? `exceed average payments (${f.money(avgOut)}) by ${n(structural * 100)}%` : `fall short of average payments (${f.money(avgOut)}): operations consume ${f.money(avgOut - avgIn)} a month, even without delays`}.`,
      ),
    )
  } else {
    analysis.push(L(`Ponto de partida. Estão previstos ${f.money(r.base.totalIn)} de recebimentos em ${H} meses (média de ${f.money(avgIn)} por mês).`, `Starting point. ${f.money(r.base.totalIn)} of receipts are expected over ${H} months (average ${f.money(avgIn)} a month).`))
  }
  analysis.push(
    L(
      `Efeito dos atrasos. Com ${inp.delayShare}% dos valores a chegar ${inp.delayDays} dias mais tarde, o prazo médio de recebimento aumenta ${n(d.dsoIncrease)} dias e ficam ${f.money(d.tied)} presos em clientes. O primeiro mês é o mais afetado: entram menos ${f.money(m1drop)} do que o previsto.`,
      `Effect of delays. With ${inp.delayShare}% of amounts arriving ${inp.delayDays} days later, the average collection period rises by ${n(d.dsoIncrease)} days and ${f.money(d.tied)} is tied up in customers. The first month is hit hardest: ${f.money(m1drop)} less comes in than expected.`,
    ),
  )
  if (bal) {
    analysis.push(
      L(
        `Liquidez. O ponto mais baixo é ${f.money(low)}, em ${lowM}${below > 0 ? `, e o saldo fica abaixo da reserva mínima (${f.money(d.buffer)}) em ${below} de ${H} meses` : ', sempre acima da reserva mínima'}. Num cenário de stress, o mínimo desce para ${f.money(stress.minClosing)}.`,
        `Liquidity. The lowest point is ${f.money(low)}, in ${lowM}${below > 0 ? `, and the balance sits below the minimum reserve (${f.money(d.buffer)}) in ${below} of ${H} months` : ', always above the minimum reserve'}. Under stress, the minimum falls to ${f.money(stress.minClosing)}.`,
      ),
    )
  }
  analysis.push(
    level === 'ok'
      ? L('Conclusão. A posição aguenta os atrasos testados; o foco deve ser manter a disciplina de cobrança e acompanhar os indicadores.', 'Conclusion. The position withstands the delays tested; the focus should be collection discipline and tracking the indicators.')
      : L('Conclusão. O problema é sobretudo de calendário: o dinheiro existe, mas chega depois dos pagamentos. As alavancas mais rápidas são a cobrança e o alinhamento de prazos.', 'Conclusion. The issue is mainly timing: the cash exists but arrives after the payments. The fastest levers are collections and aligning payment terms.'),
  )

  // Como calculámos (com os números)
  const mm = dl.minMonth
  const row = dl.months[mm]
  const lateM1 = Math.max(0, inp.receipts[0]) * (inp.delayShare / 100)
  const calc: Cfo['calc'] = [
    { label: L('Atraso (1.º mês)', 'Delay (month 1)'), formula: `${f.money(inp.receipts[0])} × ${inp.delayShare}% = ${f.money(lateM1)} ${L(`passam ${inp.delayDays} dias para a frente`, `move ${inp.delayDays} days later`)}` },
    { label: L('Prazo médio de recebimento', 'Average collection period'), formula: `${inp.delayShare}% × ${inp.delayDays} ${L('dias', 'days')} = +${n(d.dsoIncrease)} ${L('dias', 'days')}` },
    { label: L('Capital preso em recebimentos', 'Cash tied up in receivables'), formula: `(${f.money(avgIn)} ÷ 30) × ${n(d.dsoIncrease)} = ${f.money(d.tied)}` },
  ]
  if (bal && row) {
    calc.push(
      { label: L(`Saldo final de ${f.month(mm)}`, `${f.month(mm)} closing balance`), formula: `${f.money(row.opening)} + ${f.money(row.inflow)} − ${f.money(row.outflow)} = ${f.money(row.closing)}` },
      { label: L('Reserva mínima', 'Minimum reserve'), formula: `${L('média dos pagamentos', 'average payments')} = ${f.money(d.buffer)}` },
      { label: L('Necessidade de financiamento', 'Funding need'), formula: `${f.money(d.buffer)} − ${f.money(d.buffer + d.minHeadroom)} = ${d.fundingNeed > 0 ? f.money(d.fundingNeed) : f.money(0)}` },
      { label: L('Dias de tesouraria', 'Days of cash'), formula: `${f.money(inp.balance)} ÷ (${f.money(avgOut)} ÷ 30) = ${n(daysCash)} ${L('dias', 'days')}` },
    )
  }

  // Recomendações com impacto recalculado
  const metric = (x: MonthlyInputs) => (bal ? simulate(x).delayed.minClosing : -Math.max(0, ...simulate(x).base.months.map((m, i) => m.inflow - simulate(x).delayed.months[i].inflow)))
  const now = metric(inp)
  const recs: Rec[] = []
  const shareTo = Math.max(0, inp.delayShare - 10)
  if (inp.delayShare > 0 && inp.delayDays > 0) {
    const g = metric({ ...inp, delayShare: shareTo }) - now
    recs.push({
      priority: level === 'ok' ? 'medium' : 'high',
      title: L('Acelerar a cobrança aos clientes que pagam tarde', 'Speed up collection from late-paying customers'),
      why: L(`${inp.delayShare}% dos recebimentos chegam com atraso. Lembretes antes do vencimento, contacto no dia seguinte e condições claras reduzem esta parte.`, `${inp.delayShare}% of receipts arrive late. Reminders before the due date, a call the day after and clear terms reduce this share.`),
      impact: L(`Passar para ${shareTo}% ${bal ? 'melhora o ponto mais baixo em' : 'reduz a maior quebra mensal em'} ${f.money(g)} e liberta ${f.money((avgIn / 30) * (0.1 * inp.delayDays))}.`, `Moving to ${shareTo}% ${bal ? 'improves the lowest point by' : 'reduces the largest monthly drop by'} ${f.money(g)} and frees ${f.money((avgIn / 30) * (0.1 * inp.delayDays))}.`),
    })
  }
  if (inp.delayDays > 15) {
    const g = metric({ ...inp, delayDays: 15 }) - now
    recs.push({
      priority: 'medium',
      title: L('Encurtar os prazos efetivos de recebimento', 'Shorten effective collection terms'),
      why: L(`Um atraso de ${inp.delayDays} dias desloca recebimentos inteiros para o mês seguinte. Desconto de pronto pagamento ou faturação mais cedo encurtam o ciclo.`, `A ${inp.delayDays}-day delay pushes whole receipts into the next month. Early-payment discounts or earlier invoicing shorten the cycle.`),
      impact: L(`Reduzir o atraso para 15 dias ${bal ? 'melhora o ponto mais baixo em' : 'reduz a maior quebra mensal em'} ${f.money(g)}.`, `Reducing the delay to 15 days ${bal ? 'improves the lowest point by' : 'reduces the largest monthly drop by'} ${f.money(g)}.`),
    })
  }
  if (bal && low < 0) {
    recs.push({
      priority: 'high',
      title: L(`Reprogramar pagamentos de ${lowM}`, `Reschedule ${lowM} payments`),
      why: L('Sem ação, os pagamentos previstos ultrapassam o dinheiro disponível nesse mês.', 'Without action, planned payments exceed the cash available that month.'),
      impact: L(`Alinhar ${f.money(-low)} de pagamentos para depois de ${lowM} mantém o saldo positivo.`, `Moving ${f.money(-low)} of payments to after ${lowM} keeps the balance positive.`),
    })
  }
  if (bal && d.fundingNeed > 0) {
    recs.push({
      priority: low < 0 ? 'high' : 'medium',
      title: L('Assegurar uma margem de financiamento de curto prazo', 'Secure a short-term funding buffer'),
      why: L(`A reserva mínima fica a descoberto em ${f.monthLong(d.minHeadroomMonth)}. Negociar antes de precisar sai mais barato e dá margem de decisão.`, `The minimum reserve is uncovered in ${f.monthLong(d.minHeadroomMonth)}. Negotiating before it is needed is cheaper and keeps options open.`),
      impact: L(`Valor de referência: ${f.money(d.fundingNeed)}, disponível até ${f.monthLong(d.minHeadroomMonth)}.`, `Reference amount: ${f.money(d.fundingNeed)}, available by ${f.monthLong(d.minHeadroomMonth)}.`),
    })
  }
  if (bal && structural < 0) {
    recs.push({
      priority: 'high',
      title: L('Rever a estrutura de custos e preços', 'Review cost structure and pricing'),
      why: L('Os pagamentos médios superam os recebimentos médios: mesmo sem atrasos, o saldo desce todos os meses.', 'Average payments exceed average receipts: even without delays, the balance falls every month.'),
      impact: L(`Equilibrar ${f.money(avgOut - avgIn)} por mês trava a perda de caixa.`, `Balancing ${f.money(avgOut - avgIn)} a month stops the cash drain.`),
    })
  }
  recs.push({
    priority: 'medium',
    title: L('Acompanhar a tesouraria todas as semanas', 'Review cash every week'),
    why: L('As grandes consultoras trabalham com previsões semanais a 13 semanas: os desvios aparecem cedo e há tempo para agir.', 'Leading advisers work with weekly 13-week forecasts: deviations show early and there is time to act.'),
    impact: L('Indicadores a seguir: dias de tesouraria, cobertura a 30 dias e recebimentos em atraso.', 'Indicators to track: days of cash, 30-day coverage and overdue receipts.'),
  })
  recs.sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'high' ? -1 : 1))

  // Plano de ação
  const owner = { mgmt: L('Gestão', 'Management'), fin: L('Financeiro', 'Finance'), sales: L('Comercial', 'Sales') }
  const plan: Step[] = []
  if (bal && low < 0) plan.push({ when: L('Esta semana', 'This week'), action: L(`Listar os pagamentos de ${lowM} e acordar novas datas com os fornecedores`, `List ${lowM} payments and agree new dates with suppliers`), owner: owner.mgmt, kpi: L('Saldo previsto do mês', 'Projected month balance'), target: `≥ ${f.money(0)}` })
  if (inp.delayShare > 0 && inp.delayDays > 0) plan.push({ when: L('Esta semana', 'This week'), action: L('Identificar os clientes com maior valor em atraso e contactá-los', 'Identify the customers with the most overdue and contact them'), owner: owner.sales, kpi: L('Recebimentos em atraso', 'Overdue receipts'), target: `${shareTo}%` })
  if (bal && d.fundingNeed > 0) plan.push({ when: L('Próximos 30 dias', 'Next 30 days'), action: L('Pedir propostas de financiamento de curto prazo a pelo menos dois bancos', 'Request short-term funding proposals from at least two banks'), owner: owner.fin, kpi: L('Margem de segurança', 'Safety margin'), target: f.money(d.fundingNeed) })
  plan.push({ when: L('Próximos 30 dias', 'Next 30 days'), action: L('Rever condições de pagamento nas propostas e contratos novos', 'Review payment terms in new proposals and contracts'), owner: owner.sales, kpi: L('Prazo médio de recebimento', 'Average collection period'), target: `−${n(d.dsoIncrease)} ${L('dias', 'days')}` })
  if (bal && structural < 0) plan.push({ when: L('30 a 90 dias', '30 to 90 days'), action: L('Rever custos fixos e preços para equilibrar recebimentos e pagamentos', 'Review fixed costs and prices to balance receipts and payments'), owner: owner.mgmt, kpi: L('Margem líquida de caixa', 'Net cash margin'), target: '≥ 5%' })
  plan.push({ when: L('30 a 90 dias', '30 to 90 days'), action: L('Instituir uma previsão de tesouraria semanal e uma reunião curta de revisão', 'Set up a weekly cash forecast and a short review meeting'), owner: owner.fin, kpi: L('Dias de tesouraria', 'Days of cash'), target: L('≥ 60 dias', '≥ 60 days') })

  return { level, diagnosis, analysis, calc, recs, plan }
}

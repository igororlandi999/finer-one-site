/**
 * Textos da análise completa — estrutura inspirada nas análises de tesouraria das
 * grandes consultoras (previsão direta, margem face a uma reserva mínima, cenários,
 * fundo de maneio, ponte de tesouraria e sensibilidade). PT-PT e EN.
 */
import type { Lang } from './content'

type Fn<A extends unknown[]> = (...a: A) => string

export type ReportText = {
  eyebrow: string
  title: Fn<[string]>
  previewNote: string
  emailNote: string
  print: string
  s1: string
  figLow: string
  figLowSub: Fn<[string]>
  figTied: string
  figTiedSub: Fn<[number]>
  figNeed: string
  figNeedNone: string
  figNeedSub: string
  figMoved: string
  figPushed: string
  findings: {
    low: Fn<[string, string]>
    lowNeg: Fn<[string, string]>
    tied: Fn<[string, number]>
    stress: Fn<[string, string]>
    stressOk: Fn<[string]>
    cal: Fn<[string, string]>
    noBalance: string
  }
  s2: string
  s2Sub: string
  bridge: { opening: string; inflow: string; delay: string; outflow: string; closing: string; receipts: string; late: string; received: string }
  s3: string
  s3Sub: Fn<[string]>
  rows: { opening: string; inflow: string; outflow: string; net: string; closing: string; buffer: string; headroom: string; planned: string; delayed: string; diff: string }
  s4: string
  s4Sub: string
  sc: { base: string; yours: string; stress: string; params: Fn<[number, number]>; low: string; lowMonth: string; end: string; need: string; tied: string; drop: string; pushed: string }
  s5: string
  s5Sub: string
  s5SubCal: string
  share: string
  days: string
  s6: string
  s6Sub: string
  kpi: Record<string, { name: string; how: string }>
  na: string
  lights: Record<'green' | 'amber' | 'red' | 'na', string>
  s7: string
  s7Tag: string
  lever: { share: Fn<[number, string]>; days: Fn<[string]>; buffer: Fn<[string, string]>; noBalance: string; none: string }
  s8: string
  assumptions: string[]
  pioneersTitle: string
  pioneersSub: string
  pioneersCta: string
  again: string
}

const pt: ReportText = {
  eyebrow: 'Análise de tesouraria',
  title: (c) => (c ? `${c} — tesouraria simulada` : 'Tesouraria simulada'),
  previewNote: 'Pré-visualização: o recetor de pedidos ainda não está ativo, por isso nada foi enviado nem guardado.',
  emailNote: 'O envio por email está em preparação. Pode guardar esta análise em PDF.',
  print: 'Guardar em PDF',
  s1: 'Sumário executivo',
  figLow: 'Ponto mais baixo de liquidez',
  figLowSub: (m) => `em ${m}`,
  figTied: 'Capital preso em recebimentos',
  figTiedSub: (d) => `+${d.toLocaleString('pt-PT', { maximumFractionDigits: 1 })} dias no prazo médio de recebimento`,
  figNeed: 'Necessidade máxima de financiamento',
  figNeedNone: 'Nenhuma',
  figNeedSub: 'para manter a reserva mínima no pior mês',
  figMoved: 'Recebimentos que mudam de mês',
  figPushed: 'Recebido depois do período',
  findings: {
    low: (v, m) => `O ponto mais baixo de liquidez é ${v}, em ${m}.`,
    lowNeg: (v, m) => `O saldo fica negativo em ${m}, com um mínimo de ${v}.`,
    tied: (v, d) => `Os atrasos prendem ${v} em recebimentos — o equivalente a mais ${d.toLocaleString('pt-PT', { maximumFractionDigits: 1 })} dias no prazo médio de recebimento.`,
    stress: (v, m) => `Num cenário de stress, o ponto mais baixo desce para ${v}, em ${m}.`,
    stressOk: (v) => `Mesmo em stress, o saldo não desce abaixo de ${v}.`,
    cal: (v, m) => `A maior quebra mensal de recebimentos é de ${v}, em ${m}.`,
    noBalance: 'Sem saldo e pagamentos, a análise fica limitada ao calendário de recebimentos.',
  },
  s2: 'Ponte de tesouraria',
  s2Sub: 'Do saldo de hoje ao saldo no fim do período, com o efeito dos atrasos isolado.',
  bridge: { opening: 'Saldo inicial', inflow: 'Recebimentos previstos', delay: 'Efeito dos atrasos', outflow: 'Pagamentos', closing: 'Saldo final', receipts: 'Previsto', late: 'Atrasado', received: 'Recebido no período' },
  s3: 'Previsão direta e margem de segurança',
  s3Sub: (b) => `Reserva mínima de referência: ${b} (um mês de pagamentos médios).`,
  rows: { opening: 'Saldo inicial', inflow: 'Recebimentos', outflow: 'Pagamentos', net: 'Fluxo líquido', closing: 'Saldo final', buffer: 'Reserva mínima', headroom: 'Margem de segurança', planned: 'Previsto', delayed: 'Com atrasos', diff: 'Diferença' },
  s4: 'Cenários',
  s4Sub: 'O cenário de stress soma 20 pontos à parte atrasada e duplica os dias de atraso (mínimo 30, máximo 120).',
  sc: { base: 'Base', yours: 'O seu cenário', stress: 'Stress', params: (s, d) => (s === 0 ? 'Sem atrasos' : `${s}% · ${d} dias`), low: 'Ponto mais baixo', lowMonth: 'Mês', end: 'Saldo final', need: 'Necessidade de financiamento', tied: 'Capital preso', drop: 'Maior quebra mensal', pushed: 'Recebido depois do período' },
  s5: 'Sensibilidade',
  s5Sub: 'Ponto mais baixo de liquidez para cada combinação de parte atrasada e dias de atraso.',
  s5SubCal: 'Maior quebra mensal de recebimentos para cada combinação de parte atrasada e dias de atraso.',
  share: 'Parte atrasada',
  days: 'Dias de atraso',
  s6: 'Indicadores',
  s6Sub: 'Os mesmos indicadores da área Indicadores da plataforma, calculados com esta simulação.',
  kpi: {
    days: { name: 'Dias de tesouraria', how: 'Saldo ÷ média diária dos pagamentos' },
    cover: { name: 'Cobertura a 30 dias', how: '(Saldo + recebimentos do mês) ÷ pagamentos do mês' },
    margin: { name: 'Margem líquida de caixa', how: 'Fluxo líquido ÷ recebimentos, no mês mais fraco' },
    variation: { name: 'Variação das entradas', how: 'Maior queda de um mês para o seguinte' },
  },
  na: 'Sem dados',
  lights: { green: 'Confortável', amber: 'Atenção', red: 'Crítico', na: '—' },
  s7: 'Alavancas',
  s7Tag: 'Finer Advisor · leitura por regras, não é inteligência artificial',
  lever: {
    share: (to, g) => `Reduzir a parte atrasada para ${to}% melhora o ponto mais baixo em ${g}.`,
    days: (g) => `Encurtar o atraso para 15 dias melhora o ponto mais baixo em ${g}.`,
    buffer: (need, m) => `Para manter a reserva mínima, assegure ${need} até ${m} — por antecipação de recebimentos, reprogramação de pagamentos ou financiamento de curto prazo.`,
    noBalance: 'Indique o saldo e os pagamentos para medir a margem de segurança e a necessidade de financiamento.',
    none: 'Com estes pressupostos, a reserva mínima mantém-se em todos os meses.',
  },
  s8: 'Pressupostos e limitações',
  assumptions: [
    'Valores introduzidos manualmente; sem ligação a bancos nem a faturas.',
    'O atraso aplica-se a partir do primeiro mês; os recebimentos distribuem-se uniformemente em cada mês.',
    'Um valor atrasado sai do mês previsto e entra no mês em que é recebido — nunca é contado duas vezes.',
    'Recebimentos que passam o horizonte ficam fora dos saldos do período.',
    'Capital preso = recebimentos médios diários × aumento do prazo médio de recebimento.',
    'Não inclui impostos, financiamento existente, sazonalidade nem cobranças duvidosas. Não é aconselhamento financeiro.',
  ],
  pioneersTitle: 'Quer acompanhar estes números com os dados reais da sua empresa?',
  pioneersSub: 'Os Finer Pioneers são as primeiras empresas a usar a plataforma.',
  pioneersCta: 'Conhecer os Finer Pioneers',
  again: 'Nova simulação',
}

const en: ReportText = {
  eyebrow: 'Cash analysis',
  title: (c) => (c ? `${c} — simulated cash position` : 'Simulated cash position'),
  previewNote: 'Preview: the request receiver is not active yet, so nothing was sent or stored.',
  emailNote: 'Email delivery is being prepared. You can save this analysis as a PDF.',
  print: 'Save as PDF',
  s1: 'Executive summary',
  figLow: 'Lowest liquidity point',
  figLowSub: (m) => `in ${m}`,
  figTied: 'Cash tied up in receivables',
  figTiedSub: (d) => `+${d.toLocaleString('en-GB', { maximumFractionDigits: 1 })} days on average collection period`,
  figNeed: 'Peak funding need',
  figNeedNone: 'None',
  figNeedSub: 'to keep the minimum reserve in the worst month',
  figMoved: 'Receipts that change month',
  figPushed: 'Received after the period',
  findings: {
    low: (v, m) => `The lowest liquidity point is ${v}, in ${m}.`,
    lowNeg: (v, m) => `The balance turns negative in ${m}, reaching ${v}.`,
    tied: (v, d) => `Delays tie up ${v} in receivables — equal to ${d.toLocaleString('en-GB', { maximumFractionDigits: 1 })} more days on the average collection period.`,
    stress: (v, m) => `Under stress, the lowest point falls to ${v}, in ${m}.`,
    stressOk: (v) => `Even under stress, the balance does not fall below ${v}.`,
    cal: (v, m) => `The largest monthly drop in receipts is ${v}, in ${m}.`,
    noBalance: 'Without balance and payments, the analysis is limited to the receipts calendar.',
  },
  s2: 'Cash bridge',
  s2Sub: 'From today’s balance to the period-end balance, with the effect of delays isolated.',
  bridge: { opening: 'Opening balance', inflow: 'Expected receipts', delay: 'Effect of delays', outflow: 'Payments', closing: 'Closing balance', receipts: 'Expected', late: 'Late', received: 'Received in period' },
  s3: 'Direct forecast and safety margin',
  s3Sub: (b) => `Reference minimum reserve: ${b} (one month of average payments).`,
  rows: { opening: 'Opening', inflow: 'Receipts', outflow: 'Payments', net: 'Net flow', closing: 'Closing', buffer: 'Minimum reserve', headroom: 'Safety margin', planned: 'Expected', delayed: 'With delays', diff: 'Difference' },
  s4: 'Scenarios',
  s4Sub: 'The stress scenario adds 20 points to the late share and doubles the delay (minimum 30, maximum 120 days).',
  sc: { base: 'Base', yours: 'Your scenario', stress: 'Stress', params: (s, d) => (s === 0 ? 'No delays' : `${s}% · ${d} days`), low: 'Lowest point', lowMonth: 'Month', end: 'Closing balance', need: 'Funding need', tied: 'Cash tied up', drop: 'Largest monthly drop', pushed: 'Received after the period' },
  s5: 'Sensitivity',
  s5Sub: 'Lowest liquidity point for each combination of late share and delay.',
  s5SubCal: 'Largest monthly drop in receipts for each combination of late share and delay.',
  share: 'Late share',
  days: 'Days late',
  s6: 'Indicators',
  s6Sub: 'The same indicators as the platform’s Indicators area, calculated with this simulation.',
  kpi: {
    days: { name: 'Days of cash', how: 'Balance ÷ average daily payments' },
    cover: { name: '30-day coverage', how: '(Balance + month receipts) ÷ month payments' },
    margin: { name: 'Net cash margin', how: 'Net flow ÷ receipts, in the weakest month' },
    variation: { name: 'Inflow variation', how: 'Largest drop from one month to the next' },
  },
  na: 'No data',
  lights: { green: 'Comfortable', amber: 'Watch', red: 'Critical', na: '—' },
  s7: 'Levers',
  s7Tag: 'Finer Advisor · rule-based reading, not artificial intelligence',
  lever: {
    share: (to, g) => `Reducing the late share to ${to}% improves the lowest point by ${g}.`,
    days: (g) => `Shortening the delay to 15 days improves the lowest point by ${g}.`,
    buffer: (need, m) => `To keep the minimum reserve, secure ${need} by ${m} — by bringing receipts forward, rescheduling payments or short-term financing.`,
    noBalance: 'Add balance and payments to measure the safety margin and funding need.',
    none: 'With these assumptions, the minimum reserve holds every month.',
  },
  s8: 'Assumptions and limitations',
  assumptions: [
    'Values entered manually; no connection to banks or invoices.',
    'The delay applies from the first month; receipts are spread evenly within each month.',
    'A late amount leaves the expected month and enters the month it is received — never counted twice.',
    'Receipts pushed past the horizon are excluded from the period balances.',
    'Cash tied up = average daily receipts × increase in the average collection period.',
    'Excludes taxes, existing financing, seasonality and doubtful debts. Not financial advice.',
  ],
  pioneersTitle: 'Want to track these numbers with your company’s real data?',
  pioneersSub: 'Finer Pioneers are the first companies to use the platform.',
  pioneersCta: 'Meet the Finer Pioneers',
  again: 'New simulation',
}

export const REPORT: Record<Lang, ReportText> = { pt, en }

/**
 * Dados FICTÍCIOS da demonstração da interface Finer One.
 * Não correspondem a nenhuma empresa, cliente ou fornecedor real.
 * Coerentes entre si e com a secção Compreender/Antecipar/Decidir.
 */
import type { Lang } from '@/i18n/LanguageContext'

export type Kpi = { label: string; value: string; delta: string; positive: boolean; note: string }
export type HomeQuestion = { q: string; a: string }

export type Simulator = {
  label: string
  min: number
  max: number
  step: number
  initial: number
  format: (v: number) => string
  /** Devolve [rótulo, valor] dos dois resultados mostrados. */
  results: (v: number) => [string, string][]
}

export type AdvisorAction = {
  id: string
  area: string
  severity: string
  level: 'critical' | 'high' | 'medium'
  title: string
  summary: string
  value: string
  valueNote: string
  valueTone: 'in' | 'out' | 'neutral'
  stats: [string, string][]
  simulator: Simulator
  shows: string[]
  recs: [string, string][]
  explain: string
}

const eur = (n: number) => {
  const [int, dec] = n.toFixed(2).split('.')
  return '€ ' + int.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + dec
}

const BALANCE = 48320.15

export function getUiData(lang: Lang) {
  const pt = lang === 'pt'

  const shell = {
    nav: pt
      ? ['Finer Home', 'Cashflow', 'Receitas', 'Despesas', 'Clientes e Fornecedores', 'Finer Advisor', 'Chat Financeiro', 'Alertas', 'Por confirmar']
      : ['Finer Home', 'Cash flow', 'Revenue', 'Expenses', 'Customers & Suppliers', 'Finer Advisor', 'Financial Chat', 'Alerts', 'To confirm'],
    settings: pt ? 'Definições' : 'Settings',
    user: pt ? 'Utilizador Demo' : 'Demo User',
    role: pt ? 'Proprietário' : 'Owner',
    company: pt ? 'Empresa Exemplo' : 'Example Company',
    fictitious: pt ? 'Dados fictícios' : 'Fictitious data',
  }

  const home = {
    greeting: pt ? 'Boa tarde.' : 'Good afternoon.',
    period: pt ? 'Período' : 'Period',
    month: pt ? 'Nov 2026' : 'Nov 2026',
    askTitle: pt ? ['O que gostaria de saber sobre a sua ', 'empresa?'] : ['What would you like to know about your ', 'company?'],
    placeholder: 'Ask Finer…',
    historyTitle: pt ? 'Histórico de perguntas' : 'Question history',
    historyEmpty: pt ? 'Escolha uma das perguntas sugeridas para ver a resposta.' : 'Pick one of the suggested questions to see the answer.',
    answerBy: 'Finer One',
    questions: (pt
      ? [
          { q: 'A minha empresa está saudável?', a: 'Sim, com um ponto de atenção. As receitas cresceram 8,1% face ao mês anterior e o resultado mantém-se positivo (€ 17.720). A tesouraria, no entanto, depende da cobrança de € 50.948,60 em faturas em atraso.' },
          { q: 'Qual o maior risco financeiro agora?', a: 'A concentração de valores em atraso: um cliente representa 88,3% do total por receber. Se não forem cobrados nas próximas 6 semanas, o saldo pode ficar abaixo do mínimo de caixa definido.' },
          { q: 'Como está o resultado do mês?', a: 'O resultado do período é de € 17.720, menos 2,3% do que no mês anterior. A descida explica-se sobretudo pelo aumento de 11,6% nas saídas de caixa, com destaque para fornecedores.' },
          { q: 'Quais faturas estão por pagar?', a: 'Tem 9 faturas de fornecedores por pagar, no total de € 21.430. Duas vencem esta semana (€ 4.980). Nenhuma está em atraso.' },
        ]
      : [
          { q: 'Is my company healthy?', a: 'Yes, with one point of attention. Revenue grew 8.1% on last month and the result remains positive (€17,720). Cash, however, depends on collecting €50,948.60 in overdue invoices.' },
          { q: 'What is the biggest financial risk right now?', a: 'Concentration of overdue amounts: one customer accounts for 88.3% of receivables. If they are not collected within 6 weeks, the balance may fall below the defined cash minimum.' },
          { q: 'How is this month’s result?', a: 'The period result is €17,720, 2.3% lower than last month. The drop is mainly explained by an 11.6% increase in cash outflows, especially suppliers.' },
          { q: 'Which invoices are due?', a: 'You have 9 supplier invoices due, totalling €21,430. Two are due this week (€4,980). None are overdue.' },
        ]) as HomeQuestion[],
    briefLabel: 'Finer Brief',
    briefDate: pt ? '9 de novembro de 2026' : '9 November 2026',
    briefTitle: pt ? ['O negócio está a crescer.', 'A tesouraria merece atenção.'] : ['The business is growing.', 'Cash deserves attention.'],
    briefBody: pt
      ? ['A atividade mantém uma evolução positiva, mas existem ', '6 faturas em atraso', ' no valor de ', '€ 50.948,60', '. Um cliente concentra 88,3% deste valor: a sua cobrança é decisiva para a tesouraria.']
      : ['Activity keeps a positive trend, but there are ', '6 overdue invoices', ' worth ', '€50,948.60', '. One customer accounts for 88.3% of it: collecting it is decisive for cash.'],
    priorityLabel: pt ? 'Prioridade de hoje' : 'Today’s priority',
    priority: pt ? 'Recuperar € 50.948,60 em faturas por receber.' : 'Recover €50,948.60 in outstanding invoices.',
    priorityMeta: pt ? '6 faturas em atraso · Prazo sugerido: 15 dias' : '6 overdue invoices · Suggested deadline: 15 days',
    priorityCta: pt ? 'Ver plano de ação' : 'View action plan',
    kpiTitle: pt ? 'Indicadores principais' : 'Key indicators',
    kpiMonth: pt ? 'Novembro de 2026' : 'November 2026',
    vs: pt ? 'vs. mês anterior' : 'vs. last month',
    kpis: (pt
      ? [
          { label: 'Saldo atual', value: eur(BALANCE), delta: '+ € 1.958,40', positive: true, note: 'Liquidez disponível na conta.' },
          { label: 'Entradas de caixa', value: '€ 61.870,00', delta: '+ € 4.637,20', positive: true, note: 'Total de recebimentos do mês.' },
          { label: 'Saídas de caixa', value: '€ 44.150,00', delta: '- € 4.589,10', positive: false, note: 'Total de pagamentos do mês.' },
          { label: 'Resultado do período', value: '€ 17.720,00', delta: '- € 416,80', positive: false, note: 'Lucro após custos e impostos.' },
        ]
      : [
          { label: 'Current balance', value: '€48,320.15', delta: '+ €1,958.40', positive: true, note: 'Liquidity available in the account.' },
          { label: 'Cash in', value: '€61,870.00', delta: '+ €4,637.20', positive: true, note: 'Total received this month.' },
          { label: 'Cash out', value: '€44,150.00', delta: '- €4,589.10', positive: false, note: 'Total paid this month.' },
          { label: 'Period result', value: '€17,720.00', delta: '- €416.80', positive: false, note: 'Profit after costs and taxes.' },
        ]) as Kpi[],
  }

  const advisorActions: AdvisorAction[] = [
    {
      id: 'collect',
      area: pt ? 'Liquidez' : 'Liquidity',
      severity: pt ? 'Crítico' : 'Critical',
      level: 'critical',
      title: pt ? 'Cobrar as faturas em atraso' : 'Collect overdue invoices',
      summary: pt ? '6 faturas em atraso por receber, no total de € 50.948,60.' : '6 overdue invoices to collect, totalling €50,948.60.',
      value: eur(18640),
      valueNote: pt ? '(por receber)' : '(receivable)',
      valueTone: 'in',
      stats: pt ? [[eur(18640), 'Valor identificado'], ['15 dias', 'Prazo sugerido'], ['Crítico', 'Estado']] : [[eur(18640), 'Identified value'], ['15 days', 'Suggested deadline'], ['Critical', 'Status']],
      simulator: {
        label: pt ? 'Percentagem cobrada nos próximos 15 dias' : 'Share collected in the next 15 days',
        min: 0, max: 100, step: 5, initial: 60,
        format: (v) => `${v}%`,
        results: (v) => [
          [pt ? 'Entrada estimada em caixa' : 'Estimated cash in', eur((18640 * v) / 100)],
          [pt ? 'Saldo projetado' : 'Projected balance', eur(BALANCE + (18640 * v) / 100)],
        ],
      },
      shows: pt
        ? ['6 faturas em atraso, no total de € 50.948,60.', 'Atraso médio de 15 dias, a pressionar a liquidez de curto prazo.', 'Um cliente (Cliente A) concentra 88,3% do valor em atraso.', 'A fatura mais antiga venceu há 22 dias.']
        : ['6 overdue invoices totalling €50,948.60.', 'Average delay of 15 days, putting pressure on short-term liquidity.', 'One customer (Customer A) accounts for 88.3% of the overdue amount.', 'The oldest invoice fell due 22 days ago.'],
      recs: pt
        ? [['Contactar o Cliente A e confirmar uma data de pagamento.', 'Enviar lembrete personalizado com as faturas em anexo.'], ['Propor planos de pagamento quando necessário.', 'Para os casos de maior valor.'], ['Acompanhar a evolução das cobranças.', 'Monitorizar semanalmente o estado das faturas.'], ['Rever as condições de crédito.', 'Ajustar prazos para reduzir o risco de novos atrasos.']]
        : [['Contact Customer A and confirm a payment date.', 'Send a personalised reminder with the invoices attached.'], ['Offer payment plans where needed.', 'For the largest cases.'], ['Track collection progress.', 'Review invoice status weekly.'], ['Review credit terms.', 'Adjust terms to reduce the risk of new delays.']],
      explain: pt
        ? 'Esta recomendação surge porque quase todo o valor em atraso (88,3%) depende de um único cliente. Confirmar a data deste pagamento é o passo com mais impacto na tesouraria das próximas semanas.'
        : 'This recommendation appears because almost all of the overdue amount (88.3%) depends on a single customer. Confirming the date of this payment is the step with the most impact on cash in the coming weeks.',
    },
    {
      id: 'payables',
      area: pt ? 'Liquidez' : 'Liquidity',
      severity: pt ? 'Alto' : 'High',
      level: 'high',
      title: pt ? 'Planear pagamentos a fornecedores' : 'Plan supplier payments',
      summary: pt ? '9 faturas por pagar, no total de € 21.430,00.' : '9 invoices due, totalling €21,430.00.',
      value: eur(21430),
      valueNote: pt ? '(a pagar)' : '(payable)',
      valueTone: 'out',
      stats: pt ? [[eur(21430), 'Valor identificado'], ['30 dias', 'Horizonte'], ['Alto', 'Estado']] : [[eur(21430), 'Identified value'], ['30 days', 'Horizon'], ['High', 'Status']],
      simulator: {
        label: pt ? 'Pagamentos não urgentes adiados' : 'Non-urgent payments deferred',
        min: 0, max: 40, step: 5, initial: 20,
        format: (v) => `${v}%`,
        results: (v) => [
          [pt ? 'Valor libertado este mês' : 'Freed up this month', eur((21430 * v) / 100)],
          [pt ? 'Saldo após pagamentos' : 'Balance after payments', eur(BALANCE - 21430 + (21430 * v) / 100)],
        ],
      },
      shows: pt
        ? ['2 faturas vencem esta semana, no total de € 4.980,00.', 'Os pagamentos previstos superam as entradas confirmadas nas próximas 4 semanas.', 'Nenhuma fatura de fornecedor está em atraso.']
        : ['2 invoices are due this week, totalling €4,980.00.', 'Planned payments exceed confirmed inflows over the next 4 weeks.', 'No supplier invoice is overdue.'],
      recs: pt
        ? [['Priorizar pagamentos por data de vencimento.', 'Manter a relação com fornecedores estratégicos.'], ['Negociar prazos com o fornecedor principal.', 'Alinhar pagamentos com as datas de recebimento.'], ['Agendar os pagamentos não urgentes.', 'Distribuir o esforço de caixa ao longo do mês.']]
        : [['Prioritise payments by due date.', 'Protect relationships with strategic suppliers.'], ['Negotiate terms with the main supplier.', 'Align payments with collection dates.'], ['Schedule non-urgent payments.', 'Spread the cash effort across the month.']],
      explain: pt
        ? 'Os pagamentos previstos concentram-se nas próximas semanas, antes da entrada das cobranças. Ajustar o calendário evita picos de pressão sobre a tesouraria sem criar atrasos.'
        : 'Planned payments are concentrated in the coming weeks, before collections arrive. Adjusting the schedule avoids cash pressure peaks without creating delays.',
    },
    {
      id: 'costs',
      area: pt ? 'Custos' : 'Costs',
      severity: pt ? 'Médio' : 'Medium',
      level: 'medium',
      title: pt ? 'Rever subscrições e custos recorrentes' : 'Review subscriptions and recurring costs',
      summary: pt ? '14 subscrições ativas, 4 com utilização reduzida.' : '14 active subscriptions, 4 with low usage.',
      value: eur(1150),
      valueNote: pt ? '(poupança/mês)' : '(savings/month)',
      valueTone: 'neutral',
      stats: pt ? [['€ 1.150,00', 'Poupança potencial/mês'], ['4', 'Subscrições a rever'], ['Médio', 'Estado']] : [['€1,150.00', 'Potential savings/month'], ['4', 'Subscriptions to review'], ['Medium', 'Status']],
      simulator: {
        label: pt ? 'Subscrições canceladas' : 'Subscriptions cancelled',
        min: 0, max: 4, step: 1, initial: 2,
        format: (v) => String(v),
        results: (v) => [
          [pt ? 'Poupança mensal' : 'Monthly savings', eur(287.5 * v)],
          [pt ? 'Poupança anual' : 'Yearly savings', eur(287.5 * v * 12)],
        ],
      },
      shows: pt
        ? ['Os custos com serviços e subscrições cresceram 17% no trimestre.', '4 subscrições tiveram pouca ou nenhuma utilização nos últimos 60 dias.', 'Existem 2 serviços com funções sobrepostas.']
        : ['Services and subscriptions costs grew 17% this quarter.', '4 subscriptions had little or no use in the last 60 days.', 'There are 2 services with overlapping features.'],
      recs: pt
        ? [['Cancelar subscrições sem utilização.', 'Confirmar antes com as equipas.'], ['Consolidar serviços sobrepostos.', 'Manter apenas uma ferramenta por função.'], ['Rever contratos anuais antes da renovação.', 'Negociar condições ou planos inferiores.']]
        : [['Cancel unused subscriptions.', 'Check with the teams first.'], ['Consolidate overlapping services.', 'Keep one tool per function.'], ['Review annual contracts before renewal.', 'Negotiate terms or lower plans.']],
      explain: pt
        ? 'Custos recorrentes pequenos somam-se ao longo do ano. A Finer One compara a despesa de cada serviço com a sua utilização para identificar onde pode poupar sem afetar a operação.'
        : 'Small recurring costs add up over the year. Finer One compares each service’s spend with its usage to find where you can save without affecting operations.',
    },
  ]

  const advisor = {
    updated: pt ? 'Atualizado há 2 horas' : 'Updated 2 hours ago',
    updatedNow: pt ? 'Atualizado agora' : 'Updated just now',
    period: pt ? 'Período' : 'Period',
    periodValue: pt ? 'novembro de 2026 · mês de referência' : 'November 2026 · reference month',
    recalc: pt ? 'Recalcular diagnóstico' : 'Recalculate diagnosis',
    recalcBusy: pt ? 'A recalcular…' : 'Recalculating…',
    sortBy: pt ? 'Ordenar por' : 'Sort by',
    sortValue: pt ? 'Maior impacto' : 'Highest impact',
    identified: pt ? 'Valor identificado' : 'Identified value',
    fullPlan: pt ? 'Ver plano de ação completo' : 'View full action plan',
    simulator: pt ? 'Simulador' : 'Simulator',
    shows: pt ? 'O que os dados mostram' : 'What the data shows',
    recs: pt ? 'Recomendação Finer One' : 'Finer One recommendation',
    explainCta: pt ? 'Explica-me esta análise' : 'Explain this analysis',
    hideExplain: pt ? 'Ocultar explicação' : 'Hide explanation',
    partners: pt ? 'Ver Clientes e Fornecedores' : 'View Customers & Suppliers',
    actions: advisorActions,
  }

  return { shell, home, advisor }
}

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

/**
 * Guia editorial "Falta de liquidez" (16/11/2026) — primeiro de uma série de guias SEO.
 * Modelo reutilizável: cabeçalho editorial, índice fixo (como no aviso de privacidade),
 * quadros explicativos, cartões de sinais (4 campos fixos), tabela de indicadores,
 * bloco da Finer One (Dados → Interpretação → Decisão), CTA Finer Pioneers e fontes.
 *
 * Regras: PT-PT; valores em euros sempre demonstrativos; factos externos com fonte;
 * só capacidades da plataforma já comunicadas no site (acompanhar tesouraria, valores
 * por receber, pagamentos em atraso, alertas) — a previsão está anunciada como "brevemente"
 * no plano Pro, por isso não é apresentada como disponível.
 */
export const GUIDE_UPDATED = { iso: '2026-11-16', label: '16 de novembro de 2026' }

const SECTIONS = [
  { id: 'resumo', title: 'Em resumo' },
  { id: 'lucro-liquidez', title: 'Lucro não é liquidez' },
  { id: 'vender-mais', title: 'Porque vender mais pode apertar a tesouraria' },
  { id: 'sinais', title: 'Os 7 sinais de alerta' },
  { id: 'indicadores', title: 'Os indicadores a consultar' },
  { id: 'medidas', title: 'O que fazer: curto prazo e prevenção' },
  { id: 'apoio', title: 'Quando procurar apoio' },
  { id: 'finer-one', title: 'Onde entra a Finer One' },
  { id: 'fontes', title: 'Fontes' },
]

type Signal = { title: string; happening: ReactNode; indicator: ReactNode; meaning: ReactNode; decision: ReactNode }

const SIGNALS: Signal[] = [
  {
    title: 'As vendas sobem, mas o saldo bancário não acompanha',
    happening: 'A faturação cresce mês após mês, mas o dinheiro disponível fica igual ou desce. O crescimento está a ser pago antes de ser recebido.',
    indicator: 'Prazo médio de recebimentos (PMR) e o total em dívida de clientes, mês a mês.',
    meaning: 'Se o PMR e o valor por receber crescem mais depressa do que as vendas, a empresa está a financiar os clientes com a sua própria tesouraria.',
    decision: 'Rever as condições de pagamento dos novos clientes, faturar logo que o trabalho é entregue e, em projetos longos, negociar adiantamentos ou faturação por fases.',
  },
  {
    title: 'Os clientes pagam cada vez mais tarde',
    happening: 'As faturas vencidas acumulam-se e a equipa passa mais tempo a lembrar pagamentos. Muitas vezes, um ou dois clientes concentram a maior parte do valor.',
    indicator: 'Antiguidade dos saldos de clientes (por vencer, vencido até 30, 31 a 60 e mais de 60 dias) e peso dos maiores clientes no total por receber.',
    meaning: 'Atrasos crescentes ou muito concentrados tornam a tesouraria dependente da decisão de pagamento de poucos clientes.',
    decision: 'Definir um processo de cobrança com datas fixas, contactar antes do vencimento e rever o limite de crédito por cliente. Soluções como o factoring podem ser avaliadas com o banco, comparando o custo.',
  },
  {
    title: 'O dinheiro aperta sempre nos mesmos dias do mês',
    happening: 'O saldo cai a pique quando coincidem salários, IVA, Segurança Social ou pagamentos por conta, mesmo em meses de boas vendas.',
    indicator: 'Uma previsão de tesouraria semana a semana com o calendário fiscal e o saldo mínimo projetado para as próximas semanas.',
    meaning: (
      <>
        Muitas vezes não é um problema de rentabilidade, é de calendário. O IVA faturado não é dinheiro da empresa: no regime geral torna-se exigível quando a fatura é emitida, mesmo que o cliente ainda não tenha pago,<Ref n={1} /> e tem de ser entregue no prazo da declaração periódica.<Ref n={2} />
      </>
    ),
    decision: 'Reservar o IVA e as contribuições numa conta à parte, alinhar as datas de cobrança com as datas de pagamento e preparar os meses de pagamentos por conta com antecedência.',
  },
  {
    title: 'A conta caucionada ou o descoberto estão quase sempre em uso',
    happening: 'O crédito de curto prazo deixou de servir para picos pontuais e passou a pagar despesas correntes, como salários ou fornecedores.',
    indicator: 'Número de dias por mês em que o crédito de curto prazo está utilizado, valor médio utilizado e juros pagos.',
    meaning: 'Utilização permanente sugere uma necessidade estrutural de fundo de maneio, que um crédito pensado para picos não resolve.',
    decision: 'Distinguir uma necessidade pontual de uma necessidade permanente e falar com o banco antes de chegar ao limite. Se for permanente, analisar com o contabilista ou um especialista outras formas de financiamento ou mudanças no modelo de pagamentos e recebimentos.',
  },
  {
    title: 'O stock cresce mais depressa do que as vendas',
    happening: 'O armazém enche-se de produto que demora a sair. Aplica-se a empresas com inventário (comércio, indústria, distribuição).',
    indicator: 'Dias de stock (prazo médio de inventários) e valor do stock sem movimento há muito tempo (por exemplo, mais de 90 dias).',
    meaning: 'Cada euro em stock parado é um euro que não está disponível para pagar compromissos, e o stock pode perder valor.',
    decision: 'Rever quantidades mínimas de encomenda, comprar mais perto da procura e definir um plano para escoar o stock parado.',
  },
  {
    title: 'Os fornecedores encurtam prazos, ou a empresa paga cada vez mais tarde',
    happening: 'Fornecedores pedem pagamento antecipado ou a pronto, ou a empresa adia pagamentos para conseguir chegar ao fim do mês.',
    indicator: 'Prazo médio de pagamentos (PMP) e ciclo de conversão de caixa (PMR + dias de stock − PMP).',
    meaning: 'Um PMP a subir por atraso, e não por negociação, é um sinal de tensão e pode afetar a relação com fornecedores. Um ciclo de conversão de caixa longo significa mais dias em que a empresa financia a própria operação.',
    decision: 'Negociar prazos de forma planeada (não por atraso), alinhar o PMP com o PMR e definir a prioridade dos pagamentos críticos.',
  },
  {
    title: 'As vendas crescem, mas a margem diminui',
    happening: 'Para ganhar volume, a empresa dá mais descontos ou aceita clientes e projetos menos rentáveis. Vende-se mais e sobra menos.',
    indicator: 'Margem bruta por produto, serviço ou cliente e desconto médio concedido.',
    meaning: 'Crescer com margens que não cobrem os custos consome tesouraria em vez de a gerar.',
    decision: 'Rever preços e descontos, identificar os clientes e produtos menos rentáveis e decidir conscientemente onde vale a pena crescer.',
  },
]

const INDICATORS = [
  { name: 'Prazo médio de recebimentos (PMR)', formula: 'Saldo de clientes ÷ Vendas e serviços do período (com IVA) × dias do período', unit: 'dias', question: 'Quantos dias, em média, demoro a receber?', when: 'Mensal' },
  { name: 'Prazo médio de pagamentos (PMP)', formula: 'Saldo de fornecedores ÷ (Compras + fornecimentos e serviços externos do período, com IVA) × dias do período', unit: 'dias', question: 'Quantos dias, em média, demoro a pagar?', when: 'Mensal' },
  { name: 'Dias de stock', formula: 'Inventários ÷ Custo das mercadorias vendidas e matérias consumidas do período × dias do período', unit: 'dias', question: 'Quantos dias de consumo tenho parados em stock?', when: 'Mensal (se houver stock)' },
  { name: 'Ciclo de conversão de caixa', formula: 'PMR + Dias de stock − PMP', unit: 'dias', question: 'Durante quantos dias financio a operação?', when: 'Mensal' },
  { name: 'Liquidez geral', formula: 'Ativo corrente ÷ Passivo corrente', unit: 'rácio (ou %)', question: 'Os recursos de curto prazo cobrem as dívidas de curto prazo?', when: 'Trimestral' },
  { name: 'Saldo mínimo projetado', formula: 'Menor saldo previsto nas próximas semanas: saldo atual + recebimentos previstos − pagamentos previstos, semana a semana', unit: 'euros', question: 'Em que semana o dinheiro pode faltar, e quanto?', when: 'Semanal' },
]

export const SOURCES_CHECKED = '16/11/2026'
const SOURCES = [
  { label: 'Portal das Finanças — Código do IVA, artigo 8.º (exigibilidade do imposto)', href: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/civa_rep/Pages/iva8.aspx' },
  { label: 'Portal das Finanças — Código do IVA, artigos 41.º (periodicidade e entrega da declaração) e 27.º (pagamento)', href: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/civa_rep/Pages/iva27.aspx' },
  { label: 'Portal das Finanças — Regime de IVA de caixa (condições de adesão)', href: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/pages/faqs-00105.aspx' },
  { label: 'gov.pt — Prazo de pagamento das contribuições das entidades empregadoras alargado até ao dia 25 (10/02/2026)', href: 'https://www.gov.pt/noticias/prazo-de-pagamento-das-contribuicoes-das-entidades-empregadoras-alargado-ate-ao-dia-25' },
  { label: 'Portal das Finanças — Código do IRC, artigo 104.º (pagamentos por conta)', href: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/CIRC_2R/Pages/irc104.aspx' },
  { label: 'Banco de Portugal — Empresas não financeiras da Central de Balanços (definições de prazo médio de recebimentos e de pagamentos)', href: 'https://www.bportugal.pt/sites/default/files/anexos/19-empresas_nao_financeiras_cb.pdf' },
  { label: 'Banco de Portugal — Quadros do Setor e Quadros da Empresa e do Setor: metodologia e acesso (junho de 2024)', href: 'https://www.bportugal.pt/sites/default/files/anexos/QS_QES_metologia_apuramento_resultados.pdf' },
]

const EASE = [0.22, 1, 0.36, 1] as const

export function LiquidityGuidePage() {
  const { lang } = useLanguage()
  const active = useActiveSection(SECTIONS.map((s) => s.id))

  return (
    <MotionConfig reducedMotion="user">
      <article lang="pt-PT" aria-labelledby="guia-titulo" className="bg-white pb-24 pt-28 text-navy sm:pt-32 lg:pt-40">
        <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
          {lang === 'en' && (
            <p role="note" className="mb-8 rounded-xl border border-[#0B1030]/[0.08] bg-ice px-4 py-3 text-[14px] text-[#0B1030]/70">
              This guide is written for the Portuguese market and is available in Portuguese only.
            </p>
          )}

          {/* Cabeçalho editorial */}
          <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="border-b border-[#0B1030]/[0.08] pb-10">
            <nav aria-label="Localização" className="text-[13px] text-[#0B1030]/50">
              <ol className="flex flex-wrap items-center gap-2">
                <li><a href="/" className="hover:text-[#070D2B]">Início</a></li>
                <li aria-hidden="true">/</li>
                <li>Guias</li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-[#0B1030]/75">Falta de liquidez</li>
              </ol>
            </nav>
            <p className="mt-8 inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
              <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
              Guia · Tesouraria
            </p>
            <h1 id="guia-titulo" className="mt-6 max-w-[860px] font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] text-[#070D2B] sm:text-[52px] lg:text-[60px]">
              A empresa vende, mas falta dinheiro? <span className="text-accent-deep">7 sinais de falta de liquidez</span>
            </h1>
            <p className="mt-6 max-w-[680px] text-[17px] leading-[1.65] text-[#0B1030]/70 sm:text-[18px]">
              Porque é que uma empresa com vendas e lucro pode ficar sem dinheiro para pagar salários, impostos ou fornecedores — e que números consultar para o perceber a tempo.
            </p>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-[13.5px]">
              <div>
                <dt className="text-[#0B1030]/45">Leitura</dt>
                <dd className="mt-1 font-semibold text-[#070D2B]">13 minutos</dd>
              </div>
              <div>
                <dt className="text-[#0B1030]/45">Atualizado</dt>
                <dd className="mt-1 font-semibold text-[#070D2B]"><time dateTime={GUIDE_UPDATED.iso}>{GUIDE_UPDATED.label}</time></dd>
              </div>
              <div>
                <dt className="text-[#0B1030]/45">Para quem</dt>
                <dd className="mt-1 font-semibold text-[#070D2B]">Empresários e gestores de PME</dd>
              </div>
            </dl>
          </motion.header>

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-20">
            <div className="min-w-0 max-w-[720px] [overflow-wrap:anywhere]">
              <MobileToc />

              {/* Em resumo */}
              <section id="resumo" aria-labelledby="h-resumo" className="scroll-mt-36 lg:scroll-mt-28 rounded-2xl border border-[#0B1030]/[0.08] bg-ice p-6 sm:p-7">
                <h2 id="h-resumo" className="font-display text-[20px] font-bold tracking-[-0.02em] text-[#070D2B]">Em resumo</h2>
                <ul className="mt-4 space-y-3">
                  {[
                    'Lucro e liquidez medem coisas diferentes: uma empresa pode dar lucro e, ainda assim, não ter dinheiro para pagar na data certa.',
                    'Crescer exige tesouraria: se os clientes pagam mais tarde do que a empresa paga, cada venda nova prende dinheiro.',
                    'Este guia reúne sete sinais frequentes de pressão sobre a tesouraria, cada um com um indicador que ajuda a confirmá-lo ou afastá-lo.',
                    'Detetar cedo dá mais opções e mais baratas do que reagir na semana dos salários ou do IVA.',
                  ].map((item) => (
                    <li key={item} className="relative pl-5 text-[15.5px] leading-[1.65] text-[#0B1030]/80">
                      <span aria-hidden="true" className="absolute left-0 top-[10px] h-1.5 w-1.5 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Lucro vs liquidez */}
              <Section id="lucro-liquidez" title="Lucro não é liquidez">
                <P>
                  O lucro diz se a empresa ganha dinheiro com o que vende: é a diferença entre o que fatura e o que custa produzir e vender, num período. A liquidez diz se a empresa tem dinheiro disponível para pagar o que deve, quando deve.
                </P>
                <P>
                  As duas medidas raramente coincidem no tempo. Uma venda conta para o lucro no dia em que é faturada, mas só conta para a tesouraria no dia em que o cliente paga. Pelo meio, a empresa já pagou salários, fornecedores e impostos.
                </P>
                <div className="mt-7 grid overflow-hidden rounded-2xl border border-[#0B1030]/[0.08] sm:grid-cols-2">
                  {[
                    { k: 'Lucro', rows: [['Responde a', 'A empresa ganha dinheiro com o que vende?'], ['Conta quando', 'A venda é faturada e o custo é registado'], ['Onde se vê', 'Demonstração de resultados']] },
                    { k: 'Liquidez', rows: [['Responde a', 'Há dinheiro para pagar o que vence?'], ['Conta quando', 'O dinheiro entra ou sai da conta'], ['Onde se vê', 'Extrato bancário e previsão de tesouraria']] },
                  ].map((col, i) => (
                    <div key={col.k} className={cn('p-6', i === 1 && 'border-t border-[#0B1030]/[0.08] bg-[#F7F9FE] sm:border-l sm:border-t-0')}>
                      <p className="font-display text-[18px] font-bold text-[#070D2B]">{col.k}</p>
                      <dl className="mt-4 space-y-3">
                        {col.rows.map(([a, b]) => (
                          <div key={a}>
                            <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0B1030]/45">{a}</dt>
                            <dd className="mt-1 text-[15px] leading-[1.55] text-[#0B1030]/80">{b}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Exemplo: vender mais */}
              <Section id="vender-mais" title="Porque vender mais pode apertar a tesouraria">
                <P>
                  Imagine uma empresa de serviços que fatura 40 000 € por mês e cujos clientes pagam a 30 dias. Ganha um cliente novo que compra 15 000 € por mês, mas só paga a 60 dias. Os outros clientes continuam a pagar a 30 dias e os custos (salários, fornecedores) continuam a ser pagos todos os meses.
                </P>
                <Example />
                <P>
                  O valor por receber passa de 40 000 € para 70 000 €: mais 30 000 € em faturas emitidas e ainda não pagas. Desses 30 000 €, 27 000 € são custos que a empresa já pagou (90% das vendas); os outros 3 000 € são o lucro, que ainda não entrou. Na prática, nos dois primeiros meses saem 27 000 € de tesouraria sem nenhuma entrada do novo cliente. Com estas hipóteses — e sem outras alterações no negócio — o lucro adicional de 1 500 € por mês só recupera esse valor cerca de 20 meses depois de o cliente entrar.
                </P>
                <P>
                  Com IVA a 23%, o saldo a receber aumenta 36 900 €. E, no regime geral, o IVA de cada fatura torna-se exigível quando ela é emitida,<Ref n={1} /> pelo que a empresa pode ter de o entregar ao Estado antes de o cliente pagar. O regime de IVA de caixa, opcional para volumes de negócios até 2 000 000 €, liga a exigibilidade ao recebimento.<Ref n={3} /> É uma conversa a ter com o contabilista.
                </P>
              </Section>

              {/* Sinais */}
              <Section id="sinais" title="Os 7 sinais de alerta">
                <P>
                  Nenhum destes sinais, sozinho, significa que a empresa está em dificuldades. Servem para fazer a pergunta certa a tempo. Para cada um: o que está a acontecer, o número a consultar, o que esse número pode significar e uma decisão a considerar.
                </P>
                <ol className="mt-8 space-y-6">
                  {SIGNALS.map((s, i) => (
                    <SignalCard key={s.title} n={i + 1} signal={s} />
                  ))}
                </ol>
              </Section>

              {/* Indicadores */}
              <Section id="indicadores" title="Os indicadores a consultar">
                <P>
                  Estes são os números que ajudam a confirmar ou afastar os sinais acima. As fórmulas são versões simplificadas: o contabilista pode usar variações (por exemplo, saldos médios em vez de saldos finais), e o que importa é calcular sempre da mesma forma e acompanhar a evolução. Nos prazos, use vendas e compras do mesmo período do saldo (por exemplo, 12 meses e 365 dias, ou 1 mês e 30 dias).
                </P>
                <IndicatorTable />
                <Callout title="Exemplo demonstrativo: cada dia conta">
                  No exemplo acima, o PMR passa de cerca de 30 para cerca de 39 dias. Com vendas de 55 000 € por mês sem IVA (660 000 € por ano), um dia de vendas vale cerca de 1 800 €. Por isso, receber 10 dias mais cedo reduz o saldo de clientes em cerca de 18 000 €, sem vender mais nada.
                </Callout>
                <P>
                  Nenhum destes números é, sozinho, um diagnóstico. Um PMR de 60 dias pode ser normal num setor e preocupante noutro; uma liquidez geral acima de 1 pode esconder stock difícil de vender ou clientes que não pagam. Leia-os em conjunto, ao longo do tempo e face ao setor.
                </P>
                <P>
                  Para saber se um prazo é alto ou baixo, compare-o com empresas do mesmo setor e dimensão. O Banco de Portugal disponibiliza gratuitamente os Quadros do Setor e, mediante autenticação, os Quadros da Empresa e do Setor, que comparam a sua empresa com o setor.<Ref n={7} /> Para comparar, use as mesmas definições: o Banco de Portugal calcula os prazos médios com 365 dias e com vendas, compras e fornecimentos ajustados de IVA na componente interna, ou seja, com IVA nas operações nacionais e sem IVA nas exportações e importações.<Ref n={6} />
                </P>
              </Section>

              {/* Medidas */}
              <Section id="medidas" title="O que fazer: curto prazo e prevenção">
                <P>Não há uma receita única: as medidas certas dependem do setor, dos clientes e da origem do problema. Estas são as que muitas empresas consideram primeiro.</P>
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <ActionList
                    title="Nas próximas semanas"
                    items={[
                      'Fazer uma lista das entradas e saídas previstas, semana a semana, para as próximas 13 semanas.',
                      'Contactar os clientes com faturas vencidas, começando pelos valores maiores.',
                      'Identificar os pagamentos que não podem falhar (salários, impostos, contribuições) e reservar o dinheiro para eles.',
                      'Falar com o banco e com fornecedores importantes antes do problema, e não depois.',
                      'Adiar despesas e investimentos que não sejam essenciais até a previsão estabilizar.',
                    ]}
                  />
                  <ActionList
                    title="Para prevenir"
                    items={[
                      'Acompanhar o prazo médio de recebimentos e a antiguidade dos saldos todos os meses.',
                      'Definir condições de pagamento antes de aceitar clientes ou projetos grandes.',
                      'Manter uma reserva de tesouraria e separar o IVA e as contribuições do dinheiro disponível.',
                      'Rever preços e margens sempre que os custos mudam.',
                      'Atualizar a previsão de tesouraria pelo menos uma vez por semana.',
                    ]}
                  />
                </div>
                <Callout title="Calendário a ter presente">
                  IVA: a periodicidade é mensal se o volume de negócios do ano anterior foi igual ou superior a 650 000 €, e trimestral abaixo disso. Em ambos os casos, o imposto paga-se até ao dia 25 do 2.º mês seguinte ao mês ou trimestre, com exceção de junho e do 2.º trimestre, que vão até 25 de setembro.<Ref n={2} /> Segurança Social: as contribuições das entidades empregadoras pagam-se até ao dia 25 do mês seguinte.<Ref n={4} /> IRC: para empresas com período de tributação igual ao ano civil, os pagamentos por conta, quando devidos, vencem em julho, setembro e 15 de dezembro.<Ref n={5} /> Os prazos dependem do enquadramento de cada empresa: confirme-os com o contabilista.
                </Callout>
              </Section>

              {/* Apoio */}
              <Section id="apoio" title="Quando procurar apoio">
                <P>Algumas situações justificam falar já com quem acompanha as contas da empresa, em vez de esperar pelo fecho do mês:</P>
                <ul className="mt-5 space-y-3">
                  {[
                    ['Contabilista', 'quando o problema envolve impostos ou contribuições que podem não ser pagos a tempo, ou quando os números da contabilidade e do banco não batem certo. É também quem pode avaliar, quando aplicável, as opções de regularização junto da Autoridade Tributária ou da Segurança Social.'],
                    ['Banco', 'quando a utilização do crédito de curto prazo se tornou permanente ou se aproxima do limite. A conversa corre melhor com uma previsão de tesouraria na mão.'],
                    ['Especialista financeiro', 'quando a falta de liquidez se repete, apesar das medidas de curto prazo, ou quando é preciso reorganizar dívida, preços ou o modelo de recebimentos.'],
                  ].map(([who, text]) => (
                    <li key={who} className="rounded-xl border border-[#0B1030]/[0.08] p-5 text-[15.5px] leading-[1.65] text-[#0B1030]/80">
                      <strong className="font-semibold text-[#070D2B]">{who}:</strong> {text}
                    </li>
                  ))}
                </ul>
                <P>Se os salários ou os impostos das próximas semanas estiverem em risco, a regra é simples: falar antes do vencimento dá quase sempre mais opções do que falar depois.</P>
              </Section>

              {/* Finer One */}
              <Section id="finer-one" title="Onde entra a Finer One">
                <P>
                  A maior parte dos números deste guia já existe na sua empresa — no banco, nas faturas, na contabilidade. O difícil é juntá-los a tempo e perceber o que significam. É para isso que a Finer One está a ser construída.
                </P>
                <ol className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Dados', 'Movimentos bancários e faturas reunidos num só lugar.'],
                    ['Interpretação', 'Valores por receber, prazos, pagamentos em atraso e alertas sobre o que pressiona a tesouraria.'],
                    ['Decisão', 'Perguntas em linguagem simples e um plano de ação por prioridade.'],
                  ].map(([k, v], i) => (
                    <li key={k} className="relative rounded-2xl bg-[#070D2B] p-5 text-white">
                      <span className="text-[12px] font-semibold tabular-nums tracking-[0.18em] text-[#3D86FF]">0{i + 1}</span>
                      <p className="mt-2 font-display text-[18px] font-bold">{k}</p>
                      <p className="mt-2 text-[14px] leading-[1.55] text-white/70">{v}</p>
                    </li>
                  ))}
                </ol>
                <P>
                  A Finer One não substitui o ERP, o banco, o software de faturação, a contabilidade nem o contabilista: é uma camada de inteligência financeira que trabalha sobre esses dados para apoiar decisões. Não garante resultados — ajuda a ver mais cedo.
                </P>

                {/* CTA */}
                <div className="relative mt-10 overflow-hidden rounded-[24px] bg-[#070D2B] p-7 text-white sm:p-9">
                  <img src="/images/sobre-linha.webp" alt="" aria-hidden="true" className="absolute inset-x-0 bottom-[-6%] h-[50%] w-full object-cover object-[80%_50%] opacity-70 mix-blend-screen" style={{ maskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)' }} />
                  <div className="relative">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#3D86FF]">Finer Pioneers</p>
                    <p className="mt-3 font-display text-[26px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[30px]">
                      Quer conhecer a Finer One <span className="text-[#3D86FF]">em primeira mão?</span>
                    </p>
                    <p className="mt-3 max-w-[500px] text-[15px] leading-[1.6] text-white/70">
                      Procuramos empresários que queiram usar a plataforma em primeira mão e ajudar a definir a sua evolução.
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                      <a href="/pioneers/" className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow">
                        Candidatar-me a Finer Pioneer
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                      </a>
                      <a href="/lista-espera/" className="text-[14.5px] font-medium text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white/70">
                        Prefere só acompanhar? Entre na lista de espera
                      </a>
                    </div>
                  </div>
                </div>
              </Section>

              {/* Fontes */}
              <Section id="fontes" title="Fontes">
                <p className="mt-4 text-[13.5px] text-[#0B1030]/55">Fontes consultadas a {SOURCES_CHECKED}.</p>
                <ol className="mt-5 space-y-3">
                  {SOURCES.map((s, i) => (
                    <li key={s.href} id={`fonte-${i + 1}`} className="scroll-mt-24 text-[14.5px] leading-[1.6] text-[#0B1030]/70">
                      <span className="mr-2 font-semibold tabular-nums text-[#070D2B]">[{i + 1}]</span>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline underline decoration-[#0B1030]/20 underline-offset-4 hover:text-[#070D2B] hover:decoration-accent-deep">
                        {s.label}
                        <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ol>
                <p className="mt-8 rounded-xl border border-[#0B1030]/[0.08] bg-[#F7F9FE] p-5 text-[13.5px] leading-[1.6] text-[#0B1030]/60">
                  Este guia é informativo e não constitui aconselhamento financeiro, fiscal ou jurídico. Os valores em euros são demonstrativos. Para decisões sobre a sua empresa, fale com o seu contabilista ou com um especialista.
                </p>
                <div className="mt-10 border-t border-[#0B1030]/[0.08] pt-8">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0B1030]/45">Continue a explorar</p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      ['Como funciona a Finer One', '/#funcionamento'],
                      ['Segurança dos dados', '/#seguranca'],
                      ['Sobre nós', '/sobre/'],
                    ].map(([label, href]) => (
                      <li key={href}>
                        <a href={href} className="group flex h-full items-center justify-between rounded-xl border border-[#0B1030]/[0.08] px-4 py-3.5 text-[14.5px] font-medium text-[#070D2B] transition-colors hover:border-accent-deep/40">
                          {label}
                          <ArrowRight className="h-4 w-4 text-accent-deep transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Section>
            </div>

            {/* Índice fixo */}
            <nav aria-label="Neste guia" className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0B1030]/45">Neste guia</p>
                <ol className="relative mt-5 border-l border-[#0B1030]/10">
                  {SECTIONS.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        aria-current={active === s.id ? 'location' : undefined}
                        className={cn(
                          '-ml-px block border-l-2 py-2 pl-4 text-[14px] leading-snug transition-colors',
                          active === s.id ? 'border-accent font-semibold text-[#070D2B]' : 'border-transparent text-[#0B1030]/55 hover:text-[#070D2B]',
                        )}
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
                <a href="/pioneers/" className="mt-8 inline-flex items-center gap-2 text-[13.5px] font-semibold text-accent-deep hover:text-[#070D2B]">
                  Ser Finer Pioneer
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </nav>
          </div>
        </div>
      </article>
    </MotionConfig>
  )
}

/* ---------- Blocos reutilizáveis do modelo editorial ---------- */

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`h-${id}`} className="scroll-mt-36 pt-14 lg:scroll-mt-28">
      <h2 id={`h-${id}`} className="font-display text-[26px] font-bold leading-[1.15] tracking-[-0.025em] text-[#070D2B] sm:text-[32px]">
        {title}
      </h2>
      {children}
    </section>
  )
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[16.5px] leading-[1.75] text-[#0B1030]/80">{children}</p>
}

function Ref({ n }: { n: number }) {
  return (
    <sup className="ml-0.5">
      <a href={`#fonte-${n}`} aria-label={`Fonte ${n}`} className="font-semibold text-accent-deep no-underline hover:underline">[{n}]</a>
    </sup>
  )
}

function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="mt-7 rounded-2xl border-l-[3px] border-accent bg-[#F3F6FD] px-5 py-5 sm:px-6">
      <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-accent-deep">{title}</p>
      <p className="mt-2 text-[15.5px] leading-[1.7] text-[#0B1030]/80">{children}</p>
    </aside>
  )
}

function Example() {
  const rows = [
    { label: 'Antes', detail: '40 000 €/mês, todos os clientes a 30 dias', receivable: 40000, pmr: '≈ 30 dias' },
    { label: 'Depois', detail: '40 000 €/mês a 30 dias + 15 000 €/mês a 60 dias', receivable: 70000, pmr: '≈ 39 dias' },
  ]
  const max = 70000
  return (
    <figure
      className="mt-7 rounded-2xl border border-[#0B1030]/[0.08] p-5 sm:p-7"
      aria-label="Exemplo com valores demonstrativos, sem IVA: com um cliente novo de 15 000 euros por mês a 60 dias, o valor por receber de clientes passa de 40 000 para 70 000 euros e o prazo médio de recebimentos de cerca de 30 para cerca de 39 dias."
    >
      <figcaption className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-[#0B1030]/50">Exemplo · valores demonstrativos, sem IVA</figcaption>
      <div className="mt-5 space-y-5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[14px]">
              <span className="font-semibold text-[#070D2B]">{r.label}</span>
              <span className="text-[#0B1030]/60">{r.detail}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#0B1030]/[0.06]">
                <div className={cn('h-full rounded-full', r.label === 'Antes' ? 'bg-[#0B1030]/30' : 'bg-accent')} style={{ width: `${(r.receivable / max) * 100}%` }} />
              </div>
              <span className="w-[84px] text-right font-display text-[16px] font-bold tabular-nums text-[#070D2B]">{r.receivable.toLocaleString('pt-PT')} €</span>
            </div>
            <p className="mt-1 text-[12.5px] text-[#0B1030]/50">Valor por receber de clientes no fim de cada mês · PMR {r.pmr}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 border-t border-[#0B1030]/[0.08] pt-5 sm:grid-cols-3">
        {[
          ['+37,5%', 'vendas mensais'],
          ['+1 500 €', 'lucro por mês (margem de 10%)'],
          ['+30 000 €', 'faturas por receber, das quais 27\u00a0000\u00a0€ em custos já pagos'],
        ].map(([v, l], i) => (
          <div key={l}>
            <p className={cn('font-display text-[22px] font-bold tabular-nums', i === 2 ? 'text-accent-deep' : 'text-[#070D2B]')}>{v}</p>
            <p className="mt-0.5 text-[13px] leading-[1.45] text-[#0B1030]/60">{l}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[12.5px] leading-[1.6] text-[#0B1030]/50">
        Hipóteses: faturação no fim de cada mês; os clientes pagam exatamente no prazo; custos iguais a 90% das vendas, pagos no próprio mês; valores sem IVA; PMR calculado com 365 dias.
      </p>
    </figure>
  )
}

function SignalCard({ n, signal }: { n: number; signal: Signal }) {
  const fields: [string, ReactNode][] = [
    ['O que está a acontecer', signal.happening],
    ['Indicador a observar', signal.indicator],
    ['O que pode significar', signal.meaning],
    ['Decisão a considerar', signal.decision],
  ]
  return (
    <li className="overflow-hidden rounded-2xl border border-[#0B1030]/[0.08]">
      <div className="flex items-start gap-4 border-b border-[#0B1030]/[0.08] bg-[#F7F9FE] px-5 py-4 sm:px-6">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#070D2B] font-display text-[14px] font-bold tabular-nums text-white">{n}</span>
        <h3 className="font-display text-[19px] font-bold leading-[1.3] tracking-[-0.015em] text-[#070D2B] sm:text-[21px]">{signal.title}</h3>
      </div>
      <dl className="grid sm:grid-cols-2">
        {fields.map(([label, value], i) => (
          <div key={label} className={cn('px-5 py-4 sm:px-6', i > 0 && 'border-t border-[#0B1030]/[0.06]', i === 1 && 'sm:border-l sm:border-t-0', i === 3 && 'sm:border-l')}>
            <dt className={cn('text-[11.5px] font-semibold uppercase tracking-[0.16em]', i === 3 ? 'text-accent-deep' : 'text-[#0B1030]/45')}>{label}</dt>
            <dd className="mt-1.5 text-[15px] leading-[1.6] text-[#0B1030]/80">{value}</dd>
          </div>
        ))}
      </dl>
    </li>
  )
}

function IndicatorTable() {
  return (
    <div className="mt-7">
      {/* Mobile: cartões */}
      <ul className="space-y-3 md:hidden">
        {INDICATORS.map((r) => (
          <li key={r.name} className="rounded-xl border border-[#0B1030]/[0.08] p-4">
            <p className="font-semibold text-[#070D2B]">{r.name}</p>
            <p className="mt-1 text-[14.5px] text-[#0B1030]/75">{r.question}</p>
            <p className="mt-3 rounded-lg bg-[#F3F6FD] px-3 py-2 font-mono text-[12.5px] text-[#0B1030]/80">{r.formula}</p>
            <p className="mt-2 text-[12.5px] text-[#0B1030]/50">Resultado em {r.unit} · Consultar: {r.when}</p>
          </li>
        ))}
      </ul>
      {/* Desktop: tabela */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#0B1030]/[0.08] md:block">
        <table className="w-full table-fixed text-left text-[14px] [overflow-wrap:normal]">
          <caption className="sr-only">Indicadores de liquidez: pergunta a que respondem, fórmula e frequência</caption>
          <thead className="bg-[#F7F9FE] text-[11.5px] uppercase tracking-[0.14em] text-[#0B1030]/50">
            <tr>
              <th scope="col" className="w-[25%] px-5 py-3 font-semibold">Indicador</th>
              <th scope="col" className="w-[25%] px-5 py-3 font-semibold">Responde a</th>
              <th scope="col" className="px-5 py-3 font-semibold">Fórmula</th>
              <th scope="col" className="w-[18%] px-5 py-3 font-semibold">Consultar</th>
            </tr>
          </thead>
          <tbody>
            {INDICATORS.map((r) => (
              <tr key={r.name} className="border-t border-[#0B1030]/[0.06] align-top">
                <th scope="row" className="px-5 py-4 font-semibold text-[#070D2B]">{r.name}</th>
                <td className="px-5 py-4 text-[#0B1030]/75">{r.question}</td>
                <td className="px-5 py-4 font-mono text-[12.5px] leading-[1.6] text-[#0B1030]/75">{r.formula}</td>
                <td className="px-5 py-4 text-[#0B1030]/60">{r.when}<span className="mt-1 block text-[12px] text-[#0B1030]/45">em {r.unit}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ActionList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-[#0B1030]/[0.08] p-6">
      <h3 className="font-display text-[18px] font-bold text-[#070D2B]">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it} className="relative pl-5 text-[15px] leading-[1.6] text-[#0B1030]/80">
            <span aria-hidden="true" className="absolute left-0 top-[9px] h-1.5 w-1.5 rounded-full bg-accent" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

function MobileToc() {
  return (
    <details className="group mb-8 rounded-2xl border border-[#0B1030]/[0.08] lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[14px] font-semibold text-[#070D2B] [&::-webkit-details-marker]:hidden">
        Neste guia
        <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <ol className="border-t border-[#0B1030]/[0.08] px-5 py-3">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="block py-2 text-[14.5px] text-[#0B1030]/70 hover:text-[#070D2B]">{s.title}</a>
          </li>
        ))}
      </ol>
    </details>
  )
}

/** Secção visível no momento (para destacar no índice). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const onScroll = () => {
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return active
}

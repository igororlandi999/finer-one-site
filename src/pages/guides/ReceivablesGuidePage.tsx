import type { CSSProperties, ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { A, ActionList, Callout, GuideToc, MobileToc, P, PioneersCta, Ref, Section, SourcesBlock, Summary } from './GuideKit'
import type { GuideSection, GuideSource } from './GuideKit'

/**
 * Guia editorial "Prazo médio de recebimentos" (25/11/2026) — segundo guia SEO, no modelo do
 * guia "Falta de liquidez" (blocos em ./GuideKit).
 *
 * Regras: PT-PT; valores em euros sempre demonstrativos (hardcoded, para o HTML pré-renderizado e
 * a hidratação coincidirem); factos externos com fonte. O Explorar só é descrito pelo que o
 * simulador faz (src/components/explore/Simulator.tsx e src/lib/explore/monthly.ts): percentagem
 * de recebimentos com atraso (0–100%), atraso adicional (0–90 dias), horizonte de 3 ou 6 meses e
 * saldo projetado mês a mês com e sem atrasos. Não calcula o PMR da empresa.
 */
export const GUIDE_PUBLISHED = { iso: '2026-11-25', label: '25 de novembro de 2026' }

const SECTIONS: GuideSection[] = [
  { id: 'resumo', title: 'Em resumo' },
  { id: 'o-que-e', title: 'O que é o prazo médio de recebimentos' },
  { id: 'tesouraria', title: 'Porque pesa na tesouraria' },
  { id: 'calcular', title: 'Como calcular o PMR' },
  { id: 'exemplo', title: 'Exemplo numa PME' },
  { id: 'prazo-real', title: 'O prazo real, fatura a fatura' },
  { id: 'pmr-elevado', title: 'O que significa um PMR elevado' },
  { id: 'lei', title: 'Prazo acordado e o que diz a lei' },
  { id: 'reduzir', title: 'Como reduzir o PMR' },
  { id: 'atrasos', title: 'O efeito dos atrasos na tesouraria' },
  { id: 'perguntas', title: 'Perguntas frequentes' },
  { id: 'finer-one', title: 'Onde entra a Finer One' },
  { id: 'fontes', title: 'Fontes' },
]

export const SOURCES_CHECKED = '25/11/2026'
const SOURCES: GuideSource[] = [
  { label: 'Banco de Portugal — Empresas não financeiras da Central de Balanços (definição de prazo médio de recebimentos)', href: 'https://www.bportugal.pt/sites/default/files/anexos/19-empresas_nao_financeiras_cb.pdf' },
  { label: 'Banco de Portugal, BPstat — Prazo médio de recebimentos das empresas não financeiras privadas de pequena e média dimensão (série trimestral)', href: 'https://bpstat.bportugal.pt/serie/12587255' },
  { label: 'Banco de Portugal — Quadros do Setor e Quadros da Empresa e do Setor: metodologia e acesso (junho de 2024)', href: 'https://www.bportugal.pt/sites/default/files/anexos/QS_QES_metologia_apuramento_resultados.pdf' },
  { label: 'Diário da República — Decreto-Lei n.º 62/2013, de 10 de maio (atrasos de pagamento nas transações comerciais)', href: 'https://diariodarepublica.pt/dr/detalhe/decreto-lei/62-2013-261160' },
]

export function ReceivablesGuidePage() {
  const { lang } = useLanguage()

  return (
    <MotionConfig reducedMotion="user">
      <article lang="pt-PT" aria-labelledby="guia-titulo" className="bg-white pb-24 pt-28 text-navy sm:pt-32 lg:pt-40">
        <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
          {lang === 'en' && (
            <p role="note" className="mb-8 rounded-xl border border-[#0B1030]/[0.08] bg-ice px-4 py-3 text-[14px] text-[#0B1030]/70">
              This guide is written for the Portuguese market and is available in Portuguese only.
            </p>
          )}

          {/* Cabeçalho editorial (entrada em CSS, como no guia de falta de liquidez) */}
          <header className="fo-enter border-b border-[#0B1030]/[0.08] pb-10" style={{ '--fo-dur': '0.7s' } as CSSProperties}>
            <nav aria-label="Localização" className="text-[13px] text-[#0B1030]/50">
              <ol className="flex flex-wrap items-center gap-2">
                <li><a href="/" className="hover:text-[#070D2B]">Início</a></li>
                <li aria-hidden="true">/</li>
                <li>Guias</li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-[#0B1030]/75">Prazo médio de recebimentos</li>
              </ol>
            </nav>
            <p className="mt-8 inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
              <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
              Guia · Tesouraria
            </p>
            <h1 id="guia-titulo" className="mt-6 max-w-[860px] font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] text-[#070D2B] sm:text-[52px] lg:text-[60px]">
              Prazo médio de recebimentos: <span className="text-accent-deep">como calcular e reduzir numa PME</span>
            </h1>
            <p className="mt-6 max-w-[680px] text-[17px] leading-[1.65] text-[#0B1030]/70 sm:text-[18px]">
              Quantos dias demora a sua empresa a transformar faturas em dinheiro — como estimar esse número, como medi-lo com mais rigor e o que fazer para receber mais cedo.
            </p>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-[13.5px]">
              <div>
                <dt className="text-[#0B1030]/45">Leitura</dt>
                <dd className="mt-1 font-semibold text-[#070D2B]">13 minutos</dd>
              </div>
              <div>
                <dt className="text-[#0B1030]/45">Publicado</dt>
                <dd className="mt-1 font-semibold text-[#070D2B]"><time dateTime={GUIDE_PUBLISHED.iso}>{GUIDE_PUBLISHED.label}</time></dd>
              </div>
              <div>
                <dt className="text-[#0B1030]/45">Para quem</dt>
                <dd className="mt-1 font-semibold text-[#070D2B]">Empresários e gestores de PME</dd>
              </div>
            </dl>
          </header>

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-20">
            <div className="min-w-0 max-w-[720px] [overflow-wrap:anywhere]">
              <MobileToc sections={SECTIONS} />

              <Summary
                items={[
                  'O prazo médio de recebimentos (PMR) diz quantos dias, em média, a empresa demora a receber o que fatura.',
                  'A fórmula habitual (saldo de clientes ÷ vendas × dias) é uma estimativa a partir da contabilidade: útil para acompanhar a tendência, mas não mede exatamente quanto tempo cada cliente demora a pagar.',
                  'Para saber o prazo real, calcula-se a partir das datas das faturas e dos recebimentos, ponderando pelo valor de cada fatura.',
                  'Cada dia a menos no PMR é dinheiro que deixa de estar parado em clientes. Reduzi-lo começa antes da venda, não só na cobrança.',
                ]}
              />

              {/* O que é */}
              <Section id="o-que-e" title="O que é o prazo médio de recebimentos">
                <P>
                  O prazo médio de recebimentos (PMR) é o número médio de dias entre o momento em que a empresa vende — e fatura — e o momento em que o dinheiro entra na conta. Também aparece como prazo médio de recebimento de clientes ou, em inglês, DSO (<em>days sales outstanding</em>).
                </P>
                <P>
                  É um indicador de atividade, como o prazo médio de pagamentos (PMP), que mede o mesmo do lado dos fornecedores. O Banco de Portugal publica estes dois prazos para as empresas portuguesas, por setor e por dimensão.<Ref n={3} />
                </P>
              </Section>

              {/* Tesouraria */}
              <Section id="tesouraria" title="Porque pesa na tesouraria">
                <P>
                  Enquanto uma fatura não é paga, a empresa já suportou o custo de a gerar — salários, materiais, fornecedores e, muitas vezes, o IVA. Esse dinheiro está &quot;emprestado&quot; ao cliente, sem juros.
                </P>
                <P>
                  Por isso, o PMR liga diretamente as vendas à tesouraria: com as mesmas vendas, um PMR mais alto significa mais dinheiro parado em clientes e menos disponível para pagar os compromissos do mês. É um dos sinais de alerta descritos no{' '}
                  <A href="/guias/falta-de-liquidez/">guia sobre falta de liquidez</A>.
                </P>
                <Callout title="A ideia central">
                  O PMR traduz-se em euros. Um dia de vendas vale, aproximadamente, as vendas do ano a dividir por 365. Encurtar o prazo em alguns dias liberta esse valor multiplicado pelo número de dias — sem vender mais nada.
                </Callout>
              </Section>

              {/* Calcular */}
              <Section id="calcular" title="Como calcular o PMR">
                <P>
                  A forma mais comum usa dois números que a contabilidade já tem: quanto os clientes devem (o saldo de clientes) e quanto a empresa vendeu no mesmo período.
                </P>
                <Formula />
                <P>
                  É a definição usada pelo Banco de Portugal nas estatísticas da Central de Balanços: 365 dias, saldo de clientes e vendas e serviços prestados ajustados de IVA na componente interna.<Ref n={1} /> Antes de calcular, há quatro escolhas que mudam o resultado:
                </P>
                <ul className="mt-6 space-y-4">
                  {[
                    ['IVA nos dois lados.', 'O saldo de clientes inclui o IVA das faturas, porque o cliente deve o valor total. As vendas da demonstração de resultados aparecem sem IVA. Dividir um valor com IVA por outro sem IVA aumenta o PMR em cerca de 23% (à taxa normal). Acrescente o IVA às vendas nacionais; nas exportações, que não têm IVA português, use o valor sem IVA.'],
                    ['Vendas a crédito ou vendas totais.', 'Se uma parte das vendas é paga a pronto (no momento), incluí-la no denominador baixa o PMR. Para medir o prazo dado aos clientes, use só as vendas a crédito, se as conseguir separar; para comparar com o Banco de Portugal, use as vendas totais, como ele faz.'],
                    ['Período e dias do período.', 'Use vendas e dias do mesmo período: 12 meses com 365 dias, ou um trimestre com cerca de 91. Os últimos 12 meses, atualizados todos os meses, suavizam a sazonalidade.'],
                    ['Saldo final ou saldo médio.', 'O saldo de clientes num único dia pode estar inflacionado por um mês forte de faturação. A média dos saldos de fim de mês dá uma imagem mais estável.'],
                  ].map(([k, v]) => (
                    <li key={k} className="rounded-xl border border-[#0B1030]/[0.08] p-5 text-[15.5px] leading-[1.65] text-[#0B1030]/80">
                      <strong className="font-semibold text-[#070D2B]">{k}</strong> {v}
                    </li>
                  ))}
                </ul>
                <Callout title="Uma estimativa, não uma medição">
                  Esta fórmula não acompanha nenhuma fatura em concreto. Diz quantos dias de vendas estão, em média, por receber. Se as vendas variam muito de mês para mês, ou se há poucos clientes com valores grandes, o resultado pode afastar-se do tempo que os clientes realmente demoram a pagar. Para isso existe o cálculo fatura a fatura, mais abaixo.
                </Callout>
              </Section>

              {/* Exemplo */}
              <Section id="exemplo" title="Exemplo numa PME">
                <P>
                  Imagine uma empresa de distribuição que vende só a outras empresas em Portugal, tudo a crédito, com a condição de pagamento de 30 dias. Nos últimos 12 meses vendeu 1 200 000 € sem IVA — 1 476 000 € com IVA a 23%.
                </P>
                <EstimateExample />
                <P>
                  Com o saldo de clientes no fim do ano (246 000 €), o PMR estimado é de cerca de 61 dias: 246 000 ÷ 1 476 000 × 365. Mas dezembro foi um mês forte, e o saldo desse dia está acima do habitual. Com a média dos 12 saldos de fim de mês (205 000 €), a estimativa desce para cerca de 51 dias.
                </P>
                <P>
                  Se, por engano, dividir o saldo com IVA pelas vendas sem IVA, obtém cerca de 75 dias — 14 dias a mais, só por misturar bases diferentes.
                </P>
                <P>
                  Como interpretar: com a condição de 30 dias, um PMR estimado entre 51 e 61 dias sugere que, em média, os clientes pagam bastante depois do prazo acordado. É um sinal para investigar, não uma conclusão — o passo seguinte é olhar para as faturas.
                </P>
                <Callout title="Quanto vale um dia">
                  Neste exemplo, um dia de vendas vale cerca de 4 044 € (1 476 000 € ÷ 365, com IVA). Reduzir o PMR em 10 dias, com as mesmas vendas, baixa o saldo de clientes em cerca de 40 000 € — dinheiro que passa da conta do cliente para a da empresa.
                </Callout>
              </Section>

              {/* Prazo real */}
              <Section id="prazo-real" title="O prazo real, fatura a fatura">
                <P>
                  Para saber quanto tempo os clientes demoram de facto a pagar, use as datas: para cada fatura recebida num período, conte os dias entre a emissão e o recebimento e pondere pelo valor. Uma fatura de 25 000 € paga a 60 dias pesa mais do que uma de 5 000 € paga a 30.
                </P>
                <InvoiceExample />
                <P>
                  A média ponderada pelo valor dá 57 dias; a média simples dos dias dava 52,5, porque trata a fatura de 5 000 € como se valesse tanto como a de 25 000 €. Como todas tinham 30 dias de prazo, o atraso médio ponderado face ao vencimento é de 27 dias.
                </P>
                <TwoMethods />
                <P>
                  Este cálculo só inclui faturas já pagas. Uma fatura antiga que continua por receber não entra na média — e é justamente a mais preocupante. Por isso, junte-lhe sempre a antiguidade dos saldos: quanto está por vencer, vencido até 30 dias, de 31 a 60 e há mais de 60 dias.
                </P>
              </Section>

              {/* PMR elevado */}
              <Section id="pmr-elevado" title="O que significa um PMR elevado">
                <P>
                  &quot;Elevado&quot; depende da referência. Há três comparações úteis:
                </P>
                <ul className="mt-6 space-y-4">
                  {[
                    ['Com as suas condições de pagamento.', 'Se dá 30 dias e o PMR está nos 55, há cerca de 25 dias de diferença que se explicam por atrasos, por faturação tardia ou por clientes com condições especiais. É a comparação mais útil, porque depende de decisões suas.'],
                    ['Com o próprio histórico.', 'Um PMR que sobe de trimestre para trimestre, com as mesmas condições, é um sinal de alerta mesmo que o valor ainda pareça razoável.'],
                    ['Com o setor.', 'Os prazos variam muito entre setores. O Banco de Portugal disponibiliza gratuitamente os Quadros do Setor e, mediante autenticação, os Quadros da Empresa e do Setor, que comparam a sua empresa com empresas semelhantes.'],
                  ].map(([k, v]) => (
                    <li key={k} className="rounded-xl border border-[#0B1030]/[0.08] p-5 text-[15.5px] leading-[1.65] text-[#0B1030]/80">
                      <strong className="font-semibold text-[#070D2B]">{k}</strong> {v}
                      {k === 'Com o setor.' && <Ref n={3} />}
                    </li>
                  ))}
                </ul>
                <Callout title="Referência nacional">
                  Segundo o Banco de Portugal, o prazo médio de recebimentos das micro, pequenas e médias empresas não financeiras privadas foi de 52 dias no 2.º trimestre de 2026.<Ref n={2} /> É uma média de todos os setores e da metodologia do Banco de Portugal: serve de contexto, não de meta para a sua empresa.
                </Callout>
                <P>
                  Um PMR elevado não significa, sozinho, que a empresa está em dificuldades. Mas, combinado com um prazo de pagamento a fornecedores mais curto, quer dizer que a empresa paga antes de receber — e financia essa diferença com a própria tesouraria ou com crédito.
                </P>
              </Section>

              {/* Lei */}
              <Section id="lei" title="Prazo acordado e o que diz a lei">
                <P>
                  O prazo acordado é o que consta da proposta, do contrato ou da fatura. O prazo real é o que o cliente efetivamente demora. A distância entre os dois é o atraso — e a lei portuguesa dá-lhe consequências.
                </P>
                <P>
                  Nas transações comerciais entre empresas, o Decreto-Lei n.º 62/2013 estabelece que:<Ref n={4} />
                </P>
                <ul className="mt-5 space-y-3">
                  {[
                    'o prazo de pagamento não pode exceder 60 dias, salvo disposição expressa em contrário no contrato, desde que essa cláusula não seja manifestamente abusiva (artigos 4.º, n.º 5, e 8.º);',
                    'se o contrato não fixar data ou prazo, os juros de mora vencem-se, em regra, 30 dias depois de o cliente receber a fatura (artigo 4.º, n.º 3);',
                    'em caso de atraso, o credor tem direito a juros de mora a partir do dia seguinte ao vencimento, sem necessidade de interpelação, à taxa do Código Comercial ou à acordada entre as partes (artigo 4.º, n.os 1 e 2);',
                    'quando se vencem juros de mora, o credor tem ainda direito a uma indemnização mínima de 40 € pelos custos de cobrança (artigo 7.º).',
                  ].map((it) => (
                    <li key={it} className="relative pl-5 text-[15.5px] leading-[1.65] text-[#0B1030]/80">
                      <span aria-hidden="true" className="absolute left-0 top-[10px] h-1.5 w-1.5 rounded-full bg-accent" />
                      {it}
                    </li>
                  ))}
                </ul>
                <P>
                  Quando o cliente é uma entidade pública, as regras são mais apertadas: em regra, 30 dias, e nunca mais de 60 (artigo 5.º). Conhecer estes direitos ajuda a negociar condições; exercê-los é uma decisão comercial a tomar caso a caso. Para situações concretas, fale com o seu advogado ou contabilista.
                </P>
              </Section>

              {/* Reduzir */}
              <Section id="reduzir" title="Como reduzir o PMR">
                <P>
                  Parte do PMR decide-se antes da venda, parte no momento da fatura e só a última parte na cobrança. As medidas abaixo são as que muitas PME consideram primeiro; as certas dependem do setor e dos clientes.
                </P>
                <div className="mt-7 grid gap-5 md:grid-cols-3">
                  <ActionList
                    title="Antes de vender"
                    items={[
                      'Deixar o prazo e a forma de pagamento escritos na proposta ou na encomenda.',
                      'Definir um limite de crédito por cliente e rever os clientes que o ultrapassam.',
                      'Em projetos longos, negociar adiantamentos ou faturação por fases.',
                    ]}
                  />
                  <ActionList
                    title="Ao faturar"
                    items={[
                      'Faturar no dia em que o trabalho é entregue: cada dia sem fatura soma-se ao prazo.',
                      'Garantir que a fatura tem tudo o que o cliente pede (por exemplo, o número da encomenda), para não ser devolvida.',
                      'Enviá-la à pessoa certa, com a data de vencimento e os dados de pagamento bem visíveis.',
                    ]}
                  />
                  <ActionList
                    title="Depois do vencimento"
                    items={[
                      'Lembrar o cliente alguns dias antes do vencimento e contactá-lo no dia seguinte, se não pagar.',
                      'Rever todas as semanas a lista de faturas vencidas, começando pelos valores maiores.',
                      'Acordar por escrito um plano de pagamento quando o cliente não consegue pagar tudo.',
                    ]}
                  />
                </div>
                <Callout title="Antes de oferecer descontos, faça a conta">
                  Um desconto de pronto pagamento ou o factoring podem encurtar o prazo, mas têm custo. Numa conta simples, um desconto de 2% para receber 30 dias mais cedo equivale a cerca de 24% ao ano (2% × 12). Compare sempre com o custo do crédito de curto prazo que a empresa já paga.
                </Callout>
              </Section>

              {/* Atrasos */}
              <Section id="atrasos" title="O efeito dos atrasos na tesouraria">
                <P>
                  Um atraso não muda as vendas nem o lucro: muda o mês em que o dinheiro entra. Se uma parte dos recebimentos passa para o mês seguinte, o saldo desse mês desce, mesmo que os pagamentos continuem iguais.
                </P>
                <P>
                  Há uma conta aproximada útil: se uma percentagem dos recebimentos chega um certo número de dias mais tarde, o PMR sobe cerca de percentagem × dias. No exemplo da distribuidora, se 40% dos recebimentos chegarem 30 dias depois do habitual, o PMR sobe cerca de 12 dias — perto de 48 500 € a mais parados em clientes (12 × 4 044 €).
                </P>
                <ExploreCta />
              </Section>

              {/* FAQ */}
              <Section id="perguntas" title="Perguntas frequentes">
                <div className="mt-6 divide-y divide-[#0B1030]/[0.08] rounded-2xl border border-[#0B1030]/[0.08]">
                  {FAQ.map(([q, a]) => (
                    <details key={q} className="group px-5 sm:px-6">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
                        <h3 className="font-display text-[17px] font-bold leading-[1.35] tracking-[-0.01em] text-[#070D2B]">{q}</h3>
                        <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-[#0B1030]/50 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                      </summary>
                      <div className="pb-5 text-[15.5px] leading-[1.7] text-[#0B1030]/80">{a}</div>
                    </details>
                  ))}
                </div>
              </Section>

              {/* Finer One */}
              <Section id="finer-one" title="Onde entra a Finer One">
                <P>
                  Os dados para acompanhar o PMR já existem na sua empresa — nas faturas, no banco, na contabilidade. Só ganham valor quando ajudam a decidir: que cliente contactar esta semana, que condições rever, quando é que o dinheiro vai faltar. É para isso que a Finer One está a ser construída.
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
                <PioneersCta />
              </Section>

              {/* Fontes */}
              <Section id="fontes" title="Fontes">
                <SourcesBlock
                  sources={SOURCES}
                  checked={SOURCES_CHECKED}
                  next={[
                    ['Simular a tesouraria no Explorar', '/explorar/'],
                    ['Guia: 7 sinais de falta de liquidez', '/guias/falta-de-liquidez/'],
                    ['Como funciona a Finer One', '/#funcionamento'],
                  ]}
                />
              </Section>
            </div>

            <GuideToc sections={SECTIONS} />
          </div>
        </div>
      </article>
    </MotionConfig>
  )
}

/* ---------- Blocos próprios deste guia ---------- */

const FAQ: [string, ReactNode][] = [
  [
    'Qual é um bom prazo médio de recebimentos?',
    <>Não há um número certo para todas as empresas. A primeira referência são as suas condições de pagamento: quanto mais perto delas estiver o PMR, melhor. Depois, compare com o seu histórico e com o setor nos Quadros do Setor do Banco de Portugal.<Ref n={3} /></>,
  ],
  [
    'O PMR calcula-se com ou sem IVA?',
    'O saldo de clientes inclui IVA, por isso as vendas também devem incluí-lo nas operações nacionais. Nas exportações, sem IVA português, use o valor sem IVA. O importante é usar a mesma base em cima e em baixo e calcular sempre da mesma forma.',
  ],
  [
    'Devo incluir as vendas a pronto pagamento?',
    'Para medir o prazo que dá aos clientes, não: use só as vendas a crédito, se as conseguir separar. Para comparar com as estatísticas do Banco de Portugal, que usam as vendas totais, inclua-as.',
  ],
  [
    'Que período devo usar?',
    'Os últimos 12 meses com 365 dias, recalculados todos os meses, dão uma tendência estável. Um trimestre reage mais depressa, mas é mais sensível a meses fora do normal.',
  ],
  [
    'Qual é a diferença entre PMR e PMP?',
    <>O PMR mede quanto tempo a empresa demora a receber dos clientes; o prazo médio de pagamentos (PMP), quanto tempo demora a pagar aos fornecedores. Se o PMR for maior do que o PMP, a empresa paga antes de receber e financia a diferença. O <A href="/guias/falta-de-liquidez/#indicadores">guia de falta de liquidez</A> mostra os dois lado a lado.</>,
  ],
  [
    'Um cliente pode impor um prazo de 90 dias?',
    <>Entre empresas, o Decreto-Lei n.º 62/2013 limita o prazo a 60 dias, salvo acordo expresso no contrato que não seja manifestamente abusivo.<Ref n={4} /> Na prática, a força negocial conta; conhecer a regra ajuda a discutir as condições antes de aceitar.</>,
  ],
]

function Formula() {
  const parts = [
    ['Saldo de clientes', 'O que os clientes devem no fim do período (com IVA), ou a média dos saldos de fim de mês.'],
    ['Vendas do período', 'Vendas e serviços faturados no mesmo período, com IVA nas operações nacionais.'],
    ['Dias do período', '365 para 12 meses; cerca de 91 para um trimestre.'],
  ]
  return (
    <figure className="mt-7 overflow-hidden rounded-2xl border border-[#0B1030]/[0.08]" aria-label="Fórmula do prazo médio de recebimentos: saldo de clientes a dividir pelas vendas do período, a multiplicar pelos dias do período.">
      <div className="bg-[#070D2B] px-5 py-7 text-center text-white sm:px-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#3D86FF]">Prazo médio de recebimentos (estimativa)</p>
        <p className="mt-4 font-display text-[22px] font-bold leading-[1.35] tracking-[-0.01em] sm:text-[28px]">
          PMR ≈ <span className="whitespace-nowrap">Saldo de clientes</span> ÷ <span className="whitespace-nowrap">Vendas do período</span> × <span className="whitespace-nowrap">Dias do período</span>
        </p>
      </div>
      <dl className="grid sm:grid-cols-3">
        {parts.map(([k, v], i) => (
          <div key={k} className={cn('px-5 py-4 sm:px-6', i > 0 && 'border-t border-[#0B1030]/[0.06] sm:border-l sm:border-t-0')}>
            <dt className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-accent-deep">{k}</dt>
            <dd className="mt-1.5 text-[14.5px] leading-[1.55] text-[#0B1030]/75">{v}</dd>
          </div>
        ))}
      </dl>
    </figure>
  )
}

function EstimateExample() {
  const rows = [
    { label: 'Saldo médio dos 12 meses', calc: '205 000 € ÷ 1 476 000 € × 365', days: 51, tone: 'bg-accent' },
    { label: 'Saldo no fim do ano', calc: '246 000 € ÷ 1 476 000 € × 365', days: 61, tone: 'bg-accent/60' },
    { label: 'Erro: saldo com IVA ÷ vendas sem IVA', calc: '246 000 € ÷ 1 200 000 € × 365', days: 75, tone: 'bg-[#0B1030]/25' },
  ]
  const max = 80
  return (
    <figure
      className="mt-7 rounded-2xl border border-[#0B1030]/[0.08] p-5 sm:p-7"
      aria-label="Exemplo com valores demonstrativos: com vendas de 1 476 000 euros com IVA e condição de 30 dias, o PMR estimado é de cerca de 51 dias com o saldo médio, 61 dias com o saldo de fim de ano, e 75 dias se se misturar saldo com IVA e vendas sem IVA."
    >
      <figcaption className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-[#0B1030]/50">Exemplo · valores demonstrativos</figcaption>
      <div className="relative mt-6 space-y-5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[14px]">
              <span className="font-semibold text-[#070D2B]">{r.label}</span>
              <span className="font-mono text-[12.5px] text-[#0B1030]/55">{r.calc}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[#0B1030]/[0.06]">
                <div className={cn('h-full rounded-full', r.tone)} style={{ width: `${(r.days / max) * 100}%` }} />
                <span aria-hidden="true" className="absolute inset-y-0 w-px bg-[#070D2B]" style={{ left: `${(30 / max) * 100}%` }} />
              </div>
              <span className="w-[72px] text-right font-display text-[16px] font-bold tabular-nums text-[#070D2B]">≈ {r.days} dias</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-[12.5px] text-[#0B1030]/55">
        <span aria-hidden="true" className="inline-block h-3 w-px bg-[#070D2B]" />
        Linha vertical: condição de pagamento acordada (30 dias)
      </p>
      <p className="mt-4 text-[12.5px] leading-[1.6] text-[#0B1030]/50">
        Hipóteses: vendas só em Portugal, todas a crédito, IVA a 23%; vendas dos últimos 12 meses de 1 200 000 € sem IVA (1 476 000 € com IVA); saldo de clientes com IVA.
      </p>
    </figure>
  )
}

const INVOICES = [
  { n: 'Fatura 1', value: '10 000 €', issued: '2 set.', paid: '2 out.', days: 30 },
  { n: 'Fatura 2', value: '25 000 €', issued: '5 set.', paid: '4 nov.', days: 60 },
  { n: 'Fatura 3', value: '5 000 €', issued: '15 set.', paid: '15 out.', days: 30 },
  { n: 'Fatura 4', value: '10 000 €', issued: '20 set.', paid: '19 dez.', days: 90 },
]

function InvoiceExample() {
  return (
    <figure className="mt-7" aria-label="Exemplo com quatro faturas, todas com prazo de 30 dias. Média ponderada pelo valor: 57 dias. Média simples: 52,5 dias. Atraso médio ponderado face ao vencimento: 27 dias.">
      {/* Mobile: cartões */}
      <ul className="space-y-3 md:hidden">
        {INVOICES.map((r) => (
          <li key={r.n} className="flex items-center justify-between rounded-xl border border-[#0B1030]/[0.08] p-4">
            <div>
              <p className="font-semibold text-[#070D2B]">{r.n} · {r.value}</p>
              <p className="mt-1 text-[13px] text-[#0B1030]/60">Emitida a {r.issued} · recebida a {r.paid}</p>
            </div>
            <span className="font-display text-[18px] font-bold tabular-nums text-[#070D2B]">{r.days} dias</span>
          </li>
        ))}
      </ul>
      {/* Desktop: tabela */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#0B1030]/[0.08] md:block">
        <table className="w-full text-left text-[14px]">
          <caption className="sr-only">Faturas do exemplo: valor, datas de emissão e de recebimento e dias até receber</caption>
          <thead className="bg-[#F7F9FE] text-[11.5px] uppercase tracking-[0.14em] text-[#0B1030]/50">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Fatura</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Valor</th>
              <th scope="col" className="px-5 py-3 font-semibold">Emitida</th>
              <th scope="col" className="px-5 py-3 font-semibold">Recebida</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Dias</th>
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((r) => (
              <tr key={r.n} className="border-t border-[#0B1030]/[0.06]">
                <th scope="row" className="px-5 py-3.5 font-semibold text-[#070D2B]">{r.n}</th>
                <td className="px-5 py-3.5 text-right tabular-nums text-[#0B1030]/80">{r.value}</td>
                <td className="px-5 py-3.5 text-[#0B1030]/70">{r.issued}</td>
                <td className="px-5 py-3.5 text-[#0B1030]/70">{r.paid}</td>
                <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-[#070D2B]">{r.days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-4 rounded-2xl bg-[#F3F6FD] p-5 sm:grid-cols-3 sm:p-6">
        {[
          ['57 dias', 'média ponderada pelo valor', '(10 000 × 30 + 25 000 × 60 + 5 000 × 30 + 10 000 × 90) ÷ 50 000'],
          ['52,5 dias', 'média simples dos dias', '(30 + 60 + 30 + 90) ÷ 4'],
          ['27 dias', 'atraso médio ponderado', '57 − 30 dias de prazo acordado'],
        ].map(([v, l, f], i) => (
          <div key={l}>
            <p className={cn('font-display text-[22px] font-bold tabular-nums', i === 0 ? 'text-accent-deep' : 'text-[#070D2B]')}>{v}</p>
            <p className="mt-0.5 text-[13px] leading-[1.45] text-[#0B1030]/70">{l}</p>
            <p className="mt-1.5 font-mono text-[11.5px] leading-[1.5] text-[#0B1030]/50">{f}</p>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-[12.5px] leading-[1.6] text-[#0B1030]/50">Exemplo · valores demonstrativos · todas as faturas com prazo de 30 dias</figcaption>
    </figure>
  )
}

function TwoMethods() {
  const cols = [
    { k: 'Estimativa pelo saldo', rows: [['Usa', 'Saldo de clientes e vendas do período'], ['Responde a', 'Quantos dias de vendas estão por receber?'], ['Bom para', 'Acompanhar a tendência e comparar com o setor'], ['Limitação', 'Sensível a meses fortes e a vendas irregulares']] },
    { k: 'Prazo real pelas faturas', rows: [['Usa', 'Datas de emissão e de recebimento de cada fatura'], ['Responde a', 'Quanto tempo os clientes demoram de facto a pagar?'], ['Bom para', 'Ver atrasos por cliente e face ao prazo acordado'], ['Limitação', 'Só conta faturas pagas: junte a antiguidade dos saldos']] },
  ]
  return (
    <div className="mt-7 grid overflow-hidden rounded-2xl border border-[#0B1030]/[0.08] sm:grid-cols-2">
      {cols.map((col, i) => (
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
  )
}

/** CTA do Explorar: descreve só o que o simulador faz (ver comentário no topo do ficheiro). */
function ExploreCta() {
  return (
    <aside aria-labelledby="explorar-cta" className="mt-8 rounded-[24px] border border-[#0B1030]/[0.08] bg-[linear-gradient(180deg,#F7F9FE_0%,#FFFFFF_100%)] p-6 sm:p-8">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-accent-deep">Explorar · simulador de tesouraria</p>
      <p id="explorar-cta" className="mt-3 font-display text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-[#070D2B] sm:text-[26px]">
        Veja como diferentes atrasos podem afetar a tesouraria da sua empresa.
      </p>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.65] text-[#0B1030]/70">
        Indique o saldo, os recebimentos e os pagamentos previstos, que parte dos recebimentos chega com atraso e quantos dias mais tarde. O Explorar mostra, mês a mês, o saldo projetado com e sem esses atrasos, para 3 ou 6 meses. Não calcula o PMR da sua empresa: mostra o efeito dos atrasos no dinheiro disponível. É gratuito e não pede ligação ao banco.
      </p>
      <a href="/explorar/" className="group mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#070D2B] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow">
        Simular atrasos no Explorar
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
      </a>
    </aside>
  )
}

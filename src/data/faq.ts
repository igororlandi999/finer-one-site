/**
 * Perguntas frequentes — fase 9.
 *
 * REGRAS SEGUIDAS NA ESCRITA, deliberadamente:
 *
 * - nenhuma integração é dada como disponível; a linguagem é sempre de
 *   conceção ("foi pensada para", "pretende", "foi concebida para");
 * - nenhum banco, ERP ou software é nomeado;
 * - nenhuma característica técnica de segurança é afirmada (sem RBAC,
 *   read-only, MFA, SSO, logs, cifragem, certificações, residência de dados);
 * - nenhuma política comercial é inventada: sem período de teste, cartão,
 *   cancelamento, fidelização, reembolso, desconto anual ou preços;
 * - nenhum limite de utilização é referido: sem número de utilizadores,
 *   limites de Chat, de alertas ou de armazenamento;
 * - nenhum compromisso de suporte, SLA ou tempo de implementação;
 * - nenhum limite rígido de dimensão de empresa, faturação ou colaboradores.
 *
 * As respostas da categoria "Planos" foram escritas a partir de
 * src/data/pricing.ts e não devem divergir dela. Se a configuração dos planos
 * mudar, esta categoria tem de ser revista.
 */

export type FaqCategoryId = 'sobre' | 'utilizacao' | 'dados' | 'planos'

export type FaqCategory = { id: FaqCategoryId; label: string }

export type FaqEntry = { question: string; answer: string }

export const faqCategories: FaqCategory[] = [
  { id: 'sobre', label: 'Sobre a Finer One' },
  { id: 'utilizacao', label: 'Utilização' },
  { id: 'dados', label: 'Dados e Confiança' },
  { id: 'planos', label: 'Planos' },
]

export const faq: Record<FaqCategoryId, FaqEntry[]> = {
  sobre: [
    {
      question: 'A Finer One substitui o contabilista?',
      answer:
        'Não. A Finer One foi pensada como uma camada de inteligência financeira para apoiar a gestão da empresa. A contabilidade continua a ter um papel próprio na fiscalidade, conformidade e acompanhamento contabilístico.',
    },
    {
      question: 'A Finer One é um ERP?',
      answer:
        'Não. Um ERP ajuda a gerir e registar operações. A Finer One pretende utilizar informação financeira existente para gerar contexto, análises, previsões e apoio à decisão.',
    },
    {
      question: 'Para que tipo de empresa foi pensada?',
      answer:
        'A Finer One foi pensada para PME que já possuem alguma complexidade financeira e precisam de compreender melhor o desempenho do negócio sem depender apenas de folhas de cálculo ou análises manuais.',
    },
    {
      question: 'Preciso perceber de finanças para utilizar a plataforma?',
      answer:
        'Não é necessário dominar conceitos financeiros avançados. A experiência é pensada para transformar informação financeira em linguagem mais clara e útil para a gestão.',
    },
  ],
  utilizacao: [
    {
      question: 'Como é que a informação entra na Finer One?',
      answer:
        'A Finer One foi concebida para trabalhar com informação proveniente das ferramentas que a empresa já utiliza, como sistemas de faturação, contabilidade, ERP, bancos e folhas de cálculo.',
    },
    {
      question: 'Preciso substituir o software que já utilizo?',
      answer:
        'Não é esse o objetivo. A Finer One pretende acrescentar uma camada de interpretação e inteligência sobre a informação financeira existente, em vez de obrigar a empresa a substituir toda a sua operação.',
    },
    {
      question: 'A Finer One toma decisões pela empresa?',
      answer:
        'Não. A plataforma pretende fornecer contexto, análises, previsões e alertas para apoiar decisões. A decisão continua a pertencer à empresa.',
    },
    {
      question: 'Posso perceber o que está por trás de uma análise ou alerta?',
      answer:
        'A proposta da Finer One é tornar as análises compreensíveis, apresentando contexto e os principais fatores que sustentam uma conclusão sempre que possível.',
    },
  ],
  dados: [
    {
      question: 'Que informação pode ser utilizada nas análises?',
      answer:
        'As análises dependem da informação disponibilizada à plataforma e do contexto financeiro existente. Quanto mais completa e consistente for a informação, maior tende a ser a capacidade de interpretação.',
    },
    {
      question: 'Como é tratado o acesso à informação financeira?',
      answer:
        'O princípio da Finer One é que a empresa mantenha clareza e controlo sobre a informação utilizada pela plataforma.',
    },
    {
      question: 'Consigo perceber quais dados foram considerados numa análise?',
      answer:
        'A Finer One pretende apresentar contexto e fatores relevantes por trás das análises, para que uma resposta não seja tratada como uma caixa-preta.',
    },
    {
      question: 'A empresa mantém o controlo sobre a sua informação?',
      answer:
        'Esse é um princípio central da proposta da Finer One: utilizar informação financeira para gerar inteligência sem retirar à empresa o controlo sobre os seus dados e decisões.',
    },
  ],
  planos: [
    {
      question: 'Qual é a diferença entre Plus, Pro e Team?',
      answer:
        'O Plus reúne a visão financeira essencial: resumo, receitas e despesas, clientes e fornecedores, performance financeira, alertas essenciais e Chat Financeiro. O Pro acrescenta planeamento e cashflow, indicadores, alertas mais avançados e um Chat Financeiro mais completo. O Team acrescenta utilização em equipa e maior profundidade de análise.',
    },
    {
      question: 'Qual plano é mais indicado para começar?',
      answer:
        'O Plus foi pensado como ponto de entrada para empresas que querem ganhar maior clareza financeira. O Pro é indicado quando existe necessidade de maior planeamento, antecipação e profundidade de análise.',
    },
    {
      question: 'Posso mudar de plano mais tarde?',
      answer:
        'Os planos foram estruturados para acompanhar diferentes níveis de necessidade. As condições de alteração entre planos serão apresentadas de forma clara no momento da disponibilização comercial.',
    },
    {
      question: 'O Team é apenas para empresas maiores?',
      answer:
        'Não necessariamente. O Team é direcionado sobretudo para empresas que precisam de utilização colaborativa e maior profundidade de análise, independentemente de existir uma dimensão mínima rígida.',
    },
  ],
}

export const faqCopy = {
  kicker: 'Perguntas frequentes',
  headline: 'Tudo o que precisa de esclarecer antes de começar.',
  subheadline:
    'Encontre respostas rápidas sobre a Finer One, utilização da plataforma, dados e planos.',
}

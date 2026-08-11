/**
 * Perguntas frequentes — fase 9.
 *
 * ESTRUTURA: seis perguntas, num único accordion. As categorias foram
 * removidas por deixarem de acrescentar valor: com seis itens, um tablist
 * obrigava o visitante a procurar em quatro sítios uma resposta que cabe numa
 * lista só.
 *
 * REGRAS SEGUIDAS NA ESCRITA, deliberadamente:
 *
 * - nenhuma integração é dada como disponível; a linguagem é sempre de
 *   conceção ("foi pensada para", "foi concebida para");
 * - nenhum banco, ERP ou software é nomeado;
 * - nenhuma característica técnica de segurança é afirmada — sem SOC 2, ISO,
 *   cifragem, TLS, RGPD, residência de dados ou certificações;
 * - nenhuma política comercial é inventada: sem período de teste, cartão,
 *   cancelamento, fidelização, reembolso ou preços;
 * - nenhum limite numérico de utilização é referido.
 *
 * A última resposta descreve a disponibilidade dos planos e tem de continuar
 * coerente com src/data/pricing.ts. Se a disponibilidade mudar, rever aqui.
 */

export type FaqEntry = { question: string; answer: string }

export const faq: FaqEntry[] = [
  {
    question: 'O que é a Finer One?',
    answer:
      'A Finer One é uma plataforma de inteligência financeira para PME. Analisa os dados financeiros da empresa para identificar o que está a acontecer, antecipar o que vem a seguir e recomendar ações concretas para apoiar melhores decisões.',
  },
  {
    question: 'Como é que a Finer One acede aos dados da minha empresa?',
    answer:
      'A Finer One foi pensada para ligar-se aos sistemas que a empresa já utiliza, como ERP, sistemas de faturação e contas bancárias, reunindo a informação necessária para realizar análises financeiras.',
  },
  {
    question: 'A Finer One substitui o meu contabilista ou diretor financeiro?',
    answer:
      'Não. A Finer One não substitui o contabilista nem a decisão humana. Transforma os dados financeiros em análises, alertas, previsões e recomendações que ajudam empresários e equipas a compreender melhor o negócio e a decidir com mais informação.',
  },
  {
    question: 'Que tipo de respostas posso obter da Finer One?',
    answer:
      'Pode perceber, por exemplo, porque caiu a margem, onde está a perder dinheiro, que custos estão a pressionar o negócio, como poderá evoluir a tesouraria ou quais os clientes que representam maior risco. A Finer One não se limita a mostrar o indicador, procura explicar o que está por trás dele e o que pode ser feito a seguir.',
  },
  {
    question: 'Os dados financeiros da minha empresa estão seguros?',
    answer:
      'A informação da empresa é utilizada para produzir as análises da plataforma, com acesso controlado e proteção dos dados. A empresa mantém o controlo sobre a sua informação.',
  },
  {
    question: 'Como posso começar a utilizar a Finer One?',
    answer:
      'Nesta fase, a Finer One está disponível através do plano Plus, que reúne as funcionalidades essenciais para começar a analisar e acompanhar a situação financeira da sua empresa. Brevemente estarão também disponíveis os planos Pro e Team, com funcionalidades adicionais para empresas com necessidades mais avançadas.',
  },
]

export const faqCopy = {
  kicker: 'Perguntas frequentes',
  headline: 'Tudo o que precisa de esclarecer antes de começar.',
  subheadline:
    'Respostas rápidas sobre o que é a Finer One, como funciona e como pode começar a utilizá-la.',
}

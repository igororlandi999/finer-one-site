/**
 * Conteúdo da secção de processo — como a Finer One chega às respostas.
 *
 * CLAIMS: a etapa 01 descreve intenção de conceção, não integrações em
 * produção. A linguagem é deliberadamente "foi pensada para reunir" e nunca
 * "liga-se automaticamente a". Nenhum fornecedor, ERP ou banco é nomeado.
 *
 * As restantes etapas descrevem o que a plataforma se propõe fazer com a
 * informação, sem afirmar metodologia formal, modelos ou precisão.
 */

export type ProcessStep = {
  /** Numeração visível, sempre com dois dígitos. */
  number: string
  /** Chave em processIcons, no componente. */
  icon: 'ligar' | 'analisar' | 'identificar' | 'antecipar' | 'recomendar'
  title: string
  description: string
}

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    icon: 'ligar',
    title: 'Ligamos os seus dados',
    description:
      'A Finer One foi pensada para reunir informação proveniente dos sistemas que a empresa já utiliza, como ERP, faturação e outras fontes financeiras disponíveis.',
  },
  {
    number: '02',
    icon: 'analisar',
    title: 'Analisamos e cruzamos',
    description:
      'Organizamos movimentos, indicadores e contexto financeiro para perceber o que realmente importa no negócio.',
  },
  {
    number: '03',
    icon: 'identificar',
    title: 'Identificamos o que importa',
    description:
      'Detetamos variações, padrões e sinais relevantes para explicar o que está a acontecer na empresa.',
  },
  {
    number: '04',
    icon: 'antecipar',
    title: 'Antecipamos o que vem a seguir',
    description:
      'Projetamos cenários e tendências para ajudar a antecipar riscos, necessidades e oportunidades.',
  },
  {
    number: '05',
    icon: 'recomendar',
    title: 'Recomendamos o que fazer',
    description:
      'Transformamos a análise em recomendações claras e práticas para apoiar melhores decisões.',
  },
]

export const processCopy = {
  kicker: 'O processo',
  headlineBefore: 'Como a Finer One chega às ',
  headlineHighlight: 'respostas',
  headlineAfter: ' que precisa.',
  subheadline:
    'Transformamos os dados financeiros da sua empresa em clareza, antecipação e ação.',
  outcomeKicker: 'O resultado',
  closingFirst: 'Menos tempo a interpretar números.',
  closingSecond: 'Mais tempo a tomar decisões que fazem avançar o negócio.',
}

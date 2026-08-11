/**
 * Conteúdo da secção de confiança, segurança e transparência.
 *
 * REGRA CRÍTICA: nada aqui afirma tecnologia, infraestrutura, certificação ou
 * conformidade que não esteja documentada no projeto. A secção descreve
 * PRINCÍPIOS e INTENÇÃO DE CONCEÇÃO, com a plataforma explicitamente em
 * desenvolvimento.
 *
 * DELIBERADAMENTE AUSENTES desta secção — não voltar a introduzir sem
 * documentação técnica e jurídica formal:
 *
 *   cifragem nomeada (AES-256), protocolos (TLS 1.2+/1.3), fornecedores de
 *   nuvem (AWS, Azure, GCP), backups, "infraestrutura empresarial", "nível
 *   empresarial", "padrões das maiores empresas", SOC 2, ISO 27001, PCI DSS,
 *   servidores europeus, residência de dados, MFA, SSO, SCIM, RBAC, testes de
 *   intrusão, monitorização 24/7, SLA, uptime, encriptação ponta a ponta,
 *   "cumprimos o RGPD", "100% RGPD compliant", "apenas leitura", "nunca
 *   alteramos os seus dados", "não partilhamos com terceiros", "pode exportar
 *   ou eliminar tudo".
 *
 * O termo "fontes fiáveis" também foi evitado: sugeriria que toda a
 * informação de origem é necessariamente correta.
 *
 * ESTRUTURA: a secção é um mural em três colunas temáticas. Cada coluna tem
 * um rótulo e uma pilha de cards de dois tipos — `panel` (título, texto e,
 * opcionalmente, uma pequena superfície de produto) e `callout` (afirmação
 * curta em três tempos). A posição da superfície muda de coluna para coluna;
 * é isso que faz as alturas desencontrarem-se sem recorrer a masonry.
 */

export type TrustIconId =
  | 'origem'
  | 'controlo'
  | 'explicabilidade'
  | 'contexto'
  | 'protecao'
  | 'privacidade'

export type TrustSurfaceId = 'origem' | 'explicacao' | 'protecao'

export type TrustCard =
  | {
      kind: 'panel'
      id: string
      icon: TrustIconId
      title: string
      body: string
      /** Superfície "quase produto" ancorada a este card. */
      surface?: TrustSurfaceId
    }
  | {
      kind: 'callout'
      id: string
      /** Três tempos curtos. O último é o que fica realçado. */
      lines: string[]
    }

export type TrustColumn = {
  id: string
  label: string
  cards: TrustCard[]
}

export const securityCopy = {
  kicker: 'Confiança',
  headlineFirst: 'Os seus dados merecem proteção.',
  headlineSecond: 'As nossas análises devem ser transparentes.',
  subheadline:
    'A Finer One está a ser desenvolvida para tratar informação financeira com segurança, clareza e responsabilidade, mantendo a empresa no controlo.',
  bandPrinciples: ['Proteção', 'Transparência', 'Controlo'],
  bandNote:
    'Esta secção descreve princípios e intenção de conceção de uma plataforma em desenvolvimento. Não constitui declaração de conformidade nem certificação.',
}

export const trustColumns: TrustColumn[] = [
  {
    id: 'origem',
    label: 'Origem e controlo da informação',
    cards: [
      {
        kind: 'panel',
        id: 'origem-sistemas',
        icon: 'origem',
        title: 'Dados provenientes dos sistemas da empresa',
        body: 'A Finer One liga-se às ferramentas que a empresa já utiliza, como ERP, faturação ou conta bancária, para reunir a informação necessária à análise.',
        surface: 'origem',
      },
      {
        kind: 'panel',
        id: 'origem-controlo',
        icon: 'controlo',
        title: 'A empresa mantém o controlo',
        body: 'A informação é usada para produzir análises e leituras financeiras, com acesso controlado e foco naquilo que é necessário para apoiar a decisão.',
      },
      {
        kind: 'callout',
        id: 'origem-callout',
        lines: ['Finalidade clara.', 'Leitura financeira.', 'Decisões mais conscientes.'],
      },
    ],
  },
  {
    id: 'transparencia',
    label: 'Transparência das análises',
    cards: [
      {
        kind: 'panel',
        id: 'transparencia-explicaveis',
        icon: 'explicabilidade',
        title: 'Análises claras e explicáveis',
        body: 'As leituras da Finer One devem ajudar a perceber o que está a acontecer no negócio, de forma objetiva e compreensível.',
        surface: 'explicacao',
      },
      {
        kind: 'callout',
        id: 'transparencia-callout',
        lines: ['Indicadores com contexto.', 'Leituras com lógica.', 'Recomendações com intenção.'],
      },
      {
        kind: 'panel',
        id: 'transparencia-contexto',
        icon: 'contexto',
        title: 'Menos opacidade, mais contexto',
        body: 'A Finer One não se limita a mostrar indicadores. O objetivo é transformar números em explicações úteis para decidir melhor.',
      },
    ],
  },
  {
    id: 'protecao',
    label: 'Proteção e responsabilidade',
    cards: [
      {
        kind: 'panel',
        id: 'protecao-informacao',
        icon: 'protecao',
        title: 'Proteção da informação',
        body: 'A segurança da informação faz parte da forma como a Finer One está a ser pensada, para que a empresa possa usar a plataforma com confiança.',
        surface: 'protecao',
      },
      {
        kind: 'panel',
        id: 'protecao-privacidade',
        icon: 'privacidade',
        title: 'Privacidade e responsabilidade',
        body: 'A informação da empresa deve servir a análise financeira e apoiar a decisão, sem perder de vista a privacidade, o controlo e a responsabilidade no tratamento dos dados.',
      },
      {
        kind: 'callout',
        id: 'protecao-callout',
        lines: ['Confiança para decidir', 'com mais clareza.'],
      },
    ],
  },
]

/**
 * Superfície de origem: categorias de sistema, nunca fornecedores nem
 * produtos — a mesma regra da secção de posicionamento. Não afirma
 * integrações disponíveis.
 */
export const sourceFlow = {
  label: 'Origem da informação',
  systems: ['ERP', 'Faturação', 'Conta bancária'],
  destination: 'Finer One',
  note: 'Categorias de sistema, não fornecedores nem integrações específicas.',
}

/**
 * Superfície de explicabilidade: um indicador e o que o sustenta.
 * Os valores acompanham os das restantes secções e são demonstrativos.
 */
export const explanation = {
  label: 'Como chegámos a esta leitura?',
  metric: 'Margem operacional',
  value: '7,8%',
  trend: 'Descida no período analisado',
  factorsLabel: 'Fatores considerados',
  factors: [
    'Evolução das receitas',
    'Custos operacionais',
    'Histórico da margem',
    'Período analisado',
  ],
  note: 'Exemplo demonstrativo.',
}

/** Superfície de proteção: princípios, nunca tecnologias nomeadas. */
export const protectionPrinciples = {
  label: 'Princípios de tratamento',
  items: [
    {
      title: 'Acesso controlado',
      description:
        'A informação deve ser acessível apenas no âmbito necessário à utilização da plataforma.',
    },
    {
      title: 'Minimização da informação',
      description: 'Utilização dos dados necessários às análises e funcionalidades previstas.',
    },
    {
      title: 'Tratamento responsável',
      description:
        'Medidas técnicas e organizativas adequadas à sensibilidade da informação financeira.',
    },
  ],
  note: 'Princípios de conceção de uma plataforma em desenvolvimento.',
}

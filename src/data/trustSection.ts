/**
 * Conteúdo da sétima secção — confiança, controlo e transparência.
 *
 * DEMONSTRAÇÃO CONCEPTUAL. Tudo o que aqui aparece descreve a forma como a
 * Finer One pretende comportar-se enquanto camada de inteligência financeira.
 * Nada descreve arquitetura de produção, mecanismos técnicos implementados
 * nem conformidade legal verificada.
 *
 * Regras seguidas na escrita desta copy, deliberadamente:
 *
 * - nenhuma certificação, norma ou auditoria é mencionada;
 * - nenhuma característica técnica de segurança é afirmada;
 * - nenhuma localização de servidores ou residência de dados é referida;
 * - nenhuma conformidade regulamentar é declarada;
 * - as capacidades de acesso e permissões são apresentadas como
 *   representação do que a plataforma deve tornar claro, não como
 *   funcionalidades já existentes.
 *
 * Os valores da análise são mock data, coerentes com os das secções
 * anteriores, e não pertencem a nenhuma empresa real.
 */

export type PrincipleId = 'controlo' | 'transparencia' | 'responsabilidade'

export type Principle = {
  id: PrincipleId
  title: string
  headline: string
  body: string
  /** Etiqueta da zona do painel que este princípio ilumina. */
  region: string
}

export const principles: Principle[] = [
  {
    id: 'controlo',
    title: 'Controlo',
    headline: 'A informação continua a pertencer à empresa.',
    body: 'A Finer One deve tornar claro que informação está disponível para análise e como essa informação é utilizada dentro da plataforma. A informação financeira merece um tratamento proporcional à sua sensibilidade.',
    region: 'Informação disponível',
  },
  {
    id: 'transparencia',
    title: 'Transparência',
    headline: 'Uma análise é mais útil quando se percebe o que a sustenta.',
    body: 'Cada conclusão deve conseguir apresentar os fatores considerados, o período analisado e até quando existe informação. Uma resposta sem origem não é uma resposta.',
    region: 'Fatores considerados',
  },
  {
    id: 'responsabilidade',
    title: 'Responsabilidade',
    headline: 'A plataforma apoia a decisão. Não decide pela empresa.',
    body: 'A inteligência produz contexto, antecipação e clareza. A escolha, o momento e o risco continuam do lado de quem conhece o negócio.',
    region: 'Da informação à decisão',
  },
]

/** Conclusão demonstrada no painel principal. */
export const analysis = {
  module: 'Análise · Margem operacional',
  updatedAt: 'Atualizado até 31 Jul 2026',
  conclusionLabel: 'Conclusão',
  conclusion: 'A margem operacional caiu 7,8% este mês.',
  reading: 'Os custos operacionais estão a pressionar a margem.',
}

/** Fatores que sustentam a conclusão. `share` é só o peso visual da barra. */
export const factors = [
  { label: 'Custos logísticos', value: '+14%', share: 100 },
  { label: 'Fornecedores', value: '+9%', share: 64 },
  { label: 'Preço médio', value: '+1%', share: 12 },
]

export const provenance = [
  { label: 'Período analisado', value: 'Jan — Jul 2026' },
  { label: 'Dados disponíveis até', value: '31 Jul 2026' },
]

/**
 * Representação conceptual do âmbito de informação de uma análise.
 * Não descreve permissões, papéis nem níveis de acesso implementados.
 */
export const dataScope = [
  { label: 'Faturação', state: 'Disponível' },
  { label: 'Contabilidade', state: 'Disponível' },
  { label: 'Tesouraria', state: 'Disponível' },
  { label: 'Documentos', state: 'Disponível' },
]

/** Cadeia da informação até à decisão. O último elo é sempre humano. */
export const responsibilityChain = [
  { label: 'Dados', note: 'Da empresa' },
  { label: 'Análise', note: 'Da Finer One' },
  { label: 'Contexto', note: 'Fatores e período' },
  { label: 'Decisão da empresa', note: 'Sempre humana', human: true },
]

export const boundaries = {
  addsLabel: 'A Finer One acrescenta',
  adds: ['Contexto', 'Análise', 'Antecipação', 'Clareza', 'Apoio à decisão'],
  keepsLabel: 'Não pretende substituir',
  keeps: ['Contabilidade', 'ERP', 'Faturação', 'Gestão da empresa', 'Decisão humana'],
}

export const closing = {
  first: 'A Finer One ajuda a decidir.',
  second: 'A decisão continua a ser sua.',
}

/**
 * Conteúdo da sexta secção — posicionamento.
 *
 * SECÇÃO CONCEPTUAL. Não afirma integrações existentes, não nomeia
 * fornecedores e não usa logótipos de marcas. As entidades em redor do
 * núcleo são categorias de sistema ("Banco", "ERP"), nunca produtos.
 *
 * Ao editar: a mensagem é que a Finer One assenta por cima do que a empresa
 * já usa. Nada aqui deve sugerir ligações automáticas já disponíveis.
 */

/** Raio da órbita onde assentam as entidades, em unidades do palco. */
export const ORBIT_RADIUS = 252
/**
 * Onde os conectores terminam. Tem de ficar fora do halo do núcleo (raio
 * 142), senão as linhas entram no anel em vez de encostar a ele.
 */
export const CORE_RADIUS = 152
/** Lado do palco quadrado da composição. */
export const STAGE = 640

export type OrbitNode = {
  label: string
  /** Chave em systemIcons. Ícone genérico de categoria, nunca uma marca. */
  icon: string
  /** Ângulo na órbita, em graus. -90 é o topo do palco. */
  angle: number
}

/** O que a empresa já tem. Arco superior, da esquerda para a direita. */
export const sources: OrbitNode[] = [
  { label: 'Banco', icon: 'bank', angle: -154 },
  { label: 'ERP', icon: 'erp', angle: -122 },
  { label: 'Contabilidade', icon: 'accounting', angle: -90 },
  { label: 'Faturação', icon: 'invoice', angle: -58 },
  // As pontas ficam a 26° e não a 20°: "Folha de cálculo" é o rótulo mais
  // largo e a esta altura da órbita ainda cabe dentro do palco.
  { label: 'Folha de cálculo', icon: 'sheet', angle: -26 },
]

/** O que a camada devolve. Arco inferior, da esquerda para a direita. */
export const outputs: OrbitNode[] = [
  { label: 'Análise', icon: 'analysis', angle: 145 },
  { label: 'Previsão', icon: 'forecast', angle: 110 },
  { label: 'Alerta', icon: 'alert', angle: 70 },
  { label: 'Decisão', icon: 'decision', angle: 35 },
]

/** Posição de um nó no palco, em unidades do viewBox. */
export function nodePosition(angle: number, radius = ORBIT_RADIUS) {
  const radians = (angle * Math.PI) / 180
  return {
    x: STAGE / 2 + radius * Math.cos(radians),
    y: STAGE / 2 + radius * Math.sin(radians),
  }
}

/** Segmento entre a órbita e a moldura do núcleo, no sentido pedido. */
export function connectorPath(angle: number, direction: 'in' | 'out') {
  const outer = nodePosition(angle, ORBIT_RADIUS - 8)
  const inner = nodePosition(angle, CORE_RADIUS)
  const [from, to] = direction === 'in' ? [outer, inner] : [inner, outer]

  return `M${from.x.toFixed(1)},${from.y.toFixed(1)} L${to.x.toFixed(1)},${to.y.toFixed(1)}`
}

/* ---------------------------------------------------------------- */

export const core = {
  name: 'Finer One',
  role: 'Financial Intelligence Layer',
}

export type SystemRole = {
  system: string
  role: string
}

/**
 * O papel de cada sistema. As quatro primeiras linhas descrevem o que a
 * empresa já tem; a última é o lugar que a Finer One ocupa — nem acima nem
 * em vez, apenas outro.
 */
export const systemRoles: SystemRole[] = [
  { system: 'Contabilidade', role: 'Fiscalidade e conformidade' },
  { system: 'ERP / Faturação', role: 'Operação e registo' },
  { system: 'Banco', role: 'Movimentação financeira' },
  { system: 'Folha de cálculo', role: 'Controlo manual e análises dispersas' },
]

export const finerOneRole: SystemRole = {
  system: 'Finer One',
  role: 'Interpretação e decisão',
}

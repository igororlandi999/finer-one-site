import { EcosystemNode } from '@/components/positioning/EcosystemNode'
import { IntelligenceCore } from '@/components/positioning/IntelligenceCore'
import {
  ORBIT_RADIUS,
  STAGE,
  connectorPath,
  nodePosition,
  outputs,
  sources,
} from '@/data/positioningSection'

/** Comprimentos remapeados para o tracejado deslizar sem emenda. */
const OUTER_PATH_LENGTH = 1630 // 5 × 326
const INNER_PATH_LENGTH = 978 // 3 × 326
const INNER_RADIUS = 198

/** Posição de um nó em percentagem do palco, para o posicionar em HTML. */
function placement(angle: number) {
  const { x, y } = nodePosition(angle)
  return { left: `${(x / STAGE) * 100}%`, top: `${(y / STAGE) * 100}%` }
}

/**
 * Composição orbital — a partir de md.
 *
 * As origens ficam no arco de cima, o núcleo ao centro, as saídas no arco de
 * baixo: a mesma leitura entrada → camada → resultado, mas em redor em vez
 * de em fila. Os chips são estáticos e ficam sempre a direito; o que se move
 * é o tracejado das órbitas e os impulsos nos conectores. É deliberado —
 * rótulos a rodar são difíceis de ler e dariam à secção uma agitação que ela
 * não deve ter.
 *
 * O movimento é feito só com o keyframe `flow` que já existia: um tracejado
 * a deslizar ao longo de um percurso. Nas órbitas o percurso é a
 * circunferência, com `pathLength` remapeado para um múltiplo exato do
 * padrão — sem isso o padrão saltaria no ponto de fecho do círculo. Zero
 * keyframes novos, zero dependências, zero cálculos por frame.
 */
export function OrbitEcosystem({ motion }: { motion: boolean }) {
  return (
    <div className="relative mx-auto hidden aspect-square w-full max-w-[640px] md:block">
      <svg
        viewBox={`0 0 ${STAGE} ${STAGE}`}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        {/* Estrutura fixa das órbitas. */}
        <circle
          cx={STAGE / 2}
          cy={STAGE / 2}
          r={ORBIT_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.055)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={STAGE / 2}
          cy={STAGE / 2}
          r={INNER_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />

        {/* Conectores: origem → núcleo e núcleo → saída. */}
        {sources.map((node) => (
          <path
            key={`linha-${node.label}`}
            d={connectorPath(node.angle, 'in')}
            fill="none"
            stroke="rgba(30,144,255,0.20)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {outputs.map((node) => (
          <path
            key={`linha-${node.label}`}
            d={connectorPath(node.angle, 'out')}
            fill="none"
            stroke="rgba(0,82,255,0.26)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {motion ? (
          <>
            {/* Órbitas em contra-rotação, muito lentas. */}
            <circle
              cx={STAGE / 2}
              cy={STAGE / 2}
              r={ORBIT_RADIUS}
              fill="none"
              stroke="rgba(30,144,255,0.34)"
              strokeWidth={1.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={OUTER_PATH_LENGTH}
              strokeDasharray="6 320"
              className="animate-flow"
              style={{ animationDuration: '22s' }}
            />
            <circle
              cx={STAGE / 2}
              cy={STAGE / 2}
              r={INNER_RADIUS}
              fill="none"
              stroke="rgba(30,144,255,0.24)"
              strokeWidth={1.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={INNER_PATH_LENGTH}
              strokeDasharray="6 320"
              className="animate-flow"
              style={{ animationDuration: '28s', animationDirection: 'reverse' }}
            />

            {/* Impulsos: primeiro a convergir, depois a sair. */}
            {sources.map((node, index) => (
              <path
                key={`impulso-${node.label}`}
                d={connectorPath(node.angle, 'in')}
                fill="none"
                stroke="#1E90FF"
                strokeWidth={1.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="6 320"
                className="animate-flow"
                style={{ animationDuration: '5.2s', animationDelay: `${index * 0.42}s` }}
              />
            ))}
            {outputs.map((node, index) => (
              <path
                key={`impulso-${node.label}`}
                d={connectorPath(node.angle, 'out')}
                fill="none"
                stroke="#1E90FF"
                strokeWidth={1.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="6 320"
                className="animate-flow"
                style={{ animationDuration: '5.2s', animationDelay: `${2.4 + index * 0.42}s` }}
              />
            ))}
          </>
        ) : null}
      </svg>

      <ul aria-label="Sistemas que a empresa já utiliza">
        {sources.map((node) => (
          <li
            key={node.label}
            style={placement(node.angle)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <EcosystemNode label={node.label} icon={node.icon} tone="source" />
          </li>
        ))}
      </ul>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <IntelligenceCore />
      </div>

      <ul aria-label="Resultados gerados pela Finer One">
        {outputs.map((node) => (
          <li
            key={node.label}
            style={placement(node.angle)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <EcosystemNode label={node.label} icon={node.icon} tone="output" />
          </li>
        ))}
      </ul>
    </div>
  )
}

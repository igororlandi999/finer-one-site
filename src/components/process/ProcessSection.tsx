import { ProcessTimeline } from '@/components/process/ProcessTimeline'
import { Reveal } from '@/components/ui/Reveal'
import { processCopy } from '@/data/processSection'

/**
 * Secção de processo — como a Finer One chega às respostas.
 *
 * A versão anterior era um stepper: cinco colunas iguais, uma régua reta e
 * cinco textos curtos. Lia-se, mas não se sentia — os cinco blocos pareciam
 * cinco funcionalidades independentes em vez de uma sequência onde cada passo
 * depende do anterior.
 *
 * Esta versão é uma cascata: as etapas descem e avançam para a direita, um
 * degrau de cada vez, e a calha que as liga é desenhada à medida que o
 * utilizador percorre a secção. A dependência entre passos passa a ser
 * estrutural — a linha só chega a 03 depois de passar por 02 — e o resultado
 * final é o último nó da mesma calha, não uma caixa à parte.
 *
 * O que faz a transformação ler-se é sobretudo o microvisual de cada etapa:
 * dispersão, alinhamento, seleção, projeção, resposta. Ver ProcessVisual.
 *
 * NÃO é a mecânica da fase 3: não há sticky, não há coluna editorial fixa à
 * esquerda com painel de produto à direita, não há numeral fantasma. Aqui o
 * conteúdo desce com a página e nada fica preso.
 *
 * O fundo mergulha para navy-deep ao centro e volta a navy nas extremidades,
 * o que separa a secção das vizinhas — ambas em navy — sem introduzir mais um
 * divisor horizontal.
 *
 * CLAIMS: ver as notas em src/data/processSection.ts.
 */
export function ProcessSection() {
  return (
    <section
      id="processo"
      aria-labelledby="processo-titulo"
      className="relative isolate scroll-mt-24 bg-gradient-to-b from-navy via-navy-deep to-navy pb-24 pt-24 sm:pb-28 sm:pt-28 lg:pb-28 lg:pt-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[520px] -translate-y-1/2 bg-[radial-gradient(50%_100%_at_30%_50%,rgba(30,144,255,0.05),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="max-w-[720px]">
          <p className="text-[10px] uppercase tracking-[0.22em] text-glow">{processCopy.kicker}</p>
          <h2
            id="processo-titulo"
            className="mt-5 text-balance font-display text-[28px] font-semibold leading-[1.14] tracking-[-0.03em] text-white sm:text-[36px] lg:text-[42px]"
          >
            {processCopy.headlineBefore}
            <span className="text-glow">{processCopy.headlineHighlight}</span>
            {processCopy.headlineAfter}
          </h2>
          <p className="mt-6 max-w-[58ch] text-balance text-[15px] leading-relaxed text-mist">
            {processCopy.subheadline}
          </p>
        </Reveal>

        <ProcessTimeline />
      </div>
    </section>
  )
}

import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { useFooterData } from '@/data/footer'

/**
 * Encerramento da narrativa.
 *
 * A Hero abre com "a sua empresa já tem os números; agora precisa de
 * respostas". Isto fecha o mesmo arco pelo outro lado — os números continuam
 * a existir, falta o passo seguinte.
 *
 * Depois de nove secções densas, o final é deliberadamente vazio: sem cards,
 * sem gráficos, sem composição de produto. Só a frase, duas ações e muito ar.
 * A página abre espaço em vez de acrescentar mais um elemento.
 *
 * Os CTAs usam o mesmo componente Button do resto do site. Não há backend
 * nesta fase, por isso não são ligados a nenhum fluxo.
 */
export function FinalCTA() {
  const { footerCopy } = useFooterData()

  return (
    <section
      aria-labelledby="cta-final-titulo"
      className="relative isolate bg-gradient-to-b from-navy to-navy-deep pb-32 pt-28 sm:pb-40 sm:pt-32 lg:pb-48 lg:pt-40"
    >
      {/* Horizonte azul: a luz sobe do fundo, não desce do topo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_100%,rgba(0,82,255,0.14),transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-px w-2/3 max-w-[680px] bg-gradient-to-r from-transparent via-glow/30 to-transparent"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-[880px] text-center">
          <h2
            id="cta-final-titulo"
            className="text-balance font-display text-[30px] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-[42px] lg:text-[52px]"
          >
            <span className="block text-white/[0.55]">{footerCopy.ctaHeadlineFirst}</span>
            <span className="mt-2 block text-white">{footerCopy.ctaHeadlineSecond}</span>
          </h2>

          <p className="mx-auto mt-7 max-w-[58ch] text-balance text-[15px] leading-relaxed text-mist">
            {footerCopy.ctaSubheadline}
          </p>

          <div className="mt-10 flex w-full flex-col items-center gap-3 sm:mt-12 sm:w-auto sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto">
              {footerCopy.ctaPrimary}
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {footerCopy.ctaSecondary}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

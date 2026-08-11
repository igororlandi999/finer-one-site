import { useState } from 'react'
import { FAQAccordion } from '@/components/faq/FAQAccordion'
import { Reveal } from '@/components/ui/Reveal'
import { faqCopy } from '@/data/faq'

/**
 * Nona secção: perguntas frequentes.
 *
 * Mudança de ritmo deliberada. A fase 8 é comercial e densa; esta respira —
 * uma coluna estreita ao centro, sem composição de produto, sem spotlight.
 * O papel aqui é responder e sair da frente.
 *
 * O fundo mantém-se em navy e a luz do topo é a mais fraca de todo o site,
 * o que fecha a página sem introduzir mais um divisor.
 *
 * São seis perguntas num único accordion. As categorias existiam quando havia
 * dezasseis; com seis, um tablist só acrescentaria um passo antes da resposta.
 *
 * Conteúdo em src/data/faq.ts, com as regras de claims documentadas lá.
 */
export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section
      id="faq"
      aria-labelledby="faq-titulo"
      className="relative isolate scroll-mt-24 bg-navy pb-28 pt-24 sm:pt-28 lg:pb-36 lg:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-[radial-gradient(55%_100%_at_50%_0%,rgba(30,144,255,0.05),transparent_74%)]"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-[680px] text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-glow">{faqCopy.kicker}</p>
          <h2
            id="faq-titulo"
            className="mt-5 text-balance font-display text-[28px] font-semibold leading-[1.14] tracking-[-0.03em] text-white sm:text-[36px] lg:text-[40px]"
          >
            {faqCopy.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-[56ch] text-balance text-[15px] leading-relaxed text-mist">
            {faqCopy.subheadline}
          </p>
        </Reveal>

        <div className="mx-auto mt-12 max-w-[760px] sm:mt-14">
          <FAQAccordion
            open={open}
            onToggle={(index) => setOpen((current) => (current === index ? null : index))}
          />
        </div>
      </div>
    </section>
  )
}

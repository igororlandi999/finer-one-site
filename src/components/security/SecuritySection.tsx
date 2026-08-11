import { TrustColumns } from '@/components/security/TrustColumns'
import { Reveal } from '@/components/ui/Reveal'
import { securityCopy } from '@/data/securitySection'

/**
 * Secção de confiança, segurança e transparência.
 *
 * Responde à objeção mais dura do funil: "posso confiar os dados financeiros
 * da minha empresa a esta plataforma?". A versão anterior respondia com
 * quatro cards iguais numa grelha 2x2 — correta e esquecível. Esta responde
 * com um mural editorial em três colunas temáticas, onde a origem dos dados,
 * a transparência das análises e a proteção da informação têm cada uma o seu
 * próprio percurso de leitura.
 *
 * REGRA CRÍTICA: nenhuma tecnologia, infraestrutura, certificação ou
 * conformidade é afirmada. A secção descreve princípios e intenção de
 * conceção e diz explicitamente que a plataforma está em desenvolvimento. A
 * lista completa de claims deliberadamente evitados está em
 * src/data/securitySection.ts — ler antes de acrescentar qualquer frase aqui.
 *
 * Sem verde, sem cadeado dominante, sem estética de cibersegurança: superfícies
 * navy, azul da marca em detalhe, ícones pequenos, tipografia a fazer o
 * trabalho pesado.
 *
 * `scroll-mt-24` e ausência de `overflow-hidden` no <section> seguem o padrão
 * das restantes secções — no Chrome um contentor de scroll faz o
 * `scroll-margin-top` ser ignorado.
 */
export function SecuritySection() {
  return (
    <section
      id="seguranca"
      aria-labelledby="seguranca-titulo"
      className="relative isolate scroll-mt-24 bg-navy-deep pb-28 pt-24 sm:pt-28 lg:pb-32 lg:pt-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(30,144,255,0.06),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-[820px] text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-glow">{securityCopy.kicker}</p>
          <h2
            id="seguranca-titulo"
            className="mt-5 text-balance font-display text-[28px] font-semibold leading-[1.14] tracking-[-0.03em] sm:text-[36px] lg:text-[42px]"
          >
            <span className="block text-white">{securityCopy.headlineFirst}</span>
            <span className="mt-2 block text-white/[0.55]">{securityCopy.headlineSecond}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[64ch] text-balance text-[15px] leading-relaxed text-mist">
            {securityCopy.subheadline}
          </p>
        </Reveal>

        <div className="mt-14 sm:mt-16">
          <TrustColumns />
        </div>

        {/* Faixa de fecho: três princípios e a salvaguarda, no mesmo bloco.
            Sem título próprio — um segundo título grande competiria com o
            cabeçalho da secção e o mural já disse tudo o que havia a dizer. */}
        <Reveal delay={120}>
          <div className="relative mt-12 overflow-hidden rounded-2xl border border-white/[0.08] bg-navy-soft/70 px-6 py-7 sm:mt-14 sm:px-10 sm:py-8">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/40 to-transparent"
            />

            <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:gap-8">
              <ul className="flex flex-wrap items-center justify-center gap-2.5">
                {securityCopy.bandPrinciples.map((principle) => (
                  <li
                    key={principle}
                    className="rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 text-[12.5px] text-white/[0.85]"
                  >
                    {principle}
                  </li>
                ))}
              </ul>

              <p className="max-w-[62ch] text-center text-[11.5px] leading-relaxed text-mist/70 sm:text-right">
                {securityCopy.bandNote}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

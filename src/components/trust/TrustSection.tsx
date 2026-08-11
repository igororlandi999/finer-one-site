import { useState } from 'react'
import { BoundariesReading } from '@/components/trust/BoundariesReading'
import { TrustAnalysisPanel } from '@/components/trust/TrustAnalysisPanel'
import { TrustPrinciple } from '@/components/trust/TrustPrinciple'
import { Reveal } from '@/components/ui/Reveal'
import { closing, principles } from '@/data/trustSection'
import type { PrincipleId } from '@/data/trustSection'

/**
 * Sétima secção: confiança, controlo e transparência.
 *
 * Responde à objeção que qualquer empresário levanta antes de ligar
 * informação financeira a uma plataforma. A resposta não é um discurso de
 * segurança — é mostrar como uma camada de inteligência responsável se deve
 * comportar: dizendo em que se baseou, o que analisou, até quando tem
 * informação, e onde termina o seu papel.
 *
 * Mudança de ritmo face à fase 6: a secção anterior abre-se num ecossistema
 * com muito ar; esta fecha-se num painel único, alinhado e denso. O fundo
 * desce de navy para navy-deep em vez de subir, e a luz vem de uma linha fina
 * no topo em vez de um halo — precisão em vez de amplitude.
 *
 * Os três princípios iluminam zonas do painel ao passar o cursor. É
 * decorativo: sem cursor, e com movimento reduzido, tudo se lê na mesma.
 *
 * TODA a secção é demonstração conceptual. Nenhuma certificação, norma,
 * auditoria, localização de dados ou característica técnica de segurança é
 * afirmada — ver as notas em src/data/trustSection.ts.
 */
export function TrustSection() {
  const [active, setActive] = useState<PrincipleId | null>(null)

  return (
    <section
      id="confianca"
      aria-labelledby="confianca-titulo"
      className="relative isolate scroll-mt-24 bg-gradient-to-b from-navy to-navy-deep pb-28 pt-24 sm:pt-28 lg:pb-36 lg:pt-32"
    >
      {/* Linha de luz no topo: entrada precisa, sem divisor. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(30,144,255,0.07),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-[780px] text-center">
          <h2
            id="confianca-titulo"
            className="text-balance font-display text-[28px] font-semibold leading-[1.14] tracking-[-0.03em] text-white sm:text-[36px] lg:text-[42px]"
          >
            Inteligência financeira exige confiança.
          </h2>
          <p className="mx-auto mt-6 max-w-[64ch] text-balance text-[15px] leading-relaxed text-mist">
            A Finer One foi pensada para transformar informação em contexto para decidir, mantendo
            clareza sobre os dados utilizados, as análises produzidas e o papel da plataforma.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:mt-16 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-7">
            <TrustAnalysisPanel active={active} />
          </Reveal>

          <div className="grid gap-4 lg:col-span-5 lg:content-start">
            {principles.map((principle, index) => (
              <Reveal key={principle.id} delay={80 + index * 80}>
                <TrustPrinciple
                  principle={principle}
                  active={active}
                  onEnter={setActive}
                  onLeave={() => setActive(null)}
                />
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-16 sm:mt-20">
          <BoundariesReading />
        </Reveal>

        <Reveal className="mt-16 text-center sm:mt-20">
          <p className="mx-auto max-w-[26ch] text-balance font-display text-[26px] font-semibold leading-[1.18] tracking-[-0.03em] sm:max-w-none sm:text-[34px] lg:text-[40px]">
            <span className="block text-white/[0.55]">{closing.first}</span>
            <span className="mt-1.5 block text-white">{closing.second}</span>
          </p>
        </Reveal>

        <p className="mx-auto mt-14 max-w-[70ch] text-center text-[12px] leading-relaxed text-mist/70">
          A análise apresentada é uma demonstração conceptual, com valores ilustrativos, do que uma
          análise da Finer One deve conseguir explicar sobre si própria.
        </p>
      </div>
    </section>
  )
}

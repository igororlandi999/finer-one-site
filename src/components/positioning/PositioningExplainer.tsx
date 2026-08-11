import { LogoMark } from '@/components/brand/Logo'
import { finerOneRole, systemRoles } from '@/data/positioningSection'

/**
 * Leitura estratégica.
 *
 * A composição é a mensagem: quatro linhas iguais para os sistemas que já
 * existem — nenhum acima de outro — e depois um degrau para a linha da Finer
 * One, separada por espaço em vez de por uma moldura maior. Não substitui
 * nenhuma das anteriores; acrescenta-se a elas.
 *
 * Não é uma tabela: não há relação bidimensional entre linhas e colunas,
 * apenas pares sistema/papel. Uma lista de definições é o que isto é.
 */
export function PositioningExplainer() {
  return (
    <div className="mx-auto max-w-[860px]">
      <p className="text-[10px] uppercase tracking-[0.18em] text-mist">O papel de cada sistema</p>

      <dl className="mt-6">
        {systemRoles.map((entry) => (
          <div
            key={entry.system}
            className="grid gap-1 border-t border-white/[0.07] py-4 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:gap-8 sm:py-5"
          >
            <dt className="text-[14px] font-medium text-white sm:text-[15px]">{entry.system}</dt>
            <dd className="text-[13.5px] leading-relaxed text-mist sm:text-[14px]">{entry.role}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 rounded-2xl bg-gradient-to-b from-white/[0.16] via-white/[0.05] to-transparent p-px sm:mt-8">
        <div className="grid gap-1.5 rounded-[15px] bg-navy-soft/80 px-5 py-5 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-center sm:gap-8 sm:px-7 sm:py-6">
          <p className="flex items-center gap-2.5 text-[15px] font-semibold text-white sm:text-[16px]">
            <LogoMark className="h-4 shrink-0 text-glow" />
            {finerOneRole.system}
          </p>
          <p className="text-[13.5px] leading-relaxed text-white sm:text-[14.5px]">
            {finerOneRole.role}
          </p>
        </div>
      </div>
    </div>
  )
}

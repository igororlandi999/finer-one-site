import { protectionPrinciples } from '@/data/securitySection'

/**
 * Princípios de tratamento da informação.
 *
 * Princípios, nunca tecnologias, normas ou certificações — ver a lista de
 * afirmações deliberadamente ausentes em src/data/securitySection.ts. A nota
 * final diz explicitamente que a plataforma está em desenvolvimento, para a
 * superfície não ser lida como declaração de conformidade.
 *
 * Sem ícones de cadeado nem escudos: a credibilidade vem da precisão da
 * linguagem, não de iconografia de antivírus.
 */
export function ProtectionSurface() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-navy-deep/60 p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-mist/70">
        {protectionPrinciples.label}
      </p>

      <ul className="mt-3.5 space-y-3">
        {protectionPrinciples.items.map((item) => (
          <li key={item.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full border border-glow/60 bg-glow/25"
            />
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium leading-snug text-white">
                {item.title}
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed text-mist">
                {item.description}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-white/[0.06] pt-3.5 text-[11px] leading-snug text-mist/70">
        {protectionPrinciples.note}
      </p>
    </div>
  )
}

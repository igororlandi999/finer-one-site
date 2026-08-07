import { Check } from 'lucide-react'
import { dataScope } from '@/data/trustSection'

/**
 * Âmbito da informação usada na análise — o pilar do controlo.
 *
 * REPRESENTAÇÃO CONCEPTUAL. Mostra o que a plataforma deve tornar visível ao
 * empresário: que informação está disponível para ser analisada. Não
 * representa permissões, papéis, níveis de acesso, modos de leitura nem
 * qualquer mecanismo técnico de autorização.
 */
export function AccessScope() {
  return (
    <ul className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
      {dataScope.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5"
        >
          <span className="min-w-0 truncate text-[12.5px] text-white">{item.label}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-mist">
            <Check size={11} aria-hidden="true" className="text-glow" />
            {item.state}
          </span>
        </li>
      ))}
    </ul>
  )
}

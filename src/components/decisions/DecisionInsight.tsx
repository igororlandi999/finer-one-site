import { LogoMark } from '@/components/brand/Logo'
import { useLanguage } from '@/i18n/LanguageContext'

const label = { pt: 'Leitura Finer One', en: 'Finer One reading' }

/**
 * Banda de leitura, no fundo de cada card.
 *
 * É o momento em que a secção deixa de mostrar números e passa a mostrar o
 * que eles significam — por isso tem tratamento próprio, atravessa o card de
 * ponta a ponta e é o mesmo em todas as decisões. Texto demonstrativo,
 * escrito à mão: não é a saída de nenhum motor de análise.
 */
export function DecisionInsight({ children }: { children: string }) {
  const { lang } = useLanguage()

  return (
    <div className="flex gap-3 border-t border-white/[0.07] bg-white/[0.02] px-5 py-4 sm:gap-4 sm:px-8 sm:py-5 lg:px-10">
      <LogoMark className="mt-[3px] h-3 shrink-0 text-glow" />

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.16em] text-mist">{label[lang]}</p>
        <p className="mt-2 max-w-[76ch] text-balance text-[13.5px] leading-relaxed text-white sm:text-[14.5px]">
          {children}
        </p>
      </div>
    </div>
  )
}

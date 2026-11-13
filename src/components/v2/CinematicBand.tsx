import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useLanguage } from '@/i18n/LanguageContext'

const copy = {
  pt: { lines: ['Antecipar riscos.', 'Descobrir oportunidades.'], strong: 'Decidir com confiança.', signature: ['Where Finance ', 'Meets Strategy'] },
  en: { lines: ['Anticipate risks.', 'Discover opportunities.'], strong: 'Decide with confidence.', signature: ['Where Finance ', 'Meets Strategy'] },
}

/**
 * Interlúdio cinematográfico com a fotografia oficial (montanha e linha
 * azul ascendente). Parallax ligeiro ligado à posição (simétrico a subir e
 * a descer); as margens fundem-se com o navy das secções vizinhas, sem cortes.
 */
export function CinematicBand() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const ref = useScrollProgress<HTMLElement>({ mode: 'cross', reducedValue: 0.5 })

  return (
    <section ref={ref} aria-label={t.strong} className="relative isolate overflow-hidden bg-navy-deep">
      <div className="relative h-[78vh] min-h-[520px] max-h-[860px]">
        <img
          src="/images/mountain-line.jpg"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-[120%] w-full object-cover object-[70%_30%] will-change-transform"
          style={{ transform: 'translate3d(0, calc((var(--p, 0.5) - 0.5) * -14%), 0) scale(1.04)' }}
        />
        {/* Fusão com o navy em cima e em baixo + véu para leitura do texto */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-navy-deep via-transparent to-navy-deep" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 via-navy-deep/40 to-transparent" />

        <div className="relative mx-auto flex h-full max-w-content items-center px-5 sm:px-6 lg:px-8">
          <div
            className="max-w-xl"
            style={{ opacity: 'clamp(0, calc(var(--p, 0.5) * 4 - 0.6), 1)', transform: 'translate3d(0, calc((0.5 - var(--p, 0.5)) * 60px), 0)' }}
          >
            <p className="font-display text-[30px] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[44px]">
              {t.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block text-glow">{t.strong}</span>
            </p>
            <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.3em] text-white/80">
              {t.signature[0]}
              <span className="text-glow">{t.signature[1]}</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

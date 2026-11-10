import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const copy: Record<Lang, { eyebrow: string; title: string; items: { n: string; name: string; text: string }[] }> = {
  pt: {
    eyebrow: 'O impacto no seu negócio',
    title: 'O que muda na sua gestão?',
    items: [
      { n: '01', name: 'Recebimentos', text: 'Saiba quem lhe deve e quanto está por receber.' },
      { n: '02', name: 'Tesouraria', text: 'Acompanhe a liquidez e os próximos compromissos.' },
      { n: '03', name: 'Custos', text: 'Identifique despesas e desvios que merecem atenção.' },
      { n: '04', name: 'Prioridades', text: 'Perceba onde agir primeiro e porquê.' },
    ],
  },
  en: {
    eyebrow: 'The impact on your business',
    title: 'What changes in how you manage?',
    items: [
      { n: '01', name: 'Receivables', text: 'Know who owes you and how much is outstanding.' },
      { n: '02', name: 'Cash', text: 'Track liquidity and upcoming commitments.' },
      { n: '03', name: 'Costs', text: 'Spot expenses and deviations that deserve attention.' },
      { n: '04', name: 'Priorities', text: 'Understand where to act first, and why.' },
    ],
  },
}

/**
 * Benefícios em faixa compacta (substitui os quatro cartões; versão antiga em
 * ?beneficios=antigo). Uma única microanimação: a linha azul percorre o topo
 * da faixa e acende cada benefício ao passar. A informação lê-se sem ela.
 */
export function BenefitsStrip() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.35 })
  const on = reduced || inView
  const step = 260 // ms entre benefícios

  return (
    <section id="beneficios" aria-labelledby="beneficios-titulo" className="relative scroll-mt-24 py-12 text-navy lg:py-14">
      <div ref={ref} className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent">{t.eyebrow}</p>
        <h2 id="beneficios-titulo" className="mt-3 font-display text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-[#070D2B] sm:text-[36px] lg:text-[40px]">
          {t.title}
        </h2>

        <div className="relative mt-8 lg:mt-10">
          {/* Trilho e linha azul que percorre os quatro benefícios */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[#0B1030]/[0.1]">
            <span
              className="absolute inset-0 origin-left bg-gradient-to-r from-accent via-glow to-accent shadow-[0_0_10px_rgba(30,144,255,0.8)] transition-transform ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{ transform: `scaleX(${on ? 1 : 0})`, transitionDuration: reduced ? '0ms' : `${step * 4 + 200}ms` }}
            />
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {t.items.map((item, i) => (
              <li
                key={item.n}
                className={cn(
                  'relative py-6 sm:pr-6 lg:px-6 lg:pb-2 lg:pt-7',
                  i > 0 && 'border-t border-[#0B1030]/[0.08] sm:border-t-0',
                  i % 2 === 1 && 'sm:border-l sm:border-[#0B1030]/[0.08] sm:pl-6',
                  i > 1 && 'sm:border-t sm:border-[#0B1030]/[0.08] lg:border-t-0',
                  i > 0 && 'lg:border-l lg:border-[#0B1030]/[0.08]',
                  i === 0 && 'lg:pl-0',
                )}
              >
                {/* Ponto que acende quando a linha passa (desktop) */}
                <span
                  aria-hidden="true"
                  className={cn('absolute -top-[5px] hidden h-[9px] w-[9px] rounded-full border-2 transition-all duration-500 lg:block', i === 0 ? 'left-0' : '-left-[5px]')}
                  style={{
                    borderColor: on ? '#0052FF' : 'rgba(11,16,48,0.2)',
                    backgroundColor: on ? '#0052FF' : '#FFFFFF',
                    boxShadow: on ? '0 0 0 4px rgba(0,82,255,0.12), 0 0 10px rgba(30,144,255,0.7)' : 'none',
                    transitionDelay: on && !reduced ? `${i * step}ms` : '0ms',
                  }}
                />
                <p
                  className="font-display text-[13px] font-bold tabular-nums tracking-[0.12em] transition-colors duration-500"
                  style={{ color: on ? '#0052FF' : 'rgba(11,16,48,0.35)', transitionDelay: on && !reduced ? `${i * step}ms` : '0ms' }}
                >
                  {item.n}
                </p>
                <h3 className="mt-2 font-display text-[20px] font-bold tracking-[-0.015em] text-[#070D2B]">{item.name}</h3>
                <p className="mt-1.5 max-w-[260px] text-[15.5px] leading-[1.55] text-[#0B1030]/70">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

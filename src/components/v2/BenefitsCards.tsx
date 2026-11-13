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
export function BenefitsCards() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.35 })
  const on = reduced || inView
  const step = 260 // ms entre benefícios

  return (
    <section id="beneficios" aria-labelledby="beneficios-titulo" className="relative scroll-mt-24 py-14 text-navy lg:py-16">
      <div ref={ref} className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent">{t.eyebrow}</p>
        <h2 id="beneficios-titulo" className="mt-3 font-display text-[32px] font-medium leading-[1.08] tracking-[-0.035em] text-[#070D2B] sm:text-[42px] lg:text-[50px]">
          {t.title}
        </h2>

        <ol className="mt-9 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-5">
          {t.items.map((item, i) => (
            <li
              key={item.n}
              className={cn(
                'group relative flex min-h-[220px] flex-col overflow-hidden rounded-[24px] border border-[#0B1030]/[0.09] bg-white p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/35 lg:min-h-[260px] lg:p-7',
                on ? 'animate-fade-up' : 'opacity-0',
              )}
              style={on && !reduced ? { animationDelay: `${i * step * 0.5}ms` } : undefined}
            >
              {/* Linha azul da marca: acende no topo do cartão ao passar o rato */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-glow to-transparent shadow-[0_0_10px_rgba(30,144,255,0.8)] transition-transform duration-500 group-hover:scale-x-100" />
              <p className="font-display text-[52px] font-light leading-none tracking-[-0.04em] text-[#0B1030]/[0.13] transition-colors duration-300 group-hover:text-accent/70 lg:text-[58px]">
                {Number(item.n)}
              </p>
              <h3 className="mt-auto pt-10 font-display text-[21px] font-semibold tracking-[-0.02em] text-[#070D2B]">{item.name}</h3>
              <p className="mt-2 text-[15.5px] leading-[1.55] text-[#0B1030]/65">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

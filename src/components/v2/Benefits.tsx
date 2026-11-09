import { Coins, Landmark, ListChecks, Receipt } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { useSpotlight } from '@/hooks/useSpotlight'
import { useLanguage } from '@/i18n/LanguageContext'

const icons: LucideIcon[] = [Receipt, Landmark, Coins, ListChecks]

const copy = {
  pt: {
    kicker: 'O que muda no seu negócio?',
    title: ['Menos incerteza. ', 'Mais controlo.'],
    sub: 'Mais clareza para decidir. Mais tempo para fazer crescer o negócio.',
    items: [
      { n: '01', name: 'Recebimentos', text: 'Saiba quem lhe deve e quanto.' },
      { n: '02', name: 'Tesouraria', text: 'Antecipe necessidades de caixa.' },
      { n: '03', name: 'Custos', text: 'Descubra onde pode poupar.' },
      { n: '04', name: 'Prioridades', text: 'Saiba onde agir primeiro.' },
    ],
  },
  en: {
    kicker: 'What changes in your business?',
    title: ['Less uncertainty. ', 'More control.'],
    sub: 'More clarity to decide. More time to grow the business.',
    items: [
      { n: '01', name: 'Receivables', text: 'Know who owes you and how much.' },
      { n: '02', name: 'Cash', text: 'Anticipate cash needs.' },
      { n: '03', name: 'Costs', text: 'Find out where you can save.' },
      { n: '04', name: 'Priorities', text: 'Know where to act first.' },
    ],
  },
}

export function Benefits() {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <section id="beneficios" aria-labelledby="beneficios-titulo" className="relative scroll-mt-24 py-16 text-navy lg:py-24">
      <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">{t.kicker}</p>
          <h2 id="beneficios-titulo" className="mt-4 text-balance font-display text-[30px] font-bold leading-[1.1] tracking-[-0.025em] sm:text-[44px]">
            {t.title[0]}
            <span className="text-accent">{t.title[1]}</span>
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-navy/75">{t.sub}</p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {t.items.map((item, i) => (
            <Reveal key={item.n} delay={i * 90}>
              <BenefitCard {...item} Icon={icons[i]} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function BenefitCard({ n, name, text, Icon }: { n: string; name: string; text: string; Icon: LucideIcon }) {
  const { ref, onPointerMove } = useSpotlight<HTMLDivElement>()

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className="group relative h-full overflow-hidden rounded-2xl border border-navy/[0.08] bg-white p-6 shadow-[0_10px_30px_-24px_rgba(7,13,43,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-white hover:shadow-[0_24px_60px_-30px_rgba(0,82,255,0.55)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(260px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(0,82,255,0.10), transparent 70%)' }}
      />
      <span aria-hidden="true" className="absolute left-0 top-6 h-10 w-[3px] rounded-r-full bg-accent transition-all duration-300 group-hover:h-16" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="font-display text-[13px] font-semibold tracking-[0.2em] text-accent">{n}</span>
          <Icon className="h-5 w-5 text-navy/75 transition-colors duration-300 group-hover:text-accent" aria-hidden="true" />
        </div>
        <h3 className="mt-8 font-display text-[20px] font-bold tracking-[-0.01em]">{name}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-navy/75">{text}</p>
      </div>
    </div>
  )
}

import { Building2, FileText, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useLanguage } from '@/i18n/LanguageContext'

const icons: LucideIcon[] = [Building2, FileText, Sparkles]

const copy = {
  pt: {
    kicker: 'Como funciona',
    title: ['Da informação à ação. ', 'Sem complicações.'],
    sub: 'Três passos para transformar dados financeiros em decisões.',
    who: ['O empresário', 'O empresário', 'A Finer One'],
    steps: [
      { n: '01', title: 'Liga a conta bancária', text: 'De forma simples e segura, através de Open Banking e apenas com a sua autorização.' },
      { n: '02', title: 'Envia as faturas', text: 'Para um email exclusivo da Finer One. Sem dar acesso à sua caixa de correio.' },
      { n: '03', title: 'Recolhe. Analisa. Antecipa.', text: 'Transforma os dados em alertas, recomendações e planos de ação para o negócio.' },
    ],
    note: 'Funcionamento previsto. As integrações estão em implementação e teste com os primeiros utilizadores.',
  },
  en: {
    kicker: 'How it works',
    title: ['From information to action. ', 'No hassle.'],
    sub: 'Three steps to turn financial data into decisions.',
    who: ['You', 'You', 'Finer One'],
    steps: [
      { n: '01', title: 'Connect your bank account', text: 'Simply and securely, through Open Banking and only with your authorisation.' },
      { n: '02', title: 'Send your invoices', text: "To a dedicated Finer One email address. No access to your inbox." },
      { n: '03', title: 'Collects. Analyses. Anticipates.', text: 'Turns data into alerts, recommendations and action plans for the business.' },
    ],
    note: 'Planned workflow. Integrations are being implemented and tested with our first users.',
  },
}

/** Secção clara. A linha azul que liga os três passos desenha-se com o scroll. */
export function HowItWorks() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const lineRef = useScrollProgress<HTMLDivElement>({ mode: 'enter', endAt: 0.45 })

  return (
    <section id="funcionamento" aria-labelledby="funcionamento-titulo" className="relative scroll-mt-24 bg-ice py-24 text-navy lg:py-32">
      <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">{t.kicker}</p>
          <h2 id="funcionamento-titulo" className="mt-4 text-balance font-display text-[30px] font-bold leading-[1.1] tracking-[-0.025em] sm:text-[44px]">
            {t.title[0]}
            <span className="text-accent">{t.title[1]}</span>
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-navy/65">{t.sub}</p>
        </Reveal>

        <div ref={lineRef} className="relative mt-14 lg:mt-20">
          {/* Linha de ligação: horizontal no desktop, vertical no telemóvel */}
          <div aria-hidden="true" className="absolute left-[27px] top-0 h-full w-[2px] bg-navy/[0.08] md:left-[16.66%] md:right-[16.66%] md:top-[27px] md:h-[2px] md:w-auto">
            <div className="h-full w-full origin-top bg-gradient-to-b from-accent to-glow shadow-[0_0_16px_2px_rgba(30,144,255,0.55)] md:hidden" style={{ transform: 'scaleY(var(--p, 0))' }} />
            <div className="hidden h-full w-full origin-left bg-gradient-to-r from-accent to-glow shadow-[0_0_16px_2px_rgba(30,144,255,0.55)] md:block" style={{ transform: 'scaleX(var(--p, 0))' }} />
          </div>

          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            {t.steps.map((step, i) => {
              const Icon = icons[i]
              return (
                <li key={step.n} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
                  <span
                    className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-white text-accent shadow-[0_12px_30px_-12px_rgba(0,82,255,0.6)] transition-colors duration-500"
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
                      {step.n} · {t.who[i]}
                    </p>
                    <h3 className="mt-2 font-display text-[20px] font-bold tracking-[-0.01em]">{step.title}</h3>
                    <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-navy/65 md:mx-auto">{step.text}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <p className="mx-auto mt-14 max-w-xl text-center text-[12.5px] text-navy/45">{t.note}</p>
      </div>
    </section>
  )
}

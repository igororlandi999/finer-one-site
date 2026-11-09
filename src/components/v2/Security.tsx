import { Landmark, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { LuminousLine } from '@/components/v2/LuminousLine'
import { useLanguage } from '@/i18n/LanguageContext'

const icons: LucideIcon[] = [Landmark, Mail, UserCheck]

const copy = {
  pt: {
    kicker: 'Segurança e privacidade',
    title: ['A sua informação merece ', 'a mesma atenção que o seu negócio.'],
    sub: 'Concebida para tratar informação financeira com controlo, transparência e respeito pela privacidade.',
    blocks: [
      { title: 'Contas bancárias', text: 'Ligação através de Open Banking, apenas com a sua autorização expressa. Pode revogar o acesso a qualquer momento.' },
      { title: 'Emails e faturas', text: 'As faturas são enviadas para um endereço dedicado. A Finer One nunca acede à sua caixa de correio. A leitura automática está prevista sobre infraestrutura AWS.' },
      { title: 'Privacidade e controlo', text: 'Os seus dados servem para produzir a análise da sua empresa. Decide o que liga, quando liga e quando deixa de ligar.' },
    ],
    principle: 'A Finer One apoia a decisão. Não substitui quem conhece o negócio — nem o seu contabilista.',
  },
  en: {
    kicker: 'Security and privacy',
    title: ['Your information deserves ', 'the same care as your business.'],
    sub: 'Designed to handle financial information with control, transparency and respect for privacy.',
    blocks: [
      { title: 'Bank accounts', text: 'Connected through Open Banking, only with your explicit authorisation. You can revoke access at any time.' },
      { title: 'Emails and invoices', text: 'Invoices are sent to a dedicated address. Finer One never accesses your inbox. Automatic reading is planned on AWS infrastructure.' },
      { title: 'Privacy and control', text: 'Your data is used to produce your company’s analysis. You decide what to connect, when, and when to stop.' },
    ],
    principle: 'Finer One supports decisions. It does not replace whoever knows the business — or your accountant.',
  },
}

export function Security() {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <section id="seguranca" aria-labelledby="seguranca-titulo" className="relative isolate scroll-mt-24 overflow-hidden bg-navy pb-36 pt-24 lg:pb-48 lg:pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_20%,rgba(0,82,255,0.20),transparent_70%)]" />
        <LuminousLine
          viewBox="0 0 1600 600"
          d="M -40 560 C 400 550, 760 470, 1000 420 S 1400 330, 1660 300"
          className="absolute inset-x-0 bottom-0 h-[600px] w-full opacity-40"
          draw={false}
          sparkDuration={9}
        />
      </div>

      <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-glow shadow-[0_0_40px_-6px_rgba(0,82,255,0.8)]">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.24em] text-glow">{t.kicker}</p>
            <h2 id="seguranca-titulo" className="mt-4 text-balance font-display text-[30px] font-bold leading-[1.1] tracking-[-0.025em] text-white sm:text-[40px]">
              {t.title[0]}
              <span className="text-glow">{t.title[1]}</span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/75">{t.sub}</p>
          </Reveal>

          <div className="space-y-4">
            {t.blocks.map((block, i) => {
              const Icon = icons[i]
              return (
                <Reveal key={block.title} delay={i * 100}>
                  <div className="group flex gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur transition-colors duration-300 hover:border-accent/40 hover:bg-white/[0.05]">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-glow" aria-hidden="true" />
                    <div>
                      <h3 className="font-display text-[17px] font-bold text-white">{block.title}</h3>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/75">{block.text}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
            <Reveal delay={320}>
              <p className="flex items-center gap-3 px-2 pt-2 text-[13.5px] text-white/75">
                <Lock className="h-4 w-4 shrink-0 text-white/75" aria-hidden="true" />
                {t.principle}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

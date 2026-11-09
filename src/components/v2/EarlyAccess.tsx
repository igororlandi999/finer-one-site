import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, Check, Users } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { useLanguage } from '@/i18n/LanguageContext'

const copy = {
  pt: {
    kicker: 'Acesso antecipado',
    title: ['Seja dos primeiros a conhecer ', 'a Finer One.'],
    sub: 'Duas formas de fazer parte do nosso início.',
    pioneers: {
      tag: 'Finer Pioneers',
      title: 'As melhores soluções constroem-se com quem vive os desafios.',
      text: '10 empresários. Acesso antecipado. Uma voz na construção. Teste o MVP, partilhe o seu feedback e ajude a definir as próximas melhorias.',
      perks: ['Acesso antecipado', 'Participação ativa', 'Proximidade com a equipa'],
      cta: 'Candidatar-me ao Finer Pioneers',
      fine: 'Candidatar-se não obriga a ligar contas bancárias.',
    },
    waitlist: {
      tag: 'Lista de espera',
      title: 'Uma nova forma de gerir o seu negócio está a chegar.',
      text: 'Acompanhe a evolução da Finer One e receba novidades sobre o acesso à plataforma.',
      label: 'O seu email profissional',
      consent: 'Aceito receber comunicações da Finer One sobre o acesso à plataforma.',
      cta: 'Quero entrar na lista de espera',
      fine: 'A inscrição não exige ligação bancária nem partilha de dados financeiros.',
      preview: 'Pré-visualização: o envio será ativado quando o serviço de formulários estiver escolhido. Nenhum dado foi enviado.',
    },
  },
  en: {
    kicker: 'Early access',
    title: ['Be among the first to experience ', 'Finer One.'],
    sub: 'Two ways to be part of our beginning.',
    pioneers: {
      tag: 'Finer Pioneers',
      title: 'The best solutions are built with those who live the challenges.',
      text: '10 business owners. Early access. A voice in what we build. Test the MVP, share your feedback and help shape what comes next.',
      perks: ['Early access', 'Active participation', 'Close to the team'],
      cta: 'Apply to Finer Pioneers',
      fine: 'Applying does not require connecting any bank account.',
    },
    waitlist: {
      tag: 'Waitlist',
      title: 'A new way to run your business is coming.',
      text: 'Follow Finer One as it evolves and get news about platform access.',
      label: 'Your work email',
      consent: 'I agree to receive communications from Finer One about platform access.',
      cta: 'Join the waitlist',
      fine: 'Signing up does not require a bank connection or sharing financial data.',
      preview: 'Preview: submission will be enabled once the form service is chosen. No data was sent.',
    },
  },
}

/**
 * Finer Pioneers + Lista de Espera.
 *
 * O formulário NÃO envia dados: ainda não foi escolhido o serviço que os
 * recebe (decisão dos fundadores). Ao submeter mostra apenas um aviso de
 * pré-visualização. A candidatura Pioneers abre o email geral da empresa.
 */
export function EarlyAccess() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="acesso" aria-labelledby="acesso-titulo" className="relative isolate scroll-mt-24 overflow-hidden bg-navy-deep py-24 text-white lg:py-32">
      {/* Fotografia oficial: a Terra com a Europa iluminada, a fundir-se no navy. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <img src="/images/earth-europe.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-x-0 bottom-0 h-[75%] w-full object-cover object-top opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/70 to-navy-deep/30" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-navy-deep" />
      </div>
      <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-glow">{t.kicker}</p>
          <h2 id="acesso-titulo" className="mt-4 text-balance font-display text-[30px] font-bold leading-[1.1] tracking-[-0.025em] sm:text-[44px]">
            {t.title[0]}
            <span className="text-glow">{t.title[1]}</span>
          </h2>
          <p className="mt-4 text-[16px] text-white/80">{t.sub}</p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-2">
          {/* Pioneers (escuro) */}
          <Reveal>
            <div id="pioneers" className="relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-white/15 bg-navy/80 p-7 text-white backdrop-blur-md sm:p-9">
              <div aria-hidden="true" className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />
              <div className="relative flex flex-1 flex-col">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-glow">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.pioneers.tag}
                </span>
                <h3 className="mt-6 text-balance font-display text-[24px] font-bold leading-tight tracking-[-0.02em] sm:text-[28px]">{t.pioneers.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-white/80">{t.pioneers.text}</p>
                <ul className="mt-6 space-y-2.5">
                  {t.pioneers.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5 text-[14px] text-white/85">
                      <Check className="h-4 w-4 text-glow" aria-hidden="true" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <a
                    href={`mailto:geral.finerone@gmail.com?subject=${encodeURIComponent(t.pioneers.tag)}`}
                    className={buttonClasses({ size: 'lg', className: 'group h-auto min-h-12 w-full whitespace-normal py-3 text-center font-semibold sm:w-auto' })}
                  >
                    {t.pioneers.cta}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                  <p className="mt-3 text-[12px] text-white/70">{t.pioneers.fine}</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Lista de espera (claro) */}
          <Reveal delay={120}>
            <div id="lista-espera" className="flex h-full scroll-mt-28 flex-col rounded-3xl bg-white p-7 text-navy shadow-[0_40px_100px_-40px_rgba(0,0,0,0.8)] sm:p-9">
              <span className="inline-flex w-fit rounded-full border border-navy/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {t.waitlist.tag}
              </span>
              <h3 className="mt-6 text-balance font-display text-[24px] font-bold leading-tight tracking-[-0.02em] sm:text-[28px]">{t.waitlist.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/75">{t.waitlist.text}</p>

              <form onSubmit={onSubmit} className="mt-auto pt-8">
                <label htmlFor="waitlist-email" className="text-[13px] font-semibold">
                  {t.waitlist.label}
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nome@empresa.pt"
                  className="mt-2 h-12 w-full rounded-xl border border-navy/15 bg-white px-4 text-[15px] text-navy outline-none transition-shadow placeholder:text-navy/75 focus:border-accent focus:shadow-[0_0_0_4px_rgba(0,82,255,0.15)]"
                />
                <label className="mt-4 flex items-start gap-2.5 text-[13px] leading-snug text-navy/70">
                  <input type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#0052FF]" />
                  {t.waitlist.consent}
                </label>
                <button type="submit" className={buttonClasses({ size: 'lg', className: 'mt-5 h-auto min-h-12 w-full whitespace-normal py-3 text-center font-semibold' })}>
                  {t.waitlist.cta}
                </button>
                <p className="mt-3 text-[12px] text-navy/70">{t.waitlist.fine}</p>
                {submitted && (
                  <p role="status" className="fo-rise mt-4 rounded-xl border border-accent/25 bg-white p-3 text-[12.5px] text-navy/75">
                    {t.waitlist.preview}
                  </p>
                )}
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

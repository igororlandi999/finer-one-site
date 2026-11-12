import { ArrowRight, ArrowUp, ArrowUpRight } from 'lucide-react'
import { MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { Logo } from '@/components/brand/Logo'
import { buttonClasses } from '@/components/ui/Button'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { SiteFooterClassic } from './SiteFooterClassic'

/**
 * Rodapé (12/11/2026), a partir da análise dos rodapés da Lovable, Searchable e Ramp:
 *  - Lovable: o rodapé é um cartão que flutua na mesma atmosfera do CTA final;
 *  - Searchable: marca + assinatura à esquerda, colunas de ligações à direita,
 *    linha legal em baixo com as redes;
 *  - Ramp: o rodapé repete a ação principal (quem chega ao fim não tem de voltar atrás).
 * Mantém-se a marca "FINER ONE" em grande no fecho (pedido do fundador).
 *
 * Só ligações que existem. Privacidade e Termos ficam de fora: o aviso de
 * privacidade ainda é rascunho e não há termos. Sem morada nem razão social
 * (não definidas).
 */
type Col = { title: string; links: { label: string; href: string; external?: boolean }[] }
type Copy = {
  signature: string
  tagline: string
  primary: string
  secondary: string
  cols: Col[]
  nav: string
  copyright: string
  top: string
  lang: string
}

const LINKEDIN = 'https://linkedin.com/company/finerone?skipRedirect=true&viewAsMember=true'

const copy: Record<Lang, Copy> = {
  pt: {
    signature: 'Where Finance Meets Strategy',
    tagline: 'Inteligência financeira para decisões mais claras.',
    primary: 'Ser Finer Pioneer',
    secondary: 'Entrar na lista de espera',
    cols: [
      {
        title: 'Produto',
        links: [
          { label: 'Experimentar a Finer One', href: '/#experimentar-finer' },
          { label: 'Como funciona', href: '/#funcionamento' },
          { label: 'Planos', href: '/#precos' },
        ],
      },
      {
        title: 'Descobrir',
        links: [
          { label: 'Para quem é', href: '/#para-quem' },
          { label: 'Segurança e confiança', href: '/#seguranca' },
          { label: 'Perguntas frequentes', href: '/#faq' },
        ],
      },
      {
        title: 'Começar',
        links: [
          { label: 'Finer Pioneers', href: '/pioneers/' },
          { label: 'Lista de espera', href: '/lista-espera/' },
          { label: 'LinkedIn', href: LINKEDIN, external: true },
        ],
      },
    ],
    nav: 'Navegação do rodapé',
    copyright: '© 2026 Finer One. Todos os direitos reservados.',
    top: 'Voltar ao topo',
    lang: 'Idioma',
  },
  en: {
    signature: 'Where Finance Meets Strategy',
    tagline: 'Financial intelligence for clearer decisions.',
    primary: 'Become a Finer Pioneer',
    secondary: 'Join the waitlist',
    cols: [
      {
        title: 'Product',
        links: [
          { label: 'Try Finer One', href: '/#experimentar-finer' },
          { label: 'How it works', href: '/#funcionamento' },
          { label: 'Plans', href: '/#precos' },
        ],
      },
      {
        title: 'Discover',
        links: [
          { label: 'Who it’s for', href: '/#para-quem' },
          { label: 'Security & trust', href: '/#seguranca' },
          { label: 'FAQ', href: '/#faq' },
        ],
      },
      {
        title: 'Get started',
        links: [
          { label: 'Finer Pioneers', href: '/pioneers/' },
          { label: 'Waitlist', href: '/lista-espera/' },
          { label: 'LinkedIn', href: LINKEDIN, external: true },
        ],
      },
    ],
    nav: 'Footer navigation',
    copyright: '© 2026 Finer One. All rights reserved.',
    top: 'Back to top',
    lang: 'Language',
  },
}

const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const rise: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }
const letter: Variants = { hidden: { y: '70%', opacity: 0 }, show: { y: '0%', opacity: 1, transition: { duration: 0.9, ease: EASE } } }

export function SiteFooter() {
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('rodape') === 'antigo') return <SiteFooterClassic />
  return <FooterCard />
}

function FooterCard() {
  const { lang, setLang } = useLanguage()
  const t = copy[lang]
  return (
    <MotionConfig reducedMotion="user">
      <footer className="relative isolate overflow-hidden bg-navy-deep text-white">
        {/* Atmosfera do CTA que continua por trás do cartão (à maneira da Lovable) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_42%_at_50%_42%,rgba(0,82,255,0.16),transparent_72%),radial-gradient(36%_30%_at_86%_55%,rgba(30,144,255,0.07),transparent_70%)]" />

        <div className="mx-auto max-w-content px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <motion.div
            variants={group}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-[24px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-6 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm sm:rounded-[28px] sm:p-10 lg:p-12"
          >
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] lg:gap-16">
              {/* Marca, assinatura e a ação principal (como na Ramp) */}
              <div>
                <motion.div variants={rise}>
                  <Logo />
                </motion.div>
                <motion.p variants={rise} className="mt-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7CB8FF]">
                  <span aria-hidden="true" className="h-px w-6 bg-gradient-to-r from-transparent to-glow" />
                  {t.signature}
                </motion.p>
                <motion.p variants={rise} className="mt-4 max-w-[30ch] font-display text-[22px] font-semibold leading-[1.2] tracking-[-0.025em] text-white sm:text-[24px]">
                  {t.tagline}
                </motion.p>
                <motion.div variants={rise} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a href="/pioneers/" className={buttonClasses({ size: 'md', className: 'group h-11 px-5 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep' })}>
                    {t.primary}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                  <a href="/lista-espera/" className="group inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg px-1 text-[14px] font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow sm:px-3">
                    {t.secondary}
                    <ArrowRight className="h-4 w-4 text-white/50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden="true" />
                  </a>
                </motion.div>
              </div>

              {/* Colunas de ligações (como na Searchable) */}
              <nav aria-label={t.nav} className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:pt-1">
                {t.cols.map((c) => (
                  <motion.div key={c.title} variants={rise}>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{c.title}</h3>
                    <ul className="mt-5 space-y-3.5">
                      {c.links.map((l) => (
                        <li key={l.href}>
                          <a
                            href={l.href}
                            {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            className="group inline-flex items-center gap-1.5 text-[14.5px] text-white/75 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
                          >
                            {l.label}
                            {l.external ? (
                              <ArrowUpRight className="h-3.5 w-3.5 text-white/40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-glow" aria-hidden="true" />
                            ) : (
                              <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-glow opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Linha final: copyright, idioma e voltar ao topo */}
            <motion.div variants={rise} className="mt-12 flex flex-col gap-5 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-14">
              <p className="text-[12.5px] text-white/50">{t.copyright}</p>
              <div className="flex items-center gap-3">
                <div role="group" aria-label={t.lang} className="flex items-center rounded-full border border-white/[0.1] p-0.5 text-[12px] font-semibold">
                  {(['pt', 'en'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      aria-pressed={lang === l}
                      className={cn('rounded-full px-3 py-1 uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow', lang === l ? 'bg-white text-navy' : 'text-white/55 hover:text-white')}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault()
                    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
                  }}
                  className="group inline-flex h-8 items-center gap-2 rounded-full border border-white/[0.1] px-3.5 text-[12px] font-medium text-white/65 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
                >
                  {t.top}
                  <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* A marca em grande, a fechar a página (mantém-se, pedido do fundador) */}
        <motion.div
          aria-hidden="true"
          className="mt-4 overflow-hidden px-4 sm:mt-6 sm:px-6 lg:px-8"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <p
            className="flex select-none justify-center whitespace-nowrap font-display text-[13.2vw] font-semibold leading-[0.88] tracking-[0.055em]"
            style={{ maskImage: 'linear-gradient(to bottom, #000 35%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 35%, transparent 100%)' }}
          >
            {'FINER ONE'.split('').map((ch, i) => (
              <motion.span key={i} variants={letter} className="inline-block bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(124,184,255,0.06))] bg-clip-text text-transparent">
                {ch === ' ' ? ' ' : ch}
              </motion.span>
            ))}
          </p>
        </motion.div>
      </footer>
    </MotionConfig>
  )
}

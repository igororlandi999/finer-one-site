import { MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * VERIFICAÇÃO (11/11/2026)
 * - Plus: único plano "Disponível" em src/data/pricing.ts, preço "a definir";
 *   o botão "Começar Agora" da tabela não tem destino (não há percurso de
 *   adesão aprovado). Benefícios abaixo = módulos listados no Plus.
 * - Pioneers: página /pioneers/ existente; benefícios = "O que ganha" dessa
 *   página. Formulário em modo de pré-visualização enquanto VITE_FORMS_ENDPOINT
 *   não estiver definido (nada é enviado; o ecrã final di-lo).
 * - Lista de espera: /lista-espera/, mesmo modo de pré-visualização.
 * - Destaque: Pioneers — é o CTA azul do menu e o Plus ainda não tem preço nem
 *   percurso de compra. Sem etiqueta "Recomendado".
 */
type Option = { kind: string; name: string; headline: string; desc: string; points: string[]; cta: string; href: string; primary: boolean }

const copy: Record<Lang, { eyebrow: string; title: string; sub: string; options: Option[]; waitPrefix: string; wait: string }> = {
  pt: {
    eyebrow: 'Começar com a Finer One',
    title: 'Escolha como quer começar.',
    sub: 'Conheça a oferta disponível e descubra como fazer parte dos primeiros empresários a utilizar a Finer One.',
    options: [
      {
        kind: 'Plano de subscrição · Preço a definir',
        name: 'Finer Plus',
        headline: 'Comece por compreender melhor o seu negócio.',
        desc: 'Conheça as funcionalidades incluídas no plano Finer Plus e descubra como podem ajudar a acompanhar a gestão financeira da sua empresa.',
        points: ['Chat Financeiro para fazer perguntas (limitado)', 'Receitas, despesas e documentos', 'Clientes e fornecedores e diagnóstico financeiro'],
        cta: 'Conhecer o Finer Plus',
        href: '#precos',
        primary: false,
      },
      {
        kind: 'Programa inicial · Por candidatura',
        name: 'Finer Pioneers',
        headline: 'Faça parte dos primeiros.',
        desc: 'Conheça o programa inicial da Finer One e descubra como pode contribuir para a evolução da plataforma.',
        points: ['Acesso antecipado, antes do lançamento', 'Partilha de feedback que influencia as melhorias', 'Contacto direto com a equipa'],
        cta: 'Ser Finer Pioneer',
        href: '/pioneers/',
        primary: true,
      },
    ],
    waitPrefix: 'Prefere acompanhar à distância?',
    wait: 'Entre na lista de espera',
  },
  en: {
    eyebrow: 'Getting started with Finer One',
    title: 'Choose how you want to start.',
    sub: 'See the available offer and find out how to be among the first business owners using Finer One.',
    options: [
      {
        kind: 'Subscription plan · Price to be announced',
        name: 'Finer Plus',
        headline: 'Start by understanding your business better.',
        desc: 'See the features included in the Finer Plus plan and how they can help you follow your company’s financial management.',
        points: ['Financial Chat to ask questions (limited)', 'Revenue, expenses and documents', 'Clients & suppliers and financial diagnostic'],
        cta: 'Discover Finer Plus',
        href: '#precos',
        primary: false,
      },
      {
        kind: 'Early programme · By application',
        name: 'Finer Pioneers',
        headline: 'Be among the first.',
        desc: 'Discover Finer One’s early programme and how you can help shape the platform.',
        points: ['Early access, before launch', 'Feedback that shapes the improvements', 'Direct contact with the team'],
        cta: 'Become a Finer Pioneer',
        href: '/pioneers/',
        primary: true,
      },
    ],
    waitPrefix: 'Prefer to follow along?',
    wait: 'Join the waitlist',
  },
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }

/**
 * Nova secção 7 — Oferta e conversão. Dois blocos editoriais (Plus e Pioneers)
 * e a lista de espera como alternativa discreta. Substitui a antiga secção de
 * acesso antecipado (?acesso=antigo). O detalhe do Plus continua em #precos.
 */
export function OfferSection() {
  const { lang } = useLanguage()
  const t = copy[lang]
  return (
    <MotionConfig reducedMotion="user">
      <section id="comecar" aria-labelledby="comecar-titulo" className="relative scroll-mt-20 border-t border-[#0B1030]/[0.06] bg-[#F5F8FD] text-navy">
        <motion.div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8 lg:py-20" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="mx-auto max-w-[760px] text-center">
            <motion.p variants={item} className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
              <span aria-hidden="true" className="h-px w-6 bg-accent shadow-[0_0_6px_rgba(0,82,255,0.6)]" />
              {t.eyebrow}
              <span aria-hidden="true" className="h-px w-6 bg-accent shadow-[0_0_6px_rgba(0,82,255,0.6)]" />
            </motion.p>
            <motion.h2 variants={item} id="comecar-titulo" className="mt-4 text-balance font-display text-[32px] font-bold leading-[1.06] tracking-[-0.035em] text-[#070D2B] sm:text-[44px] lg:text-[52px]">
              {t.title}
            </motion.h2>
            <motion.p variants={item} className="mx-auto mt-4 max-w-[560px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          <div className="mx-auto mt-10 grid max-w-[980px] grid-cols-1 gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6">
            {t.options.map((o) => (
              <motion.article
                key={o.name}
                variants={item}
                className={cn(
                  'group flex flex-col rounded-[20px] border bg-white p-6 transition-[border-color,box-shadow,transform] duration-300 sm:p-8 lg:hover:-translate-y-0.5',
                  o.primary
                    ? 'border-accent/45 shadow-[0_24px_60px_-40px_rgba(0,82,255,0.55)] hover:border-accent/70'
                    : 'border-[#0B1030]/[0.1] shadow-[0_20px_50px_-45px_rgba(11,16,48,0.5)] hover:border-[#0B1030]/25',
                )}
              >
                <p className={cn('text-[11.5px] font-semibold uppercase tracking-[0.16em]', o.primary ? 'text-accent-deep' : 'text-[#0B1030]/55')}>{o.kind}</p>
                <h3 className="mt-3 font-display text-[28px] font-bold tracking-[-0.025em] text-[#070D2B] sm:text-[32px]">{o.name}</h3>
                <p className="mt-2 text-[17px] font-semibold leading-snug text-[#070D2B]">{o.headline}</p>
                <p className="mt-2 text-[15px] leading-[1.6] text-[#0B1030]/70">{o.desc}</p>
                <ul className="mt-5 space-y-2.5 border-t border-[#0B1030]/[0.08] pt-5">
                  {o.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[14.5px] leading-snug text-[#0B1030]/80">
                      <span aria-hidden="true" className="mt-[9px] h-px w-3 shrink-0 bg-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-7">
                  <a
                    href={o.href}
                    className={cn(
                      'group/cta inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-6 text-[15px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:w-auto',
                      o.primary
                        ? 'bg-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_26px_-12px_rgba(0,82,255,0.9)] hover:bg-accent-hover'
                        : 'border border-[#0B1030]/15 bg-white text-[#070D2B] hover:border-accent/60 hover:text-accent-deep',
                    )}
                  >
                    {o.cta}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" aria-hidden="true" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.p variants={item} className="mt-8 text-center text-[15px] text-[#0B1030]/65">
            {t.waitPrefix}{' '}
            <a href="/lista-espera/" className="font-semibold text-[#070D2B] underline decoration-[#0B1030]/25 underline-offset-[5px] transition-colors hover:text-accent-deep hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              {t.wait}
            </a>
          </motion.p>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

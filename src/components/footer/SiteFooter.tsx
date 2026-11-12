import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUp, ArrowUpRight } from 'lucide-react'
import { MotionConfig, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { SiteFooterClassic } from './SiteFooterClassic'

/**
 * Rodapé (12/11/2026) — limpo, sem caixas, na linguagem da hero e das secções:
 * navy profundo, tipografia, linhas finas e espaço.
 *
 * Movimento (respeita prefers-reduced-motion):
 *  - em ecrãs onde cabe, o rodapé fica por baixo da página e é "descoberto"
 *    quando a última secção sobe (sticky bottom);
 *  - o conteúdo sobe e ganha nitidez à medida que é revelado;
 *  - "FINER ONE" começa apagado e enche-se de luz com o scroll até ao fim.
 *
 * Referências: Lovable (o rodapé continua a atmosfera do CTA), Searchable
 * (marca à esquerda, colunas à direita, linha legal), Ramp (repete a ação).
 * Só ligações que existem; Privacidade aponta para o aviso (ainda rascunho). Sem Termos (não existem).
 * Versão anterior em ?rodape=antigo.
 */
type Col = { title: string; links: { label: string; href: string; external?: boolean }[] }

const LINKEDIN = 'https://linkedin.com/company/finerone?skipRedirect=true&viewAsMember=true'

const copy: Record<Lang, { signature: string; tagline: [string, string]; cta: string; cols: Col[]; nav: string; copyright: string; top: string; lang: string; privacy: string }> = {
  pt: {
    signature: 'Where Finance Meets Strategy',
    // Os pilares da marca (em vez de repetir "decisões mais claras", já usado no CTA logo acima).
    tagline: ['Compreender hoje. Antecipar amanhã. ', 'Decidir melhor.'],
    cta: 'Ser Finer Pioneer',
    cols: [
      { title: 'Produto', links: [{ label: 'Experimentar', href: '/#experimentar-finer' }, { label: 'Como funciona', href: '/#funcionamento' }, { label: 'Planos', href: '/#precos' }] },
      { title: 'Descobrir', links: [{ label: 'Sobre nós', href: '/sobre/' }, { label: 'Para quem é', href: '/#para-quem' }, { label: 'Segurança', href: '/#seguranca' }, { label: 'Perguntas frequentes', href: '/#faq' }] },
      { title: 'Começar', links: [{ label: 'Finer Pioneers', href: '/pioneers/' }, { label: 'Lista de espera', href: '/lista-espera/' }, { label: 'LinkedIn', href: LINKEDIN, external: true }] },
    ],
    nav: 'Navegação do rodapé',
    copyright: '© 2026 Finer One. Todos os direitos reservados.',
    top: 'Voltar ao topo',
    privacy: 'Privacidade',
    lang: 'Idioma',
  },
  en: {
    signature: 'Where Finance Meets Strategy',
    tagline: ['Understand today. Anticipate tomorrow. ', 'Decide better.'],
    cta: 'Become a Finer Pioneer',
    cols: [
      { title: 'Product', links: [{ label: 'Try it', href: '/#experimentar-finer' }, { label: 'How it works', href: '/#funcionamento' }, { label: 'Plans', href: '/#precos' }] },
      { title: 'Discover', links: [{ label: 'About us', href: '/sobre/' }, { label: 'Who it’s for', href: '/#para-quem' }, { label: 'Security', href: '/#seguranca' }, { label: 'FAQ', href: '/#faq' }] },
      { title: 'Get started', links: [{ label: 'Finer Pioneers', href: '/pioneers/' }, { label: 'Waitlist', href: '/lista-espera/' }, { label: 'LinkedIn', href: LINKEDIN, external: true }] },
    ],
    nav: 'Footer navigation',
    copyright: '© 2026 Finer One. All rights reserved.',
    top: 'Back to top',
    privacy: 'Privacy',
    lang: 'Language',
  },
}

export function SiteFooter() {
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('rodape') === 'antigo') return <SiteFooterClassic />
  return (
    <MotionConfig reducedMotion="user">
      <RevealFooter />
    </MotionConfig>
  )
}

function RevealFooter() {
  const { lang, setLang } = useLanguage()
  const t = copy[lang]
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLElement>(null)
  const [pinned, setPinned] = useState(false)

  // Só fica "por baixo da página" quando cabe inteiro no ecrã (desktop).
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const check = () => setPinned(window.innerWidth >= 1024 && el.offsetHeight <= window.innerHeight)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    window.addEventListener('resize', check)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', check)
    }
  }, [reduced])

  // 0 → o rodapé começa a aparecer; 1 → fim da página. Medido pelo fim do <main>
  // (o rodapé pode estar preso, por isso a sua própria posição não serve).
  const raw = useMotionValue(0)
  useEffect(() => {
    const main = document.getElementById('conteudo')
    const el = ref.current
    if (!main || !el) return
    let raf = 0
    const read = () => {
      raf = 0
      const shown = window.innerHeight - main.getBoundingClientRect().bottom
      raw.set(Math.min(1, Math.max(0, shown / el.offsetHeight)))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf) }
  }, [raw])
  const p = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 })
  const contentY = useTransform(p, [0, 0.85], reduced ? [0, 0] : [36, 0])
  const contentOpacity = useTransform(p, [0, 0.6], reduced ? [1, 1] : [0.15, 1])
  const fill = useTransform(p, [0.45, 1], reduced ? ['inset(0% 0 0 0)', 'inset(0% 0 0 0)'] : ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'])
  const markY = useTransform(p, [0.3, 1], reduced ? ['0%', '0%'] : ['22%', '0%'])

  return (
    <footer ref={ref} className={cn('relative isolate overflow-hidden bg-navy-deep text-white', pinned && 'sticky bottom-0 z-0')}>
      {/* A atmosfera azul do CTA continua aqui, muito suave */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_18%_30%,rgba(0,82,255,0.13),transparent_70%),radial-gradient(45%_40%_at_100%_100%,rgba(30,144,255,0.08),transparent_70%)]" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="mx-auto max-w-content px-5 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pt-12">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-20">
          {/* Marca, assinatura e a ação */}
          <div>
            {/* Sem logótipo aqui: ao chegar ao rodapé ficava logo por baixo do da barra de navegação (repetido);
                a marca fecha a página em grande, em baixo. */}
            {/* Sem a assinatura aqui: "Where Finance Meets Strategy" já fecha o CTA logo acima. */}
            <p className="max-w-[17ch] text-balance font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-[42px]">
              {t.tagline[0]}
              <span className="text-[#3D86FF]">{t.tagline[1]}</span>
            </p>
            <a href="/pioneers/" className="group mt-8 inline-flex items-center gap-4 focus-visible:outline-none">
              <span className="relative text-[16px] font-semibold text-white">
                {t.cta}
                <span aria-hidden="true" className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-[0.25] bg-white/50 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100" />
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-focus-visible:ring-2 group-focus-visible:ring-glow">
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </a>
          </div>

          {/* Ligações */}
          <nav aria-label={t.nav} className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:pt-2">
            {t.cols.map((c) => (
              <div key={c.title}>
                <h3 className="text-[13px] font-medium text-white/40">{c.title}</h3>
                <ul className="mt-6 space-y-4">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="group inline-flex items-center gap-2 text-[16px] text-white/80 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none"
                      >
                        <span className="transition-transform duration-300 group-hover:translate-x-1">{l.label}</span>
                        {l.external ? (
                          <ArrowUpRight className="h-4 w-4 text-white/35 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1.5 group-hover:text-glow" aria-hidden="true" />
                        ) : (
                          <ArrowRight className="h-4 w-4 -translate-x-2 text-glow opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Linha final */}
        <div className="mt-10 flex flex-col gap-5 border-t border-white/[0.08] py-7 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between lg:mt-12">
          <p className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>{t.copyright}</span>
            <a href="/privacidade/" className="transition-colors hover:text-white">{t.privacy}</a>
          </p>
          <div className="flex items-center gap-8">
            <div role="group" aria-label={t.lang} className="flex items-center gap-3">
              {(['pt', 'en'] as const).map((l, i) => (
                <span key={l} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden="true" className="h-3 w-px bg-white/20" />}
                  <button
                    type="button"
                    onClick={() => setLang(l)}
                    aria-pressed={lang === l}
                    className={cn('uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow', lang === l ? 'font-semibold text-white' : 'hover:text-white')}
                  >
                    {l}
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
              className="group inline-flex items-center gap-2 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
            >
              {t.top}
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* FINER ONE: começa apagado e enche-se de luz até ao fim da página */}
      <motion.div aria-hidden="true" style={{ y: markY }} className="relative select-none px-3 sm:px-5 lg:px-6">
        <div className="relative whitespace-nowrap text-center font-display text-[15.4vw] font-bold leading-[0.8] tracking-[-0.02em]" style={{ maskImage: 'linear-gradient(to bottom, #000 55%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 55%, transparent 100%)' }}>
          {/* Base apagada em preenchimento (não em contorno: o contorno desenhava linhas no interior do R) */}
          <span className="block text-white/[0.07]">FINER ONE</span>
          <motion.span style={{ clipPath: fill }} className="absolute inset-0 block bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(124,184,255,0.55)_55%,rgba(0,82,255,0.25)_100%)] bg-clip-text text-transparent">
            FINER ONE
          </motion.span>
        </div>
      </motion.div>
    </footer>
  )
}

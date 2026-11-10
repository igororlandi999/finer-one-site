import { useEffect, useRef, useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import { PANEL_H, PANEL_W, StoryPanel } from './StoryPanel'
import { ScenarioExplorer } from './ScenarioExplorer'

const copy = {
  pt: {
    eyebrow: 'O negócio cresce. Os desafios também.',
    title: ['Faturar não é o mesmo que ', 'receber', '.'],
    sub: 'Uma empresa pode vender bem e, ainda assim, enfrentar dificuldades de tesouraria. O importante é perceber o que está por trás dos números.',
    steps: [
      { n: '01', tag: 'O problema', title: 'Há dinheiro por receber. Mas quando vai entrar?', body: '€ 50.948,60 em faturas por receber, todas com o prazo ultrapassado. Faturar foi a parte fácil: para a tesouraria, conta o dia em que o dinheiro entra.' },
      { n: '02', tag: 'A descoberta', title: 'O verdadeiro risco está nos detalhes.', body: 'Um único cliente representa 88,3% do valor em atraso. Quando um recebimento pesa tanto, a tesouraria fica dependente de uma só decisão de pagamento.' },
      { n: '03', tag: 'O impacto', title: 'O problema não termina na fatura.', body: 'Cruzando os recebimentos com os compromissos dos próximos 15 dias: sem novas entradas, faltariam € 9.659,68. O atraso de hoje condiciona as decisões de amanhã.' },
      { n: '04', tag: 'A recomendação', title: 'Saber o que acontece é importante. Saber o que fazer é essencial.', body: 'A Finer One reúne o que os dados mostram e propõe um plano de ação por prioridade — começando pelo que tem mais impacto na tesouraria.' },
    ],
    note: 'Exemplo ilustrativo com dados fictícios.',
  },
  en: {
    eyebrow: 'The business grows. So do the challenges.',
    title: ['Invoicing is not the same as ', 'getting paid', '.'],
    sub: 'A company can sell well and still face cash difficulties. What matters is understanding what lies behind the numbers.',
    steps: [
      { n: '01', tag: 'The problem', title: 'There is money to collect. But when will it come in?', body: '€ 50,948.60 in receivable invoices, all past due. Invoicing was the easy part: for your cash, what counts is the day the money arrives.' },
      { n: '02', tag: 'The discovery', title: 'The real risk is in the details.', body: 'A single customer accounts for 88.3% of the overdue amount. When one payment weighs that much, your cash depends on a single payment decision.' },
      { n: '03', tag: 'The impact', title: 'The problem does not end with the invoice.', body: 'Crossing receivables with the next 15 days of commitments: with no new inflows, you would be € 9,659.68 short. Today’s delay shapes tomorrow’s decisions.' },
      { n: '04', tag: 'The recommendation', title: 'Knowing what happens matters. Knowing what to do is essential.', body: 'Finer One brings together what the data shows and proposes a prioritised action plan — starting with what has the most impact on cash.' },
    ],
    note: 'Illustrative example with fictitious data.',
  },
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const ramp = (x: number, a: number, b: number) => clamp((x - a) / (b - a))

/**
 * Segunda secção: scrollytelling financeiro.
 *
 * Desktop: pista de ~240vh de scroll com palco sticky — texto editorial à
 * esquerda, análise "Finer Advisor" à direita, ambos controlados pelo mesmo
 * progresso (simétrico: funciona a descer e a subir). Telemóvel: quatro
 * momentos em sequência vertical, cada um com o painel no estado respetivo.
 * Depois, exemplos interativos (Recebimentos · Custos · Tesouraria).
 */
export function FinancialStory() {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <section id="problema" aria-labelledby="historia-titulo" className="relative z-10 scroll-mt-16 bg-navy">
      <div className="relative rounded-[28px] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F8FD_55%,#F1F5FD_100%)] sm:mx-3 sm:rounded-[40px]">
        {/* Introdução */}
        <div className="relative mx-auto max-w-[1200px] px-6 pt-20 sm:px-10 sm:pt-24 lg:px-12 lg:pt-28">
          <Intro t={t} />
        </div>

        <DesktopStory t={t} lang={lang} />
        <MobileStory t={t} lang={lang} />

        <div className="relative mx-auto max-w-[1200px] px-6 pb-20 sm:px-10 sm:pb-24 lg:px-12 lg:pb-28">
          <ScenarioExplorer />
        </div>
      </div>
    </section>
  )
}

function Intro({ t }: { t: (typeof copy)['pt'] }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  return (
    <div ref={ref} className={cn('max-w-[860px]', inView ? 'animate-fade-up' : 'opacity-0')}>
      <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
        <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-accent" />
        {t.eyebrow}
      </p>
      <h2 id="historia-titulo" className="mt-5 text-balance font-display text-[36px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[52px] lg:text-[62px]">
        {t.title[0]}
        <span className="text-accent">{t.title[1]}</span>
        {t.title[2]}
      </h2>
      <p className="mt-6 max-w-[620px] text-[16.5px] leading-[1.65] text-[#0B1030]/70 sm:text-[18px]">{t.sub}</p>
    </div>
  )
}

/* ---------------- Desktop: palco sticky controlado pelo scroll ---------------- */
function DesktopStory({ t, lang }: { t: (typeof copy)['pt']; lang: 'pt' | 'en' }) {
  const reduced = usePrefersReducedMotion()
  const [s, setS] = useState(0)
  const colRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const ref = useScrollProgress<HTMLDivElement>({
    mode: 'through',
    reducedValue: null,
    onProgress: (p) => {
      const raw = clamp(p * 4.1 + 0.06, 0, 4)
      // Movimento reduzido: cada momento aparece completo, sem animação intermédia.
      const next = reduced ? Math.min(3, Math.floor(raw)) + 0.85 : raw
      setS((cur) => (Math.abs(cur - next) < 0.0005 ? cur : next))
    },
  })

  // Escala do painel: cabe na coluna e na altura do ecrã.
  useEffect(() => {
    const el = colRef.current
    if (!el) return
    const fit = () => {
      const w = el.clientWidth
      const h = window.innerHeight - 150
      setScale(Math.max(0.7, Math.min(w / PANEL_W, h / PANEL_H, 1.32)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [])

  const active = Math.min(3, Math.floor(s))

  return (
    <div ref={ref} className="relative hidden lg:block" style={{ height: '340vh' }}>
      <div className="sticky top-0 flex h-screen items-center pt-14">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-14 px-12">
          {/* Texto editorial */}
          <div className="relative">
            <ol className="mb-10 flex gap-2" aria-label={lang === 'pt' ? 'Etapas da análise' : 'Analysis steps'}>
              {t.steps.map((step, i) => (
                <li key={step.n} className="flex-1" aria-current={active === i ? 'step' : undefined}>
                  <span className="block h-[2px] overflow-hidden rounded-full bg-[#0B1030]/[0.1]">
                    <span className="block h-full origin-left bg-gradient-to-r from-accent to-glow shadow-[0_0_8px_rgba(30,144,255,0.7)]" style={{ transform: `scaleX(${clamp(s - i)})` }} />
                  </span>
                  <span className={cn('mt-2.5 block whitespace-nowrap text-[12px] font-semibold transition-colors duration-300', active === i ? 'text-[#070D2B]' : 'text-[#0B1030]/40')}>
                    <span className="mr-1.5 text-accent">{step.n}</span>
                    {(([w]) => w.charAt(0).toUpperCase() + w.slice(1))([step.tag.replace(/^(O|A|The) /, '')])}
                  </span>
                </li>
              ))}
            </ol>
            <div className="relative h-[300px]">
              {t.steps.map((step, i) => {
                const inV = i === 0 ? 1 : ramp(s, i + 0.0, i + 0.12)
                const outV = i === 3 ? 1 : 1 - ramp(s, i + 0.84, i + 0.96)
                const o = Math.min(inV, outV)
                const dy = (1 - inV) * 18 - (1 - outV) * 18
                return (
                  <div key={step.n} className="absolute inset-x-0 top-0" style={{ opacity: o, transform: `translate3d(0, ${dy}px, 0)`, visibility: o < 0.01 ? 'hidden' : 'visible' }} aria-hidden={active !== i}>
                    <h3 className="text-balance font-display text-[34px] font-bold leading-[1.1] tracking-[-0.03em] text-[#070D2B] xl:text-[38px]">{step.title}</h3>
                    <p className="mt-5 max-w-[440px] text-[16.5px] leading-[1.65] text-[#0B1030]/70">{step.body}</p>
                  </div>
                )
              })}
            </div>
            <p className="text-[12px] text-[#0B1030]/45">{t.note}</p>
          </div>

          {/* Análise */}
          <div ref={colRef} className="flex justify-center">
            <StoryPanel s={s} lang={lang} scale={scale} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Telemóvel e tablet: quatro momentos em sequência ---------------- */
function MobileStory({ t, lang }: { t: (typeof copy)['pt']; lang: 'pt' | 'en' }) {
  return (
    <div className="mx-auto max-w-[640px] px-6 pt-14 sm:px-10 lg:hidden">
      <ol className="relative space-y-16 sm:border-l sm:border-[#0B1030]/[0.08] sm:pl-6">
        {t.steps.map((step, i) => (
          <MobileMoment key={step.n} step={step} i={i} lang={lang} />
        ))}
      </ol>
      <p className="mt-6 text-[12px] text-[#0B1030]/45">{t.note}</p>
    </div>
  )
}

function MobileMoment({ step, i, lang }: { step: (typeof copy)['pt']['steps'][number]; i: number; lang: 'pt' | 'en' }) {
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLLIElement>({ threshold: 0.25 })
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.68)
  const [s, setS] = useState(i)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const fit = () => setScale(Math.min(1, el.clientWidth / PANEL_W))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Ao entrar no ecrã, a análise deste momento desenrola-se uma vez (1,8 s).
  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setS(i + 0.85)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 1800)
      setS(i + 0.85 * k)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, i])

  return (
    <li ref={ref} className="relative">
      <span aria-hidden="true" className={cn('absolute -left-[30px] top-1 hidden h-[11px] sm:block w-[11px] rounded-full border-2 transition-all duration-500', inView ? 'border-accent bg-accent shadow-[0_0_0_4px_rgba(0,82,255,0.12),0_0_12px_rgba(30,144,255,0.6)]' : 'border-[#0B1030]/20 bg-white')} />
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent">{step.n} · {step.tag}</p>
      <h3 className="mt-2 text-balance font-display text-[24px] font-bold leading-[1.15] tracking-[-0.025em] text-[#070D2B] sm:text-[28px]">{step.title}</h3>
      <p className="mt-3 text-[15.5px] leading-[1.6] text-[#0B1030]/70">{step.body}</p>
      <div ref={boxRef} className="-mx-5 mt-6 sm:mx-0">
        <StoryPanel s={s} lang={lang} scale={scale} />
      </div>
    </li>
  )
}

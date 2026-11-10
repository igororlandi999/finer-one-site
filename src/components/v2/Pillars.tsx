import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const copy: Record<Lang, { eyebrow: string; title: [string, string]; sub: string; note: string; cards: { n: string; name: string; line: string }[] }> = {
  pt: {
    eyebrow: 'Compreender · Antecipar · Decidir',
    title: ['Compreenda hoje. Antecipe amanhã. ', 'Decida melhor.'],
    sub: 'A Finer One reúne a informação financeira da empresa e mostra o que mudou, o que vem aí e por onde começar.',
    note: 'Exemplos com dados fictícios.',
    cards: [
      { n: '01', name: 'Compreender', line: 'O essencial do negócio, num relance.' },
      { n: '02', name: 'Antecipar', line: 'O que vem aí, antes de ser urgente.' },
      { n: '03', name: 'Decidir', line: 'O que fazer primeiro, por ordem de impacto.' },
    ],
  },
  en: {
    eyebrow: 'Understand · Anticipate · Decide',
    title: ['Understand today. Anticipate tomorrow. ', 'Decide better.'],
    sub: 'Finer One brings your company’s financial information together and shows what changed, what is coming and where to start.',
    note: 'Examples with fictitious data.',
    cards: [
      { n: '01', name: 'Understand', line: 'The essentials of your business, at a glance.' },
      { n: '02', name: 'Anticipate', line: 'What is coming, before it becomes urgent.' },
      { n: '03', name: 'Decide', line: 'What to do first, ranked by impact.' },
    ],
  },
}

/**
 * Terceira secção: os três pilares como três cartões de produto compactos.
 * Sem scroll preso: o conjunto entra uma vez (cartões em sequência, linha azul
 * a ligá-los) e cada cartão mostra uma pequena interface viva da plataforma.
 * Substitui o PillarsScrolly (preservado em ?pilares=antigo).
 */
export function Pillars() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 })
  const on = reduced || inView

  return (
    <section id="como-funciona" aria-labelledby="pilares-titulo" className="relative scroll-mt-16 overflow-hidden bg-navy py-20 sm:py-24">
      {/* Fundo limpo: apenas uma luz azul muito ténue */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_70%_at_50%_0%,rgba(0,82,255,0.16),transparent_70%)]" />

      <div ref={ref} className="relative mx-auto max-w-[1200px] px-5 sm:px-10 lg:px-12">
        <div className={cn('mx-auto max-w-[760px] text-center', on ? 'animate-fade-up' : 'opacity-0')}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7CB8FF]">{t.eyebrow}</p>
          <h2 id="pilares-titulo" className="mt-4 text-balance font-display text-[30px] font-bold leading-[1.08] tracking-[-0.032em] text-white sm:text-[40px] lg:text-[46px]">
            {t.title[0]}
            <span className="text-glow [text-shadow:0_0_32px_rgba(30,144,255,0.45)]">{t.title[1]}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-[16px] leading-[1.6] text-white/70 sm:text-[17px]">{t.sub}</p>
        </div>

        <div className="relative mt-12 lg:mt-14">
          {/* Linha azul que liga os três momentos (desktop) */}
          <div aria-hidden="true" className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-0 hidden h-px bg-white/[0.08] lg:block">
            <span
              className="absolute inset-0 origin-left bg-gradient-to-r from-accent via-glow to-accent shadow-[0_0_12px_rgba(30,144,255,0.8)] transition-transform duration-[1400ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{ transform: `scaleX(${on ? 1 : 0})`, transitionDelay: '350ms' }}
            />
          </div>

          <ol className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3 lg:gap-5">
            {t.cards.map((card, i) => (
              <li key={card.n} className="relative lg:pt-7">
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-[-5px] hidden h-[11px] w-[11px] -translate-x-1/2 rounded-full border-2 transition-all duration-500 lg:block"
                  style={{
                    borderColor: on ? '#1E90FF' : 'rgba(255,255,255,0.25)',
                    backgroundColor: on ? '#0052FF' : '#070D2B',
                    boxShadow: on ? '0 0 0 4px rgba(0,82,255,0.18), 0 0 14px rgba(30,144,255,0.8)' : 'none',
                    transitionDelay: `${450 + i * 450}ms`,
                  }}
                />
                <article
                  className={cn(
                    'group h-full rounded-[20px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:shadow-[0_24px_60px_-30px_rgba(0,82,255,0.6)] sm:p-6',
                    on ? 'animate-fade-up' : 'opacity-0',
                  )}
                  style={on && !reduced ? { animationDelay: `${150 + i * 140}ms` } : undefined}
                >
                  <p className="text-[12px] font-semibold tracking-[0.16em] text-glow">{card.n}</p>
                  <h3 className="mt-2 font-display text-[22px] font-bold tracking-[-0.02em] text-white">{card.name}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.5] text-white/70">{card.line}</p>
                  <div className="mt-5 h-[226px] overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#060B24]/90 p-4">
                    {i === 0 && <Understand lang={lang} on={on} />}
                    {i === 1 && <Anticipate lang={lang} on={on} />}
                    {i === 2 && <Decide lang={lang} on={on} />}
                  </div>
                </article>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-center text-[12px] text-white/45">{t.note}</p>
        </div>
      </div>
    </section>
  )
}

/** Entrada em sequência dos elementos da interface (só opacity/transform). */
function Show({ on, delay, children, className }: { on: boolean; delay: number; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]', className)}
      style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translate3d(0,8px,0)', transitionDelay: on ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

const uiLabel = 'text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/50'

/* 01 · Compreender — indicadores principais */
function Understand({ lang, on }: { lang: Lang; on: boolean }) {
  const pt = lang === 'pt'
  const kpis = [
    { l: pt ? 'Saldo disponível' : 'Available balance', v: '€ 28.540', d: '', tone: '' },
    { l: pt ? 'Por receber' : 'Receivable', v: '€ 50.949', d: pt ? '6 em atraso' : '6 overdue', tone: 'warn' },
    { l: pt ? 'Receitas' : 'Revenue', v: '€ 61.870', d: '+4%', tone: 'up' },
    { l: pt ? 'Despesas' : 'Expenses', v: '€ 44.150', d: '+18%', tone: 'down' },
  ]
  return (
    <div>
      <p className={uiLabel}>{pt ? 'Este mês' : 'This month'}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {kpis.map((k, i) => (
          <Show key={k.l} on={on} delay={450 + i * 90}>
            <div className="rounded-[10px] border border-white/[0.07] bg-white/[0.035] px-3 py-2">
              <p className="text-[11.5px] text-white/60">{k.l}</p>
              <p className="mt-0.5 text-[17px] font-bold tracking-[-0.02em] text-white tabular-nums">{k.v}</p>
              <p className={cn('text-[11px] font-semibold', k.tone === 'up' ? 'text-[#5AB4FF]' : k.tone === 'down' ? 'text-[#FF9A5C]' : k.tone === 'warn' ? 'text-[#F0B429]' : 'text-transparent')}>{k.d || '·'}</p>
            </div>
          </Show>
        ))}
      </div>
    </div>
  )
}

/* 02 · Antecipar — tendência de tesouraria e alerta */
function Anticipate({ lang, on }: { lang: Lang; on: boolean }) {
  const pt = lang === 'pt'
  const real = 'M0 70 C 30 66, 55 56, 85 58 S 140 40, 170 44'
  const forecast = 'M170 44 C 200 48, 222 74, 252 86 S 300 92, 320 78'
  const draw = (delay: number) => ({
    strokeDasharray: 1,
    strokeDashoffset: on ? 0 : 1,
    transition: `stroke-dashoffset 1.1s cubic-bezier(0.65,0,0.35,1) ${on ? delay : 0}ms`,
  })
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className={uiLabel}>{pt ? 'Tesouraria' : 'Cash'}</p>
        <p className="text-[10.5px] text-white/50">{pt ? 'próximas 8 semanas' : 'next 8 weeks'}</p>
      </div>
      <svg viewBox="0 0 320 104" className="mt-2 h-[96px] w-full" aria-hidden="true">
        <line x1="0" x2="320" y1="80" y2="80" stroke="#F0B429" strokeOpacity="0.6" strokeDasharray="3 5" />
        <path d={real} pathLength={1} stroke="#1E90FF" strokeWidth="2.5" fill="none" style={draw(450)} />
        <path d={forecast} pathLength={1} stroke="white" strokeOpacity="0.55" strokeWidth="2" fill="none" style={draw(950)} />
        <circle cx="252" cy="86" r="4.5" fill="#F0B429" style={{ opacity: on ? 1 : 0, transition: `opacity .4s ${on ? 1700 : 0}ms` }} />
      </svg>
      <Show on={on} delay={1700}>
        <div className="mt-2 flex items-start gap-2.5 rounded-[10px] border border-[#F0B429]/30 bg-[#F0B429]/[0.08] px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F0B429]" aria-hidden="true" />
          <p className="text-[12.5px] leading-snug text-white/85">{pt ? 'O saldo pode ficar abaixo do mínimo definido dentro de 6 semanas.' : 'The balance may fall below the set minimum within 6 weeks.'}</p>
        </div>
      </Show>
    </div>
  )
}

/* 03 · Decidir — prioridades por impacto */
function Decide({ lang, on }: { lang: Lang; on: boolean }) {
  const pt = lang === 'pt'
  const items = pt
    ? [{ t: 'Contactar o Cliente A', v: '€ 45.000' }, { t: 'Rever pagamentos', v: '15 dias' }, { t: 'Analisar fornecedores', v: '+€ 4.120' }]
    : [{ t: 'Contact Customer A', v: '€ 45,000' }, { t: 'Review payments', v: '15 days' }, { t: 'Review suppliers', v: '+€ 4,120' }]
  return (
    <div>
      <p className={uiLabel}>{pt ? 'Prioridades de hoje' : 'Today’s priorities'}</p>
      <ol className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={it.t} className="transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translate3d(0,8px,0)", transitionDelay: on ? `${650 + i * 140}ms` : "0ms" }}>
            <div
              className={cn(
                'flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5',
                i === 0 ? 'border-accent/60 bg-accent/[0.16] shadow-[0_0_24px_-10px_rgba(0,82,255,0.9)]' : 'border-white/[0.07] bg-white/[0.035]',
              )}
            >
              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', i === 0 ? 'bg-accent text-white' : 'text-white/70 ring-1 ring-white/20')}>{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white">{it.t}</span>
              <span className="shrink-0 text-[12px] font-semibold text-white/65 tabular-nums">{it.v}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

import { ArrowUp } from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

type Item = { title: string; text: string; question: string; example: string }

const copy: Record<Lang, {
  eyebrow: string; titleA: string; titleB: string; sub: string
  ask: string; exampleTag: string; items: Item[]
}> = {
  pt: {
    eyebrow: 'Os desafios de quem gere',
    titleA: 'O negócio cresce.',
    titleB: 'Os desafios também.',
    sub: 'Clientes que pagam tarde, custos que aumentam e decisões que não podem esperar. O primeiro passo é compreender o impacto de cada situação.',
    ask: 'Pergunte à Finer Home',
    exampleTag: 'Exemplo',
    items: [
      {
        title: 'Os clientes atrasam pagamentos.',
        text: 'Sabe quanto tem por receber e como esses atrasos podem afetar a tesouraria?',
        question: 'Quem ainda não pagou?',
        example: '7 faturas em atraso, no total de € 18.640. Três clientes concentram 72% do valor.',
      },
      {
        title: 'Os custos continuam a aumentar.',
        text: 'Consegue identificar o que está a pressionar os resultados do negócio?',
        question: 'Onde estou a perder margem?',
        example: 'As saídas de caixa subiram 11,6% face ao mês anterior, sobretudo em fornecedores.',
      },
      {
        title: 'As decisões não podem esperar.',
        text: 'Tem informação suficientemente clara para saber onde deve agir primeiro?',
        question: 'O que merece a minha atenção agora?',
        example: 'Prioridade de hoje: contactar os 3 clientes com maior valor em atraso.',
      },
    ],
  },
  en: {
    eyebrow: 'The challenges of running a business',
    titleA: 'The business grows.',
    titleB: 'So do the challenges.',
    sub: 'Customers who pay late, rising costs and decisions that cannot wait. The first step is understanding the impact of each situation.',
    ask: 'Ask Finer Home',
    exampleTag: 'Example',
    items: [
      {
        title: 'Customers pay late.',
        text: 'Do you know how much you are owed and how those delays could affect your cash?',
        question: 'Who still hasn’t paid?',
        example: '7 overdue invoices, € 18,640 in total. Three customers account for 72% of it.',
      },
      {
        title: 'Costs keep rising.',
        text: 'Can you tell what is putting pressure on your results?',
        question: 'Where am I losing margin?',
        example: 'Cash outflows rose 11.6% on last month, mostly suppliers.',
      },
      {
        title: 'Decisions cannot wait.',
        text: 'Is your information clear enough to know where to act first?',
        question: 'What deserves my attention now?',
        example: 'Today’s priority: contact the 3 customers with the most overdue.',
      },
    ],
  },
}

/** Tempo (ms) em que a linha azul chega a cada desafio. */
const STEP = 520

/**
 * Segunda secção: os desafios reais do empresário.
 *
 * Fundo claro (contraste com a hero navy), composição editorial e três
 * situações ligadas pela linha azul luminosa da Finer One, que se desenha ao
 * ritmo da leitura e acende cada ponto quando lá chega. Cada situação mostra
 * a pergunta que o empresário faria à Finer Home e um exemplo de resposta com
 * dados fictícios (funcionalidades existentes: Finer Home, Receitas,
 * Despesas, Finer Advisor).
 */
export function Challenges() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 })
  const on = reduced || inView

  return (
    <section id="problema" aria-labelledby="desafios-titulo" className="relative z-10 scroll-mt-24 bg-navy">
      <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#FFFFFF_0%,#F5F7FC_100%)] sm:mx-3 sm:rounded-[40px]">
        {/* Grelha de pontos muito ténue, só no canto — textura discreta */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[520px] bg-[radial-gradient(rgba(11,16,48,0.09)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(closest-side,black,transparent)]" />

        <div className="relative mx-auto max-w-[1200px] px-6 py-20 sm:px-10 sm:py-24 lg:px-12 lg:py-28">
          {/* Cabeçalho editorial: título à esquerda, contexto à direita */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div className={cn(on ? 'animate-fade-up' : 'opacity-0')}>
              <p className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.28em] text-accent">
                <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-accent" />
                {t.eyebrow}
              </p>
              <h2 id="desafios-titulo" className="mt-5 font-display text-[34px] font-bold leading-[1.06] tracking-[-0.032em] text-[#070D2B] sm:text-[44px] lg:text-[50px]">
                <span className="block">{t.titleA}</span>
                <span className="block text-accent">{t.titleB}</span>
              </h2>
            </div>
            <p className={cn('max-w-[460px] text-[16px] leading-[1.65] text-[#0B1030]/70 sm:text-[17px] lg:pb-2', on ? 'animate-fade-up [animation-delay:120ms]' : 'opacity-0')}>
              {t.sub}
            </p>
          </div>

          {/* Três situações ligadas pela linha azul */}
          <div ref={ref} className="relative mt-14 sm:mt-16 lg:mt-20">
            <ThreadLine on={on} reduced={reduced} />
            <ol className="relative grid gap-12 pl-9 lg:grid-cols-3 lg:gap-0 lg:pl-0">
              {t.items.map((item, i) => (
                <li
                  key={item.title}
                  className={cn('relative lg:pt-12', i > 0 && 'lg:border-l lg:border-[#0B1030]/[0.07] lg:pl-10', i < 2 && 'lg:pr-10')}
                >
                  <Node on={on} delay={reduced ? 0 : 200 + i * STEP} first={i === 0} />
                  <div
                    style={on && !reduced ? { animationDelay: `${260 + i * STEP}ms` } : undefined}
                    className={cn(on ? 'animate-fade-up' : 'opacity-0')}
                  >
                    <p className="font-display text-[13px] font-semibold tabular-nums tracking-[0.12em] text-accent">0{i + 1}</p>
                    <h3 className="mt-3 text-balance font-display text-[21px] font-bold leading-[1.2] tracking-[-0.02em] text-[#070D2B] sm:text-[22px]">{item.title}</h3>
                    <p className="mt-3 max-w-[340px] text-[15px] leading-[1.6] text-[#0B1030]/65">{item.text}</p>
                    <AskChip label={t.ask} question={item.question} example={item.example} tag={t.exampleTag} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * A linha azul da Finer One: horizontal no desktop (sobre os três pontos),
 * vertical no telemóvel (à esquerda). Desenha-se uma vez, com um ponto de luz
 * na extremidade; sem repetições nem brilho contínuo.
 */
function ThreadLine({ on, reduced }: { on: boolean; reduced: boolean }) {
  const dur = reduced ? '0ms' : `${STEP * 2 + 500}ms`
  const ease = 'cubic-bezier(0.65,0,0.35,1)'
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Desktop */}
      <div className="absolute left-0 right-[8%] top-[5px] hidden h-px bg-[#0B1030]/[0.08] lg:block">
        <div
          className="absolute inset-y-0 left-0 w-full origin-left bg-[linear-gradient(90deg,rgba(0,82,255,0)_0%,#0052FF_18%,#1E90FF_100%)] shadow-[0_0_10px_rgba(30,144,255,0.7)]"
          style={{ transform: `scaleX(${on ? 1 : 0})`, transition: `transform ${dur} ${ease} 200ms` }}
        />
        <div
          className="absolute -top-[3px] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(30,144,255,0.35),0_0_14px_4px_rgba(30,144,255,0.8)]"
          style={{ left: on ? '100%' : '0%', opacity: on && !reduced ? 1 : 0, transition: `left ${dur} ${ease} 200ms, opacity 600ms ease ${STEP * 2 + 900}ms` }}
        />
      </div>
      {/* Telemóvel */}
      <div className="absolute bottom-6 left-[5px] top-[6px] w-px bg-[#0B1030]/[0.08] lg:hidden">
        <div
          className="absolute inset-x-0 top-0 h-full origin-top bg-[linear-gradient(180deg,#0052FF,#1E90FF_70%,rgba(30,144,255,0))] shadow-[0_0_8px_rgba(30,144,255,0.6)]"
          style={{ transform: `scaleY(${on ? 1 : 0})`, transition: `transform ${dur} ${ease} 200ms` }}
        />
      </div>
    </div>
  )
}

/** Ponto de cada situação: acende quando a linha lá chega. */
function Node({ on, delay, first }: { on: boolean; delay: number; first: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute top-[2px] h-[11px] w-[11px] rounded-full border-2 lg:top-0',
        first ? '-left-9 lg:left-0' : '-left-9 lg:left-10',
      )}
      style={{
        borderColor: on ? '#0052FF' : 'rgba(11,16,48,0.18)',
        backgroundColor: on ? '#0052FF' : '#FFFFFF',
        boxShadow: on ? '0 0 0 4px rgba(0,82,255,0.12), 0 0 14px rgba(30,144,255,0.55)' : 'none',
        transition: `background-color 500ms ease ${delay}ms, border-color 500ms ease ${delay}ms, box-shadow 500ms ease ${delay}ms`,
      }}
    />
  )
}

/** A pergunta que o empresário faria, como na caixa "Ask Finer" da Finer Home. */
function AskChip({ label, question, example, tag }: { label: string; question: string; example: string; tag: string }) {
  return (
    <div className="mt-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B1030]/45">{label}</p>
      <div className="group mt-2.5 flex max-w-[360px] items-center gap-3 rounded-full border border-[#0B1030]/[0.1] bg-white py-1.5 pl-4 pr-1.5 shadow-[0_8px_24px_-16px_rgba(11,16,48,0.35)] transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[0_0_0_4px_rgba(0,82,255,0.08),0_10px_28px_-16px_rgba(0,82,255,0.5)]">
        <span className="min-w-0 flex-1 text-[13.5px] font-medium leading-snug text-[#070D2B]">{question}</span>
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_6px_14px_-6px_rgba(0,82,255,0.9)] transition-transform duration-300 group-hover:-translate-y-0.5">
          <ArrowUp className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-3 flex max-w-[360px] gap-2 text-[13px] leading-[1.55] text-[#0B1030]/60">
        <span className="mt-[1px] h-fit shrink-0 rounded-[5px] bg-accent/[0.08] px-1.5 py-[1px] text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">{tag}</span>
        <span>{example}</span>
      </p>
    </div>
  )
}

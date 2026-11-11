import { useRef } from 'react'
import { MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import type { MotionValue, Variants } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

type Context = { segment: string; title: string; question: string; text: string; message: string }

/**
 * Perfis que estamos a testar (Market Validation) — não são segmentos
 * comercialmente validados nem testemunhos de clientes.
 */
const copy: Record<Lang, { eyebrow: string; title: [string, string]; sub: string; label: string; fit: string; contexts: Context[] }> = {
  pt: {
    eyebrow: 'Para quem é',
    title: ['Há decisões que não podem esperar', 'pelo fim do mês.'],
    sub: 'Quando os clientes atrasam, os custos aumentam ou o negócio cresce, a informação financeira tem de acompanhar.',
    label: 'Três situações que um gestor reconhece',
    fit: 'Para PME com clientes empresariais, valores a receber, custos recorrentes e dados financeiros dispersos.',
    contexts: [
      {
        segment: 'Distribuição e comércio B2B',
        title: 'Clientes que pagam tarde',
        question: 'Vendo bastante. Porque é que o dinheiro demora a entrar?',
        text: 'Acompanhe os valores por receber, os prazos e os pagamentos em atraso para compreender melhor a sua tesouraria.',
        message: 'Faturar não é o mesmo que receber.',
      },
      {
        segment: 'Empresas de serviços',
        title: 'Custos que não param',
        question: 'O negócio está a crescer. Será que consigo acompanhar os custos?',
        text: 'Compare receitas, despesas e compromissos para perceber como evolui a situação financeira da empresa.',
        message: 'Crescer exige conhecer o impacto financeiro.',
      },
      {
        segment: 'Empresas em crescimento',
        title: 'Mais vendas, menos liquidez',
        question: 'Estou a vender mais. Porque é que a tesouraria continua apertada?',
        text: 'Explore a diferença entre faturação, recebimentos e pagamentos para compreender possíveis pressões de caixa.',
        message: 'Crescimento e liquidez nem sempre avançam ao mesmo ritmo.',
      },
    ],
  },
  en: {
    eyebrow: 'Who it’s for',
    title: ['Some decisions can’t wait', 'for month-end.'],
    sub: 'When customers pay late, costs rise or the business grows, financial information has to keep up.',
    label: 'Three situations every manager recognises',
    fit: 'For SMEs with business customers, receivables, recurring costs and scattered financial data.',
    contexts: [
      {
        segment: 'B2B distribution and trade',
        title: 'Customers who pay late',
        question: 'I sell a lot. Why does the money take so long to come in?',
        text: 'Follow receivables, due dates and late payments to better understand your cash.',
        message: 'Invoicing is not the same as getting paid.',
      },
      {
        segment: 'Service companies',
        title: 'Costs that keep coming',
        question: 'The business is growing. Can I keep track of the costs?',
        text: 'Compare revenue, expenses and commitments to see how the company’s financial position evolves.',
        message: 'Growing means knowing the financial impact.',
      },
      {
        segment: 'Growing companies',
        title: 'More sales, less cash',
        question: 'I’m selling more. Why is cash still tight?',
        text: 'Explore the difference between invoicing, collections and payments to understand possible cash pressure.',
        message: 'Growth and liquidity don’t always move at the same pace.',
      },
    ],
  },
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
/** Texto que sobe por detrás de uma máscara, linha a linha (como a Ramp e a Searchable). */
const line: Variants = { hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.9, ease: EASE } } }
const rise: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }

/**
 * Secção 5 — Para quem é.
 * Inspirada no bloco de avaliações da Searchable: um bloco de cor da marca
 * (azul plano, sem brilhos) com o título em dois tons à maneira da Ramp e, por
 * baixo, uma área cinzenta clara com as três situações em colunas editoriais
 * separadas por linhas finas. Movimento discreto: o bloco "abre" com o scroll,
 * o título sobe por máscara e a linha da marca desenha-se.
 */
export function ForWhom() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const reduced = useReducedMotion() ?? false
  const block = useRef<HTMLDivElement>(null)

  // O bloco entra ligeiramente recolhido e abre até à largura total (como na Lovable/Apple)
  const { scrollYProgress } = useScroll({ target: block, offset: ['start end', 'start 0.3'] })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.5 })
  const scale = useTransform(p, [0, 1], reduced ? [1, 1] : [0.94, 1])
  const radius = useTransform(p, [0, 1], reduced ? [28, 28] : [44, 28])
  const draw = useTransform(p, [0.25, 1], [0, 1])

  return (
    <MotionConfig reducedMotion="user">
      <section id="para-quem" aria-labelledby="para-quem-titulo" className="relative scroll-mt-20 bg-white px-3 py-10 sm:px-5 lg:py-14">
        <motion.div ref={block} style={{ scale, borderRadius: radius }} className="relative mx-auto max-w-[1320px] overflow-hidden bg-[#F4F5F8] [transform-origin:50%_0%]">
          {/* Bloco de cor da marca */}
          <motion.div
            className="relative isolate grid gap-10 bg-accent px-6 pb-12 pt-12 text-white sm:px-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:px-16 lg:pb-16 lg:pt-16"
            variants={group}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            <div>
              <motion.p variants={rise} className="text-[14px] font-medium text-white/80">{t.eyebrow}</motion.p>
              <h2 id="para-quem-titulo" className="mt-4 font-display text-[36px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[50px] lg:text-[58px]">
                <span className="block overflow-hidden pb-[0.06em]"><motion.span variants={line} className="block">{t.title[0]}</motion.span></span>
                <span className="block overflow-hidden pb-[0.06em]"><motion.span variants={line} className="block text-white/60">{t.title[1]}</motion.span></span>
              </h2>
              <motion.p variants={rise} className="mt-6 max-w-[520px] text-[16.5px] leading-[1.6] text-white/85 sm:text-[18px]">{t.sub}</motion.p>
            </div>

            {/* A linha da marca: plana, branca, sem brilho — desenha-se com o scroll */}
            <motion.div variants={rise} aria-hidden="true" className="relative hidden h-[220px] lg:block">
              <svg viewBox="0 0 440 220" className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
                <line x1="0" x2="440" y1="219" y2="219" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <motion.path d="M0 200 C 80 196, 120 170, 160 150 S 260 120, 300 86 S 390 30, 440 14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{ pathLength: reduced ? 1 : draw }} />
              </svg>
              {[
                { x: '36.4%', y: '68.2%', at: 0.45 },
                { x: '68.2%', y: '39.1%', at: 0.7 },
                { x: '100%', y: '6.4%', at: 0.95 },
              ].map((d, i) => (
                <Dot key={i} x={d.x} y={d.y} n={i + 1} progress={draw} at={d.at} reduced={reduced} />
              ))}
            </motion.div>
          </motion.div>

          {/* Área clara com as três situações */}
          <motion.div className="px-6 pb-10 pt-8 sm:px-10 lg:px-16 lg:pb-14 lg:pt-10" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            <motion.p variants={rise} className="text-[14px] font-medium text-[#0B1030]/60">{t.label}</motion.p>
            <ul className="mt-6 grid grid-cols-1 lg:mt-8 lg:grid-cols-3">
              {t.contexts.map((c, i) => (
                <motion.li
                  key={c.title}
                  variants={rise}
                  className={cn(
                    'flex flex-col py-7 lg:px-8 lg:py-1',
                    i > 0 && 'border-t border-[#0B1030]/10 lg:border-l lg:border-t-0',
                    i === 0 && 'pt-0 lg:pl-0',
                    i === 2 && 'lg:pr-0',
                  )}
                >
                  <p className="text-[15px] font-semibold text-[#070D2B]">{c.title}</p>
                  <p className="mt-0.5 text-[13.5px] text-[#0B1030]/55">{c.segment}</p>
                  <p className="mt-5 text-[19px] leading-[1.45] tracking-[-0.01em] text-[#070D2B] sm:text-[20px]">“{c.question}”</p>
                  <p className="mt-4 text-[15px] leading-[1.6] text-[#0B1030]/65">{c.text}</p>
                  <p className="mt-auto pt-6 text-[14px] font-medium text-accent-deep">{c.message}</p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
        <p className="mx-auto mt-6 max-w-[620px] text-center text-[13.5px] leading-relaxed text-[#0B1030]/50">{t.fit}</p>
      </section>
    </MotionConfig>
  )
}

/** Ponto na linha: aparece quando a linha lá chega. */
function Dot({ x, y, n, progress, at, reduced }: { x: string; y: string; n: number; progress: MotionValue<number>; at: number; reduced: boolean }) {
  const o = useTransform(progress, [at - 0.08, at], [0, 1])
  return (
    <motion.span className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center" style={{ left: x, top: y, opacity: reduced ? 1 : o }}>
      <span className="h-2.5 w-2.5 rounded-full bg-white ring-4 ring-white/20" />
      <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] font-medium text-white/75">0{n}</span>
    </motion.span>
  )
}

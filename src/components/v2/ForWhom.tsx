import { MotionConfig, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

type Context = { segment: string; title: string; question: string; text: string; message: string }

/**
 * Perfis que estamos a testar (Market Validation) — não são segmentos
 * comercialmente validados, por isso a página não os apresenta como tal.
 */
const copy: Record<Lang, { eyebrow: string; title: [string, string, string]; sub: string; fit: string; contexts: Context[] }> = {
  pt: {
    eyebrow: 'Pensada para quem gere',
    title: ['Há decisões que ', 'não podem esperar', ' pelo fim do mês.'],
    sub: 'Quando os clientes atrasam, os custos aumentam ou o negócio cresce, a informação financeira tem de acompanhar.',
    fit: 'Para PME com clientes empresariais, valores a receber, custos recorrentes e dados financeiros dispersos.',
    contexts: [
      {
        segment: 'Distribuição e comércio B2B',
        title: 'Clientes que pagam tarde.',
        question: 'Vendo bastante. Porque é que o dinheiro demora a entrar?',
        text: 'Acompanhe os valores por receber, os prazos e os pagamentos em atraso para compreender melhor a sua tesouraria.',
        message: 'Faturar não é o mesmo que receber.',
      },
      {
        segment: 'Empresas de serviços',
        title: 'Custos que não param.',
        question: 'O negócio está a crescer. Será que consigo acompanhar os custos?',
        text: 'Compare receitas, despesas e compromissos para perceber como evolui a situação financeira da empresa.',
        message: 'Crescer exige conhecer o impacto financeiro.',
      },
      {
        segment: 'Empresas em crescimento',
        title: 'Mais vendas. Menos liquidez.',
        question: 'Estou a vender mais. Porque é que a tesouraria continua apertada?',
        text: 'Explore a diferença entre faturação, recebimentos e pagamentos para compreender possíveis pressões de caixa.',
        message: 'Crescimento e liquidez nem sempre avançam ao mesmo ritmo.',
      },
    ],
  },
  en: {
    eyebrow: 'Built for those who manage',
    title: ['Some decisions ', 'can’t wait', ' for month-end.'],
    sub: 'When customers pay late, costs rise or the business grows, financial information has to keep up.',
    fit: 'For SMEs with business customers, receivables, recurring costs and scattered financial data.',
    contexts: [
      {
        segment: 'B2B distribution and trade',
        title: 'Customers who pay late.',
        question: 'I sell a lot. Why does the money take so long to come in?',
        text: 'Follow receivables, due dates and late payments to better understand your cash.',
        message: 'Invoicing is not the same as getting paid.',
      },
      {
        segment: 'Service companies',
        title: 'Costs that keep coming.',
        question: 'The business is growing. Can I keep track of the costs?',
        text: 'Compare revenue, expenses and commitments to see how the company’s financial position evolves.',
        message: 'Growing means knowing the financial impact.',
      },
      {
        segment: 'Growing companies',
        title: 'More sales. Less cash.',
        question: 'I’m selling more. Why is cash still tight?',
        text: 'Explore the difference between invoicing, collections and payments to understand possible cash pressure.',
        message: 'Growth and liquidity don’t always move at the same pace.',
      },
    ],
  },
}

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const head: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }
const col: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } } }

/**
 * Nova secção 5 — Para quem é. Três situações reconhecíveis, em colunas
 * editoriais separadas por linhas finas (sem cartões). Não é uma demonstração
 * de produto e não tem ligações (não existe página de casos de utilização).
 */
export function ForWhom() {
  const { lang } = useLanguage()
  const t = copy[lang]
  return (
    <MotionConfig reducedMotion="user">
      <section id="para-quem" aria-labelledby="para-quem-titulo" className="relative isolate scroll-mt-20 overflow-hidden bg-navy text-white">
        {/* Luz azul muito ténue no topo, sem imagem */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(50%_70%_at_50%_0%,rgba(0,82,255,0.16),transparent_70%)]" />
        <motion.div className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8 lg:py-24" variants={group} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="mx-auto max-w-[860px] text-center">
            <motion.p variants={head} className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-glow">{t.eyebrow}</motion.p>
            <motion.h2 variants={head} id="para-quem-titulo" className="mt-3 text-balance font-display text-[32px] font-bold leading-[1.06] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]">
              {t.title[0]}
              <span className="text-glow">{t.title[1]}</span>
              {t.title[2]}
            </motion.h2>
            <motion.p variants={head} className="mx-auto mt-4 max-w-[600px] text-[16.5px] leading-[1.6] text-white/70 sm:text-[18px]">{t.sub}</motion.p>
          </div>

          {/* Três situações: colunas editoriais com divisórias finas */}
          <motion.ul variants={group} className="mt-12 grid grid-cols-1 lg:mt-16 lg:grid-cols-3">
            {t.contexts.map((c, i) => (
              <motion.li
                key={c.title}
                variants={col}
                className={cn(
                  'group relative py-8 lg:px-8 lg:py-2',
                  i > 0 && 'border-t border-white/10 lg:border-l lg:border-t-0',
                  i === 0 && 'lg:pl-0',
                  i === 2 && 'lg:pr-0',
                )}
              >
                <div className="transition-transform duration-300 ease-out lg:group-hover:-translate-y-0.5">
                  <p className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    <span className="font-display text-[13px] font-bold tracking-[0.1em] text-glow">0{i + 1}</span>
                    {/* Pequeno traço Finer One: desenha-se uma vez e ilumina-se no hover */}
                    <motion.span
                      aria-hidden="true"
                      className="h-px w-6 origin-left bg-glow/70 transition-[width,background-color,box-shadow] duration-300 group-hover:w-10 group-hover:bg-glow group-hover:shadow-[0_0_8px_rgba(30,144,255,0.9)]"
                      variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.5, ease: EASE, delay: 0.2 } } }}
                    />
                    {c.segment}
                  </p>
                  <h3 className="mt-5 font-display text-[24px] font-bold leading-tight tracking-[-0.02em] sm:text-[26px]">{c.title}</h3>
                  <p className="mt-4 font-display text-[20px] font-semibold leading-[1.35] tracking-[-0.01em] text-white/80 transition-colors duration-300 group-hover:text-white sm:text-[21px]">
                    “{c.question}”
                  </p>
                  <p className="mt-4 text-[15.5px] leading-[1.6] text-white/60">{c.text}</p>
                  <p className="mt-5 text-[14px] font-semibold text-[#8FC3FF]">{c.message}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          <motion.p variants={head} className="mx-auto mt-10 max-w-[640px] border-t border-white/10 pt-6 text-center text-[14px] leading-relaxed text-white/50 lg:mt-14">
            {t.fit}
          </motion.p>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

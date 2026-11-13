import { useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion, useInView } from 'motion/react'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import { CashflowView } from '@/components/v2/finer-ui/screens'
import { ScaledCanvas } from '@/components/v2/finer-ui/ScaledCanvas'
import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

const copy: Record<Lang, {
  eyebrow: string; title: [string, string]; sub: string; note: string
  sources: { name: string; how: string }[]
  steps: { n: string; name: string; text: string }[]
  planned: string; window: string[]
}> = {
  pt: {
    eyebrow: 'Como funciona',
    title: ['As suas ferramentas, ', 'ligadas à Finer One.'],
    sub: 'Contas bancárias, faturas e outras fontes de informação reunidas numa visão mais clara do seu negócio.',
    note: 'Funcionamento previsto. As integrações estão em implementação e teste com os primeiros utilizadores. Dados fictícios.',
    sources: [
      { name: 'Contas bancárias', how: 'Open Banking, só com a sua autorização' },
      { name: 'Faturas', how: 'Enviadas para um email dedicado' },
      { name: 'Ficheiros compatíveis', how: 'Documentos que já utiliza' },
    ],
    steps: [
      { n: '01', name: 'Ligue as suas fontes', text: 'Contas bancárias, faturas e ficheiros compatíveis.' },
      { n: '02', name: 'Reúna a informação', text: 'Movimentos, documentos e indicadores organizados.' },
      { n: '03', name: 'Consulte o que importa', text: 'A visão financeira nas funcionalidades da Finer One.' },
    ],
    planned: 'Previsto',
    window: ['Ligações', 'Informação reunida', 'Cashflow'],
  },
  en: {
    eyebrow: 'How it works',
    title: ['Your tools, ', 'connected to Finer One.'],
    sub: 'Bank accounts, invoices and other sources brought together into a clearer view of your business.',
    note: 'Planned workflow. Integrations are being implemented and tested with our first users. Fictitious data.',
    sources: [
      { name: 'Bank accounts', how: 'Open Banking, only with your authorisation' },
      { name: 'Invoices', how: 'Sent to a dedicated email address' },
      { name: 'Compatible files', how: 'Documents you already use' },
    ],
    steps: [
      { n: '01', name: 'Connect your sources', text: 'Bank accounts, invoices and compatible files.' },
      { n: '02', name: 'Bring it together', text: 'Transactions, documents and indicators, organised.' },
      { n: '03', name: 'See what matters', text: 'The financial view across Finer One’s features.' },
    ],
    planned: 'Planned',
    window: ['Connections', 'Information brought together', 'Cash flow'],
  },
}

/**
 * Secção 4 — Como funciona (Motion).
 * Entrada única: as fontes surgem, a linha Finer One desenha-se das fontes até
 * à plataforma e a janela é revelada por máscara. Depois, três etapas
 * selecionáveis (indicador partilhado com layoutId; conteúdo com
 * AnimatePresence). Sem pinning nem loops. Versão anterior em ?funcionamento=antigo.
 */
export function HowItWorksMotion() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (i + d + 3) % 3
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <MotionConfig reducedMotion="user">
      <section id="funcionamento" aria-labelledby="funcionamento-titulo" className="relative scroll-mt-24 bg-white py-14 text-navy lg:py-20">
        <div ref={ref} className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end lg:gap-12">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.45, ease: EASE }}>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent">{t.eyebrow}</p>
              <h2 id="funcionamento-titulo" className="mt-3 font-display text-[32px] font-bold leading-[1.05] tracking-[-0.035em] text-[#070D2B] sm:text-[42px] lg:text-[48px]">
                {t.title[0]}
                <span className="text-accent">{t.title[1]}</span>
              </h2>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.45, ease: EASE, delay: 0.08 }} className="max-w-[460px] text-[16.5px] leading-[1.6] text-[#0B1030]/70 lg:pb-1">
              {t.sub}
            </motion.p>
          </div>

          {/* Etapas selecionáveis (indicador partilhado) */}
          <div role="tablist" aria-label={t.eyebrow} className="mt-8 grid grid-cols-3 gap-1.5 rounded-[18px] border border-[#0B1030]/[0.08] bg-[#F8FAFF] p-1.5 lg:mt-10">
            {t.steps.map((s, i) => {
              const on = active === i
              return (
                <button
                  key={s.n}
                  ref={(el) => { tabs.current[i] = el }}
                  type="button"
                  role="tab"
                  id={`func-${i}`}
                  aria-selected={on}
                  aria-controls="func-painel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn('group relative rounded-[13px] px-2 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-4 sm:py-3.5', !on && 'hover:bg-white')}
                >
                  {on && <motion.span layoutId="func-ativa" transition={{ duration: 0.3, ease: EASE }} className="absolute inset-0 rounded-[13px] bg-[#070D2B] shadow-[0_12px_28px_-16px_rgba(7,13,43,0.9)]" />}
                  <span className="relative flex items-baseline gap-2">
                    <span className={cn('hidden font-display text-[12.5px] font-bold tabular-nums sm:inline', on ? 'text-glow' : 'text-accent')}>{s.n}</span>
                    <span className={cn('text-[13px] font-bold leading-tight tracking-[-0.01em] sm:text-[16px]', on ? 'text-white' : 'text-[#070D2B]')}>{s.name}</span>
                  </span>
                  <span className={cn('relative mt-1 hidden text-[14px] leading-snug lg:block', on ? 'text-white/70' : 'text-[#0B1030]/60')}>{s.text}</span>
                </button>
              )
            })}
          </div>

          {/* Fontes → linha Finer One → plataforma */}
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 lg:mt-8 lg:grid-cols-[minmax(0,0.32fr)_96px_minmax(0,0.68fr)] lg:items-center lg:gap-0">
            {/* Fontes */}
            <ul className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
              {t.sources.map((src, i) => (
                <motion.li
                  key={src.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.08 }}
                  className={cn(
                    'rounded-[16px] border bg-white px-4 py-3.5 transition-[border-color,box-shadow] duration-300',
                    active === 0 ? 'border-accent/40 shadow-[0_12px_28px_-20px_rgba(0,82,255,0.8)]' : 'border-[#0B1030]/[0.09]',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[15.5px] font-bold text-[#070D2B]">{src.name}</p>
                    <span className="shrink-0 rounded-full bg-[#0B1030]/[0.05] px-2 py-0.5 text-[11px] font-semibold text-[#0B1030]/60">{t.planned}</span>
                  </div>
                  <p className="mt-0.5 text-[13.5px] text-[#0B1030]/65">{src.how}</p>
                </motion.li>
              ))}
            </ul>

            {/* Linha Finer One (desktop): três fios que convergem e seguem para a plataforma */}
            <Connector draw={inView} active={active} />

            {/* Plataforma */}
            <motion.div
              className="min-w-0"
              initial={{ clipPath: 'inset(8% 6% 10% 6% round 24px)', opacity: 0 }}
              animate={inView ? { clipPath: 'inset(0% 0% 0% 0% round 20px)', opacity: 1 } : undefined}
              transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
            >
              <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_36px_80px_-44px_rgba(11,16,48,0.55),0_0_0_1px_rgba(11,16,48,0.07)]">
                <div className="flex h-11 items-center gap-2.5 border-b border-[#0B1030]/[0.07] px-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-[#070D2B]">
                    <svg viewBox="0 0 326 445" className="h-3 w-3 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
                  </span>
                  <span className="text-[13.5px] font-bold text-[#070D2B]">Finer One</span>
                  <span className="truncate text-[13px] text-[#0B1030]/50">· {t.window[active]}</span>
                </div>
                <div id="func-painel" role="tabpanel" aria-labelledby={`func-${active}`} className="relative h-[400px] overflow-hidden bg-[#F7F9FE] sm:h-[300px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active}
                      className="absolute inset-0"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.32, ease: EASE }}
                    >
                      {active === 0 && <Connections lang={lang} planned={t.planned} />}
                      {active === 1 && <Organised lang={lang} />}
                      {active === 2 && <PlatformScreen />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          <p className="mt-4 text-[12.5px] text-[#0B1030]/50">{t.note}</p>
        </div>
      </section>
    </MotionConfig>
  )
}

/* Linha Finer One: das três fontes até ao nó Finer One e daí para a plataforma. */
function Connector({ draw, active }: { draw: boolean; active: number }) {
  // Centros dos três cartões de fontes (px), numa área fixa de 96 × 248.
  const ys = [38, 124, 210]
  const draw1 = { initial: { pathLength: 0 }, animate: { pathLength: draw ? 1 : 0 } }
  return (
    <div aria-hidden="true" className="relative hidden h-[248px] lg:block">
      <svg viewBox="0 0 96 248" className="absolute inset-0 h-full w-full overflow-visible">
        {ys.map((y, i) => (
          <motion.path
            key={y}
            d={`M 0 ${y} C 32 ${y}, 30 124, 52 124`}
            fill="none"
            stroke={active === 0 ? '#0052FF' : 'rgba(0,82,255,0.45)'}
            strokeWidth="1.6"
           
            {...draw1}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 + i * 0.06 }}
          />
        ))}
        <motion.path
          d="M 52 124 L 96 124"
          fill="none"
          stroke={active === 2 ? '#1E90FF' : 'rgba(0,82,255,0.6)'}
          strokeWidth="2"
         
          style={{ filter: 'drop-shadow(0 0 4px rgba(30,144,255,0.7))' }}
          {...draw1}
          transition={{ duration: 0.35, ease: EASE, delay: 0.85 }}
        />
      </svg>
      {/* Nó Finer One onde a informação se reúne */}
      <motion.span
        className="absolute left-[54%] top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[10px] bg-[#070D2B]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={draw ? { opacity: 1, scale: 1, boxShadow: active === 1 ? '0 0 0 6px rgba(0,82,255,0.14), 0 0 22px rgba(30,144,255,0.8)' : '0 0 0 4px rgba(0,82,255,0.08), 0 0 12px rgba(30,144,255,0.4)' } : undefined}
        transition={{ duration: 0.35, ease: EASE, delay: draw ? 0.75 : 0 }}
      >
        <svg viewBox="0 0 326 445" className="h-4 w-4 fill-white"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
      </motion.span>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="h-full p-4 sm:p-5">
      <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#0B1030]/50">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

/* 01 · Ligações (estado previsto, sem fornecedores nomeados) */
function Connections({ lang, planned }: { lang: Lang; planned: string }) {
  const pt = lang === 'pt'
  return (
    <Panel title={pt ? 'Ligar uma conta' : 'Connect an account'}>
      {/* Autorização Open Banking (ecrã ilustrativo; fornecedor ainda em avaliação) */}
      <div className="rounded-[14px] border border-[#0B1030]/[0.07] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[14.5px] font-semibold text-[#070D2B]">{pt ? 'Autorizar acesso ao seu banco' : 'Authorise access to your bank'}</p>
          <span className="shrink-0 rounded-full bg-[#0B1030]/[0.05] px-2 py-0.5 text-[11px] font-semibold text-[#0B1030]/60">{planned}</span>
        </div>
        <ul className="mt-3 flex flex-wrap gap-2">
          {(pt ? ['Saldos', 'Movimentos'] : ['Balances', 'Transactions']).map((x) => (
            <li key={x} className="inline-flex items-center gap-1.5 rounded-full bg-accent/[0.07] px-2.5 py-1 text-[13px] font-semibold text-accent">
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true"><path d="M2.5 6.2 5 8.5 9.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {x}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-[#0B1030]/60">{pt ? 'Acesso apenas de leitura, com a sua autorização. Pode revogá-lo a qualquer momento.' : 'Read-only access, with your authorisation. You can revoke it at any time.'}</p>
      </div>
      {/* Email dedicado para faturas */}
      <div className="mt-2.5 flex items-center gap-3 rounded-[14px] border border-[#0B1030]/[0.07] bg-white px-4 py-3">
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-semibold text-[#070D2B]">{pt ? 'Reencaminhe as faturas' : 'Forward your invoices'}</span>
          <span className="block text-[13px] text-[#0B1030]/60">{pt ? 'Para o endereço dedicado da Finer One, sem dar acesso à sua caixa de correio.' : 'To your dedicated Finer One address, without access to your inbox.'}</span>
        </span>
        <span className="shrink-0 rounded-full bg-[#0B1030]/[0.05] px-2 py-0.5 text-[11px] font-semibold text-[#0B1030]/60">{planned}</span>
      </div>
    </Panel>
  )
}

/* 02 · Informação reunida (movimentos e documentos fictícios, diferentes da secção 2) */
function Organised({ lang }: { lang: Lang }) {
  const pt = lang === 'pt'
  const rows = pt
    ? [
        { d: '05 nov', t: 'Transferência recebida · Cliente E', c: 'Recebimentos', v: '+ € 3.150,00', pos: true },
        { d: '05 nov', t: 'Fornecedor de energia', c: 'Custos', v: '− € 412,30', pos: false },
        { d: '04 nov', t: 'Fatura FT 2026/146 · Cliente F', c: 'Faturação', v: '€ 1.920,00', pos: true },
        { d: '04 nov', t: 'Subscrição de software', c: 'Serviços', v: '− € 89,00', pos: false },
      ]
    : [
        { d: '5 Nov', t: 'Incoming transfer · Customer E', c: 'Receivables', v: '+ €3,150.00', pos: true },
        { d: '5 Nov', t: 'Energy supplier', c: 'Costs', v: '− €412.30', pos: false },
        { d: '4 Nov', t: 'Invoice FT 2026/146 · Customer F', c: 'Invoicing', v: '€1,920.00', pos: true },
        { d: '4 Nov', t: 'Software subscription', c: 'Services', v: '− €89.00', pos: false },
      ]
  return (
    <Panel title={pt ? 'Movimentos e documentos' : 'Transactions and documents'}>
      <ul className="divide-y divide-[#0B1030]/[0.06] rounded-[12px] border border-[#0B1030]/[0.07] bg-white">
        {rows.map((r) => (
          <li key={r.t} className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-2.5 sm:grid-cols-[56px_minmax(0,1fr)_auto_auto]">
            <span className="text-[12.5px] tabular-nums text-[#0B1030]/50">{r.d}</span>
            <span className="truncate text-[14px] font-medium text-[#070D2B]">{r.t}</span>
            <span className="hidden rounded-full bg-accent/[0.07] px-2 py-0.5 text-[11.5px] font-semibold text-accent sm:inline">{r.c}</span>
            <span className={cn('text-right text-[14px] font-semibold tabular-nums', r.pos ? 'text-[#070D2B]' : 'text-[#0B1030]/70')}>{r.v}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/* 03 · Ecrã da plataforma (reconstrução fiel do Cashflow, dados fictícios) */
function PlatformScreen() {
  return (
    <div inert className="pointer-events-none absolute inset-0">
      <ScaledCanvas width={1280}>
        <div className="h-[900px] overflow-hidden">
          <AppShell view="cashflow">
            <CashflowView />
          </AppShell>
        </div>
      </ScaledCanvas>
    </div>
  )
}

import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  AVG_DAYS_LATE, CASH, CASH_GAP, CASH_IF_MAIN_PAYS, CLIENT_NAMES, COMMITMENTS_TOTAL, INVOICES,
  MAIN_CLIENT_SHARE, MAIN_CLIENT_TOTAL, OTHERS_TOTAL, OVERDUE_COUNT, TOTAL_OVERDUE, eur, pct,
} from './storyData'

/** Tela fixa do painel (px). É escalada para caber na coluna/ecrã. */
export const PANEL_W = 500
export const PANEL_H = 600

type Lang = 'pt' | 'en'

const T = {
  pt: {
    app: 'Finer Advisor', topic: 'Análise · Recebimentos', fict: 'Dados fictícios',
    path: ['Dado', 'Descoberta', 'Impacto', 'Recomendação'],
    receivable: 'Faturas por receber', overdueN: (n: number) => `${n} faturas em atraso`, avg: (d: number) => `${d} dias de atraso médio`,
    list: 'Faturas em atraso', days: (d: number) => `${d} dias`,
    conc: 'Concentração do valor em atraso', concOf: (a: string, t: string) => `num único cliente: ${a} de ${t}`,
    others: (n: number) => `Outros ${n} clientes`, mainTag: 'Principal fator de risco',
    interp: 'Interpretação',
    interpText: 'Quase todo o valor em atraso depende de um só pagamento. Se este cliente atrasar mais, a entrada prevista desaparece quase por completo.',
    cash: 'Tesouraria · próximos 15 dias', available: 'Saldo disponível', commitments: 'Compromissos', gap: 'Diferença',
    bars: ['Saldo', 'Compromissos', 'Diferença'], ifPays: ['Se o Cliente A', 'pagar'],
    commitParts: { salaries: 'Salários', suppliers: 'Fornecedores', taxes: 'Impostos e SS' },
    assume: 'Cenário ilustrativo: saldo atual e compromissos previstos para 15 dias, sem novas entradas. Valores fictícios — não é uma previsão.',
    plan: 'Plano de ação', shows: 'O que os dados mostram',
    showsItems: [
      `${eur(TOTAL_OVERDUE)} por receber em ${OVERDUE_COUNT} faturas, com ${AVG_DAYS_LATE} dias de atraso médio.`,
      `Um cliente concentra ${pct(MAIN_CLIENT_SHARE)} do valor em atraso (${eur(MAIN_CLIENT_TOTAL)}).`,
      `Sem novas entradas, os compromissos a 15 dias superam o saldo em ${eur(Math.abs(CASH_GAP))}.`,
    ],
    recs: 'Recomendações Finer One', priority: 'Prioridade',
    recItems: [
      'Contactar prioritariamente o cliente com maior valor em atraso.',
      'Confirmar uma data de pagamento ou negociar uma solução adequada.',
      'Rever os compromissos de tesouraria no mesmo período.',
      'Acompanhar a evolução das cobranças e atualizar as prioridades.',
    ],
  },
  en: {
    app: 'Finer Advisor', topic: 'Analysis · Receivables', fict: 'Fictitious data',
    path: ['Data', 'Discovery', 'Impact', 'Recommendation'],
    receivable: 'Invoices receivable', overdueN: (n: number) => `${n} overdue invoices`, avg: (d: number) => `${d} days late on average`,
    list: 'Overdue invoices', days: (d: number) => `${d} days`,
    conc: 'Concentration of the overdue amount', concOf: (a: string, t: string) => `in a single customer: ${a} of ${t}`,
    others: (n: number) => `Other ${n} customers`, mainTag: 'Main risk factor',
    interp: 'Interpretation',
    interpText: 'Almost all of the overdue amount depends on one payment. If this customer delays further, the expected inflow almost disappears.',
    cash: 'Cash · next 15 days', available: 'Available balance', commitments: 'Commitments', gap: 'Difference',
    bars: ['Balance', 'Commitments', 'Difference'], ifPays: ['If Customer A', 'pays'],
    commitParts: { salaries: 'Salaries', suppliers: 'Suppliers', taxes: 'Taxes & social security' },
    assume: 'Illustrative scenario: current balance and commitments expected over 15 days, with no new inflows. Fictitious values — not a forecast.',
    plan: 'Action plan', shows: 'What the data shows',
    showsItems: [
      `${eur(TOTAL_OVERDUE, 'en')} receivable across ${OVERDUE_COUNT} invoices, ${AVG_DAYS_LATE} days late on average.`,
      `One customer accounts for ${pct(MAIN_CLIENT_SHARE, 'en')} of the overdue amount (${eur(MAIN_CLIENT_TOTAL, 'en')}).`,
      `With no new inflows, 15-day commitments exceed the balance by ${eur(Math.abs(CASH_GAP), 'en')}.`,
    ],
    recs: 'Finer One recommendations', priority: 'Priority',
    recItems: [
      'Contact the customer with the largest overdue amount first.',
      'Confirm a payment date or negotiate a suitable arrangement.',
      'Review cash commitments for the same period.',
      'Track collections and update priorities.',
    ],
  },
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
/** 0→1 entre a e b. */
const ramp = (x: number, a: number, b: number) => clamp((x - a) / (b - a))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/** Entrada suave (opacity + translate) controlada pelo progresso. */
const enter = (t: number, dy = 10): CSSProperties => ({ opacity: easeOut(t), transform: `translate3d(0, ${(1 - easeOut(t)) * dy}px, 0)` })

/** Visibilidade de cada momento: entra a partir de i, sai a caminho de i+1. */
function layerOpacity(s: number, i: number) {
  const inV = i === 0 ? 1 : ramp(s, i - 0.02, i + 0.1)
  const outV = i === 3 ? 1 : 1 - ramp(s, i + 0.86, i + 0.96)
  return Math.min(inV, outV)
}

/**
 * Painel da análise, inspirado no Finer Advisor. Um único ecrã que evolui com
 * `s` (0–4): 0 problema · 1 descoberta · 2 impacto · 3 recomendação.
 * Todo o movimento depende de `s`, por isso funciona nos dois sentidos do
 * scroll. Coordenadas numa tela fixa de 500×600.
 */
export function StoryPanel({ s, lang, scale = 1 }: { s: number; lang: Lang; scale?: number }) {
  const t = T[lang]
  const local = (i: number) => clamp(s - i)

  return (
    <div style={{ width: PANEL_W * scale, height: PANEL_H * scale }} className="relative">
      <div
        className="absolute left-0 top-0 overflow-hidden rounded-[22px] bg-white text-[#070D2B] shadow-[0_40px_90px_-40px_rgba(11,16,48,0.45),0_0_0_1px_rgba(11,16,48,0.06)]"
        style={{ width: PANEL_W, height: PANEL_H, transform: `scale(${scale})`, transformOrigin: '0 0' }}
      >
        <Header t={t} />
        <PathTraveller s={s} labels={t.path} />
        <Layer o={layerOpacity(s, 0)}><Problem t={t} l={local(0)} lang={lang} /></Layer>
        <Layer o={layerOpacity(s, 1)}><Discovery t={t} l={local(1)} lang={lang} /></Layer>
        <Layer o={layerOpacity(s, 2)}><Impact t={t} l={local(2)} lang={lang} /></Layer>
        <Layer o={layerOpacity(s, 3)}><Recommendation t={t} l={local(3)} /></Layer>
      </div>
    </div>
  )
}

function Layer({ o, children }: { o: number; children: ReactNode }) {
  if (o <= 0.001) return null
  return (
    <div className="absolute inset-x-0 bottom-0 top-[112px] px-6" style={{ opacity: o }} aria-hidden={o < 0.5}>
      {children}
    </div>
  )
}

function Header({ t }: { t: (typeof T)['pt'] }) {
  return (
    <div className="flex h-[52px] items-center justify-between border-b border-[#0B1030]/[0.07] px-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#070D2B]">
          <svg viewBox="0 0 326 445" className="h-3.5 w-3.5 fill-white" aria-hidden="true"><path d="M326 0H0v445l99-99v-92h109l86-87H99V79h227z" /></svg>
        </span>
        <span className="text-[14px] font-bold tracking-[-0.01em]">{t.app}</span>
        <span className="text-[13px] text-[#0B1030]/45">{t.topic}</span>
      </div>
      <span className="rounded-full bg-[#0B1030]/[0.05] px-2.5 py-1 text-[11px] font-semibold text-[#0B1030]/55">{t.fict}</span>
    </div>
  )
}

/**
 * Fio narrativo Dado → Descoberta → Impacto → Recomendação: a linha azul é
 * sólida atrás do ponto de luz e pontilhada à frente; cada etapa acende quando
 * o ponto lá chega.
 */
function PathTraveller({ s, labels }: { s: number; labels: string[] }) {
  const x0 = 46, x1 = 454, y = 76
  const travel = clamp(s / 3.15)
  const head = x0 + (x1 - x0) * travel
  return (
    <div className="absolute left-0 top-[52px] h-[60px] w-full">
      <svg width={PANEL_W} height={60} className="absolute inset-0 overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="trav" x1="0" x2="1">
            <stop offset="0" stopColor="#0052FF" stopOpacity="0.2" />
            <stop offset="1" stopColor="#1E90FF" />
          </linearGradient>
          <filter id="travGlow" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <line x1={x0} x2={x1} y1={y - 52} y2={y - 52} stroke="#0B1030" strokeOpacity="0.16" strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" />
        <line x1={x0} x2={head} y1={y - 52} y2={y - 52} stroke="url(#trav)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={Math.max(x0, head - 60)} x2={head} y1={y - 52} y2={y - 52} stroke="#1E90FF" strokeWidth="5" strokeOpacity="0.6" filter="url(#travGlow)" />
        {labels.map((_, i) => {
          const nx = x0 + ((x1 - x0) * i) / 3
          const lit = travel >= i / 3 - 0.001
          return <circle key={i} cx={nx} cy={y - 52} r={lit ? 5 : 4} fill={lit ? '#0052FF' : '#FFFFFF'} stroke={lit ? '#0052FF' : 'rgba(11,16,48,0.25)'} strokeWidth="1.5" />
        })}
        <circle cx={head} cy={y - 52} r="9" fill="#1E90FF" opacity="0.25" filter="url(#travGlow)" />
        <circle cx={head} cy={y - 52} r="3.5" fill="#FFFFFF" stroke="#1E90FF" strokeWidth="1.5" />
      </svg>
      {labels.map((label, i) => {
        const nx = x0 + ((x1 - x0) * i) / 3
        const lit = travel >= i / 3 - 0.001
        return (
          <span key={label} className={cn('absolute top-[34px] whitespace-nowrap', i === 0 ? '-translate-x-[18%]' : i === 3 ? '-translate-x-[82%]' : '-translate-x-1/2', ' text-[11.5px] font-semibold transition-colors duration-300', lit ? 'text-accent' : 'text-[#0B1030]/35')} style={{ left: nx }}>
            {label}
          </span>
        )
      })}
    </div>
  )
}

const Label = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn('text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#0B1030]/45', className)}>{children}</p>
)

/* ---------------- 1 · O problema ---------------- */
function Problem({ t, l, lang }: { t: (typeof T)['pt']; l: number; lang: Lang }) {
  const count = ease(ramp(l, 0, 0.22))
  return (
    <div className="relative h-full">
      <Label>{t.receivable}</Label>
      <p className="mt-1.5 font-display text-[46px] font-bold leading-none tracking-[-0.035em] tabular-nums" style={{ textShadow: `0 0 ${24 * count}px rgba(0,82,255,${0.18 * count})` }}>
        {eur(TOTAL_OVERDUE * count, lang)}
      </p>
      <div className="mt-4 flex gap-2.5" style={enter(ramp(l, 0.16, 0.3))}>
        <Chip tone="warn">{t.overdueN(OVERDUE_COUNT)}</Chip>
        <Chip>{t.avg(AVG_DAYS_LATE)}</Chip>
      </div>
      <Label className="mt-6">{t.list}</Label>
      <div className="mt-2.5 space-y-[6px]">
        {INVOICES.map((inv, i) => (
          <div key={inv.id} style={enter(ramp(l, 0.22 + i * 0.07, 0.34 + i * 0.07), 8)}>
            <InvoiceRow inv={inv} lang={lang} t={t} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Chip({ children, tone }: { children: ReactNode; tone?: 'warn' }) {
  return (
    <span className={cn('rounded-full px-3 py-1.5 text-[12.5px] font-semibold', tone === 'warn' ? 'bg-[#FFF1E6] text-[#B4530A]' : 'bg-[#0B1030]/[0.05] text-[#0B1030]/70')}>
      {children}
    </span>
  )
}

function InvoiceRow({ inv, lang, t, highlight = 0 }: { inv: (typeof INVOICES)[number]; lang: Lang; t: (typeof T)['pt']; highlight?: number }) {
  return (
    <div
      className="flex h-[44px] items-center gap-3 rounded-[10px] border px-3"
      style={{
        borderColor: `rgba(0,82,255,${0.06 + 0.3 * highlight})`,
        backgroundColor: highlight ? `rgba(238,243,255,${highlight})` : '#FBFCFF',
        boxShadow: highlight ? `inset 3px 0 0 rgba(0,82,255,${highlight})` : undefined,
      }}
    >
      <span className="w-[86px] shrink-0 text-[12px] tabular-nums text-[#0B1030]/45">{inv.id}</span>
      <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{CLIENT_NAMES[lang][inv.client]}</span>
      <span className="rounded-full bg-[#FFF1E6] px-2 py-0.5 text-[11px] font-semibold text-[#B4530A]">{t.days(inv.daysLate)}</span>
      <span className="w-[92px] shrink-0 text-right text-[14px] font-bold tabular-nums">{eur(inv.amount, lang)}</span>
    </div>
  )
}

/* ---------------- 2 · A descoberta ---------------- */
function Discovery({ t, l, lang }: { t: (typeof T)['pt']; l: number; lang: Lang }) {
  const share = ease(ramp(l, 0.04, 0.4))
  const hl = ramp(l, 0.3, 0.5)
  const draw = ease(ramp(l, 0.32, 0.6))
  const main = INVOICES.filter((i) => i.client === 'A')
  return (
    <div className="relative h-full">
      <Label>{t.conc}</Label>
      <div className="mt-1.5 flex items-end gap-3">
        <p className="font-display text-[46px] font-bold leading-none tracking-[-0.035em] text-accent tabular-nums">{pct(MAIN_CLIENT_SHARE * share, lang)}</p>
        <p className="pb-1.5 text-[13px] leading-snug text-[#0B1030]/60">{t.concOf(eur(MAIN_CLIENT_TOTAL, lang), eur(TOTAL_OVERDUE, lang))}</p>
      </div>
      {/* Barra de concentração */}
      <div className="mt-4 flex h-[12px] overflow-hidden rounded-full bg-[#0B1030]/[0.07]">
        <div className="h-full origin-left rounded-full bg-gradient-to-r from-accent to-glow shadow-[0_0_12px_rgba(30,144,255,0.6)]" style={{ width: `${MAIN_CLIENT_SHARE * 100}%`, transform: `scaleX(${share})` }} />
      </div>
      <div className="mt-5 space-y-[6px] pl-5">
        {main.map((inv) => (
          <InvoiceRow key={inv.id} inv={inv} lang={lang} t={t} highlight={hl} />
        ))}
        <div className="flex h-[44px] items-center justify-between rounded-[10px] border border-[#0B1030]/[0.06] bg-[#FBFCFF] px-3 text-[14px] text-[#0B1030]/55" style={enter(ramp(l, 0.12, 0.3), 6)}>
          <span>{t.others(OVERDUE_COUNT - main.length)}</span>
          <span className="font-semibold tabular-nums">{eur(OTHERS_TOTAL, lang)}</span>
        </div>
      </div>
      {/* Linha azul: do valor total ao principal fator de risco (chaveta nas 3 faturas) */}
      <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="460" height="300" aria-hidden="true">
        <path
          d="M 200 92 C 200 112, 8 104, 8 128 L 8 262"
          fill="none" stroke="#1E90FF" strokeWidth="2" strokeLinecap="round" pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1 - draw, filter: 'drop-shadow(0 0 4px rgba(30,144,255,0.8))' }}
        />
        <circle cx="8" cy={128 + 134 * clamp((draw - 0.35) / 0.65)} r={draw > 0.02 && draw < 0.99 ? 3.5 : 0} fill="#fff" stroke="#1E90FF" strokeWidth="1.5" />
      </svg>
      {/* Interpretação */}
      <div className="absolute inset-x-0 bottom-6 rounded-[14px] border border-accent/15 bg-[#EEF3FF] p-4" style={enter(ramp(l, 0.5, 0.7))}>
        <p className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.14em] text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {t.interp} · {t.mainTag}
        </p>
        <p className="mt-1.5 text-[14px] leading-[1.5] text-[#0B1030]/80">{t.interpText}</p>
      </div>
    </div>
  )
}

/* ---------------- 3 · O impacto ---------------- */
function Impact({ t, l, lang }: { t: (typeof T)['pt']; l: number; lang: Lang }) {
  const k = ease(ramp(l, 0.04, 0.34))
  const grow = (a: number, b: number) => easeOut(ramp(l, a, b))
  // Escala do gráfico: −12.000 a +48.000 em 190px
  const top = 0, H = 190, min = -12000, max = 48000
  const y = (v: number) => top + ((max - v) / (max - min)) * H
  const zero = y(0)
  const gap = CASH_GAP
  const bars = [
    { x: 30, from: 0, to: CASH.available, color: '#0052FF', g: grow(0.12, 0.3), label: t.bars[0], value: CASH.available },
    { x: 150, from: CASH.available, to: gap, color: '#94A3C8', g: grow(0.22, 0.42), label: t.bars[1], value: -COMMITMENTS_TOTAL },
    { x: 270, from: 0, to: gap, color: '#D9480F', g: grow(0.34, 0.5), label: t.bars[2], value: gap },
  ]
  const ghost = grow(0.55, 0.72)
  return (
    <div className="relative h-full">
      <Label>{t.cash}</Label>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <Kpi label={t.available} value={eur(CASH.available * k, lang)} />
        <Kpi label={t.commitments} value={eur(COMMITMENTS_TOTAL * k, lang)} />
        <Kpi label={t.gap} value={eur(gap * k, lang)} tone="neg" />
      </div>
      <svg className="mt-5 overflow-visible" width="452" height="232" aria-hidden="true">
        <line x1="0" x2="452" y1={zero} y2={zero} stroke="#0B1030" strokeOpacity="0.25" strokeWidth="1" />
        <text x="452" y={zero - 5} textAnchor="end" fontSize="10.5" fill="rgba(11,16,48,0.45)">0</text>
        {bars.map((b, i) => {
          const y1 = y(Math.max(b.from, b.to)), y2 = y(Math.min(b.from, b.to))
          const h = (y2 - y1) * b.g
          const down = b.to < b.from
          return (
            <g key={i}>
              <rect x={b.x} width="80" rx="6" y={down ? y1 : y2 - h} height={Math.max(0, h)} fill={b.color} opacity={i === 1 ? 0.55 : 1} />
              <text x={b.x + 40} y={H + 22} textAnchor="middle" fontSize="12" fontWeight="600" fill="rgba(11,16,48,0.6)">{b.label}</text>
            </g>
          )
        })}
        {/* Ligações entre barras */}
        <line x1="110" x2="150" y1={y(CASH.available)} y2={y(CASH.available)} stroke="#0B1030" strokeOpacity={0.3 * grow(0.22, 0.3)} strokeDasharray="3 3" />
        <line x1="230" x2="270" y1={y(gap)} y2={y(gap)} stroke="#0B1030" strokeOpacity={0.3 * grow(0.34, 0.42)} strokeDasharray="3 3" />
        <text x="310" y={zero - 8} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#D9480F" opacity={grow(0.45, 0.55)}>{eur(gap, lang)}</text>
        {/* Cenário: o cliente principal paga */}
        <g opacity={ghost}>
          <rect x="390" width="56" rx="6" y={y(CASH_IF_MAIN_PAYS)} height={(y(gap) - y(CASH_IF_MAIN_PAYS)) * ghost} fill="rgba(0,82,255,0.06)" stroke="#0052FF" strokeDasharray="4 3" strokeWidth="1.5" />
          <text x="418" y={y(CASH_IF_MAIN_PAYS) - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0052FF">{eur(CASH_IF_MAIN_PAYS, lang, 0)}</text>
          <text x="418" y={H + 18} textAnchor="middle" fontSize="11" fontWeight="600" fill="#0052FF">{t.ifPays[0]}<tspan x="418" dy="13">{t.ifPays[1]}</tspan></text>
          <path d={`M 350 ${y(gap)} C 370 ${y(gap)}, 372 ${y(CASH_IF_MAIN_PAYS) + 20}, 390 ${y(CASH_IF_MAIN_PAYS) + 20}`} fill="none" stroke="#1E90FF" strokeWidth="2" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - ghost, filter: 'drop-shadow(0 0 4px rgba(30,144,255,0.8))' }} />
        </g>
      </svg>
      <p className="mt-1 text-[12px] text-[#0B1030]/55" style={enter(ramp(l, 0.4, 0.55), 4)}>
        {CASH.commitments.map((c, i) => (
          <span key={c.key}>{i > 0 && ' · '}{t.commitParts[c.key as keyof typeof t.commitParts]} {eur(c.amount, lang, 0)}</span>
        ))}
      </p>
      <p className="absolute inset-x-0 bottom-6 rounded-[12px] bg-[#0B1030]/[0.04] px-3.5 py-2.5 text-[12px] leading-[1.45] text-[#0B1030]/60" style={enter(ramp(l, 0.6, 0.78), 6)}>
        {t.assume}
      </p>
    </div>
  )
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'neg' }) {
  return (
    <div className="rounded-[12px] border border-[#0B1030]/[0.07] bg-[#FBFCFF] px-3 py-2.5">
      <p className="text-[11px] font-semibold text-[#0B1030]/50">{label}</p>
      <p className={cn('mt-1 text-[17px] font-bold tracking-[-0.02em] tabular-nums', tone === 'neg' ? 'text-[#D9480F]' : '')}>{value}</p>
    </div>
  )
}

/* ---------------- 4 · A recomendação ---------------- */
function Recommendation({ t, l }: { t: (typeof T)['pt']; l: number }) {
  const focus = easeOut(ramp(l, 0.55, 0.72))
  const draw = ease(ramp(l, 0.4, 0.6))
  return (
    <div className="relative h-full">
      <Label>{t.plan}</Label>
      <div className="mt-2 rounded-[14px] bg-[#F3F6FD] px-4 py-3">
        <p className="text-[14px] font-bold">{t.shows}</p>
        <ul className="mt-2 space-y-1.5">
          {t.showsItems.map((item, i) => (
            <li key={item} className="flex gap-2 text-[12.5px] leading-[1.42] text-[#0B1030]/75" style={enter(ramp(l, 0.04 + i * 0.08, 0.16 + i * 0.08), 6)}>
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#0B1030]/60" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-[14px] font-bold">{t.recs}</p>
      <ol className="mt-2 space-y-[6px]">
        {t.recItems.map((item, i) => {
          const f = i === 0 ? focus : 0
          return (
            <li
              key={item}
              className="relative flex items-center gap-3 rounded-[12px] border px-3 py-2"
              style={{
                ...enter(ramp(l, 0.26 + i * 0.07, 0.38 + i * 0.07), 8),
                borderColor: `rgba(0,82,255,${0.08 + 0.55 * f})`,
                backgroundColor: `rgba(238,243,255,${0.4 + 0.6 * f})`,
                boxShadow: f ? `0 14px 30px -16px rgba(0,82,255,${0.6 * f}), inset 3px 0 0 rgba(0,82,255,${f})` : undefined,
                transform: `${enter(ramp(l, 0.26 + i * 0.07, 0.38 + i * 0.07), 8).transform} scale(${1 + 0.02 * f})`,
              }}
            >
              <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold', i === 0 ? 'bg-accent text-white' : 'bg-white text-accent ring-1 ring-accent/25')}>{i + 1}</span>
              <span className="min-w-0 flex-1 text-[13px] font-medium leading-snug">{item}</span>
              {i === 0 && (
                <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10.5px] font-semibold text-white" style={{ opacity: f }}>{t.priority}</span>
              )}
            </li>
          )
        })}
      </ol>
      {/* Linha azul: da descoberta (o que os dados mostram) à recomendação principal */}
      <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="40" height="400" aria-hidden="true">
        <path d="M -10 120 C -16 160, -16 220, -2 250" fill="none" stroke="#1E90FF" strokeWidth="2" strokeLinecap="round" pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1 - draw, filter: 'drop-shadow(0 0 4px rgba(30,144,255,0.8))' }} />
      </svg>
    </div>
  )
}

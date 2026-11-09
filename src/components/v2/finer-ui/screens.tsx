/**
 * Reconstruções fiéis dos ecrãs reais da Finer One (Cashflow, Receitas,
 * Despesas, Clientes e Fornecedores, Alertas), a partir das capturas da
 * plataforma — com DADOS FICTÍCIOS. Nenhum nome, valor ou documento
 * corresponde a uma empresa ou pessoa real.
 *
 * Desenhadas para a largura de "ecrã de computador" (ScaledCanvas ≥ 1320px),
 * usadas na visita automática da Hero. Não são interativas.
 */
import type { ReactNode } from 'react'
import { CalendarDays, ChevronDown, ChevronRight, Download, FileText, Info, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ViewTitle } from './AppShell'

const ink = 'text-[#0B1030]'
const muted = 'text-[#0B1030]/65'
const card = 'rounded-2xl border border-[#0B1030]/[0.07] bg-white shadow-[0_12px_40px_-24px_rgba(11,16,48,0.35)]'
const label = 'text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#0B1030]/70'

function Page({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="px-8 pb-8 pt-6">
      <div className="flex items-start justify-between gap-6">
        <ViewTitle>{title}</ViewTitle>
        <div className="flex items-center gap-2">{right}</div>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  )
}

function Pill({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span className={cn('rounded-full px-3 py-1.5 text-[12.5px] font-medium', active ? 'bg-accent text-white' : 'bg-white/90 text-[#0B1030]/80')}>{children}</span>
  )
}

function Segmented({ items, active }: { items: string[]; active: number }) {
  return (
    <span className="inline-flex rounded-full border border-[#0B1030]/10 bg-white/90 p-1">
      {items.map((it, i) => (
        <Pill key={it} active={i === active}>
          {it}
        </Pill>
      ))}
    </span>
  )
}

function Select({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#0B1030]/10 bg-white px-3.5 py-2 text-[12.5px] font-medium">
      {children}
      <ChevronDown className="h-3.5 w-3.5 text-[#0B1030]/60" aria-hidden="true" />
    </span>
  )
}

function Money({ v, cents, className }: { v: string; cents: string; className?: string }) {
  return (
    <p className={cn('tabular mt-2 font-display font-bold tracking-[-0.01em]', className)}>
      <span className="mr-1 text-[15px] font-semibold">€</span>
      <span className="text-[30px]">{v}</span>
      <span className="text-[15px] font-semibold">,{cents}</span>
    </p>
  )
}

function Kpi({ title, children, note }: { title: string; children: ReactNode; note: string }) {
  return (
    <div className={cn(card, 'p-6')}>
      <p className={label}>{title}</p>
      {children}
      <p className={cn('mt-2 text-[12.5px]', muted)}>{note}</p>
    </div>
  )
}

/* ---------------- Cashflow ---------------- */

const cashMonths = [
  { m: 'jun.', in: 58.2, out: 41.3 },
  { m: 'jul.', in: 52.4, out: 49.8 },
  { m: 'ago.', in: 47.1, out: 38.6 },
  { m: 'set.', in: 63.9, out: 46.2 },
  { m: 'out.', in: 57.2, out: 39.6 },
  { m: 'nov.', in: 61.9, out: 44.2 },
]

export function CashflowView() {
  const max = 70
  return (
    <Page
      title="Cashflow"
      right={
        <>
          <Segmented items={['Histórico', 'Previsto']} active={0} />
          <Segmented items={['3 meses', '6 meses', '12 meses']} active={1} />
        </>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        <Kpi title="Saldo inicial" note="Início de junho">
          <Money v="31.890" cents="40" className={ink} />
        </Kpi>
        <Kpi title="Entradas liquidadas" note="214 faturas no período">
          <Money v="340.700" cents="15" className={ink} />
        </Kpi>
        <Kpi title="Saídas liquidadas" note="163 pagamentos no período">
          <Money v="259.700" cents="80" className={ink} />
        </Kpi>
        <Kpi title="Saldo final" note="Disponível hoje">
          <Money v="48.320" cents="15" className={ink} />
        </Kpi>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] gap-5">
        <div className={cn(card, 'p-7')}>
          <p className="text-[17px] font-bold">Evolução do cashflow</p>
          <p className={cn('mt-1 text-[12.5px]', muted)}>jun. – nov. · Entradas e saídas liquidadas por mês · Valores em €</p>
          <div className="relative mt-6 h-[300px]">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="absolute inset-x-12 border-t border-dashed border-[#0B1030]/[0.08]" style={{ top: `${i * 33}%` }} />
            ))}
            {['€ 70 mil', '€ 47 mil', '€ 23 mil', '€ 0'].map((t, i) => (
              <span key={t} className={cn('absolute left-0 -translate-y-1/2 text-[11px]', muted)} style={{ top: `${i * 33}%` }}>
                {t}
              </span>
            ))}
            <div className="absolute inset-x-12 bottom-[1%] top-0 flex items-end justify-around">
              {cashMonths.map((c) => (
                <div key={c.m} className="flex h-full flex-col items-center justify-end">
                  <div className="flex h-full items-end gap-1.5">
                    <span className="w-6 rounded-t-[4px] bg-accent" style={{ height: `${(c.in / max) * 100}%` }} />
                    <span className="w-6 rounded-t-[4px] bg-[#9DB7FF]" style={{ height: `${(c.out / max) * 100}%` }} />
                  </div>
                  <span className={cn('mt-2 text-[11.5px]', muted)}>{c.m}</span>
                </div>
              ))}
            </div>
            <div className="absolute left-[56%] top-[6%] rounded-xl border border-[#0B1030]/10 bg-white px-4 py-3 text-[12px] shadow-lg">
              <p className={muted}>set.</p>
              <p className="mt-1 flex justify-between gap-6"><span className={muted}>Entradas</span><span className="tabular font-semibold">€ 63.900,00</span></p>
              <p className="flex justify-between gap-6"><span className={muted}>Saídas</span><span className="tabular font-semibold">€ 46.200,00</span></p>
            </div>
          </div>
          <div className={cn('mt-5 flex justify-center gap-6 text-[12px]', muted)}>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-accent" />Entradas</span>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#9DB7FF]" />Saídas</span>
          </div>
        </div>

        <div className={cn(card, 'p-7')}>
          <p className="text-[17px] font-bold">Cashflow por atividade</p>
          {[
            ['Operacional', '€ 81.000,35', 'text-emerald-700', [['Entradas', '€ 340.700,15'], ['Saídas', '€ 259.699,80'], ['Média mensal', '€ 13.500,06']]],
            ['Investimentos', '− € 4.200,00', 'text-red-700', [['Entradas', '—'], ['Saídas', '€ 4.200,00']]],
            ['Financiamento', '− € 6.000,00', 'text-red-700', [['Entradas', '—'], ['Saídas', '€ 6.000,00']]],
          ].map(([name, total, tone, rows]) => (
            <div key={name as string} className="mt-4 border-b border-[#0B1030]/[0.08] pb-4">
              <p className="flex justify-between text-[14px] font-bold">
                {name as string}
                <span className={cn('tabular', tone as string)}>{total as string}</span>
              </p>
              {(rows as string[][]).map(([k, v]) => (
                <p key={k} className={cn('mt-1 flex justify-between text-[12.5px]', muted)}>
                  {k}
                  <span className="tabular">{v}</span>
                </p>
              ))}
            </div>
          ))}
          <div className="mt-4 rounded-xl border border-accent/25 bg-[#EEF3FF] p-4">
            <p className="flex justify-between text-[14px] font-bold">
              Cashflow líquido <span className="tabular text-emerald-700">€ 70.800,35</span>
            </p>
            <p className={cn('mt-1 flex justify-between text-[12.5px]', muted)}>
              Média mensal <span className="tabular">€ 11.800,06</span>
            </p>
          </div>
        </div>
      </div>
    </Page>
  )
}

/* ---------------- Receitas ---------------- */

const revenueCats: [string, string, number][] = [
  ['Serviços de consultoria', '€ 28.460,00', 46],
  ['Projetos', '€ 19.180,00', 31],
  ['Manutenção', '€ 9.280,00', 15],
  ['Formação', '€ 3.710,00', 6],
  ['Outras', '€ 1.240,00', 2],
]

function Header({ extra }: { extra?: ReactNode }) {
  return (
    <>
      <Segmented items={['Ano', 'Mês']} active={1} />
      <span className="text-[12.5px] font-semibold">Período</span>
      <Select>nov. 2026</Select>
      {extra}
    </>
  )
}

function CategoryList({ title, rows, toggle }: { title: string; rows: [string, string, number][]; toggle: [string, string] }) {
  return (
    <div className={cn(card, 'p-7')}>
      <div className="flex items-center justify-between">
        <p className="text-[17px] font-bold">{title}</p>
        <span className="inline-flex rounded-full border border-[#0B1030]/10 p-1 text-[12px]">
          <span className="rounded-full bg-accent px-3 py-1 font-medium text-white">{toggle[0]}</span>
          <span className="px-3 py-1 text-[#0B1030]/75">{toggle[1]}</span>
        </span>
      </div>
      <div className={cn('mt-5 flex justify-between border-b border-[#0B1030]/[0.08] pb-2', label)}>
        <span>Categoria</span>
        <span>Valor · % total</span>
      </div>
      {rows.map(([name, value, pct]) => (
        <div key={name} className="border-b border-[#0B1030]/[0.06] py-3.5">
          <p className="flex justify-between text-[14px]">
            {name}
            <span className="tabular font-semibold">
              {value} <span className={cn('ml-3 inline-block w-9 text-right font-normal', muted)}>{pct}%</span>
            </span>
          </p>
          <span className="mt-2 block h-1.5 w-[60%] overflow-hidden rounded-full bg-[#EEF3FF]">
            <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </span>
        </div>
      ))}
    </div>
  )
}

function LineChart({ title, sub, series, legend }: { title: string; sub: string; series: { d: string; dashed?: boolean }[]; legend: string[] }) {
  return (
    <div className={cn(card, 'p-7')}>
      <p className="text-[17px] font-bold">{title}</p>
      <p className={cn('mt-1 text-[12.5px]', muted)}>{sub}</p>
      <svg viewBox="0 0 640 300" className="mt-6 h-[300px] w-full" aria-hidden="true">
        <defs>
          <linearGradient id="fo-screen-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0052FF" stopOpacity="0.14" />
            <stop offset="1" stopColor="#0052FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 75, 150, 225, 290].map((y) => (
          <line key={y} x1="0" x2="640" y1={y} y2={y} stroke="#0B1030" strokeOpacity="0.07" strokeDasharray="4 6" />
        ))}
        {series.map((s, i) =>
          s.dashed ? (
            <path key={i} d={s.d} fill="none" stroke="#7FA6FF" strokeWidth="2" strokeDasharray="6 6" />
          ) : (
            <g key={i}>
              <path d={`${s.d} L640 290 L0 290 Z`} fill="url(#fo-screen-area)" />
              <path d={s.d} fill="none" stroke="#0052FF" strokeWidth="3" />
            </g>
          ),
        )}
      </svg>
      <div className={cn('mt-4 flex justify-center gap-6 text-[12px]', muted)}>
        {legend.map((l, i) => (
          <span key={l} className="inline-flex items-center gap-2">
            <span className={cn('h-0.5 w-4', i === 0 ? 'bg-accent' : 'border-t-2 border-dashed border-[#7FA6FF]')} />
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

export function ReceitasView() {
  return (
    <Page title="Receitas" right={<Header extra={<><span className="text-[12.5px] font-semibold">Comparar com</span><Select>Período anterior</Select></>} />}>
      <div className="grid grid-cols-3 gap-4">
        <Kpi title="Total de receitas" note="↑ 8,1% face ao período comparável">
          <Money v="61.870" cents="00" className="text-emerald-700" />
        </Kpi>
        <Kpi title="Variação face ao período comparável" note="Receita a mais no período">
          <Money v="4.637" cents="20" className="text-emerald-700" />
        </Kpi>
        <Kpi title="Valor médio por venda" note="48 vendas no período">
          <Money v="1.288" cents="96" className={ink} />
        </Kpi>
      </div>
      <div className="mt-5 grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5">
        <LineChart
          title="Evolução das receitas acumuladas"
          sub="01 – 30 nov. vs. 01 – 31 out. · Valores em €"
          series={[
            { d: 'M0 288 C 60 280, 100 262, 160 248 S 260 214, 320 196 S 420 150, 470 128 S 560 70, 640 52', dashed: true },
            { d: 'M0 288 C 50 276, 90 250, 150 240 S 240 210, 300 180 S 400 130, 460 104 S 560 52, 640 36' },
          ]}
          legend={['nov. 2026 (€ 61.870,00)', 'out. 2026 (€ 57.232,80)']}
        />
        <CategoryList title="Receitas por categoria" rows={revenueCats} toggle={['Categorias', 'Clientes']} />
      </div>
    </Page>
  )
}

/* ---------------- Despesas ---------------- */

const costCats: [string, string, number][] = [
  ['Fornecedores', '€ 16.780,00', 38],
  ['Pessoal', '€ 13.690,00', 31],
  ['Serviços e subscrições', '€ 7.510,00', 17],
  ['Renda', '€ 3.970,00', 9],
  ['Outras', '€ 2.200,00', 5],
]

export function DespesasView() {
  return (
    <Page title="Despesas" right={<Header extra={<><span className="text-[12.5px] font-semibold">Comparar com</span><Select>Período anterior</Select></>} />}>
      <div className="grid grid-cols-2 gap-4">
        <Kpi title="Despesas operacionais" note="Pagamentos reconhecidos no mês">
          <Money v="44.150" cents="00" className={ink} />
        </Kpi>
        <Kpi title="Variação das despesas operacionais" note="Face ao período comparável">
          <p className="tabular mt-2 font-display text-[30px] font-bold text-red-700">+ 11,6%</p>
        </Kpi>
      </div>
      <div className="mt-5 grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5">
        <LineChart
          title="Evolução das despesas operacionais acumuladas"
          sub="01 – 30 nov. · Valores em €"
          series={[{ d: 'M0 288 L 90 286 L 110 250 L 210 248 L 230 170 L 330 168 L 350 96 L 520 92 L 540 60 L 640 58' }]}
          legend={['nov. 2026 (€ 44.150,00)']}
        />
        <CategoryList title="Despesas por categoria" rows={costCats} toggle={['Categorias', 'Fornecedores']} />
      </div>
    </Page>
  )
}

/* ---------------- Clientes e Fornecedores ---------------- */

const docs: [string, string, string, string, string, 'late' | 'due'][] = [
  ['Cliente Exemplo A, Lda.', 'FT 2026/418', '28/10/2026', '€ 6.420,00', '24 dias', 'late'],
  ['Cliente Exemplo B, S.A.', 'FT 2026/421', '30/10/2026', '€ 4.980,00', '22 dias', 'late'],
  ['Cliente Exemplo C, Lda.', 'FT 2026/433', '04/11/2026', '€ 2.020,00', '17 dias', 'late'],
  ['Cliente Exemplo D', 'FT 2026/440', '09/11/2026', '€ 1.760,00', '12 dias', 'late'],
  ['Cliente Exemplo E, Lda.', 'FT 2026/447', '14/11/2026', '€ 1.840,00', '7 dias', 'late'],
  ['Cliente Exemplo F, Unip.', 'FT 2026/452', '18/12/2026', '€ 2.700,00', '—', 'due'],
  ['Cliente Exemplo G, Lda.', 'FT 2026/455', '22/12/2026', '€ 1.500,00', '—', 'due'],
]

function Ageing({ title, total, buckets }: { title: string; total: string; buckets: [string, string, string, number][] }) {
  return (
    <div className={cn(card, 'p-6')}>
      <p className="flex items-baseline justify-between">
        <span className="text-[17px] font-bold">{title}</span>
        <span className="tabular font-display text-[22px] font-bold">{total}</span>
      </p>
      <div className="mt-5 grid grid-cols-4 gap-4">
        {buckets.map(([v, l, n, w], i) => (
          <div key={l} className="text-center">
            <p className={cn('tabular text-[14px] font-bold', i === 0 && 'text-red-700')}>{v}</p>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[#EEF3FF]">
              <span className={cn('block h-full rounded-full', i === 0 ? 'bg-red-600' : 'bg-[#9DB7FF]')} style={{ width: `${w}%` }} />
            </span>
            <p className={cn('mt-2 text-[12px]', i === 0 ? 'text-red-700' : muted)}>{l}</p>
            <p className={cn('text-[11px]', muted)}>{n}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ClientesView() {
  return (
    <Page
      title="Clientes e Fornecedores"
      right={
        <>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0B1030]/10 bg-white px-3.5 py-2 text-[12.5px]">
            <span className={muted}>Posição em:</span>
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> 21/11/2026
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0B1030]/10 bg-white px-3.5 py-2 text-[12.5px] font-semibold">
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Exportar
          </span>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Ageing title="A receber" total="€ 26.300,00" buckets={[['€ 18.640,00', 'Vencido', '7 docs', 100], ['€ 0,00', 'Próximos 7 dias', '0 docs', 0], ['€ 4.200,00', '8 – 30 dias', '2 docs', 30], ['€ 3.460,00', '+ 30 dias', '3 docs', 22]]} />
        <Ageing title="A pagar" total="€ 21.430,00" buckets={[['€ 0,00', 'Vencido', '0 docs', 0], ['€ 4.980,00', 'Próximos 7 dias', '2 docs', 34], ['€ 9.150,00', '8 – 30 dias', '4 docs', 60], ['€ 7.300,00', '+ 30 dias', '3 docs', 48]]} />
      </div>
      <div className="mt-5 grid grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)] gap-5">
        <div className={cn(card, 'overflow-hidden')}>
          <div className="flex gap-6 border-b border-[#0B1030]/[0.08] px-6 pt-4">
            <span className="border-b-2 border-accent pb-3 text-[14px] font-semibold">Clientes</span>
            <span className={cn('pb-3 text-[14px]', muted)}>Fornecedores</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-4">
            {['Em aberto 10', 'Vencidos 7', 'A vencer 3'].map((f, i) => (
              <span key={f} className={cn('rounded-full border px-3 py-1.5 text-[12.5px]', i === 0 ? 'border-accent/40 bg-[#EEF3FF] font-semibold' : 'border-[#0B1030]/10')}>
                {f}
              </span>
            ))}
            <span className={cn('ml-auto inline-flex items-center gap-2 rounded-full border border-[#0B1030]/10 px-3 py-1.5 text-[12.5px]', muted)}>
              <Search className="h-3.5 w-3.5" aria-hidden="true" /> Pesquisar cliente, documento…
            </span>
          </div>
          <div className={cn('grid grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr_0.9fr] bg-[#F3F6FD] px-6 py-2.5', label)}>
            <span>Cliente</span><span>Documento</span><span>Vencimento</span><span className="text-right">Valor</span><span className="text-right">Atraso</span><span className="pl-4">Estado</span>
          </div>
          {docs.map(([c, d, v, val, late, st], i) => (
            <div key={d} className={cn('grid grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr_0.9fr] items-center border-t border-[#0B1030]/[0.06] px-6 py-3 text-[13px]', i === 0 && 'bg-[#EEF3FF]')}>
              <span className="font-semibold">{c}</span>
              <span className="text-accent">{d}</span>
              <span className={muted}>{v}</span>
              <span className="tabular text-right font-semibold">{val}</span>
              <span className={cn('text-right', st === 'late' ? 'text-red-700' : muted)}>{late}</span>
              <span className="pl-4">
                <span className={cn('inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11.5px]', st === 'late' ? 'bg-red-50 text-red-700' : 'bg-[#EEF3FF] text-accent')}>
                  <span className="h-1 w-1 rounded-full bg-current" />
                  {st === 'late' ? 'Em atraso' : 'A vencer'}
                </span>
              </span>
            </div>
          ))}
        </div>
        <div className={cn(card, 'p-6')}>
          <p className="flex items-center justify-between text-[17px] font-bold">
            Documento <X className="h-4 w-4 text-[#0B1030]/50" aria-hidden="true" />
          </p>
          <div className={cn('mt-4 flex flex-col items-center rounded-xl border border-dashed border-[#0B1030]/15 bg-[#F7F9FE] p-5 text-center text-[12px]', muted)}>
            <FileText className="h-5 w-5" aria-hidden="true" />
            <span className="mt-2">Pré-visualização do documento</span>
          </div>
          <p className={cn('mt-5', label)}>Detalhes</p>
          {[['Cliente', 'Cliente Exemplo A, Lda.'], ['N.º documento', 'FT 2026/418'], ['Vencimento', '28/10/2026'], ['Valor', '€ 6.420,00'], ['Categoria', 'Serviços de consultoria'], ['Estado', 'Em atraso'], ['Dias em atraso', '24 dias']].map(([k, v]) => (
            <p key={k} className="mt-2.5 flex justify-between text-[13px]">
              <span className={muted}>{k}</span>
              <span className={cn('font-medium', (k === 'Estado' || k === 'Dias em atraso') && 'text-red-700')}>{v}</span>
            </p>
          ))}
        </div>
      </div>
    </Page>
  )
}

/* ---------------- Alertas ---------------- */

const alerts: [string, string, string, string, string, string][] = [
  ['Crítico', 'Recebimentos', 'Clientes em atraso', '7 faturas a receber vencidas, no total de € 18.640,00.', '€ 18.640,00', 'por receber'],
  ['Crítico', 'Tesouraria', 'Saldo abaixo do mínimo em 6 semanas', 'As saídas previstas superam as entradas confirmadas.', '€ 5.000,00', 'mínimo definido'],
  ['Atenção', 'Despesas', 'Custos com fornecedores a subir', 'Aumento de 11,6% face ao mês anterior.', '+ € 4.589,10', 'vs. mês anterior'],
  ['Informativo', 'Fecho mensal', 'Fecho de outubro concluído', 'Todos os dados do mês estão completos.', '', ''],
]

const sev: Record<string, string> = {
  Crítico: 'border-red-200 bg-red-50 text-red-700',
  Atenção: 'border-amber-200 bg-amber-50 text-amber-800',
  Informativo: 'border-[#0052FF]/20 bg-[#EEF3FF] text-accent',
}

export function AlertasView() {
  return (
    <Page title="Alertas" right={<span className="inline-flex items-center gap-2 rounded-full border border-[#0B1030]/10 bg-white px-3.5 py-2 text-[12.5px] font-semibold"><Download className="h-3.5 w-3.5" aria-hidden="true" /> Exportar</span>}>
      <p className={cn('-mt-2 text-[14px]', muted)}>A Finer One analisou os seus dados e identificou 4 situações com impacto na tesouraria e na operação.</p>
      <div className="mt-6 grid grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] gap-5">
        <div>
          <div className={cn(card, 'flex items-center gap-5 px-5 py-3')}>
            <span className="rounded-lg bg-[#EEF3FF] px-3 py-1.5"><b className="font-display text-[20px] text-accent">4</b> <span className={cn('text-[12.5px]', muted)}>alertas ativos</span></span>
            <span><b className="font-display text-[20px] text-red-700">2</b> <span className={cn('text-[12.5px]', muted)}>crítico</span></span>
            <span><b className="font-display text-[20px] text-amber-700">1</b> <span className={cn('text-[12.5px]', muted)}>atenção</span></span>
            <span><b className="font-display text-[20px] text-accent">1</b> <span className={cn('text-[12.5px]', muted)}>informativo</span></span>
            <span className="ml-auto text-[12.5px]"><span className={muted}>Ordenar por</span> <b>Relevância</b></span>
          </div>
          <div className="mt-3 space-y-3">
            {alerts.map(([s, cat, title, text, value, note], i) => (
              <div key={title} className={cn(card, 'flex items-center gap-5 p-5', i === 0 && 'border-accent shadow-[0_14px_36px_-20px_rgba(0,82,255,0.7)]')}>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2">
                    <span className={cn('rounded border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider', sev[s])}>{s}</span>
                    <span className={cn('text-[12px]', muted)}>{cat}</span>
                  </p>
                  <p className="mt-2 text-[16px] font-bold">{title}</p>
                  <p className={cn('mt-1 text-[13px]', muted)}>{text}</p>
                </div>
                {value && (
                  <div className="border-l border-[#0B1030]/[0.08] pl-5 text-right">
                    <p className={cn('tabular text-[18px] font-bold', s === 'Crítico' ? 'text-red-700' : ink)}>{value}</p>
                    <p className={cn('text-[11.5px]', muted)}>{note}</p>
                  </div>
                )}
                <ChevronRight className="h-4 w-4 text-[#0B1030]/40" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
        <div className={cn(card, 'p-6')}>
          <p className="flex items-center gap-2">
            <span className={cn('rounded border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider', sev['Crítico'])}>Crítico</span>
            <span className={cn('text-[12px]', muted)}>Recebimentos</span>
          </p>
          <p className="mt-2 text-[18px] font-bold">Clientes em atraso</p>
          <div className="mt-4 rounded-xl border border-[#0B1030]/[0.08] p-4">
            <p className="tabular text-[20px] font-bold text-red-700">€ 18.640,00</p>
            <p className={cn('text-[12px]', muted)}>por receber</p>
          </div>
          <p className="mt-5 text-[14px] font-bold">Porque importa?</p>
          <p className={cn('mt-1 text-[13px] leading-relaxed', muted)}>3 clientes concentram 72% do valor em atraso. Sem cobrança, a tesouraria pode ficar abaixo do mínimo.</p>
          <div className="mt-5 rounded-xl bg-[#F3F6FD] p-4">
            <p className="text-[13.5px] font-bold">Ação recomendada</p>
            <p className={cn('mt-1 text-[13px]', muted)}>Cobrar primeiro os 3 clientes com maior valor em atraso.</p>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#0B1030]/15 px-4 py-2 text-[13px] font-semibold">
            <Info className="h-3.5 w-3.5" aria-hidden="true" /> Explica-me esta análise
          </p>
        </div>
      </div>
    </Page>
  )
}

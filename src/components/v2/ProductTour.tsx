import { useState } from 'react'
import { Home, Lightbulb, MousePointerClick } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { AppShell } from '@/components/v2/finer-ui/AppShell'
import type { View } from '@/components/v2/finer-ui/AppShell'
import { FinerAdvisorView } from '@/components/v2/finer-ui/FinerAdvisorView'
import { FinerHomeView } from '@/components/v2/finer-ui/FinerHomeView'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const copy = {
  pt: {
    kicker: 'A plataforma',
    title: ['Pergunte. Compreenda. ', 'Aja.'],
    sub: 'Explore a Finer Home e o Finer Advisor. Faça perguntas, escolha uma ação e simule o impacto na tesouraria.',
    tabs: { home: 'Finer Home', advisor: 'Finer Advisor' },
    tabHints: { home: 'Perguntas e visão do dia', advisor: 'Ações por impacto' },
    hint: 'Interativo — experimente clicar',
    window: 'Finer One · Demonstração',
    note: 'Interface demonstrativa com dados fictícios. A empresa, as pessoas e os valores não correspondem a nenhuma entidade real.',
  },
  en: {
    kicker: 'The platform',
    title: ['Ask. Understand. ', 'Act.'],
    sub: 'Explore Finer Home and Finer Advisor. Ask questions, pick an action and simulate the impact on cash.',
    tabs: { home: 'Finer Home', advisor: 'Finer Advisor' },
    tabHints: { home: 'Questions and daily view', advisor: 'Actions by impact' },
    hint: 'Interactive — try clicking',
    window: 'Finer One · Demo',
    note: 'Demo interface with fictitious data. The company, people and values do not correspond to any real entity.',
  },
}

const views: { id: View; Icon: typeof Home }[] = [
  { id: 'home', Icon: Home },
  { id: 'advisor', Icon: Lightbulb },
]

/** Demonstração principal: a interface real recriada, navegável. */
export function ProductTour() {
  const { lang } = useLanguage()
  const t = copy[lang]
  const [view, setView] = useState<View>('home')

  return (
    <section id="demo" aria-labelledby="demo-titulo" className="relative scroll-mt-24 pb-20 pt-20 text-navy lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">{t.kicker}</p>
          <h2 id="demo-titulo" className="mt-4 text-balance font-display text-[30px] font-bold leading-[1.1] tracking-[-0.025em] sm:text-[44px]">
            {t.title[0]}
            <span className="text-accent">{t.title[1]}</span>
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-navy/75">{t.sub}</p>
        </Reveal>

        <Reveal delay={100} className="mt-10 flex flex-col items-center gap-3">
          <div role="tablist" aria-label="Finer One" className="inline-flex rounded-2xl border border-navy/10 bg-white p-1.5 shadow-[0_10px_30px_-20px_rgba(7,13,43,0.5)]">
            {views.map(({ id, Icon }) => (
              <button
                key={id}
                role="tab"
                type="button"
                id={`tour-tab-${id}`}
                aria-selected={view === id}
                aria-controls="tour-panel"
                onClick={() => setView(id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-left transition-all duration-300 sm:px-5',
                  view === id ? 'bg-navy text-white shadow-[0_8px_24px_-10px_rgba(7,13,43,0.8)]' : 'text-navy/80 hover:bg-ice',
                )}
              >
                <Icon className={cn('h-4 w-4', view === id ? 'text-glow' : 'text-navy/75')} aria-hidden="true" />
                <span>
                  <span className="block text-[14px] font-semibold">{t.tabs[id]}</span>
                  <span className={cn('hidden text-[11.5px] sm:block', view === id ? 'text-white/75' : 'text-navy/75')}>{t.tabHints[id]}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-navy/70">
            <MousePointerClick className="h-4 w-4 text-accent" aria-hidden="true" />
            {t.hint}
          </p>
        </Reveal>

        <Reveal delay={180} className="relative mt-8">
          <div aria-hidden="true" className="absolute inset-x-[8%] -bottom-6 top-16 rounded-[48px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(0,82,255,0.30),transparent_70%)] blur-3xl" />
          <div className="relative overflow-hidden rounded-[20px] border border-navy/10 bg-white shadow-[0_50px_120px_-50px_rgba(7,13,43,0.55)]">
            <div className="flex items-center gap-3 border-b border-navy/[0.07] bg-white px-4 py-2.5">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-navy/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-navy/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-navy/15" />
              </div>
              <span className="mx-auto rounded-md bg-ice px-3 py-1 text-[11.5px] font-medium text-navy/70">{t.window}</span>
              <span className="w-[42px]" aria-hidden="true" />
            </div>
            <div id="tour-panel" role="tabpanel" aria-labelledby={`tour-tab-${view}`}>
              <AppShell view={view} onNavigate={setView}>
                <div key={view} className="fo-rise">
                  {view === 'home' ? <FinerHomeView onOpenAdvisor={() => setView('advisor')} /> : <FinerAdvisorView />}
                </div>
              </AppShell>
            </div>
          </div>
          <p className="mt-5 text-center text-[12.5px] text-navy/70">{t.note}</p>
        </Reveal>
      </div>
    </section>
  )
}

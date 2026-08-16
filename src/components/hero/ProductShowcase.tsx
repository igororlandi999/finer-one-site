import { DashboardMock } from '@/components/product/DashboardMock'
import { useLanguage } from '@/i18n/LanguageContext'

const copy = {
  pt: { short: 'Clique nas abas e explore', long: 'Clique nas abas e explore a plataforma' },
  en: { short: 'Click the tabs and explore', long: 'Click the tabs and explore the platform' },
}

/**
 * Moldura do produto: halo por baixo, borda em gradiente e sombra profunda
 * para o dashboard parecer emergir da Hero — sem perspetiva 3D, que
 * prejudicaria a legibilidade dos números.
 *
 * O halo usa inset-x-0 e nunca margens negativas horizontais: um elemento
 * absoluto mais largo que o contentor aumenta o scrollWidth da página e
 * torna-a deslocável lateralmente em browsers onde overflow-x: hidden no
 * body não é respeitado. O alcance visual do brilho vem do blur, que é
 * pintura e não afeta o layout.
 */
export function ProductShowcase() {
  const { lang } = useLanguage()
  const t = copy[lang]

  return (
    <div className="relative">
      {/* Halo por trás da moldura */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-10 bottom-8 rounded-[40px] bg-[radial-gradient(70%_60%_at_50%_0%,rgba(0,82,255,0.30),transparent_70%)] blur-3xl"
      />

      {/*
        Selo "é interativo": o mock parece uma captura de ecrã à primeira
        vista, e as áreas do menu não têm affordance de clique óbvia (são só
        botões de texto). Este selo é o que diz ao visitante para experimentar
        antes de ele rolar para a frente sem perceber.

        Em fluxo normal (não absoluto) acima da moldura, de propósito: um
        selo sobreposto ao dashboard tapava a barra superior do mock (avatar,
        seletor de período). Aqui empurra a moldura para baixo em vez de
        cobrir informação real.
      */}
      <div className="relative z-10 mb-3 flex justify-center sm:mb-4">
        <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/[0.35] bg-navy-deep px-3 py-1.5 text-[10.5px] font-medium text-glow shadow-frame sm:text-[11px]">
          <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-glow" />
          </span>
          <span className="sm:hidden">{t.short}</span>
          <span className="hidden sm:inline">{t.long}</span>
        </div>
      </div>

      {/* Borda em gradiente */}
      <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.14] via-white/[0.05] to-transparent p-px shadow-frame">
        <div className="overflow-hidden rounded-[15px] bg-navy-deep">
          <DashboardMock />
        </div>
      </div>

      {/* Reflexo suave por baixo do produto */}
      <div
        aria-hidden="true"
        className="mx-auto mt-px h-12 w-[85%] rounded-b-[40px] bg-[radial-gradient(50%_100%_at_50%_0%,rgba(30,144,255,0.16),transparent_70%)] blur-xl"
      />
    </div>
  )
}

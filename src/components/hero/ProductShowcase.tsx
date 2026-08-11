import { DashboardMock } from '@/components/product/DashboardMock'

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
  return (
    <div className="relative">
      {/* Halo por trás da moldura */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-10 bottom-8 rounded-[40px] bg-[radial-gradient(70%_60%_at_50%_0%,rgba(0,82,255,0.30),transparent_70%)] blur-3xl"
      />

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

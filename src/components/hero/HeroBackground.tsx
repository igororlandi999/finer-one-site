/**
 * Camadas de profundidade da Hero.
 *
 * Ordem: base navy -> grelha muito discreta -> arco de luz (linguagem visual
 * da marca) -> halo por trás do produto. Tudo decorativo e sem interação.
 */
export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base com gradiente vertical: mais escuro em cima, respirando no centro. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#0B1338_0%,#070D2B_45%,#050A20_100%)]" />

      {/* Grelha técnica, quase impercetível, esbatida nas margens. */}
      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(70% 55% at 50% 30%, #000 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(70% 55% at 50% 30%, #000 0%, transparent 100%)',
        }}
      />

      {/* Arco de luz — referência abstrata à onda da marca. */}
      <svg
        className="absolute left-1/2 top-[16%] h-[720px] w-[1800px] -translate-x-1/2 opacity-70 animate-glow-breathe"
        viewBox="0 0 1800 720"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="hero-arc" x1="0" y1="0" x2="1800" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E90FF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#1E90FF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#1E90FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-arc-soft" x1="0" y1="0" x2="1800" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0052FF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#0052FF" stopOpacity="0.35" />
            <stop offset="1" stopColor="#0052FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M-40 470 C 420 250, 1380 250, 1840 470" stroke="url(#hero-arc)" strokeWidth="1.25" />
        <path d="M-40 520 C 420 288, 1380 288, 1840 520" stroke="url(#hero-arc-soft)" strokeWidth="1" />
      </svg>

      {/* Halo por trás do produto. */}
      <div className="absolute left-1/2 top-[42%] h-[420px] w-[min(1100px,95vw)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(30,144,255,0.30),rgba(0,82,255,0.12)_45%,transparent_100%)] blur-3xl animate-glow-breathe" />

      {/* Fecho inferior para o produto emergir do fundo. */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-navy-deep" />
    </div>
  )
}

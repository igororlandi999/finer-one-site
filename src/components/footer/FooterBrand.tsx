/**
 * Marca em grande escala, no fecho da página.
 *
 * Dimensionada em vw com tracking proporcional, para ocupar sempre
 * praticamente a largura do contentor sem transbordar em nenhuma viewport.
 * Uma máscara esbate a base, de modo a que a palavra pareça assentar no fim
 * da página em vez de ficar simplesmente cortada.
 */
export function FooterBrand() {
  return (
    <div aria-hidden="true" className="overflow-hidden px-5 sm:px-6 lg:px-8">
      <p
        className="select-none whitespace-nowrap text-center font-display text-[13.2vw] font-semibold leading-[0.9] tracking-[0.055em] text-white/[0.085]"
        style={{
          maskImage: 'linear-gradient(to bottom, #000 42%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 42%, transparent 100%)',
        }}
      >
        FINER ONE
      </p>
    </div>
  )
}

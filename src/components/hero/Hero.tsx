import { Button, buttonClasses } from '@/components/ui/Button'
import { HeroBackground } from '@/components/hero/HeroBackground'
import { ProductShowcase } from '@/components/hero/ProductShowcase'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-32 sm:pb-24 sm:pt-36 lg:pb-32 lg:pt-40">
      <HeroBackground />

      <div className="relative mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="max-w-[900px] animate-fade-up text-balance font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[44px] lg:text-[52px]">
            A sua empresa já tem os números.
            <span className="mt-1.5 block text-white/[0.82]">
              Agora precisa de <span className="text-glow">respostas</span>.
            </span>
          </h1>

          <p className="mt-6 max-w-xl animate-fade-up text-balance text-[15px] leading-relaxed text-mist [animation-delay:90ms] sm:text-base">
            A Finer One analisa os dados financeiros da sua empresa, identifica o que está a
            acontecer, antecipa o que vem a seguir e recomenda o que fazer.
          </p>

          <div className="mt-9 flex w-full animate-fade-up flex-col items-center gap-3 [animation-delay:180ms] sm:w-auto sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto">
              Agendar Demo
            </Button>
            {/*
              Âncora e não botão: isto é navegação, não uma ação. O destino é
              a secção #produto — a narrativa Conectar / Organizar /
              Interpretar / Decidir, que é onde se explica efetivamente como a
              Finer One funciona. O deslocamento suave vem do
              scroll-behavior definido em index.css e o scroll-mt-24 da própria
              secção mantém o título livre da Navbar fixa.
            */}
            <a
              href="#produto"
              className={buttonClasses({
                variant: 'ghost',
                size: 'lg',
                className: 'w-full sm:w-auto',
              })}
            >
              Ver como funciona
            </a>
          </div>
        </div>

        <div className="mt-16 animate-fade-up [animation-delay:280ms] sm:mt-20">
          <ProductShowcase />
        </div>
      </div>
    </section>
  )
}

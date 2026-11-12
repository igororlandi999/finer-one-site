import { useRef } from 'react'
import { MotionConfig, motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import type { Variants } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

/**
 * Sobre nós (12/11/2026) — à maneira da página "About" da Searchable (a Lovable não
 * tem uma): frase de abertura, imagens, a história, as pessoas por trás, momentos e
 * um convite final. Todo o conteúdo vem do documento "FINER ONE — BRAND STRATEGY"
 * (respostas dos três fundadores), adaptado a PT-PT sem acrescentar factos.
 * Sem fotografias dos fundadores (ainda não existem): iniciais no lugar das fotos.
 */
const copy = {
  pt: {
    eyebrow: 'Sobre nós',
    title: ['Nenhuma empresa deveria tomar decisões importantes ', 'às cegas.'],
    sub: 'Estamos a construir o sistema operativo financeiro das PME portuguesas: a análise e o apoio à decisão que, até hoje, estavam ao alcance sobretudo das grandes empresas.',
    gallery: 'Imagens da identidade Finer One',
    storyTitle: ['Uma ideia que começou ', 'numa conversa.'],
    storyLead: 'Os empresários têm números: contabilidade, extratos, faturas. O que lhes falta é perceber o que esses números dizem sobre o negócio e o que fazer a seguir.',
    story: [
      'Em outubro de 2025, o Henrique e o Sebastião começaram por fazer consultoria financeira a pequenas e médias empresas. A dor era real: os empresários queriam perceber melhor a gestão do seu negócio, mas não tinham tempo, e a contabilidade não lhes dava essa resposta.',
      'Perceberam depressa que a consultoria tinha limites de escala. Em maio de 2026, numa conversa com o Igor, que voltava a Portugal com experiência a criar produtos tecnológicos no Brasil, a ideia ganhou outra forma: transformar esse conhecimento num produto capaz de ajudar milhares de empresas.',
      'Assim nasceu a Finer One: o encontro entre finanças, gestão e tecnologia, construído pelos três.',
    ],
    peopleTitle: ['Três pessoas. ', 'Uma visão.'],
    cofounder: 'Cofundador',
    joinTitle: ['Construa a Finer One ', 'connosco.'],
    joinText: 'Teste a plataforma antes do lançamento e ajude-nos a definir o que vem a seguir.',
    joinCta: 'Ser Finer Pioneer',
    peopleSub: 'Tecnologia, negócios e finanças a trabalhar em conjunto para transformar a gestão das empresas.',
    founders: [
      { name: 'Henrique Bértolo', photo: '/images/fundadores/henrique.webp', quote: 'O empresário trabalha para o negócio. O que tem de acontecer é o negócio trabalhar para o empresário.' },
      { name: 'Igor Orlandi', photo: '/images/fundadores/igor.webp', quote: 'Mais do que apresentar números, queremos ajudar os empresários a compreender melhor o seu negócio e a decidir com mais segurança.' },
      { name: 'Sebastião Andrade', photo: '/images/fundadores/sebastiao.webp', quote: 'Ter acesso a números não significa necessariamente saber gerir um negócio.' },
    ],
    beliefTitle: ['Em que ', 'acreditamos.'],
    beliefs: [
      { title: 'Inteligência financeira para todas as empresas.', text: 'As PME devem ter ferramentas de análise e apoio à decisão semelhantes às das grandes empresas, sem precisarem de grandes equipas financeiras.' },
      { title: 'Antecipar em vez de reagir.', text: 'Explicar o que aconteceu, porque aconteceu e o que pode ser feito — e alertar antes de os problemas chegarem.' },
      { title: 'Simples, claro e moderno.', text: 'Nenhum empresário deveria precisar de formação em finanças para perceber a sua própria empresa.' },
    ],
    giveBack: ['Queremos devolver aos empresários ', 'tempo, confiança e tranquilidade.'],
    giveBackSub: 'Tempo para se concentrarem no negócio, confiança para tomarem decisões e tranquilidade por terem mais controlo sobre a situação financeira.',
    momentsTitle: 'Alguns momentos pelo caminho',
    moments: [
      { date: 'Outubro de 2025', text: 'As primeiras consultorias financeiras a PME mostram uma dor real.' },
      { date: 'Maio de 2026', text: 'O Igor junta-se ao projeto e a ideia passa a produto tecnológico.' },
      { date: 'A seguir', text: 'Ser o braço direito de todos os empresários.' },
    ],
    visionTitle: ['O nosso objetivo: ser o ', 'braço direito de cada empresário.'],
    visionSub: 'Uma plataforma presente no dia a dia das empresas, que acompanha o negócio, antecipa problemas e ajuda a identificar oportunidades.',
    pioneers: 'Ser Finer Pioneer',
    waitlist: 'Entrar na lista de espera',
  },
  en: {
    eyebrow: 'About us',
    title: ['No company should make important decisions ', 'blindfolded.'],
    sub: 'We are building the financial operating system for Portuguese SMEs: the analysis and decision support that, until now, were mostly available to large companies.',
    gallery: 'Finer One identity images',
    storyTitle: ['An idea that started ', 'with a conversation.'],
    storyLead: 'Business owners have numbers: accounting, statements, invoices. What they lack is understanding what those numbers say about the business and what to do next.',
    story: [
      'In October 2025, Henrique and Sebastião started offering financial consulting to small and medium-sized companies. The pain was real: owners wanted to understand their business better, but had no time, and accounting did not give them that answer.',
      'They soon realised consulting would not scale. In May 2026, in a conversation with Igor — back in Portugal with experience building tech products in Brazil — the idea took a new shape: turning that knowledge into a product that could help thousands of companies.',
      'That is how Finer One was born: where finance, management and technology meet, built by the three of them.',
    ],
    peopleTitle: ['Three people. ', 'One vision.'],
    cofounder: 'Co-founder',
    joinTitle: ['Build Finer One ', 'with us.'],
    joinText: 'Try the platform before launch and help us shape what comes next.',
    joinCta: 'Become a Finer Pioneer',
    peopleSub: 'Technology, business and finance working together to transform how companies are managed.',
    founders: [
      { name: 'Henrique Bértolo', photo: '/images/fundadores/henrique.webp', quote: 'Business owners work for their business. What needs to happen is the business working for them.' },
      { name: 'Igor Orlandi', photo: '/images/fundadores/igor.webp', quote: 'More than showing numbers, we want to help owners understand their business better and decide with more confidence.' },
      { name: 'Sebastião Andrade', photo: '/images/fundadores/sebastiao.webp', quote: 'Having access to numbers does not necessarily mean knowing how to run a business.' },
    ],
    beliefTitle: ['What we ', 'believe.'],
    beliefs: [
      { title: 'Financial intelligence for every company.', text: 'SMEs should have analysis and decision-support tools like those of large companies, without needing large finance teams.' },
      { title: 'Anticipate instead of react.', text: 'Explain what happened, why it happened and what can be done — and flag issues before they arrive.' },
      { title: 'Simple, clear and modern.', text: 'No owner should need a finance degree to understand their own company.' },
    ],
    giveBack: ['We want to give business owners back ', 'time, confidence and peace of mind.'],
    giveBackSub: 'Time to focus on the business, confidence to make decisions and peace of mind from having more control over their finances.',
    momentsTitle: 'A few moments along the way',
    moments: [
      { date: 'October 2025', text: 'The first financial consulting projects with SMEs reveal a real pain.' },
      { date: 'May 2026', text: 'Igor joins the project and the idea becomes a tech product.' },
      { date: 'Next', text: 'Becoming every business owner’s right hand.' },
    ],
    visionTitle: ['Our goal: to be every owner’s ', 'right hand.'],
    visionSub: 'A platform present in companies’ day-to-day, following the business, anticipating problems and helping spot opportunities.',
    pioneers: 'Become a Finer Pioneer',
    waitlist: 'Join the waitlist',
  },
}
type T = (typeof copy)['pt']

const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const rise: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.25 } } as const

const Eyebrow = ({ children, center }: { children: string; center?: boolean }) => (
  <motion.p variants={rise} className={cn('inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep', center && 'justify-center')}>
    <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
    {children}
  </motion.p>
)

export function AboutPage() {
  const { lang } = useLanguage()
  const t = copy[lang]
  return (
    <MotionConfig reducedMotion="user">
      <Hero t={t} />
      <Story t={t} />
      <People t={t} />
      <Beliefs t={t} />
      <Moments t={t} />
      <Vision t={t} />
    </MotionConfig>
  )
}

/* 1 · Abertura + imagens (como as fotografias da equipa na Searchable) */
function Hero({ t }: { t: T }) {
  const imgs = [
    { src: '/images/sobre-montanha-linha.webp', pos: '62% 30%', cls: 'col-span-2 aspect-[16/11] lg:col-span-1 lg:aspect-auto' },
    { src: '/images/sobre-edificio.webp', pos: '50% 30%', cls: 'aspect-[3/4] lg:aspect-auto' },
    { src: '/images/sobre-rede.webp', pos: '45% 45%', cls: 'aspect-[3/4] lg:aspect-auto' },
  ]
  return (
    <section aria-labelledby="sobre-titulo" className="bg-white pb-16 pt-36 text-navy sm:pt-40">
      <motion.div variants={group} initial="hidden" animate="show" className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <motion.h1 variants={rise} id="sobre-titulo" className="mt-6 max-w-[900px] text-balance font-display text-[40px] font-bold leading-[1.02] tracking-[-0.04em] text-[#070D2B] sm:text-[58px] lg:text-[68px]">
          {t.title[0]}
          <span className="text-accent-deep">{t.title[1]}</span>
        </motion.h1>
        <motion.p variants={rise} className="mt-6 max-w-[600px] text-[17px] leading-[1.6] text-[#0B1030]/65 sm:text-[18.5px]">
          {t.sub}
        </motion.p>
      </motion.div>

      <motion.div variants={group} initial="hidden" animate="show" aria-label={t.gallery} role="img" className="mx-auto mt-14 grid max-w-[1400px] grid-cols-2 gap-3 px-3 sm:px-4 lg:h-[460px] lg:grid-cols-[1.6fr_0.9fr_1.3fr]">
        {imgs.map((im, i) => (
          <motion.div key={im.src} variants={{ hidden: { opacity: 0, y: 30, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: EASE, delay: 0.25 + i * 0.1 } } }} className={cn('group relative overflow-hidden rounded-[22px]', im.cls)}>
            <img src={im.src} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]" style={{ objectPosition: im.pos }} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* 2 · A história (como "A different kind of search company") */
function Story({ t }: { t: T }) {
  return (
    <section className="bg-white text-navy">
      <motion.div variants={group} {...inView} className="mx-auto grid max-w-content gap-10 border-t border-[#0B1030]/[0.08] px-5 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:px-8 lg:py-28">
        <motion.h2 variants={rise} className="font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[44px] lg:sticky lg:top-28 lg:self-start">
          {t.storyTitle[0]}
          <span className="text-accent-deep">{t.storyTitle[1]}</span>
        </motion.h2>
        <div>
          <motion.p variants={rise} className="font-display text-[22px] font-semibold leading-[1.4] tracking-[-0.015em] text-[#070D2B] sm:text-[25px]">
            {t.storyLead}
          </motion.p>
          {t.story.map((p) => (
            <motion.p variants={rise} key={p.slice(0, 20)} className="mt-6 text-[16.5px] leading-[1.7] text-[#0B1030]/70">
              {p}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

/* 3 · As pessoas por trás (como "The people behind Searchable"), cada uma com uma frase sua */
function People({ t }: { t: T }) {
  return (
    <section className="bg-[#F7F9FE] text-navy">
      <motion.div variants={group} {...inView} className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <motion.h2 variants={rise} className="font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] text-[#070D2B] sm:text-[44px]">
            {t.peopleTitle[0]}
            <span className="block text-accent-deep">{t.peopleTitle[1]}</span>
          </motion.h2>
          <motion.p variants={rise} className="self-end text-[18px] leading-[1.6] text-[#0B1030]/65">
            {t.peopleSub}
          </motion.p>
        </div>

        {/* Como na apresentação Investidores & Parcerias: fotografia, risca azul, nome — e a frase de cada um */}
        <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {t.founders.map((f, i) => (
            <motion.figure key={f.name} variants={rise}>
              <div className="overflow-hidden rounded-[14px] bg-[#E9ECF3]">
                <img
                  src={f.photo}
                  alt={f.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </div>
              <motion.span
                aria-hidden="true"
                className="mt-5 block h-[3px] w-12 origin-left rounded-full bg-accent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 1 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.12 }}
              />
              <figcaption className="mt-4">
                <span className="block font-display text-[18px] font-bold tracking-[-0.01em] text-[#070D2B]">{f.name}</span>
                <span className="mt-0.5 block text-[13.5px] font-medium text-[#0B1030]/55">{t.cofounder}</span>
              </figcaption>
              <blockquote className="mt-2.5 text-[14.5px] leading-[1.6] text-[#0B1030]/65">“{f.quote}”</blockquote>
            </motion.figure>
          ))}
          <motion.a
            variants={rise}
            href="/pioneers/"
            className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-[14px] bg-[#070D2B] p-6 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
          >
            <img src="/images/sobre-linha.webp" alt="" aria-hidden="true" className="absolute inset-x-0 top-[30%] h-[24%] w-full object-cover object-[60%_50%] opacity-90 mix-blend-screen transition-transform duration-700 ease-out group-hover:translate-x-[-6%]" style={{ maskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)' }} />
            <p className="relative font-display text-[22px] font-bold leading-[1.15] tracking-[-0.02em]">
              {t.joinTitle[0]}
              <span className="text-[#3D86FF]">{t.joinTitle[1]}</span>
            </p>
            <div className="relative">
              <p className="text-[14px] leading-[1.55] text-white/70">{t.joinText}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold">
                {t.joinCta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </div>
          </motion.a>
        </div>
      </motion.div>
    </section>
  )
}

/* 4 · Em que acreditamos + o que queremos devolver (escuro, como as secções de impacto) */
function Beliefs({ t }: { t: T }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-deep text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <img src="/images/sobre-linha.webp" alt="" className="absolute inset-x-0 bottom-0 h-[150px] w-full object-cover object-[70%_50%] opacity-80 mix-blend-screen" style={{ maskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)' }} />
        <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_20%_15%,rgba(0,82,255,0.2),transparent_70%)]" />
      </div>
      <motion.div variants={group} {...inView} className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.h2 variants={rise} className="font-display text-[34px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[44px]">
          {t.beliefTitle[0]}
          <span className="text-[#3D86FF]">{t.beliefTitle[1]}</span>
        </motion.h2>
        <ul className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-3">
          {t.beliefs.map((b, i) => (
            <motion.li key={b.title} variants={rise} className="relative pt-7">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <motion.span aria-hidden="true" className="absolute left-0 top-0 h-[2px] w-full origin-left bg-[#3D86FF]" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.18 }} />
              <span className="font-display text-[13px] font-bold text-[#7CB8FF]">0{i + 1}</span>
              <p className="mt-3 font-display text-[22px] font-bold leading-[1.2] tracking-[-0.02em]">{b.title}</p>
              <p className="mt-3 text-[15.5px] leading-[1.65] text-white/70">{b.text}</p>
            </motion.li>
          ))}
        </ul>

        <motion.div variants={rise} className="mt-24 max-w-[880px] pb-24">
          <p className="text-balance font-display text-[30px] font-bold leading-[1.12] tracking-[-0.03em] sm:text-[42px]">
            {t.giveBack[0]}
            <span className="text-[#3D86FF]">{t.giveBack[1]}</span>
          </p>
          <p className="mt-5 max-w-[620px] text-[17px] leading-[1.6] text-white/70">{t.giveBackSub}</p>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* 5 · Alguns momentos (como "A few moments along the way"), com a linha a crescer com o scroll */
function Moments({ t }: { t: T }) {
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.55'] })
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  return (
    <section className="bg-white text-navy">
      <motion.div variants={group} {...inView} className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <motion.p variants={rise} className="text-[13px] font-semibold text-[#0B1030]/45">{t.momentsTitle}</motion.p>
        <ol ref={ref} className="relative mt-8">
          <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-[#0B1030]/10 md:left-[180px]" />
          <motion.span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-[2px] origin-top bg-accent md:left-[180px]" style={{ scaleY: reduced ? 1 : fill }} />
          {t.moments.map((m) => (
            <motion.li key={m.date} variants={rise} className="relative grid gap-1 border-b border-[#0B1030]/[0.07] py-6 pl-6 md:grid-cols-[180px_1fr] md:pl-0">
              <span aria-hidden="true" className="absolute left-[-4px] top-[30px] h-2.5 w-2.5 rounded-full border-2 border-white bg-accent shadow-[0_0_0_3px_rgba(0,82,255,0.15)] md:left-[176px]" />
              <span className="text-[13.5px] font-semibold text-[#0B1030]/50">{m.date}</span>
              <span className="font-display text-[19px] font-semibold tracking-[-0.01em] text-[#070D2B] md:pl-10">{m.text}</span>
            </motion.li>
          ))}
        </ol>
      </motion.div>
    </section>
  )
}

/* 6 · Visão + convite (como "Help us build what comes next") */
function Vision({ t }: { t: T }) {
  return (
    <section className="bg-white pb-28 text-navy">
      <motion.div variants={group} {...inView} className="mx-auto grid max-w-content items-end gap-10 border-t border-[#0B1030]/[0.08] px-5 pt-20 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:px-8">
        <motion.h2 variants={rise} className="text-balance font-display text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-[#070D2B] sm:text-[46px]">
          {t.visionTitle[0]}
          <span className="text-accent-deep">{t.visionTitle[1]}</span>
        </motion.h2>
        <div>
          <motion.p variants={rise} className="text-[17px] leading-[1.6] text-[#0B1030]/65">
            {t.visionSub}
          </motion.p>
          <motion.div variants={rise} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/pioneers/" className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(0,82,255,0.95)] transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow">
              {t.pioneers}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <a href="/lista-espera/" className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#0B1030]/15 px-6 text-[15px] font-semibold text-[#070D2B] transition-colors hover:border-[#070D2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              {t.waitlist}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

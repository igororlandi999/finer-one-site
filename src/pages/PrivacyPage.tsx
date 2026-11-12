import { useEffect, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { ArrowUpRight, ChevronDown, Mail } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

/**
 * Aviso de privacidade dos formulários — RASCUNHO.
 * Visual (12/11/2026) à maneira das páginas legais da Ramp (índice fixo ao lado,
 * secções numeradas, leitura confortável), da Searchable (bloco "como nos contactar"
 * e identificação da empresa) e da Lovable (página branca e sóbria, datas no topo).
 * Texto apenas em português até validação jurídica. Os elementos entre
 * [colchetes] têm de ser confirmados pelos fundadores antes de publicar.
 */
const CONTACT = 'geral.finerone@gmail.com'

type Section = { id: string; title: string; body: (string | string[])[] }
const sections: Section[] = [
  {
    id: 'responsavel',
    title: 'Quem é o responsável pelos dados',
    body: [`Finer One [denominação legal, NIF e morada a confirmar]. Para qualquer questão sobre privacidade, escreva para ${CONTACT}.`],
  },
  {
    id: 'dados',
    title: 'Que dados recolhemos',
    body: [
      'Recolhemos apenas o que nos indica nos formulários do site:',
      [
        'Lista de espera: nome, email, dimensão da empresa e os temas que quer acompanhar.',
        'Finer Pioneers: nome, empresa, setor de atividade, email profissional e a descrição do principal desafio financeiro que decidir partilhar.',
      ],
      'Registamos também a data do envio e a versão deste aviso que aceitou. Não pedimos dados bancários nem documentos da empresa nestes formulários.',
    ],
  },
  {
    id: 'finalidades',
    title: 'Para que usamos os dados',
    body: [
      [
        'Lista de espera: enviar-lhe novidades sobre a Finer One e sobre o acesso à plataforma.',
        'Finer Pioneers: avaliar a sua candidatura e contactá-lo sobre o programa.',
      ],
      'Não vendemos nem cedemos os seus dados a terceiros para fins de marketing.',
    ],
  },
  {
    id: 'fundamento',
    title: 'Com que fundamento',
    body: ['O tratamento baseia-se no seu consentimento, que pode retirar a qualquer momento, sem afetar o tratamento realizado até então.'],
  },
  {
    id: 'onde',
    title: 'Onde ficam os dados',
    body: ['Os dados são guardados [no serviço escolhido pela Finer One — a confirmar], com acesso restrito à equipa da Finer One.'],
  },
  {
    id: 'prazo',
    title: 'Durante quanto tempo',
    body: ['Conservamos os dados enquanto o programa ou a lista de espera estiverem ativos, ou até retirar o consentimento [prazo máximo a confirmar].'],
  },
  {
    id: 'direitos',
    title: 'Os seus direitos',
    body: [
      `Pode pedir acesso, retificação, apagamento, limitação ou portabilidade dos seus dados, e opor-se ao tratamento, escrevendo para ${CONTACT}.`,
      'Tem também o direito de apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD).',
    ],
  },
]

const EASE = [0.22, 1, 0.36, 1] as const

export function PrivacyPage() {
  const { lang } = useLanguage()
  const active = useActiveSection(sections.map((s) => s.id))

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="priv-titulo" className="bg-white pb-28 pt-32 text-navy lg:pt-40">
        <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="border-b border-[#0B1030]/[0.08] pb-10">
            <p className="inline-flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.26em] text-accent-deep">
              <span aria-hidden="true" className="h-px w-8 bg-accent-deep/60" />
              Legal
            </p>
            <h1 id="priv-titulo" className="mt-6 font-display text-[40px] font-bold leading-[1.02] tracking-[-0.04em] text-[#070D2B] sm:text-[56px] lg:text-[64px]">
              Aviso de <span className="text-accent-deep">privacidade</span>
            </h1>
            <p className="mt-5 max-w-[620px] text-[17px] leading-[1.6] text-[#0B1030]/65">
              Como tratamos os dados que nos envia nos formulários da Lista de espera e do programa Finer Pioneers.
            </p>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-[13.5px]">
              <div>
                <dt className="text-[#0B1030]/45">Estado</dt>
                <dd className="mt-1 inline-flex items-center gap-2 font-semibold text-[#070D2B]">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
                  Rascunho em revisão
                </dd>
              </div>
              <div>
                <dt className="text-[#0B1030]/45">Última atualização</dt>
                <dd className="mt-1 font-semibold text-[#070D2B]">[data a confirmar na publicação]</dd>
              </div>
              <div>
                <dt className="text-[#0B1030]/45">Aplica-se a</dt>
                <dd className="mt-1 font-semibold text-[#070D2B]">Formulários do site finer-one.com</dd>
              </div>
            </dl>
            {lang === 'en' && (
              <p className="mt-6 text-[13.5px] text-[#0B1030]/55">This notice is available in Portuguese only while it is under legal review.</p>
            )}
          </motion.div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-20">
            {/* Conteúdo */}
            <div className="max-w-[700px]">
              <details className="group mb-6 rounded-2xl border border-[#0B1030]/[0.08] lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[14px] font-semibold text-[#070D2B] [&::-webkit-details-marker]:hidden">
                  Nesta página
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <ol className="border-t border-[#0B1030]/[0.08] px-5 py-3">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="block py-2 text-[14.5px] text-[#0B1030]/70 hover:text-[#070D2B]">
                        <span className="mr-1.5 tabular-nums">{i + 1}.</span>
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
              <p role="note" className="rounded-2xl border border-[#0B1030]/[0.08] bg-[#F7F9FE] p-5 text-[14.5px] leading-[1.65] text-[#0B1030]/75">
                <strong className="font-semibold text-[#070D2B]">Em resumo:</strong> pedimos só o necessário para o manter informado ou avaliar a sua
                candidatura, não vendemos os seus dados e pode pedir para os apagar a qualquer momento.
              </p>

              <div className="mt-2 space-y-4">
                {sections.map((s, i) => (
                  <article key={s.id} id={s.id} className="scroll-mt-16 pt-10">
                    <h2 className="font-display text-[24px] font-bold tracking-[-0.025em] text-[#070D2B] sm:text-[28px]">
                      <span className="mr-3 text-accent-deep">{i + 1}.</span>
                      {s.title}
                    </h2>
                    {s.body.map((p, j) =>
                      Array.isArray(p) ? (
                        <ul key={j} className="mt-4 space-y-2.5">
                          {p.map((li) => (
                            <li key={li} className="relative pl-5 text-[16px] leading-[1.7] text-[#0B1030]/75">
                              <span aria-hidden="true" className="absolute left-0 top-[11px] h-1.5 w-1.5 rounded-full bg-accent" />
                              {withEmail(li)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p key={j} className="mt-4 text-[16px] leading-[1.7] text-[#0B1030]/75">
                          {withEmail(p)}
                        </p>
                      ),
                    )}
                  </article>
                ))}
              </div>

              {/* Contacto (como "How to contact us about privacy" na Searchable) */}
              <div className="relative mt-16 overflow-hidden rounded-[24px] bg-[#070D2B] p-7 text-white sm:p-9">
                <img src="/images/sobre-linha.webp" alt="" aria-hidden="true" className="absolute inset-x-0 bottom-[-6%] h-[50%] w-full object-cover object-[80%_50%] opacity-70 mix-blend-screen" style={{ maskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)' }} />
                <div className="relative">
                  <p className="font-display text-[24px] font-bold tracking-[-0.02em]">
                    Tem alguma questão sobre <span className="text-[#3D86FF]">os seus dados?</span>
                  </p>
                  <p className="mt-3 max-w-[480px] text-[15px] leading-[1.6] text-white/70">
                    Escreva-nos para pedir acesso, correção ou eliminação. Respondemos dentro dos prazos previstos na lei.
                  </p>
                  <a
                    href={`mailto:${CONTACT}`}
                    className="group mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14.5px] font-semibold text-[#070D2B] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {CONTACT}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            {/* Índice fixo (como na Ramp) */}
            <nav aria-label="Nesta página" className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0B1030]/45">Nesta página</p>
                <ol className="relative mt-5 border-l border-[#0B1030]/10">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        aria-current={active === s.id ? 'location' : undefined}
                        className={cn(
                          '-ml-px block border-l-2 py-2 pl-4 text-[14px] leading-snug transition-colors',
                          active === s.id ? 'border-accent font-semibold text-[#070D2B]' : 'border-transparent text-[#0B1030]/55 hover:text-[#070D2B]',
                        )}
                      >
                        <span className="mr-1.5 tabular-nums">{i + 1}.</span>
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}

/** Torna o email de contacto clicável dentro do texto. */
function withEmail(text: string) {
  const parts = text.split(CONTACT)
  return parts.flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <a key={i} href={`mailto:${CONTACT}`} className="font-medium text-accent-deep underline decoration-accent-deep/30 underline-offset-4 hover:decoration-accent-deep">
            {CONTACT}
          </a>,
          part,
        ],
  )
}

/** Secção visível no momento (para destacar no índice). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const onScroll = () => {
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      const contact = document.getElementById(ids[ids.length - 1])
      if (atEnd || (contact && contact.getBoundingClientRect().bottom < window.innerHeight * 0.6)) return setActive(ids[ids.length - 1])
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return active
}

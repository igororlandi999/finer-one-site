import { useEffect, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { ArrowUpRight, ChevronDown, Mail } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { FORMS_PROVIDER } from '@/lib/forms'
import { cn } from '@/lib/utils'

/**
 * Aviso de privacidade dos formulários (Lista de Espera e Finer Pioneers).
 * Visual (12/11/2026) à maneira das páginas legais da Ramp (índice fixo ao lado,
 * secções numeradas, leitura confortável), da Searchable (bloco "como nos contactar"
 * e identificação da empresa) e da Lovable (página branca e sóbria, datas no topo).
 *
 * Conteúdo revisto a 13/11/2026 e 15/11/2026: Finer One em constituição, sem NIF nem sede —
 * não inventar dados empresariais. Base legal Pioneers = consentimento (não há termos do
 * programa que sustentem diligências pré-contratuais). Conta Google pessoal gratuita (decisão
 * dos fundadores, 15/11/2026): sem contrato do artigo 28.º com a Google — não alegar o contrário.
 * As secções sobre onde ficam os dados seguem o recetor ativo (VITE_FORMS_PROVIDER): o aviso
 * publicado descreve sempre a infraestrutura em uso. A versão portuguesa prevalece.
 * Cloudflare (15/11/2026): leads consultados só no painel autenticado da Cloudflare (sem área
 * de administração própria). PENDENTE antes de aprovar: confirmar que o DPA da Cloudflare se aplica
 * à conta gratuita — até lá não afirmar que se aplica aos planos gratuitos. Time Travel do D1 no
 * plano gratuito: 7 dias. Turnstile: Cloudflare é subcontratante (proteção do site) e responsável
 * (melhoria da deteção) — Turnstile Privacy Addendum.
 *
 * PARA PUBLICAR COMO VERSÃO EM VIGOR (só depois da aprovação dos fundadores):
 *   1. APPROVED = true e NOTICE_DATE = data da aprovação;
 *   2. src/lib/forms.ts → PRIVACY_VERSION = '2026-11-v1' (ou a versão aprovada).
 * Enquanto APPROVED = false, a página mostra "Rascunho em revisão".
 */
const APPROVED = false
const NOTICE_DATE = { pt: '13 de novembro de 2026', en: '13 November 2026' }
const CONTACT = 'geral.finerone@gmail.com'
const CF = FORMS_PROVIDER === 'cloudflare'

type Section = { id: string; title: string; body: (string | string[])[] }
const sectionsPt: Section[] = [
  {
    id: 'responsavel',
    title: 'Quem é o responsável pelos dados',
    body: [
      'A Finer One é um projeto em fase de constituição: a sociedade ainda não está registada, pelo que não tem, para já, denominação social, NIF nem sede.',
      `Até à constituição, o responsável pelo tratamento dos dados recolhidos nestes formulários é Henrique Santos Bértolo, cofundador da Finer One. Para qualquer questão sobre privacidade, escreva para ${CONTACT}.`,
      'Quando a sociedade for constituída, atualizaremos este aviso com a sua identificação e informaremos quem estiver inscrito.',
    ],
  },
  {
    id: 'dados',
    title: 'Que dados recolhemos',
    body: [
      'Apenas o que nos indica nos formulários do site:',
      [
        'Lista de espera: nome, email, dimensão da empresa e os temas que quer acompanhar.',
        'Finer Pioneers: nome, email, empresa, setor de atividade e a descrição do principal desafio financeiro que decidir partilhar.',
      ],
      'Registamos também a data do envio, o idioma em que usou o site, a versão deste aviso que tinha à frente e um identificador técnico do envio (usado para evitar inscrições duplicadas).',
      ...(CF ? ['No momento do envio, o seu endereço IP é transmitido à Cloudflare para a verificação contra envios automáticos (Turnstile). Não guardamos o endereço IP na nossa base de dados.'] : []),
      'Não pedimos dados bancários, documentos da empresa nem dados financeiros nestes formulários. Pedimos que não inclua dados de terceiros no campo de texto livre.',
    ],
  },
  {
    id: 'finalidades',
    title: 'Para que usamos os dados e com que fundamento',
    body: [
      [
        'Lista de espera: enviar-lhe comunicações de lançamento — o aviso de que a plataforma está disponível, a abertura do acesso e as respetivas condições de adesão. Fundamento: o seu consentimento (artigo 6.º, n.º 1, alínea a), do RGPD), que pode retirar a qualquer momento, sem afetar o tratamento já realizado.',
        'Finer Pioneers: avaliar a sua candidatura e contactá-lo sobre o programa. Fundamento: o seu consentimento (artigo 6.º, n.º 1, alínea a), do RGPD), dado ao enviar a candidatura. Pode retirá-lo a qualquer momento; nesse caso, deixamos de considerar a candidatura e eliminamos os dados.',
        'Data, idioma e versão do aviso: demonstrar como e quando os dados nos foram enviados, como o RGPD exige (artigo 7.º, n.º 1, e artigo 5.º, n.º 2).',
        ...(CF ? ['Verificação contra envios automáticos (Turnstile): proteger os formulários contra abuso. Fundamento: interesse legítimo (artigo 6.º, n.º 1, alínea f), do RGPD).'] : []),
      ],
      'As comunicações de lançamento não incluem newsletters, promoções, convites para eventos nem ofertas de terceiros, e uma candidatura Finer Pioneers só dá lugar a contactos sobre o programa. Para qualquer outra comunicação de marketing, pediremos um consentimento separado e explícito.',
      'Não vendemos nem cedemos os seus dados a terceiros, e não tomamos decisões automatizadas nem fazemos perfis com estes dados.',
    ],
  },
  {
    id: 'onde',
    title: 'Onde ficam os dados e quem lhes acede',
    body: CF
      ? [
          'Cada envio é recebido por um serviço da Finer One na Cloudflare (Cloudflare Workers), que valida os dados e os guarda numa base de dados da Finer One no Cloudflare D1, criada para guardar os dados na União Europeia. Os dados não são enviados por email.',
          'Só a equipa fundadora da Finer One lhes acede, através do painel da Cloudflare, com acesso autenticado à conta da Finer One.',
          'A Cloudflare atua como subcontratante ao abrigo do seu Acordo de Tratamento de Dados (Data Processing Addendum). Os pedidos podem ser processados em servidores da Cloudflare fora do Espaço Económico Europeu; para essas transferências, o acordo prevê as cláusulas contratuais-tipo aprovadas pela Comissão Europeia.',
          'Na verificação Turnstile, a Cloudflare trata sinais técnicos do navegador (como o endereço IP e o agente do utilizador) em nosso nome para proteger os formulários e, como responsável pelo tratamento, para melhorar a deteção de envios automáticos, nos termos do seu Aviso de Privacidade do Turnstile (Turnstile Privacy Addendum).',
        ]
      : [
      'Cada envio é registado numa folha de cálculo Google (Google Sheets) da conta Google da Finer One, através de um script (Google Apps Script) dessa mesma conta, que também envia uma notificação por email (Gmail) para a caixa da equipa com os dados enviados.',
      'Os dados ficam, portanto, na folha e nessas notificações. Só a equipa fundadora da Finer One tem acesso a esta conta.',
      'Estes serviços são prestados pela Google através de uma conta Google pessoal gratuita. O tratamento dos dados nesses serviços rege-se pelos Termos de Utilização e pela Política de Privacidade da Google aplicáveis a contas pessoais; não existe um contrato de subcontratação com a Google nos termos do artigo 28.º do RGPD.',
      'A Google pode tratar dados em servidores fora do Espaço Económico Europeu, incluindo nos Estados Unidos. Segundo a informação que publica, a Google LLC aderiu ao Quadro de Privacidade de Dados UE-EUA (EU-U.S. Data Privacy Framework) e recorre a cláusulas contratuais-tipo aprovadas pela Comissão Europeia quando necessário.',
],
  },
  {
    id: 'prazo',
    title: 'Durante quanto tempo',
    body: [
      [
        'Lista de espera: até 12 meses após o lançamento comercial da plataforma, ou até pedir para sair da lista, se isso acontecer antes.',
        'Finer Pioneers: candidaturas não selecionadas são eliminadas até 6 meses após o fim do processo de seleção; candidaturas selecionadas são conservadas enquanto durar a participação no programa e eliminadas até 6 meses depois do seu fim.',
      ],
      CF
        ? 'Revemos a base de dados periodicamente e eliminamos os registos que tenham atingido estes prazos. Se pedir a eliminação antes, apagamos os seus dados. Depois de eliminados, os registos podem permanecer até 7 dias nas cópias automáticas de recuperação da base de dados (Cloudflare D1 Time Travel), após o que deixam de poder ser recuperados.'
        : 'Revemos a folha e as notificações periodicamente e eliminamos os registos que tenham atingido estes prazos. Se pedir a eliminação antes, apagamos os seus dados da folha e das notificações.',
    ],
  },
  {
    id: 'direitos',
    title: 'Os seus direitos',
    body: [
      `Pode pedir acesso, retificação, eliminação, limitação ou portabilidade dos seus dados, opor-se ao tratamento e retirar o consentimento, escrevendo para ${CONTACT}. Respondemos no prazo de um mês.`,
      'Tem também o direito de apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD).',
    ],
  },
  {
    id: 'site',
    title: 'Navegação no site',
    body: [
      'O site não usa cookies de publicidade nem de análise. Guarda no seu navegador apenas a preferência de idioma, o fecho do aviso do topo e a data dos envios recentes de formulários (para limitar envios repetidos).',
      CF
        ? 'Os tipos de letra e as imagens são servidos pelo próprio site. Só ao enviar um formulário o navegador carrega o Cloudflare Turnstile a partir dos servidores da Cloudflare, o que implica a transmissão do seu endereço IP à Cloudflare.'
        : 'Os tipos de letra e as imagens são servidos pelo próprio site; a navegação não faz pedidos a serviços da Google.',
    ],
  },
]

const sectionsEn: Section[] = [
  {
    id: 'responsavel',
    title: 'Who is responsible for your data',
    body: [
      'Finer One is a project in the process of incorporation: the company is not yet registered, so for now it has no registered name, tax number or registered office.',
      `Until incorporation, the controller of the data collected through these forms is Henrique Santos Bértolo, co-founder of Finer One. For any privacy question, write to ${CONTACT}.`,
      'Once the company is incorporated, we will update this notice with its details and let everyone who has signed up know.',
    ],
  },
  {
    id: 'dados',
    title: 'What data we collect',
    body: [
      'Only what you give us in the website forms:',
      [
        'Waitlist: name, email, company size and the topics you want to follow.',
        'Finer Pioneers: name, email, company, industry and the description of the main financial challenge you choose to share.',
      ],
      'We also record the submission date, the language you used on the site, the version of this notice shown to you and a technical submission ID (used to avoid duplicate sign-ups).',
      ...(CF ? ['When you submit, your IP address is sent to Cloudflare for the automated-submission check (Turnstile). We do not store your IP address in our database.'] : []),
      'We do not ask for bank details, company documents or financial data in these forms. Please do not include other people’s data in the free-text field.',
    ],
  },
  {
    id: 'finalidades',
    title: 'What we use the data for, and on what legal basis',
    body: [
      [
        'Waitlist: sending you launch communications — the announcement that the platform is available, the opening of access and the related sign-up terms. Legal basis: your consent (Article 6(1)(a) GDPR), which you can withdraw at any time without affecting processing already carried out.',
        'Finer Pioneers: assessing your application and contacting you about the programme. Legal basis: your consent (Article 6(1)(a) GDPR), given when you send the application. You can withdraw it at any time; we will then stop considering the application and delete the data.',
        'Date, language and notice version: showing how and when the data was sent to us, as the GDPR requires (Articles 7(1) and 5(2)).',
        ...(CF ? ['Automated-submission check (Turnstile): protecting the forms against abuse. Legal basis: legitimate interest (Article 6(1)(f) GDPR).'] : []),
      ],
      'Launch communications do not include newsletters, promotions, event invitations or third-party offers, and a Finer Pioneers application only leads to contact about the programme. For any other marketing communication, we will ask for separate, explicit consent.',
      'We do not sell or pass your data to third parties, and we do not make automated decisions or build profiles with this data.',
    ],
  },
  {
    id: 'onde',
    title: 'Where the data is kept and who can access it',
    body: CF
      ? [
          'Each submission is received by a Finer One service on Cloudflare (Cloudflare Workers), which validates the data and stores it in a Finer One database on Cloudflare D1, created to keep the data in the European Union. The data is not sent by email.',
          'Only the Finer One founding team can access it, through the Cloudflare dashboard, with authenticated access to Finer One’s account.',
          'Cloudflare acts as a processor under its Data Processing Addendum. Requests may be processed on Cloudflare servers outside the European Economic Area; for those transfers, the addendum provides the standard contractual clauses approved by the European Commission.',
          'For the Turnstile check, Cloudflare processes technical browser signals (such as the IP address and user agent) on our behalf to protect the forms and, as a controller, to improve its detection of automated submissions, under its Turnstile Privacy Addendum.',
        ]
      : [
      'Each submission is recorded in a Google spreadsheet (Google Sheets) in Finer One’s Google account, through a script (Google Apps Script) in that same account, which also sends an email notification (Gmail) with the submitted data to the team’s inbox.',
      'The data is therefore kept in the spreadsheet and in those notifications. Only the Finer One founding team has access to this account.',
      'These services are provided by Google through a free personal Google account. Processing in these services is governed by Google’s Terms of Service and Privacy Policy for personal accounts; there is no data processing agreement with Google under Article 28 GDPR.',
      'Google may process data on servers outside the European Economic Area, including in the United States. According to the information it publishes, Google LLC participates in the EU-U.S. Data Privacy Framework and relies on standard contractual clauses approved by the European Commission where needed.',
],
  },
  {
    id: 'prazo',
    title: 'How long we keep it',
    body: [
      [
        'Waitlist: up to 12 months after the commercial launch of the platform, or until you ask to leave the list, if that happens first.',
        'Finer Pioneers: applications that are not selected are deleted within 6 months of the end of the selection process; selected applications are kept for as long as you take part in the programme and deleted within 6 months of its end.',
      ],
      CF
        ? 'We review the database periodically and delete records that have reached these periods. If you ask us to delete your data sooner, we delete it. Once deleted, records may remain for up to 7 days in the database’s automatic recovery copies (Cloudflare D1 Time Travel), after which they can no longer be recovered.'
        : 'We review the spreadsheet and the notifications periodically and delete records that have reached these periods. If you ask us to delete your data sooner, we remove it from the spreadsheet and the notifications.',
    ],
  },
  {
    id: 'direitos',
    title: 'Your rights',
    body: [
      `You can ask to access, correct, erase, restrict or port your data, object to its processing and withdraw your consent, by writing to ${CONTACT}. We reply within one month.`,
      'You also have the right to lodge a complaint with the Portuguese data protection authority (CNPD).',
    ],
  },
  {
    id: 'site',
    title: 'Browsing the site',
    body: [
      'The site does not use advertising or analytics cookies. It only stores in your browser your language preference, whether you closed the top banner and the time of your recent form submissions (to limit repeated submissions).',
      CF
        ? 'Fonts and images are served by the site itself. Only when you submit a form does the browser load Cloudflare Turnstile from Cloudflare’s servers, which means your IP address is sent to Cloudflare.'
        : 'Fonts and images are served by the site itself; browsing the site makes no requests to Google services.',
    ],
  },
]

const ui = {
  pt: {
    title: ['Aviso de ', 'privacidade'],
    sub: 'Como tratamos os dados que nos envia nos formulários da Lista de espera e do programa Finer Pioneers.',
    status: 'Estado', statusValue: APPROVED ? 'Em vigor' : 'Rascunho em revisão',
    updated: 'Última atualização', updatedValue: NOTICE_DATE.pt,
    applies: 'Aplica-se a', appliesValue: 'Formulários do site finer-one.com',
    note: '',
    toc: 'Nesta página',
    summaryLead: 'Em resumo:',
    summary: 'pedimos só o necessário para o manter informado ou avaliar a sua candidatura, não usamos a inscrição para marketing, não vendemos os seus dados e pode pedir para os apagar a qualquer momento.',
    contactTitle: ['Tem alguma questão sobre ', 'os seus dados?'],
    contactText: 'Escreva-nos para pedir acesso, correção ou eliminação. Respondemos no prazo de um mês.',
  },
  en: {
    title: ['Privacy ', 'notice'],
    sub: 'How we handle the data you send us through the Waitlist and Finer Pioneers forms.',
    status: 'Status', statusValue: APPROVED ? 'In force' : 'Draft under review',
    updated: 'Last updated', updatedValue: NOTICE_DATE.en,
    applies: 'Applies to', appliesValue: 'Forms on finer-one.com',
    note: 'Translation of the Portuguese version. In case of doubt, the Portuguese version prevails.',
    toc: 'On this page',
    summaryLead: 'In short:',
    summary: 'we only ask for what we need to keep you informed or assess your application, we do not use your sign-up for marketing, we do not sell your data and you can ask us to delete it at any time.',
    contactTitle: ['Any questions about ', 'your data?'],
    contactText: 'Write to us to request access, correction or deletion. We reply within one month.',
  },
}

const EASE = [0.22, 1, 0.36, 1] as const

export function PrivacyPage() {
  const { lang } = useLanguage()
  const sections = lang === 'en' ? sectionsEn : sectionsPt
  const t = ui[lang]
  const active = useActiveSection(sectionsPt.map((s) => s.id))

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
              {t.title[0]}<span className="text-accent-deep">{t.title[1]}</span>
            </h1>
            <p className="mt-5 max-w-[620px] text-[17px] leading-[1.6] text-[#0B1030]/65">
              {t.sub}
            </p>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-[13.5px]">
              <div>
                <dt className="text-[#0B1030]/45">{t.status}</dt>
                <dd className="mt-1 inline-flex items-center gap-2 font-semibold text-[#070D2B]">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
                  {t.statusValue}
                </dd>
              </div>
              <div>
                <dt className="text-[#0B1030]/45">{t.updated}</dt>
                <dd className="mt-1 font-semibold text-[#070D2B]">{t.updatedValue}</dd>
              </div>
              <div>
                <dt className="text-[#0B1030]/45">{t.applies}</dt>
                <dd className="mt-1 font-semibold text-[#070D2B]">{t.appliesValue}</dd>
              </div>
            </dl>
            {t.note && <p className="mt-6 text-[13.5px] text-[#0B1030]/55">{t.note}</p>}
          </motion.div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-20">
            {/* Conteúdo */}
            <div className="min-w-0 max-w-[700px] [overflow-wrap:anywhere]">
              <details className="group mb-6 rounded-2xl border border-[#0B1030]/[0.08] lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[14px] font-semibold text-[#070D2B] [&::-webkit-details-marker]:hidden">
                  {t.toc}
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
                <strong className="font-semibold text-[#070D2B]">{t.summaryLead}</strong> {t.summary}
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
                  <p data-sweep className="font-display text-[24px] font-bold tracking-[-0.02em]">
                    {t.contactTitle[0]}<span className="text-[#3D86FF]">{t.contactTitle[1]}</span>
                  </p>
                  <p className="mt-3 max-w-[480px] text-[15px] leading-[1.6] text-white/70">
                    {t.contactText}
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
            <nav aria-label={t.toc} className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0B1030]/45">{t.toc}</p>
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

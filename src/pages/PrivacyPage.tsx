import { AlertTriangle } from 'lucide-react'

/**
 * Aviso de privacidade dos formulários — RASCUNHO.
 * Texto apenas em português até validação jurídica. Os elementos entre
 * [colchetes] têm de ser confirmados pelos fundadores antes de publicar.
 */
const sections: { title: string; body: string[] }[] = [
  {
    title: '1. Responsável pelo tratamento',
    body: ['Finer One [denominação legal, NIF e morada a confirmar]. Contacto para questões de privacidade: geral.finerone@gmail.com.'],
  },
  {
    title: '2. Que dados recolhemos',
    body: [
      'Lista de espera: nome e email.',
      'Finer Pioneers: nome, empresa, setor de atividade, email profissional e a descrição do principal desafio financeiro que decidir partilhar.',
      'Registamos também a data do envio e a versão deste aviso que aceitou. Não pedimos dados bancários nem documentos da empresa.',
    ],
  },
  {
    title: '3. Para que usamos os dados',
    body: [
      'Lista de espera: enviar-lhe novidades sobre a Finer One e sobre o acesso à plataforma.',
      'Finer Pioneers: avaliar a sua candidatura e contactá-lo sobre o programa.',
      'Não vendemos nem cedemos os seus dados a terceiros para fins de marketing.',
    ],
  },
  {
    title: '4. Fundamento',
    body: ['O tratamento baseia-se no seu consentimento, que pode retirar a qualquer momento, sem afetar o tratamento realizado até então.'],
  },
  {
    title: '5. Onde ficam os dados',
    body: ['Os dados são guardados [no serviço escolhido pela Finer One — a confirmar], com acesso restrito à equipa da Finer One.'],
  },
  {
    title: '6. Durante quanto tempo',
    body: ['Conservamos os dados enquanto o programa ou a lista de espera estiverem ativos, ou até retirar o consentimento [prazo máximo a confirmar].'],
  },
  {
    title: '7. Os seus direitos',
    body: [
      'Pode pedir acesso, retificação, apagamento, limitação ou portabilidade dos seus dados, e opor-se ao tratamento, escrevendo para geral.finerone@gmail.com.',
      'Tem também o direito de apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD).',
    ],
  },
]

export function PrivacyPage() {
  return (
    <section aria-labelledby="priv-titulo" className="bg-navy pb-24 pt-32 lg:pt-40">
      <div className="mx-auto max-w-[760px] px-5 sm:px-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-glow">Privacidade</p>
        <h1 id="priv-titulo" className="mt-4 font-display text-[32px] font-bold tracking-[-0.02em] text-white sm:text-[42px]">
          Aviso de privacidade
        </h1>
        <p className="mt-3 text-[14px] text-white/75">Formulários da Lista de Espera e do programa Finer Pioneers.</p>

        <p role="note" className="mt-8 flex items-start gap-3 rounded-xl border border-signal/40 bg-signal/10 p-4 text-[14px] leading-relaxed text-white/90">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden="true" />
          Rascunho em revisão. Este texto tem de ser validado pelos fundadores e por aconselhamento jurídico antes de ser publicado.
        </p>

        <div className="mt-10 space-y-9">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-[19px] font-bold text-white">{s.title}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 text-[15px] leading-relaxed text-white/85">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

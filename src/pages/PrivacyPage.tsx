import { useEffect, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { ArrowUpRight, ChevronDown, Mail } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { FORMS_PROVIDER } from '@/lib/forms'
import { cn } from '@/lib/utils'

/**
 * Aviso de privacidade dos formulários (Lista de Espera, Finer Pioneers e Explorar).
 * Visual (12/11/2026) à maneira das páginas legais da Ramp, Searchable e Lovable.
 *
 * Versão 2026-11-v1, aprovada pelos três fundadores a 15/11/2026 (responsáveis conjuntos,
 * artigo 26.º do RGPD, com acordo interno aceite na mesma data). Finer One em constituição:
 * não inventar NIF, sede nem denominação. Texto de origem: doc "Finer One — Aviso de
 * privacidade: versão final para aprovação". Qualquer alteração de conteúdo exige nova
 * aprovação dos três e nova PRIVACY_VERSION em src/lib/forms.ts.
 * As secções sobre infraestrutura seguem o recetor ativo (VITE_FORMS_PROVIDER); o texto
 * aprovado é o da Cloudflare, o ramo Google existe só para reversão. A versão PT prevalece.
 */
// v3 (2026-11-v3), aprovada pelos três fundadores a 22/11/2026: alínea c) Explorar com os valores
// da simulação guardados na D1 e email interno (Resend) só com dados de contacto e o tipo e o
// identificador da simulação. Passagens corrigidas na aplicação (dados financeiros, conteúdo do
// email, subtítulo e resumo) assinaladas para confirmação dos fundadores antes do merge.
// v4 (2026-11-v4), autorizada pelos fundadores a 22/11/2026: a Lista de Espera e o Finer Pioneers
// passam a gerar o mesmo email interno (Resend) que o Explorar, só com os dados aqui descritos
// (workers/forms/src/notify.ts). O Worker só envia para inscrições feitas com esta versão.
// v5 (2026-11-v5) — proposta de 24/11/2026, revista a 25/11/2026 e aprovada para publicação por Igor Orlandi
// Barros a 25/11/2026 (não há registo, neste repositório, da aprovação de Henrique Santos Bértolo e Sebastião
// Andrade). Finer Pioneers: telefone obrigatório (programa de seleção) e website opcional; a notificação interna
// passa a incluir telefone e website. A verificação do email do candidato é descrita como condicional ("quando
// estiver ativa"): está desligada (sem CONFIRM_FROM no Worker). Publicada em conjunto com PRIVACY_VERSION
// '2026-11-v5' em src/lib/forms.ts.
const APPROVED = true
const NOTICE_DATE = { pt: '25 de novembro de 2026', en: '25 November 2026' }
const CONTACT = 'geral.finerone@gmail.com'
const CF = FORMS_PROVIDER === 'cloudflare'

type Block = string | string[] | { h: string }
type Section = { id: string; title: string; body: Block[] }
const sectionsPt: Section[] = [
  {
    id: 'responsavel',
    title: 'Quem é responsável pelos dados',
    body: [
      'A Finer One é um projeto em fase de constituição: a sociedade ainda não está registada, pelo que não tem, para já, denominação social, NIF nem sede.',
      `Até à constituição, os dados recolhidos nestes formulários são tratados pelos três fundadores da Finer One — Henrique Santos Bértolo, Sebastião Andrade e Igor Orlandi Barros —, que determinam em conjunto as finalidades e os meios do tratamento e são, por isso, responsáveis conjuntos pelo tratamento (artigo 26.º do RGPD). Definimos num acordo entre nós as responsabilidades de cada um. No essencial, Henrique Santos Bértolo é o ponto de contacto principal para questões de privacidade e coordena a resposta aos pedidos, e cada um de nós responde pela segurança dos acessos aos dados. Escreva para ${CONTACT}. Pode também exercer os seus direitos junto de qualquer um de nós, e o pedido é tratado da mesma forma.`,
      'Quando a sociedade for constituída, passará a ser a responsável pelo tratamento. Atualizaremos este aviso com a sua identificação e informaremos quem estiver inscrito.',
    ],
  },
  {
    id: 'finalidades',
    title: 'O que fazemos com os seus dados',
    body: [
      'Cada formulário é um tratamento separado. Inscrever-se num não o inscreve nos outros.',
      { h: 'a) Lista de espera' },
      [
        'Dados: nome, email, dimensão da empresa e os temas que quer acompanhar.',
        'Finalidade: enviar-lhe comunicações de lançamento — o aviso de que a plataforma está disponível, a abertura do acesso e as respetivas condições de adesão. Não inclui newsletters, promoções, convites para eventos nem ofertas de terceiros. Avisamos também a equipa Finer One da sua inscrição por email interno; esse aviso não o inscreve em nenhuma outra comunicação.',
        'Fundamento: o seu consentimento (artigo 6.º, n.º 1, alínea a), do RGPD), dado ao inscrever-se.',
        'Conservação: até 12 meses após o lançamento comercial da plataforma e, em qualquer caso, não mais de 24 meses após a inscrição; ou até pedir para sair, se isso acontecer antes.',
      ],
      { h: 'b) Programa Finer Pioneers' },
      [
        'Dados: nome, email, contacto telefónico, empresa, setor de atividade e a descrição do principal desafio financeiro que decidir partilhar; opcionalmente, o website da empresa.',
        'Finalidade: avaliar a sua candidatura, avisar a equipa Finer One dela por email interno e contactá-lo sobre o programa, por email ou telefone. O contacto telefónico é obrigatório porque o Finer Pioneers é um programa de seleção de empresas: usamo-lo só para falar consigo durante a avaliação e, se for selecionado, durante o programa. Não é usada para outras comunicações.',
        'Verificação do email (quando estiver ativa): poderemos enviar-lhe, depois da candidatura, um email de serviço com uma ligação pessoal, de uso único e válida durante 48 horas, para confirmar que o endereço é seu; poderá pedir o reenvio um número limitado de vezes. Esse email não contém os dados da candidatura e não o inscreve em nenhuma lista. Nesse caso registamos se e quando confirmou o endereço e, da ligação, guardamos apenas um código irreversível (hash), eliminado até 30 dias depois de expirar. Confirmar o email não é uma decisão sobre a candidatura. Enquanto esta verificação não estiver ativa, não é enviado nenhum email automático ao candidato.',
        'Fundamento: o seu consentimento (artigo 6.º, n.º 1, alínea a), do RGPD), dado ao enviar a candidatura.',
        'Conservação: candidaturas não selecionadas são eliminadas até 6 meses após o fim do processo de seleção; candidaturas selecionadas são conservadas enquanto durar a participação no programa e eliminadas até 6 meses depois do seu fim.',
      ],
      { h: 'c) Explorar (simulador de tesouraria)' },
      [
        'Dados: nome, email profissional e nome da empresa; opcionalmente, telefone; se pediu contacto da equipa e se aceitou receber novidades; o tipo de simulação, o horizonte e a moeda; os valores que introduziu no simulador (saldo, recebimentos e pagamentos previstos por mês, parte dos recebimentos com atraso e dias de atraso, só dos meses analisados) e os resultados calculados a partir deles. Não pedimos NIF, dados bancários nem credenciais.',
        'Finalidade: registar o seu pedido da análise completa, avisar a equipa Finer One desse pedido por email interno e, se o pedir, contactá-lo sobre a Finer One. Os valores da simulação servem para percebermos o contexto do pedido e não são partilhados com terceiros para outros fins. Só lhe enviamos novidades se tiver marcado essa opção, que é separada e opcional.',
        'Fundamento: o seu consentimento (artigo 6.º, n.º 1, alínea a), do RGPD), dado ao confirmar o pedido da análise. As novidades têm um consentimento próprio.',
        'Conservação: até 12 meses após o último pedido ou contacto, ou até pedir para sair, se isso acontecer antes. Os valores e resultados da simulação são eliminados com o pedido.',
      ],
      'Em todos os formulários registamos também a data do envio, o idioma em que usou o site, a versão deste aviso que tinha à frente, um identificador técnico do envio e o estado da inscrição no nosso acompanhamento (por exemplo, contactada ou selecionada). Servem para demonstrar quando e como nos deu o consentimento, evitar inscrições duplicadas e organizar os contactos. Fundamento: o nosso interesse legítimo em cumprir o dever de demonstrar o consentimento (artigos 6.º, n.º 1, alínea f), e 7.º, n.º 1, do RGPD). São conservados e eliminados com a respetiva inscrição.',
      ...(CF
        ? [
            { h: 'd) Verificação contra envios automáticos (Cloudflare Turnstile)' },
            [
              'Dados: no momento do envio de um formulário (ou, quando a verificação do email do Finer Pioneers estiver ativa, de um pedido de nova ligação de confirmação), o seu endereço IP e sinais técnicos do navegador (como o agente do utilizador) são transmitidos à Cloudflare. Não guardamos o endereço IP na nossa base de dados.',
              'Finalidade: proteger os formulários contra abuso e envios em massa.',
              'Fundamento: o nosso interesse legítimo na segurança dos formulários (artigo 6.º, n.º 1, alínea f), do RGPD). Pode opor-se, escrevendo-nos.',
              'A Cloudflare usa também estes sinais, como responsável pelo tratamento, para melhorar a deteção de envios automáticos, nos termos do seu Aviso de Privacidade do Turnstile (Turnstile Privacy Addendum), e conserva-os de acordo com esse aviso.',
            ],
          ]
        : []),
      'O envio dos formulários é voluntário; sem os campos obrigatórios não conseguimos inscrevê-lo, avaliar a candidatura nem registar o pedido da análise. Não pedimos dados bancários nem documentos da empresa. Os únicos dados financeiros que tratamos são, no Explorar, os valores de tesouraria que decidir introduzir no simulador; na Lista de Espera e no Finer Pioneers não pedimos dados financeiros. Pedimos que não inclua dados de terceiros no campo de texto livre. Não vendemos os seus dados, não os cedemos a terceiros para fins próprios destes e não tomamos decisões automatizadas nem fazemos perfis com eles.',
    ],
  },
  {
    id: 'sair',
    title: 'Como sair ou retirar o consentimento',
    body: [
      `Pode retirar o consentimento a qualquer momento, sem afetar o tratamento já realizado: responda "Sair" a qualquer email que lhe enviarmos ou escreva para ${CONTACT}. Tratamos o pedido em até 5 dias úteis e confirmamos por email. Se retirar o consentimento de uma candidatura Finer Pioneers, deixamos de a considerar e eliminamos os dados.`,
    ],
  },
  {
    id: 'onde',
    title: 'Onde ficam os dados e quem lhes acede',
    body: [
      ...(CF
        ? [
            'Cada envio é recebido por um serviço da Finer One na Cloudflare (Cloudflare Workers) e guardado numa base de dados no Cloudflare D1, configurada para armazenar os dados na União Europeia. A Cloudflare, Inc. trata estes dados como subcontratante, ao abrigo do seu Acordo de Tratamento de Dados (Data Processing Addendum).',
            'O acesso está restrito aos fundadores, através do painel da Cloudflare, com acesso autenticado à conta da Finer One.',
            `Cada envio gera um email interno para a caixa da equipa (${CONTACT}), só para nos avisar dele: na Lista de Espera, com o seu nome, email, a data e o identificador da inscrição; no Finer Pioneers, com o seu nome, email, telefone, empresa, website (se o indicou), setor, o desafio que partilhou, a data e o identificador da candidatura; no Explorar, com o seu nome, email, empresa, telefone (se o indicou), se pediu contacto da equipa, o tipo de simulação e o identificador da simulação. Os valores e resultados da simulação do Explorar não seguem no email: ficam só na base de dados. O seu email fica como endereço de resposta, para lhe podermos responder a partir desse aviso. Estes emails são enviados através do Resend (Plus Five Five, Inc., EUA), como subcontratante, ao abrigo do seu Acordo de Tratamento de Dados, e não o inscrevem em nenhuma lista de envio nem campanha. Quando a verificação do email do Finer Pioneers estiver ativa, o email de confirmação do endereço será enviado ao candidato pelo mesmo serviço, nas mesmas condições.`,
          ]
        : [
            'Cada envio é registado numa folha de cálculo Google (Google Sheets) da conta Google da Finer One, através de um script (Google Apps Script) dessa mesma conta, que também envia uma notificação por email (Gmail) para a caixa da equipa com os dados enviados. Só os fundadores têm acesso a esta conta.',
          ]),
      `Os emails que trocamos consigo (respostas a pedidos e comunicações de lançamento) são enviados e guardados na conta ${CONTACT}, um serviço Gmail da Google prestado através de uma conta gratuita, regido pelos termos e pela política de privacidade da Google; não existe um contrato de subcontratação com a Google nos termos do artigo 28.º do RGPD.`,
    ],
  },
  {
    id: 'transferencias',
    title: 'Transferências para fora do Espaço Económico Europeu',
    body: CF
      ? [
          'A base de dados fica na União Europeia, mas parte do processamento pode ocorrer fora do Espaço Económico Europeu, incluindo nos Estados Unidos:',
          [
            'Cloudflare (Workers e Turnstile, como subcontratante): o pedido é processado no centro de dados da Cloudflare mais próximo de quem o envia. Para as transferências, o acordo da Cloudflare recorre ao Quadro de Privacidade de Dados UE-EUA (decisão de adequação da Comissão Europeia de 10 de julho de 2023) e, quando este não se aplica, às cláusulas contratuais-tipo aprovadas pela Comissão Europeia.',
            'Resend (emails internos dos formulários e, quando ativa, email de confirmação do Finer Pioneers, como subcontratante): o processamento ocorre principalmente nos Estados Unidos. Para as transferências, o acordo do Resend recorre ao Quadro de Privacidade de Dados UE-EUA e às cláusulas contratuais-tipo aprovadas pela Comissão Europeia.',
            'Cloudflare (Turnstile, como responsável) e Google (Gmail): cada uma trata os dados ao abrigo das suas próprias políticas e mecanismos de transferência.',
          ],
          'Pode pedir-nos mais informação sobre estas garantias.',
        ]
      : [
          'A Google pode tratar dados em servidores fora do Espaço Económico Europeu, incluindo nos Estados Unidos, ao abrigo das suas próprias políticas e mecanismos de transferência. Pode pedir-nos mais informação sobre estas garantias.',
        ],
  },
  {
    id: 'eliminacao',
    title: 'Eliminação e cópias de recuperação',
    body: [
      CF
        ? 'Revemos os dados pelo menos de três em três meses e eliminamos o que atingiu os prazos acima, incluindo os emails relacionados. Depois de eliminados da base de dados, os registos podem permanecer até 7 dias nas cópias automáticas de recuperação (Cloudflare D1 Time Travel), após o que deixam de poder ser recuperados. O Resend conserva os emails internos e, se existirem, os emails de confirmação (incluindo o conteúdo) durante 30 dias, após o que os elimina.'
        : 'Revemos os dados pelo menos de três em três meses e eliminamos o que atingiu os prazos acima, da folha, das notificações e dos emails relacionados.',
    ],
  },
  {
    id: 'direitos',
    title: 'Os seus direitos',
    body: [
      `Pode pedir acesso, retificação, eliminação, limitação ou portabilidade dos seus dados, retirar o consentimento e opor-se ao tratamento baseado no nosso interesse legítimo, escrevendo para ${CONTACT}. Respondemos no prazo de um mês; em pedidos complexos, este prazo pode ser prorrogado nos termos do RGPD, e informamo-lo disso.`,
      'Tem também o direito de apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD, www.cnpd.pt).',
    ],
  },
  {
    id: 'site',
    title: 'Navegação no site',
    body: [
      'O site não usa cookies de publicidade nem de análise. Guarda no seu navegador apenas a preferência de idioma, o fecho do aviso do topo e a data dos envios recentes de formulários (para limitar envios repetidos).',
      CF
        ? 'Os tipos de letra e as imagens são servidos pelo próprio site; só ao enviar um formulário o navegador carrega o Cloudflare Turnstile.'
        : 'Os tipos de letra e as imagens são servidos pelo próprio site; a navegação não faz pedidos a serviços da Google.',
    ],
  },
  {
    id: 'alteracoes',
    title: 'Alterações a este aviso',
    body: [
      'Se este aviso mudar de forma relevante, atualizamos a data no topo e, quando a alteração afetar inscrições existentes, informamos por email quem estiver inscrito.',
    ],
  },
]

const sectionsEn: Section[] = [
  {
    id: 'responsavel',
    title: 'Who is responsible for your data',
    body: [
      'Finer One is a project in the process of incorporation: the company is not yet registered, so it does not yet have a registered name, tax number or registered office.',
      `Until incorporation, the data collected through these forms is handled by Finer One’s three founders — Henrique Santos Bértolo, Sebastião Andrade and Igor Orlandi Barros —, who jointly determine the purposes and means of the processing and are therefore joint controllers (Article 26 GDPR). We have set out each person’s responsibilities in an agreement between us. In essence, Henrique Santos Bértolo is the main point of contact for privacy matters and coordinates replies to requests, and each of us is responsible for the security of our access to the data. Write to ${CONTACT}. You may also exercise your rights with any one of us, and the request will be handled in the same way.`,
      'Once the company is incorporated, it will become the controller. We will update this notice with its details and inform everyone who has signed up.',
    ],
  },
  {
    id: 'finalidades',
    title: 'What we do with your data',
    body: [
      'Each form is a separate processing activity. Signing up for one does not sign you up for the others.',
      { h: 'a) Waitlist' },
      [
        'Data: name, email, company size and the topics you want to follow.',
        'Purpose: to send you launch communications — notice that the platform is available, the opening of access and the related sign-up terms. It does not include newsletters, promotions, event invitations or third-party offers. We also notify the Finer One team of your sign-up by internal email; that notice does not sign you up for any other communication.',
        'Legal basis: your consent (Article 6(1)(a) GDPR), given when you sign up.',
        'Retention: up to 12 months after the platform’s commercial launch and, in any case, no more than 24 months after sign-up; or until you ask to leave, if earlier.',
      ],
      { h: 'b) Finer Pioneers programme' },
      [
        'Data: name, email, phone number, company, sector and the description of your main financial challenge that you choose to share; optionally, the company website.',
        'Purpose: to assess your application, notify the Finer One team of it by internal email and contact you about the programme, by email or phone. The phone number is required because Finer Pioneers is a selection programme for companies: we use it only to talk to you during the review and, if you are selected, during the programme. It is not used for other communications.',
        'Email verification (when enabled): after you apply, we may send you a service email with a personal, single-use link, valid for 48 hours, to confirm that the address is yours; you will be able to ask for it to be resent a limited number of times. That email does not contain your application data and does not sign you up to any list. In that case we record whether and when you confirmed the address and, of the link, we keep only an irreversible code (hash), deleted within 30 days after it expires. Confirming your email is not a decision on your application. While this verification is not enabled, no automatic email is sent to applicants.',
        'Legal basis: your consent (Article 6(1)(a) GDPR), given when you submit the application.',
        'Retention: applications not selected are deleted within 6 months after the end of the selection process; selected applications are kept for as long as you take part in the programme and deleted within 6 months after it ends.',
      ],
      { h: 'c) Explore (cash-flow simulator)' },
      [
        'Data: name, work email and company name; optionally, phone number; whether you asked to be contacted by the team and whether you agreed to receive news; the simulation type, horizon and currency; the values you entered in the simulator (balance, expected receipts and payments per month, share of receipts delayed and days of delay, only for the months analysed) and the results calculated from them. We do not ask for tax IDs, bank details or credentials.',
        'Purpose: to record your request for the full analysis, notify the Finer One team of that request by internal email and, if you ask, to contact you about Finer One. The simulation values help us understand the context of your request and are not shared with third parties for other purposes. We only send you news if you ticked that option, which is separate and optional.',
        'Legal basis: your consent (Article 6(1)(a) GDPR), given when you confirm the analysis request. News has its own separate consent.',
        'Retention: up to 12 months after your last request or contact, or until you ask to leave, if earlier. The simulation values and results are deleted together with the request.',
      ],
      'For all forms we also record the submission date, the language you used on the site, the version of this notice you had in front of you, a technical submission identifier and the status of the sign-up in our follow-up (for example, contacted or selected). These are used to demonstrate when and how you gave consent, to avoid duplicate sign-ups and to organise follow-up. Legal basis: our legitimate interest in meeting the obligation to demonstrate consent (Articles 6(1)(f) and 7(1) GDPR). They are kept and deleted together with the sign-up.',
      ...(CF
        ? [
            { h: 'd) Automated-submission check (Cloudflare Turnstile)' },
            [
              'Data: when you submit a form (or, once Finer Pioneers email verification is enabled, request a new confirmation link), your IP address and technical browser signals (such as the user agent) are sent to Cloudflare. We do not store your IP address in our database.',
              'Purpose: to protect the forms against abuse and mass submissions.',
              'Legal basis: our legitimate interest in keeping the forms secure (Article 6(1)(f) GDPR). You can object by writing to us.',
              'Cloudflare also uses these signals, as a controller, to improve its detection of automated submissions, under its Turnstile Privacy Addendum, and keeps them in accordance with that notice.',
            ],
          ]
        : []),
      'Submitting the forms is voluntary; without the required fields we cannot sign you up, assess your application or record your analysis request. We do not ask for bank details or company documents. The only financial data we process are, in Explore, the cash-flow values you choose to enter in the simulator; the Waitlist and Finer Pioneers do not ask for financial data. Please do not include third-party data in the free-text field. We do not sell your data, do not share it with third parties for their own purposes, and do not use it for automated decision-making or profiling.',
    ],
  },
  {
    id: 'sair',
    title: 'How to leave or withdraw consent',
    body: [
      `You can withdraw consent at any time, without affecting processing already carried out: reply "Leave" (or "Sair") to any email we send you, or write to ${CONTACT}. We handle the request within 5 working days and confirm by email. If you withdraw consent for a Finer Pioneers application, we stop considering it and delete the data.`,
    ],
  },
  {
    id: 'onde',
    title: 'Where the data is kept and who can access it',
    body: [
      ...(CF
        ? [
            'Each submission is received by a Finer One service on Cloudflare (Cloudflare Workers) and stored in a Cloudflare D1 database configured to store data in the European Union. Cloudflare, Inc. processes this data as a processor under its Data Processing Addendum.',
            'Access is restricted to the founders, through the Cloudflare dashboard, with authenticated access to Finer One’s account.',
            `Each submission generates an internal email to the team’s inbox (${CONTACT}), only to let us know about it: for the Waitlist, with your name, email, and the date and identifier of the sign-up; for Finer Pioneers, with your name, email, phone number, company, website (if given), sector, the challenge you shared, and the date and identifier of the application; for Explore, with your name, email, company, phone number (if given), whether you asked to be contacted by the team, the simulation type and the simulation identifier. Explore simulation values and results are not included in the email: they stay only in the database. Your email is set as the reply-to address, so that we can reply to you from that notice. These emails are sent through Resend (Plus Five Five, Inc., USA), as processor, under its Data Processing Addendum, and do not add you to any mailing list or campaign. Once Finer Pioneers email verification is enabled, the email confirming your address will be sent to the applicant through the same service, on the same terms.`,
          ]
        : [
            'Each submission is recorded in a Google spreadsheet (Google Sheets) in Finer One’s Google account, through a script (Google Apps Script) in that same account, which also sends an email notification (Gmail) with the submitted data to the team’s inbox. Only the founders have access to this account.',
          ]),
      `The emails we exchange with you (replies to requests and launch communications) are sent and stored in the ${CONTACT} account, a Google Gmail service provided through a free account and governed by Google’s terms and privacy policy; there is no processor agreement with Google under Article 28 GDPR.`,
    ],
  },
  {
    id: 'transferencias',
    title: 'Transfers outside the European Economic Area',
    body: CF
      ? [
          'The database is in the European Union, but some processing may take place outside the European Economic Area, including in the United States:',
          [
            'Cloudflare (Workers and Turnstile, as processor): requests are handled in the Cloudflare data centre closest to the sender. For transfers, Cloudflare’s agreement relies on the EU-US Data Privacy Framework (European Commission adequacy decision of 10 July 2023) and, where that does not apply, on the standard contractual clauses approved by the European Commission.',
            'Resend (internal emails from the forms and, when enabled, the Finer Pioneers confirmation email, as processor): processing takes place mainly in the United States. For transfers, Resend’s agreement relies on the EU-US Data Privacy Framework and on the standard contractual clauses approved by the European Commission.',
            'Cloudflare (Turnstile, as controller) and Google (Gmail): each processes data under its own policies and transfer mechanisms.',
          ],
          'You can ask us for more information about these safeguards.',
        ]
      : [
          'Google may process data on servers outside the European Economic Area, including in the United States, under its own policies and transfer mechanisms. You can ask us for more information about these safeguards.',
        ],
  },
  {
    id: 'eliminacao',
    title: 'Deletion and recovery copies',
    body: [
      CF
        ? 'We review the data at least every three months and delete whatever has reached the periods above, including related emails. Once deleted from the database, records may remain for up to 7 days in automatic recovery copies (Cloudflare D1 Time Travel), after which they can no longer be recovered. Resend keeps internal emails and, if any, confirmation emails (including their content) for 30 days and then deletes them.'
        : 'We review the data at least every three months and delete whatever has reached the periods above from the spreadsheet, the notifications and related emails.',
    ],
  },
  {
    id: 'direitos',
    title: 'Your rights',
    body: [
      `You can ask for access, rectification, erasure, restriction or portability of your data, withdraw consent and object to processing based on our legitimate interest, by writing to ${CONTACT}. We reply within one month; for complex requests this may be extended as allowed by the GDPR, and we will tell you if so.`,
      'You also have the right to lodge a complaint with the Portuguese data protection authority (Comissão Nacional de Proteção de Dados, CNPD, www.cnpd.pt).',
    ],
  },
  {
    id: 'site',
    title: 'Browsing the site',
    body: [
      'The site does not use advertising or analytics cookies. It stores in your browser only your language preference, whether you closed the top banner and the time of recent form submissions (to limit repeated submissions).',
      CF
        ? 'Fonts and images are served by the site itself; your browser loads Cloudflare Turnstile only when you submit a form.'
        : 'Fonts and images are served by the site itself; browsing the site makes no requests to Google services.',
    ],
  },
  {
    id: 'alteracoes',
    title: 'Changes to this notice',
    body: [
      'If this notice changes materially, we update the date at the top and, when the change affects existing sign-ups, we inform everyone who has signed up by email.',
    ],
  },
]

const ui = {
  pt: {
    title: ['Aviso de ', 'privacidade'],
    sub: 'Como tratamos os dados que nos envia nos formulários da Lista de espera, do programa Finer Pioneers e do Explorar.',
    status: 'Estado', statusValue: APPROVED ? 'Em vigor' : 'Rascunho em revisão',
    updated: 'Última atualização', updatedValue: NOTICE_DATE.pt,
    applies: 'Aplica-se a', appliesValue: 'Formulários do site finer-one.com',
    note: '',
    toc: 'Nesta página',
    summaryLead: 'Em resumo:',
    summary: 'pedimos só o necessário para o manter informado, avaliar a sua candidatura ou registar o seu pedido de análise, não usamos a inscrição para outro marketing, não vendemos os seus dados e pode sair ou pedir para os apagar a qualquer momento.',
    contactTitle: ['Tem alguma questão sobre ', 'os seus dados?'],
    contactText: 'Escreva-nos para sair da lista ou pedir acesso, correção ou eliminação. Respondemos no prazo de um mês.',
  },
  en: {
    title: ['Privacy ', 'notice'],
    sub: 'How we handle the data you send us through the Waitlist, Finer Pioneers and Explore forms.',
    status: 'Status', statusValue: APPROVED ? 'In force' : 'Draft under review',
    updated: 'Last updated', updatedValue: NOTICE_DATE.en,
    applies: 'Applies to', appliesValue: 'Forms on finer-one.com',
    note: 'Translation of the Portuguese version. In case of doubt, the Portuguese version prevails.',
    toc: 'On this page',
    summaryLead: 'In short:',
    summary: 'we ask only for what we need to keep you informed, to assess your application or to record your analysis request, we do not use your sign-up for other marketing, we do not sell your data, and you can leave or ask us to delete it at any time.',
    contactTitle: ['Any questions about ', 'your data?'],
    contactText: 'Write to us to leave the list or to request access, correction or deletion. We reply within one month.',
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
                      typeof p === 'object' && !Array.isArray(p) ? (
                        <h3 key={j} className="mt-7 font-display text-[17px] font-semibold tracking-[-0.01em] text-[#070D2B]">
                          {p.h}
                        </h3>
                      ) : Array.isArray(p) ? (
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

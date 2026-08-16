/**
 * Conteúdo da quinta secção — segurança e confiança, em quatro perguntas.
 *
 * TODOS OS TEXTOS SÃO DECLARAÇÃO DE PRINCÍPIO, não garantia técnica ou
 * jurídica. Nada aqui afirma arquitetura, conformidade ou compromisso
 * contratual específico (RGPD, retenção, eliminação, lineage, etc.).
 *
 * DELIBERADAMENTE AUSENTES — não voltar a introduzir sem base formal:
 * encriptação nomeada, ISO 27001, SOC 2, RGPD compliant, zero knowledge,
 * logs imutáveis, "dados nunca alterados/armazenados", servidores europeus,
 * backups, MFA, certificações, auditoria. Isto vale também para a versão EN.
 *
 * BILINGUE: ver useDemoDashboardData em demoDashboard.ts para o padrão.
 */

import { useLanguage } from '@/i18n/LanguageContext'

export type DecisionId = 'acesso' | 'origem' | 'relevancia' | 'responsabilidade'

export type PrincipleGridItem = {
  eyebrow: string
  title: string
  /** O quarto item de cada grelha é sempre o destaque azul. */
  highlight?: boolean
}

export type PrincipleFlowStep = { label: string; subtitle: string }

export type PrincipleFlow = {
  eyebrow: string
  note?: string
  steps: PrincipleFlowStep[]
}

export type Decision = {
  id: DecisionId
  ordinal: string
  question: string
  context: string
  insight: string
  cta?: string
  grid: PrincipleGridItem[]
  flow?: PrincipleFlow
}

function buildDecisions(pt: boolean): Decision[] {
  return pt
    ? [
        {
          id: 'acesso',
          ordinal: '01',
          question: 'Quem pode aceder à informação financeira?',
          context:
            'A informação financeira deve estar disponível para análise, mas apenas para as pessoas certas, com clareza sobre o acesso, a origem dos dados e o papel da plataforma.',
          insight:
            'A plataforma interpreta informação, apresenta contexto e apoia a decisão, mas não decide pela empresa. O controlo sobre quem acede à informação continua do lado da empresa.',
          cta: 'Como protegemos a informação',
          grid: [
            { eyebrow: 'ACESSO CONTROLADO', title: 'Por perfil e responsabilidade' },
            { eyebrow: 'PRIVACIDADE', title: 'Apenas o necessário' },
            { eyebrow: 'ORIGEM RASTREÁVEL', title: 'Fonte de dados identificada' },
            { eyebrow: 'CONTROLO', title: 'Acesso definido pela empresa', highlight: true },
          ],
          flow: {
            eyebrow: 'CAMADA DE PROTEÇÃO NA ANÁLISE',
            note: 'Contexto e controlo',
            steps: [
              { label: 'Origem dos dados', subtitle: 'Banco / ERP / Faturação' },
              { label: 'Permissões', subtitle: 'Acesso autorizado' },
              { label: 'Análise', subtitle: 'Informação relevante' },
              { label: 'Decisão', subtitle: 'Responsabilidade humana' },
            ],
          },
        },
        {
          id: 'origem',
          ordinal: '02',
          question: 'De onde vem a informação usada nas análises?',
          context:
            'A análise ganha valor quando existe contexto sobre a informação que a sustenta. A Finer One reúne dados de diferentes sistemas e procura manter clara a relação entre a análise apresentada e as respetivas fontes.',
          insight:
            'Saber de onde vem a informação ajuda a compreender melhor uma análise, validar o seu contexto e tomar decisões com maior confiança.',
          cta: 'Perceber como os dados se ligam',
          grid: [
            { eyebrow: 'FONTES CONECTADAS', title: 'Informação dos sistemas da empresa' },
            { eyebrow: 'ORIGEM', title: 'Contexto sobre a fonte dos dados' },
            { eyebrow: 'CONSISTÊNCIA', title: 'Informação organizada para análise' },
            { eyebrow: 'TRANSPARÊNCIA', title: 'Clareza sobre o que sustenta cada leitura', highlight: true },
          ],
        },
        {
          id: 'relevancia',
          ordinal: '03',
          question: 'Que informação é efetivamente utilizada?',
          context:
            'Nem toda a informação disponível tem o mesmo peso em todas as decisões. A Finer One organiza o contexto de cada análise em torno dos dados mais relevantes para a questão em causa.',
          insight:
            'Mais dados não significam necessariamente uma melhor decisão. O objetivo é reduzir o ruído e destacar a informação que realmente ajuda a perceber o cenário.',
          cta: 'Perceber o que entra em cada análise',
          grid: [
            { eyebrow: 'OBJETIVO', title: 'A análise parte da questão em causa' },
            { eyebrow: 'RELEVÂNCIA', title: 'Foco na informação útil para o contexto' },
            { eyebrow: 'CONTEXTO', title: 'Indicadores relacionados analisados em conjunto' },
            { eyebrow: 'CLAREZA', title: 'Menos ruído, mais informação acionável', highlight: true },
          ],
        },
        {
          id: 'responsabilidade',
          ordinal: '04',
          question: 'Quem responde pela decisão final?',
          context:
            'A plataforma apresenta contexto, cenários e recomendações. A escolha, o momento de agir e o risco assumido continuam do lado de quem conhece o negócio.',
          insight:
            'A decisão final não é automatizada. A plataforma não executa ações financeiras nem aprova decisões em nome da empresa.',
          cta: 'Como apresentamos as recomendações',
          grid: [
            { eyebrow: 'PLATAFORMA', title: 'Interpreta e apresenta contexto' },
            { eyebrow: 'RECOMENDAÇÃO', title: 'Orienta a decisão, não a substitui' },
            { eyebrow: 'LIMITE', title: 'Sem decisão automática' },
            { eyebrow: 'EMPRESA', title: 'Decide e assume o risco', highlight: true },
          ],
          flow: {
            eyebrow: 'DA ANÁLISE À DECISÃO',
            steps: [
              { label: 'Informação', subtitle: 'Dados' },
              { label: 'Contexto', subtitle: 'Interpretação' },
              { label: 'Recomendação', subtitle: 'Apoio' },
              { label: 'Decisão', subtitle: 'Empresa' },
            ],
          },
        },
      ]
    : [
        {
          id: 'acesso',
          ordinal: '01',
          question: 'Who can access the financial information?',
          context:
            'Financial information should be available for analysis, but only to the right people, with clarity about access, data origin and the role of the platform.',
          insight:
            'The platform interprets information, presents context and supports the decision, but does not decide for the company. Control over who accesses the information stays with the company.',
          cta: 'How we protect the information',
          grid: [
            { eyebrow: 'CONTROLLED ACCESS', title: 'By role and responsibility' },
            { eyebrow: 'PRIVACY', title: 'Only what is necessary' },
            { eyebrow: 'TRACEABLE ORIGIN', title: 'Data source identified' },
            { eyebrow: 'CONTROL', title: 'Access defined by the company', highlight: true },
          ],
          flow: {
            eyebrow: 'PROTECTION LAYER IN THE ANALYSIS',
            note: 'Context and control',
            steps: [
              { label: 'Data origin', subtitle: 'Bank / ERP / Invoicing' },
              { label: 'Permissions', subtitle: 'Authorized access' },
              { label: 'Analysis', subtitle: 'Relevant information' },
              { label: 'Decision', subtitle: 'Human responsibility' },
            ],
          },
        },
        {
          id: 'origem',
          ordinal: '02',
          question: 'Where does the information used in the analyses come from?',
          context:
            'Analysis gains value when there is context about the information behind it. Finer One brings together data from different systems and works to keep the link between each analysis and its sources clear.',
          insight:
            'Knowing where the information comes from helps you better understand an analysis, validate its context and decide with more confidence.',
          cta: 'Understand how the data connects',
          grid: [
            { eyebrow: 'CONNECTED SOURCES', title: "Information from the company's systems" },
            { eyebrow: 'ORIGIN', title: 'Context about the data source' },
            { eyebrow: 'CONSISTENCY', title: 'Information organized for analysis' },
            { eyebrow: 'TRANSPARENCY', title: 'Clarity about what backs each reading', highlight: true },
          ],
        },
        {
          id: 'relevancia',
          ordinal: '03',
          question: 'What information is actually used?',
          context:
            'Not all available information carries the same weight in every decision. Finer One organizes the context of each analysis around the data most relevant to the question at hand.',
          insight:
            'More data does not necessarily mean a better decision. The goal is to reduce noise and highlight the information that truly helps understand the situation.',
          cta: 'Understand what goes into each analysis',
          grid: [
            { eyebrow: 'GOAL', title: 'The analysis starts from the question at hand' },
            { eyebrow: 'RELEVANCE', title: 'Focus on information useful to the context' },
            { eyebrow: 'CONTEXT', title: 'Related indicators analyzed together' },
            { eyebrow: 'CLARITY', title: 'Less noise, more actionable information', highlight: true },
          ],
        },
        {
          id: 'responsabilidade',
          ordinal: '04',
          question: 'Who is accountable for the final decision?',
          context:
            'The platform presents context, scenarios and recommendations. The choice, the timing to act and the risk taken stay with whoever knows the business.',
          insight:
            'The final decision is not automated. The platform does not execute financial actions nor approve decisions on behalf of the company.',
          cta: 'How we present recommendations',
          grid: [
            { eyebrow: 'PLATFORM', title: 'Interprets and presents context' },
            { eyebrow: 'RECOMMENDATION', title: 'Guides the decision, does not replace it' },
            { eyebrow: 'LIMIT', title: 'No automatic decision-making' },
            { eyebrow: 'COMPANY', title: 'Decides and takes on the risk', highlight: true },
          ],
          flow: {
            eyebrow: 'FROM ANALYSIS TO DECISION',
            steps: [
              { label: 'Information', subtitle: 'Data' },
              { label: 'Context', subtitle: 'Interpretation' },
              { label: 'Recommendation', subtitle: 'Support' },
              { label: 'Decision', subtitle: 'Company' },
            ],
          },
        },
      ]
}

export function useDecisionsSectionData(): { decisions: Decision[] } {
  const { lang } = useLanguage()
  return { decisions: buildDecisions(lang === 'pt') }
}

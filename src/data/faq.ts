/**
 * Perguntas frequentes — fase 9.
 *
 * REGRAS SEGUIDAS NA ESCRITA, deliberadamente (valem para PT e EN):
 * - nenhuma integração é dada como disponível; linguagem de conceção;
 * - nenhum banco, ERP ou software é nomeado;
 * - nenhuma característica técnica de segurança é afirmada;
 * - nenhuma política comercial é inventada;
 * - nenhum limite numérico de utilização é referido.
 *
 * A última resposta descreve a disponibilidade dos planos e tem de continuar
 * coerente com src/data/pricing.ts.
 *
 * BILINGUE: ver useDemoDashboardData em demoDashboard.ts para o padrão.
 */

import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'

export type FaqEntry = { question: string; answer: string }

export type FaqContent = {
  faq: FaqEntry[]
  faqCopy: { kicker: string; headline: string; subheadline: string }
}

function buildContent(lang: Lang): FaqContent {
  const pt = lang === 'pt'

  const faq: FaqEntry[] = pt
    ? [
        {
          question: 'O que é a Finer One?',
          answer:
            'A Finer One é uma plataforma de inteligência financeira para PME. Analisa os dados financeiros da empresa para identificar o que está a acontecer, antecipar o que vem a seguir e recomendar ações concretas para apoiar melhores decisões.',
        },
        {
          question: 'Como é que a Finer One acede aos dados da minha empresa?',
          answer:
            'A Finer One foi pensada para ligar-se aos sistemas que a empresa já utiliza, como ERP, sistemas de faturação e contas bancárias, reunindo a informação necessária para realizar análises financeiras.',
        },
        {
          question: 'A Finer One substitui o meu contabilista ou diretor financeiro?',
          answer:
            'Não. A Finer One não substitui o contabilista nem a decisão humana. Transforma os dados financeiros em análises, alertas, previsões e recomendações que ajudam empresários e equipas a compreender melhor o negócio e a decidir com mais informação.',
        },
        {
          question: 'Os dados financeiros da minha empresa estão seguros?',
          answer:
            'A informação da empresa é utilizada para produzir as análises da plataforma, com acesso controlado e proteção dos dados. A empresa mantém o controlo sobre a sua informação.',
        },
        {
          question: 'Como posso começar a utilizar a Finer One?',
          answer:
            'Nesta fase, a Finer One está disponível através do plano Plus, que reúne as funcionalidades essenciais para começar a analisar e acompanhar a situação financeira da sua empresa. Brevemente estarão também disponíveis os planos Pro e Team, com funcionalidades adicionais para empresas com necessidades mais avançadas.',
        },
      ]
    : [
        {
          question: 'What is Finer One?',
          answer:
            "Finer One is a financial intelligence platform for SMBs. It analyzes the company's financial data to identify what's happening, anticipate what's coming next, and recommend concrete actions to support better decisions.",
        },
        {
          question: "How does Finer One access my company's data?",
          answer:
            'Finer One is designed to connect to the systems the company already uses, such as ERP, invoicing systems and bank accounts, gathering the information needed to run financial analyses.',
        },
        {
          question: 'Does Finer One replace my accountant or CFO?',
          answer:
            'No. Finer One does not replace your accountant or human judgment. It turns financial data into analyses, alerts, forecasts and recommendations that help business owners and teams better understand the business and decide with more information.',
        },
        {
          question: "Is my company's financial data secure?",
          answer:
            "The company's information is used to produce the platform's analyses, with controlled access and data protection. The company keeps control over its own information.",
        },
        {
          question: 'How can I start using Finer One?',
          answer:
            'At this stage, Finer One is available through the Plus plan, which brings together the essential features to start analyzing and tracking your company’s financial situation. The Pro and Team plans will soon be available too, with additional features for companies with more advanced needs.',
        },
      ]

  const faqCopy = pt
    ? {
        kicker: 'Perguntas frequentes',
        headline: 'Tudo o que precisa de esclarecer antes de começar.',
        subheadline: 'Respostas rápidas sobre o que é a Finer One, como funciona e como pode começar a utilizá-la.',
      }
    : {
        kicker: 'Frequently asked questions',
        headline: 'Everything you need clarified before you start.',
        subheadline: 'Quick answers about what Finer One is, how it works and how you can start using it.',
      }

  return { faq, faqCopy }
}

export function useFaqData(): FaqContent {
  const { lang } = useLanguage()
  return buildContent(lang)
}

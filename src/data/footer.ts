/**
 * Conteúdo do encerramento — fase 10.
 *
 * LINKS: apenas destinos que existem mesmo. Todas as âncoras internas foram
 * verificadas contra os ids reais das secções (#problema, #produto-demo,
 * #produto, #decisoes, #precos, #faq). "Segurança e confiança" aponta para
 * #decisoes porque é essa secção que trata proteção, privacidade e
 * rastreabilidade — não existe uma secção dedicada só a isso.
 *
 * DELIBERADAMENTE AUSENTES: Sobre, Contacto, Privacidade e Termos. Não
 * existem páginas nem destinos para nenhum deles, e um href="#" a fingir que
 * está pronto é pior do que a ausência. Entram quando existirem.
 *
 * SEM MORADA E SEM RAZÃO SOCIAL: nenhuma das duas está definida, por isso o
 * copyright usa apenas o nome da marca.
 *
 * BILINGUE: ver useDemoDashboardData em demoDashboard.ts para o padrão. Os
 * hrefs não mudam com o idioma — são âncoras internas da mesma página.
 */

import { useLanguage } from '@/i18n/LanguageContext'
import type { Lang } from '@/i18n/LanguageContext'

export type FooterLink = { label: string; href: string }
export type FooterGroup = { title: string; links: FooterLink[] }

export type FooterContent = {
  footerGroups: FooterGroup[]
  linkedIn: { href: string; network: string; title: string; description: string; ariaLabel: string }
  footerCopy: {
    ctaHeadlineFirst: string
    ctaHeadlineSecond: string
    ctaSubheadline: string
    ctaPrimary: string
    ctaSecondary: string
    tagline: string
    copyright: string
  }
}

function buildContent(lang: Lang): FooterContent {
  const pt = lang === 'pt'

  const footerGroups: FooterGroup[] = pt
    ? [
        {
          title: 'Produto',
          links: [
            { label: 'Produto', href: '#produto-demo' },
            { label: 'Como funciona', href: '#produto' },
            { label: 'Planos', href: '#precos' },
          ],
        },
        {
          title: 'Descobrir',
          links: [
            { label: 'O problema', href: '#problema' },
            { label: 'Segurança e confiança', href: '#decisoes' },
          ],
        },
        {
          title: 'Ajuda',
          links: [{ label: 'Perguntas frequentes', href: '#faq' }],
        },
      ]
    : [
        {
          title: 'Product',
          links: [
            { label: 'Product', href: '#produto-demo' },
            { label: 'How it works', href: '#produto' },
            { label: 'Plans', href: '#precos' },
          ],
        },
        {
          title: 'Discover',
          links: [
            { label: 'The problem', href: '#problema' },
            { label: 'Security & trust', href: '#decisoes' },
          ],
        },
        {
          title: 'Help',
          links: [{ label: 'FAQ', href: '#faq' }],
        },
      ]

  const linkedIn = pt
    ? {
        href: 'https://linkedin.com/company/finerone?skipRedirect=true&viewAsMember=true',
        network: 'LinkedIn',
        title: 'Acompanhe a evolução da Finer One.',
        description: 'Produto, novidades e conteúdos.',
        ariaLabel: 'Finer One no LinkedIn, abre numa nova janela',
      }
    : {
        href: 'https://linkedin.com/company/finerone?skipRedirect=true&viewAsMember=true',
        network: 'LinkedIn',
        title: "Follow Finer One's progress.",
        description: 'Product, news and content.',
        ariaLabel: 'Finer One on LinkedIn, opens in a new window',
      }

  /**
   * Nota: `ctaHeadlineSecond` em PT usa um hífen não separável (U+2011) em
   * "transformá‑los". Com o hífen normal, o text-balance parte a palavra ao
   * meio entre linhas.
   */
  const footerCopy = pt
    ? {
        ctaHeadlineFirst: 'Os números já existem.',
        ctaHeadlineSecond: 'Falta transformá‑los em decisões.',
        ctaSubheadline: 'Veja a sua empresa com mais clareza e transforme informação financeira em contexto para decidir o que vem a seguir.',
        ctaPrimary: 'Agendar Demo',
        ctaSecondary: 'Começar Agora',
        tagline: 'Inteligência financeira para decisões mais claras.',
        copyright: '© 2026 Finer One. Todos os direitos reservados.',
      }
    : {
        ctaHeadlineFirst: 'The numbers already exist.',
        ctaHeadlineSecond: "What's missing is turning them into decisions.",
        ctaSubheadline: 'See your company with more clarity and turn financial information into context for deciding what comes next.',
        ctaPrimary: 'Book a Demo',
        ctaSecondary: 'Get Started',
        tagline: 'Financial intelligence for clearer decisions.',
        copyright: '© 2026 Finer One. All rights reserved.',
      }

  return { footerGroups, linkedIn, footerCopy }
}

export function useFooterData(): FooterContent {
  const { lang } = useLanguage()
  return buildContent(lang)
}

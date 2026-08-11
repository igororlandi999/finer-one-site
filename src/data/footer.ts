/**
 * Conteúdo do encerramento — fase 10.
 *
 * LINKS: apenas destinos que existem mesmo. Todas as âncoras internas foram
 * verificadas contra os ids reais das secções (#problema, #produto,
 * #solucoes, #decisoes, #posicionamento, #confianca, #precos, #faq).
 *
 * DELIBERADAMENTE AUSENTES: Sobre, Contacto, Privacidade e Termos. Não
 * existem páginas nem destinos para nenhum deles, e um href="#" a fingir que
 * está pronto é pior do que a ausência. Entram quando existirem.
 *
 * SEM MORADA E SEM RAZÃO SOCIAL: nenhuma das duas está definida, por isso o
 * copyright usa apenas o nome da marca.
 */

export type FooterLink = { label: string; href: string }
export type FooterGroup = { title: string; links: FooterLink[] }

export const footerGroups: FooterGroup[] = [
  {
    title: 'Produto',
    links: [
      { label: 'Como funciona', href: '#produto' },
      { label: 'Áreas do produto', href: '#solucoes' },
      { label: 'Planos', href: '#precos' },
    ],
  },
  {
    title: 'Explorar',
    links: [
      { label: 'O problema', href: '#problema' },
      { label: 'Decisões', href: '#decisoes' },
      { label: 'Posicionamento', href: '#posicionamento' },
    ],
  },
  {
    title: 'Esclarecer',
    links: [
      { label: 'Confiança e transparência', href: '#confianca' },
      { label: 'Perguntas frequentes', href: '#faq' },
    ],
  },
]

export const linkedIn = {
  href: 'https://linkedin.com/company/finerone?skipRedirect=true&viewAsMember=true',
  network: 'LinkedIn',
  title: 'Acompanhe a evolução da Finer One.',
  description: 'Produto, novidades e conteúdos.',
  ariaLabel: 'Finer One no LinkedIn, abre numa nova janela',
}

/**
 * Nota: `ctaHeadlineSecond` usa um hífen não separável (U+2011) em
 * "transformá‑los". Com o hífen normal, o text-balance parte a palavra ao
 * meio entre linhas — "Falta transformá- / los em decisões".
 */
export const footerCopy = {
  ctaHeadlineFirst: 'Os números já existem.',
  ctaHeadlineSecond: 'Falta transformá‑los em decisões.',
  ctaSubheadline:
    'Veja a sua empresa com mais clareza e transforme informação financeira em contexto para decidir o que vem a seguir.',
  ctaPrimary: 'Agendar Demo',
  ctaSecondary: 'Começar Agora',
  tagline: 'Inteligência financeira para decisões mais claras.',
  copyright: '© 2026 Finer One. Todos os direitos reservados.',
}

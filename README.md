# Finer One — Site institucional

Site institucional e comercial da Finer One, plataforma de inteligência
financeira e decisão para PME.

**Estado atual: Etapa 4 — Navbar, Hero, secção do problema, secção da
solução e secção de áreas do produto.** O restante da landing page (preços,
testemunhos, FAQ, rodapé completo) ainda não foi construído.

---

## Executar localmente

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # verificação de tipos + build de produção
npm run preview  # servir o build
npm run lint     # apenas verificação de tipos
```

## Stack

| Camada     | Escolha                                          |
| ---------- | ------------------------------------------------ |
| Framework  | React 19 + Vite 8                                |
| Linguagem  | TypeScript (strict)                              |
| Estilos    | Tailwind CSS 3.4, tokens da marca em `tailwind.config.ts` |
| Ícones     | lucide-react                                     |
| Gráficos   | SVG próprio — sem biblioteca de charts           |
| Utilitário | `cn()` com clsx + tailwind-merge (padrão shadcn)  |

O alias `@/` aponta para `src/` (definido em `vite.config.ts` e `tsconfig.json`).

## Estrutura

```
public/brand/          ícone oficial (SVG vetorizado + PNG originais)
src/
  components/
    brand/Logo.tsx             marca "F" + wordmark
    layout/Navbar.tsx          navbar fixa, menu mobile, skip-link
    hero/
      Hero.tsx                 H1, subheadline, CTAs
      HeroBackground.tsx       grelha, arco de luz, halo (decorativo)
      ProductShowcase.tsx      moldura e profundidade do produto
    problem/
      ProblemSection.tsx       segunda secção: o problema (Bento)
      BentoCard.tsx            invólucro comum dos quatro cards
      DataSourcesCard.tsx      dados dispersos por vários sistemas
      QuestionsCard.tsx        perguntas do empresário, em ciclo
      LateDecisionCard.tsx     degradação de margem e custo do atraso
      FinerHubCard.tsx         convergência para a camada de inteligência
      sourceIcons.tsx          ícones genéricos por tipo de sistema
    solution/
      SolutionSection.tsx      terceira secção: a solução (sticky no desktop)
      SolutionStep.tsx         bloco de texto de cada etapa
      SolutionVisual.tsx       seletor da cena
      ConnectVisual.tsx        01 — fontes a encaixar numa espinha comum
      OrganizeVisual.tsx       02 — visão consolidada, leitura editorial
      InterpretVisual.tsx      03 — número -> significado
      DecideVisual.tsx         04 — pergunta, resposta e recomendação
      SolutionProgress.tsx     indicador discreto das quatro etapas
      SolutionRail.tsx         rail vertical de progressão (só lg+)
      StepSignals.tsx          microinformação editorial por etapa
    features/
      FeaturesSection.tsx      quarta secção: áreas do produto (tabs)
      FeatureShowcase.tsx      título, moldura e visual secundário
      FeatureFrame.tsx         moldura estável partilhada pelas 6 áreas
      FeatureTabs.tsx          tablist acessível (setas, Home, End)
      primitives.tsx           FieldLabel, Figure, Surface, Tag, Rule
      visuals/                 as 6 interfaces + visuais secundários
    footer/
      FinalCTA.tsx              fase 10: encerramento da narrativa
      SiteFooter.tsx            rodapé institucional
      FooterVisual.tsx          faixa de transição em SVG
      LinkedInStrip.tsx         faixa do LinkedIn
      FooterLinks.tsx           navegação, só âncoras existentes
      FooterBrand.tsx           marca em grande escala
    faq/
      FAQSection.tsx            fase 9: perguntas frequentes
      FAQCategories.tsx         tablist de categorias, deslizável em mobile
      FAQAccordion.tsx          lista da categoria ativa
      FAQItem.tsx               pergunta e resposta
    pricing/
      PricingSection.tsx        fase 8: planos e preços
      PricingSpotlightCard.tsx  card com iluminação a seguir o cursor
      PlanMicroVisual.tsx       detalhe visual próprio de cada plano
      PricingComparison.tsx     tabela no desktop, seletor no telemóvel
      PricingFeature.tsx        célula de comparação
    trust/
      TrustSection.tsx         fase 7: confiança, controlo e transparência
      TrustAnalysisPanel.tsx   painel central; 3 zonas ligadas aos princípios
      TrustPrinciple.tsx       cartão de princípio com spotlight
      DataProvenance.tsx       fatores considerados e período analisado
      AccessScope.tsx          informação disponível (conceptual)
      ResponsibilityFlow.tsx   dados -> análise -> contexto -> decisão humana
      BoundariesReading.tsx    o que acrescenta / não pretende substituir
    product/
      DashboardMock.tsx        composição do dashboard demonstrativo
      CashflowChart.tsx        gráfico de tesouraria em SVG
      KpiCard.tsx              indicador com contagem animada
      InsightCard.tsx          alerta interpretado
      ForecastCard.tsx         previsão de tesouraria
      ChatPreview.tsx          amostra do chat financeiro
    ui/Button.tsx
    ui/Reveal.tsx              entrada suave ao chegar à viewport
  data/demoDashboard.ts        dados demonstrativos do dashboard
  data/problemSection.ts       conteúdo da secção do problema
  data/solutionSection.ts      conteúdo da secção da solução
  data/featuresSection.ts      conteúdo e mock data das áreas do produto
  hooks/                       useSpotlight, useActiveStep, useElementSize, useCountUp,
                               useInView, usePrefersReducedMotion
  lib/format.ts                formatação em euros e percentagens
  lib/utils.ts                 cn()
```

## Identidade visual

Tokens em `tailwind.config.ts`. Não introduzir cores fora desta paleta —
apenas variações de opacidade.

| Token          | Hex       | Utilização                              |
| -------------- | --------- | --------------------------------------- |
| `navy`         | `#070D2B` | fundo principal, navbar                 |
| `navy-deep`    | `#050A20` | profundidade, superfície do produto     |
| `navy-soft`    | `#0B1338` | superfícies elevadas                    |
| `surface`      | `#1A2238` | cartões, superfícies secundárias        |
| `accent`       | `#0052FF` | CTA principal, estados ativos           |
| `glow`         | `#1E90FF` | iluminação, destaques, gráficos         |
| `mist`         | `#A6A6A6` | texto secundário, etiquetas             |
| `signal`       | `#F0B429` | token semântico — ver nota abaixo       |

`signal` é um **token semântico de aviso**, não faz parte da identidade
principal da Finer One. Uso exclusivo em alertas de risco e estados de warning
(atualmente: `InsightCard` e a variação negativa de margem no `KpiCard`). Não deve ser utilizado em navegação, CTAs,
gráficos, decoração ou qualquer material de marca.

Tipografia: **Inter Tight** para display (H1, títulos) e **Inter** para texto e
números. Valores financeiros usam a classe `.tabular` (largura fixa de dígitos).

## Dados demonstrativos

Todos os números visíveis no dashboard da Hero vivem em
`src/data/demoDashboard.ts` e existem apenas para dar vida à representação do
produto. Não correspondem a nenhuma empresa, cliente ou integração real, e não
devem ser reutilizados como prova, referência comercial ou benchmark.

Coerência interna dos dados:

- o último ponto realizado do gráfico (€148.920) é o KPI de Tesouraria;
- o primeiro ponto de previsão (€184.200) é a previsão a 30 dias;
- a variação de -7,8% no KPI Margem é o mesmo valor do alerta.

## Notas de implementação

**Logótipo.** Apenas o ícone "F" foi fornecido em ficheiro. Foi vetorizado para
SVG (`currentColor`) e combinado com o wordmark em texto. Quando o logótipo
horizontal oficial estiver disponível, substituir apenas `src/components/brand/Logo.tsx`.

**shadcn/ui.** O `Button` segue o padrão shadcn (forwardRef + `cn()`), mas foi
escrito à mão. `npx shadcn@latest init` continua a poder ser executado
normalmente para adicionar componentes.

**Gráfico.** Implementado em SVG próprio para evitar ~90 KB gzip de uma
biblioteca de charts numa única secção. Mede o contentor com `ResizeObserver` e
desenha em pixéis reais, sem `scale()` nem distorção de `viewBox`.

**Movimento.** Todas as animações respeitam `prefers-reduced-motion`
(desativadas globalmente em `index.css` e nos hooks `useCountUp` e no desenho
do gráfico).

**Overflow horizontal.** O corte vive só em `html { overflow-x: clip }`. O
`body` não pode repetir a regra: com o `html` já não-visível, o overflow do
body deixa de propagar para a viewport e o body passa a ser ele próprio um
contentor de scroll, o que quebra `position: sticky` em toda a página.

**Âncoras.** Cada secção com âncora usa `scroll-mt-24` (64px de navbar + 32px
de folga) e nunca `overflow-hidden` no elemento `<section>` — isso tornaria-a
um contentor de scroll e o Chrome ignoraria o `scroll-margin-top`. O
`App.tsx` resolve a âncora no arranque, porque o browser tenta fazê-lo antes
do React montar.

**Line endings.** Repositório novo em LF, normalizado por `.gitattributes`.

## Por fazer

- Substituir o lockup do logo pelo ficheiro horizontal oficial.
- Secções seguintes da landing page.
- Ligações reais dos CTAs e dos itens de navegação (atualmente âncoras).

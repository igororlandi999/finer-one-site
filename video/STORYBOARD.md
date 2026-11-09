# Finer One — vídeo de demonstração da plataforma (Hero)

**Formato:** 16:9 · 1920 × 1080 · 30 fps · ~28 s · MP4 H.264 sem som, em loop.
**Ferramenta:** Remotion (React). A interface no vídeo é renderizada a partir dos
mesmos componentes do website — nítida em qualquer zoom e sempre com **dados
fictícios**. As capturas reais servem apenas de referência visual.

**Linguagem visual**
- Navy profundo `#040817`, azul elétrico `#0052FF`, branco luminoso, Montserrat.
- **Linha azul luminosa** como assinatura: abre o vídeo, marca a entrada numa
  nova área e fecha o loop. Nunca está permanentemente a brilhar.
- Câmara com aceleração suave (bezier 0.45, 0, 0.2, 1); zooms entre 1,0× e 1,45×.
- Cursor discreto com clique visível; destaques em contorno azul fino ou
  preenchimento suave — sem setas, sem etiquetas sobrepostas, sem 3D.

| # | Tempo | Cena | O que acontece | Câmara |
|---|---|---|---|---|
| 1 | 0,0 – 1,5 s | **Abertura** | Navy profundo com a assinatura FINER ONE discreta. A linha azul atravessa o ecrã em diagonal e revela a Finer Home. | 1,07× → 1,0× |
| 2 | 1,5 – 9,0 s | **Finer Home** | O cursor clica em *Ask Finer* e escreve “Como está a situação financeira da minha empresa?”. Envia. A Finer One responde. O foco desce para *Indicadores principais*: contorno azul no bloco e realce sequencial de saldo, entradas, saídas e resultado. | aproximação à pergunta → pan para os indicadores (1,4×) |
| 3 | 9,0 – 16,0 s | **Cashflow · Receitas · Despesas** | A linha azul percorre o menu até *Cashflow*; as barras do gráfico crescem e surge o detalhe de setembro. Passagem a *Receitas*: a curva acumulada desenha-se e o foco vai para *Receitas por categoria*. *Despesas*: a curva em degraus desenha-se (curta). | plano geral → zoom 1,3× no gráfico → pan para a coluna direita |
| 4 | 16,0 – 21,0 s | **O que merece atenção** | *Alertas*: a lista entra; o foco desloca-se para “Clientes em atraso” (€ 18.640) e o painel de detalhe abre. Corte suave para *Clientes e Fornecedores*: o bloco “A receber · Vencido” ganha destaque. | zoom 1,35× no alerta → pan para o painel |
| 5 | 21,0 – 27,0 s | **Finer Advisor** | Ação “Cobrar as faturas em atraso” selecionada. *O que os dados mostram*: os pontos surgem um a um. *Recomendação Finer One*: as ações aparecem em sequência; a linha azul contorna o painel. | zoom 1,45× no painel de detalhe, pan descendente lento |
| 6 | 27,0 – 28,0 s | **Fecho / loop** | A câmara recua e a linha azul atravessa de novo, devolvendo exatamente o enquadramento do primeiro fotograma: o loop não tem corte. | 1,45× → 1,07× |

**Entregáveis**
- `finer-one-demo.mp4` — 1920×1080, H.264, CRF 24–26, objetivo ≤ 6 MB.
- `finer-one-demo-1280.mp4` — versão leve para telemóvel (opcional).
- `poster.jpg` — primeiro fotograma, para mostrar enquanto o vídeo carrega
  e para quem prefere movimento reduzido.

**Comandos** (pasta `video/`)
- `npm run studio` — pré-visualizar e afinar no Remotion Studio.
- `npm run render:sample` — amostra (cenas 1 e 2).
- `npm run render` e `npm run still` — vídeo final e poster.

**Licença Remotion:** gratuita para empresas com até 3 pessoas; acima disso
exige licença da empresa (remotion.dev/license).

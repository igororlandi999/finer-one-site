# Finer One — vídeos de demonstração da plataforma

Produzidos com Remotion (React) a partir dos mesmos componentes do website —
interface fiel às capturas reais, sempre com **dados fictícios**.
Referência visual (`previews/storyboard-video-A.jpg` e `-B.jpg`).

## Linguagem de motion Finer One
- **Fio narrativo:** a linha azul luminosa liga a informação à decisão — sai do
  valor relevante e conduz ao ecrã seguinte. Nunca brilha de forma contínua.
- **Transições por máscara:** revelação diagonal (abertura) e máscara circular
  com orla luminosa a partir do fim da linha (passagem entre áreas).
- **Interface viva:** escrita em tempo real, cliques visíveis, respostas que
  surgem palavra a palavra, gráficos que crescem, listas que entram uma a uma.
- **Câmara:** zooms 1,4×–2,0× sobre o que importa (legível na janela do hero),
  aceleração suave bezier(0.45, 0, 0.2, 1), sem movimentos rápidos.
- **Destaque:** contorno azul #0052FF fino e preenchimento suave; sem setas,
  partículas, flashes ou 3D.

## Vídeo A — Hero (15–18 s, 16:9, sem som, loop)
| Tempo | Momento | Transição / câmara |
|---|---|---|
| 0–3 s | Pergunta “Como está a tesouraria da minha empresa?” escrita no Ask Finer | revelação pela linha azul; 1,6× |
| 3–5 s | Resposta da Finer One, palavra a palavra | plano ligeiramente mais aberto (1,4×) |
| 5–6 s | Prioridade de hoje: € 18.640 em faturas por receber | pan descendente; contorno azul |
| 6–7,5 s | Fio narrativo do valor até ao canto; abre o Finer Advisor | linha → máscara circular |
| 7,5–9 s | O que os dados mostram (4 pontos) e recomendações | entradas sequenciais |
| 9–10 s | Recomendação principal em destaque | contorno + barra azul |
| 10–18 s | Plano de ação · recuo · linha regressa à Finer Home | loop sem corte |

**Amostra produzida:** `HeroSample` (0–10 s) → `public/video/amostras/hero-a.mp4`
(só visível com `?video=amostra`; remover antes de publicar).

## Vídeo B — Demonstração completa (≈ 55 s, abre em “Ver a Finer One em ação”)
Finer Home → Cashflow → Receitas → Despesas → Clientes e Fornecedores →
Alertas → Finer Advisor → encerramento com regresso à Finer Home. Cada área com
uma frase curta (legenda discreta) e um único movimento de câmara principal.

## Entregáveis finais
- `hero-a.mp4` 1920×1080 (≤ 4 MB) + versão 1280×720 para telemóvel + poster JPG.
- `demo-b.mp4` 1920×1080 (≤ 15 MB, carregado só ao abrir) + poster.

## Comandos (pasta `video/`)
`npm run studio` · `npx remotion render src/index.ts HeroSample out/hero-a.mp4`

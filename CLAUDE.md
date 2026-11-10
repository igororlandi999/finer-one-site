# Finer One — website

Contexto obrigatório para qualquer sessão que trabalhe neste repositório.

## Regras de segurança do projeto

- `main` publica automaticamente em www.finer-one.com (GitHub Actions → Pages).
  **Nunca fazer push para `main` nem merge sem autorização explícita de um fundador.**
- Trabalho em branches `dev/*`. O backup remoto `backup/desktop-2026-09-03` não se toca.
- Não inventar preços, clientes, testemunhos, métricas, certificações ou parceiros.
- Kontomatik e Qwist estão **em avaliação** — não os apresentar como parceiros.
  AWS é a tecnologia **prevista** para o processamento de faturas.
- Open Banking, leitura de faturas por email, alertas e Finer Advisor são
  funcionamento **previsto/MVP em teste** — comunicar como tal.
- Valores em euros no site são sempre demonstrativos e rotulados como "Exemplo".
- Não usar as capturas reais da plataforma sem confirmar que os dados nelas são fictícios.

## Identidade

- Posicionamento: **The Financial Operating System.**
- Assinatura: **Where Finance Meets Strategy.**
- Pilares: **Compreender · Antecipar · Decidir**
  ("Understand today. Anticipate tomorrow. Decide better.")
- Hero aprovada: "A sua empresa já tem os números. Agora precisa de respostas."
- Tom: organizado, analítico, prático, direto, confiante e próximo. Não comunica
  como uma instituição financeira. PT-PT por defeito, EN como segunda língua.
- Público: empresários e gestores de PME portuguesas, sem CFO interno.

## Visual

- Navy profundo `#070D2B`, branco, azul elétrico `#0052FF` (glow `#1E90FF`).
- Tipografia: **Inter** (texto) e **Inter Tight** (títulos), como no site anterior — decisão do fundador (10/11/2026).
  **Regra fixa:** se um pedido futuro mencionar Montserrat, ignorar — manter sempre Inter / Inter Tight até ao fim do projeto.
- Alternar secções escuras (impacto) e claras (explicação).
- Linha azul luminosa como motivo de assinatura; fotografia cinematográfica
  (arquitetura, montanhas, estradas com luz) — aguarda ficheiros sem texto.
- Referências de qualidade: Linear, Searchable, Ramp, Lovable, G4 OS.
- Movimento sempre com `prefers-reduced-motion` respeitado e bom desempenho em mobile.

## Técnico

Ver README.md (stack, estrutura, notas de overflow/sticky). Componentes da
homepage v2 em `src/components/v2/`. Validar com `npm run build`.

## Páginas e formulários (fase 2)

- Páginas independentes (multi-page Vite): `/pioneers/`, `/lista-espera/`,
  `/privacidade/` — cada uma com `index.html` próprio e entrada em `src/entries/`.
- Envio: `src/lib/forms.ts`. Sem `VITE_FORMS_ENDPOINT` = modo de
  pré-visualização (nada é enviado). Recetor previsto: Google Apps Script +
  Folha Google da conta da empresa (`backend/google-apps-script/`). Só ativar
  com autorização dos fundadores.
- O aviso de privacidade é um RASCUNHO — não publicar sem validação.

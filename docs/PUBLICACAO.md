# Publicação do site com os formulários na Cloudflare

Procedimento para publicar a PR #2 (`dev/lancamento-formularios` → `main`). Cada passo
marcado com **[fundador]** só é feito com autorização explícita de um fundador.

## 0. Antes de começar

- [ ] Política de privacidade aprovada pelos fundadores (ver "Proteção de dados" abaixo).
      Enquanto não estiver, `APPROVED = false` e a página mostra "Rascunho em revisão".
- [ ] Verificação em dois passos ativa na conta Cloudflare (geral.finerone@gmail.com).
- [ ] Recetor ativo: `https://finer-one-forms.geral-finerone.workers.dev/` responde
      `{"ok":true,"service":"finer-one-forms"}`; D1 `finer-one-forms` vazia ou só com dados reais.
- [ ] Turnstile "Finer One - formularios do site" só com `finer-one.com` e `www.finer-one.com`.
- [ ] Worker `finer-one-forms` com `ALLOWED_ORIGINS=https://www.finer-one.com,https://finer-one.com`
      e `ALLOWED_HOSTNAMES=www.finer-one.com,finer-one.com`.
- [ ] Guardar num local seguro o valor atual de `VITE_FORMS_ENDPOINT` (URL `/exec` do Google
      Apps Script) — é o que permite a reversão. Também está em `.env.local` (não versionado).
- [ ] A PR #2 contém o último commit e os checks estão verdes.

## 1. Variáveis ANTES do merge [fundador]

Por que é seguro: o workflow que está hoje na `main` não passa nenhuma variável `VITE_*` ao
build (só o da PR #2 o faz). Alterar as variáveis antes do merge não muda nada no site
publicado; o primeiro build que as usa é o do próprio merge — que já sai com o recetor certo.

GitHub → repositório → Settings → Secrets and variables → Actions → **Variables**:

| Variável | Valor |
| --- | --- |
| `VITE_FORMS_PROVIDER` | `cloudflare` |
| `VITE_FORMS_ENDPOINT` | `https://finer-one-forms.geral-finerone.workers.dev/` |
| `VITE_TURNSTILE_SITEKEY` | `0x4AAAAAAGCZmNaMZOnS986M` |

São valores públicos (vão no JavaScript do site). Não criar *secrets* para eles e **nunca**
colocar aqui o segredo do Turnstile (esse vive só no Worker, cifrado).

Proteções já no código: com `VITE_FORMS_PROVIDER=cloudflare` e sem `VITE_TURNSTILE_SITEKEY`,
ou sem `VITE_FORMS_ENDPOINT`, o build de produção mostra "formulário indisponível" — nunca
um falso sucesso.

Depois de definir, não fazer push nem "Run workflow" na `main` até ao merge (por precaução;
com o workflow atual da `main` não teria efeito).

## 2. Merge e deploy [fundador]

1. Fazer merge da PR #2 na `main`.
2. Acompanhar Actions → "Deploy to GitHub Pages" até ficar verde (build + deploy).
3. Esperar 1–2 minutos pela propagação do GitHub Pages.

## 3. Validar em produção (dados fictícios, apagados no fim)

Usar emails de teste do tipo `teste-AAAAMMDD@exemplo-ficticio.pt`.

1. **Página e rede** — abrir `https://www.finer-one.com/lista-espera/` com as ferramentas do
   programador (separador Rede): ao navegar não há pedidos a `challenges.cloudflare.com` nem ao
   Worker; só no envio.
2. **Lista de Espera (PT)** — preencher e enviar. Deve aparecer "Está na lista." No Console
   da D1: `SELECT kind, name, email, lang FROM submissions ORDER BY created_at DESC LIMIT 5;`
   → uma linha `waitlist`, `lang = pt`.
3. **Duplicado** — repetir com o mesmo email (noutra janela): confirmação sem nova linha.
4. **Finer Pioneer (EN)** — mudar o idioma para EN em `/pioneers/`, enviar. Deve aparecer
   "Application received"; na D1 uma linha `pioneers`, `lang = en`. Reenviar com o mesmo email
   em menos de 10 minutos → aviso de candidatura já recebida, sem nova linha.
5. **Aviso de privacidade** — `/privacidade/` descreve Cloudflare (Workers, D1, Turnstile,
   7 dias de Time Travel) e não fala em Folha Google; mostra "Rascunho em revisão" enquanto
   não for aprovado.
6. **Google sem novas entradas** — a Folha "Finer One — Inscrições do site" e a caixa
   geral.finerone@gmail.com não recebem estes envios.
7. **Limpar** — `DELETE FROM submissions WHERE email LIKE '%@exemplo-ficticio.pt';` e
   `SELECT COUNT(*) FROM submissions;`.

Se algum passo falhar: aplicar a reversão (secção 4) e só depois investigar.

## 4. Reversão segura

**A. Voltar ao Google sem mexer no código (minutos)** [fundador]
1. Variables: `VITE_FORMS_PROVIDER=google` (ou apagar a variável) e `VITE_FORMS_ENDPOINT` =
   URL `/exec` do Apps Script guardado no passo 0.
2. Actions → "Deploy to GitHub Pages" → **Run workflow** (branch `main`).
3. Validar um envio fictício: chega à Folha e ao email; apagar a linha de teste.
4. Inscrições que entretanto entraram na D1: exportar em CSV (Explore Data → Export) e
   juntá-las à Folha manualmente; depois apagá-las da D1.

O Apps Script, a Folha e o gatilho `resendPending` não foram alterados pela migração.

**B. Reverter o merge** [fundador] — no GitHub, "Revert" do merge da PR #2 → nova PR →
merge. Volta o site anterior completo (perde também as outras melhorias da PR #2).

**C. Só o Worker** — painel → Workers & Pages → `finer-one-forms` → Deployments →
Rollback (ver `workers/forms/README.md`, incluindo o aviso sobre o segredo do Turnstile).

## Proteção de dados — evidência contratual (consultada a 15/11/2026)

- **Contrato aplicável à conta gratuita:** Self-Serve Subscription Agreement (última
  atualização 12/09/2025). Define "Services" como as soluções que exigem conta Cloudflare
  (secção 1) e prevê "Free Services" (secção 2.6). A secção 6.1 incorpora por referência o
  DPA quando o conteúdo do cliente inclui dados pessoais de titulares europeus.
  <https://www.cloudflare.com/en-ca/terms/>
- **DPA:** versão 6.4, em vigor desde 03/04/2026. "Services" abrange todas as soluções
  cloud da Cloudflare; não há exclusão expressa de serviços gratuitos; a Cloudflare é
  subcontratante; transferências por EU-U.S. Data Privacy Framework ou cláusulas-tipo da UE;
  subcontratantes listados online com aviso prévio de 30 dias. Não nomeia Workers, D1 ou
  Turnstile individualmente. <https://www.cloudflare.com/en-us/dpa/>
- **Developer Platform:** os Service-Specific Terms incluem Workers e D1 na "Cloudflare
  Developer Platform". <https://www.cloudflare.com/service-specific-terms-developer-platform/>
- **Turnstile:** a Cloudflare é subcontratante dos sinais (IP, user-agent, etc.) para
  proteger o site do cliente e **responsável pelo tratamento** desses sinais para melhorar a
  deteção de robôs. <https://www.cloudflare.com/turnstile-privacy-policy/>
- **D1:** base criada com jurisdição UE (dados em repouso na UE); Time Travel de 7 dias no
  plano gratuito, sempre ativo.

**Dúvidas que permanecem (para jurista/fundadores):**
1. O DPA diz que vigora a partir da data em que o cliente o assinou ou as partes o acordaram;
   a incorporação por referência no Self-Serve Agreement (secção 6.1) parece bastar, mas não
   há aceitação expressa registada na conta. Confirmar se é suficiente ou se convém pedir
   confirmação à Cloudflare.
2. O papel de responsável da Cloudflare no Turnstile (melhoria da deteção) já está descrito
   no aviso; confirmar que o fundamento "interesse legítimo" da Finer One cobre a ativação.
3. O processamento em trânsito (Workers, Turnstile) pode ocorrer fora do EEE; só o
   armazenamento D1 está restrito à UE.
4. Responsável proposto (Henrique Santos Bértolo) pendente de concordância formal; a
   política continua em rascunho (`APPROVED = false`, versão de consentimento
   `2026-11-rascunho`).

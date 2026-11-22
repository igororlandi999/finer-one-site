# Ativar os formulários (Lista de Espera e Finer Pioneers)

**Custo:** zero. Usa a conta Google da empresa (geral.finerone@gmail.com).

**O que acontece a cada inscrição válida**

1. O site envia os dados por HTTPS para a aplicação Web do Google Apps Script.
2. O script **guarda** a inscrição na Folha **Finer One — Inscrições do site**
   (separadores **Lista de espera** e **Finer Pioneers**). Só depois disto o
   site mostra "sucesso".
3. O script envia um email para **geral.finerone@gmail.com** com o assunto
   **Finer One — Lista de Espera — …** ou **Finer One — Finer Pioneer — …** e
   os dados organizados. Responder a esse email responde ao inscrito.
4. Se o email falhar (ex.: quota diária), a linha fica com
   **Notificação = Pendente** e é reenviada automaticamente de 15 em 15 minutos.
   O contacto nunca se perde: está sempre na folha.

> Enquanto isto não estiver feito, o site publicado mostra
> "formulário temporariamente indisponível" (nunca um falso sucesso). Em
> desenvolvimento local (`npm run dev`) os formulários ficam em modo de
> pré-visualização e não enviam nada.

## Passos (cerca de 15 minutos, uma única vez)

1. Entrar em <https://sheets.google.com> **com a conta geral.finerone@gmail.com**
   e criar uma folha nova chamada **Finer One — Inscrições do site**.
2. Na folha: menu **Extensões → Apps Script**.
3. Apagar o conteúdo do ficheiro `Code.gs` e colar o conteúdo de
   `backend/google-apps-script/Code.gs` deste projeto. Guardar (Ctrl+S).
4. **Testar o email antes de publicar:** na barra do editor escolher a função
   `testNotification` e clicar **Executar**. O Google pede autorização
   (Folhas, email, acionadores): aceitar com a conta da empresa. Confirmar que
   chegou um email "Finer One — Lista de Espera — Teste interno" à caixa
   geral.finerone@gmail.com (ver também Spam).
5. Escolher a função `installTriggers` e clicar **Executar** (uma vez). Cria o
   reenvio automático de notificações pendentes.
6. Botão **Implementar → Nova implementação**:
   - Tipo: **Aplicação Web**
   - Executar como: **Eu** (geral.finerone@gmail.com)
   - Quem tem acesso: **Qualquer pessoa** (necessário para o site poder enviar;
     ninguém consegue *ler* a folha por este endereço)
7. Copiar o **URL da aplicação Web** (termina em `/exec`). Abri-lo no browser
   deve mostrar `{"ok":true,"service":"finer-one-forms"}`.
8. No GitHub: **Settings → Secrets and variables → Actions → Variables →
   New repository variable**
   - Nome: `VITE_FORMS_ENDPOINT`
   - Valor: o URL `/exec`
   (Não é uma palavra-passe; é um endereço público de envio. O workflow de
   publicação já o lê.)
9. Para testar localmente antes de publicar: criar o ficheiro `.env.local` na
   raiz do projeto com `VITE_FORMS_ENDPOINT=<URL /exec>` (está no .gitignore)
   e correr `npm run dev`.

## Teste ponta a ponta obrigatório antes do lançamento

Com o endpoint configurado, fazer **uma inscrição real em cada formulário**
(desktop e telemóvel) e confirmar:

- a linha aparece no separador certo da folha, com Notificação = "Enviada …";
- o email chega a geral.finerone@gmail.com com o assunto e os dados corretos;
- clicar duas vezes em enviar não cria duas linhas.

Depois de testar, apagar as linhas de teste da folha.

## Alterar o script mais tarde

Depois de editar o `Code.gs`: **Implementar → Gerir implementações → editar
(lápis) → Versão: Nova versão → Implementar**. O URL `/exec` mantém-se.

## Limites a conhecer

- Uma conta Gmail gratuita pode enviar cerca de **100 emails por dia** através
  do Apps Script. Acima disso as notificações ficam "Pendente" e são reenviadas
  no dia seguinte; as inscrições continuam a ser guardadas.
- O mesmo email só é aceite uma vez a cada 10 minutos por formulário; a lista
  de espera nunca inscreve o mesmo email duas vezes.
- Proteção extra contra robôs (Cloudflare Turnstile, gratuito): só se
  aparecerem inscrições automáticas; requer conta Cloudflare.

## Consultar os contactos

Abrir a folha **Finer One — Inscrições do site**. A coluna **Estado** das
candidaturas Pioneers pode ser usada para marcar "Contactado",
"Selecionado", etc. Para dar acesso a outro fundador: botão **Partilhar**.

## Explorar (simulador de tesouraria) — atualizado a 22/11/2026

Quando o empresário pede a análise completa no Explorar, o site envia os dados
do formulário para este mesmo script (`kind: "explore"`). O script:

1. guarda o pedido no separador **Explorar — leads** (criado automaticamente no
   primeiro pedido), com: data, nome, email, empresa, país, dimensão, setor,
   telefone, moeda, tipo de simulação, horizonte, **fase**, contacto comercial,
   novidades, origem, versão do aviso, idioma, estado, último pedido, n.º de
   pedidos, ID e notificação;
2. só depois responde ao site com o ID — e só então a análise abre no ecrã;
3. envia um email **só para geral.finerone@gmail.com** com o assunto
   **Novo Lead Explore — Empresa | Finer One** (dados do empresário, interesse
   demonstrado, origem e estado). Responder ao email responde ao empresário.
   **O empresário não recebe nenhum email**, nem a análise por email.

Os valores introduzidos no simulador **não** são enviados nem guardados.

**Repetições:** o mesmo envio (duplo clique, nova tentativa) não cria linha nem
email. Um novo pedido do mesmo email não cria linha nova: atualiza "Último pedido"
e "N.º de pedidos". Se nesse novo pedido marcar contacto comercial, a fase sobe
para "Pediu contacto comercial" e a equipa recebe **um** email
"Lead Explore pediu contacto — Empresa | Finer One". "Oportunidade" marca-se à mão.

**Se o email falhar:** a linha fica "Pendente" e o acionador `resendPending`
reenvia (de 15 em 15 min). O empresário vê a análise na mesma, porque o contacto
já ficou guardado. **Se a folha falhar:** o site mostra um erro, mantém os dados
escritos no formulário e permite tentar outra vez (nunca um falso sucesso).

### Estado verificado a 22/11/2026 — porque os contactos não chegavam

O site publicado (www.finer-one.com) está compilado com
`VITE_FORMS_PROVIDER=cloudflare` e envia os formulários para
`finer-one-forms.geral-finerone.workers.dev` (recetor Cloudflare + D1). Esse
recetor **não envia emails** e **não aceita** pedidos do Explorar. Por isso:

- os pedidos da Lista de Espera e dos Finer Pioneers feitos no site publicado estão
  na base D1 da Cloudflare (painel da Cloudflare → D1 → `finer-one-forms`), **não**
  nesta folha, e não geraram email;
- o Explorar, publicado assim, mostraria sempre um erro.

### Ativar (passos manuais, por esta ordem)

Na conta **geral.finerone@gmail.com**:

1. Abrir a folha **Finer One — Inscrições do site** → **Extensões → Apps Script**.
2. Substituir todo o conteúdo de `Code.gs` pelo ficheiro
   `backend/google-apps-script/Code.gs` deste projeto. Guardar (Ctrl+S).
3. Confirmar as autorizações: escolher `testNotification` → **Executar**. Se o
   Google pedir autorização (Folhas de cálculo, enviar email, acionadores),
   aceitar com a conta da empresa. Tem de chegar um email de teste a
   geral.finerone@gmail.com (ver também Spam).
4. Confirmar o reenvio automático: menu **Acionadores** (ícone do relógio) deve
   ter `resendPending` de 15 em 15 minutos. Se não tiver, escolher
   `installTriggers` → **Executar** (uma vez).
5. **Implementar → Gerir implementações** → na implementação existente, lápis
   (**Editar**) → Versão: **Nova versão** → **Implementar**.
   Manter: Executar como **Eu**; Quem tem acesso **Qualquer pessoa**.
   O endereço `/exec` **mantém-se**. (Não criar uma implementação nova — isso
   gera outro endereço.)
6. Copiar esse endereço `/exec` e abri-lo no browser: deve mostrar
   `{"ok":true,"service":"finer-one-forms"}`.

No GitHub (quem tem acesso às definições do repositório):

7. **Settings → Secrets and variables → Actions → Variables**:
   - `VITE_FORMS_PROVIDER` → `google`
   - `VITE_FORMS_ENDPOINT` → o endereço `/exec` do passo 6
   (Só um recetor ativo: com isto os três formulários passam a usar a folha e o
   email. Os registos antigos continuam na D1 da Cloudflare.)

Teste real antes de publicar (sem publicar o site):

8. Criar `.env.local` na raiz do projeto com
   `VITE_FORMS_ENDPOINT=<endereço /exec>` e correr `npm run dev`.
9. Em `http://localhost:5173/explorar/`, fazer uma simulação e pedir a análise com
   dados fictícios. Confirmar: a análise abre; aparece a linha em
   **Explorar — leads** com Notificação "Enviada …"; chega o email
   "Novo Lead Explore — … | Finer One". Apagar depois as linhas de teste.

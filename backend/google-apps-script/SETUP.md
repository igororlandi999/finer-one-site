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

## Explorar (simulador de tesouraria) — acrescentado a 22/11/2026

O pedido da análise completa em `/explorar/` usa **o mesmo recetor e o mesmo
endereço `/exec`** da Lista de Espera e dos Finer Pioneers. Cada pedido:

1. é guardado no separador **Explorar — leads** (criado automaticamente no
   primeiro pedido), com: data, nome, email, empresa, país, dimensão, setor,
   telefone, moeda, tipo de simulação, horizonte, **fase**, contacto comercial,
   novidades, origem, versão do aviso, idioma, estado, ID e notificação;
2. gera um email para geral.finerone@gmail.com com o assunto
   **Finer One — Explorar — Nome (Empresa)**; responder ao email responde ao lead.

Os valores introduzidos no simulador **não** são enviados nem guardados.

**Fases:** "Pediu relatório" ou "Pediu contacto comercial" (vêm do site);
"Oportunidade" marca-se à mão. Um email que já existe não cria nova linha: se
voltar a pedir e marcar contacto comercial, a fase sobe na linha existente.

**Para ativar (uma vez):** colar o `Code.gs` novo no editor do Apps Script e
fazer **Implementar → Gerir implementações → editar → Nova versão →
Implementar**. O URL `/exec` não muda. **Fazer isto antes de publicar o site
com o Explorar**; caso contrário o formulário do Explorar mostra um erro (nunca
um falso sucesso).

Nota: o recetor Cloudflare (`workers/forms`) ainda não aceita pedidos do
Explorar. Se o site passar a usar `VITE_FORMS_PROVIDER=cloudflare`, é preciso
acrescentá-lo lá também.

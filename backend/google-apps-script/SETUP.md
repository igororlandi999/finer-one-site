# Ativar os formulários (Finer Pioneers e Lista de Espera)

**Custo:** zero. Usa a conta Google da empresa (geral.finerone@gmail.com).
**Onde ficam os contactos:** numa Folha de Cálculo Google, só acessível a quem
a conta partilhar.

> Enquanto isto não estiver feito, os formulários do site funcionam em
> **modo de pré-visualização**: validam e mostram a confirmação, mas não enviam
> nem guardam nada.

## Passos (cerca de 10 minutos, uma única vez)

1. Entrar em <https://sheets.google.com> com a conta da empresa e criar uma
   folha nova chamada **Finer One — Inscrições do site**.
2. Na folha: menu **Extensões → Apps Script**.
3. Apagar o conteúdo do ficheiro `Code.gs` e colar o conteúdo de
   `backend/google-apps-script/Code.gs` deste projeto. Guardar.
4. Botão **Implementar → Nova implementação**:
   - Tipo: **Aplicação Web**
   - Executar como: **Eu** (a conta da empresa)
   - Quem tem acesso: **Qualquer pessoa** (necessário para o site poder enviar;
     ninguém consegue *ler* a folha por este endereço)
5. Autorizar quando o Google pedir. Copiar o **URL da aplicação Web**
   (termina em `/exec`).
6. Entregar esse URL ao Claude, que o coloca na configuração do site como
   `VITE_FORMS_ENDPOINT` (não é uma palavra-passe; é um endereço de envio).

## Consultar os contactos

Abrir a folha **Finer One — Inscrições do site**. Os separadores
**Finer Pioneers** e **Lista de espera** aparecem automaticamente com a
primeira inscrição. A coluna **Estado** das candidaturas pode ser usada para
marcar "Contactado", "Selecionado", etc.

Para dar acesso a outro fundador: botão **Partilhar** da folha.

## Opcional

- Aviso por email a cada nova candidatura: preencher `NOTIFY_EMAIL` no topo
  do `Code.gs` e voltar a implementar (Implementar → Gerir implementações →
  editar → nova versão).
- Proteção extra contra robôs (Cloudflare Turnstile, gratuito): só se
  aparecerem inscrições automáticas; requer criar conta Cloudflare.

## Explorar (simulador de tesouraria)

A página `/explorar/` usa o mesmo recetor e a mesma `VITE_FORMS_ENDPOINT`.
O visitante experimenta sem registo; o formulário só aparece quando pede a
análise completa. Grava no separador **Explorar — leads** (criado
automaticamente), uma linha por email:

- Data, última atividade, Lead ID, nome, email, empresa, país (obrigatórios:
  nome, email, empresa, país); dimensão, setor e telefone (opcionais); moeda.
- Origem (`Explore Finer One`), tipo de simulação (`treasury` / `clients`),
  horizonte (3 ou 6 meses), estado do relatório, **fase**, contacto comercial
  (sim/não), marketing (sim/não, desligado por defeito), versão do aviso,
  idioma e número de pedidos.
- **Fases:** `captado` · `pediu_relatorio` · `pediu_contacto` ·
  `oportunidade`. As duas do meio vêm do site; `oportunidade` é marcada à
  mão pela equipa. Um email repetido atualiza a mesma linha (a fase nunca desce).
- **Os valores da simulação não são enviados nem guardados.** Só devem passar a
  ser guardados se os fundadores confirmarem a finalidade (e o aviso de
  privacidade for atualizado em conformidade).
- O envio da análise por email **ainda não está implementado**; o site mostra a
  análise no navegador e permite guardá-la em PDF.

Se existir um separador "Explorar — leads" ou "Explorar — simulações" de uma
versão de teste anterior, apagá-lo antes de ativar (as colunas mudaram).

Se o recetor já estava implementado antes desta alteração, é preciso
**atualizar a implementação** (Implementar → Gerir implementações → editar →
nova versão) para o `Code.gs` novo entrar em funcionamento. O endereço `/exec`
não muda.

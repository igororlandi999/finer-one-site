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

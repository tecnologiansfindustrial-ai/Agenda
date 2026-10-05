# Agenda: como colocar no ar

Mesma receita do Scudo control: **Firebase** (login + banco) e **GitHub Pages** (site) + **GitHub Actions** (envia os lembretes).
Tudo no plano grátis, sem cartão.

> Use a **mesma conta** do Google/Firebase e do GitHub, mas crie um **projeto Firebase novo** e um **repositório novo**.
> Se colar as regras deste app no projeto do Scudo, as regras do Scudo são apagadas.

## 1. Criar o projeto no Firebase
1. Acesse console.firebase.google.com → **Adicionar projeto** → nome `agenda` (pode desligar o Analytics).

## 2. Ativar login por e-mail e senha
1. Menu **Authentication** → **Começar** → aba **Método de login** → **E-mail/senha** → ativar → Salvar.

## 3. Criar o banco
1. Menu **Firestore Database** → **Criar banco de dados**.
2. Local: **southamerica-east1 (São Paulo)** → modo **produção**.

## 4. Regras de segurança
1. Firestore → aba **Regras** → apague tudo, cole o conteúdo de `firestore.rules` → **Publicar**.
   (Cada usuário só enxerga a própria agenda.)

## 5. Chaves do app
1. ⚙️ **Configurações do projeto** → **Geral** → **Seus apps** → ícone **</>** (Web) → apelido `agenda` → Registrar.
2. Copie os valores do `firebaseConfig` para o arquivo **`firebase-config.js`**.
3. Ainda em Configurações → aba **Cloud Messaging** → **Certificados push da Web** → **Gerar par de chaves**.
   Copie a chave e cole em `VAPID_KEY` no mesmo arquivo.

## 6. Subir no GitHub Pages
1. GitHub → **New repository** → nome `agenda` → **Public** → Create.
2. **Add file → Upload files** → arraste **todo o conteúdo** desta pasta (inclusive a pasta `.github`) → Commit.
   - Confira se apareceu `.github/workflows/lembretes.yml` no repositório. Se não, crie pelo botão **Add file → Create new file**
     com esse caminho e cole o conteúdo.
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch `main` / `(root)` → Save.
4. Em ~1 min o app fica em `https://SEU-USUARIO.github.io/agenda/`.

## 7. Liberar o domínio no login
1. Firebase → **Authentication → Configurações → Domínios autorizados → Adicionar domínio** → `SEU-USUARIO.github.io`.

## 8. Lembretes com o app fechado (push)
1. Firebase → ⚙️ Configurações → **Contas de serviço** → **Gerar nova chave privada** → baixa um `.json`.
   ⚠️ Esse arquivo é a senha mestra do banco: **não suba no repositório** e não mande pra ninguém.
2. GitHub → repositório → **Settings → Secrets and variables → Actions**:
   - aba **Secrets** → *New repository secret* → nome `FIREBASE_SERVICE_ACCOUNT` → cole o **conteúdo inteiro** do `.json`.
   - aba **Variables** → *New repository variable* → nome `APP_URL` → `https://SEU-USUARIO.github.io/agenda/`
3. Aba **Actions** do repositório → se pedir, clique em ativar os workflows → **Lembretes** → **Run workflow**.
4. Na primeira vez ele deve falhar pedindo um **índice**: abra o log, clique no link `https://console.firebase.google.com/...`
   que aparece no erro e confirme a criação. Espere uns minutos e rode de novo: deve terminar verde.
   (Ou crie na mão: Firestore → Índices → *Campo único* → Adicionar isenção → coleção `entries`, campo `alarmDue`,
   marque **Crescente** no escopo **Grupo de coleções**.)

## 9. Instalar
- **PC (Chrome/Edge):** abra o link → botão **Instalar app** no topo (ou ícone de instalar na barra de endereço).
- **Android:** Chrome → menu ⋮ → **Instalar app** / Adicionar à tela inicial.
- **iPhone (iOS 16.4+):** Safari → Compartilhar → **Adicionar à Tela de Início** → abra pelo ícone.
- Em cada aparelho, toque em **Ativar avisos neste aparelho** (painel "Próximos lembretes").

## O que tem no app
- **Calendário:** anotações por dia, anexos (até 10 MB, qualquer tipo), prints com Ctrl+V, lembretes.
- **Programação:** prazos com check de concluído. Passou do dia sem check → vira **Atrasado**, aparece com ⚠ no calendário,
  no painel **Notificações** e no número vermelho do menu. Concluir depois do prazo fica registrado como "concluído com atraso".
- **Histórico:** busca por palavra, nome de arquivo, categoria, período e situação.
- **Relatórios:** filtros (anotações/programação, período, situação, categorias, texto) e **Gerar PDF** em ordem de data, agrupado por dia, com o nome de quem gerou.
  Os filtros do último PDF gerado ficam salvos na conta (valem no PC e no celular).
- **Meu perfil:** nome completo (pedido no cadastro) que sai como responsável no PDF.

## Atualizando de uma versão anterior
Basta substituir os arquivos no GitHub (index.html, sw.js etc.). Os dados continuam os mesmos e as regras do Firestore não mudam.

## Bom saber
- **Atraso do lembrete:** o GitHub roda o envio a cada ~10 min e às vezes atrasa um pouco. Um lembrete das 08:00 pode chegar até ~08:15.
- **60 dias:** o GitHub pausa tarefas agendadas de repositórios sem nenhum commit há 60 dias. Ele avisa por e-mail;
  é só reativar em Actions (ou fazer qualquer commit).
- **Limites grátis do Firebase:** 1 GB de dados (anexos inclusos) e 50 mil leituras/dia. Para uso pessoal/equipe pequena sobra.
- **Anexos:** até 10 MB cada, qualquer tipo (PDF, Word, Excel, imagens). Prints grandes são reduzidos automaticamente mantendo a leitura.
- **PDF:** modelo Executivo (faixa azul + tabela) com a fonte Inter da pasta `fonts/`. A biblioteca jsPDF é baixada na hora, então precisa de internet para gerar.
- **Offline:** o app abre sem internet e sincroniza quando a conexão volta.
- **Atualizar o app:** substitua os arquivos no GitHub; os aparelhos pegam a versão nova na próxima abertura.

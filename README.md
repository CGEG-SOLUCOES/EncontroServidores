# PGE em Campo 2026 — Votação de Continentes

App mobile de votação: cada servidor escolhe seu continente, vota 1º/2º/3º
lugar entre os outros três, e um painel admin mostra o ranking em tempo real.

100% gratuito: Firebase (plano Spark) + GitHub Pages.

---

## 1. Criar o projeto Firebase

1. Acesse https://console.firebase.google.com
2. **Adicionar projeto** → dê um nome (ex: `pge-em-campo-2026`) → pode desmarcar
   o Google Analytics (não é necessário).
3. Dentro do projeto, vá em **Compilação → Firestore Database** → **Criar
   banco de dados** → escolha **modo de produção** → selecione a região
   `southamerica-east1` (São Paulo, mais rápido pra vocês).
4. Ainda no console, clique no ícone de engrenagem → **Configurações do
   projeto** → role até **Seus apps** → clique no ícone `</>` (Web) →
   registre um app (ex: `pge-em-campo-web`) → **não** precisa marcar
   Firebase Hosting.
5. O Firebase vai mostrar um bloco `firebaseConfig = {...}`. Copie os
   valores para o arquivo `js/firebase-config.js` deste projeto.

## 2. Publicar as regras de segurança

1. No console, vá em **Firestore Database → Regras**.
2. Apague o conteúdo e cole o conteúdo do arquivo `firestore.rules` deste
   projeto.
3. Clique em **Publicar**.

Essas regras são o que de fato impede voto duplicado — mesmo que alguém
tente burlar o app e mandar uma requisição direto pro Firestore.

## 3. Definir a senha do admin

Abra `js/firebase-config.js` e troque:

```js
export const ADMIN_PASSWORD = "pge2026";
```

por uma senha só sua, antes de publicar o site.

## 4. Subir pro GitHub Pages

1. Crie um repositório novo no GitHub (pode ser público ou privado — Pages
   funciona nos dois, privado exige GitHub Pro/Team pra Pages, então se for
   ficar de graça, deixe **público**; como não há segredo real no front-end
   além da senha de admin, e as regras do Firestore são a proteção de
   verdade, tudo bem deixar público).
2. Suba todos os arquivos desta pasta (`index.html`, `admin.html`, `css/`,
   `js/`) pra raiz do repositório.
3. No repositório: **Settings → Pages → Source** → selecione a branch
   `main` e pasta `/ (root)` → **Save**.
4. Em 1-2 minutos o site estará em:
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`
5. A URL de votação é a raiz (`.../index.html`).
   A URL do admin é `.../admin.html`.

## 5. Testar antes do evento

- Abra o link de votação no celular, faça um voto de teste.
- Confira no Firestore (console → Firestore Database → coleção `votos`)
  se o documento apareceu.
- Tente votar de novo com a mesma matrícula → deve aparecer o aviso de
  voto já registrado.
- Abra o link do admin, digite a senha, confirme que o ranking aparece.
- Depois do teste, você pode apagar manualmente o documento de teste no
  console do Firestore antes do evento valer.

## Estrutura de dados (coleção `votos`)

Cada voto é um documento cujo **ID é a matrícula normalizada** (isso é o
que garante unicidade). Campos:

| Campo              | Tipo   | Descrição                                   |
|---------------------|--------|----------------------------------------------|
| `nome`              | string | Nome completo do servidor                     |
| `matricula`          | string | Matrícula como digitada                       |
| `continenteEleitor` | string | Continente do próprio votante                 |
| `primeiro`           | string | Continente votado em 1º lugar                |
| `segundo`             | string | Continente votado em 2º lugar                |
| `terceiro`            | string | Continente votado em 3º lugar                |
| `timestamp`           | date   | Data/hora do servidor no momento do voto      |

Pontuação usada no ranking: **1º = 3 pts · 2º = 2 pts · 3º = 1 pt**.

## Limites do plano gratuito (Spark)

Para ~200 votantes isso nem chega perto do limite: o Firestore gratuito
permite 50 mil leituras e 20 mil gravações por dia. Não precisa se
preocupar com custo.

## Avisos importantes

- Este app foi construído com apoio de IA. Recomenda-se um teste completo
  do fluxo de ponta a ponta antes do dia do evento.
- A senha do admin protege só a *interface* — qualquer pessoa com acesso
  ao Firestore console (ou que descubra a URL do admin e a senha) consegue
  ver os votos. Para um evento interno isso é aceitável, mas não trate
  como dado sigiloso de verdade.

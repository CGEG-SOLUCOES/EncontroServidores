# PGE em Campo 2026 — Votação de Continentes

App mobile de votação: cada servidor escolhe seu continente, vota 1º/2º/3º
lugar entre os outros três, e um painel admin mostra o ranking em tempo real.

100% gratuito: Firebase (plano Spark) + GitHub Pages.

**Versão simplificada: só 2 arquivos, sem pastas.** CSS e JavaScript estão
embutidos dentro de cada HTML — não tem como dar erro de caminho quebrado.

---

## Arquivos deste pacote

| Arquivo             | O que é                                              |
|----------------------|-------------------------------------------------------|
| `index.html`         | O app de votação (o que os servidores acessam)        |
| `admin.html`         | O painel de resultados (protegido por senha)           |
| `firestore.rules`    | Regras de segurança do banco — cole no console Firebase |

Não existem mais pastas `css/` ou `js/`. Tudo está dentro dos próprios `.html`.

---

## Passo 1 — Criar o projeto Firebase

1. Acesse https://console.firebase.google.com
2. **Adicionar projeto** → dê um nome (ex: `pge-em-campo-2026`) → pode
   desmarcar o Google Analytics (não é necessário).
3. Dentro do projeto: **Compilação → Firestore Database → Criar banco de
   dados** → escolha **modo de produção** → região `southamerica-east1`
   (São Paulo).
4. Clique na engrenagem → **Configurações do projeto** → role até
   **Seus apps** → clique no ícone `</>` (Web) → registre um app
   (ex: `pge-em-campo-web`) → **não** precisa marcar Firebase Hosting.
5. O Firebase mostra um bloco assim:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "pge-em-campo-2026.firebaseapp.com",
     projectId: "pge-em-campo-2026",
     storageBucket: "pge-em-campo-2026.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

   Copie esses valores.

## Passo 2 — Colar as chaves nos 2 arquivos

Abra `index.html` num editor de texto (Bloco de Notas, VS Code, etc.),
procure por `const firebaseConfig = {` (perto do final do arquivo) e troque
pelos valores reais do seu projeto.

Faça exatamente a mesma coisa no `admin.html`.

**Dica:** se usar VS Code ou Bloco de Notas, use Ctrl+F para achar
`firebaseConfig` rapidinho nos dois arquivos.

## Passo 3 — Definir a senha do admin

Só no `admin.html`, procure por:

```js
const ADMIN_PASSWORD = "pge2026";
```

Troque `"pge2026"` pela senha que você quer usar, antes de publicar.

## Passo 4 — Publicar as regras de segurança

1. No console Firebase: **Firestore Database → Regras**.
2. Apague o conteúdo existente e cole o conteúdo do arquivo
   `firestore.rules` deste pacote.
3. Clique em **Publicar**.

Essas regras são o que realmente impede voto duplicado — mesmo que alguém
tente burlar o app e mandar uma requisição direto pro Firestore.

## Passo 5 — Subir pro GitHub Pages

1. No seu repositório (`EncontroServidores` ou o que você já criou),
   **apague** qualquer pasta `css/` ou `js/` que tenha sobrado de uma
   versão anterior.
2. Suba **só** `index.html` e `admin.html` pra raiz do repositório
   (sobrescrevendo os que já existem).
3. **Settings → Pages** → confirme que a branch é `main` e a pasta é
   `/ (root)`.
4. Espere 1–2 minutos. O site atualiza sozinho em:
   `https://cgeg-solucoes.github.io/EncontroServidores/`
5. O painel admin fica em:
   `https://cgeg-solucoes.github.io/EncontroServidores/admin.html`

## Passo 5 — Testar antes do evento

- Abra o link de votação no celular, faça um voto de teste.
- No console Firebase → Firestore Database → coleção `votos`, confirme que
  o documento apareceu.
- Recarregue a página no mesmo navegador → deve cair direto na tela
  "Você já votou por aqui!" (trava por `localStorage`).
- Abra o `admin.html`, digite a senha, confirme que o ranking aparece.
- Depois do teste, apague manualmente o documento de teste no console do
  Firestore antes do evento valer.

**Sobre a trava de voto único:** como não há identificação da pessoa
(nome/matrícula), o controle de "1 voto por pessoa" é feito só pelo
navegador (`localStorage`). Isso é simples e funciona bem no uso normal,
mas alguém que limpe o cache do navegador ou use outro dispositivo
consegue votar de novo — não há como impedir isso 100% sem algum tipo de
identificação. Para um evento interno, geralmente é um risco aceitável.

---

## Estrutura de dados (coleção `votos`)

Cada voto é um documento com ID gerado automaticamente pelo Firestore.

| Campo                | Tipo   | Descrição                              |
|------------------------|--------|-------------------------------------------|
| `continenteEleitor`   | string | Continente do próprio votante              |
| `primeiro`               | string | Continente votado em 1º lugar             |
| `segundo`                 | string | Continente votado em 2º lugar             |
| `terceiro`                | string | Continente votado em 3º lugar             |
| `timestamp`               | date   | Data/hora do servidor no momento do voto  |

Pontuação usada no ranking: **1º = 3 pts · 2º = 2 pts · 3º = 1 pt**.

## Limites do plano gratuito (Spark)

Pra ~200 votantes nem chega perto do limite: 50 mil leituras e 20 mil
gravações grátis por dia no Firestore.

## Avisos importantes

- Este app foi construído com apoio de IA. Recomenda-se um teste completo
  do fluxo de ponta a ponta antes do dia do evento.
- A senha do admin protege só a *interface*. Sem nome/matrícula, a trava
  de voto único é só via `localStorage` no navegador — não é uma proteção
  forte contra fraude deliberada, mas é suficiente para uso normal em um
  evento interno.

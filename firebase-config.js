// ============================================================
// CONFIGURAÇÃO DO FIREBASE
// ============================================================
// 1. Vá em https://console.firebase.google.com
// 2. Crie um projeto novo (gratuito, plano Spark)
// 3. Ative o Firestore Database (modo produção)
// 4. Em "Configurações do projeto" > "Seus apps" > ícone Web (</>),
//    registre um app e cole os valores gerados abaixo.
// ============================================================

export const firebaseConfig = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "SEU-PROJETO.firebaseapp.com",
  projectId: "SEU-PROJETO",
  storageBucket: "SEU-PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Senha de acesso ao painel de administração.
// Troque por algo só seu antes de publicar.
export const ADMIN_PASSWORD = "pge2026";

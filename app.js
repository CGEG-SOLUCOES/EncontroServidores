import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---------------------------------------------------------------
// FIREBASE
// ---------------------------------------------------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------------------------------------------------------
// DADOS DOS CONTINENTES (cores e temas batem com o Guia do Jogo)
// ---------------------------------------------------------------
const CONTINENTES = {
  europa: {
    id: "europa",
    nome: "Europa",
    tema: "Governança & Processos",
    icon: "🏛️",
    classe: "c-europa"
  },
  americas: {
    id: "americas",
    nome: "Américas",
    tema: "Comunicação & Atendimento",
    icon: "💬",
    classe: "c-americas"
  },
  africa: {
    id: "africa",
    nome: "África",
    tema: "Liderança, Cultura & Bem-Estar",
    icon: "🤝",
    classe: "c-africa"
  },
  asia: {
    id: "asia",
    nome: "Ásia",
    tema: "Inovação & Transf. Digital",
    icon: "💡",
    classe: "c-asia"
  }
};

// ---------------------------------------------------------------
// ESTADO
// ---------------------------------------------------------------
const state = {
  nome: "",
  matricula: "",
  matriculaId: "",
  meuContinente: null,
  ranking: [null, null, null] // posições 1, 2, 3 -> id do continente
};

// ---------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------
function normalizarMatricula(valor) {
  return valor.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 3200);
}

document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.back));
});

// ---------------------------------------------------------------
// TELA 1 — IDENTIFICAÇÃO
// ---------------------------------------------------------------
const inputNome = document.getElementById("input-nome");
const inputMatricula = document.getElementById("input-matricula");
const errorId = document.getElementById("error-id");

document.getElementById("btn-id-continuar").addEventListener("click", () => {
  const nome = inputNome.value.trim();
  const matricula = inputMatricula.value.trim();
  const matriculaId = normalizarMatricula(matricula);

  errorId.classList.remove("show");

  if (nome.length < 3) {
    errorId.textContent = "Digite seu nome completo.";
    errorId.classList.add("show");
    inputNome.focus();
    return;
  }
  if (matriculaId.length < 3) {
    errorId.textContent = "Digite uma matrícula válida.";
    errorId.classList.add("show");
    inputMatricula.focus();
    return;
  }

  state.nome = nome;
  state.matricula = matricula;
  state.matriculaId = matriculaId;

  showScreen("screen-meucontinente");
});

// ---------------------------------------------------------------
// TELA 2 — ESCOLHA SEU CONTINENTE
// ---------------------------------------------------------------
const gridMeuContinente = document.getElementById("grid-meucontinente");
const btnMeuContinenteContinuar = document.getElementById("btn-meucontinente-continuar");

Object.values(CONTINENTES).forEach(c => {
  const card = document.createElement("div");
  card.className = `continent-card ${c.classe}`;
  card.dataset.id = c.id;
  card.innerHTML = `
    <div class="icon">${c.icon}</div>
    <div class="name">${c.nome}</div>
    <div class="theme">${c.tema}</div>
  `;
  card.addEventListener("click", () => {
    document.querySelectorAll(".continent-card").forEach(el => el.classList.remove("selected"));
    card.classList.add("selected");
    state.meuContinente = c.id;
    btnMeuContinenteContinuar.disabled = false;
  });
  gridMeuContinente.appendChild(card);
});

btnMeuContinenteContinuar.addEventListener("click", () => {
  buildVoteOptions();
  showScreen("screen-votacao");
});

// ---------------------------------------------------------------
// TELA 3 — VOTAÇÃO (toque para ranquear)
// ---------------------------------------------------------------
const voteOptionsEl = document.getElementById("vote-options");
const btnVotacaoContinuar = document.getElementById("btn-votacao-continuar");

function buildVoteOptions() {
  state.ranking = [null, null, null];
  updateSlotsUI();
  voteOptionsEl.innerHTML = "";

  const restantes = Object.values(CONTINENTES).filter(c => c.id !== state.meuContinente);

  restantes.forEach(c => {
    const opt = document.createElement("div");
    opt.className = `vote-option ${c.classe}`;
    opt.dataset.id = c.id;
    opt.innerHTML = `
      <div>
        <div class="name">${c.icon} ${c.nome}</div>
        <div class="theme">${c.tema}</div>
      </div>
    `;
    opt.addEventListener("click", () => handlePickContinent(c.id));
    voteOptionsEl.appendChild(opt);
  });
}

function handlePickContinent(id) {
  const proximoSlot = state.ranking.findIndex(v => v === null);
  if (proximoSlot === -1) return; // já preencheu 1º, 2º e 3º
  state.ranking[proximoSlot] = id;
  updateSlotsUI();
}

function handleRemoveSlot(pos) {
  const idx = pos - 1;
  // remove essa posição e "puxa" as seguintes para preencher o buraco
  for (let i = idx; i < state.ranking.length - 1; i++) {
    state.ranking[i] = state.ranking[i + 1];
  }
  state.ranking[state.ranking.length - 1] = null;
  updateSlotsUI();
}

document.querySelectorAll(".slot-remove").forEach(btn => {
  btn.addEventListener("click", () => handleRemoveSlot(Number(btn.dataset.remove)));
});

function updateSlotsUI() {
  [1, 2, 3].forEach(pos => {
    const id = state.ranking[pos - 1];
    const slot = document.getElementById(`slot-${pos}`);
    const content = slot.querySelector(".slot-content");
    if (id) {
      const c = CONTINENTES[id];
      slot.classList.add("filled");
      content.textContent = `${c.icon} ${c.nome}`;
    } else {
      slot.classList.remove("filled");
      content.textContent = pos === 1 ? "Toque em um continente abaixo" : "—";
    }
  });

  // desabilita opções já usadas
  document.querySelectorAll(".vote-option").forEach(opt => {
    const usado = state.ranking.includes(opt.dataset.id);
    opt.classList.toggle("used", usado);
  });

  btnVotacaoContinuar.disabled = state.ranking.some(v => v === null);
}

btnVotacaoContinuar.addEventListener("click", () => {
  buildSummary();
  showScreen("screen-confirmacao");
});

// ---------------------------------------------------------------
// TELA 4 — CONFIRMAÇÃO
// ---------------------------------------------------------------
const summaryCard = document.getElementById("summary-card");
const btnConfirmarVoto = document.getElementById("btn-confirmar-voto");

function buildSummary() {
  const meu = CONTINENTES[state.meuContinente];
  const p1 = CONTINENTES[state.ranking[0]];
  const p2 = CONTINENTES[state.ranking[1]];
  const p3 = CONTINENTES[state.ranking[2]];

  summaryCard.innerHTML = `
    <div class="summary-row"><span class="label">Nome</span><span class="value">${state.nome}</span></div>
    <div class="summary-row"><span class="label">Matrícula</span><span class="value">${state.matricula}</span></div>
    <div class="summary-row"><span class="label">Seu continente</span><span class="value">${meu.icon} ${meu.nome}</span></div>
    <div class="summary-row"><span class="label">1º lugar</span><span class="value">${p1.icon} ${p1.nome}</span></div>
    <div class="summary-row"><span class="label">2º lugar</span><span class="value">${p2.icon} ${p2.nome}</span></div>
    <div class="summary-row"><span class="label">3º lugar</span><span class="value">${p3.icon} ${p3.nome}</span></div>
  `;
}

btnConfirmarVoto.addEventListener("click", enviarVoto);

async function enviarVoto() {
  btnConfirmarVoto.disabled = true;
  btnConfirmarVoto.innerHTML = `<span class="spinner"></span> Enviando...`;

  const votoRef = doc(db, "votos", state.matriculaId);

  try {
    await runTransaction(db, async (transaction) => {
      const existente = await transaction.get(votoRef);
      if (existente.exists()) {
        throw new Error("JA_VOTOU");
      }
      transaction.set(votoRef, {
        nome: state.nome,
        matricula: state.matricula,
        continenteEleitor: state.meuContinente,
        primeiro: state.ranking[0],
        segundo: state.ranking[1],
        terceiro: state.ranking[2],
        timestamp: serverTimestamp()
      });
    });

    showScreen("screen-obrigado");
  } catch (err) {
    if (err.message === "JA_VOTOU") {
      showToast("Esta matrícula já registrou um voto anteriormente.", true);
    } else {
      console.error(err);
      showToast("Não foi possível enviar o voto. Verifique sua internet e tente novamente.", true);
    }
    btnConfirmarVoto.disabled = false;
    btnConfirmarVoto.textContent = "Confirmar voto";
  }
}

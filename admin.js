import { firebaseConfig, ADMIN_PASSWORD } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CONTINENTES = {
  europa: { id: "europa", nome: "Europa", icon: "🏛️", cor: "#2f6fed" },
  americas: { id: "americas", nome: "Américas", icon: "💬", cor: "#24a854" },
  africa: { id: "africa", nome: "África", icon: "🤝", cor: "#e0921e" },
  asia: { id: "asia", nome: "Ásia", icon: "💡", cor: "#d93a3a" }
};

const PONTOS = { primeiro: 3, segundo: 2, terceiro: 1 };

// ---------------------------------------------------------------
// LOCK DE SENHA
// ---------------------------------------------------------------
const inputSenha = document.getElementById("input-senha");
const errorSenha = document.getElementById("error-senha");

document.getElementById("btn-entrar").addEventListener("click", tentarEntrar);
inputSenha.addEventListener("keydown", (e) => {
  if (e.key === "Enter") tentarEntrar();
});

function tentarEntrar() {
  if (inputSenha.value === ADMIN_PASSWORD) {
    document.getElementById("screen-lock").classList.remove("active");
    document.getElementById("screen-dashboard").classList.add("active");
    carregarDados();
  } else {
    errorSenha.classList.add("show");
  }
}

document.getElementById("btn-refresh").addEventListener("click", carregarDados);

// ---------------------------------------------------------------
// CARREGAR E CALCULAR
// ---------------------------------------------------------------
async function carregarDados() {
  const lastUpdate = document.getElementById("last-update");
  lastUpdate.innerHTML = `<span class="spinner"></span> Atualizando...`;

  try {
    const snap = await getDocs(collection(db, "votos"));
    const votos = snap.docs.map(d => d.data());

    const pontos = { europa: 0, americas: 0, africa: 0, asia: 0 };
    const primeiroLugarCount = { europa: 0, americas: 0, africa: 0, asia: 0 };
    const votosRecebidosTotal = { europa: 0, americas: 0, africa: 0, asia: 0 };

    votos.forEach(v => {
      if (v.primeiro) {
        pontos[v.primeiro] += PONTOS.primeiro;
        primeiroLugarCount[v.primeiro]++;
        votosRecebidosTotal[v.primeiro]++;
      }
      if (v.segundo) {
        pontos[v.segundo] += PONTOS.segundo;
        votosRecebidosTotal[v.segundo]++;
      }
      if (v.terceiro) {
        pontos[v.terceiro] += PONTOS.terceiro;
        votosRecebidosTotal[v.terceiro]++;
      }
    });

    renderStats(votos.length, pontos);
    renderRanking(pontos, votosRecebidosTotal);
    renderFirstPlace(primeiroLugarCount);

    const agora = new Date();
    lastUpdate.textContent = `Atualizado às ${agora.toLocaleTimeString("pt-BR")}`;
  } catch (err) {
    console.error(err);
    lastUpdate.textContent = "Erro ao carregar dados.";
  }
}

function renderStats(totalVotos, pontos) {
  document.getElementById("stat-total-votos").textContent = totalVotos;

  const ordenado = Object.entries(pontos).sort((a, b) => b[1] - a[1]);
  const liderId = ordenado[0][0];
  const liderPontos = ordenado[0][1];
  const lider = CONTINENTES[liderId];

  document.getElementById("stat-lider").innerHTML =
    liderPontos > 0 ? `${lider.icon} ${lider.nome}` : "–";
}

function renderRanking(pontos, votosRecebidosTotal) {
  const list = document.getElementById("ranking-list");
  list.innerHTML = "";

  const ordenado = Object.entries(pontos).sort((a, b) => b[1] - a[1]);
  const maxPontos = Math.max(...ordenado.map(([, p]) => p), 1);

  ordenado.forEach(([id, p], index) => {
    const c = CONTINENTES[id];
    const pct = Math.round((p / maxPontos) * 100);

    const row = document.createElement("div");
    row.className = "ranking-row";
    row.innerHTML = `
      <div class="ranking-row-top">
        <div class="ranking-pos">${index + 1}º</div>
        <div class="ranking-dot" style="background:${c.cor}"></div>
        <div class="ranking-name">${c.icon} ${c.nome}</div>
        <div class="ranking-points">${p} pts</div>
      </div>
      <div class="ranking-bar-track">
        <div class="ranking-bar-fill" style="width:${pct}%; background:${c.cor}"></div>
      </div>
      <div class="ranking-detail">
        <span>Votos recebidos (total): ${votosRecebidosTotal[id]}</span>
      </div>
    `;
    list.appendChild(row);
  });
}

function renderFirstPlace(primeiroLugarCount) {
  const list = document.getElementById("firstplace-list");
  list.innerHTML = "";

  const ordenado = Object.entries(primeiroLugarCount).sort((a, b) => b[1] - a[1]);
  const maxVotos = Math.max(...ordenado.map(([, v]) => v), 1);

  ordenado.forEach(([id, v], index) => {
    const c = CONTINENTES[id];
    const pct = Math.round((v / maxVotos) * 100);

    const row = document.createElement("div");
    row.className = "ranking-row";
    row.innerHTML = `
      <div class="ranking-row-top">
        <div class="ranking-pos">${index + 1}º</div>
        <div class="ranking-dot" style="background:${c.cor}"></div>
        <div class="ranking-name">${c.icon} ${c.nome}</div>
        <div class="ranking-points">${v}</div>
      </div>
      <div class="ranking-bar-track">
        <div class="ranking-bar-fill" style="width:${pct}%; background:${c.cor}"></div>
      </div>
    `;
    list.appendChild(row);
  });
}

const API_URL = "http://localhost:3000";

// Toggle menu mobile
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.querySelector(".sidebar");
menuToggle?.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Carrega dashboard
async function carregarDashboard() {
  try {
    const [denunciasRes, animaisRes, adocoesRes, resgatesRes] = await Promise.all([
      fetch(`${API_URL}/denuncias`),
      fetch(`${API_URL}/animais`),
      fetch(`${API_URL}/adocoes`),
      fetch(`${API_URL}/resgates`)
    ]);

    const denuncias = await denunciasRes.json();
    const animais = await animaisRes.json();
    const adocoes = await adocoesRes.json();
    const resgates = await resgatesRes.json();

    // ==== Atualiza cards ====
    document.getElementById("total-denuncias").textContent = denuncias.length;
    document.getElementById("animais-adocao").textContent = animais.filter(a => a.status === "Vacinado").length;
    document.getElementById("adocoes-concluidas").textContent = adocoes.length;
    document.getElementById("resgates-andamento").textContent = resgates.filter(r => r.status === "Em Andamento").length;

    // ==== Últimas denúncias ====
    const tbody = document.querySelector("#tabela-denuncias tbody");
    tbody.innerHTML = "";
    const ultimas = denuncias.slice(-5).reverse();
    ultimas.forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.endereco}</td>
        <td>${d.tipo || "-"}</td>
        <td>${d.condicao || "-"}</td>
        <td>${d.dataEnvio || "-"}</td>
      `;
      tbody.appendChild(tr);
    });

    // ==== Alertas ====
    const alertasContainer = document.getElementById("alertas-container");
    alertasContainer.innerHTML = "";

    if (denuncias.length > 0) {
      const alertaPendentes = document.createElement("div");
      alertaPendentes.className = "alert-box alert-orange";
      alertaPendentes.innerHTML = `
        <p><strong>${denuncias.length} denúncias registradas</strong></p>
        <small>Verifique as mais recentes e priorize as urgentes</small>
      `;
      alertasContainer.appendChild(alertaPendentes);
    }

    const animaisDisponiveis = animais.filter(a => a.status === "Vacinado").length;
    if (animaisDisponiveis / animais.length > 0.7) {
      const alertaAbrigo = document.createElement("div");
      alertaAbrigo.className = "alert-box alert-red";
      alertaAbrigo.innerHTML = `
        <p><strong>Capacidade do abrigo alta!</strong></p>
        <small>Considere acelerar processos de adoção</small>
      `;
      alertasContainer.appendChild(alertaAbrigo);
    }

    const alertaSucesso = document.createElement("div");
    alertaSucesso.className = "alert-box alert-green";
    alertaSucesso.innerHTML = `
      <p><strong>${adocoes.length} adoções concluídas</strong></p>
      <small>Parabéns pela meta atingida!</small>
    `;
    alertasContainer.appendChild(alertaSucesso);

  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
}

carregarDashboard();

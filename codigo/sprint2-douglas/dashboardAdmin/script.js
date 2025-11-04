const dashboardData = {
  resumo: {
    novasDenuncias: 12,
    resgatesEmAndamento: 8,
    animaisParaAdocao: 23,
    adocoesConcluidas: 156
  },
  resumoSemanal: {
    denunciasRecebidas: 47,
    animaisResgatados: 35,
    adocoesRealizadas: 28
  },
  denuncias: [
    { protocolo: "ZP2024001", endereco: "Rua das Flores, 123 - Centro", data: "12/10/2024", status: "Pendente" },
    { protocolo: "ZP2024002", endereco: "Av. Principal, 456 - Jardim", data: "12/10/2024", status: "Em Andamento" },
    { protocolo: "ZP2024003", endereco: "Rua do Parque, 789 - Vila Nova", data: "11/10/2024", status: "Concluído" }
  ],
  alertas: {
    denunciasUrgentes: 3,
    capacidadeAbrigo: 85
  },
  conquistas: {
    metaAdocoesAtingida: true,
    novoRecordeResgates: true
  }
};

// Exemplo: preenchendo os elementos
document.getElementById("novas-denuncias").textContent = dashboardData.resumo.novasDenuncias;
document.getElementById("resgates-andamento").textContent = dashboardData.resumo.resgatesEmAndamento;
document.getElementById("animais-adocao").textContent = dashboardData.resumo.animaisParaAdocao;
document.getElementById("adocoes-concluidas").textContent = dashboardData.resumo.adocoesConcluidas;

// Tabela
const tableBody = document.querySelector("#tabela-denuncias tbody");
dashboardData.denuncias.forEach(d => {
  const row = `
    <tr>
      <td>${d.protocolo}</td>
      <td>${d.endereco}</td>
      <td>${d.data}</td>
      <td><span class="status ${d.status.toLowerCase().replace(' ', '-')}">${d.status}</span></td>
    </tr>`;
  tableBody.innerHTML += row;
});

setInterval(() => {
  dashboardData.resumo.novasDenuncias++;
  document.getElementById("novas-denuncias").textContent = dashboardData.resumo.novasDenuncias;
}, 5000);

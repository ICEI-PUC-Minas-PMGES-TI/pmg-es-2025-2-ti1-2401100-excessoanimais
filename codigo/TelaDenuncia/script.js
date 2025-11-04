document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formDenuncia");
  const tabela = document.getElementById("tabelaDenuncias");

  //  Função para carregar denúncias do servidor
  async function carregarDenuncias() {
    try {
      const response = await fetch("http://localhost:3000/denuncias");
      const denuncias = await response.json();

      if (denuncias.length === 0) {
        tabela.innerHTML = `<tr><td colspan="6" class="text-muted">Nenhuma denúncia registrada ainda...</td></tr>`;
        return;
      }

      tabela.innerHTML = denuncias.map(d => `
        <tr>
          <td>${d.dataEnvio}</td>
          <td>${d.tipo}</td>
          <td>${d.porte}</td>
          <td>${d.condicao}</td>
          <td>${d.endereco}</td>
          <td>${d.nome}</td>
        </tr>
      `).join("");
    } catch (error) {
      console.error("Erro ao carregar denúncias:", error);
    }
  }

  // Função para enviar denúncia
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const denuncia = {
      endereco: document.getElementById("endereco").value,
      referencia: document.getElementById("referencia").value,
      tipo: document.getElementById("tipo").value,
      porte: document.querySelector('input[name="porte"]:checked')?.value || "",
      condicao: document.getElementById("condicao").value,
      observacoes: document.getElementById("observacoes").value,
      nome: document.getElementById("nome").value,
      telefone: document.getElementById("telefone").value,
      email: document.getElementById("email").value,
      dataEnvio: new Date().toLocaleString("pt-BR")
    };

    try {
      const response = await fetch("http://localhost:3000/denuncias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(denuncia)
      });

      if (response.ok) {
        alert("✅ Denúncia enviada com sucesso!");
        form.reset();
        carregarDenuncias(); // Atualiza a lista automaticamente
      } else {
        alert("⚠️ Erro ao enviar denúncia.");
      }
    } catch (error) {
      alert("❌ Erro de conexão com o servidor.");
    }
  });

  carregarDenuncias(); // Carrega a lista ao iniciar
});

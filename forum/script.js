document.addEventListener("DOMContentLoaded", () => {
  // Estado Global
  let mapInst, mapAnimais;
  let markersInst = [],
    markersAnimais = [];
  let currentTopicId = null;

  // Ícones
  const iconInst = createLeafletIcon("blue");
  const iconAnimal = createLeafletIcon("orange");

  // Inicialização
  initTabs();
  initMapInstituicoes(); // Carrega a primeira aba por padrão

  // ==========================================
  // 1. Lógica de Abas (Tabs)
  // ==========================================
  function initTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        // UI Toggle
        document
          .querySelectorAll(".tab-btn")
          .forEach((b) => b.classList.remove("active"));
        document
          .querySelectorAll(".tab-content")
          .forEach((c) => c.classList.remove("active"));

        btn.classList.add("active");
        const target = document.getElementById(btn.dataset.target);
        target.classList.add("active");

        // Lazy Load de conteúdo
        if (btn.dataset.target === "view-instituicoes") {
          setTimeout(() => mapInst?.invalidateSize(), 100); // Fix Leaflet render
        }
        if (btn.dataset.target === "view-animais") {
          if (!mapAnimais) initMapAnimais();
          setTimeout(() => mapAnimais?.invalidateSize(), 100);
        }
        if (btn.dataset.target === "view-forum") {
          loadForum();
        }
      });
    });
  }

  // ==========================================
  // 2. Mapa de Instituições
  // ==========================================
  async function initMapInstituicoes() {
    if (mapInst) return; // Já inciado
    mapInst = L.map("map-inst").setView([-19.9167, -43.9345], 11);
    addTileLayer(mapInst);

    try {
      const data = await window.api.get("/instituicoes");
      renderMarkers(mapInst, data, markersInst, "list-inst", iconInst, "inst");
      document.getElementById("total-inst").textContent = data
        ? data.length
        : 0;
    } catch (e) {
      console.error(e);
    }
  }

  // ==========================================
  // 3. Mapa de Animais de Rua
  // ==========================================
  async function initMapAnimais() {
    mapAnimais = L.map("map-animais").setView([-19.9167, -43.9345], 12);
    addTileLayer(mapAnimais);
    loadAnimais();
  }

  async function loadAnimais() {
    try {
      // Se endpoint não existir, use array vazio para não quebrar
      const data = (await window.api.get("/animais_rua")) || [];

      // Adapter para coordenadas
      const adapted = data.map((a) => ({
        ...a,
        nome: `${a.especie} (${a.porte})`, // Padroniza nome para função genérica
        area: a.local_bairro || "Local não especificado",
        // Mock de GPS se não existir
        lat: a.lat || -19.9167 + (Math.random() - 0.5) * 0.1,
        lng: a.lng || -43.9345 + (Math.random() - 0.5) * 0.1,
      }));

      renderMarkers(
        mapAnimais,
        adapted,
        markersAnimais,
        "list-animais",
        iconAnimal,
        "animal"
      );
      document.getElementById("total-animais").textContent = adapted.length;
    } catch (e) {
      console.error("Erro animais:", e);
      document.getElementById("list-animais").innerHTML =
        "<p>Erro ao carregar.</p>";
    }
  }

  // ==========================================
  // 4. Cadastro de Animal
  // ==========================================
  document
    .getElementById("form-animal")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        especie: document.getElementById("cad-especie").value,
        porte: document.getElementById("cad-porte").value,
        qtd: document.getElementById("cad-qtd").value,
        cor: document.getElementById("cad-cor").value,
        local_bairro: document.getElementById("cad-local").value,
        obs: document.getElementById("cad-obs").value,
        data_registro: new Date().toISOString(),
      };

      try {
        await window.api.post("/animais_rua", payload);
        alert("Registro adicionado ao mapa com sucesso!");
        e.target.reset();
        // Vai para aba do mapa
        document.querySelector('[data-target="view-animais"]').click();
        loadAnimais(); // Recarrega
      } catch (error) {
        alert("Erro ao salvar.");
      }
    });

  // ==========================================
  // 5. Fórum
  // ==========================================
  async function loadForum() {
    const container = document.getElementById("forum-feed");
    container.innerHTML = '<p class="loading-text">Carregando...</p>';

    try {
      const topics = (await window.api.get("/forum")) || [];
      document.getElementById("stats-topics").textContent = topics.length;

      if (topics.length === 0) {
        container.innerHTML = "<p>Nenhum tópico ainda.</p>";
        return;
      }

      container.innerHTML = topics
        .map(
          (t) => `
                <div class="topic-card" onclick="openTopic(${t.id})">
                    <span class="topic-tag tag-${
                      t.tipo
                    }">${t.tipo.toUpperCase()}</span>
                    <h4>${t.titulo}</h4>
                    <p style="font-size:0.9rem; color:#666;">Por ${t.autor} • ${
            t.respostas ? t.respostas.length : 0
          } respostas</p>
                </div>
            `
        )
        .join("");
    } catch (e) {
      container.innerHTML = "<p>Erro ao carregar fórum.</p>";
    }
  }

  window.openTopic = async (id) => {
    const topic = (await window.api.get("/forum")).find((t) => t.id === id);
    if (!topic) return;

    currentTopicId = id;
    document.getElementById("modal-topic-title").textContent = topic.titulo;
    document.getElementById("modal-topic-body").textContent = topic.mensagem;

    const repliesContainer = document.getElementById("modal-topic-replies");
    repliesContainer.innerHTML =
      (topic.respostas || [])
        .map(
          (r) => `
            <div class="reply-item"><strong>${r.autor}:</strong> ${r.msg}</div>
        `
        )
        .join("") || "<p>Seja o primeiro a responder.</p>";

    document.getElementById("modal-topic").style.display = "flex";
  };

  // Nova Resposta
  document
    .getElementById("form-reply")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const topic = (await window.api.get("/forum")).find(
        (t) => t.id === currentTopicId
      );

      const newReply = {
        autor: document.getElementById("reply-author").value,
        msg: document.getElementById("reply-msg").value,
        data: new Date().toISOString(),
      };

      const updatedReplies = [...(topic.respostas || []), newReply];

      await window.api.update(`/forum/${currentTopicId}`, {
        respostas: updatedReplies,
      });

      document.getElementById("reply-msg").value = "";
      openTopic(currentTopicId); // Recarrega modal
    });

  // Novo Tópico
  document.getElementById("btn-new-topic").onclick = () => {
    document.getElementById("modal-new-topic").style.display = "flex";
  };

  document
    .getElementById("form-new-topic")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        titulo: document.getElementById("new-topic-title").value,
        tipo: document.getElementById("new-topic-type").value,
        mensagem: document.getElementById("new-topic-msg").value,
        autor: document.getElementById("new-topic-author").value,
        respostas: [],
      };
      await window.api.post("/forum", payload);
      document.getElementById("modal-new-topic").style.display = "none";
      loadForum();
      e.target.reset();
    });

  // ==========================================
  // Helpers & Utilitários
  // ==========================================

  // Renderizador Genérico de Mapa (Strategy Pattern simplificado)
  function renderMarkers(mapObj, dataList, markersArray, listId, icon, type) {
    // Limpa
    markersArray.forEach((m) => mapObj.removeLayer(m));
    markersArray.length = 0;
    const listContainer = document.getElementById(listId);
    listContainer.innerHTML = "";

    dataList.forEach((item) => {
      // Adapter de dados (instituição tem 'orgao', animal tem 'especie')
      const title = item.orgao || item.nome || item.titulo;
      const subtitle = item.area || item.local_bairro;

      // Mock Coordinates se necessário
      const lat =
        item.lat || item.latitude || -19.9167 + (Math.random() - 0.5) * 0.1;
      const lng =
        item.lng || item.longitude || -43.9345 + (Math.random() - 0.5) * 0.1;

      // Marcador
      const marker = L.marker([lat, lng], { icon: icon })
        .addTo(mapObj)
        .bindPopup(`<b>${title}</b><br>${subtitle}`);
      markersArray.push(marker);

      // Lista Lateral
      const card = document.createElement("div");
      card.className = "list-card";
      card.innerHTML = `<strong>${title}</strong><br><small>${subtitle}</small>`;
      card.onclick = () => {
        mapObj.setView([lat, lng], 14);
        marker.openPopup();
        document
          .querySelectorAll(`#${listId} .list-card`)
          .forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
      };
      listContainer.appendChild(card);
    });
  }

  function createLeafletIcon(color) {
    return L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  function addTileLayer(mapObj) {
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(mapObj);
  }

  // Fechar Modais
  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.onclick = () =>
      document
        .querySelectorAll(".modal")
        .forEach((m) => (m.style.display = "none"));
  });
  window.onclick = (e) => {
    if (e.target.classList.contains("modal")) e.target.style.display = "none";
  };
});

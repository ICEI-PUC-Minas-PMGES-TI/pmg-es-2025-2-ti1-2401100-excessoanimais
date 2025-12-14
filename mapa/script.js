document.addEventListener("DOMContentLoaded", () => {
  // Variáveis de Estado
  let map;
  let markers = [];
  let allData = [];

  // Configuração do Ícone do Mapa
  const iconMarker = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // 1. Inicializa o Mapa
  function initMap() {
    // Coordenadas centrais de Belo Horizonte
    const bhCoords = [-19.9167, -43.9345];

    map = L.map("map-container").setView(bhCoords, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors | ZooPet",
    }).addTo(map);

    loadData();
  }

  // 2. Carrega Dados da API
  async function loadData() {
    try {
      // Busca dados reais do json-server
      const rawData = await window.api.get("/instituicoes");

      if (!rawData) throw new Error("Sem dados");

      // ADAPTAÇÃO: Transforma dados do banco para formato do mapa
      allData = rawData.map(adaptarParaMapa);

      renderMapPoints(allData);
      populateFilters(allData);
      updateStats(allData);
    } catch (error) {
      console.error("Erro ao carregar mapa:", error);
      document.getElementById("institutions-list").innerHTML =
        '<div style="padding:20px; text-align:center; color:#d63031;">Erro ao carregar instituições.<br>Verifique se o servidor está rodando.</div>';
    }
  }

  // 3. Adapter (Converte DB -> Mapa)
  function adaptarParaMapa(item) {
    // Ponto central de BH para gerar coordenadas fictícias próximas
    const latBase = -19.9167;
    const lngBase = -43.9345;

    // Se o banco não tiver lat/lng, gera aleatório num raio pequeno para demonstração
    // Isso garante que os pinos apareçam mesmo sem GPS real cadastrado
    const lat = item.latitude || latBase + (Math.random() - 0.5) * 0.15;
    const lng = item.longitude || lngBase + (Math.random() - 0.5) * 0.15;

    return {
      id: item.id,
      nome: item.orgao, // Mapeia 'orgao' -> 'nome'
      area: item.area || "Região Metropolitana",
      telefone: item.telefone || "Não informado",
      lat: lat,
      lng: lng,
      endereco: item.endereco || `${item.area}, Belo Horizonte`,
    };
  }

  // 4. Renderiza Marcadores e Lista
  function renderMapPoints(lista) {
    // Limpa marcadores antigos
    markers.forEach((m) => map.removeLayer(m));
    markers = [];

    const listContainer = document.getElementById("institutions-list");
    listContainer.innerHTML = "";

    if (lista.length === 0) {
      listContainer.innerHTML =
        '<p style="padding:20px; text-align:center;">Nenhuma instituição encontrada.</p>';
      return;
    }

    lista.forEach((inst) => {
      // Cria Marcador no Mapa
      const marker = L.marker([inst.lat, inst.lng], { icon: iconMarker }).addTo(
        map
      ).bindPopup(`
                    <div style="text-align:center; min-width: 150px;">
                        <h3 style="margin:0 0 5px 0; color:#2C3E50; font-size:16px;">${inst.nome}</h3>
                        <p style="margin:5px 0; font-size:13px;">${inst.area}</p>
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${inst.lat},${inst.lng}" 
                           target="_blank" 
                           style="display:inline-block; margin-top:5px; color:white; background:#27ae60; padding:5px 10px; border-radius:4px; text-decoration:none; font-size:12px;">
                           Traçar Rota
                        </a>
                    </div>
                `);

      markers.push(marker);

      // Cria Card na Lista Lateral
      const card = document.createElement("div");
      card.className = "inst-card";
      card.innerHTML = `
                <div class="inst-name">${inst.nome}</div>
                <div class="inst-meta">📍 ${inst.area}</div>
                <div class="inst-meta">📞 ${inst.telefone}</div>
            `;

      // Interação ao clicar na lista
      card.onclick = () => {
        // Remove active de todos e adiciona neste
        document
          .querySelectorAll(".inst-card")
          .forEach((c) => c.classList.remove("active"));
        card.classList.add("active");

        // Move mapa e abre popup
        map.setView([inst.lat, inst.lng], 14);
        marker.openPopup();
      };

      listContainer.appendChild(card);
    });

    // Ajusta zoom para caber todos os pontos
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  // 5. Filtros
  function populateFilters(data) {
    const select = document.getElementById("area-filter");
    const areas = [...new Set(data.map((i) => i.area))].sort();

    select.innerHTML = '<option value="">Todas as Áreas</option>';
    areas.forEach((area) => {
      const opt = document.createElement("option");
      opt.value = area;
      opt.textContent = area;
      select.appendChild(opt);
    });
  }

  function applyFilters() {
    const searchTerm = document
      .getElementById("search-input")
      .value.toLowerCase();
    const areaTerm = document.getElementById("area-filter").value;

    const filtered = allData.filter((item) => {
      const matchSearch =
        item.nome.toLowerCase().includes(searchTerm) ||
        item.area.toLowerCase().includes(searchTerm);
      const matchArea = areaTerm ? item.area === areaTerm : true;
      return matchSearch && matchArea;
    });

    renderMapPoints(filtered);
    updateStats(filtered);
  }

  function updateStats(data) {
    document.getElementById("total-inst").textContent = data.length;
    const area = document.getElementById("area-filter").value;
    document.getElementById("active-area").textContent = area || "Todas";
  }

  // Event Listeners
  document
    .getElementById("search-input")
    .addEventListener("input", applyFilters);
  document
    .getElementById("area-filter")
    .addEventListener("change", applyFilters);
  document.getElementById("btn-reset").addEventListener("click", () => {
    document.getElementById("search-input").value = "";
    document.getElementById("area-filter").value = "";
    applyFilters();
    map.setView([-19.9167, -43.9345], 12);
  });

  // Iniciar
  initMap();
});

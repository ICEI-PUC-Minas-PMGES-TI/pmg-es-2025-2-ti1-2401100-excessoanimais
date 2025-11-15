// URLs da API JSONServer
const API_INSTITUICOES = 'http://localhost:3000/instituicoes';

// Mapas
let map;
let markers = [];
let currentInstitution = null;
let allInstitutions = [];

// Ícone personalizado (azul)
const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function initMapInstituicoes() {
  map = L.map('map').setView([-19.9167, -43.9345], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap | ZooPet'
  }).addTo(map);
  loadInstitutions();
}

async function loadInstitutions() {
  try {
    const response = await fetch(API_INSTITUICOES);
    if (!response.ok) throw new Error('Erro ao carregar instituições');
    allInstitutions = await response.json();
    renderInstitutions(allInstitutions);
    populateCityFilter();
    console.log('✅ Instituições carregadas:', allInstitutions.length);
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao carregar instituições. Verifique se o JSONServer está rodando.');
  }
}

function renderInstitutions(institutions) {
  if (!map) return;
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  const list = document.getElementById('institutionsList');
  if (list) list.innerHTML = '';

  const totalEl = document.getElementById('totalInstitutions');
  if (totalEl) totalEl.textContent = institutions.length;

  if (institutions.length === 0) {
    if (list) list.innerHTML = '<div style="padding:20px;text-align:center;color:#0066cc;">Nenhuma instituição encontrada</div>';
    return;
  }

  institutions.forEach(inst => {
    if (!inst.coordenadas) return;

    const marker = L.marker([inst.coordenadas.latitude, inst.coordenadas.longitude], { icon: blueIcon })
      .addTo(map)
      .bindPopup(`
        <div class="popup-content">
          <div class="popup-title">${inst.nome}</div>
          <div class="popup-info">
            📍 ${inst.endereco.rua}, ${inst.endereco.numero}<br>
            ${inst.endereco.bairro} - ${inst.endereco.cidade}/${inst.endereco.estado}<br>
            📞 ${inst.telefone}
          </div>
        </div>
      `);

    marker.on('click', () => showDetail(inst));
    markers.push(marker);

    if (list) {
      const card = document.createElement('div');
      card.className = 'institution-card';
      card.innerHTML = `
        <div class="institution-name">${inst.nome}</div>
        <div class="institution-info">
          <div><strong>📍</strong> ${inst.endereco.cidade}/${inst.endereco.estado}</div>
          <div><strong>📞</strong> ${inst.telefone}</div>
        </div>
      `;
      card.onclick = () => {
        showDetail(inst);
        map.setView([inst.coordenadas.latitude, inst.coordenadas.longitude], 13);
        document.querySelectorAll('.institution-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      };
      list.appendChild(card);
    }
  });

  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

function showDetail(inst) {
  currentInstitution = inst;
  const detailPanel = document.getElementById('detailPanel');
  if (!detailPanel) return;

  document.getElementById('detailName').textContent = inst.nome;
  document.getElementById('detailAddress').textContent =
    `${inst.endereco.rua}, ${inst.endereco.numero} - ${inst.endereco.bairro}, ${inst.endereco.cidade}/${inst.endereco.estado}`;
  document.getElementById('detailPhone').textContent = inst.telefone;
  document.getElementById('detailEmail').textContent = inst.email || '-';
  document.getElementById('detailSchedule').textContent = inst.horario || '-';
  document.getElementById('detailArea').textContent = inst.areaAtuacao || '-';

  detailPanel.classList.add('active');
  const list = document.getElementById('institutionsList');
  if (list) list.style.display = 'none';
}

function closeDetail() {
  const detailPanel = document.getElementById('detailPanel');
  if (detailPanel) detailPanel.classList.remove('active');
  const list = document.getElementById('institutionsList');
  if (list) list.style.display = 'block';
  currentInstitution = null;
  document.querySelectorAll('.institution-card').forEach(c => c.classList.remove('active'));
}

function openGoogleMaps() {
  if (!currentInstitution) return;
  const { latitude, longitude } = currentInstitution.coordenadas;
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
}

function applyFilters() {
  const searchInput = document.getElementById('searchInput');
  const stateSelect = document.getElementById('stateFilter');
  const citySelect = document.getElementById('cityFilter');
  if (!searchInput || !stateSelect || !citySelect) return;

  const searchTerm = searchInput.value.toLowerCase();
  const stateFilter = stateSelect.value;
  const cityFilter = citySelect.value;

  const filtered = allInstitutions.filter(inst => {
    const matchSearch = !searchTerm ||
      inst.endereco.cidade.toLowerCase().includes(searchTerm) ||
      inst.endereco.bairro.toLowerCase().includes(searchTerm) ||
      inst.nome.toLowerCase().includes(searchTerm);
    const matchState = !stateFilter || inst.endereco.estado === stateFilter;
    const matchCity = !cityFilter || inst.endereco.cidade === cityFilter;
    return matchSearch && matchState && matchCity;
  });

  renderInstitutions(filtered);
  const selState = document.getElementById('selectedState');
  const selCity = document.getElementById('selectedCity');
  if (selState) selState.textContent = stateFilter || 'Todas';
  if (selCity) selCity.textContent = cityFilter || 'Todas';
}

function populateCityFilter() {
  const stateFilter = document.getElementById('stateFilter')?.value || '';
  const cityFilter = document.getElementById('cityFilter');
  if (!cityFilter) return;

  const cities = [...new Set(
    allInstitutions
      .filter(inst => !stateFilter || inst.endereco.estado === stateFilter)
      .map(inst => inst.endereco.cidade)
  )].sort();

  cityFilter.innerHTML = '<option value="">Todas as Cidades</option>';
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });
}

function clearFilters() {
  const searchInput = document.getElementById('searchInput');
  const stateFilter = document.getElementById('stateFilter');
  const cityFilter = document.getElementById('cityFilter');
  if (searchInput) searchInput.value = '';
  if (stateFilter) stateFilter.value = '';
  if (cityFilter) cityFilter.value = '';
  populateCityFilter();
  applyFilters();
  closeDetail();
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 ZooPet - Mapa de Instituições iniciado');
  initMapInstituicoes();

  // Listeners (com guarda)
  const searchInput = document.getElementById('searchInput');
  const stateFilter = document.getElementById('stateFilter');
  const cityFilter = document.getElementById('cityFilter');
  const clearBtn = document.getElementById('clearFiltersBtn');
  const closeDetailBtn = document.getElementById('closeDetailBtn');
  const routeBtn = document.getElementById('routeBtn');

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (stateFilter) stateFilter.addEventListener('change', () => { populateCityFilter(); applyFilters(); });
  if (cityFilter) cityFilter.addEventListener('change', applyFilters);
  if (clearBtn) clearBtn.addEventListener('click', clearFilters);
  if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeDetail);
  if (routeBtn) routeBtn.addEventListener('click', openGoogleMaps);
});

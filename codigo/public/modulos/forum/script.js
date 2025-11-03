// URLs da API JSONServer
const API_INSTITUICOES = 'http://localhost:3000/instituicoes';
const API_ANIMAIS = 'http://localhost:3000/animais_rua';
const API_FORUM = 'http://localhost:3000/forum';

// Mapas
let map, mapAnimais;
let markers = [];
let markersAnimais = [];
let currentInstitution = null;
let currentAnimal = null;
let allInstitutions = [];
let allAnimais = [];
let allTopics = [];
let currentTopic = null;

// Ícones personalizados
const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// ==================== NAVEGAÇÃO ENTRE VIEWS ====================

function showView(viewName) {
  // Atualizar botões
  document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  // Esconder todas as views
  document.querySelectorAll('.view-content').forEach(view => view.classList.remove('active'));

  // Mostrar view selecionada
  if (viewName === 'instituicoes') {
    document.getElementById('viewInstituicoes').classList.add('active');
    if (!map) initMapInstituicoes();
  } else if (viewName === 'animais') {
    document.getElementById('viewAnimais').classList.add('active');
    if (!mapAnimais) initMapAnimais();
    loadAnimais();
  } else if (viewName === 'cadastro') {
    document.getElementById('viewCadastro').classList.add('active');
  } else if (viewName === 'forum') {
    document.getElementById('viewForum').classList.add('active');
    loadForum();
  }
}

// ==================== MAPA DE INSTITUIÇÕES ====================

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
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  const list = document.getElementById('institutionsList');
  list.innerHTML = '';

  document.getElementById('totalInstitutions').textContent = institutions.length;

  if (institutions.length === 0) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:#0066cc;">Nenhuma instituição encontrada</div>';
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
  });

  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

function showDetail(inst) {
  currentInstitution = inst;
  document.getElementById('detailName').textContent = inst.nome;
  document.getElementById('detailAddress').textContent =
    `${inst.endereco.rua}, ${inst.endereco.numero} - ${inst.endereco.bairro}, ${inst.endereco.cidade}/${inst.endereco.estado}`;
  document.getElementById('detailPhone').textContent = inst.telefone;
  document.getElementById('detailEmail').textContent = inst.email || '-';
  document.getElementById('detailSchedule').textContent = inst.horario || '-';
  document.getElementById('detailArea').textContent = inst.areaAtuacao || '-';

  document.getElementById('detailPanel').classList.add('active');
  document.getElementById('institutionsList').style.display = 'none';
}

function closeDetail() {
  document.getElementById('detailPanel').classList.remove('active');
  document.getElementById('institutionsList').style.display = 'block';
  currentInstitution = null;
  document.querySelectorAll('.institution-card').forEach(c => c.classList.remove('active'));
}

function openGoogleMaps() {
  if (!currentInstitution) return;
  const { latitude, longitude } = currentInstitution.coordenadas;
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const stateFilter = document.getElementById('stateFilter').value;
  const cityFilter = document.getElementById('cityFilter').value;

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
  document.getElementById('selectedState').textContent = stateFilter || 'Todas';
  document.getElementById('selectedCity').textContent = cityFilter || 'Todas';
}

function populateCityFilter() {
  const stateFilter = document.getElementById('stateFilter').value;
  const cityFilter = document.getElementById('cityFilter');

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
  document.getElementById('searchInput').value = '';
  document.getElementById('stateFilter').value = '';
  document.getElementById('cityFilter').value = '';
  populateCityFilter();
  applyFilters();
  closeDetail();
}

// ==================== MAPA DE ANIMAIS ====================

function initMapAnimais() {
  mapAnimais = L.map('mapAnimais').setView([-19.9167, -43.9345], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap | ZooPet'
  }).addTo(mapAnimais);
}

async function loadAnimais() {
  try {
    const response = await fetch(API_ANIMAIS);
    if (!response.ok) throw new Error('Erro ao carregar animais');
    allAnimais = await response.json();
    renderAnimais(allAnimais);
    updateAnimaisStats(allAnimais);
    console.log('✅ Animais carregados:', allAnimais.length);
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao carregar registros de animais.');
  }
}

function renderAnimais(animais) {
  markersAnimais.forEach(marker => mapAnimais.removeLayer(marker));
  markersAnimais = [];

  const list = document.getElementById('animaisList');
  list.innerHTML = '';

  if (animais.length === 0) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:#0066cc;">Nenhum registro encontrado</div>';
    return;
  }

  animais.forEach(animal => {
    if (!animal.coordenadas) return;

    const marker = L.marker([animal.coordenadas.latitude, animal.coordenadas.longitude], { icon: orangeIcon })
      .addTo(mapAnimais)
      .bindPopup(`
        <div class="popup-content">
          <div class="popup-title">${animal.especie} - ${animal.porte}</div>
          <div class="popup-info">
            📍 ${animal.local.bairro}, ${animal.local.cidade}/${animal.local.estado}<br>
            🐾 Quantidade: ${animal.quantidade}<br>
            🎨 Cor: ${animal.cor}
          </div>
        </div>
      `);

    marker.on('click', () => showAnimalDetail(animal));
    markersAnimais.push(marker);

    const card = document.createElement('div');
    card.className = 'animal-card';
    card.innerHTML = `
      <div class="animal-name">${animal.especie} ${animal.porte} - ${animal.cor}</div>
      <div class="animal-info">
        <div><strong>📍</strong> ${animal.local.cidade}/${animal.local.estado}</div>
        <div><strong>🐾</strong> Quantidade: ${animal.quantidade}</div>
        <div><strong>⚧</strong> ${animal.sexo}</div>
      </div>
    `;
    card.onclick = () => {
      showAnimalDetail(animal);
      mapAnimais.setView([animal.coordenadas.latitude, animal.coordenadas.longitude], 13);
      document.querySelectorAll('.animal-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    };
    list.appendChild(card);
  });

  if (markersAnimais.length > 0) {
    const group = L.featureGroup(markersAnimais);
    mapAnimais.fitBounds(group.getBounds().pad(0.1));
  }
}

function updateAnimaisStats(animais) {
  document.getElementById('totalAnimais').textContent = animais.length;

  // Porte predominante
  const portes = animais.map(a => a.porte);
  const porteMaisComum = portes.sort((a, b) =>
    portes.filter(v => v === a).length - portes.filter(v => v === b).length
  ).pop();
  document.getElementById('portePredominante').textContent = porteMaisComum || '-';

  // Espécie predominante
  const especies = animais.map(a => a.especie);
  const especieMaisComum = especies.sort((a, b) =>
    especies.filter(v => v === a).length - especies.filter(v => v === b).length
  ).pop();
  document.getElementById('especiePredominante').textContent = especieMaisComum || '-';
}

function showAnimalDetail(animal) {
  currentAnimal = animal;
  document.getElementById('animalDetailTitle').textContent = `${animal.especie} - ${animal.porte}`;
  document.getElementById('animalEspecie').textContent = animal.especie;
  document.getElementById('animalPorte').textContent = animal.porte;
  document.getElementById('animalSexo').textContent = animal.sexo;
  document.getElementById('animalCor').textContent = animal.cor;
  document.getElementById('animalQuantidade').textContent = animal.quantidade;
  document.getElementById('animalLocal').textContent =
    `${animal.local.endereco}, ${animal.local.bairro}, ${animal.local.cidade}/${animal.local.estado}`;
  document.getElementById('animalObs').textContent = animal.observacoes || 'Sem observações';

  document.getElementById('animalDetailPanel').classList.add('active');
  document.getElementById('animaisList').style.display = 'none';
}

function closeAnimalDetail() {
  document.getElementById('animalDetailPanel').classList.remove('active');
  document.getElementById('animaisList').style.display = 'block';
  currentAnimal = null;
  document.querySelectorAll('.animal-card').forEach(c => c.classList.remove('active'));
}

function applyAnimaisFilters() {
  const especieFilter = document.getElementById('especieFilter').value;
  const porteFilter = document.getElementById('porteFilter').value;
  const sexoFilter = document.getElementById('sexoFilter').value;

  const filtered = allAnimais.filter(animal => {
    const matchEspecie = !especieFilter || animal.especie === especieFilter;
    const matchPorte = !porteFilter || animal.porte === porteFilter;
    const matchSexo = !sexoFilter || animal.sexo === sexoFilter;
    return matchEspecie && matchPorte && matchSexo;
  });

  renderAnimais(filtered);
  updateAnimaisStats(filtered);
}

function clearAnimaisFilters() {
  document.getElementById('especieFilter').value = '';
  document.getElementById('porteFilter').value = '';
  document.getElementById('sexoFilter').value = '';
  renderAnimais(allAnimais);
  updateAnimaisStats(allAnimais);
}

// ==================== CRUD DE ANIMAIS ====================

async function editAnimal() {
  if (!currentAnimal) return;
  
  // Preencher formulário com dados atuais
  document.getElementById('especie').value = currentAnimal.especie;
  document.getElementById('porte').value = currentAnimal.porte;
  document.getElementById('sexo').value = currentAnimal.sexo;
  document.getElementById('cor').value = currentAnimal.cor;
  document.getElementById('quantidade').value = currentAnimal.quantidade;
  document.getElementById('endereco').value = currentAnimal.local.endereco;
  document.getElementById('bairro').value = currentAnimal.local.bairro;
  document.getElementById('cidade').value = currentAnimal.local.cidade;
  document.getElementById('estado').value = currentAnimal.local.estado;
  document.getElementById('latitude').value = currentAnimal.coordenadas.latitude;
  document.getElementById('longitude').value = currentAnimal.coordenadas.longitude;
  document.getElementById('observacoes').value = currentAnimal.observacoes;

  // Mudar para view de cadastro
  showView('cadastro');
  document.querySelector('.toggle-btn:nth-child(3)').classList.add('active');
}

async function deleteAnimal() {
  if (!currentAnimal) return;
  
  if (!confirm('Tem certeza que deseja excluir este registro?')) return;

  try {
    const response = await fetch(`${API_ANIMAIS}/${currentAnimal.id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Erro ao excluir');

    alert('✅ Registro excluído com sucesso!');
    closeAnimalDetail();
    loadAnimais();
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao excluir registro.');
  }
}

function resetForm() {
  document.getElementById('animalForm').reset();
  currentAnimal = null;
}

// ==================== EVENT LISTENERS ====================

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('stateFilter').addEventListener('change', () => {
  populateCityFilter();
  applyFilters();
});
document.getElementById('cityFilter').addEventListener('change', applyFilters);

document.getElementById('especieFilter').addEventListener('change', applyAnimaisFilters);
document.getElementById('porteFilter').addEventListener('change', applyAnimaisFilters);
document.getElementById('sexoFilter').addEventListener('change', applyAnimaisFilters);

document.getElementById('animalForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    especie: document.getElementById('especie').value,
    porte: document.getElementById('porte').value,
    sexo: document.getElementById('sexo').value,
    cor: document.getElementById('cor').value,
    quantidade: document.getElementById('quantidade').value,
    local: {
      endereco: document.getElementById('endereco').value,
      bairro: document.getElementById('bairro').value,
      cidade: document.getElementById('cidade').value,
      estado: document.getElementById('estado').value
    },
    coordenadas: {
      latitude: parseFloat(document.getElementById('latitude').value) || -19.9167,
      longitude: parseFloat(document.getElementById('longitude').value) || -43.9345
    },
    observacoes: document.getElementById('observacoes').value,
    data_registro: new Date().toISOString(),
    status: 'ativo'
  };

  try {
    const method = currentAnimal ? 'PUT' : 'POST';
    const url = currentAnimal ? `${API_ANIMAIS}/${currentAnimal.id}` : API_ANIMAIS;

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Erro ao salvar');

    alert('✅ Registro salvo com sucesso!');
    resetForm();
    showView('animais');
    document.querySelector('.toggle-btn:nth-child(2)').click();
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao salvar registro.');
  }
});

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 ZooPet - Sistema iniciado');
  initMapInstituicoes();
});

// ==================== FÓRUM COMUNITÁRIO ====================

async function loadForum() {
  try {
    const response = await fetch(API_FORUM);
    if (!response.ok) throw new Error('Erro ao carregar fórum');
    allTopics = await response.json();
    renderTopics(allTopics);
    updateForumStats();
    console.log('✅ Fórum carregado:', allTopics.length);
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao carregar fórum.');
  }
}

function renderTopics(topics) {
  const container = document.getElementById('forumTopics');
  container.innerHTML = '';

  if (topics.length === 0) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#0066cc;font-size:16px;">Nenhum tópico encontrado. Seja o primeiro a publicar!</div>';
    return;
  }

  topics.forEach(topic => {
    const card = document.createElement('div');
    card.className = 'topic-card';
    
    const tipoLabel = {
      avistamento: '🔍 Avistamento',
      denuncia: '⚠️ Denúncia',
      ajuda: '🆘 Pedido de Ajuda',
      dica: '💡 Dica/Orientação'
    };

    const preview = topic.mensagem.length > 150 
      ? topic.mensagem.substring(0, 150) + '...' 
      : topic.mensagem;

    const replyCount = topic.respostas ? topic.respostas.length : 0;
    const dataFormatada = new Date(topic.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    card.innerHTML = `
      <div class="topic-type ${topic.tipo}">${tipoLabel[topic.tipo] || topic.tipo}</div>
      <h3>${topic.titulo}</h3>
      <div class="topic-preview">${preview}</div>
      <div class="topic-meta">
        <span class="topic-author">👤 ${topic.autor}</span>
        <span class="topic-date">📅 ${dataFormatada}</span>
        <span class="topic-location">📍 ${topic.localizacao.bairro}, ${topic.localizacao.cidade}/${topic.localizacao.estado}</span>
        <span class="reply-count">💬 ${replyCount} respostas</span>
      </div>
    `;

    card.onclick = () => showTopicDetail(topic);
    container.appendChild(card);
  });
}

function updateForumStats() {
  document.getElementById('totalTopics').textContent = allTopics.length;
  const totalReplies = allTopics.reduce((sum, topic) => {
    return sum + (topic.respostas ? topic.respostas.length : 0);
  }, 0);
  document.getElementById('totalReplies').textContent = totalReplies;
}

function toggleNovoTopico() {
  const form = document.getElementById('novoTopicoForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function showTopicDetail(topic) {
  currentTopic = topic;
  
  const tipoLabel = {
    avistamento: '🔍 Avistamento',
    denuncia: '⚠️ Denúncia',
    ajuda: '🆘 Pedido de Ajuda',
    dica: '💡 Dica/Orientação'
  };

  const dataFormatada = new Date(topic.data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  document.getElementById('modalTopicTitle').textContent = `${tipoLabel[topic.tipo]} - ${topic.titulo}`;
  document.getElementById('modalAutor').textContent = `👤 ${topic.autor}`;
  document.getElementById('modalData').textContent = `📅 ${dataFormatada}`;
  document.getElementById('modalLocation').textContent = 
    `📍 ${topic.localizacao.bairro}, ${topic.localizacao.cidade}/${topic.localizacao.estado}`;
  document.getElementById('modalMensagem').textContent = topic.mensagem;

  // Renderizar respostas
  const repliesList = document.getElementById('repliesList');
  const replyCount = document.getElementById('replyCount');
  
  replyCount.textContent = topic.respostas ? topic.respostas.length : 0;
  repliesList.innerHTML = '';

  if (topic.respostas && topic.respostas.length > 0) {
    topic.respostas.forEach(reply => {
      const dataReply = new Date(reply.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const replyDiv = document.createElement('div');
      replyDiv.className = 'reply-item';
      replyDiv.innerHTML = `
        <div class="reply-author">👤 ${reply.autor}</div>
        <div class="reply-text">${reply.mensagem}</div>
        <div class="reply-date">📅 ${dataReply}</div>
      `;
      repliesList.appendChild(replyDiv);
    });
  } else {
    repliesList.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">Nenhuma resposta ainda. Seja o primeiro a responder!</div>';
  }

  // Limpar campos de resposta
  document.getElementById('replyAutor').value = '';
  document.getElementById('replyMensagem').value = '';

  document.getElementById('topicModal').classList.add('active');
}

function closeTopicModal() {
  document.getElementById('topicModal').classList.remove('active');
  currentTopic = null;
}

async function addReply() {
  if (!currentTopic) return;

  const autor = document.getElementById('replyAutor').value.trim();
  const mensagem = document.getElementById('replyMensagem').value.trim();

  if (!autor || !mensagem) {
    alert('Por favor, preencha seu nome e mensagem.');
    return;
  }

  const novaResposta = {
    id: currentTopic.respostas ? currentTopic.respostas.length + 1 : 1,
    autor: autor,
    mensagem: mensagem,
    data: new Date().toISOString()
  };

  const respostasAtualizadas = currentTopic.respostas 
    ? [...currentTopic.respostas, novaResposta]
    : [novaResposta];

  try {
    const response = await fetch(`${API_FORUM}/${currentTopic.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respostas: respostasAtualizadas })
    });

    if (!response.ok) throw new Error('Erro ao adicionar resposta');

    const updatedTopic = await response.json();
    alert('✅ Resposta enviada com sucesso!');
    
    // Atualizar currentTopic e recarregar
    currentTopic = updatedTopic;
    loadForum();
    showTopicDetail(updatedTopic);
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao enviar resposta.');
  }
}

function applyForumFilters() {
  const tipoFilter = document.getElementById('tipoFilter').value;

  const filtered = tipoFilter 
    ? allTopics.filter(topic => topic.tipo === tipoFilter)
    : allTopics;

  renderTopics(filtered);
}

function clearForumFilters() {
  document.getElementById('tipoFilter').value = '';
  renderTopics(allTopics);
}

// Event Listeners do Fórum
document.getElementById('tipoFilter').addEventListener('change', applyForumFilters);

document.getElementById('forumForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    autor: document.getElementById('autorForum').value,
    tipo: document.getElementById('tipoTopico').value,
    titulo: document.getElementById('tituloForum').value,
    mensagem: document.getElementById('mensagemForum').value,
    localizacao: {
      bairro: document.getElementById('bairroForum').value,
      cidade: document.getElementById('cidadeForum').value,
      estado: document.getElementById('estadoForum').value
    },
    data: new Date().toISOString(),
    respostas: [],
    status: 'ativo'
  };

  try {
    const response = await fetch(API_FORUM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Erro ao publicar');

    alert('✅ Publicação criada com sucesso!');
    document.getElementById('forumForm').reset();
    //toggleNovoTopico(); // (opcional)
    loadForum();
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao criar publicação.');
  }
});

// Fechar modal ao clicar fora
window.onclick = function(event) {
  const modal = document.getElementById('topicModal');
  if (event.target === modal) {
    closeTopicModal();
  }
};

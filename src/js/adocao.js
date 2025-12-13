document.addEventListener("DOMContentLoaded", async () => {
  const animalsContainer = document.getElementById("animals-container");
  const searchInput = document.getElementById("search");
  const animalCount = document.getElementById("animal-count");
  const applyFiltersBtn = document.getElementById("apply-filters");
  const clearFiltersBtn = document.getElementById("clear-filters");

  let allAnimals = [];

  async function loadAnimals() {
    try {
      animalsContainer.innerHTML = '<p style="text-align:center; width:100%;">Carregando amigos...</p>';
      
      const data = await window.api.get('/animais');
      
      allAnimals = data.filter(a => a.status !== 'adotado');
      
      renderAnimals(allAnimals);
    } catch (error) {
      console.error(error);
      animalsContainer.innerHTML = '<p>Erro ao carregar animais.</p>';
    }
  }

  function renderAnimals(lista) {
    animalsContainer.innerHTML = "";
    animalCount.textContent = `${lista.length} animais encontrados`;

    if (lista.length === 0) {
      animalsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #f9f9f9; border-radius: 10px;">
          <h3>Nenhum animal encontrado 😢</h3>
          <p>Tente mudar os filtros.</p>
        </div>
      `;
      return;
    }

    lista.forEach((animal) => {
      const card = document.createElement("div");
      card.className = "animal-card";

      const imgUrl = animal.imagem || '../../assets/images/placeholder.png';

      card.innerHTML = `
        <img src="${imgUrl}" class="animal-image" onerror="this.src='https://via.placeholder.com/300?text=Sem+Foto'">
        <div class="animal-info">
          <h3>${animal.nome}</h3>
          <p class="animal-description">${animal.descricao || 'Sem descrição.'}</p>
          
          <div class="animal-details">
            <span class="animal-detail">${animal.especie}</span>
            <span class="animal-detail">${animal.sexo}</span>
            <span class="animal-detail">${animal.idade}</span>
            <span class="animal-detail">${animal.porte}</span>
          </div>
          
          <button class="btn btn-primary" style="margin-top: 15px; width: 100%;" onclick="alert('Entre em contato com a Zoonoses para adotar o(a) ${animal.nome}!')">Quero Adotar</button>
        </div>
      `;
      animalsContainer.appendChild(card);
    });
  }

  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const getCheckedValues = (name) => {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
    };

    const selectedSpecies = getCheckedValues('especie');
    const selectedSex = getCheckedValues('sexo');
    const selectedPorte = getCheckedValues('porte');

    const filtered = allAnimals.filter((animal) => {
      const matchesSearch = !searchTerm || animal.nome.toLowerCase().includes(searchTerm);

      const matchesSpecies = selectedSpecies.length === 0 || selectedSpecies.includes(animal.especie);
      const matchesSex = selectedSex.length === 0 || selectedSex.includes(animal.sexo);
      const matchesPorte = selectedPorte.length === 0 || selectedPorte.includes(animal.porte);

      return matchesSearch && matchesSpecies && matchesSex && matchesPorte;
    });

    renderAnimals(filtered);
  }

  function clearFilters() {
    searchInput.value = "";
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    renderAnimals(allAnimals);
  }

  applyFiltersBtn.addEventListener("click", applyFilters);
  clearFiltersBtn.addEventListener("click", clearFilters);
  searchInput.addEventListener("input", applyFilters);

  loadAnimals();
});
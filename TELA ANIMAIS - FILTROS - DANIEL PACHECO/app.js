document.addEventListener("DOMContentLoaded", function () {
  const animalsContainer = document.getElementById("animals-container");
  const searchInput = document.getElementById("search");
  const animalCount = document.getElementById("animal-count");
  const filterCheckboxes = document.querySelectorAll(
    '.filter-group input[type="checkbox"]'
  );
  const applyFiltersBtn = document.getElementById("apply-filters");
  const clearFiltersBtn = document.getElementById("clear-filters");

  let animals = [
    {
      id: 1,
      nome: "Luna",
      especie: "Cão",
      sexo: "Fêmea",
      idade: "Adulto",
      porte: "Médio",
      status: "Vacinado",
      cor: "Caramelo",
      descricao:
        "Luna é uma cadela muito carinhosa e tranquila. Adora brincar e se dá bem com crianças e outros animais.",
      imagem: "https://placedog.net/600/600?id=1",
    },
    {
      id: 2,
      nome: "Thor",
      especie: "Cão",
      sexo: "Macho",
      idade: "Jovem",
      porte: "Grande",
      status: "Vacinado",
      cor: "Preto",
      descricao:
        "Thor é um cachorro cheio de energia e muito brincalhão. Ideal para famílias ativas que gostam de passeios.",
      imagem: "https://placedog.net/600/600?id=2",
    },
    {
      id: 3,
      nome: "Mimi",
      especie: "Gato",
      sexo: "Fêmea",
      idade: "Filhote",
      porte: "Pequeno",
      status: "Vacinado",
      cor: "Cinza",
      descricao:
        "Mimi é uma gatinha curiosa e brincalhona. Adora se esconder em caixas e perseguir bolinhas.",
      imagem: "https://placedog.net/600/600?id=10",
    },
    {
      id: 4,
      nome: "Rex",
      especie: "Cão",
      sexo: "Macho",
      idade: "Adulto",
      porte: "Grande",
      status: "Vacinado",
      cor: "Marrom",
      descricao:
        "Rex é um cão muito leal e protetor. Já foi adestrado e sabe vários comandos básicos.",
      imagem: "https://placedog.net/600/600?id=3",
    },
    {
      id: 5,
      nome: "Bella",
      especie: "Gato",
      sexo: "Fêmea",
      idade: "Adulto",
      porte: "Médio",
      status: "Vacinado",
      cor: "Branco",
      descricao:
        "Bella é uma gata tranquila e independente. Gosta de carinho no seu próprio tempo e é muito limpa.",
      imagem: "https://placedog.net/600/600?id=11",
    },
    {
      id: 6,
      nome: "Bolt",
      especie: "Cão",
      sexo: "Macho",
      idade: "Filhote",
      porte: "Pequeno",
      status: "Vacinado",
      cor: "Branco",
      descricao:
        "Bolt é um filhote muito energético e amoroso. Está aprendendo a fazer suas necessidades no lugar certo.",
      imagem: "https://placedog.net/600/600?id=4",
    },
  ];

  let filteredAnimals = [...animals];

  renderAnimals();

  function renderAnimals() {
    animalsContainer.innerHTML = "";

    if (filteredAnimals.length === 0) {
      animalsContainer.innerHTML =
        '<div class="no-results">Nenhum animal encontrado com os filtros selecionados.</div>';
      animalCount.textContent = "0 animais encontrados";
      return;
    }

    filteredAnimals.forEach((animal) => {
      const card = document.createElement("div");
      card.className = "animal-card";

      const details = [
        animal.especie,
        animal.sexo,
        animal.idade,
        animal.porte,
        animal.status,
        animal.cor,
      ].filter(Boolean);

      card.innerHTML = `
                <img src="${animal.imagem}" alt="${
        animal.nome
      }" class="animal-image" onerror="this.src='https://via.placeholder.com/600x400/4a90e2/ffffff?text=Imagem+Indisponível'">
                <div class="animal-info">
                    <h3>${animal.nome}</h3>
                    <p class="animal-description">${animal.descricao}</p>
                    <div class="animal-details">
                        ${details
                          .map(
                            (detail) =>
                              `<span class="animal-detail">${detail}</span>`
                          )
                          .join("")}
                    </div>
                </div>
            `;

      animalsContainer.appendChild(card);
    });

    animalCount.textContent = `${filteredAnimals.length} animais encontrados`;
  }

  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();

    const selectedSpecies = getSelectedCheckboxValues("species-group");
    const selectedSex = getSelectedCheckboxValues("sex-group");
    const selectedAge = getSelectedCheckboxValues("age-group");
    const selectedSize = getSelectedCheckboxValues("size-group");

    filteredAnimals = animals.filter((animal) => {
      const matchesSearch = animal.nome.toLowerCase().includes(searchTerm);
      const matchesSpecies =
        selectedSpecies.length === 0 ||
        selectedSpecies.includes(animal.especie);
      const matchesSex =
        selectedSex.length === 0 || selectedSex.includes(animal.sexo);
      const matchesAge =
        selectedAge.length === 0 || selectedAge.includes(animal.idade);
      const matchesSize =
        selectedSize.length === 0 || selectedSize.includes(animal.porte);

      return (
        matchesSearch &&
        matchesSpecies &&
        matchesSex &&
        matchesAge &&
        matchesSize
      );
    });

    renderAnimals();
  }

  function getSelectedCheckboxValues(groupId) {
    const group = document.getElementById(groupId);
    const checkboxes = group.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map((checkbox) => checkbox.value);
  }

  function clearFilters() {
    searchInput.value = "";

    filterCheckboxes.forEach((checkbox) => {
      checkbox.checked = true;
    });

    filteredAnimals = [...animals];
    renderAnimals();
  }

  searchInput.addEventListener("input", applyFilters);
  applyFiltersBtn.addEventListener("click", applyFilters);
  clearFiltersBtn.addEventListener("click", clearFilters);

  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", applyFilters);
  });
});

document.addEventListener('DOMContentLoaded', async () => {
    const animalsContainer = document.getElementById('animais-container');

    try {
        const animais = await window.api.get('/animais');
        
        if (!animais || animais.length === 0) {
            animalsContainer.innerHTML = '<p class="text-center">Nenhum animal disponível no momento.</p>';
            return;
        }

        const destaques = animais.slice(0, 4); 

        animalsContainer.innerHTML = destaques.map(animal => `
            <div class="animal-card">
                <img src="${animal.imagem}" alt="${animal.nome}" class="animal-img" onerror="this.src='/src/assets/images/placeholder.png'">
                <div class="animal-info">
                    <h3 class="animal-name">${animal.nome}</h3>
                    <div class="animal-tags">
                        <span>🏷️ ${animal.especie}</span>
                        <span>📏 ${animal.porte}</span>
                    </div>
                    <p style="font-size: 0.9em; margin-bottom: 15px;">${animal.descricao.substring(0, 60)}...</p>
                    <a href="/src/pages/public/adocao.html" class="btn btn-adopt">Conhecer</a>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Erro ao carregar animais:", error);
        animalsContainer.innerHTML = '<p class="text-center error">Erro ao carregar os animais.</p>';
    }
});
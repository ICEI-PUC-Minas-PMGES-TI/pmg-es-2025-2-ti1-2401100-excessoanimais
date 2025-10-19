document.getElementById('formDenuncia').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Denúncia enviada com sucesso! Obrigado por ajudar um animal em necessidade. 🐾');
    this.reset();
});

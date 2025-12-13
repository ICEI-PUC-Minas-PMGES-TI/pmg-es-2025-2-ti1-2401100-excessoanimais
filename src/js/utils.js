const utils = {
    loadLayout: async () => {
        try {
            const headerResp = await fetch('/src/templates/header.html');
            if (headerResp.ok) {
                document.getElementById('header-placeholder').innerHTML = await headerResp.text();
                utils.updateMenuAuth();
            }

            const footerResp = await fetch('/src/templates/footer.html');
            if (footerResp.ok) {
                document.getElementById('footer-placeholder').innerHTML = await footerResp.text();
            }

        } catch (error) {
            console.error("Erro ao carregar layout:", error);
        }
    },

    updateMenuAuth: () => {
        const user = JSON.parse(localStorage.getItem('usuarioLogado'));
        const authContainer = document.getElementById('auth-nav-item');

        if (user && authContainer) {
            const primeiroNome = user.nome.split(' ')[0];
            authContainer.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span>Olá, <strong>${primeiroNome}</strong></span>
                    <button onclick="utils.logout()" class="btn btn-primary" style="padding: 5px 10px; font-size: 0.9em;">Sair</button>
                </div>
            `;
        }
    },

    logout: () => {
        localStorage.removeItem('usuarioLogado');
        window.location.href = '/index.html';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    utils.loadLayout();
});

window.utils = utils;
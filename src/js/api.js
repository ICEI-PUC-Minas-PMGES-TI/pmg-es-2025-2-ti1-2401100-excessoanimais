const API_BASE_URL = "http://localhost:3000";

const api = {
    get: async (endpoint) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            return null;
        }
    },

    post: async (endpoint, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("Erro ao enviar dados:", error);
            throw error;
        }
    },

    update: async (endpoint, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            throw error;
        }
    },

    delete: async (endpoint) => {
        try {
            await fetch(`${API_BASE_URL}${endpoint}`, { method: "DELETE" });
            return true;
        } catch (error) {
            console.error("Erro ao deletar:", error);
            return false;
        }
    }
};

window.api = api;
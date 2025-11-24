const API = "http://localhost:3000";

// --- common: menu toggle & sidebar links
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  toggle?.addEventListener("click", () => sidebar.classList.toggle("active"));

  // sidebar navigation (client side)
  document.querySelectorAll(".sidebar nav ul li").forEach(li => {
    li.addEventListener("click", () => {
      const link = li.dataset.link;
      if (!link) return;
      // navigate to local pages
      if (link === "dashboard") window.location.href = "index.html";
      if (link === "animais") window.location.href = "animais.html";
      if (link === "denuncias") window.location.href = "denuncias.html";
    });
  });

  // route by data-page
  const page = document.body.dataset.page;
  if (page === "dashboard") initDashboard();
  if (page === "animais") initAnimais();
  if (page === "denuncias") initDenuncias();
});

/* ============================
   DASHBOARD
   ============================ */
async function initDashboard() {
  try {
    const [denRes, anRes, adRes, rgRes] = await Promise.all([
      fetch(`${API}/denuncias`), fetch(`${API}/animais`),
      fetch(`${API}/adocoes`), fetch(`${API}/resgates`)
    ]);
    const [denuncias, animais, adocoes, resgates] = await Promise.all([denRes.json(), anRes.json(), adRes.json(), rgRes.json()]);

    // cards
    document.getElementById("total-denuncias").textContent = denuncias.length;
    const animaisParaAdocao = animais.filter(a => a.status && a.status.toLowerCase().includes("vac") || a.status === "Resgatado");
    document.getElementById("animais-adocao").textContent = animaisParaAdocao.length;
    document.getElementById("adocoes-concluidas").textContent = adocoes.length;
    document.getElementById("resgates-andamento").textContent = resgates.filter(r => r.status === "Em Andamento").length;

    // últimas denúncias (5 mais recentes by dataEnvio if exists else by id)
    const tbody = document.querySelector("#tabela-denuncias tbody");
    tbody.innerHTML = "";
    const sorted = denuncias.slice().sort((a,b) => {
      const da = a.dataEnvio ? new Date(a.dataEnvio) : new Date();
      const db = b.dataEnvio ? new Date(b.dataEnvio) : new Date();
      return db - da;
    }).slice(0,5);
    sorted.forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${d.endereco}</td><td>${d.tipo || "-"}</td><td>${d.condicao || "-"}</td><td>${d.dataEnvio || "-"}</td>`;
      tbody.appendChild(tr);
    });

    // alertas
    const alerts = document.getElementById("alertas-container");
    alerts.innerHTML = "";
    if (denuncias.some(d => d.status === "Pendente" || !d.status)) {
      const a = document.createElement("div"); a.className = "alert-box"; a.innerHTML = `<strong>${denuncias.length} denúncias registradas</strong><div>Verifique as mais recentes e priorize as urgentes</div>`;
      alerts.appendChild(a);
    }
    // capacity check: if >70% animals 'Vacinado' or 'Resgatado'
    const ratio = animaisParaAdocao.length / Math.max(animais.length,1);
    if (ratio > 0.7) {
      const b = document.createElement("div"); b.className = "alert-box red"; b.innerHTML = `<strong>Capacidade do abrigo alta!</strong><div>Considere acelerar processos de adoção</div>`;
      alerts.appendChild(b);
    }
    const c = document.createElement("div"); c.className = "alert-box green"; c.innerHTML = `<strong>${adocoes.length} adoções concluídas</strong><div>Parabéns pela meta atingida!</div>`;
    alerts.appendChild(c);

  } catch (err) {
    console.error(err);
  }
}

/* ============================
   ANIMAIS PAGE
   ============================ */
function initAnimais() {
  const tabelaBody = document.querySelector("#tabela-animais tbody");
  const cardsGrid = document.getElementById("animais-cards");
  const search = document.getElementById("search-animal");
  const filterStatus = document.getElementById("filter-status");
  const btnAdd = document.getElementById("btn-add-animal");
  const modal = document.getElementById("modal-animal");
  const form = document.getElementById("form-animal");
  const closeModal = document.getElementById("modal-close");
  const modalTitle = document.getElementById("modal-animal-title");

  // open add
  btnAdd.addEventListener("click", () => {
    openAnimalModal();
  });

  closeModal.addEventListener("click", () => closeModalFn());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("animal-id").value;
    const payload = {
      nome: document.getElementById("animal-nome").value,
      especie: document.getElementById("animal-especie").value,
      idade: document.getElementById("animal-idade").value,
      porte: document.getElementById("animal-porte").value,
      status: document.getElementById("animal-status").value,
      cor: document.getElementById("animal-cor").value,
      imagem: document.getElementById("animal-imagem").value,
      descricao: document.getElementById("animal-descricao").value
    };
    try {
      if (!id) {
        // create
        await fetch(`${API}/animais`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
      } else {
        await fetch(`${API}/animais/${id}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
      }
      closeModalFn();
      await renderAnimais();
    } catch (err) { console.error(err); }
  });

  // helpers
  function openAnimalModal(animal = null) {
    modal.style.display = "flex";
    if (animal) {
      modalTitle.textContent = "Editar Animal";
      document.getElementById("animal-id").value = animal.id;
      document.getElementById("animal-nome").value = animal.nome || "";
      document.getElementById("animal-especie").value = animal.especie || "Cão";
      document.getElementById("animal-idade").value = animal.idade || "Adulto";
      document.getElementById("animal-porte").value = animal.porte || "Médio";
      document.getElementById("animal-status").value = animal.status || "Vacinado";
      document.getElementById("animal-cor").value = animal.cor || "";
      document.getElementById("animal-imagem").value = animal.imagem || "";
      document.getElementById("animal-descricao").value = animal.descricao || "";
    } else {
      modalTitle.textContent = "Adicionar Animal";
      form.reset();
      document.getElementById("animal-id").value = "";
    }
  }
  function closeModalFn(){ modal.style.display = "none"; }

  async function renderAnimais() {
    try {
      const res = await fetch(`${API}/animais`);
      const animais = await res.json();
      const q = (search.value || "").toLowerCase();
      const statusF = filterStatus.value;

      const filtered = animais.filter(a => {
        const matchQ = a.nome?.toLowerCase().includes(q) || a.especie?.toLowerCase().includes(q);
        const matchS = statusF ? (a.status === statusF) : true;
        return matchQ && matchS;
      });

      // tabela
      tabelaBody.innerHTML = "";
      filtered.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><img src="${a.imagem || '/mnt/data/ba087fa7-a829-47c9-ae2c-3abd1e9134a6.png'}" alt="${a.nome}" style="width:60px;height:60px;object-fit:cover;border-radius:6px"></td>
          <td>${a.nome || '-'}</td>
          <td>${a.especie || '-'}</td>
          <td>${a.idade || '-'}</td>
          <td>${a.porte || '-'}</td>
          <td>${a.status || '-'}</td>
          <td>
            <button class="btn" data-action="edit" data-id="${a.id}">✏️</button>
            <button class="btn" data-action="delete" data-id="${a.id}">🗑️</button>
          </td>
        `;
        tabelaBody.appendChild(tr);
      });

      // cards (mobile)
      cardsGrid.innerHTML = "";
      filtered.forEach(a => {
        const card = document.createElement("div");
        card.className = "card-animal";
        card.innerHTML = `
          <img src="${a.imagem || '/mnt/data/ba087fa7-a829-47c9-ae2c-3abd1e9134a6.png'}" alt="${a.nome}">
          <div style="flex:1">
            <strong>${a.nome}</strong>
            <div>${a.especie} • ${a.idade} • ${a.porte}</div>
            <div style="margin-top:8px">
              <button class="btn" data-action="edit" data-id="${a.id}">Editar</button>
              <button class="btn" data-action="delete" data-id="${a.id}">Excluir</button>
            </div>
          </div>
        `;
        cardsGrid.appendChild(card);
      });

      // bind actions
      document.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          const r = await fetch(`${API}/animais/${id}`); const animal = await r.json();
          openAnimalModal(animal);
        };
      });
      document.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm("Excluir este animal?")) return;
          await fetch(`${API}/animais/${btn.dataset.id}`, { method: "DELETE" });
          await renderAnimais();
        };
      });

    } catch (err) { console.error(err); }
  }

  // filters
  search.addEventListener("input", renderAnimais);
  filterStatus.addEventListener("change", renderAnimais);

  // close modal when clicking outside
  document.getElementById("modal-animal").addEventListener("click", e => { if (e.target === e.currentTarget) closeModalFn(); });

  // initial render
  renderAnimais();
}

/* ============================
   DENÚNCIAS PAGE
   ============================ */
function initDenuncias() {
  const tabela = document.querySelector("#tabela-denuncias-admin tbody");
  const search = document.getElementById("search-denuncia");
  const filter = document.getElementById("filter-denuncia-status");
  const modal = document.getElementById("modal-denuncia");
  const detalhes = document.getElementById("detalhes-denuncia");
  const statusForm = document.getElementById("form-denuncia-status");
  const closeBtn = document.getElementById("modal-denuncia-close");

  let currentDenuncia = null;

  async function render() {
    try {
      const res = await fetch(`${API}/denuncias`);
      const arr = await res.json();
      const q = (search.value || "").toLowerCase();
      const st = filter.value;
      const filtered = arr.filter(d => {
        const matchQ = (d.endereco+ (d.nome||'') + (d.telefone||'')).toLowerCase().includes(q);
        const matchS = st ? d.status === st : true;
        return matchQ && matchS;
      }).sort((a,b)=> (b.id - a.id));

      tabela.innerHTML = "";
      filtered.forEach(d => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${d.protocolo || ('DN-'+d.id)}</td>
          <td>${d.endereco}</td>
          <td>${d.tipo || '-'}</td>
          <td>${d.condicao || '-'}</td>
          <td>${d.nome ? `${d.nome} • ${d.telefone || ''}` : '-'}</td>
          <td>${d.dataEnvio || '-'}</td>
          <td>
            <button class="btn" data-action="view" data-id="${d.id}">Ver</button>
            <button class="btn" data-action="delete" data-id="${d.id}">Excluir</button>
          </td>
        `;
        tabela.appendChild(tr);
      });

      // bind actions
      document.querySelectorAll('[data-action="view"]').forEach(b=>{
        b.onclick = async () => {
          const id = b.dataset.id; const r = await fetch(`${API}/denuncias/${id}`); const d = await r.json();
          currentDenuncia = d;
          detalhes.innerHTML = `
            <p><strong>Endereço:</strong> ${d.endereco}</p>
            <p><strong>Referência:</strong> ${d.referencia || '-'}</p>
            <p><strong>Tipo:</strong> ${d.tipo || '-'}</p>
            <p><strong>Condição:</strong> ${d.condicao || '-'}</p>
            <p><strong>Observações:</strong> ${d.observacoes || '-'}</p>
            <p><strong>Contato:</strong> ${d.nome || '-'} ${d.telefone ? '• '+d.telefone : ''}</p>
          `;
          document.getElementById("denuncia-status").value = d.status || "Pendente";
          modal.style.display = "flex";
        };
      });

      document.querySelectorAll('[data-action="delete"]').forEach(b=>{
        b.onclick = async () => {
          if (!confirm("Excluir essa denúncia?")) return;
          await fetch(`${API}/denuncias/${b.dataset.id}`, { method: "DELETE" });
          await render();
        };
      });

    } catch (err) { console.error(err); }
  }

  // search/filter events
  search.addEventListener("input", render);
  filter.addEventListener("change", render);

  // modal form submit (update status)
  statusForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentDenuncia) return;
    const newStatus = document.getElementById("denuncia-status").value;
    await fetch(`${API}/denuncias/${currentDenuncia.id}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: newStatus }) });
    modal.style.display = "none";
    await render();
  });
  closeBtn.addEventListener("click", ()=> modal.style.display = "none");
  modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

  render();
}

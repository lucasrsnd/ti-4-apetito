const form = document.getElementById("formItem");
const listaCompras = document.getElementById("listaCompras");
const clearCompletedBtn = document.getElementById("clear-completed");
const saveListBtn = document.getElementById("save-list");
const filterBtns = document.querySelectorAll(".filter-btn");
const totalItemsEl = document.getElementById("total-items");
const pendingItemsEl = document.getElementById("pending-items");
const completedItemsEl = document.getElementById("completed-items");

let itens = JSON.parse(localStorage.getItem("listaCompras")) || [];
let currentFilter = "all";

function salvarLocalStorage() {
  localStorage.setItem("listaCompras", JSON.stringify(itens));
  updateStats();
}

function updateStats() {
  totalItemsEl.textContent = itens.length;
  pendingItemsEl.textContent = itens.filter((item) => !item.concluido).length;
  completedItemsEl.textContent = itens.filter((item) => item.concluido).length;
}

function renderizarLista() {
  listaCompras.innerHTML = "";

  let filteredItems = itens;

  if (currentFilter === "pending") {
    filteredItems = itens.filter((item) => !item.concluido);
  } else if (currentFilter === "completed") {
    filteredItems = itens.filter((item) => item.concluido);
  }

  filteredItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item";
    if (item.concluido) div.classList.add("concluido");
    if (item.fixado) div.classList.add("fixado");

    div.innerHTML = `
            <span class="item-name">${item.nome}</span>
            <div class="item-actions">
                <button class="item-btn btn-complete" onclick="concluirItem(${index})">
                    <i class="fas fa-check"></i>
                </button>
                <button class="item-btn btn-pin" onclick="fixarItem(${index})">
                    <i class="fas fa-thumbtack"></i>
                </button>
                <button class="item-btn btn-delete" onclick="excluirItem(${index})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;

    listaCompras.appendChild(div);
  });

  updateStats();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const nome = document.getElementById("nomeItem").value.trim();
  if (nome === "") return;

  itens.unshift({ nome, concluido: false, fixado: false });
  salvarLocalStorage();
  renderizarLista();
  form.reset();
});

function concluirItem(index) {
  itens[index].concluido = !itens[index].concluido;
  salvarLocalStorage();
  renderizarLista();
}

function excluirItem(index) {
  if (confirm("Deseja excluir este item?")) {
    itens.splice(index, 1);
    salvarLocalStorage();
    renderizarLista();
  }
}

function fixarItem(index) {
  itens[index].fixado = !itens[index].fixado;
  salvarLocalStorage();
  renderizarLista();
}

clearCompletedBtn.addEventListener("click", function () {
  if (confirm("Deseja limpar todos os itens concluídos?")) {
    itens = itens.filter((item) => !item.concluido);
    salvarLocalStorage();
    renderizarLista();
  }
});

saveListBtn.addEventListener("click", function () {
  alert("Lista salva com sucesso!");
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    filterBtns.forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    currentFilter = this.dataset.filter;
    renderizarLista();
  });
});

renderizarLista();

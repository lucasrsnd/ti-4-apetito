const API_URL = "http://localhost:8080/api/cardapio";

const form = document.getElementById("item-form");
const itemIdInput = document.getElementById("item-id");
const nomeInput = document.getElementById("item-nome");
const descricaoInput = document.getElementById("item-descricao");
const precoInput = document.getElementById("item-preco");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const refreshBtn = document.getElementById("refresh-btn");
const itemsList = document.getElementById("items-list");

let isEditing = false;

document.addEventListener("DOMContentLoaded", fetchItems);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const itemData = {
    nome: nomeInput.value,
    descricao: descricaoInput.value,
    preco: parseFloat(precoInput.value),
  };

  try {
    if (isEditing) {
      await updateItem(itemIdInput.value, itemData);
    } else {
      await createItem(itemData);
    }
    resetForm();
    fetchItems();
  } catch (error) {
    console.error("Erro:", error);
    alert("Ocorreu um erro. Verifique o console para mais detalhes.");
  }
});

cancelBtn.addEventListener("click", () => {
  resetForm();
});

refreshBtn.addEventListener("click", fetchItems);

async function fetchItems() {
  try {
    const response = await fetch(API_URL);
    const items = await response.json();
    displayItems(items);
  } catch (error) {
    console.error("Erro ao buscar itens:", error);
  }
}

async function createItem(itemData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });
  return await response.json();
}

async function updateItem(id, itemData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });
  return await response.json();
}

async function deleteItem(id) {
  if (confirm("Tem certeza que deseja excluir este item?")) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      fetchItems();
    } catch (error) {
      console.error("Erro ao deletar item:", error);
    }
  }
}

function displayItems(items) {
  itemsList.innerHTML = "";

  if (items.length === 0) {
    itemsList.innerHTML = '<div class="no-items">Nenhum item no cardápio</div>';
    return;
  }

  items.forEach((item) => {
    const itemCard = document.createElement("div");
    itemCard.className = "item-card";

    itemCard.innerHTML = `
            <h3>${item.nome}</h3>
            <p>${item.descricao}</p>
            <p class="price">R$ ${item.preco.toFixed(2)}</p>
            <div class="item-actions">
                <button class="btn edit-btn" data-id="${item.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn delete-btn" data-id="${item.id}">
                    <i class="fas fa-trash-alt"></i> Excluir
                </button>
            </div>
        `;

    itemsList.appendChild(itemCard);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => editItem(btn.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteItem(btn.dataset.id));
  });
}

async function editItem(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const item = await response.json();

    itemIdInput.value = item.id;
    nomeInput.value = item.nome;
    descricaoInput.value = item.descricao;
    precoInput.value = item.preco;

    submitBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
    cancelBtn.style.display = "flex";
    isEditing = true;

    document.querySelector(".form-section").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    console.error("Erro ao buscar item para edição:", error);
  }
}

function resetForm() {
  form.reset();
  itemIdInput.value = "";
  submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
  cancelBtn.style.display = "none";
  isEditing = false;
}

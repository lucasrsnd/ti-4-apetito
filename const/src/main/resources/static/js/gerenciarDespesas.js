const API_URL = "http://localhost:8080/api/despesas";

const form = document.getElementById("despesa-form");
const idInput = document.getElementById("despesa-id");
const nomeInput = document.getElementById("despesa-nome");
const parcelasInput = document.getElementById("despesa-parcelas");
const precoInput = document.getElementById("despesa-preco");
const vencimentoInput = document.getElementById("despesa-vencimento");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const refreshBtn = document.getElementById("refresh-btn");
const despesasList = document.getElementById("despesas-list");

let isEditing = false;

document.addEventListener("DOMContentLoaded", () => {
  fetchDespesas();

  const hoje = new Date().toISOString().split("T")[0];
  vencimentoInput.min = hoje;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const despesaData = {
    nome: nomeInput.value,
    parcelas: parseInt(parcelasInput.value),
    preco: parseFloat(precoInput.value),
    dataVencimento: vencimentoInput.value,
  };

  try {
    if (isEditing) {
      await updateDespesa(idInput.value, despesaData);
    } else {
      await createDespesa(despesaData);
    }
    resetForm();
    fetchDespesas();
  } catch (error) {
    console.error("Erro:", error);
    alert("Ocorreu um erro. Verifique o console para mais detalhes.");
  }
});

cancelBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", fetchDespesas);

async function fetchDespesas() {
  try {
    const response = await fetch(API_URL);
    const despesas = await response.json();
    displayDespesas(despesas);
  } catch (error) {
    console.error("Erro ao buscar despesas:", error);
  }
}

async function createDespesa(despesaData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(despesaData),
  });
  return await response.json();
}

async function updateDespesa(id, despesaData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(despesaData),
  });
  return await response.json();
}

async function deleteDespesa(id) {
  if (confirm("Tem certeza que deseja excluir esta despesa?")) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      fetchDespesas();
    } catch (error) {
      console.error("Erro ao deletar despesa:", error);
    }
  }
}

function displayDespesas(despesas) {
  const despesasList = document.getElementById("despesas-list");
  despesasList.innerHTML = "";

  if (despesas.length === 0) {
    despesasList.innerHTML =
      '<li class="empty-message">Nenhuma despesa cadastrada</li>';
    return;
  }

  despesas.forEach((despesa) => {
    const li = document.createElement("li");
    li.className = "despesa-item";

    const dataVencimento = new Date(despesa.dataVencimento);
    const dataFormatada = dataVencimento.toLocaleDateString("pt-BR");

    li.innerHTML = `
        <div class="despesa-info">
          <h3>${despesa.nome}</h3>
          <p>${despesa.parcelas} parcela(s) · Vence em ${dataFormatada}</p>
        </div>
        <div class="despesa-valor">
          R$ ${despesa.preco.toFixed(2)}
        </div>
        <div class="despesa-actions">
          <button class="btn btn-primary edit-btn" data-id="${despesa.id}">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn btn-danger delete-btn" data-id="${despesa.id}">
            <i class="fas fa-trash-alt"></i> Excluir
          </button>
        </div>
      `;

    despesasList.appendChild(li);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => editDespesa(btn.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteDespesa(btn.dataset.id));
  });
}

async function editDespesa(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const despesa = await response.json();

    idInput.value = despesa.id;
    nomeInput.value = despesa.nome;
    parcelasInput.value = despesa.parcelas;
    precoInput.value = despesa.preco;
    vencimentoInput.value = despesa.dataVencimento;

    submitBtn.textContent = "Atualizar";
    cancelBtn.style.display = "inline-block";
    isEditing = true;

    document
      .querySelector(".form-section")
      .scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Erro ao buscar despesa para edição:", error);
  }
}

function resetForm() {
  form.reset();
  idInput.value = "";
  submitBtn.textContent = "Salvar";
  cancelBtn.style.display = "none";
  isEditing = false;

  const hoje = new Date().toISOString().split("T")[0];
  vencimentoInput.value = hoje;
}

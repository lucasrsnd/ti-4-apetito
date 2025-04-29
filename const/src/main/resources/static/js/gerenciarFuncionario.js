const API_URL = "http://localhost:8080/api/funcionarios";

const form = document.getElementById("funcionario-form");
const idInput = document.getElementById("funcionario-id");
const nomeInput = document.getElementById("funcionario-nome");
const cpfInput = document.getElementById("funcionario-cpf");
const telefoneInput = document.getElementById("funcionario-telefone");
const emailInput = document.getElementById("funcionario-email");
const salarioInput = document.getElementById("funcionario-salario");
const cargoSelect = document.getElementById("funcionario-cargo");
const placaContainer = document.getElementById("placa-container");
const placaInput = document.getElementById("funcionario-placa");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const refreshBtn = document.getElementById("refresh-btn");
const funcionariosList = document.getElementById("funcionarios-list");

let isEditing = false;
let cargos = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchCargos();
  fetchFuncionarios();

  cargoSelect.addEventListener("change", (e) => {
    placaContainer.style.display =
      e.target.value === "MOTOBOY" ? "block" : "none";
    if (e.target.value !== "MOTOBOY") {
      placaInput.value = "";
    }
  });

  cpfInput.addEventListener("input", (e) => {
    e.target.value = formatarCPF(e.target.value);
  });

  telefoneInput.addEventListener("input", (e) => {
    e.target.value = formatarTelefone(e.target.value);
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validarEmail(emailInput.value)) {
    alert("Por favor, insira um e-mail válido (com @ e .com/.br/etc)");
    emailInput.focus();
    return;
  }

  const cpfSemFormatacao = cpfInput.value.replace(/\D/g, "");
  const telefoneSemFormatacao = telefoneInput.value.replace(/\D/g, "");

  const funcionarioData = {
    nome: nomeInput.value,
    cpf: cpfSemFormatacao,
    telefone: telefoneSemFormatacao,
    email: emailInput.value,
    salario: parseFloat(salarioInput.value),
    cargo: cargoSelect.value,
    placaMoto:
      cargoSelect.value === "MOTOBOY" ? placaInput.value.toUpperCase() : null,
  };

  try {
    if (isEditing) {
      await updateFuncionario(idInput.value, funcionarioData);
    } else {
      await createFuncionario(funcionarioData);
    }
    resetForm();
    fetchFuncionarios();
  } catch (error) {
    console.error("Erro:", error);
    alert("Ocorreu um erro. Verifique o console para mais detalhes.");
  }
});

cancelBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", fetchFuncionarios);

async function fetchCargos() {
  try {
    const response = await fetch(`${API_URL}/cargos`);
    cargos = await response.json();
    populateCargoSelect();
  } catch (error) {
    console.error("Erro ao buscar cargos:", error);
  }
}

function populateCargoSelect() {
  cargoSelect.innerHTML = '<option value="">Selecione o cargo</option>';
  cargos.forEach((cargo) => {
    const option = document.createElement("option");
    option.value = cargo;
    option.textContent = cargo;
    cargoSelect.appendChild(option);
  });
}

async function fetchFuncionarios() {
  try {
    const response = await fetch(API_URL);
    const funcionarios = await response.json();
    displayFuncionarios(funcionarios);
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
  }
}

async function createFuncionario(funcionarioData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(funcionarioData),
  });
  return await response.json();
}

async function updateFuncionario(id, funcionarioData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(funcionarioData),
  });
  return await response.json();
}

async function deleteFuncionario(id) {
  if (confirm("Tem certeza que deseja excluir este funcionário?")) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      fetchFuncionarios();
    } catch (error) {
      console.error("Erro ao deletar funcionário:", error);
    }
  }
}

function displayFuncionarios(funcionarios) {
  funcionariosList.innerHTML = "";

  if (funcionarios.length === 0) {
    funcionariosList.innerHTML =
      '<div class="no-items">Nenhum funcionário cadastrado</div>';
    return;
  }

  funcionarios.forEach((funcionario) => {
    const card = document.createElement("div");
    card.className = "funcionario-card";

    card.innerHTML = `
            <h3>${funcionario.nome}</h3>
            <p><strong>CPF:</strong> ${formatarCPF(funcionario.cpf)}</p>
            <p><strong>Telefone:</strong> ${formatarTelefone(
              funcionario.telefone
            )}</p>
            <p><strong>E-mail:</strong> ${funcionario.email}</p>
            <p><strong>Cargo:</strong> ${funcionario.cargo}</p>
            <p class="salary"><strong>Salário:</strong> R$ ${funcionario.salario.toFixed(
              2
            )}</p>
            ${
              funcionario.cargo === "MOTOBOY"
                ? `<p><strong>Placa da Moto:</strong> ${funcionario.placaMoto}</p>`
                : ""
            }
            
            <div class="funcionario-actions">
                <button class="btn btn-edit" data-id="${funcionario.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-delete" data-id="${funcionario.id}">
                    <i class="fas fa-trash-alt"></i> Excluir
                </button>
            </div>
        `;

    funcionariosList.appendChild(card);
  });

  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => editFuncionario(btn.dataset.id));
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteFuncionario(btn.dataset.id));
  });
}

async function editFuncionario(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const funcionario = await response.json();

    idInput.value = funcionario.id;
    nomeInput.value = funcionario.nome;
    cpfInput.value = formatarCPF(funcionario.cpf);
    telefoneInput.value = formatarTelefone(funcionario.telefone);
    emailInput.value = funcionario.email;
    salarioInput.value = funcionario.salario;
    cargoSelect.value = funcionario.cargo;

    if (funcionario.cargo === "MOTOBOY") {
      placaContainer.style.display = "block";
      placaInput.value = funcionario.placaMoto || "";
    } else {
      placaContainer.style.display = "none";
    }

    submitBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
    cancelBtn.style.display = "flex";
    isEditing = true;

    document.querySelector(".form-section").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    console.error("Erro ao buscar funcionário para edição:", error);
  }
}

function resetForm() {
  form.reset();
  idInput.value = "";
  placaContainer.style.display = "none";
  submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
  cancelBtn.style.display = "none";
  isEditing = false;
}

function formatarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return cpf;
}

function formatarTelefone(telefone) {
  telefone = telefone.replace(/\D/g, "");

  if (telefone.length === 11) {
    telefone = telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (telefone.length === 10) {
    telefone = telefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else if (telefone.length > 2) {
    telefone = telefone.replace(/(\d{2})(\d+)/, "($1) $2");
  } else if (telefone.length > 0) {
    telefone = telefone.replace(/^(\d*)/, "($1");
  }

  return telefone;
}

function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

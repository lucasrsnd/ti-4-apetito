const API_URL = "http://localhost:8080/api/produtos";
const NOTIFICATION_API = `${API_URL}/notificacoes`;
const NOTIFICATION_COUNT_API = `${API_URL}/notificacoes/contagem`;

const form = document.getElementById("produto-form");
const idInput = document.getElementById("produto-id");
const nomeInput = document.getElementById("produto-nome");
const precoInput = document.getElementById("produto-preco");
const validadeInput = document.getElementById("produto-validade");
const perecivelInput = document.getElementById("produto-perecivel");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const refreshBtn = document.getElementById("refresh-btn");
const produtosList = document.getElementById("produtos-list");
const notificationBadge = document.getElementById("notification-badge");
const badgeCount = document.getElementById("badge-count");
const modal = document.getElementById("notification-modal");
const notificationsContainer = document.getElementById(
  "notifications-container"
);

let isEditing = false;
let notificationCheckInterval;
let notificationAlreadyShown = false;

document.addEventListener("DOMContentLoaded", () => {
  const hoje = new Date().toISOString().split("T")[0];
  validadeInput.min = hoje;

  document
    .getElementById("produto-perecivel")
    .addEventListener("change", function (e) {
      const validadeGroup = document.getElementById("validade-group");
      if (e.target.checked) {
        validadeGroup.style.display = "block";
        validadeInput.disabled = false;
        validadeInput.min = hoje;
      } else {
        validadeGroup.style.display = "none";
        validadeInput.value = "";
        validadeInput.disabled = true;
      }
    });

  validadeInput.disabled = !perecivelInput.checked;
  document.getElementById("validade-group").style.display = perecivelInput.checked ? "block" : "none";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const produtoData = {
    nome: nomeInput.value,
    precoCompra: parseFloat(precoInput.value),
    dataValidade: perecivelInput.checked ? validadeInput.value : null,
    perecivel: perecivelInput.checked,
  };

  try {
    if (isEditing) {
      await updateProduto(idInput.value, produtoData);
    } else {
      await createProduto(produtoData);
    }
    resetForm();
    fetchProdutos();
    checkNotifications();
  } catch (error) {
    console.error("Erro:", error);
    showAlert("Erro", "Ocorreu um erro. Verifique o console para mais detalhes.", "error");
  }
});

cancelBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", () => {
  fetchProdutos();
  checkNotifications();
});

function abrirModal() {
  modal.style.display = "block";
  loadNotifications();
}

function fecharModal() {
  modal.style.display = "none";
  notificationAlreadyShown = false;
}

window.onclick = function (event) {
  if (event.target == modal) {
    fecharModal();
  }
};

async function fetchProdutos() {
  try {
    const response = await fetch(API_URL);
    const produtos = await response.json();
    displayProdutos(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }
}

async function createProduto(produtoData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(produtoData),
  });
  return await response.json();
}

async function updateProduto(id, produtoData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(produtoData),
  });
  return await response.json();
}

async function deleteProduto(id) {
  const result = await Swal.fire({
    title: 'Confirmação',
    text: 'Tem certeza que deseja excluir este produto?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim',
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'custom-alert',
      confirmButton: 'custom-button',
      cancelButton: 'custom-button'
    }
  });

  if (result.isConfirmed) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      fetchProdutos();
      checkNotifications();
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      showAlert("Erro", "Erro ao deletar produto.", "error");
    }
  }
}


async function checkNotifications() {
  try {
    const response = await fetch(NOTIFICATION_COUNT_API);
    const count = await response.json();

    if (count > 0) {
      notificationBadge.style.display = "flex";
      badgeCount.textContent = count;

      if (
        !notificationAlreadyShown &&
        (!modal.style.display || modal.style.display === "none")
      ) {
        showAlert("Atenção", `Você tem ${count} produto(s) próximo(s) do vencimento!`, "warning");
        notificationAlreadyShown = true;
      }
    } else {
      notificationBadge.style.display = "none";
      notificationAlreadyShown = false;
    }
  } catch (error) {
    console.error("Erro ao verificar notificações:", error);
  }
}

async function loadNotifications() {
  try {
    const response = await fetch(NOTIFICATION_API);
    const produtos = await response.json();

    notificationsContainer.innerHTML = "";

    if (produtos.length === 0) {
      notificationsContainer.innerHTML =
        "<p>Nenhum produto próximo do vencimento</p>";
      return;
    }

    produtos.forEach((produto) => {
      const hoje = new Date();
      const validade = new Date(produto.dataValidade);
      const diffTime = validade - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const div = document.createElement("div");
      div.className = "notification-item";
      div.innerHTML = `
                        <h3><i class="fas fa-exclamation-triangle"></i> ${produto.nome
        }</h3>
                        <p><strong>Vencimento:</strong> ${new Date(
          produto.dataValidade
        ).toLocaleDateString("pt-BR")}</p>
                        <p><strong>Dias restantes:</strong> ${diffDays} dia(s)</p>
                    `;

      notificationsContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Erro ao carregar notificações:", error);
    notificationsContainer.innerHTML = "<p>Erro ao carregar notificações</p>";
  }
}

function displayProdutos(produtos) {
  produtosList.innerHTML = "";

  if (produtos.length === 0) {
    produtosList.innerHTML =
      '<li class="produto-card">Nenhum produto cadastrado</li>';
    return;
  }

  const hoje = new Date();

  produtos.forEach((produto) => {
    const li = document.createElement("li");
    li.className = "produto-card";

    let vencimentoClass = "";
    let vencimentoInfo = "";

    if (produto.perecivel && produto.dataValidade) {
      const validade = new Date(produto.dataValidade);
      const diffTime = validade - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays >= 0) {
        vencimentoClass = "vencimento-proximo";
        vencimentoInfo = ` (Vence em ${diffDays} dia(s))`;
      } else if (diffDays < 0) {
        vencimentoClass = "vencido";
        vencimentoInfo = ` (Vencido há ${Math.abs(diffDays)} dia(s))`;
      }
    }

    li.innerHTML = `
                    <div class="${vencimentoClass}">
                        <h3>${produto.nome} ${produto.perecivel
        ? '<span class="perecivel-tag"><i class="fas fa-clock"></i> Perecível</span>'
        : ""
      }</h3>
                        <p><strong>Preço de compra:</strong> R$ ${produto.precoCompra.toFixed(
        2
      )}</p>
                        ${produto.perecivel
        ? `
                            <p><strong>Data de validade:</strong> 
                                ${new Date(
          produto.dataValidade
        ).toLocaleDateString("pt-BR")}
                                ${vencimentoInfo}
                            </p>
                        `
        : ""
      }
                        
                        <div class="produto-actions">
                            <button class="btn btn-secondary edit-btn" data-id="${produto.id
      }">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-danger delete-btn" data-id="${produto.id
      }">
                                <i class="fas fa-trash-alt"></i> Excluir
                            </button>
                        </div>
                    </div>
                `;

    produtosList.appendChild(li);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => editProduto(btn.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteProduto(btn.dataset.id));
  });
}

async function editProduto(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const produto = await response.json();

    idInput.value = produto.id;
    nomeInput.value = produto.nome;
    precoInput.value = produto.precoCompra;
    perecivelInput.checked = produto.perecivel;

    if (produto.perecivel && produto.dataValidade) {
      validadeInput.value = produto.dataValidade;
      validadeInput.disabled = false;
      document.getElementById("validade-group").style.display = "block";
    } else {
      validadeInput.value = "";
      validadeInput.disabled = true;
      document.getElementById("validade-group").style.display = "none";
    }

    submitBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
    cancelBtn.style.display = "inline-block";
    isEditing = true;

    document
      .querySelector(".form-section")
      .scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Erro ao buscar produto para edição:", error);
  }
}

function resetForm() {
  form.reset();
  idInput.value = "";
  validadeInput.disabled = !perecivelInput.checked;
  document.getElementById("validade-group").style.display = perecivelInput.checked ? "block" : "none";
  submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
  cancelBtn.style.display = "none";
  isEditing = false;
}

fetchProdutos();
checkNotifications();

notificationCheckInterval = setInterval(checkNotifications, 5 * 60 * 1000);


const pdfBtn = document.getElementById("pdf-btn");

pdfBtn.addEventListener("click", gerarRelatorioPDF);
async function gerarRelatorioPDF() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const colunas = {
            nome: 15,
            preco: 70,
            perecivel: 100,
            validade: 140,
            status: 190
        };

        doc.setFontSize(18);
        doc.text("Relatório de Produtos em Estoque", 105, 15, { align: 'center' });

        doc.setFontSize(10);
        const dataEmissao = new Date().toLocaleDateString('pt-BR');
        doc.text(`Data de emissão: ${dataEmissao}`, 105, 23, { align: 'center' });

        doc.setFontSize(12);
        doc.setDrawColor(0);
        doc.setFillColor(200, 200, 200);
        doc.rect(10, 30, 190, 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text("Nome", colunas.nome, 37);
        doc.text("Preço", colunas.preco, 37);
        doc.text("Perecível", colunas.perecivel, 37);
        doc.text("Validade", colunas.validade, 37);
        doc.text("Status", colunas.status, 37, { align: 'right' });

        let y = 45;
        const hoje = new Date();
        
        produtos.forEach((produto) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
                doc.setFontSize(12);
                doc.setDrawColor(0);
                doc.setFillColor(200, 200, 200);
                doc.rect(10, 10, 190, 10, 'F');
                doc.setTextColor(0, 0, 0);
                doc.text("Nome", colunas.nome, 17);
                doc.text("Preço", colunas.preco, 17);
                doc.text("Perecível", colunas.perecivel, 17);
                doc.text("Validade", colunas.validade, 17);
                doc.text("Status", colunas.status, 17, { align: 'right' });
                y = 25;
            }

            let status = "";
            let validadeText = "N/A";
            let statusColor = [0, 0, 0]; 
            
            if (produto.perecivel && produto.dataValidade) {
                const validade = new Date(produto.dataValidade);
                const diffTime = validade - hoje;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                validadeText = new Date(produto.dataValidade).toLocaleDateString('pt-BR');
                
                if (diffDays < 0) {
                    status = "VENCIDO";
                    statusColor = [255, 0, 0];
                } else if (diffDays <= 7) {
                    status = `Vence em ${diffDays} dia(s)`;
                    statusColor = [255, 165, 0];
                } else {
                    status = "OK";
                    statusColor = [0, 128, 0];
                }
            }

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(produto.nome, colunas.nome, y);
            doc.text(`R$ ${produto.precoCompra.toFixed(2)}`, colunas.preco, y);
            doc.text(produto.perecivel ? "Sim" : "Não", colunas.perecivel, y);
            doc.text(validadeText, colunas.validade, y);

            doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.text(status, colunas.status, y, { align: 'right' });

            doc.setDrawColor(200, 200, 200);
            doc.line(10, y + 5, 200, y + 5);
            
            y += 10;
        });

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total de produtos: ${produtos.length}`, 14, 285);

        doc.save(`Relatorio_Estoque_${dataEmissao.replace(/\//g, '-')}.pdf`);
        
    } catch (error) {
        console.error("Erro ao gerar relatório PDF:", error);
        showAlert("Erro", "Erro ao gerar relatório. Verifique o console para mais detalhes.", "error");
    }
}
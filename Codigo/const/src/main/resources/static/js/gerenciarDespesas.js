const API_URL = "http://localhost:8080/api/despesas";

const form = document.getElementById("despesa-form");
const idInput = document.getElementById("despesa-id");
const nomeInput = document.getElementById("despesa-nome");
const parcelasInput = document.getElementById("despesa-parcelas");
const precoInput = document.getElementById("despesa-preco");
const vencimentoInput = document.getElementById("despesa-vencimento");
const submitBtn = document.querySelector("#despesa-form button[type='submit']");
const cancelBtn = document.getElementById("cancel-btn");
const refreshBtn = document.getElementById("refresh-btn");
const pdfBtn = document.getElementById("pdf-btn");
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
        showAlert("Erro", "Ocorreu um erro. Verifique o console para mais detalhes.", "error");
    }
});

cancelBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", fetchDespesas);
pdfBtn.addEventListener("click", gerarRelatorioPDF);

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
  const result = await Swal.fire({
    title: 'Confirmação',
    text: 'Tem certeza que deseja excluir esta despesa?',
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
      fetchDespesas();
    } catch (error) {
      console.error("Erro ao deletar despesa:", error);
      showAlert("Erro", "Erro ao deletar despesa.", "error");
    }
  }
}


function displayDespesas(despesas) {
    despesasList.innerHTML = "";

    if (despesas.length === 0) {
        despesasList.innerHTML = '<li class="empty-message">Nenhuma despesa cadastrada</li>';
        return;
    }

    const sortedDespesas = [...despesas].sort((a, b) => {
        if (a.status === "pago" && b.status !== "pago") return 1;
        if (a.status !== "pago" && b.status === "pago") return -1;
        return new Date(a.dataVencimento) - new Date(b.dataVencimento);
    });

    sortedDespesas.forEach((despesa) => {
        const li = document.createElement("li");
        li.className = "despesa-item";

        const dataVencimento = new Date(despesa.dataVencimento);
        const dataFormatada = dataVencimento.toLocaleDateString("pt-BR");
        const hoje = new Date();
        const diffTime = dataVencimento - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let statusClass = "";
        let statusText = "";
        
        if (despesa.status === "pago") {
            statusClass = "pago";
            statusText = "PAGO";
        } else if (diffDays < 0) {
            statusClass = "vencida";
            statusText = `Vencida há ${Math.abs(diffDays)} dia(s)`;
        } else if (diffDays <= 7) {
            statusClass = "proxima";
            statusText = `Vence em ${diffDays} dia(s)`;
        }

        li.innerHTML = `
            <div class="despesa-info">
                <h3>${despesa.nome}</h3>
                <p>${despesa.parcelas} parcela(s) · Vence em ${dataFormatada}</p>
                ${statusText ? `<span class="status-badge ${statusClass}">${statusText}</span>` : ''}
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
                ${despesa.status !== "pago" ? 
                  `<button class="btn btn-success pay-btn" data-id="${despesa.id}">
                      <i class="fas fa-check"></i> Pago
                  </button>` : ''}
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

    document.querySelectorAll(".pay-btn").forEach((btn) => {
        btn.addEventListener("click", () => markAsPaid(btn.dataset.id));
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

        submitBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
        cancelBtn.style.display = "inline-block";
        isEditing = true;

        document.querySelector(".form-section").scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        console.error("Erro ao buscar despesa para edição:", error);
    }
}

function resetForm() {
    form.reset();
    idInput.value = "";
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
    cancelBtn.style.display = "none";
    isEditing = false;

    const hoje = new Date().toISOString().split("T")[0];
    vencimentoInput.value = hoje;
}

async function markAsPaid(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/pagar`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            }
        });
        
        if (response.ok) {
            fetchDespesas();
        } else {
            console.error("Erro ao marcar como pago");
        }
    } catch (error) {
        console.error("Erro ao marcar despesa como paga:", error);
    }
}

async function gerarRelatorioPDF() {
    try {
        const response = await fetch(API_URL);
        const despesas = await response.json();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const colunas = {
            nome: 15,
            parcelas: 60,
            preco: 90,
            vencimento: 130,
            status: 190
        };

        doc.setFontSize(18);
        doc.text("Relatório de Despesas", 105, 15, { align: 'center' });

        doc.setFontSize(10);
        const dataEmissao = new Date().toLocaleDateString('pt-BR');
        doc.text(`Data de emissão: ${dataEmissao}`, 105, 23, { align: 'center' });

        doc.setFontSize(12);
        doc.setDrawColor(0);
        doc.setFillColor(200, 200, 200);
        doc.rect(10, 30, 190, 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text("Nome", colunas.nome, 37);
        doc.text("Parcelas", colunas.parcelas, 37);
        doc.text("Valor", colunas.preco, 37);
        doc.text("Vencimento", colunas.vencimento, 37);
        doc.text("Status", colunas.status, 37, { align: 'right' });

        let y = 45;
        const hoje = new Date();
        
        const sortedDespesas = [...despesas].sort((a, b) => {
            if (a.status === "pago" && b.status !== "pago") return 1;
            if (a.status !== "pago" && b.status === "pago") return -1;
            return 0;
        });

        sortedDespesas.forEach((despesa) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
                doc.setFontSize(12);
                doc.setDrawColor(0);
                doc.setFillColor(200, 200, 200);
                doc.rect(10, 10, 190, 10, 'F');
                doc.setTextColor(0, 0, 0);
                doc.text("Nome", colunas.nome, 17);
                doc.text("Parcelas", colunas.parcelas, 17);
                doc.text("Valor", colunas.preco, 17);
                doc.text("Vencimento", colunas.vencimento, 17);
                doc.text("Status", colunas.status, 17, { align: 'right' });
                y = 25;
            }

            const dataVencimento = new Date(despesa.dataVencimento);
            const dataFormatada = dataVencimento.toLocaleDateString('pt-BR');
            
            let status = "";
            let statusColor = [0, 0, 0];
            
            if (despesa.status === "pago") {
                status = "PAGO";
                statusColor = [0, 128, 0];
            } else {
                const diffTime = dataVencimento - hoje;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) {
                    status = "VENCIDA";
                    statusColor = [255, 0, 0];
                } else if (diffDays <= 7) {
                    status = `Vence em ${diffDays} dia(s)`;
                    statusColor = [255, 165, 0];
                } else {
                    status = "PENDENTE";
                    statusColor = [0, 0, 0];
                }
            }

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(despesa.nome, colunas.nome, y);
            doc.text(despesa.parcelas.toString(), colunas.parcelas, y);
            doc.text(`R$ ${despesa.preco.toFixed(2)}`, colunas.preco, y);
            doc.text(dataFormatada, colunas.vencimento, y);

            doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.text(status, colunas.status, y, { align: 'right' });

            doc.setDrawColor(200, 200, 200);
            doc.line(10, y + 5, 200, y + 5);
            
            y += 10;
        });

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total de despesas: ${despesas.length}`, 14, 285);
        doc.text(`Valor total: R$ ${despesas.reduce((sum, d) => sum + d.preco, 0).toFixed(2)}`, 14, 290);

        doc.save(`Relatorio_Despesas_${dataEmissao.replace(/\//g, '-')}.pdf`);
    } catch (error) {
        console.error("Erro ao gerar relatório PDF:", error);
        showAlert("Erro", "Erro ao gerar relatório. Verifique o console para mais detalhes.", "error");
    }
}

fetchDespesas();
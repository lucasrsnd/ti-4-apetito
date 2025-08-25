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
            <span class="item-quantity">${item.quantidade}x</span>
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
    const quantidade = parseInt(document.getElementById("quantidadeItem").value) || 1;
    
    if (nome === "") return;

    itens.unshift({ 
        nome, 
        quantidade,
        concluido: false, 
        fixado: false 
    });
    salvarLocalStorage();
    renderizarLista();
    form.reset();
    document.getElementById("quantidadeItem").value = 1;
});

function concluirItem(index) {
    itens[index].concluido = !itens[index].concluido;
    salvarLocalStorage();
    renderizarLista();
}

// Função async agora para usar Swal
async function excluirItem(index) {
    const result = await Swal.fire({
        title: 'Confirmação',
        text: 'Deseja excluir este item?',
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
        itens.splice(index, 1);
        salvarLocalStorage();
        renderizarLista();

        await Swal.fire({
            icon: 'success',
            title: 'Item excluído!',
            timer: 1000,
            showConfirmButton: false,
            customClass: {
                popup: 'custom-alert'
            }
        });
    }
}

function fixarItem(index) {
    itens[index].fixado = !itens[index].fixado;
    salvarLocalStorage();
    renderizarLista();
}

clearCompletedBtn.addEventListener("click", async function () {
    const result = await Swal.fire({
        title: 'Confirmação',
        text: 'Deseja limpar todos os itens concluídos?',
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
        itens = itens.filter((item) => !item.concluido);
        salvarLocalStorage();
        renderizarLista();

        await Swal.fire({
            icon: 'success',
            title: 'Itens concluídos limpos!',
            timer: 1000,
            showConfirmButton: false,
            customClass: {
                popup: 'custom-alert'
            }
        });
    }
});

saveListBtn.addEventListener("click", function () {
    gerarRelatorioPDF();
});

filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
        filterBtns.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        currentFilter = this.dataset.filter;
        renderizarLista();
    });
});

function gerarRelatorioPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações do relatório
    const colunas = {
        quantidade: 20,
        item: 40,
        status: 180
    };

    // Cabeçalho do relatório
    doc.setFontSize(18);
    doc.text("Lista de Compras", 105, 15, { align: 'center' });

    doc.setFontSize(10);
    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    doc.text(`Data de emissão: ${dataEmissao}`, 105, 23, { align: 'center' });

    // Estatísticas
    doc.setFontSize(12);
    doc.text(`Total de itens: ${itens.length}`, 14, 35);
    doc.text(`Pendentes: ${itens.filter(item => !item.concluido).length}`, 14, 40);
    doc.text(`Concluídos: ${itens.filter(item => item.concluido).length}`, 14, 45);

    // Cabeçalho da lista
    doc.setFontSize(12);
    doc.setDrawColor(0);
    doc.setFillColor(200, 200, 200);
    doc.rect(10, 50, 190, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text("Qtd", colunas.quantidade, 57);
    doc.text("Item", colunas.item, 57);
    doc.text("Status", colunas.status, 57, { align: 'right' });

    let y = 65;
    const itensFixados = itens.filter(item => item.fixado);
    const itensNormais = itens.filter(item => !item.fixado);
    const itensOrdenados = [...itensFixados, ...itensNormais];

    itensOrdenados.forEach((item) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
            doc.setFontSize(12);
            doc.setDrawColor(0);
            doc.setFillColor(200, 200, 200);
            doc.rect(10, 10, 190, 10, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text("Qtd", colunas.quantidade, 17);
            doc.text("Item", colunas.item, 17);
            doc.text("Status", colunas.status, 17, { align: 'right' });
            y = 25;
        }

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(item.quantidade.toString(), colunas.quantidade, y);
        doc.text(item.nome, colunas.item, y);
        
        if (item.concluido) {
            doc.setTextColor(0, 128, 0); // Verde para concluído
            doc.text("CONCLUÍDO", colunas.status, y, { align: 'right' });
        } else {
            doc.setTextColor(255, 165, 0); // Laranja para pendente
            doc.text("PENDENTE", colunas.status, y, { align: 'right' });
        }

        doc.setDrawColor(200, 200, 200);
        doc.line(10, y + 5, 200, y + 5);
        
        y += 10;
    });

    doc.save(`Lista_Compras_${dataEmissao.replace(/\//g, '-')}.pdf`);
}

renderizarLista();

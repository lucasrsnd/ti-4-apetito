async function carregarPedidosCozinha() {
  try {
    const response = await fetch("http://localhost:8080/api/pedidos/cozinha");
    const pedidos = await response.json();

    const container = document.getElementById("pedidos-container");

    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Carregando pedidos...</h3>
                <p>Aguarde enquanto buscamos os pedidos ativos</p>
            </div>
        `;

    setTimeout(() => {
      if (pedidos.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <h3>Nenhum pedido ativo</h3>
                        <p>Quando houver novos pedidos, eles aparecerão aqui automaticamente</p>
                    </div>
                `;
        return;
      }

      container.innerHTML = "";

      pedidos.forEach((pedido) => {
        const pedidoDiv = document.createElement("div");
        pedidoDiv.className = "pedido-card";

        const tipoPedido = pedido.mesaId ? `Mesa ${pedido.mesaId}` : "Online";
        const tipoClass = pedido.mesaId ? "" : "online";

        const statusClass =
          pedido.status === "FINALIZADO"
            ? "status-finalizado"
            : "status-andamento";
        const statusText =
          pedido.status === "FINALIZADO" ? "PRONTO" : "EM PREPARO";
        const statusIcon =
          pedido.status === "FINALIZADO" ? "fa-check-circle" : "fa-clock";

        pedidoDiv.innerHTML = `
                    <div class="pedido-header">
                        <span class="pedido-id"><i class="fas fa-receipt"></i> Pedido #${
                          pedido.id
                        }</span>
                        <span class="pedido-tipo ${tipoClass}">
                            <i class="fas ${
                              pedido.mesaId ? "fa-chair" : "fa-mobile-alt"
                            }"></i> ${tipoPedido}
                        </span>
                    </div>
                    
                    <div class="item-list">
                        ${pedido.itens
                          .map(
                            (item) => `
                            <div class="item">
                                <span>
                                    <span class="item-quantidade">${
                                      item.quantidade
                                    }x</span>
                                    ${item.itemCardapio.nome}
                                </span>
                                <span>R$ ${(
                                  item.itemCardapio.preco * item.quantidade
                                ).toFixed(2)}</span>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                    
                    <div class="pedido-footer">
                        <span class="pedido-status ${statusClass}">
                            <i class="fas ${statusIcon}"></i> ${statusText}
                        </span>
                        <span><strong>Total:</strong> R$ ${pedido.total.toFixed(
                          2
                        )}</span>
                    </div>
                `;

        container.appendChild(pedidoDiv);
      });
    }, 300);

    setTimeout(carregarPedidosCozinha, 30000);
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    document.getElementById("pedidos-container").innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao carregar pedidos</h3>
                <p>Tente novamente ou verifique sua conexão</p>
                <button onclick="carregarPedidosCozinha()" style="
                    margin-top: 15px;
                    padding: 10px 20px;
                    background-color: var(--primary-color);
                    border: none;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                ">
                    <i class="fas fa-sync-alt"></i> Tentar novamente
                </button>
            </div>
        `;
  }
}

document.addEventListener("DOMContentLoaded", carregarPedidosCozinha);

document.addEventListener("keydown", (e) => {
  if (e.key === "F5") {
    e.preventDefault();
    carregarPedidosCozinha();
  }
});

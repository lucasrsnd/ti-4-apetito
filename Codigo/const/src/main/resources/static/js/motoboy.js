async function carregarPedidosMotoboy() {
  try {
    const response = await fetch("http://localhost:8080/api/pedidos/motoboy");
    const pedidos = await response.json();

    const container = document.getElementById("pedidos-container");

    container.innerHTML = `
            <div class="empty-state">
                <h3><i class="fas fa-spinner fa-spin"></i> Carregando pedidos...</h3>
                <p>Aguarde enquanto buscamos os pedidos para entrega</p>
            </div>
        `;

    setTimeout(async () => {
      if (pedidos.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <h3><i class="fas fa-box-open"></i> Nenhum pedido para entrega</h3>
                        <p>Quando houver novos pedidos online, eles aparecerão aqui</p>
                    </div>
                `;
        return;
      }

      pedidos.sort((a, b) => {
        if (a.status === "EM ROTA" && b.status !== "EM ROTA") return -1;
        if (b.status === "EM ROTA" && a.status !== "EM ROTA") return 1;
        return new Date(b.dataStatus || 0) - new Date(a.dataStatus || 0);
      });

      container.innerHTML = "";

      pedidos.forEach((pedido) => {
        const pedidoDiv = document.createElement("div");
        pedidoDiv.className = `pedido-card ${
          pedido.status === "EM ROTA" ? "em-rota" : ""
        } ${pedido.status === "ENTREGUE" ? "entregue" : ""}`;
        pedidoDiv.id = `pedido-${pedido.id}`;

        pedidoDiv.innerHTML = `
                    <div class="pedido-header">
                        <span class="pedido-id"><i class="fas fa-receipt"></i> Pedido #${
                          pedido.id
                        }</span>
                        <span class="pedido-status">${pedido.status}</span>
                    </div>
                    
                    <div class="pedido-info">
                        <div><span class="info-label"><i class="fas fa-user"></i> Cliente:</span> ${
                          pedido.nomeCliente
                        }</div>
                        <div><span class="info-label"><i class="fas fa-map-marker-alt"></i> Endereço:</span> ${
                          pedido.enderecoCliente
                        }</div>
                        <div><span class="info-label"><i class="fas fa-money-bill-wave"></i> Total:</span> R$ ${pedido.total.toFixed(
                          2
                        )}</div>
                        ${
                          pedido.dataStatus
                            ? `<div><span class="info-label"><i class="fas fa-clock"></i> Última atualização:</span> ${formatarData(
                                pedido.dataStatus
                              )}</div>`
                            : ""
                        }
                    </div>
                    
                    ${
                      pedido.status !== "ENTREGUE"
                        ? `
                    <div class="btn-container">
                        <button class="btn btn-rota" onclick="marcarEmRota(${
                          pedido.id
                        })" ${pedido.status === "EM ROTA" ? "disabled" : ""}>
                            <i class="fas fa-road"></i> Em Rota
                        </button>
                        <button class="btn btn-entregue" onclick="confirmarEntrega(${
                          pedido.id
                        })">
                            <i class="fas fa-check-circle"></i> Confirmar Entrega
                        </button>
                    </div>
                    `
                        : ""
                    }
                `;

        container.appendChild(pedidoDiv);
      });
    }, 300);
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    document.getElementById("pedidos-container").innerHTML = `
            <div class="empty-state">
                <h3><i class="fas fa-exclamation-triangle"></i> Erro ao carregar pedidos</h3>
                <p>Tente atualizar a página ou verificar sua conexão</p>
                <button class="btn btn-atualizar" onclick="carregarPedidosMotoboy()" style="margin-top: 15px;">
                    <i class="fas fa-sync-alt"></i> Tentar novamente
                </button>
            </div>
        `;
  }
}

function formatarData(dataString) {
  const data = new Date(dataString);
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function marcarEmRota(pedidoId) {
  try {
    const response = await fetch(
      `http://localhost:8080/api/pedidos/${pedidoId}/rota`,
      {
        method: "PUT",
      }
    );

    if (response.ok) {
      const pedidoDiv = document.getElementById(`pedido-${pedidoId}`);
      pedidoDiv.classList.add("em-rota");
      pedidoDiv.classList.remove("entregue");

      const btnRota = pedidoDiv.querySelector(".btn-rota");
      if (btnRota) btnRota.disabled = true;

      const statusElement = pedidoDiv.querySelector(".pedido-status");
      if (statusElement) {
        statusElement.textContent = "EM ROTA";
        statusElement.style.backgroundColor = "#e3f2fd";
        statusElement.style.color = "#2196F3";
      }

      let dateElement = pedidoDiv.querySelector(
        ".pedido-info div:nth-child(4)"
      );
      if (
        !dateElement ||
        !dateElement
          .querySelector(".info-label")
          .textContent.includes("atualização")
      ) {
        dateElement = document.createElement("div");
        pedidoDiv.querySelector(".pedido-info").appendChild(dateElement);
      }
      dateElement.innerHTML = `<span class="info-label"><i class="fas fa-clock"></i> Última atualização:</span> ${formatarData(
        new Date()
      )}`;

      document.getElementById("pedidos-container").prepend(pedidoDiv);

      showNotification(`Pedido #${pedidoId} marcado como EM ROTA`, "success");
    } else {
      showNotification("Erro ao atualizar status do pedido", "error");
    }
  } catch (error) {
    console.error("Erro:", error);
    showNotification("Erro ao conectar com o servidor", "error");
  }
}

async function confirmarEntrega(pedidoId) {
  const result = await Swal.fire({
    title: 'Confirmação',
    text: `Confirmar entrega do Pedido #${pedidoId}?`,
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

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(
      `http://localhost:8080/api/pedidos/${pedidoId}/entregue`,
      {
        method: "PUT",
      }
    );

    if (response.ok) {
      const pedidoDiv = document.getElementById(`pedido-${pedidoId}`);

      pedidoDiv.classList.add("entregue");
      pedidoDiv.classList.remove("em-rota");

      const btnContainer = pedidoDiv.querySelector(".btn-container");
      if (btnContainer) btnContainer.remove();

      const statusElement = pedidoDiv.querySelector(".pedido-status");
      if (statusElement) {
        statusElement.textContent = "ENTREGUE";
        statusElement.style.backgroundColor = "#e8f5e9";
        statusElement.style.color = "#4CAF50";
      }

      showNotification(`Pedido #${pedidoId} marcado como ENTREGUE`, "success");

      setTimeout(() => {
        pedidoDiv.remove();
        verificarListaVazia();
      }, 2000);
    } else {
      showNotification("Erro ao confirmar entrega", "error");
    }
  } catch (error) {
    console.error("Erro:", error);
    showNotification("Erro ao conectar com o servidor", "error");
  }
}


function verificarListaVazia() {
  if (document.querySelectorAll(".pedido-card").length === 0) {
    document.getElementById("pedidos-container").innerHTML = `
            <div class="empty-state">
                <h3><i class="fas fa-box-open"></i> Todos os pedidos foram entregues!</h3>
                <p>Novos pedidos aparecerão aqui automaticamente</p>
            </div>
        `;
  }
}

function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `<i class="fas fa-${
    type === "success" ? "check-circle" : "exclamation-circle"
  }"></i> ${message}`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  carregarPedidosMotoboy();

  setInterval(carregarPedidosMotoboy, 30000);
});

const style = document.createElement("style");
style.textContent = `
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: var(--border-radius);
    color: white;
    font-weight: 500;
    transform: translateY(100px);
    opacity: 0;
    transition: var(--transition);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 10px;
}

.notification.show {
    transform: translateY(0);
    opacity: 1;
}

.notification.success {
    background-color: var(--success-color);
}

.notification.error {
    background-color: var(--danger-color);
}
`;
document.head.appendChild(style);

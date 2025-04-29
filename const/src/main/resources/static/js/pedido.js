let pedidoId = null;

async function criarPedido() {
  const tipoPedido = document.getElementById("tipoPedido").value;
  const mesaId = document.getElementById("mesaSelect").value;
  const nomeCliente = document.getElementById("nomeCliente").value;
  const enderecoCliente = document.getElementById("enderecoCliente").value;

  if (!tipoPedido) {
    alert("Por favor, selecione um tipo de pedido.");
    return;
  }

  if (tipoPedido === "mesa" && (!mesaId || mesaId === "null")) {
    alert("Por favor, selecione uma mesa válida.");
    return;
  }

  if (tipoPedido === "online" && (!nomeCliente || !enderecoCliente)) {
    alert("Para pedidos online, preencha nome e endereço.");
    return;
  }

  const params = new URLSearchParams();
  params.append("tipoPedido", tipoPedido);

  if (tipoPedido === "mesa") {
    params.append("mesaId", mesaId);
  } else {
    params.append("nomeCliente", nomeCliente);
    params.append("enderecoCliente", enderecoCliente);
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/pedidos?${params.toString()}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const pedido = await response.json();
      pedidoId = pedido.id;
      alert("Pedido criado com sucesso!");
      await carregarCarrinho();

      console.log("Pedido criado:", pedido);
    } else {
      const error = await response.text();
      alert(`Erro ao criar pedido: ${error}`);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Erro ao conectar com o servidor");
  }
}

async function carregarCardapio() {
  try {
    const response = await fetch("http://localhost:8080/api/cardapio");
    if (!response.ok) throw new Error("Erro ao carregar cardápio");

    const itens = await response.json();
    const cardapioDiv = document.getElementById("cardapio");
    cardapioDiv.innerHTML = "";

    itens.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "item-cardapio";
      itemDiv.innerHTML = ` 
            <strong>${item.nome}</strong> - R$${item.preco.toFixed(2)}<br>
            <em>${item.descricao}</em><br>
            <input type="number" id="qtd-${
              item.id
            }" value="1" min="1" style="width: 50px;">
            <button class="btn-primary" onclick="adicionarItem(${
              item.id
            })">Adicionar</button>
        `;
      cardapioDiv.appendChild(itemDiv);
    });
  } catch (error) {
    console.error("Erro ao carregar cardápio:", error);
    alert("Erro ao carregar cardápio. Tente recarregar a página.");
  }
}

async function carregarCarrinho() {
  if (!pedidoId) {
    document.getElementById("carrinho").innerHTML = "<p>Carrinho vazio</p>";
    document.getElementById("totalCarrinho").innerText = "Total: R$ 0.00";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/pedidos/${pedidoId}`
    );
    if (!response.ok) throw new Error("Erro ao carregar carrinho");

    const pedido = await response.json();
    const carrinhoDiv = document.getElementById("carrinho");
    carrinhoDiv.innerHTML = "";

    if (!pedido.itens || pedido.itens.length === 0) {
      carrinhoDiv.innerHTML = "<p>Carrinho vazio</p>";
      document.getElementById("totalCarrinho").innerText = "Total: R$ 0.00";
      return;
    }

    pedido.itens.forEach((itemPedido) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "item-carrinho";
      itemDiv.innerHTML = ` 
            <strong>${itemPedido.itemCardapio.nome}</strong> - Qtd: ${itemPedido.quantidade}<br>
            <button class="btn-primary" onclick="removerItem(${itemPedido.id})">Remover</button>
        `;
      carrinhoDiv.appendChild(itemDiv);
    });

    await atualizarTotal();
  } catch (error) {
    console.error("Erro ao carregar carrinho:", error);
  }
}

async function atualizarTotal() {
  if (!pedidoId) return;

  try {
    const response = await fetch(
      `http://localhost:8080/api/pedidos/${pedidoId}/total`
    );
    if (response.ok) {
      const total = await response.json();
      document.getElementById(
        "totalCarrinho"
      ).innerText = `Total: R$ ${total.toFixed(2)}`;
    }
  } catch (error) {
    console.error("Erro ao atualizar total:", error);
  }
}

async function adicionarItem(itemCardapioId) {
  if (!pedidoId) {
    alert("Crie um pedido primeiro!");
    return;
  }

  const quantidade = document.getElementById(`qtd-${itemCardapioId}`).value;

  try {
    const response = await fetch(
      `http://localhost:8080/api/pedidos/${pedidoId}/itens/${itemCardapioId}?quantidade=${quantidade}`,
      {
        method: "POST",
      }
    );

    if (response.ok) {
      await carregarCarrinho();
    } else {
      const error = await response.text();
      alert(`Erro ao adicionar item: ${error}`);
    }
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    alert("Erro ao conectar com o servidor");
  }
}

async function removerItem(itemPedidoId) {
  if (!pedidoId) {
    alert("Crie um pedido primeiro!");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/pedidos/${pedidoId}/itens/${itemPedidoId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      await carregarCarrinho();
    } else {
      const error = await response.text();
      alert(`Erro ao remover item: ${error}`);
    }
  } catch (error) {
    console.error("Erro ao remover item:", error);
    alert("Erro ao conectar com o servidor");
  }
}

async function finalizarPedido() {
  if (!pedidoId) {
    alert("Crie um pedido primeiro!");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/pedidos/${pedidoId}/finalizar`,
      {
        method: "PUT",
      }
    );

    if (response.ok) {
      abrirModalAvaliacao();
    } else {
      const error = await response.text();
      alert(`Erro ao finalizar pedido: ${error}`);
    }
  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    alert("Erro ao conectar com o servidor");
  }
}

function abrirModalAvaliacao() {
  document.getElementById("modalAvaliacao").style.display = "block";
  criarEstrelas("ambiente");
  criarEstrelas("comida");
  criarEstrelas("atendimento");
}

function criarEstrelas(id) {
  const container = document.getElementById(id);
  container.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const estrela = document.createElement("span");
    estrela.innerHTML = "☆";
    estrela.style.fontSize = "24px";
    estrela.style.cursor = "pointer";
    estrela.dataset.value = i;
    estrela.onclick = function () {
      selecionarEstrelas(id, i);
    };
    container.appendChild(estrela);
  }
}

function selecionarEstrelas(id, valor) {
  const estrelas = document.querySelectorAll(`#${id} span`);
  estrelas.forEach((estrela, index) => {
    estrela.innerHTML = index < valor ? "★" : "☆";
  });
  document.getElementById(id).dataset.nota = valor;
}

function enviarAvaliacao() {
  const notaAmbiente = document.getElementById("ambiente").dataset.nota || 0;
  const notaComida = document.getElementById("comida").dataset.nota || 0;
  const notaAtendimento =
    document.getElementById("atendimento").dataset.nota || 0;
  const comentario = document.getElementById("comentario").value;

  const avaliacao = {
    ambiente: notaAmbiente,
    comida: notaComida,
    atendimento: notaAtendimento,
    comentario: comentario,
    data: new Date().toISOString(),
  };

  localStorage.setItem(`avaliacao_${pedidoId}`, JSON.stringify(avaliacao));
  alert("Obrigado pela sua avaliação!");
  document.getElementById("modalAvaliacao").style.display = "none";

  pedidoId = null;
  carregarCarrinho();
}

function atualizarTipoPedido() {
  const tipoPedido = document.getElementById("tipoPedido").value;
  const mesaSelecionada = document.getElementById("mesaSelecionada");
  const dadosCliente = document.getElementById("dadosCliente");

  if (tipoPedido === "mesa") {
    mesaSelecionada.style.display = "block";
    dadosCliente.style.display = "none";
    carregarMesas();
  } else {
    mesaSelecionada.style.display = "none";
    dadosCliente.style.display = "block";
  }
}

async function carregarMesas() {
  try {
    const response = await fetch("http://localhost:8080/mesas");
    const mesas = await response.json();

    const todasOcupadas = mesas.every((mesa) => mesa.status === "ocupado");

    if (todasOcupadas) {
      alert(
        "Todas as mesas estão ocupadas no momento. Por favor, aguarde na fila de espera."
      );
      return;
    }

    const mesaSelect = document.getElementById("mesaSelect");
    mesaSelect.innerHTML = `<option value="null">Selecione uma mesa</option>`;

    mesas.forEach((mesa) => {
      if (mesa.status !== "ocupado") {
        const option = document.createElement("option");
        option.value = mesa.id;
        option.textContent = `Mesa ${mesa.id}`;
        mesaSelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Erro ao carregar mesas:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarCardapio();
  atualizarTipoPedido();
});

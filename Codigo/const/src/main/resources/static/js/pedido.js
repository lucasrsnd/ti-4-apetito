let pedidoId = null;
let itensCardapio = [];

async function criarPedido() {
  const tipoPedido = document.getElementById("tipoPedido").value;
  const mesaId = document.getElementById("mesaSelect").value;
  const nomeCliente = document.getElementById("nomeCliente").value;
  const telefoneCliente = document.getElementById("telefoneCliente").value;
  const enderecoCliente = document.getElementById("enderecoCliente").value;

  if (!tipoPedido) {
    showAlert("Aviso", "Por favor, selecione um tipo de pedido.", "warning");
    return;
  }

  if (tipoPedido === "mesa" && (!mesaId || mesaId === "null")) {
    showAlert("Aviso", "Por favor, selecione uma mesa válida.", "warning");
    return;
  }

  if (tipoPedido === "online" && (!nomeCliente || !telefoneCliente || !enderecoCliente)) {
    showAlert("Aviso", "Para pedidos online, preencha nome, WhatsApp e endereço.", "warning");
    return;
  }

  const params = new URLSearchParams();
  params.append("tipoPedido", tipoPedido);

  if (tipoPedido === "mesa") {
    params.append("mesaId", mesaId);
  } else {
    params.append("nomeCliente", nomeCliente);
    params.append("telefoneCliente", telefoneCliente);
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
      // Salva o telefone no localStorage associado ao pedidoId
      if (telefoneCliente) {
        localStorage.setItem(`pedido_${pedidoId}_telefone`, telefoneCliente);
      }
      showAlert("Sucesso", "Pedido criado com sucesso!", "success");
      await carregarCarrinho();
    } else {
      const error = await response.text();
      showAlert("Erro", `Erro ao criar pedido: ${error}`, "error");
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    showAlert("Erro", "Erro ao conectar com o servidor", "error");
  }
}

async function carregarCardapio() {
  try {
    const response = await fetch("http://localhost:8080/api/cardapio");
    if (!response.ok) throw new Error("Erro ao carregar cardápio");
    itensCardapio = await response.json();
    exibirItensCardapio(itensCardapio);
  } catch (error) {
    console.error("Erro ao carregar cardápio:", error);
    showAlert("Erro", "Erro ao carregar cardápio. Tente recarregar a página.", "error");
  }
}

function exibirItensCardapio(itens) {
  const cardapioDiv = document.getElementById("cardapio");
  cardapioDiv.innerHTML = "";

  itens.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item-cardapio";
    itemDiv.innerHTML = ` 
      <strong>${item.nome}</strong> - R$${item.preco.toFixed(2)}<br>
      <em>${item.descricao}</em><br>
      <input type="number" id="qtd-${item.id}" value="1" min="1" style="width: 50px;">
      <button class="btn-primary" onclick="adicionarItem(${item.id})">Adicionar</button>
    `;
    cardapioDiv.appendChild(itemDiv);
  });
}

function filtrarCardapio() {
  const termo = document.getElementById("filtroCardapio").value.toLowerCase();
  
  if (!termo) {
    exibirItensCardapio(itensCardapio);
    return;
  }

  const itensFiltrados = itensCardapio.filter(item => 
    item.nome.toLowerCase().includes(termo)
  );

  itensFiltrados.sort((a, b) => {
    const aComeca = a.nome.toLowerCase().startsWith(termo);
    const bComeca = b.nome.toLowerCase().startsWith(termo);
    
    if (aComeca && !bComeca) return -1;
    if (!aComeca && bComeca) return 1;
    return 0;
  });

  exibirItensCardapio(itensFiltrados);
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
      document.getElementById("totalCarrinho").innerText = `Total: R$ ${total.toFixed(2)}`;
    }
  } catch (error) {
    console.error("Erro ao atualizar total:", error);
  }
}

async function adicionarItem(itemCardapioId) {
  if (!pedidoId) {
    showAlert("Aviso", "Crie um pedido primeiro!", "warning");
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
      showAlert("Erro", `Erro ao adicionar item: ${error}`, "error");
    }
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    showAlert("Erro", "Erro ao conectar com o servidor", "error");
  }
}

async function removerItem(itemPedidoId) {
  if (!pedidoId) {
    showAlert("Aviso", "Crie um pedido primeiro!", "warning");
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
      showAlert("Erro", `Erro ao remover item: ${error}`, "error");
    }
  } catch (error) {
    console.error("Erro ao remover item:", error);
    showAlert("Erro", "Erro ao conectar com o servidor", "error");
  }
}

async function finalizarPedido() {
  if (!pedidoId) {
    showAlert("Aviso", "Crie um pedido primeiro!", "warning");
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
      showAlert("Erro", `Erro ao finalizar pedido: ${error}`, "error");
    }
  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    showAlert("Erro", "Erro ao conectar com o servidor", "error");
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

const CLIENTE_SESSION_KEY = 'cliente_session_pedidos';

function getSessionId() {
  let sessionId = localStorage.getItem('current_session_id');
  if (!sessionId) {
    sessionId = 'sessao_' + Date.now();
    localStorage.setItem('current_session_id', sessionId);
  }
  return sessionId;
}

async function enviarAvaliacao() {
  const notaAmbiente = document.getElementById("ambiente").dataset.nota || 0;
  const notaComida = document.getElementById("comida").dataset.nota || 0;
  const notaAtendimento = document.getElementById("atendimento").dataset.nota || 0;
  const comentario = document.getElementById("comentario").value;

  const avaliacao = {
    ambiente: notaAmbiente,
    comida: notaComida,
    atendimento: notaAtendimento,
    comentario: comentario,
    data: new Date().toISOString(),
  };

  localStorage.setItem(`avaliacao_${pedidoId}`, JSON.stringify(avaliacao));
  
  const sessionId = getSessionId();
  const historico = JSON.parse(localStorage.getItem(CLIENTE_SESSION_KEY) || '{}');
  
  if (!historico[sessionId]) {
    historico[sessionId] = [];
  }
  
  try {
    const response = await fetch(`http://localhost:8080/api/pedidos/${pedidoId}`);
    if (response.ok) {
      const pedido = await response.json();
      historico[sessionId].push({
        id: pedidoId,
        data: new Date().toISOString(),
        tipo: pedido.tipoPedido,
        itens: pedido.itens,
        total: pedido.total,
        status: 'Finalizado',
        avaliacao: avaliacao
      });
      localStorage.setItem(CLIENTE_SESSION_KEY, JSON.stringify(historico));
    }
  } catch (error) {
    console.error("Erro ao buscar detalhes do pedido:", error);
  }

  showAlert("Sucesso", "Obrigado pela sua avaliação!", "success");

  document.getElementById("modalAvaliacao").style.display = "none";

  pedidoId = null;
  carregarCarrinho();
}

function limparSessao() {
  const sessionId = localStorage.getItem('current_session_id');
  if (sessionId) {
    const historico = JSON.parse(localStorage.getItem(CLIENTE_SESSION_KEY) || '{}');
    delete historico[sessionId];
    localStorage.setItem(CLIENTE_SESSION_KEY, JSON.stringify(historico));
  }
  localStorage.removeItem('current_session_id');
  window.location.href = 'cliente.html';
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
      showAlert("Aviso", "Todas as mesas estão ocupadas no momento. Por favor, aguarde na fila de espera.", "warning");
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
  inicializarRoleta();
});

let podeGirar = true;
let premioAtual = null;

function inicializarRoleta() {
    const roletaBtn = document.getElementById("roletaBtn");
    const modal = document.getElementById("roletaModal");
    const closeBtn = document.querySelector(".roleta-close-btn");
    const girarBtn = document.getElementById("girarRoletaBtn");
    const resgateOnlineBtn = document.getElementById("resgateOnlineBtn");
    const resgatePresencialBtn = document.getElementById("resgatePresencialBtn");
    const confirmarOnlineBtn = document.getElementById("confirmarOnlineBtn");

    roletaBtn.addEventListener("click", function() {
        modal.style.display = "block";
        resetarRoleta();
    });

    closeBtn.addEventListener("click", function() {
        modal.style.display = "none";
        const confettiContainer = document.querySelector(".confetti-container");
        if (confettiContainer) confettiContainer.remove();
    });

    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
            const confettiContainer = document.querySelector(".confetti-container");
            if (confettiContainer) confettiContainer.remove();
        }
    });

    girarBtn.addEventListener("click", function() {
        if (podeGirar) girarRoleta();
    });

    resgateOnlineBtn.addEventListener("click", function() {
        document.getElementById("opcoesResgate").classList.add("hidden");
        document.getElementById("formularioOnline").classList.remove("hidden");
    });

    resgatePresencialBtn.addEventListener("click", function() {
        document.getElementById("opcoesResgate").classList.add("hidden");
        const codigo = gerarCodigo();
        document.getElementById("roletaCodigo").textContent = codigo;
        document.getElementById("codigoPresencial").classList.remove("hidden");
        salvarPremio(codigo);
    });

    confirmarOnlineBtn.addEventListener("click", function() {
        const nome = document.getElementById("roletaNome").value;
        const telefone = document.getElementById("roletaTelefone").value;
        const endereco = document.getElementById("roletaEndereco").value;

        if (!nome || !telefone || !endereco) {
            showAlert("Aviso", "Por favor, preencha todos os campos!", "warning");
            return;
        }

        const codigo = gerarCodigo();
        salvarPremio(codigo, { nome, telefone, endereco: endereco });
        showAlert("Sucesso", `Prêmio confirmado! Seu código de resgate é: ${codigo}`, "success");

        modal.style.display = "none";
        const confettiContainer = document.querySelector(".confetti-container");
        if (confettiContainer) confettiContainer.remove();
    });
}

function girarRoleta() {
    const roleta = document.getElementById("roleta");
    const girarBtn = document.getElementById("girarRoletaBtn");
    const resultado = document.getElementById("resultadoRoleta");
    const textoResultado = document.getElementById("textoResultado");
    const opcoesResgate = document.getElementById("opcoesResgate");
    const formularioOnline = document.getElementById("formularioOnline");
    const codigoPresencial = document.getElementById("codigoPresencial");

    girarBtn.disabled = true;
    girarBtn.textContent = "Girando...";

    resultado.classList.remove("hidden");
    opcoesResgate.classList.add("hidden");
    formularioOnline.classList.add("hidden");
    codigoPresencial.classList.add("hidden");
    textoResultado.classList.remove("vitoria");

    const confettiContainer = document.querySelector(".confetti-container");
    if (confettiContainer) confettiContainer.remove();

    const voltas = 5 + Math.floor(Math.random() * 5);
    const anguloPorPremio = 45;
    const premios = ["sobremesa", "nada", "bebida", "nada", "prato-feito", "nada"];
    const premioIndex = Math.floor(Math.random() * premios.length);
    const anguloFinal = voltas * 360 + (premioIndex * anguloPorPremio);
    
    roleta.style.transform = `rotate(${-anguloFinal}deg)`;
    
    setTimeout(() => {
        premioAtual = premios[premioIndex];
        
        switch(premioAtual) {
            case "sobremesa":
                textoResultado.textContent = "Parabéns! Você ganhou uma sobremesa grátis!";
                textoResultado.style.color = "#FF9E80";
                criarConfetes();
                textoResultado.classList.add("vitoria");
                break;
            case "bebida":
                textoResultado.textContent = "Parabéns! Você ganhou uma bebida grátis!";
                textoResultado.style.color = "#80DEEA";
                criarConfetes();
                textoResultado.classList.add("vitoria");
                break;
            case "prato-feito":
                textoResultado.textContent = "Parabéns! Você ganhou um prato feito grátis!";
                textoResultado.style.color = "#CE93D8";
                criarConfetes();
                textoResultado.classList.add("vitoria");
                break;
            case "nada":
                textoResultado.textContent = "Não foi dessa vez! Tente novamente mais tarde.";
                textoResultado.style.color = "#888";
                break;
        }
        
        if (premioAtual !== "nada") {
            opcoesResgate.classList.remove("hidden");
        }

        girarBtn.style.display = "none";
        
        localStorage.setItem("ultimaRodadaRoleta", new Date().toISOString());
    }, 5000);
}

function criarConfetes() {
    const colors = ['#FF9E80', '#80DEEA', '#CE93D8', '#C5E1A5', '#FFE082', '#EF9A9A', '#90CAF9', '#A5D6A7', '#FFC107', '#FFA000'];
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        container.appendChild(confetti);
    }
    
    setTimeout(() => container.remove(), 3000);
}

function resetarRoleta() {
    const roleta = document.getElementById("roleta");
    roleta.style.transform = "rotate(0deg)";
    premioAtual = null;
    document.getElementById("resultadoRoleta").classList.add("hidden");
    document.getElementById("roletaNome").value = "";
    document.getElementById("roletaTelefone").value = "";
    document.getElementById("roletaEndereco").value = "";
    const girarBtn = document.getElementById("girarRoletaBtn");
    girarBtn.disabled = false;
    girarBtn.textContent = "Girar Roleta";
    girarBtn.style.display = "block";
}

function gerarCodigo() {
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const numeros = "23456789";
    let codigo = "";
    for (let i = 0; i < 2; i++) codigo += letras.charAt(Math.floor(Math.random() * letras.length));
    for (let i = 0; i < 4; i++) codigo += numeros.charAt(Math.floor(Math.random() * numeros.length));
    return codigo;
}

function salvarPremio(codigo, dadosCliente = null) {
    if (premioAtual === "nada") return;
    const premios = JSON.parse(localStorage.getItem("premiosCliente") || "[]");
    const novoPremio = {
        id: Date.now(),
        codigo: codigo,
        tipo: premioAtual,
        data: new Date().toISOString(),
        resgatado: false,
        dadosCliente: dadosCliente
    };
    premios.push(novoPremio);
    localStorage.setItem("premiosCliente", JSON.stringify(premios));
}
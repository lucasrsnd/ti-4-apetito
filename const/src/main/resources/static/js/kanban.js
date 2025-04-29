const kanban = document.getElementById("kanban");
const adicionarColunaBtn = document.getElementById("adicionarColunaBtn");
const modal = document.getElementById("modal");
const tituloCartao = document.getElementById("tituloCartao");
const descricaoCartao = document.getElementById("descricaoCartao");
const comentariosCartao = document.getElementById("comentariosCartao");
const salvarEdicao = document.getElementById("salvarEdicao");
const cancelarEdicao = document.getElementById("cancelarEdicao");

let dados = JSON.parse(localStorage.getItem("kanban-dados")) || [];
let cartaoEditando = null;
let colunaEditando = null;

function salvarDados() {
  localStorage.setItem("kanban-dados", JSON.stringify(dados));
}

function abrirModal(cartao, colunaIndex, cartaoIndex) {
  tituloCartao.value = cartao.titulo;
  descricaoCartao.value = cartao.descricao || "";
  comentariosCartao.value = (cartao.comentarios || []).join("\n");
  cartaoEditando = cartaoIndex;
  colunaEditando = colunaIndex;
  modal.style.display = "flex";
}

salvarEdicao.addEventListener("click", () => {
  const novoTitulo = tituloCartao.value.trim();
  const novaDescricao = descricaoCartao.value.trim();
  const novosComentarios = comentariosCartao.value
    .trim()
    .split("\n")
    .filter((c) => c);

  if (novoTitulo) {
    dados[colunaEditando].cartoes[cartaoEditando].titulo = novoTitulo;
    dados[colunaEditando].cartoes[cartaoEditando].descricao = novaDescricao;
    dados[colunaEditando].cartoes[cartaoEditando].comentarios =
      novosComentarios;
    salvarDados();
    atualizarTela();
    modal.style.display = "none";
  }
});

cancelarEdicao.addEventListener("click", () => {
  modal.style.display = "none";
});

function criarCartao(cartao, colunaIndex, cartaoIndex) {
  const cartaoEl = document.createElement("div");
  cartaoEl.className = "cartao";
  cartaoEl.draggable = true;
  cartaoEl.textContent = cartao.titulo;

  cartaoEl.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ colunaIndex, cartaoIndex })
    );
  });

  const acoes = document.createElement("div");
  acoes.className = "acoes";

  const btnFixar = document.createElement("button");
  btnFixar.textContent = "Fixar";
  btnFixar.onclick = () => {
    const [item] = dados[colunaIndex].cartoes.splice(cartaoIndex, 1);
    dados[colunaIndex].cartoes.unshift(item);
    salvarDados();
    atualizarTela();
  };

  const btnEditar = document.createElement("button");
  btnEditar.textContent = "Editar";
  btnEditar.onclick = () => abrirModal(cartao, colunaIndex, cartaoIndex);

  const btnExcluir = document.createElement("button");
  btnExcluir.textContent = "Excluir";
  btnExcluir.onclick = () => {
    dados[colunaIndex].cartoes.splice(cartaoIndex, 1);
    salvarDados();
    atualizarTela();
  };

  acoes.appendChild(btnFixar);
  acoes.appendChild(btnEditar);
  acoes.appendChild(btnExcluir);
  cartaoEl.appendChild(acoes);

  return cartaoEl;
}

function criarColuna(titulo, cartoes, indexColuna) {
  const coluna = document.createElement("div");
  coluna.className = "coluna";

  const tituloEl = document.createElement("h2");
  tituloEl.textContent = titulo;

  const containerCartoes = document.createElement("div");
  containerCartoes.className = "cartoes";
  containerCartoes.addEventListener("dragover", (e) => e.preventDefault());
  containerCartoes.addEventListener("drop", (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const [cartaoMovido] = dados[data.colunaIndex].cartoes.splice(
      data.cartaoIndex,
      1
    );
    dados[indexColuna].cartoes.push(cartaoMovido);
    salvarDados();
    atualizarTela();
  });

  cartoes.forEach((cartao, cartaoIndex) => {
    containerCartoes.appendChild(criarCartao(cartao, indexColuna, cartaoIndex));
  });

  const botaoAdicionarCartao = document.createElement("button");
  botaoAdicionarCartao.className = "adicionarCartaoBtn";
  botaoAdicionarCartao.textContent = "+ Adicionar Cartão";
  botaoAdicionarCartao.addEventListener("click", () => {
    const titulo = prompt("Digite o título do novo cartão:");
    if (titulo) {
      dados[indexColuna].cartoes.push({
        titulo: titulo,
        descricao: "",
        comentarios: [],
      });
      salvarDados();
      atualizarTela();
    }
  });

  coluna.appendChild(tituloEl);
  coluna.appendChild(containerCartoes);
  coluna.appendChild(botaoAdicionarCartao);

  return coluna;
}

function atualizarTela() {
  kanban.innerHTML = "";
  dados.forEach((coluna, index) => {
    kanban.appendChild(criarColuna(coluna.titulo, coluna.cartoes, index));
  });
}

adicionarColunaBtn.addEventListener("click", () => {
  const titulo = prompt("Digite o título da nova coluna:");
  if (titulo) {
    dados.push({ titulo: titulo, cartoes: [] });
    salvarDados();
    atualizarTela();
  }
});

function criarColuna(titulo, cartoes, indexColuna) {
  const coluna = document.createElement("div");
  coluna.className = "coluna";

  const cabecalho = document.createElement("div");
  cabecalho.className = "cabecalho-coluna";

  const tituloEl = document.createElement("h2");
  tituloEl.textContent = titulo;

  const btnExcluirColuna = document.createElement("button");
  btnExcluirColuna.className = "btn-excluir-coluna";
  btnExcluirColuna.innerHTML = "&times;";
  btnExcluirColuna.onclick = (e) => {
    e.stopPropagation();
    if (
      confirm(
        `Tem certeza que deseja excluir a coluna "${titulo}" e todos os seus cartões?`
      )
    ) {
      excluirColuna(indexColuna);
    }
  };

  cabecalho.appendChild(tituloEl);
  cabecalho.appendChild(btnExcluirColuna);
  coluna.appendChild(cabecalho);

  const containerCartoes = document.createElement("div");
  containerCartoes.className = "cartoes";
  containerCartoes.addEventListener("dragover", (e) => e.preventDefault());
  containerCartoes.addEventListener("drop", (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const [cartaoMovido] = dados[data.colunaIndex].cartoes.splice(
      data.cartaoIndex,
      1
    );
    dados[indexColuna].cartoes.push(cartaoMovido);
    salvarDados();
    atualizarTela();
  });

  cartoes.forEach((cartao, cartaoIndex) => {
    containerCartoes.appendChild(criarCartao(cartao, indexColuna, cartaoIndex));
  });

  const botaoAdicionarCartao = document.createElement("button");
  botaoAdicionarCartao.className = "adicionarCartaoBtn";
  botaoAdicionarCartao.textContent = "+ Adicionar Cartão";
  botaoAdicionarCartao.addEventListener("click", () => {
    const titulo = prompt("Digite o título do novo cartão:");
    if (titulo) {
      dados[indexColuna].cartoes.push({
        titulo: titulo,
        descricao: "",
        comentarios: [],
      });
      salvarDados();
      atualizarTela();
    }
  });

  coluna.appendChild(containerCartoes);
  coluna.appendChild(botaoAdicionarCartao);

  return coluna;
}

function excluirColuna(index) {
  dados.splice(index, 1);
  salvarDados();
  atualizarTela();
}

atualizarTela();

function criarCartao(cartao, colunaIndex, cartaoIndex) {
  const cartaoEl = document.createElement("div");
  cartaoEl.className = "cartao";
  cartaoEl.draggable = true;

  const cartaoConteudo = document.createElement("div");
  cartaoConteudo.className = "cartao-conteudo";
  cartaoConteudo.textContent = cartao.titulo;
  cartaoEl.appendChild(cartaoConteudo);

  cartaoEl.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ colunaIndex, cartaoIndex })
    );
  });

  const acoes = document.createElement("div");
  acoes.className = "acoes";

  const btnFixar = document.createElement("button");
  btnFixar.innerHTML = '<i class="fas fa-thumbtack"></i>';
  btnFixar.title = "Fixar cartão";
  btnFixar.onclick = (e) => {
    e.stopPropagation();
    const [item] = dados[colunaIndex].cartoes.splice(cartaoIndex, 1);
    dados[colunaIndex].cartoes.unshift(item);
    salvarDados();
    atualizarTela();
  };

  const btnEditar = document.createElement("button");
  btnEditar.innerHTML = '<i class="fas fa-edit"></i>';
  btnEditar.title = "Editar cartão";
  btnEditar.onclick = (e) => {
    e.stopPropagation();
    abrirModal(cartao, colunaIndex, cartaoIndex);
  };

  const btnExcluir = document.createElement("button");
  btnExcluir.innerHTML = '<i class="fas fa-trash"></i>';
  btnExcluir.title = "Excluir cartão";
  btnExcluir.onclick = (e) => {
    e.stopPropagation();
    if (
      confirm(`Tem certeza que deseja excluir o cartão "${cartao.titulo}"?`)
    ) {
      dados[colunaIndex].cartoes.splice(cartaoIndex, 1);
      salvarDados();
      atualizarTela();
    }
  };

  acoes.appendChild(btnFixar);
  acoes.appendChild(btnEditar);
  acoes.appendChild(btnExcluir);
  cartaoEl.appendChild(acoes);

  return cartaoEl;
}

function criarColuna(titulo, cartoes, indexColuna) {
  const coluna = document.createElement("div");
  coluna.className = "coluna";

  const cabecalho = document.createElement("div");
  cabecalho.className = "cabecalho-coluna";

  const tituloEl = document.createElement("h2");
  tituloEl.textContent = titulo;

  const btnExcluirColuna = document.createElement("button");
  btnExcluirColuna.className = "btn-excluir-coluna";
  btnExcluirColuna.innerHTML = '<i class="fas fa-times"></i>';
  btnExcluirColuna.title = "Excluir coluna";
  btnExcluirColuna.onclick = (e) => {
    e.stopPropagation();
    if (dados.length <= 1) {
      alert("Você não pode excluir a última coluna!");
      return;
    }
    if (
      confirm(
        `Tem certeza que deseja excluir a coluna "${titulo}" e todos os seus cartões?`
      )
    ) {
      excluirColuna(indexColuna);
    }
  };

  cabecalho.appendChild(tituloEl);
  cabecalho.appendChild(btnExcluirColuna);
  coluna.appendChild(cabecalho);

  const containerCartoes = document.createElement("div");
  containerCartoes.className = "cartoes";
  containerCartoes.addEventListener("dragover", (e) => e.preventDefault());
  containerCartoes.addEventListener("drop", (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const [cartaoMovido] = dados[data.colunaIndex].cartoes.splice(
      data.cartaoIndex,
      1
    );
    dados[indexColuna].cartoes.push(cartaoMovido);
    salvarDados();
    atualizarTela();
  });

  cartoes.forEach((cartao, cartaoIndex) => {
    containerCartoes.appendChild(criarCartao(cartao, indexColuna, cartaoIndex));
  });

  const botaoAdicionarCartao = document.createElement("button");
  botaoAdicionarCartao.className = "adicionarCartaoBtn";
  botaoAdicionarCartao.innerHTML =
    '<i class="fas fa-plus"></i> Adicionar Cartão';
  botaoAdicionarCartao.addEventListener("click", () => {
    const titulo = prompt("Digite o título do novo cartão:");
    if (titulo) {
      dados[indexColuna].cartoes.push({
        titulo: titulo,
        descricao: "",
        comentarios: [],
      });
      salvarDados();
      atualizarTela();
    }
  });

  coluna.appendChild(containerCartoes);
  coluna.appendChild(botaoAdicionarCartao);

  return coluna;
}

salvarEdicao.innerHTML = '<i class="fas fa-save"></i> Salvar';
cancelarEdicao.innerHTML = '<i class="fas fa-times"></i> Cancelar';

adicionarColunaBtn.innerHTML = '<i class="fas fa-plus"></i> Nova Coluna';

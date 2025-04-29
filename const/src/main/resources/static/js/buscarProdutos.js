document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("search-button")
    .addEventListener("click", buscarProdutos);

  document.getElementById("product-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      buscarProdutos();
    }
  });
});

async function buscarProdutos() {
  const produto = document.getElementById("product-input").value.trim();
  const container = document.getElementById("results-container");

  if (!produto) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Digite um produto para buscar</h3>
                <p>Por favor, insira o nome de um produto alimentício</p>
            </div>
        `;
    return;
  }

  try {
    container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> Buscando produtos...
            </div>
        `;

    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        produto
      )}&search_simple=1&action=process&json=1&page_size=10`
    );
    const data = await response.json();

    container.innerHTML = "";

    if (data.products && data.products.length > 0) {
      let produtosValidos = 0;

      const produtosFiltrados = data.products.filter(
        (prod) => prod.product_name && prod.product_name.trim() !== ""
      );

      if (produtosFiltrados.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <h3>Nenhum produto completo encontrado</h3>
                        <p>Tente termos de busca mais específicos</p>
                    </div>
                `;
        return;
      }

      produtosFiltrados.forEach((prod) => {
        try {
          const card = document.createElement("div");
          card.className = "product-card";

          const imagem =
            prod.image_url || "https://via.placeholder.com/300?text=Sem+Imagem";
          const nome = prod.product_name || "Produto sem nome";
          const marca = prod.brands || "Marca não informada";
          const quantidade =
            prod.product_quantity || "Quantidade não informada";
          const lojas = prod.stores || "Disponibilidade não informada";
          const nutriScore = prod.nutriscore_grade
            ? prod.nutriscore_grade.toUpperCase()
            : null;

          card.innerHTML = `
                        <img src="${imagem}" alt="${nome}" class="product-image" onerror="this.src='https://via.placeholder.com/300?text=Imagem+Não+Disponível'">
                        <div class="product-content">
                            <h3 class="product-title">${nome}</h3>
                            
                            ${
                              nutriScore
                                ? `
                            <div class="product-info" style="margin-bottom: 15px;">
                                <span style="background-color: ${getNutriScoreColor(
                                  nutriScore
                                )}; 
                                    color: white; 
                                    padding: 3px 8px;
                                    border-radius: 4px;
                                    font-weight: bold;">
                                    Nutri-Score: ${nutriScore}
                                </span>
                            </div>
                            `
                                : ""
                            }
                            
                            <div class="product-info">
                                <i class="fas fa-tag"></i> ${marca}
                            </div>
                            
                            <div class="product-info">
                                <i class="fas fa-weight-hanging"></i> ${quantidade}
                            </div>
                            
                            <div class="product-info">
                                <i class="fas fa-store"></i> ${lojas}
                            </div>
                        </div>
                    `;

          container.appendChild(card);
          produtosValidos++;
        } catch (error) {
          console.error("Erro ao processar produto:", prod, error);
        }
      });
    } else {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>Nenhum produto encontrado</h3>
                    <p>Tente outro termo de busca</p>
                </div>
            `;
    }
  } catch (error) {
    console.error("Erro na busca:", error);
    container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao buscar produtos</h3>
                <p>Tente novamente mais tarde</p>
                <button onclick="buscarProdutos()" style="
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

function getNutriScoreColor(grade) {
  const colors = {
    A: "#038141",
    B: "#85BB2F",
    C: "#FECB02",
    D: "#EE8100",
    E: "#E63E11",
  };
  return colors[grade] || "#777";
}

// Array para manter a ordem original das mesas
let mesasOrdenadas = [];

function carregarMesas() {
  fetch("http://localhost:8080/mesas")
    .then((response) => response.json())
    .then((mesas) => {
      mesasOrdenadas = mesas.sort((a, b) => a.id - b.id);

      const container = document.getElementById("mesas-container");
      container.innerHTML = "";

      mesasOrdenadas.forEach((mesa) => {
        const mesaElement = document.createElement("div");
        mesaElement.classList.add("mesa", mesa.status);

        mesaElement.innerHTML = `
          <h3>Mesa ${mesa.id}</h3>
          <div class="icon">
            ${
              mesa.status === "livre"
                ? '<i class="fas fa-check-circle"></i>'
                : '<i class="fas fa-times-circle"></i>'
            }
          </div>
          <div class="status">${
            mesa.status === "livre" ? "Livre" : "Ocupada"
          }</div>
        `;

        mesaElement.addEventListener("click", () => alterarStatusMesa(mesa.id));
        container.appendChild(mesaElement);
      });
    })
    .catch((error) => console.error("Erro ao carregar mesas:", error));
}

function alterarStatusMesa(id) {
  fetch(`http://localhost:8080/mesas/${id}`, {
    method: "PUT",
  })
    .then(() => {
      const mesaIndex = mesasOrdenadas.findIndex((m) => m.id === id);
      if (mesaIndex !== -1) {
        mesasOrdenadas[mesaIndex].status =
          mesasOrdenadas[mesaIndex].status === "livre" ? "ocupada" : "livre";

        const mesaElement = document.querySelector(
          `.mesa:nth-child(${mesaIndex + 1})`
        );
        if (mesaElement) {
          mesaElement.className = "mesa " + mesasOrdenadas[mesaIndex].status;
          mesaElement.querySelector(".icon").innerHTML =
            mesasOrdenadas[mesaIndex].status === "livre"
              ? '<i class="fas fa-check-circle"></i>'
              : '<i class="fas fa-times-circle"></i>';
          mesaElement.querySelector(".status").textContent =
            mesasOrdenadas[mesaIndex].status === "livre" ? "Livre" : "Ocupada";
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao alterar status da mesa:", error);
      carregarMesas();
    });
}

function adicionarMesa() {
  fetch("http://localhost:8080/mesas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "livre" }),
  })
    .then(() => carregarMesas())
    .catch((error) => console.error("Erro ao adicionar mesa:", error));
}

window.onload = carregarMesas;

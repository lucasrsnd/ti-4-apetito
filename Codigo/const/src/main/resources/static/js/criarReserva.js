const form = document.getElementById("formReserva");
const divMesas = document.getElementById("mesas");
let mesaSelecionada = null;

function criarMesas(qtd) {
  divMesas.innerHTML = "";
  for (let i = 1; i <= qtd; i++) {
    const div = document.createElement("div");
    div.className = "mesa";
    div.textContent = i;
    div.addEventListener("click", function () {
      document
        .querySelectorAll(".mesa")
        .forEach((m) => m.classList.remove("selecionada"));
      div.classList.add("selecionada");
      mesaSelecionada = i;
    });
    divMesas.appendChild(div);
  }
}

criarMesas(25);

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!mesaSelecionada) {
    showAlert("Aviso", "Por favor, selecione uma mesa.", "warning");
    return;
  }

  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const email = document.getElementById("email").value;
  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;

  const novaReserva = {
    nome,
    telefone,
    email,
    data,
    hora,
    mesa: mesaSelecionada,
  };

  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  reservas.push(novaReserva);

  localStorage.setItem("reservas", JSON.stringify(reservas));

 showAlert("Sucesso", "Reserva criada com sucesso!", "success");

  form.reset();
  document
    .querySelectorAll(".mesa")
    .forEach((m) => m.classList.remove("selecionada"));
  mesaSelecionada = null;
});

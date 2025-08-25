const reservasPendentesDiv = document.getElementById("reservasPendentes");
const reservasConfirmadasDiv = document.getElementById("reservasConfirmadas");
const contadorPendentes = document.getElementById("contadorPendentes");
const contadorConfirmadas = document.getElementById("contadorConfirmadas");

let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
let reservasConfirmadas =
  JSON.parse(localStorage.getItem("reservasConfirmadas")) || [];

function salvarLocalStorage() {
  localStorage.setItem("reservas", JSON.stringify(reservas));
  localStorage.setItem(
    "reservasConfirmadas",
    JSON.stringify(reservasConfirmadas)
  );
  atualizarContadores();
}

function atualizarContadores() {
  contadorPendentes.textContent = reservas.length;
  contadorConfirmadas.textContent = reservasConfirmadas.length;
}

function renderizarReservas() {
  reservasPendentesDiv.innerHTML = "";
  reservasConfirmadasDiv.innerHTML = "";

  reservas.forEach((reserva, index) => {
    const div = document.createElement("div");
    div.className = "reserva";
    div.innerHTML = `
            <div class="reserva-info">
                <strong>${reserva.nome}</strong>
                <p><strong>Mesa:</strong> ${reserva.mesa}</p>
                <p><strong>Data:</strong> ${formatarData(reserva.data)} ${
      reserva.hora
    }</p>
                <p><strong>Email:</strong> ${reserva.email}</p>
                <p><strong>Telefone:</strong> ${formatarTelefone(
                  reserva.telefone
                )}</p>
            </div>
            <div class="reserva-actions">
                <button class="btn btn-aceitar" onclick="aceitarReserva(${index})">
                    <i class="fas fa-check"></i> Aceitar
                </button>
                <button class="btn btn-recusar" onclick="recusarReserva(${index})">
                    <i class="fas fa-times"></i> Recusar
                </button>
            </div>
        `;
    reservasPendentesDiv.appendChild(div);
  });

  reservasConfirmadas.forEach((reserva) => {
    const div = document.createElement("div");
    div.className = "reserva reserva-confirmada";
    div.innerHTML = `
            <div class="reserva-info">
                <strong>${reserva.nome}</strong>
                <span>- Mesa ${reserva.mesa}</span>
                <span>${formatarData(reserva.data)} ${reserva.hora}</span>
            </div>
        `;
    reservasConfirmadasDiv.appendChild(div);
  });

  atualizarContadores();
}

function formatarData(data) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarTelefone(telefone) {
  if (!telefone) return "";
  return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

function aceitarReserva(index) {
  const reservaAceita = reservas.splice(index, 1)[0];
  reservasConfirmadas.push(reservaAceita);
  salvarLocalStorage();
  renderizarReservas();
}

async function recusarReserva(index) {
  const result = await Swal.fire({
    title: 'Confirmação',
    text: 'Tem certeza que deseja recusar esta reserva?',
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
    reservas.splice(index, 1);
    salvarLocalStorage();
    renderizarReservas();
  }
}


renderizarReservas();

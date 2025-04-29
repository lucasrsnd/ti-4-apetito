document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let nome = document.getElementById("nome").value;
    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;
    let tipoConta = document.getElementById("tipoConta").value;

    fetch("http://localhost:8080/cadastrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `nome=${nome}&email=${email}&senha=${senha}&tipoConta=${tipoConta}`,
    })
      .then((response) => {
        if (response.ok) {
          alert("Cadastro realizado com sucesso! Redirecionando para login.");
          window.location.href = "login.html";
        } else {
          alert("Erro ao cadastrar. Tente novamente.");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Ocorreu um erro. Tente novamente.");
      });
  });

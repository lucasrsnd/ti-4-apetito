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
         showAlert("Sucesso", "Cadastro realizado com sucesso! Redirecionando para login.", "success");

          window.location.href = "login.html";
        } else {
         showAlert("Erro", "Erro ao cadastrar. Tente novamente.", "error");

        }
      })
      .catch((err) => {
        console.error(err);
       showAlert("Erro", "Ocorreu um erro. Tente novamente.", "error");
      });
  });

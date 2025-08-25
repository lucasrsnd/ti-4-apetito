document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;

    fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `email=${email}&senha=${senha}`,
    })
      .then((response) => {
        if (response.redirected) {
          window.location.href = response.url;
        } else {
          showAlert("Erro", "Credenciais inválidas", "error");
        }
      })
      .catch((err) => {
        console.error(err);
        showAlert("Erro", "Ocorreu um erro. Tente novamente.", "error");

      });
  });

document.getElementById("burger").addEventListener("click", function () {
  const menu = document.getElementById("menu");
  menu.classList.toggle("active");

  const icon = this.querySelector("i");
  icon.classList.toggle("fa-bars");
  icon.classList.toggle("fa-times");
});

const navLinks = document.querySelectorAll(".navbar-link");
navLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    navLinks.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  });
});

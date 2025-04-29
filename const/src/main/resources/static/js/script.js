document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".navbar");
  navbar.classList.remove("navbar-hidden");

  let lastScroll = 0;
  window.addEventListener("scroll", function () {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 100) {
      navbar.classList.add("navbar-hidden");
      navbar.classList.add("scrolled");
    } else if (currentScroll < lastScroll) {
      navbar.classList.remove("navbar-hidden");
      if (currentScroll > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }

    lastScroll = currentScroll;
  });

  const backToTopBtn = document.createElement("a");
  backToTopBtn.href = "#";
  backToTopBtn.className = "back-to-top";
  backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  document.body.appendChild(backToTopBtn);

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  backToTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  if (document.querySelector(".scroll-down")) {
    document
      .querySelector(".scroll-down")
      .addEventListener("click", function () {
        window.scrollBy({
          top: window.innerHeight - 100,
          behavior: "smooth",
        });
      });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  document
    .querySelectorAll(
      ".section-title, .about-text, .about-image, .menu-item, .testimonial, .reservation-image, .reservation-form, .feature-card"
    )
    .forEach((el) => {
      observer.observe(el);
    });

  let currentTestimonial = 0;
  const testimonials = [
    {
      text: "A experiência no Apetito foi simplesmente incrível. Cada prato era uma surpresa agradável, com sabores que se complementavam perfeitamente. O serviço impecável e a atenção aos detalhes fazem toda a diferença.",
      name: "Giovana Diniz",
      role: "Crítica Gastronômica",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    {
      text: "O melhor restaurante que já visitei em Belo Horizonte. O filé mignon estava perfeito e o atendimento foi excepcional. Voltarei com certeza!",
      name: "Carlos Mendes",
      role: "Cliente Frequente",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      text: "Celebramos nosso aniversário de casamento no Apetito e foi mágico. O chef preparou um menu especial e o sommelier sugeriu vinhos perfeitos. Memórias para toda a vida!",
      name: "Fernanda Gomes",
      role: "Cliente Frequente",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  ];

  function changeTestimonial() {
    if (document.querySelector(".testimonial")) {
      const testimonialEl = document.querySelector(".testimonial");
      testimonialEl.classList.remove("visible");

      setTimeout(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        const testimonial = testimonials[currentTestimonial];

        testimonialEl.querySelector(".testimonial-text").textContent =
          testimonial.text;
        testimonialEl.querySelector(".author-img").src = testimonial.image;
        testimonialEl.querySelector(".author-name").textContent =
          testimonial.name;
        testimonialEl.querySelector(".author-role").textContent =
          testimonial.role;
        testimonialEl.classList.add("visible");
      }, 500);
    }
  }

  if (document.querySelector(".testimonial")) {
    setInterval(changeTestimonial, 5000);
  }

  if (document.getElementById("map")) {
    const map = L.map("map", {
      scrollWheelZoom: false,
      dragging: false,
      tap: false,
      zoomControl: false,
    }).setView([-19.9227, -43.9911], 17);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    const restaurantIcon = L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    L.marker([-19.9227, -43.9911], { icon: restaurantIcon }).addTo(map)
      .bindPopup(`
                <div style="text-align:center">
                    <h3 style="margin:5px 0;color:var(--secondary)">Apetito</h3>
                    <p style="margin:0">PUC Minas</p>
                </div>
            `);

    const mapElement = document.getElementById("map");
    mapElement.addEventListener("mouseenter", () => {
      map.scrollWheelZoom.enable();
      map.dragging.enable();
    });

    mapElement.addEventListener("mouseleave", () => {
      map.scrollWheelZoom.disable();
      map.dragging.disable();
    });
  }

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((tab) => tab.classList.remove("active"));

      button.classList.add("active");
      document
        .getElementById(button.getAttribute("data-tab") + "-tab")
        .classList.add("active");
    });
  });

  document
    .getElementById("work-resume")
    ?.addEventListener("change", function (e) {
      const fileName = e.target.files[0]?.name || "Nenhum arquivo selecionado";
      document.getElementById("file-name").textContent = fileName;
      this.closest(".file-upload-label").classList.toggle(
        "has-file",
        e.target.files.length > 0
      );
    });

  document.querySelectorAll("#contact-form, #work-form").forEach((form) => {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const btn = this.querySelector('button[type="submit"]');
      const btnText = btn.querySelector(".btn-text");
      const spinner = btn.querySelector(".loading-spinner");

      btnText.style.display = "none";
      spinner.style.display = "inline-block";
      btn.disabled = true;

      try {
        const response = await fetch(
          "https://formsubmit.co/ajax/contatoapetito@gmail.com",
          {
            method: "POST",
            body: new FormData(this),
            headers: {
              Accept: "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          document.getElementById("success-modal").style.display = "flex";
          this.reset();

          if (this.id === "work-form") {
            document.getElementById("file-name").textContent =
              "Nenhum arquivo selecionado";
            document
              .querySelector(".file-upload-label")
              .classList.remove("has-file");
          }
        } else {
          alert("Erro: " + (data.message || "Tente novamente"));
        }
      } catch (error) {
        alert("Erro de conexão. Tente novamente mais tarde.");
      } finally {
        btnText.style.display = "inline-block";
        spinner.style.display = "none";
        btn.disabled = false;
      }
    });
  });

  const chatbot = {
    init() {
      this.elements = {
        trigger: document.getElementById("chatbot-trigger"),
        container: document.getElementById("chatbot-container"),
        closeBtn: document.getElementById("chatbot-close"),
        sendBtn: document.getElementById("chatbot-send"),
        input: document.getElementById("chatbot-input"),
        messages: document.getElementById("chatbot-messages"),
      };

      if (!this.elements.trigger) return;

      this.setupEventListeners();
      this.showWelcomeMessage();
    },

    setupEventListeners() {
      this.elements.trigger.addEventListener("click", () =>
        this.toggleChatbot()
      );
      this.elements.closeBtn.addEventListener("click", () =>
        this.hideChatbot()
      );

      this.elements.sendBtn.addEventListener("click", () => this.sendMessage());
      this.elements.input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.sendMessage();
      });
    },

    toggleChatbot() {
      const isVisible = this.elements.container.style.display === "flex";
      this.elements.container.style.display = isVisible ? "none" : "flex";

      if (!isVisible) {
        setTimeout(() => {
          this.elements.container.classList.add("visible");
        }, 10);
      } else {
        this.elements.container.classList.remove("visible");
      }

      document.querySelector(".back-to-top").style.visibility = isVisible
        ? "visible"
        : "hidden";
    },

    hideChatbot() {
      this.elements.container.style.display = "none";
      this.elements.container.classList.remove("visible");
      document.querySelector(".back-to-top").style.visibility = "visible";
    },

    sendMessage() {
      const text = this.elements.input.value.trim();
      if (!text) return;

      this.addMessage(text, "user");
      this.elements.input.value = "";

      this.showTypingIndicator();

      setTimeout(() => {
        this.removeTypingIndicator();
        const response = this.generateResponse(text);
        this.addMessage(response, "bot");
      }, 1000 + Math.random() * 1000);
    },

    addMessage(text, sender) {
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${sender}-message`;
      messageDiv.textContent = text;
      this.elements.messages.appendChild(messageDiv);
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    },

    showTypingIndicator() {
      const typingDiv = document.createElement("div");
      typingDiv.className = "typing-indicator";
      typingDiv.id = "typing-indicator";
      typingDiv.innerHTML = `
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            `;
      this.elements.messages.appendChild(typingDiv);
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    },

    removeTypingIndicator() {
      const typingIndicator = document.getElementById("typing-indicator");
      if (typingIndicator) {
        typingIndicator.remove();
      }
    },

    showWelcomeMessage() {
      setTimeout(() => {
        this.addMessage(
          "Olá! Sou o assistente virtual do Apetito. Posso ajudar com informações sobre cardápio, horários e reservas. Como posso ajudar?",
          "bot"
        );
      }, 1000);
    },

    generateResponse(userInput) {
      const lowerInput = userInput.toLowerCase();

      if (lowerInput.includes("cardápio") || lowerInput.includes("menu")) {
        return "Nosso cardápio inclui:\n\n- Risoto de Trufas: R$89\n- Filé Mignon: R$112\n- Sobremesa do Chef: R$45\n\nVeja o cardápio completo em nosso site.";
      } else if (
        lowerInput.includes("horário") ||
        lowerInput.includes("funcionamento")
      ) {
        return "Horário de funcionamento:\n\n• Segunda a Quinta: 11h às 15h\n• Sexta e Sábado: 11h às 23h\n• Domingo: 11h às 20h";
      } else if (
        lowerInput.includes("reserva") ||
        lowerInput.includes("mesa")
      ) {
        return "Para fazer uma reserva, você pode:\n\n1. Usar nosso sistema online na seção 'Reservas'\n2. Ligar para (31) 1234-5678\n3. Enviar uma mensagem pelo WhatsApp";
      } else if (
        lowerInput.includes("endereço") ||
        lowerInput.includes("local")
      ) {
        return "Estamos localizados na:\n\nAv. Dom José Gaspar, 500\nCoração Eucarístico, Belo Horizonte\n\nVeja no mapa como chegar!";
      } else if (
        lowerInput.includes("evento") ||
        lowerInput.includes("festa")
      ) {
        return "Oferecemos espaços para eventos especiais! Temos opções para:\n\n• Aniversários\n• Casamentos\n• Eventos corporativos\n\nEntre em contato para personalizar seu evento.";
      } else if (
        lowerInput.includes("delivery") ||
        lowerInput.includes("entrega")
      ) {
        return "Nosso delivery funciona das 11h às 22h. Pedidos pelo app ou telefone (31) 1234-5678. Taxa de entrega: R$5 (grátis para pedidos acima de R$80).";
      } else {
        return "Desculpe, não entendi completamente. Posso ajudar com informações sobre:\n\n• Cardápio\n• Horários\n• Reservas\n• Localização\n• Eventos especiais\n\nO que você gostaria de saber?";
      }
    },
  };

  chatbot.init();
});

function safeQuerySelector(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`Elemento não encontrado: ${selector}`);
  }
  return element;
}

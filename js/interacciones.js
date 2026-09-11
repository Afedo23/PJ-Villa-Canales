// Interacciones propias de la página: cursor personalizado, botones
// magnéticos, títulos que se revelan palabra por palabra, y un
// parallax suave en algunas imágenes. Nada de esto depende de
// librerías externas.

(function () {
  const tienePunteroFino = window.matchMedia("(pointer: fine)").matches;
  const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Títulos que se revelan palabra por palabra al entrar en pantalla ---
  function iniciarRevelaTitulos() {
    const titulos = document.querySelectorAll(".titulo-seccion");
    titulos.forEach(titulo => {
      const texto = titulo.textContent.trim();
      titulo.setAttribute("aria-label", texto);
      const palabras = texto
        .split(" ")
        .map(palabra => `<span class="palabra"><span class="palabra-interior">${palabra}</span></span>`)
        .join(" ");
      titulo.innerHTML = `<span aria-hidden="true">${palabras}</span>`;
    });

    if (prefiereMenosMovimiento) return;

    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (!entrada.isIntersecting) return;
        const interiores = entrada.target.querySelectorAll(".palabra-interior");
        interiores.forEach((palabra, i) => {
          palabra.style.transitionDelay = `${i * 45}ms`;
          palabra.classList.add("visible");
        });
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.4 });
    titulos.forEach(t => observador.observe(t));
  }

  // --- Cursor personalizado: un punto y un anillo que lo persigue ---
  function iniciarCursor() {
    if (!tienePunteroFino || prefiereMenosMovimiento) return;
    document.documentElement.classList.add("cursor-personalizado");

    const punto = document.createElement("div");
    punto.className = "cursor-punto";
    const anillo = document.createElement("div");
    anillo.className = "cursor-anillo";
    document.body.append(punto, anillo);

    let miraX = window.innerWidth / 2;
    let miraY = window.innerHeight / 2;
    let anilloX = miraX;
    let anilloY = miraY;

    window.addEventListener("mousemove", (e) => {
      miraX = e.clientX;
      miraY = e.clientY;
      punto.style.transform = `translate(${miraX}px, ${miraY}px) translate(-50%, -50%)`;
    });

    function seguirAnillo() {
      anilloX += (miraX - anilloX) * 0.18;
      anilloY += (miraY - anilloY) * 0.18;
      anillo.style.transform = `translate(${anilloX}px, ${anilloY}px) translate(-50%, -50%)`;
      requestAnimationFrame(seguirAnillo);
    }
    seguirAnillo();

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, .tarjeta-campamento")) {
        anillo.classList.add("activo");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, .tarjeta-campamento")) {
        anillo.classList.remove("activo");
      }
    });
  }

  // --- Botones magnéticos: se acercan un poco al cursor cuando pasa cerca ---
  // Usa delegación de eventos para que también funcione con botones
  // creados dinámicamente (carruseles, tarjetas de campamento, etc.)
  function iniciarBotonesMagneticos() {
    if (!tienePunteroFino || prefiereMenosMovimiento) return;
    const selector = ".boton, .flecha-carrusel, .flecha-fotos, .punto, .pastilla-anio";
    let elementoActual = null;

    document.addEventListener("mousemove", (e) => {
      const elemento = e.target.closest(selector);
      if (elementoActual && elementoActual !== elemento) {
        elementoActual.style.transform = "";
      }
      elementoActual = elemento;
      if (!elemento) return;
      const rect = elemento.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      elemento.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
  }

  // --- Parallax suave en imágenes marcadas con data-parallax ---
  function iniciarParallax() {
    if (prefiereMenosMovimiento) return;
    const elementos = document.querySelectorAll("[data-parallax]");
    if (elementos.length === 0) return;

    function actualizar() {
      const alturaVentana = window.innerHeight;
      elementos.forEach(el => {
        const rect = el.getBoundingClientRect();
        const centro = rect.top + rect.height / 2 - alturaVentana / 2;
        const intensidad = parseFloat(el.dataset.parallax) || 0.08;
        el.style.transform = `translateY(${centro * intensidad * -1}px)`;
      });
      requestAnimationFrame(actualizar);
    }
    requestAnimationFrame(actualizar);
  }

  document.addEventListener("DOMContentLoaded", () => {
    iniciarRevelaTitulos();
    iniciarCursor();
    iniciarBotonesMagneticos();
    iniciarParallax();
  });
})();

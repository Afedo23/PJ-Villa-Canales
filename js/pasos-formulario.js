// Maneja SOLO la navegación por pasos del formulario de inscripción
// (barra de progreso, validación por paso y el confeti al enviar).
// Los paquetes y el envío a Formspree los sigue manejando js/main.js
// tal cual ya los tenías — este script no los toca.

(function () {
  const form = document.getElementById("formularioContacto");
  if (!form) return;

  const pasos = [...document.querySelectorAll(".paso-formulario")];
  const dots = [...document.querySelectorAll(".progreso-paso")];
  const relleno = document.getElementById("progresoRelleno");
  const botonAtras = document.getElementById("botonAtras");
  const botonSiguiente = document.getElementById("botonSiguiente");
  const botonEnviar = document.getElementById("botonEnviar");
  const total = pasos.length;
  let actual = 1;

  function mostrarPaso(n) {
    pasos.forEach(p => p.classList.toggle("activo", Number(p.dataset.paso) === n));
    dots.forEach(d => {
      const num = Number(d.dataset.pasoNum);
      d.classList.toggle("activa", num === n);
      d.classList.toggle("completada", num < n);
    });
    relleno.style.width = `${(n / total) * 100}%`;
    botonAtras.hidden = n === 1;
    botonSiguiente.hidden = n === total;
    botonEnviar.hidden = n !== total;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pasoValido(numeroPaso) {
    const paso = pasos.find(p => Number(p.dataset.paso) === numeroPaso);
    const campos = paso.querySelectorAll("input, select, textarea");
    for (const campo of campos) {
      if (!campo.reportValidity()) return false;
    }
    return true;
  }

  botonSiguiente.addEventListener("click", () => {
    if (!pasoValido(actual)) return;
    actual = Math.min(actual + 1, total);
    mostrarPaso(actual);
  });

  botonAtras.addEventListener("click", () => {
    actual = Math.max(actual - 1, 1);
    mostrarPaso(actual);
  });

  // --- Confeti cuando el mensaje de éxito aparece en #estadoFormulario ---
  function lanzarConfeti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colores = ["#C1440E", "#D4A72C", "#3B5D42", "#F6F1E4"];
    for (let i = 0; i < 60; i++) {
      const pieza = document.createElement("span");
      pieza.className = "pieza-confeti";
      pieza.style.left = `${Math.random() * 100}vw`;
      pieza.style.background = colores[Math.floor(Math.random() * colores.length)];
      pieza.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
      pieza.style.animationDelay = `${Math.random() * 0.3}s`;
      document.body.appendChild(pieza);
      setTimeout(() => pieza.remove(), 3500);
    }
  }

  const estado = document.getElementById("estadoFormulario");
  if (estado) {
    const observador = new MutationObserver(() => {
      if (estado.textContent.includes("Gracias")) {
        lanzarConfeti();
        actual = 1;
        mostrarPaso(1);
      }
    });
    observador.observe(estado, { childList: true, characterData: true, subtree: true });
  }

  mostrarPaso(1);
})();

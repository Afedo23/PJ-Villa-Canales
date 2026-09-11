// Cortina de transición entre páginas: cubre la pantalla al cargar
// y se abre; al hacer clic en un enlace hacia otra página, se cierra
// antes de navegar. Efecto propio, sin dependencias externas.

(function () {
  const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cortina = document.createElement("div");
  cortina.className = "cortina-transicion";
  document.body.prepend(cortina);

  if (prefiereMenosMovimiento) {
    cortina.remove();
    return;
  }

  function revelarPagina() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => cortina.classList.add("oculta"));
    });
  }

  if (document.readyState === "complete") {
    revelarPagina();
  } else {
    window.addEventListener("load", revelarPagina);
  }

  document.addEventListener("click", (evento) => {
    const enlace = evento.target.closest("a");
    if (!enlace) return;
    const destino = enlace.getAttribute("href");
    if (!destino || destino.startsWith("#") || destino.startsWith("http") || enlace.target === "_blank") return;

    evento.preventDefault();
    cortina.classList.remove("oculta");
    setTimeout(() => { window.location.href = destino; }, 460);
  });
})();

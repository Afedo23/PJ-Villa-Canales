// Arma la página de un campamento individual leyendo el
// parámetro ?id= de la URL y buscando ese id en data/camps.json.

async function cargarJSON(ruta) {
  const respuesta = await fetch(ruta);
  return respuesta.json();
}

function crearFoto(rutaFoto, alt) {
  const img = document.createElement("img");
  img.src = "../" + rutaFoto;
  img.alt = alt;
  img.loading = "lazy";
  return img;
}

function crearEspacioVacioFotos() {
  const div = document.createElement("div");
  div.className = "carrusel-vacio";
  div.textContent = "Aún no se han agregado fotos de este campamento. Agrégalas en data/camps.json.";
  return div;
}

function crearTestimonio(t) {
  const div = document.createElement("div");
  div.className = "testimonio";
  div.innerHTML = `<p>"${t.texto}"</p><span>${t.nombre}</span>`;
  return div;
}

(async function iniciar() {
  const parametros = new URLSearchParams(window.location.search);
  const id = parametros.get("id");

  const campamentos = await cargarJSON("../data/camps.json");
  const campamento = campamentos.find(c => c.id === id) || campamentos[0];

  if (!campamento) return;

  document.title = `${campamento.nombre} — Pastoral Juvenil San Joaquín`;
  document.getElementById("migajaNombre").textContent = campamento.nombre;
  document.getElementById("logoCampamento").src = "../" + campamento.logo;
  document.getElementById("logoCampamento").alt = `Logo ${campamento.nombre}`;
  document.getElementById("nombreCampamento").textContent = campamento.nombre;
  document.getElementById("sloganCampamento").textContent = `${campamento.anio} · ${campamento.slogan}`;
  document.getElementById("descripcionCampamento").textContent = campamento.descripcion;

  // Fotos
  const pistaFotos = document.getElementById("pistaFotos");
  if (!campamento.fotos || campamento.fotos.length === 0) {
    pistaFotos.appendChild(crearEspacioVacioFotos());
  } else {
    campamento.fotos.forEach((foto, i) =>
      pistaFotos.appendChild(crearFoto(foto, `Foto ${i + 1} de ${campamento.nombre}`))
    );
    if (campamento.fotos.length > 1) {
      const controles = document.getElementById("controlesFotos");
      controles.style.display = "flex";
      const anchoPaso = () => pistaFotos.firstElementChild.getBoundingClientRect().width + 14;
      document.getElementById("fotoAnterior").addEventListener("click", () => {
        pistaFotos.scrollBy({ left: -anchoPaso(), behavior: "smooth" });
      });
      document.getElementById("fotoSiguiente").addEventListener("click", () => {
        pistaFotos.scrollBy({ left: anchoPaso(), behavior: "smooth" });
      });
    }
  }

  // Testimonios propios de este campamento
  const filaTestimonios = document.getElementById("filaTestimoniosCampamento");
  if (!campamento.testimonios || campamento.testimonios.length === 0) {
    filaTestimonios.innerHTML = '<p style="opacity:0.7;">Todavía no hay testimonios de este campamento.</p>';
  } else {
    campamento.testimonios.forEach(t => filaTestimonios.appendChild(crearTestimonio(t)));
  }

  // Selector de años (para saltar entre campamentos)
  const selector = document.getElementById("selectorAnios");
  [...campamentos]
    .sort((a, b) => b.anio - a.anio)
    .forEach(c => {
      const a = document.createElement("a");
      a.href = `camp.html?id=${encodeURIComponent(c.id)}`;
      a.className = "pastilla-anio" + (c.id === campamento.id ? " activa" : "");
      a.textContent = c.anio;
      selector.appendChild(a);
    });

  // Revelado suave al hacer scroll
  const elementos = document.querySelectorAll(".revelar");
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });
  elementos.forEach(el => observador.observe(el));
})();

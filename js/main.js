// Carga los datos desde /data/site.json y /data/camps.json
// y arma toda la página principal. Para cambiar textos o
// campamentos, edita esos dos archivos JSON — no hace falta
// tocar este código.

async function cargarJSON(ruta) {
  const respuesta = await fetch(ruta);
  return respuesta.json();
}

function crearTarjetaCampamento(campamento) {
  const a = document.createElement("a");
  a.className = "tarjeta-campamento";
  a.href = `camps/camp.html?id=${encodeURIComponent(campamento.id)}`;
  a.innerHTML = `
    <div class="miniatura">
      <img src="${campamento.logo}" alt="Logo ${campamento.nombre}" width="90" height="90">
    </div>
    <div class="contenido">
      ${campamento.esActual ? '<span class="etiqueta-actual">Campamento de este año</span>' : ""}
      <h3>${campamento.nombre}</h3>
      <p class="anio-slogan">${campamento.anio} · ${campamento.slogan}</p>
      <p>${campamento.descripcion}</p>
    </div>
  `;
  return a;
}

function crearTarjetaTestimonio(testimonio) {
  const div = document.createElement("div");
  div.className = "testimonio";
  div.innerHTML = `<p>"${testimonio.texto}"</p><span>${testimonio.nombre}</span>`;
  return div;
}

(async function iniciar() {
  const [site, campamentos] = await Promise.all([
    cargarJSON("data/site.json"),
    cargarJSON("data/camps.json"),
  ]);

  // --- Hero: campamento marcado como actual (o el más reciente) ---
  const actual = campamentos.find(c => c.esActual) ||
    [...campamentos].sort((a, b) => b.anio - a.anio)[0];

  if (actual) {
    document.getElementById("heroNombre").textContent = actual.nombre;
    document.getElementById("heroSlogan").textContent = actual.slogan;
    document.getElementById("heroDescripcion").textContent = actual.descripcion;
    document.getElementById("heroLogo").src = actual.logo;
    document.getElementById("heroLogo").alt = `Logo ${actual.nombre}`;
    document.getElementById("heroAnio").textContent = actual.anio;
  }

  // --- Misión, visión, objetivos ---
  document.getElementById("textoMision").textContent = site.mision;
  document.getElementById("textoVision").textContent = site.vision;
  const listaObjetivos = document.getElementById("listaObjetivos");
  site.objetivos.forEach(obj => {
    const li = document.createElement("li");
    li.textContent = obj;
    listaObjetivos.appendChild(li);
  });

  // --- Sendero de campamentos (ordenado del más reciente al más antiguo) ---
  const sendero = document.getElementById("senderoCampamentos");
  [...campamentos]
    .sort((a, b) => b.anio - a.anio)
    .forEach(c => sendero.appendChild(crearTarjetaCampamento(c)));

  // --- Testimonios (tomados de todos los campamentos) ---
  const filaTestimonios = document.getElementById("filaTestimonios");
  const todosLosTestimonios = campamentos.flatMap(c => c.testimonios || []);
  if (todosLosTestimonios.length === 0) {
    filaTestimonios.innerHTML = '<p style="opacity:0.7;">Todavía no hay testimonios cargados. Agrégalos en data/camps.json.</p>';
  } else {
    todosLosTestimonios.forEach(t => filaTestimonios.appendChild(crearTarjetaTestimonio(t)));
  }

  // --- Contacto ---
  document.getElementById("tituloContacto").textContent = `Inscríbete al ${actual ? actual.nombre : "campamento de este año"}`;
  document.getElementById("mensajeContacto").textContent = site.contacto.mensaje;

  const redes = [];
  if (site.contacto.whatsapp && !site.contacto.whatsapp.startsWith("REEMPLAZAR")) {
    redes.push(`<a href="https://wa.me/${site.contacto.whatsapp}">WhatsApp</a>`);
  }
  if (site.contacto.facebook && !site.contacto.facebook.startsWith("REEMPLAZAR")) {
    redes.push(`<a href="${site.contacto.facebook}">Facebook</a>`);
  }
  if (site.contacto.instagram && !site.contacto.instagram.startsWith("REEMPLAZAR")) {
    redes.push(`<a href="${site.contacto.instagram}">Instagram</a>`);
  }
  document.getElementById("pieRedes").innerHTML = redes.join(" · ");

  // --- Formulario: envía a Formspree si ya se configuró el endpoint ---
  const form = document.getElementById("formularioContacto");
  const estado = document.getElementById("estadoFormulario");
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!site.formspreeEndpoint || site.formspreeEndpoint.startsWith("REEMPLAZAR")) {
      estado.textContent = "El formulario todavía no está conectado. Configura formspreeEndpoint en data/site.json (ver README).";
      return;
    }
    estado.textContent = "Enviando...";
    try {
      const respuesta = await fetch(site.formspreeEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (respuesta.ok) {
        estado.textContent = "¡Gracias! Tu inscripción fue enviada.";
        form.reset();
      } else {
        estado.textContent = "Hubo un problema al enviar. Intenta de nuevo o escríbenos por WhatsApp.";
      }
    } catch {
      estado.textContent = "Hubo un problema al enviar. Intenta de nuevo o escríbenos por WhatsApp.";
    }
  });
})();

// --- Menú móvil ---
document.getElementById("botonMenu")?.addEventListener("click", () => {
  const nav = document.getElementById("navEnlaces");
  const abierto = nav.classList.toggle("abierto");
  document.getElementById("botonMenu").setAttribute("aria-expanded", abierto);
});

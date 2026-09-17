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
      <span class="marco-logo marco-logo--tarjeta">
        <img src="${campamento.logo}" alt="Logo ${campamento.nombre}">
      </span>
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

// --- Fogata: brasas que suben en el hero (un solo efecto protagonista) ---
function crearBrasas() {
  const contenedor = document.getElementById("contenedorBrasas");
  if (!contenedor) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cantidad = window.innerWidth < 700 ? 10 : 18;
  for (let i = 0; i < cantidad; i++) {
    const brasa = document.createElement("span");
    brasa.className = "brasa";
    brasa.style.left = `${5 + Math.random() * 90}%`;
    brasa.style.setProperty("--deriva", `${Math.random() * 60 - 30}px`);
    brasa.style.animationDuration = `${5 + Math.random() * 5}s`;
    brasa.style.animationDelay = `${Math.random() * 8}s`;
    contenedor.appendChild(brasa);
  }
}

// --- Franja de estadísticas con conteo ascendente ---
function iniciarStats(estadisticas) {
  const franja = document.getElementById("franjaStats");
  if (!franja || !estadisticas || estadisticas.length === 0) return;
  estadisticas.forEach(stat => {
    const item = document.createElement("div");
    item.className = "stat-item";
    const soloDigitos = parseInt(stat.numero.replace(/\D/g, ""), 10);
    item.innerHTML = `<div class="stat-numero" data-final="${soloDigitos || 0}" data-sufijo="${stat.numero.replace(/[0-9]/g, "")}">0</div><div class="stat-etiqueta">${stat.etiqueta}</div>`;
    franja.appendChild(item);
  });

  const numeros = franja.querySelectorAll(".stat-numero");
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      numeros.forEach(el => {
        const final = parseInt(el.dataset.final, 10);
        const sufijo = el.dataset.sufijo || "";
        if (!final) return;
        const duracion = 1200;
        const inicio = performance.now();
        function paso(ahora) {
          const avance = Math.min((ahora - inicio) / duracion, 1);
          el.textContent = Math.floor(avance * final) + sufijo;
          if (avance < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
      });
      observador.disconnect();
    });
  }, { threshold: 0.4 });
  observador.observe(franja);
}

// --- Revelado suave al hacer scroll ---
function iniciarRevelado() {
  const elementos = document.querySelectorAll(".revelar");
  if (elementos.length === 0) return;
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });
  elementos.forEach(el => observador.observe(el));
}

// --- Enlace activo en la barra de navegación según la sección visible ---
function iniciarScrollSpy() {
  const enlaces = [...document.querySelectorAll(".nav-enlaces a")];
  if (enlaces.length === 0) return;
  const secciones = enlaces
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      const enlace = enlaces.find(a => a.getAttribute("href") === `#${entrada.target.id}`);
      if (!enlace) return;
      if (entrada.isIntersecting) {
        enlaces.forEach(a => a.classList.remove("activo"));
        enlace.classList.add("activo");
      }
    });
  }, { threshold: 0.5 });
  secciones.forEach(s => observador.observe(s));
}

// --- Carrusel de testimonios: fundido automático + controles manuales ---
function iniciarCarruselTestimonios(testimonios) {
  const carrusel = document.getElementById("testimoniosCarrusel");
  const controles = document.getElementById("testimoniosControles");
  const puntosContenedor = document.getElementById("testimoniosPuntos");
  if (!carrusel) return;

  if (!testimonios || testimonios.length === 0) {
    carrusel.innerHTML = '<p style="opacity:0.7;">Todavía no hay testimonios cargados. Agrégalos en data/camps.json.</p>';
    return;
  }

  testimonios.forEach((t, i) => {
    const slide = document.createElement("div");
    slide.className = "testimonio-slide" + (i === 0 ? " activo" : "");
    slide.innerHTML = `<div class="testimonio"><p>"${t.texto}"</p><span>${t.nombre}</span></div>`;
    carrusel.appendChild(slide);
  });

  if (testimonios.length === 1) return; // sin controles si hay uno solo

  controles.style.display = "flex";
  const slides = [...carrusel.querySelectorAll(".testimonio-slide")];
  testimonios.forEach((_, i) => {
    const punto = document.createElement("button");
    punto.className = "punto" + (i === 0 ? " activo" : "");
    punto.setAttribute("aria-label", `Ir al testimonio ${i + 1}`);
    punto.addEventListener("click", () => irATestimonio(i));
    puntosContenedor.appendChild(punto);
  });
  const puntos = [...puntosContenedor.children];

  let actual = 0;
  let temporizador;

  function irATestimonio(indice) {
    slides[actual].classList.remove("activo");
    puntos[actual].classList.remove("activo");
    actual = (indice + slides.length) % slides.length;
    slides[actual].classList.add("activo");
    puntos[actual].classList.add("activo");
    reiniciarAutoplay();
  }

  function reiniciarAutoplay() {
    clearInterval(temporizador);
    temporizador = setInterval(() => irATestimonio(actual + 1), 6000);
  }

  document.getElementById("testimonioAnterior").addEventListener("click", () => irATestimonio(actual - 1));
  document.getElementById("testimonioSiguiente").addEventListener("click", () => irATestimonio(actual + 1));

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    reiniciarAutoplay();
  }
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

  // --- Sección de precios del campamento actual ---


  // --- Misión, visión, objetivos ---
  const conNegritas = (texto) => texto.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  document.getElementById("textoMision").innerHTML = conNegritas(site.mision);
  document.getElementById("textoVision").innerHTML = conNegritas(site.vision);
  const listaObjetivos = document.getElementById("listaObjetivos");
  site.objetivos.forEach(obj => {
    const li = document.createElement("li");
    li.innerHTML = conNegritas(obj);
    listaObjetivos.appendChild(li);
  });

  // --- Sendero de campamentos (ordenado del más reciente al más antiguo) ---
  const sendero = document.getElementById("senderoCampamentos");
  [...campamentos]
    .sort((a, b) => b.anio - a.anio)
    .forEach(c => sendero.appendChild(crearTarjetaCampamento(c)));

  // --- Testimonios (tomados de todos los campamentos) ---
  const todosLosTestimonios = campamentos.flatMap(c => c.testimonios || []);
  iniciarCarruselTestimonios(todosLosTestimonios);

  if (actual) {
  const preciosGrid = document.getElementById("preciosGrid");
  const preciosInfo = document.getElementById("preciosInfo");
  const preciosSubtitulo = document.getElementById("preciosSubtitulo");
  const selectorPaquete = document.getElementById("paquete");

  if (preciosSubtitulo) {
    preciosSubtitulo.textContent = `Lugar: ${actual.lugar || "Por confirmar"}`;
  }

  // Tarjetas de paquetes
  if (preciosGrid && actual.paquetes && actual.paquetes.length > 0) {
    actual.paquetes.forEach((paq, i) => {
      const card = document.createElement("div");
      card.className = "precio-card" + (i === 1 ? " destacado" : "");
      card.innerHTML = `
        ${i === 1 ? '<span class="precio-etiqueta">Más elegido</span>' : ""}
        <h3>${paq.nombre}</h3>
        <p class="precio-monto">${paq.precio}</p>
        <ul>${paq.incluye.map(item => `<li>${item}</li>`).join("")}</ul>
        <a href="#contacto" class="boton boton-ascua">Inscribirme</a>
      `;
      preciosGrid.appendChild(card);

      // Llenar el select del formulario
      if (selectorPaquete) {
        const opt = document.createElement("option");
        opt.value = paq.nombre;
        opt.textContent = `${paq.nombre} — ${paq.precio}`;
        selectorPaquete.appendChild(opt);
      }
    });
  }

  // Información de fechas y reserva
  if (preciosInfo) {
    const fechas = (actual.fechasPago || [])
      .map(f => `<li><strong>${f.fecha}:</strong> ${f.detalle}</li>`)
      .join("");
    preciosInfo.innerHTML = `
      <div class="precio-info-bloque">
        <h4>Fechas de pago</h4>
        <ul>${fechas || "<li>Por confirmar</li>"}</ul>
      </div>
      <div class="precio-info-bloque">
        <h4>Para reservar tu lugar</h4>
        <p>Aparta con <strong>${actual.montoReserva || "Q150"}</strong> y asegura tu cupo.</p>
      </div>
    `;
  }
}

  // --- Estadísticas, fogata, scroll-reveal y navegación activa ---
  iniciarStats(site.estadisticas);
  crearBrasas();
  iniciarRevelado();
  iniciarScrollSpy();

  // --- Contacto ---
  document.getElementById("tituloContacto").textContent = `Inscríbete al ${actual ? actual.nombre : "campamento de este año"}`;
  document.getElementById("mensajeContacto").textContent = site.contacto.mensaje;

  const redes = [];
  if (site.contacto.whatsapp && !site.contacto.whatsapp.startsWith("REEMPLAZAR")) {
    redes.push(`<a class="icono-contacto" href="https://wa.me/${site.contacto.whatsapp}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp"><img src="images/iconos/whatsapp.png" alt=""><span>WhatsApp</span></a>`);
  }
  if (site.contacto.facebook && !site.contacto.facebook.startsWith("REEMPLAZAR")) {
    redes.push(`<a class="icono-contacto" href="${site.contacto.facebook}" target="_blank" rel="noopener" aria-label="Síguenos en Facebook"><img src="images/iconos/facebook.png" alt=""><span>Facebook</span></a>`);
  }
  if (site.contacto.instagram && !site.contacto.instagram.startsWith("REEMPLAZAR")) {
    redes.push(`<a class="icono-contacto" href="${site.contacto.instagram}" target="_blank" rel="noopener" aria-label="Síguenos en Instagram"><img src="images/iconos/instagram.png" alt=""><span>Instagram</span></a>`);
  }
  if (site.contacto.correo && !site.contacto.correo.startsWith("REEMPLAZAR")) {
    redes.push(`<a class="icono-contacto" href="mailto:${site.contacto.correo}" aria-label="Escríbenos por correo"><img src="images/iconos/gmail.png" alt=""><span>Gmail</span></a>`);
  }
  if (site.contacto.tiktok && !site.contacto.tiktok.startsWith("REEMPLAZAR")) {
    redes.push(`<a class="icono-contacto" href="${site.contacto.tiktok}" target="_blank" rel="noopener" aria-label="Síguenos en TikTok"><img src="images/iconos/tiktok.png" alt=""><span>TikTok</span></a>`);
  }
  document.getElementById("pieRedes").innerHTML = `<div class="fila-iconos-contacto">${redes.join("")}</div>`;

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

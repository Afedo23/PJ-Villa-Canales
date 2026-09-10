# Sitio web — Pastoral Juvenil, Parroquia San Joaquín (Villa Canales)

Sitio hecho con HTML, CSS y JavaScript simple (sin frameworks), listo para
publicarse en GitHub Pages. El contenido (misión, visión, campamentos,
testimonios, redes) vive en dos archivos JSON, así que casi nunca vas a
necesitar tocar el código para actualizarlo.

## Sobre el "backend"

GitHub Pages solo sirve archivos estáticos (HTML/CSS/JS) — no puede correr
un servidor ni una base de datos real. Por eso este sitio usa dos trucos
que cumplen la misma función sin necesitar un servidor propio:

1. **Contenido = archivos JSON.** `data/site.json` y `data/camps.json`
   funcionan como tu "base de datos": ahí agregas campamentos nuevos,
   fotos, testimonios y textos, y el sitio se actualiza solo.
2. **Formulario de inscripción = Formspree.** Es un servicio gratuito que
   recibe el formulario y te lo manda por correo, sin que necesites un
   servidor. Pasos:
   - Crea una cuenta gratis en https://formspree.io
   - Crea un formulario nuevo y copia el "endpoint" que te da (algo como
     `https://formspree.io/f/xxxxxxx`).
   - Pégalo en `data/site.json`, en el campo `"formspreeEndpoint"`.

Si en el futuro quieres un backend de verdad (por ejemplo para guardar
inscripciones en una base de datos propia), eso ya no puede vivir en
GitHub Pages — necesitarías un servicio como Render, Railway o Firebase.
Puedo ayudarte a montarlo cuando quieras dar ese paso.

## Cómo personalizar el contenido

- **Textos generales** (misión, visión, objetivos, contacto): edita
  `data/site.json`.
- **Cada campamento**: edita `data/camps.json`. Cada campamento es un
  bloque con `id`, `nombre`, `slogan`, `anio`, `descripcion`, `logo`,
  `fotos` (lista de rutas de imagen) y `testimonios`.
  - El campamento con `"esActual": true` es el que aparece en la
    portada como el campamento de este año.
  - Para agregar un campamento nuevo, copia un bloque completo dentro
    del `[ ]` y cambia sus datos — aparece automáticamente en la lista
    y genera su propia página.
- **Fotos y logos**: súbelas dentro de `images/campamentos/` (fotos) o
  `images/logo/` (logos), y luego escribe esa ruta en el JSON. Ejemplo:
  `"images/campamentos/2026-fogata.jpg"`.

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo
   `pastoral-juvenil-sanjoaquin`).
2. Sube todo el contenido de esta carpeta a ese repositorio (por la web
   de GitHub con "Add file → Upload files", o con git si lo prefieres).
3. En el repositorio, ve a **Settings → Pages**.
4. En "Build and deployment", elige **Deploy from a branch**, rama
   `main` y carpeta `/ (root)`. Guarda.
5. En unos minutos tu sitio estará disponible en
   `https://tu-usuario.github.io/pastoral-juvenil-sanjoaquin/`.

## Cómo poner un dominio propio

1. Compra el dominio que quieras (por ejemplo en Namecheap, GoDaddy, o
   donde prefieras).
2. En el archivo `CNAME` de este proyecto, reemplaza el texto de
   ejemplo por tu dominio real (una sola línea, ej.
   `pastoraljuvenilsanjoaquin.org`).
3. En el panel de tu proveedor de dominio, agrega estos registros DNS:
   - Un registro **CNAME** apuntando `www` hacia
     `tu-usuario.github.io`.
   - Cuatro registros **A** en la raíz del dominio (`@`) apuntando a:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`.
4. Vuelve a **Settings → Pages** en GitHub y escribe tu dominio en
   "Custom domain". Espera a que se verifique (puede tardar hasta un
   par de horas) y activa **Enforce HTTPS**.

## Estructura del proyecto

```
index.html              → página principal
camps/camp.html         → plantilla de página individual de campamento
css/style.css           → estilos
js/main.js               → arma la página principal desde los JSON
js/camp.js               → arma la página de cada campamento
data/site.json           → misión, visión, objetivos, contacto
data/camps.json          → lista de campamentos (editar aquí para agregar años)
images/logo/              → logos
images/campamentos/       → fotos de actividades
CNAME                     → dominio propio (editar antes de publicar)
```

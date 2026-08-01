# Revisión técnica — julio 2026

> **Nota de esta ronda (fusión con contenido nuevo):** el usuario subió una
> versión más nueva del proyecto con contenido real agregado en otras
> sesiones — la herramienta 13 **Biofeedback Vocal en Tiempo Real** (nueva) y
> una **Biblioteca Educativa** ampliada a 23 temas con buscador. Esta ronda
> combina ese contenido nuevo con **todas** las mejoras de la revisión
> original (ver el resto de este documento), reaplicadas donde correspondía,
> más una auditoría fresca de seguridad/accesibilidad específicamente sobre
> el contenido nuevo (que no había sido revisado antes). Cambios de esta
> ronda puntual:
> - **Bug real encontrado y corregido:** el buscador de la Biblioteca
>   Educativa era sensible a tildes — buscar "nodulos" no encontraba
>   "nódulos". Se normalizan tildes/diacríticos en ambos lados de la
>   comparación antes de buscar.
> - Dos bugs de `aria-label` fijo en español que nunca se traducían (mismo
>   patrón encontrado antes en el lector de accesibilidad): el filtro de
>   categorías de la Biblioteca Educativa, y los campos mínimo/máximo Hz de
>   Biofeedback Vocal. Corregidos con el mecanismo `data-i18n-aria` que la
>   propia plataforma ya tenía (solo faltaba usarlo ahí).
> - Se aplicaron a ambas herramientas nuevas/actualizadas todas las
>   convenciones ya establecidas: Open Graph/Twitter Cards, ícono
>   `apple-touch-icon`, protección anti-flash de tema **e idioma**, y
>   versión de caché (`?v=2`) en los archivos compartidos.
> - `sitemap.xml` actualizado con la 13ª herramienta.
> - Verificado con Playwright: búsqueda de la biblioteca, cambio de idioma
>   en Biofeedback Vocal, y el tour guiado ampliado del portal (ahora 19
>   pasos en vez de 8, uno por cada herramienta) — sin errores de consola
>   en ninguna de las 14 páginas.
> - Paridad ES/PT/EN verificada en ambos `i18n-dict.js` nuevos/actualizados
>   (68/68/68 claves en Biblioteca Educativa, 66/66/66 en Biofeedback
>   Vocal, sin diferencias).
>
> **Pase final de verificación (antes de esta entrega):** sintaxis de
> absolutamente todo el JS del proyecto (archivos sueltos + cada bloque
> `<script>` inline de las 14 páginas) revisada con `node --check`, cero
> errores; cada referencia local a un archivo (íconos, hojas de estilo,
> scripts, imágenes) verificada contra el disco, todas resuelven; sin IDs
> duplicados en ninguna página; los 13 `apple-touch-icon.png` + la imagen
> Open Graph son PNGs válidos y no están corruptos; barrido de
> accesibilidad (inputs sin nombre accesible) en las 14 páginas — los 2
> únicos casos encontrados son inputs de archivo ocultos (`display:none`)
> disparados por un botón visible que sí tiene su propio texto/label, así
> que no son un problema real; prueba de la denegación de micrófono en
> Biofeedback Vocal en un navegador sin micrófono real — muestra el mensaje
> de error amigable esperado, sin errores no controlados.

---


Este documento resume la revisión técnica y el pase de refinamiento hecho sobre
la plataforma. El objetivo no fue reescribir nada, sino auditar el código ya
funcional y corregir/elevar lo que un ingeniero senior detectaría en una
revisión profesional. Todo lo listado abajo fue **verificado con pruebas
automatizadas en navegador (Playwright/Chromium headless)**, no solo revisado
a simple vista.

## 🔴 Seguridad

- **XSS corregido en Bitácora de Sesiones.** El botón "Ver historial" de la
  tabla de pacientes armaba su `onclick` interpolando el nombre del paciente
  con un escapado manual de comillas que no alcanza a proteger contra
  inyección HTML/JS. Era explotable en la práctica a través de la función de
  "importar backup" (un archivo JSON con un nombre de paciente diseñado a
  propósito, abierto por la propia clínica). Se reemplazó por un atributo
  `data-patient-id` (escapado con `escapeHtml`) + un listener delegado, que no
  tiene ese punto de fuga. Probado con un payload real de prueba: ya no se
  ejecuta ningún script y la función de filtrado sigue andando igual que
  antes para nombres normales.
- **Protección contra inyección de fórmulas en CSV** (a veces llamada "CSV
  injection"): si un campo exportado a CSV empieza con `=`, `+`, `-` o `@`,
  Excel/Sheets puede interpretarlo como una fórmula al abrirlo. Se detectó un
  caso concreto explotable: en *Sesión diaria*, el nombre de una grabación de
  audio subida por archivo (`file.name`) se volcaba al CSV sin ningún resguardo.
  Se creó una utilidad compartida (`csvField`/`toCsv`/`downloadCsv` en
  `assets/shared.js`) que neutraliza esto, aplica comillas RFC 4180
  correctamente y agrega BOM UTF-8 (para que tildes/ñ se vean bien en Excel).
  Se aplicó en los 5 archivos que generan CSV.
- Los `<script>` externos (jsPDF/JSZip) ahora se cargan con
  `crossorigin="anonymous"` / `referrerPolicy="no-referrer"` al inyectarse.
  **Pendiente:** agregar hash SRI (`integrity="sha..."`) verificado — ver
  sección "Pendientes".

## 🟠 Fidelidad a lo que promete el propio README

- Se agregó `.nojekyll` (el README decía que ya estaba incluido en el
  repositorio; no estaba en el .zip).
- Se corrigió el Service Worker de *Ejercicios Vocales* (`vocalizador/sw.js`):
  no precacheaba su propio `i18n-dict.js` ni los 5 archivos compartidos del
  portal (`i18n-engine.js`, `theme-switcher.js`, `a11y-reader.js`,
  `shared.js`, `shared.css`), pese a que la página los necesita para
  funcionar. Esto significaba que, en el peor caso (primera visita y luego
  sin conexión), el idioma, el tema y el lector de accesibilidad podían
  quedar rotos en modo offline — justo lo que el modo PWA promete evitar. Se
  agregaron a la lista de precache y se hizo el `install` más resiliente
  (si un archivo puntual falla al precachear, no aborta todo el proceso).

## 🟡 Accesibilidad

- El botón del lector de voz (accesibilidad) bajaba su opacidad al 55%
  cuando estaba desactivado — es decir, se volvía más difícil de ver
  justo para las personas con baja visión que más lo necesitan. Se
  reemplazó por un color apagado sin perder opacidad.
- El control deslizante de velocidad de lectura tenía un `aria-label` fijo
  en español que nunca se traducía al cambiar de idioma. Corregido.
- Los 3 widgets flotantes (tema 🎨, idioma 🌐, accesibilidad 🔊) ahora
  exponen `aria-expanded`/`aria-haspopup` correctamente, se cierran con
  `Escape` y devuelven el foco al botón — antes ninguno lo hacía.
- El lector de voz ya no intenta "pronunciar" los emojis (algunos motores de
  síntesis de voz los leen como palabras sueltas tipo "paleta de artista");
  el texto visual/subtítulo sigue mostrando los emojis normalmente.

## 🟢 Rendimiento

- **jsPDF/JSZip ahora se cargan bajo demanda.** Antes, 8 herramientas
  cargaban jsPDF (y una además JSZip) en el `<head>`, en cada visita,
  aunque la mayoría de las personas nunca hace clic en "Exportar PDF". Ahora
  se cargan recién al primer clic en exportar, con manejo de error idéntico
  al que ya existía (mensaje amigable si no hay conexión). Verificado con
  clics reales simulados: sin errores no controlados.
- `theme-color` ahora existe y es consistente en las 13 páginas (antes solo
  2 de 13 lo tenían) y se actualiza dinámicamente según el tema pastel
  elegido, en vez de quedar fijo.

## 🔵 SEO técnico

- Open Graph + Twitter Cards agregados en las 13 páginas (antes no existían
  en ninguna: al compartir un link en WhatsApp/redes, no se veía nada).
- Se creó una imagen de marca (`assets/og-image.png`, 1200×630) usando los
  colores/tipografía reales del sitio, y se agregó como `og:image`/
  `twitter:image` en las 13 páginas (con `twitter:card` actualizado a
  `summary_large_image`). Antes de esto, compartir un link mostraba solo
  texto; ahora también muestra una imagen de marca.
- `canonical` y `og:url` ahora se completan dinámicamente en tiempo de
  ejecución (a partir de `location.href`), porque el dominio real de
  despliegue no se puede conocer de antemano (el proyecto está pensado para
  funcionar en GitHub Pages, un dominio propio o una subcarpeta).
- Se agregó `robots.txt`.
- Se agregó `sitemap.xml` — **requiere una edición manual antes de usarlo**:
  reemplazar `TU-DOMINIO-AQUI` por el dominio real una vez publicado (está
  documentado dentro del propio archivo).

## ⚪ Consistencia

- Se agregó `apple-touch-icon` a las 13 páginas (antes solo lo tenía
  *Ejercicios Vocales*, la única marcada como PWA instalable). Se generaron
  a partir del mismo ícono de color que cada herramienta ya usaba como
  favicon, así que alguien que agregue cualquier herramienta a su pantalla
  de inicio en iPhone/iPad ahora ve un ícono a color en vez del genérico.

- Se corrigió el `lang` de *Plataforma de Análisis Acústico* (`es-CL` →
  `es`, igual que las otras 12 páginas).
- Se extendió el pequeño script anti-parpadeo que ya existía para el tema
  pastel (evita ver el tema equivocado por una fracción de segundo al
  cargar) para que además aplique el idioma guardado al `<html lang>` antes
  del primer pintado — antes solo el tema tenía esta protección.
- Los 5 archivos compartidos modificados (`shared.js`, `shared.css`,
  `i18n-engine.js`, `theme-switcher.js`, `a11y-reader.js`) ahora se cargan
  con `?v=2` en las 13 páginas, para que los navegadores de quienes ya
  visitaron el sitio no sigan usando una copia vieja en caché.

## Archivos nuevos
`/.nojekyll`, `/robots.txt`, `/sitemap.xml`, `/CHANGELOG_REVISION_TECNICA.md`,
`/HANDOFF_CONTINUIDAD.md`

## Cómo se verificó
Cada cambio se probó cargando las 13 páginas en Chromium headless
(Playwright) y revisando la consola en busca de errores; los cambios de
mayor riesgo (el fix de XSS, los widgets, el cambio de tema/idioma, la carga
diferida de PDF) se probaron además con interacciones reales simuladas
(clics, teclado) y no solo lectura de código.

# Handoff técnico — continuar esta revisión en otra instancia de Claude

> **Actualización:** esta revisión se fusionó con una versión más nueva del
> proyecto (subida por el usuario) que agregó una 13ª herramienta
> (**Biofeedback Vocal en Tiempo Real**, inspirada en TruVox, con cita
> académica real incluida) y amplió la Biblioteca Educativa a 23 temas con
> buscador. Todo lo de esta sección de "pendientes" sigue vigente igual;
> además, ahora en la raíz del proyecto hay dos documentos de historial que
> vale la pena leer si hace falta más contexto de **por qué** existen ciertas
> herramientas o decisiones de diseño: `CONTINUACION-HERRAMIENTAS-CLINICAS.md`
> (roadmap de las 13 herramientas, con las convenciones que se fueron
> estableciendo — vale la pena leerlo, documenta bugs reales ya encontrados y
> corregidos como el de `label for=` sin conectar, o jsPDF sin `defer`) y
> `contexto-traduccion-i18n_7.md` (historial de traducciones/accesibilidad).

This document existe para que **otra conversación / cuenta de Claude** pueda
retomar exactamente donde quedó esta revisión, sin tener que re-auditar todo
el proyecto desde cero. Pegá este archivo (o subí el .zip completo, que ya lo
incluye) al inicio de la nueva conversación.

## Qué es este proyecto

"Consultorio Vocal" — una suite clínica gratuita de 13 herramientas para
fonoaudiología vocal (de Matilde Pizarro Toro), 100% estática (HTML/CSS/JS
sin build step, pensada para GitHub Pages), trilingüe (ES/PT/EN), sin
backend (todo en `localStorage`/`IndexedDB` del navegador), con 5 temas
pasteles y un lector de accesibilidad por voz. El README del repo (raíz)
documenta la arquitectura completa — **leerlo primero** si hace falta más
contexto. Puntos de diseño deliberados que NO hay que "corregir":
- **Cero build step es una decisión de producto**, no un descuido. No agregar
  bundlers/frameworks ni un paso de compilación obligatorio.
- El Service Worker de `vocalizador/` está **deliberadamente scopeado** a su
  propia carpeta para no interferir con el resto del portal (está
  documentado en el README). No ampliar su scope.
- Cada carpeta de herramienta funciona también de forma independiente.

## Estado real del trabajo (julio 2026)

Se hizo una auditoría completa (arquitectura, seguridad, accesibilidad,
performance, SEO, calidad de código) leyendo el código real (no solo
"chequeos genéricos") y se implementó y **verificó con Playwright/Chromium
headless** una tanda de mejoras. El detalle completo de lo ya hecho está en
`CHANGELOG_REVISION_TECNICA.md` (mismo directorio) — no lo dupdo acá, léelo.

### Infraestructura de testing ya armada (reusar, no reinventar)
El entorno de ejecución (contenedor Linux con bash) tiene:
- Node 22 + Playwright 1.56 con **Chromium ya instalado** en
  `/opt/pw-browsers` (`PLAYWRIGHT_BROWSERS_PATH` ya seteado como variable de
  entorno) — funciona sin acceso a internet, ideal para probar el sitio.
- Python 3 (`python3 -m http.server 8080`) para servir el sitio localmente.
- **Importante**: los procesos en background NO sobreviven entre llamadas a
  la herramienta bash (si el próximo entorno tiene la misma limitación); hay
  que arrancar el server y correr el test en el **mismo comando** (con `&` +
  `sleep 1` + el comando de test + `kill`), todo encadenado — ver el ejemplo
  más abajo.
- Los 403 de `cdnjs.cloudflare.com` y `fonts.googleapis.com`/`fonts.gstatic.com`
  en consola son **esperados** (el sandbox no tiene salida a internet) — no
  son bugs reales. `smoke_test.js` ya los filtra.
- Scripts de test que quedaron listos para reusar, ya incluidos en este
  .zip dentro de `_qa-scripts/` (no se despliegan como parte del sitio, son
  solo para desarrollo): `smoke_test.js` (carga las 13 páginas, revisa
  consola), `interactive_test.js` (prueba el fix de XSS), `lazyload_test.js`
  (prueba la carga diferida de PDF), `widget_test.js` (prueba tema/idioma/
  widgets). Correrlos, por ejemplo:
  ```bash
  cd consultorio-vocal   # la raíz del proyecto descomprimido
  python3 -m http.server 8080 >/tmp/http.log 2>&1 & SERVER_PID=$!
  sleep 1
  node _qa-scripts/smoke_test.js http://localhost:8080
  kill $SERVER_PID 2>/dev/null
  ```
  Volver a correrlos después de cualquier cambio nuevo.

## Pendiente / recomendado (priorizado)

### 1. Hash SRI para jsPDF y JSZip — bien acotado, hacer con cuidado
Los `<script>` de jsPDF (`2.5.1`) y JSZip (`3.10.1`) se cargan ahora bajo
demanda vía `cvLoadScript()` (en `assets/shared.js`) con `crossorigin` y
`referrerPolicy`, pero **sin** atributo `integrity` (hash SRI). Lo intenté
**dos veces** (en dos sesiones distintas) sin éxito: las páginas de
cdnjs.com (`https://cdnjs.com/libraries/jspdf/2.5.1`) renderizan el hash con
JS del lado del cliente (no aparece en el HTML que devuelve `fetch`), la API
`api.cdnjs.com` no se dejaba consultar sin haber aparecido antes en un
resultado de búsqueda, y unpkg.com sirve el archivo a través de un visor de
código (HTML con resaltado de sintaxis), no los bytes crudos, así que
tampoco es seguro calcular el hash a partir de eso. **Un hash incorrecto
rompe silenciosamente la exportación de PDF/ZIP en todo el sitio**, así que
preferí no inventarlo dos veces seguidas.
- Pasos sugeridos para la próxima instancia: entrar directamente (con
  navegador real, no `fetch`) a `https://cdnjs.com/libraries/jspdf/2.5.1` y
  `https://cdnjs.com/libraries/jszip/3.10.1`, usar el botón "Copy SRI Hash"
  que la propia página ofrece (es JS del lado del cliente, por eso no
  aparece al hacer `fetch` de la página), y agregar
  `integrity="sha512-..."` al `createElement('script')` dentro de
  `cvLoadScript()` en `assets/shared.js` (hoy la función no acepta un
  segundo parámetro para esto — habría que agregarlo:
  `cvLoadScript(url, integrity)`).
- Verificar después con `lazyload_test.js` (aunque en este sandbox sin
  internet no se puede probar la carga real exitosa del CDN — probarlo en un
  entorno con salida a internet, o al menos confirmar que el hash coincide
  con el que la propia cdnjs.com publica).

### 2. ~~Falta un og-image para Open Graph~~ — YA HECHO
Se generó `assets/og-image.png` (1200×630, con los colores/tipografía
reales del sitio) y se agregó a las 13 páginas. El HTML fuente usado para
generarla (por si se quiere ajustar texto/colores más adelante sin pedirle
a una IA que lo rehaga) queda en `_qa-scripts/og-image-source.html` — se
generó tomándole una captura con Playwright a 2x y reduciéndola a 1200×630.

### 3. `sitemap.xml` tiene un dominio placeholder
Ver el propio archivo: `TU-DOMINIO-AQUI` debe reemplazarse por el dominio
real una vez que se sepa dónde se publica el sitio.

### 4. Assets de audio pesados (no tocar sin poder escuchar el resultado)
- `assets/audio/musica-fondo.opus` pesa ~4.5MB (música de fondo de la
  portada, con intento de autoplay silencioso que probablemente el navegador
  bloquea de todas formas). Podría re-codificarse a menor bitrate para
  reducir peso, pero **no lo hice** porque no puedo verificar
  perceptualmente que el audio resultante suene bien — un error acá sería
  vergonzoso y no puedo "escuchar" el resultado en este entorno.
- Varios `.wav` sin comprimir en `vocalizador/assets/` (demo, escala, etc.)
  podrían convertirse a un formato comprimido para achicar la descarga
  inicial de la PWA. **Mismo motivo para no tocarlos**: son referencias de
  tono/pitch para una herramienta de entrenamiento vocal — un error de
  codificación (muestreo, clipping) afectaría la precisión de la herramienta,
  no solo la estética. Si se hace, verificar con cuidado (o dejarlo para
  alguien que pueda escuchar el resultado).

### 5. Nice-to-have no crítico
- ~~`apple-touch-icon` solo existía en `vocalizador/`~~ — YA HECHO: se
  generaron los 12 restantes a partir de cada favicon SVG existente
  (renderizados con Playwright a 360×360, guardados como
  `<carpeta>/apple-touch-icon.png`).
- Los ~49 atributos `onclick="..."` inline que quedan en el código (la
  mayoría sin interpolación de datos, ya verificados como seguros — ver
  `CHANGELOG_REVISION_TECNICA.md`) podrían modernizarse a
  `addEventListener` por prolijidad/CSP, pero no es un bug, es estilo. Si se
  encara, hacerlo de a un archivo por vez y volver a correr
  `smoke_test.js`/`interactive_test.js` después de cada uno.
- Se evaluó (y se descartó a propósito) refactorizar los 3 widgets flotantes
  (tema/idioma/accesibilidad) hacia una sola fábrica compartida para eliminar
  duplicación de código. Se decidió NO hacerlo y en cambio aplicar parches
  puntuales a cada uno (mismo resultado de accesibilidad, mucho menor riesgo
  de romper los 3 widgets a la vez en archivos que corren en las 13
  páginas). Si se quiere encarar ese refactor más adelante, `widget_test.js`
  ya cubre el comportamiento esperado de los 3 widgets — usarlo como red de
  seguridad antes/después.

## Decisiones de diseño tomadas esta sesión (para no deshacerlas sin querer)

- **CSV**: se creó `csvField`/`toCsv`/`downloadCsv` en `assets/shared.js`
  como fuente única de verdad para exportar CSV (RFC 4180 + anti-inyección
  de fórmulas + BOM UTF-8). `praat-web/index.html` se dejó **sin tocar** a
  propósito: sus 5 exportaciones CSV son 100% numéricas (sin texto libre),
  por lo que forzar la nueva utilidad ahí no aporta valor real y solo
  agrega riesgo. No es un descuido, fue una decisión explícita.
- **Lazy-load de jsPDF/JSZip**: se usa `cvLoadScript(url)` (memoizado por
  URL) en `assets/shared.js`. El patrón en cada archivo es: intentar
  `await cvLoadScript(...)` solo si `window.jspdf` (o `window.JSZip`) no
  existe todavía, y dejar que el chequeo de "librería no disponible" que
  YA existía en cada herramienta (mensaje de error amigable) maneje el caso
  de que la carga falle. No se inventó manejo de errores nuevo: se reusó el
  que ya estaba.
- **Service Worker de vocalizador**: se cambió de `cache.addAll()` (todo o
  nada) a cachear cada asset individualmente con `.catch()` — más
  resiliente. Se subió `CACHE_NAME` a `v4`.
- **Cache-busting**: se agregó `?v=2` a las referencias de los 5 archivos
  compartidos modificados, en las 13 páginas + en el precache del SW de
  vocalizador (¡ambos lados tienen que coincidir en la URL exacta, con
  query string incluido, porque `caches.match()` compara la URL completa!).
  Si se vuelve a modificar alguno de estos 5 archivos, subir a `?v=3` en
  **todos** los lugares donde se referencian (buscar `?v=2` en todo el
  proyecto).

## Cómo retomar

1. Descomprimí el .zip adjunto en un entorno con las mismas herramientas
   (bash + Playwright, o al menos un navegador cualquiera para probar).
2. Leé `CHANGELOG_REVISION_TECNICA.md` para el detalle de lo ya hecho.
3. Empezá por el punto 1 de "Pendiente" (hash SRI) si hay acceso a internet
   fresco para buscar, porque es el que quedó más claramente inconcluso.
4. Para cualquier cambio nuevo: correr `smoke_test.js` antes y después como
   mínimo; para cambios en los widgets compartidos o en seguridad, correr
   también los tests interactivos correspondientes.

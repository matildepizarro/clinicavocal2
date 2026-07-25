# Consultorio Vocal — Traducción ES/PT/EN — Contexto de continuidad

## ✅ Esfuerzo vocal (`esfuerzo-vocal/`) — 100% COMPLETA Y VERIFICADA (esta ronda)

Se tradujo la herramienta completa siguiendo el patrón estándar:
- Se creó `esfuerzo-vocal/i18n-dict.js` con 61 claves × 3 idiomas (es/pt/en),
  paridad exacta confirmada.
- Se agregó `i18n-dict.js` + `i18n-engine.js` al `<head>`, sin `defer`,
  antes de jsPDF.
- Se etiquetó todo el HTML estático: header, instrucciones, formulario
  completo (ID participante, evaluador, fecha, selector de tarea con sus
  5 opciones, sensaciones — 13 chips con el mismo patrón que Bitácora:
  `value` del checkbox se deja en español como dato clínico canónico, solo
  el `<span>` visible se traduce), escala Borg CR-10 completa (11 niveles),
  observaciones, evidencia, botones, tabla de registros, footer con la cita
  APA (la cita bibliográfica en sí NO se traduce, solo el texto envolvente
  "Nota: Informe generado localmente. Basado en...").
- Se agregó helper `tt()` y se envolvieron todos los mensajes dinámicos:
  alerts (`Seleccione un valor en la Escala Borg CR-10.`, error de imagen,
  sin registros para PDF), confirms (eliminar registro, borrar todos),
  encabezados de tabla armados por JS (`renderRegistros()`), textos de
  botones dentro de filas (Exportar/Eliminar), el toggle dinámico de
  "Agregar/Ocultar sensaciones" (`toggleSensaciones()`), el fallback de
  tarea personalizada no descrita, y **todo el texto del informe PDF**
  (título, "Generado:", "Registro N / ID / Evaluador / Fecha", las
  etiquetas Tarea/Sensaciones/Escala Borg/Observaciones, "Referencia (APA
  7):" y la línea de autora) — la cita APA y el nombre de archivo del PDF
  se dejaron sin traducir (igual que en Bitácora).
- Se agregó el listener `cv-lang-changed` al final del script: reconstruye
  el texto del botón de sensaciones según su estado actual (expandido/
  colapsado) y vuelve a llamar `renderRegistros()` para refrescar encabezados
  de tabla y botones ya renderizados.

### ✅ Verificación final (esfuerzo-vocal)
- `node --check` sin errores en `i18n-dict.js` y en el bloque `<script>`
  principal (líneas 199–296).
- Cobertura HTML↔dict-ES: 58/58 claves de atributos `data-i18n*` sin
  faltantes (más 3 claves usadas solo desde JS dinámico).
- **Paridad exacta ES/PT/EN confirmada**: 61/61 claves en los 3 idiomas.
- `<div>`/`</div>` balanceados (16/16).

**`esfuerzo-vocal/` está terminada. No requiere más trabajo de traducción.**

## ✅ Sesión diaria (`sesion-diaria/`) — 100% COMPLETA Y VERIFICADA

En esta ronda se cerró el único pendiente que quedaba: el array
`phraseGroups` (frases de práctica con variantes de énfasis contrastivo).

### ✅ Qué se hizo en esta ronda
- Se movió el contenido de `phraseGroups` al diccionario como
  `phraseGroupsData` (array completo por idioma, no solo strings sueltos).
- Las 6 frases base + sus variantes de énfasis (~24 líneas de texto) se
  **tradujeron con criterio de equivalencia funcional**, no traducción
  literal: son un ejercicio clásico de énfasis prosódico/acento contrastivo
  ("Yo no dije que ella lo hizo" → "I didn't say she did it.", con las
  mismas 5 lecturas posibles según qué palabra se acentúe). Se buscó que
  cada variante en PT/EN preserve el mismo fenómeno lingüístico que la
  versión en español, no solo el significado superficial.
- Se creó `getPhraseGroups()` que lee `phraseGroupsData` del idioma activo
  (con fallback al array español hardcodeado si el motor i18n no está
  disponible) y `buildPhrasesUI()` que reconstruye el bloque de frases desde
  cero — se llama al cargar la página y de nuevo en cada `cv-lang-changed`.
- Al reconstruir, se preserva el estado ya medido de cada frase
  (`phraseResults[key].summaryText`) para no perder mediciones ya hechas si
  la persona cambia de idioma a mitad de sesión.
- Se tradujeron además dos strings que quedaron sueltos de la ronda
  anterior: "Sin detección" (`stSinDeteccion`) y las plantillas de resumen
  de medición "media X Hz · mín Y · máx Z (· N% dentro de A-B Hz)"
  (`stResumenSinRango` / `stResumenConRango`, como funciones con variables).
- Fix menor de un bug preexistente (no relacionado con idiomas): `resetAll()`
  reseteaba `phraseResults` a `null` pero no limpiaba visualmente los badges
  de "Sin medir" en el DOM — ahora sí lo hace.
- El listener `cv-lang-changed` ahora también reconstruye `phraseGroups` y
  la UI de frases al cambiar de idioma.

### ✅ Verificación final
- `node --check` sin errores en `i18n-dict.js`, en el script principal
  (líneas 592–1852) y en el bloque del listener (1855–1878).
- Cobertura HTML↔dict-ES: 113/113 claves de atributos `data-i18n*` sin
  faltantes.
- **Paridad exacta ES/PT/EN confirmada**: los 3 bloques del diccionario
  tienen exactamente las mismas 240 claves cada uno (sin claves de más ni de
  menos en ningún idioma).
- `<div>`/`</div>` balanceados (148/148).

**`sesion-diaria/` está terminada. No requiere más trabajo de traducción.**

## ⬜ Próximo paso (y último): Respiración cuadrada (`respiracion-cuadrada/`)
Sin empezar. Patrones de respiración + editor + metrónomo. Sin exportación
PDF. El más chico de todos. Es la **última herramienta pendiente** — al
terminarla, la traducción completa de la plataforma (7 piezas: portal + 6
herramientas) queda cerrada.

## Prompt para pegar en la nueva conversación

```
Estoy retomando la traducción completa (español/portugués/inglés) de la
plataforma "Consultorio Vocal". Adjunto el zip de la plataforma con el avance
actual: 5 de las 6 herramientas (portal, Ejercicios Vocales, Plataforma de
Análisis Acústico, Bitácora de sesiones, Sesión diaria y ahora también
Esfuerzo vocal) están 100% traducidas y verificadas. Falta solo Respiración
cuadrada — es la última pieza pendiente. Adjunto también este archivo de
contexto con la arquitectura y el patrón a seguir (ya construido, no
rehacer). Por favor:

1. Traduce respiracion-cuadrada/: crea su i18n-dict.js, etiqueta el HTML
   estático con data-i18n, activa el motor en el <head>, envuelve los
   mensajes dinámicos con tt() (no tiene exportación PDF), agrega el
   listener cv-lang-changed, y verifica con node --check y el script de
   cobertura que ES/PT/EN tengan exactamente las mismas claves.
2. Reempaqueta el zip completo y avísame con un resumen de 3-4 líneas.
3. Con esto la traducción de toda la plataforma queda 100% completa — antes
   de cerrar, sugiere una verificación final de conjunto (correr el script
   de paridad sobre las 7 piezas, confirmar que no quedó ningún data-i18n
   huérfano) por si vale la pena hacerla como cierre de todo el proyecto.
```

## Qué es este proyecto
Portal estático (HTML/CSS/JS, sin build ni backend) con 6 herramientas de
fonoaudiología vocal + un portal (`index.html`). Ver `README.md` dentro del
zip para la estructura de carpetas completa.

## Arquitectura de traducción (YA CONSTRUIDA — no rehacer)

### `assets/i18n-engine.js` (compartido, no tocar salvo bug)
- Lee/guarda el idioma en `localStorage['cv-lang']` (compartido entre TODAS
  las herramientas, igual que el tema de color).
- Expone `window.CV_I18N = { lang, t(key), setLang(id), init(dict), applyToDom() }`.
- **Autoarranca solo** al cargar: si detecta `window.CV_I18N_DICT` en el
  `<head>`, hace merge y llama `applyToDom(document)` — no hace falta
  invocar `init()` manualmente en el script de cada herramienta.
- `t(key)` devuelve el string traducido, o cae a español si falta la clave en
  el idioma actual, o devuelve la clave cruda como último recurso.
- **Importante**: los valores del diccionario pueden ser strings, funciones,
  O estructuras de datos (arrays/objetos) — como se usó ahora con
  `phraseGroupsData` para contenido no textual/estructurado. Para textos con
  variables se usan funciones: `stListo: (d,n)=> \`Listo · ${d}s · ${n}
  cuadros\`` y se llaman así: `window.CV_I18N.t('stListo')(duracion, n)`.
- Aplica automáticamente estos atributos sobre cualquier elemento del DOM:
  - `data-i18n="clave"` → `textContent`
  - `data-i18n-html="clave"` → `innerHTML` (solo para HTML estático de
    confianza, como el footer con `<b>`/`<a>`; NUNCA para datos de usuario)
  - `data-i18n-placeholder`, `data-i18n-title`, `data-i18n-aria`,
    `data-i18n-value`, `data-i18n-content` (para `<meta content="...">`)
- Dispara `window.dispatchEvent(new CustomEvent('cv-lang-changed'))` cada vez
  que cambia el idioma — cada herramienta debe escuchar este evento y
  re-renderizar lo que genera dinámicamente (listas, tablas, informes).
- Dibuja el botón flotante 🌐 (junto al de temas 🎨, sin superponerse).
- Tiene un `CORE_DICT` interno con textos usados en TODAS las páginas (el
  link "Volver al portal", el selector de temas). No hace falta tocarlo.

### Patrón por herramienta (repetir en cada una)
1. Crear `<carpeta-herramienta>/i18n-dict.js` con `window.CV_I18N_DICT =
   { es:{...}, pt:{...}, en:{...} }` (claves = strings, funciones, o datos).
2. En el `<head>`, ANTES de cualquier otro script, SIN `defer`:
   ```html
   <script>document.documentElement.setAttribute('data-pastel-theme', ...);</script>
   <script src="i18n-dict.js"></script>
   <script src="../assets/i18n-engine.js"></script>
   ```
3. Etiquetar el HTML estático con `data-i18n="clave"` (y variantes).
4. Para JS con mensajes dinámicos: agregar helper `tt()` cerca del inicio
   del script principal y envolver cada string:
   ```js
   const tt = (key, fallback) => (window.CV_I18N ? window.CV_I18N.t(key) : (fallback ?? key));
   ```
5. Para funciones/informes con variables, usar
   `tt('clave', (args)=>'fallback literal')(args)` o directamente
   `window.CV_I18N.t('clave')(args)`.
6. Para contenido estructurado (arrays de datos, no solo strings de UI):
   mover el array completo al dict como valor por idioma (ver
   `phraseGroupsData` en `sesion-diaria/i18n-dict.js` como ejemplo de
   referencia) y crear una función `getXxx()` con fallback + una función
   `buildXxxUI()` que reconstruya el DOM, llamada al cargar y en cada
   `cv-lang-changed`. Si hay estado (mediciones, valores guardados) atado a
   ese contenido, preservarlo al reconstruir en vez de perderlo.
7. Agregar al final del script principal el listener `cv-lang-changed` que
   vuelva a llamar a las funciones de render dinámico.

### ⚠️ Orden de scripts — por qué importa
Cada herramienta tiene su lógica principal en un `<script>` **inline sin
`defer`** cerca del final del `<body>` (excepto Vocalizador, que usa
`type="module"`, siempre diferido). Un script clásico sin `defer` se
ejecuta de inmediato al parsear esa línea del HTML — ANTES que cualquier
script con `defer`. Por eso `i18n-dict.js` e `i18n-engine.js` van en el
`<head>`, sin `defer`, para que `window.CV_I18N`/`CV_I18N_DICT` ya existan
cuando el script principal se ejecute más abajo en el body.

### Deduplicación de `escapeHtml()`
`assets/shared.js` tiene `escapeHtml()` global (seguridad, no confundir con
`assets/i18n-engine.js`, que es idiomas). Bitácora, Esfuerzo vocal, Sesión
diaria y la Plataforma de Análisis Acústico de la Voz ya lo cargan vía
`<script src="../assets/shared.js"></script>` antes de su script principal.
Vocalizador lo carga con `defer`.

## Cómo verificar cobertura y paridad de traducción (correr después de cada herramienta)
```bash
cd /ruta/al/proyecto
python3 -c "
import re
html = open('NOMBRE-HERRAMIENTA/index.html', encoding='utf-8').read()
keys_html = set(re.findall(r'data-i18n(?:-html|-content|-placeholder|-title|-aria|-value)?=\"([a-zA-Z0-9]+)\"', html))
dict_js = open('NOMBRE-HERRAMIENTA/i18n-dict.js', encoding='utf-8').read()
esk = set(re.findall(r'([a-zA-Z0-9]+):\s*[\'\"(\[]', dict_js.split('pt:')[0]))
print('HTML keys:', len(keys_html), 'faltantes en dict ES:', keys_html - esk)
"
```
Y para paridad exacta entre los 3 idiomas del dict (importante — evita que un
idioma se quede sin una clave que otro sí tiene):
```bash
python3 -c "
import re
s = open('NOMBRE-HERRAMIENTA/i18n-dict.js', encoding='utf-8').read()
parts = s.split('  pt: {'); es = parts[0]
rest = parts[1].split('  en: {'); pt = rest[0]; en = rest[1]
def keys(b): return set(re.findall(r'^\s{4}([a-zA-Z0-9]+):', b, re.M))
kes,kpt,ken = keys(es),keys(pt),keys(en)
print('ES-PT diff:', kes ^ kpt)
print('ES-EN diff:', kes ^ ken)
print(len(kes), len(kpt), len(ken))
"
```
También correr `node --check archivo.js` sobre el bloque `<script>`
principal extraído (ej. `sed -n 'INICIO,FIN p' index.html > /tmp/x.js`,
ajustando el rango de líneas al archivo actual) para confirmar que no
quedaron errores de sintaxis tras los reemplazos.

## Estado actual — qué está 100% traducido y verificado

### ✅ Portal principal (`index.html`)
Todo: nav, hero, 6 tarjetas, footer, tour guiado completo (6 pasos), música
de fondo. 77 claves × 3 idiomas.

### ✅ Ejercicios Vocales (`vocalizador/`)
Toda la interfaz estática (127 claves). Ejercicios/categorías/progresiones/
niveles completos en `js/exercises.js`. Re-renderizado en `cv-lang-changed`
implementado.
**Pendiente menor** (no bloqueante): mensajes dispersos en `js/app.js`
(toasts de evaluación/vibrato, clasificación de rango vocal en onboarding,
errores de micrófono) — buscar con
`grep -n "'[A-Za-zÁÉÍÓÚñ].*'" vocalizador/js/app.js`.

### ✅ Plataforma de Análisis Acústico de la Voz (`praat-web/`)
100% completo, incluyendo el informe acústico completo (F0/formantes/
jitter/shimmer), 13 mensajes de estado, nombres de archivos exportados.
88 claves × 3 idiomas.

### ✅ Bitácora de sesiones (`bitacora-sesiones/`) — 100% completo
Interfaz estática, 24 toasts, 5 confirmaciones modales, informe PDF
completo. 113 claves verificadas.
**Nota de alcance** (menor, sigue pendiente si se quiere cerrar del todo):
etiquetas internas de `q-card` en `renderQueue()` y
`renderSessionExSummary()`; `DEFAULT_EXERCISES` se deja intencionalmente
en español (dato clínico editable, no contenido fijo).

### ✅ Sesión diaria (`sesion-diaria/`) — 100% completo (cerrado en esta ronda)
HTML estático, motor i18n, todo el JS dinámico (helper `tt()`, badge, logs,
botones dinámicos, exportación PDF/CSV/ZIP, análisis narrativo) Y el array
`phraseGroups` con sus 6 frases + variantes de énfasis, todo traducido y
verificado. 240 claves × 3 idiomas, con paridad exacta confirmada.

### ✅ Esfuerzo vocal (`esfuerzo-vocal/`) — 100% completo (cerrado en esta ronda)
HTML estático, motor i18n, escala Borg CR-10 completa, 13 sensaciones
(valor canónico en español, display traducido), formulario, tabla de
registros con encabezados dinámicos, exportación JSON, informe PDF completo
(incluida la cita APA sin traducir) y listener `cv-lang-changed`. 61 claves
× 3 idiomas, con paridad exacta confirmada.

### ⬜ Respiración cuadrada (`respiracion-cuadrada/`) — sin empezar
Patrones de respiración + editor + metrónomo. Sin exportación PDF. El más
chico de los que faltan.

## Archivos de referencia dentro del zip
- `i18n-dict.js` (raíz) — diccionario del portal
- `vocalizador/i18n-dict.js`
- `praat-web/i18n-dict.js`
- `bitacora-sesiones/i18n-dict.js`
- `sesion-diaria/i18n-dict.js` — **240 claves, 100% completo, incluye
  `phraseGroupsData` como ejemplo de referencia para traducir contenido
  estructurado (no solo strings de UI).**
- `esfuerzo-vocal/i18n-dict.js` — 61 claves, 100% completo, buen ejemplo de
  referencia para: chips con `value` canónico en español + `<span>`
  traducido, y traducción completa de un informe PDF con jsPDF.
- `assets/i18n-engine.js` — motor compartido
- `assets/shared.css` / `assets/shared.js` — de la ronda de mejoras anterior
  (navegación + seguridad), no confundir con los archivos de idioma
- `contexto-y-prompt-mejoras-plataforma.md` — documento de la ronda de
  mejoras de interfaz/código (ya completada), útil como referencia de qué
  se hizo antes de empezar con idiomas

## ✅ Cierre de pendientes menores (ronda de continuidad posterior)
Se cerraron los dos pendientes no bloqueantes que quedaban documentados:

- **`vocalizador/js/app.js`**: se envolvieron con `tt()` todos los mensajes
  sueltos que quedaban en español — toasts de micrófono/grabaciones, todo
  el flujo del diálogo "Encontrar mi rango" y del asistente de bienvenida
  (onboarding), la pestaña "Evaluar" completa (botones, estados dinámicos,
  desglose de notas), vibrato, y el selector de dispositivo de micrófono.
  Se agregó `translateRangeLabel()` para traducir la clasificación de rango
  vocal (Soprano/Barítono/etc.) reusando las claves `opt*` ya existentes.
  Se agregaron ~40 claves nuevas × 3 idiomas a `vocalizador/i18n-dict.js`
  (144 claves totales, paridad ES/PT/EN confirmada). `node --check` sin
  errores.
- **`bitacora-sesiones/index.html`**: se tradujeron las etiquetas internas
  de `q-card` en `renderQueue()` y el estado vacío de
  `renderSessionExSummary()` (total, "hecho"/"en curso"/"completado",
  placeholder de nota rápida, tooltips Pausar/Iniciar/Reiniciar/Quitar).
  Se agregaron 11 claves nuevas × 3 idiomas a `bitacora-sesiones/i18n-dict.js`
  (158 claves totales, paridad ES/PT/EN confirmada). `node --check` sin
  errores. `DEFAULT_EXERCISES` se mantiene intencionalmente en español
  (dato clínico editable), como estaba documentado.

**No queda ningún pendiente de traducción documentado en la plataforma.**

## ✅ Lector de accesibilidad (nueva funcionalidad transversal)
Se agregó `assets/a11y-reader.js`, un widget flotante 🔊 compartido por las
7 piezas (mismo patrón que el selector de tema 🎨 y de idioma 🌐):

- Al activarlo, lee en voz alta (Web Speech API / `SpeechSynthesis`) el
  texto accesible de cualquier elemento al pasar el mouse (hover, con un
  pequeño delay de 160ms para no disparar en cada píxel) o al enfocarlo
  con teclado (Tab/foco) — ambos disparadores activos a la vez.
- El propio panel del botón flotante funciona como el "Ajustes" de este
  modo (switch on/off + control de velocidad de lectura), ya que es el
  mismo mecanismo que ya usan tema/idioma para configuración transversal
  sin duplicar UI en cada herramienta.
- Extrae el texto accesible con prioridad: `aria-label` →
  `aria-labelledby` → casos especiales de `input`/`select`/`textarea`
  (label asociado + valor/placeholder, o "activado"/"desactivado" para
  checkboxes) → `alt` de imágenes → `title` → `textContent`.
- Respeta el idioma activo (ES/PT/EN): elige voz de síntesis por idioma
  (`es-ES`/`pt-BR`/`en-US`) y traduce las palabras de estado
  ("activado"/"desactivado"/"seleccionado") vía claves nuevas agregadas
  al `CORE_DICT` compartido de `assets/i18n-engine.js` (se propagan
  automáticamente a las 7 piezas sin tocar sus diccionarios locales).
- Muestra además una leyenda (caption) abajo de la pantalla con el texto
  que se está leyendo, útil para personas sordas/hipoacúsicas o si el
  navegador no tiene voces de síntesis instaladas.
- Resalta con un contorno visual (`outline`) el elemento que se está
  leyendo.
- Esc detiene la lectura en curso en cualquier momento.
- Estado y velocidad persisten en `localStorage` (`cv-a11y-on`,
  `cv-a11y-rate`), compartidos entre toda la plataforma.
- Se agregó `<script src=".../assets/a11y-reader.js" defer></script>`
  justo después de `theme-switcher.js` en las 7 páginas (portal + 6
  herramientas). `node --check` sin errores en los 7 bloques `<script>`
  inline tras la inserción.

## 🐛 Corrección de 3 bugs reportados en Bitácora de Sesiones (reproducidos con Playwright antes y después del fix)

1. **Ejercicios que se superponían/dejaban de leerse al agregar varios a
   "Sesión de hoy"**: `renderQueue()` reconstruía el HTML completo de la
   cola cada 1 segundo vía `setInterval` mientras había un ejercicio
   corriendo, reseteando el scroll y generando flicker/tearing visual.
   Se agregó `updateQueueTicks()`, que actualiza solo los nodos que cambian
   por segundo (aro de progreso, número, texto de estado, botón
   pausar/iniciar) sin destruir el DOM. `renderQueue()` (reconstrucción
   completa) ahora solo se dispara ante cambios estructurales reales
   (agregar/quitar ejercicio, modo cadena activando el siguiente).
   Verificado: 8 tarjetas se mantienen íntegras, el input de nota no pierde
   foco/texto mientras el cronómetro corre en paralelo.

2. **No exportaba informes ni dejaba guardar lo hecho con el paciente**:
   el script de jsPDF se cargaba en el `<head>` sin `defer`, bloqueando el
   parseo de toda la página (incluido el botón Guardar) si la red es lenta,
   está restringida en la clínica, o el equipo está offline. Se agregó
   `defer` al script y una verificación explícita en `generatePDF()`
   (`if(!window.jspdf...)`) que muestra un mensaje claro y accionable en
   vez de fallar en silencio. `saveSession()` en sí nunca dependió de
   jsPDF y siempre funcionó — verificado que sigue guardando en
   localStorage incluso con la librería de PDF sin cargar.

3. **Piano que detecta la nota pero luego "se bugea y desaparece"**: en
   `spawnHeartPulse()` (animación del corazón 💗 al detectar una nota) había
   una línea que le ponía `position:absolute` inline **a la tecla del
   piano**, sacándola para siempre del `flex` del teclado. Se corrigió para
   que solo las teclas blancas (que no tenían position) reciban
   `position:relative` — nunca `absolute` — y se dejó intactas las teclas
   negras (ya `absolute` vía CSS con un `left` calculado). Verificado con
   Playwright: 0 de 21 teclas cambia de posición tras detectar 21 notas
   seguidas.

Se agregó la clave `toastPdfLibNoCargada` × 3 idiomas (159 claves totales
en `bitacora-sesiones/i18n-dict.js`, paridad ES/PT/EN confirmada).

## 🐛 Bug del interruptor del lector de accesibilidad (difícil de activar/desactivar)

Causa: el interruptor visual (la píldora verde/gris del panel 🔊) era un
`<span>` normal, sin conexión real al checkbox que controla el modo. Solo
funcionaba al hacer clic exactamente sobre el texto de la etiqueta (un área
angosta) — clicar sobre la píldora en sí, que es lo que cualquier persona
intenta tocar, no hacía absolutamente nada. De ahí que costara tanto
activarlo y, sobre todo, desactivarlo.

Fix en `assets/a11y-reader.js`: el contenedor de la píldora pasó de ser un
`<span>` a un `<label>` real que envuelve el checkbox — el patrón estándar
de un toggle switch accesible — de forma que un clic en cualquier punto
visible de la píldora (no solo en el texto) activa/desactiva el modo.
También se agregó `cursor:pointer` a todo el interruptor para reforzar que
es clickeable en toda su superficie.

Verificado con Playwright: 6 clics consecutivos sobre el centro de la
píldora alternan correctamente entre activado/desactivado, en las 7 piezas
de la plataforma (portal + 6 herramientas), ya que todas comparten el mismo
`assets/a11y-reader.js`.

## 🧭 Tour de bienvenida actualizado a la versión actual de la plataforma

El tour guiado (`index.html`) se había quedado desactualizado: solo tenía
6 pasos y no mencionaba el selector de idioma ni el lector de accesibilidad,
ambos agregados en rondas posteriores. Se actualizó a **8 pasos** en los
3 idiomas:

1. La plataforma en un vistazo (hero)
2. Navegación rápida (rail-links)
3. Entrenamiento & análisis (Ejercicios Vocales, Análisis Acústico, Respira Cuadrada)
4. Uso clínico diario (Bitácora, Sesión diaria, Esfuerzo vocal)
5. **NUEVO** — Elige tu idioma (🌐, menciona ES/PT/EN y actualización instantánea)
6. Personaliza los colores (🎨, 5 temas — sin cambios)
7. **NUEVO** — Lector de accesibilidad (🔊, explica que lee en voz alta al pasar el mouse o con Tab)
8. Música de fondo (🎵 — sin cambios, renumerado de paso 6 a 8)

Se agregaron las claves `tourStep5Title/Text` (idioma) y `tourStep7Title/Text`
(accesibilidad) × 3 idiomas en `i18n-dict.js` (raíz del portal), y se
renumeraron las claves de colores (5→6) y música (6→8) para mantener el
orden correcto. Paridad ES/PT/EN confirmada (66 claves en los 3 idiomas).

Verificado con Playwright: los 8 pasos apuntan al elemento correcto
(`#cv-tour-hero`, `.rail-links`, `#entrenamiento`, `#clinico`,
`#cv-lang-fab`, `#cv-theme-fab`, `#cv-a11y-fab`, `#cv-music-fab`) y el
contenido se traduce correctamente al cambiar de idioma (ES/PT/EN), sin
errores de consola.

## 🔍 Auditoría general de bugs y accesibilidad (rol: dev + fonoaudióloga)

Barrido completo de las 7 piezas con pruebas automatizadas (Playwright):
consola sin errores en ninguna, botones-ícono con nombre accesible al 100%,
imágenes con `alt`, y PWA de Ejercicios Vocales con manifest/service
worker/íconos íntegros.

**Bug de accesibilidad real encontrado y corregido — mismo patrón que el
del interruptor de accesibilidad (turno anterior):** varios `<label>` se
cerraban ANTES del `<input>` que describían, en vez de envolverlo o
apuntarle con `for=`. Visualmente se veían pegados en la misma fila, pero
para un lector de pantalla (o nuestro propio lector 🔊) el control quedaba
sin nombre — el usuario solo escuchaba "control deslizante, 75" sin saber
qué mide. Se corrigió agregando `for="id"` en:
- `praat-web/index.html`: Piso, Techo (pitch), Cantidad de formantes,
  Techo de formantes, Ventana, Rango dinámico, Frec. máxima (7 controles).
- `respiracion-cuadrada/index.html`: Volumen del metrónomo, BPM (2 controles).

**Además**, en `bitacora-sesiones/index.html` se conectaron los 4
deslizadores de volumen (General/Piano/Ejercicios/Metrónomo) a sus
etiquetas visibles vía `aria-labelledby`, el control de tempo del
metrónomo recibió `aria-label`, y los ~90 campos de nombre/duración del
catálogo administrable de ejercicios (uno por fila) recibieron
`aria-label` indexado (`Nombre del ejercicio N` / `Duración en segundos
del ejercicio N`) para que cada fila sea identificable al navegar con
teclado o lector de pantalla. Claves nuevas `ariaNombreEjercicio` /
`ariaDuracionEjercicio` × 3 idiomas (161 claves totales, paridad
confirmada).

**Revisión clínica (rol fonoaudióloga):** la escala de esfuerzo vocal en
`esfuerzo-vocal` usa Borg CR-10 adaptada, correctamente citada (Fuentes-
Aracena & Correa-Forno, 2025, Revista Chilena de Fonoaudiología) — sin
cambios necesarios, ya está bien fundamentada. `praat-web` ya aclaraba
que jitter/shimmer son aproximaciones cuadro-a-cuadro, no el cálculo
período-a-período exacto de Praat — buena práctica de transparencia
clínica, sin lenguaje diagnóstico riesgoso en ninguna herramienta.

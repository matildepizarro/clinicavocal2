# 📋 CONTEXTO DE CONTINUACIÓN — Roadmap de herramientas clínicas de voz
## Para la próxima instancia de Claude que continúe este trabajo

## 🏁 SESIÓN MÁS RECIENTE DE TODAS (esta) — Ítem 10: Dashboard longitudinal (ROADMAP ORIGINAL COMPLETO)

**Estado: los 10 ítems de la lista original ya están construidos.** No
queda ningún ítem pendiente del roadmap original. Lo que sigue abajo son
solo mejoras/verificaciones opcionales, no compromisos ya adquiridos con
el usuario.

**Qué se hizo:** carpeta nueva `/dashboard-longitudinal/` con
`index.html` + `i18n-dict.js` (26 claves, paridad ES/PT/EN 100%
verificada), agregada como tarjeta al portal.

- **Antes de escribir código se investigó el problema real** que la
  sesión anterior había anotado (ID de paciente no compartido): se leyó
  el código fuente real de `evaluacion-vocal`, `esfuerzo-vocal` y
  `anamnesis-vocal` para confirmar los nombres exactos de clave de
  localStorage y de campo:
  - `evaluacion_vocal_v1` → array de registros `{id, tipo: 'IDV-Cl'|
    'IDV-Cl-10'|'GRBAS'|'TMF/s-z', paciente, fecha, resumen}` (resumen es
    texto libre tipo "Puntaje total: 45/120").
  - `medicion_esfuerzo_v2` → array de registros `{participantId,
    evaluador, fecha, task, score (0-10 Borg), observaciones}`.
  - `anamnesis_vocal_v1` → array de fichas `{id, nombre, edad, fecha,
    ...}`.
  - **Hallazgo importante, no asumido sino verificado leyendo el código:
    `praat-web` NO guarda ningún historial por paciente en localStorage**
    (solo lee `cv-pastel-theme`, es una herramienta de análisis en vivo
    sin persistencia) — por lo tanto NO pudo incluirse en el cruce.
    Tampoco se incluyó `rango-tonal-afirmativo` porque su storage
    (`rango_tonal_afirmativo_v1`, agregado en la sesión anterior) no
    tiene ningún campo de nombre de paciente — las sesiones de glide se
    guardan sin identificar a quién pertenecen.
  - **No se implementó un esquema de ID de paciente nuevo** (habría
    requerido modificar 3 herramientas existentes para agregar un campo
    de ID además del nombre, lo cual es un cambio más invasivo). En vez
    de eso, se resolvió el cruce con lo que ya existe: normalizar el
    nombre de paciente (trim + lowercase, sin tocar tildes) como clave de
    fusión entre las 3 fuentes. Esto es más simple y no rompe nada de lo
    existente, pero **depende de que la persona usuaria escriba el mismo
    nombre en las 3 herramientas** — el disclaimer de la propia
    herramienta lo explica así, sin prometer más de lo que hace.
- **Qué hace la herramienta:**
  1. Lee las 3 claves de localStorage directamente (mismo origen, sin
     necesidad de que el usuario suba nada).
  2. Si no hay ningún registro en ninguna de las 3, muestra una tarjeta
     "Sin datos guardados todavía" con instrucciones — no un dashboard
     vacío confuso.
  3. Si hay datos, arma una lista de pacientes únicos (fusionados por
     nombre normalizado) en un `<select>`.
  4. Al elegir un paciente: tabla de línea de tiempo combinada (fecha +
     herramienta de origen con pill de color + tipo + resumen en texto),
     ordenada cronológicamente, con exportación a CSV.
  5. Gráfico simple dibujado a mano en `<canvas>` (sin librerías, sin
     Chart.js ni nada por CDN — decisión deliberada para no depender de
     una CDN externa en una herramienta que ya de por sí tiene un
     disclaimer de "solo cruza lo que ya existe") con 2 series: IDV-Cl
     (puntaje total, extraído con regex del texto "N/120" del resumen
     libre) y Esfuerzo Borg (0-10). GRBAS y TMF/s-z no se graficaron
     numéricamente (su resumen es texto compuesto de varios valores, no
     un único número) — sólo aparecen en la tabla de texto. Si en el
     futuro se quiere graficar GRBAS/TMF también, habría que cambiar
     `evaluacion-vocal` para que guarde valores numéricos individuales en
     el registro en vez de un string de resumen ya formateado — no se
     tocó `evaluacion-vocal` en esta sesión para no romper su
     exportación a PDF existente, que sí depende de `resumen` como texto.
  6. Los ejes del gráfico normalizan cada serie a su propio rango (IDV-Cl
     sobre max(120, máximo real encontrado); Borg sobre 10 fijo) para que
     ambas líneas sean visibles en el mismo canvas pese a tener escalas
     muy distintas.
- **Probado con Playwright + Chromium, con datos sintéticos inyectados
  directamente en localStorage** (2 registros IDV-Cl + 2 Borg + 1
  anamnesis, mismo paciente escrito con mayúsculas distintas en cada
  fuente — "maria perez" / "Maria Perez"):
  - Sin datos: se confirma que aparece la tarjeta "sin datos" y no el
    dashboard.
  - Con datos: se confirma que las 3 variantes de mayúsculas se
    fusionaron en **1 solo paciente** en el selector (la normalización
    funciona), que la tabla de línea de tiempo muestra las **5 filas
    combinadas** de las 3 fuentes, y que la tarjeta nueva del portal
    navega correctamente.
  - Accesibilidad: 0 inputs sin nombre accesible en toda la página
    (el único control es el `<select>`, que tiene `<label for=...>`
    correcto).
  - Sintaxis del script inline validada con `node --check`.
  - Paridad i18n verificada: 26/26/26 claves propias de la herramienta, y
    las 5 claves nuevas de la tarjeta del portal también sin diffs entre
    ES/PT/EN.
- **No probado / limitación conocida, no oculta:** esto no fue probado
  con datos reales de producción del usuario (solo con datos sintéticos
  inventados para la prueba) — cuando el usuario lo use por primera vez
  con su propio historial real, es razonable que la fusión de pacientes
  falle si escribió nombres muy distintos entre herramientas (con o sin
  apellido, con typos, etc.) — el selector mostrará esos casos como
  pacientes separados, lo cual es el comportamiento esperado dado el
  diseño (no hay manera de adivinar que "Maria P." y "María Pérez" son la
  misma persona sin un ID compartido real). Esto se explica en el
  disclaimer de la propia herramienta.

---

## 🆕 SESIÓN ANTERIOR — Ítem 4: Rango tonal afirmativo

**Estado: ítem 4 completo. Queda solo el ítem 10.** Se construyó la
herramienta standalone que ya estaba decidida (no se volvió a preguntar
nada de diseño, tal como pedía el contexto de la sesión anterior).

**Qué se hizo:** carpeta nueva `/rango-tonal-afirmativo/` con
`index.html` + `i18n-dict.js` (54 claves, paridad ES/PT/EN verificada al
100%), siguiendo al pie de la letra las convenciones documentadas más
abajo (tema pastel de 5 bloques copiado tal cual, jsPDF no se usó porque
esta herramienta no exporta a PDF, `../assets/i18n-engine.js` +
`theme-switcher.js` + `a11y-reader.js` con `defer`, tarjeta agregada al
portal `index.html` con las 4 claves nuevas por idioma en el
`i18n-dict.js` raíz).

- **4 pestañas** (`.tab[data-tab=...]`, mismo patrón que el mapa de
  vocales de `praat-web`, pero implementado independiente — no se
  reutilizó código de `praat-web`, es una carpeta 100% autónoma como
  exigía la decisión ya tomada):
  1. **Medir tono habitual** — botón iniciar/detener, engancha el
     micrófono, corre YIN sobre cada frame y promedia mientras dura la
     medición; botón "Guardar como tono habitual" sólo se habilita si
     hubo al menos 3 muestras válidas.
  2. **Rango objetivo** — 3 presets de referencia (feminización
     ~180-220Hz, masculinización ~100-140Hz, andrógina ~150-180Hz) +
     inputs numéricos manuales min/max, con el mismo disclaimer de "valor
     orientativo, no punto de corte" ya usado en IDV-Cl y en las
     referencias vocálicas del mapa F1-F2.
  3. **Ejercicio de glide** — barra horizontal tipo velocímetro
     (rango fijo 60-400Hz) con la banda objetivo pintada como zona
     traslúcida y un cursor que se mueve en vivo según el F0 detectado;
     pastilla de estado "dentro/fuera de la banda"; acumula tiempo
     dentro de la banda con `performance.now()` para calcular % de
     éxito; al detener, botón "Guardar sesión" queda habilitado si duró
     más de 1s.
  4. **Progreso** — tabla con fecha, tono habitual, banda objetivo, %
     dentro de banda y duración; exportación CSV; botón borrar historial
     con `confirm()`.
- **Detección de F0:** se copió (no se importó) una versión compacta del
  mismo algoritmo YIN de `vocalizador/js/pitch.js` directamente dentro
  del `<script>` inline de la herramienta, con el mismo rango de
  validación (60-1500Hz) y el mismo gating por RMS (>0.01) para no
  perseguir ruido de fondo — se decidió copiar en vez de importar como
  módulo ES para mantener la herramienta 100% standalone y sin
  dependencias de build/bundler, consistente con el resto de la suite
  (todas las herramientas son HTML+JS planos, sin paso de compilación).
- **Storage:** clave nueva `rango_tonal_afirmativo_v1` en `localStorage`
  (aislada, no comparte namespace con ninguna otra herramienta) — con
  `{ habitual, target:{min,max}, sessions:[] }`. **Importante para el
  ítem 10 (dashboard longitudinal):** esta es una 5ª clave de
  localStorage a cruzar si en el futuro se decide incluir el progreso de
  entrenamiento de tono en el dashboard longitudinal (no fue pedido
  explícitamente para el ítem 10 original, que hablaba de VHI/IDV-Cl +
  jitter/shimmer + TMF/s-z + Borg — no se agregó por iniciativa propia,
  sólo se deja anotado por si el usuario lo quiere incluir).
- **Accesibilidad:** el único input problemático detectado por la
  auditoría automática (`<select id="presetSelect">` sin label
  asociado) se corrigió con `aria-label` + `data-i18n-aria="targetTitle"`
  en vez de agregar un `<label>` visual duplicado (para no repetir texto
  ya visible arriba). Verificado con Playwright: 0 inputs sin nombre
  accesible en la página completa.
- **Probado con Playwright + Chromium:**
  - Las 4 pestañas cambian de vista sin errores de consola (aparte del
    403 esperado de `fonts.googleapis.com`, bloqueado en el sandbox, no
    en producción).
  - Sintaxis del script inline validada con `node --check` sobre el
    bloque extraído.
  - Paridad i18n ES/PT/EN verificada (54/54/54 claves, sin diffs) tanto
    en el `i18n-dict.js` propio de la herramienta como en las 4 claves
    nuevas agregadas al `i18n-dict.js` raíz de la tarjeta del portal.
  - La tarjeta nueva en el portal (`index.html`) se probó de punta a
    punta: aparece, el título se traduce, el clic navega correctamente a
    `rango-tonal-afirmativo/index.html` y el título de la pestaña carga
    bien.
- **No probado / pendiente de verificar en el próximo turno:** el
  ejercicio de glide con voz real de un micrófono (mismo motivo que la
  sesión anterior — Playwright headless no tiene micrófono real en este
  sandbox); tampoco se verificó visualmente con los 5 temas pastel ni en
  mobile/responsive (el layout usa `.wrap{max-width:920px}` simple, sin
  grid de 3 columnas como otras herramientas, así que debería
  comportarse razonablemente en mobile, pero no se probó con viewport
  angosto). Tampoco se agregó todavía sección README/portal en inglés o
  portugués más allá de las claves i18n (el README general ya estaba
  desactualizado — dice "6 herramientas" cuando ya hay 12 — esto es
  preexistente de sesiones anteriores, no se tocó por estar fuera de
  alcance de este pedido puntual).

---

## 🆕 SESIÓN ANTERIOR — Ítem 6: Mapa de vocales F1-F2

**Estado: ítem 6 completo. Quedan 4 y 10.** El usuario eligió explícitamente
seguir con el ítem 6 primero (dijo que era el más rápido) y, para cuando se
haga el ítem 4, que sea **herramienta standalone** (no una pestaña dentro de
`vocalizador` — esto ya fue decidido, no hace falta volver a preguntarlo).

**Qué se hizo:** se agregó una tercera pestaña "Mapa de vocales" a
`/praat-web/index.html` (antes solo tenía "Archivo" y "En vivo"), reutilizando
100% el motor de formantes LPC existente (`estimateFormants`), tal como
sugería el roadmap — no se reinventó el análisis acústico, solo se agregó
una visualización nueva.

- **`selectTab(mode)`** se refactorizó de booleano a string ('file'|'live'|
  'vowels') para soportar 3 pestañas; los 2 call-sites viejos ya usaban el
  listener de click, así que no se rompió nada (verificado con Playwright:
  las 3 pestañas cambian de vista correctamente).
- **Fuente "archivo":** botón "Mapear vocales del archivo" que toma
  `S.formants` (ya calculado para todo el clip) y grafica todos los frames
  con F1 y F2 válidos como nube de puntos fija.
- **Fuente "en vivo":** checkbox/botón "Trazo en vivo" (`S.vowel.liveOn`)
  que, cuando está activo, engancha `pushVowelPoint()` dentro de
  `computeLiveMeasures()` (la misma función que ya alimenta el HUD F0/F1-F4
  en la pestaña "En vivo") — no se creó un loop nuevo, se sumó un side-effect
  a uno que ya corría cada 3 frames. Mantiene un buffer de 400 puntos máx
  (`shift()` cuando se llena) con estela por transparencia (más viejo = más
  transparente).
- **Referencias de vocales del español:** 5 zonas circulares translúcidas
  (/a e i o u/) con valores promedio aproximados de la literatura de
  fonética acústica del español (adulto genérico, sin distinción de sexo/
  edad — mismo patrón de disclaimer ya usado para el IDV-Cl: valores
  orientativos, no un instrumento validado ni punto de corte). Toggle
  checkbox para mostrar/ocultar.
- **Ejes:** F2 horizontal invertido (agudo a la izquierda, convención
  fonética), F1 vertical invertido (agudo arriba). Rango fijo F1
  200-900Hz, F2 600-2500Hz — no autoescalable todavía (posible mejora
  futura si algún caso lo satura, pero cubre el rango vocálico adulto
  típico).
- **Exportación CSV** de los puntos (archivo + vivo combinados, columna
  `origen`).
- **i18n:** 15 claves nuevas (`tabVocales`, `btnMapearArchivo`, etc.) en
  `praat-web/i18n-dict.js`, ES/PT/EN. Paridad verificada: las 15 claves
  nuevas están presentes exactamente 3 veces cada una (una por idioma). El
  script de paridad automático marca varios falsos positivos preexistentes
  por acentos (`día`, `análisis`, `mínimo`, etc. — mismo problema de regex
  ya documentado en la sesión anterior, no relacionado con este cambio, no
  se tocó nada de eso).
- **Accesibilidad:** el checkbox nuevo (`chkVowelRef`) está anidado dentro
  de un `<label>` (sin `for` explícito, pero el input está dentro del
  label, que la auditoría automática ya reconoce como válido vía
  `el.closest('label')`). Verificado con Playwright: el único input sin
  nombre accesible en toda la página es `#fileInput` (preexistente, es un
  `<input type=file>` oculto por CSS con click delegado desde un botón
  visible — no es un problema real, no se tocó).
- **Probado con Playwright + Chromium (sí se pudo esta vez, a diferencia de
  la sesión anterior):**
  - Las 3 pestañas cambian de vista sin errores de consola.
  - Con un archivo de prueba real de `vocalizador/assets/` (turnó ser un
    tono/click sin estructura vocálica clara, F2 casi nunca detectado) el
    botón "Mapear" correctamente reportó 0 puntos — el filtro de
    validación (`f1<100||f1>1200||f2<400||f2>3200` se descarta) funciona
    bien, no es un bug, simplemente esa wav no tiene voz real.
  - Se sintetizó un WAV con estructura formántica cruda en Python (suma de
    armónicos con dos resonancias en ~700Hz/~1200Hz, imitando F1/F2 de /a/)
    para verificar el pipeline end-to-end: el mapeo generó 129 puntos y la
    nube apareció visualmente agrupada cerca de la zona de referencia /a/,
    como se esperaba (ver captura tomada durante la sesión).
- **No probado / pendiente de verificar en el próximo turno:** el trazo en
  vivo con un micrófono real (Playwright headless no tiene micrófono real
  disponible en este sandbox) — la lógica se razonó sobre el código
  (mismo patrón que ya usa el HUD en vivo existente, que sí está probado en
  producción por el usuario), pero no se hizo una prueba end-to-end con
  audio real de micrófono en esta sesión. Tampoco se probó con un dark/
  light pastel theme distinto del default (rosa) — el canvas usa
  `getCss('--accent')`/`getCss('--line')` como el resto de la página, así
  que debería heredar el tema automáticamente, pero no se verificó
  visualmente con los 5 temas.

---

## 🆕 SESIÓN ANTERIOR — resumen de lo hecho

**1. Bug corregido — "Sesión de hoy" en `bitacora-sesiones/index.html`**
Causa raíz: `.session-queue` es `display:flex;flex-direction:column` con
`overflow-y:auto` y `max-height`. Las tarjetas `.q-card` no tenían
`flex-shrink:0`, así que al superar ~6 ejercicios el navegador comprimía
las tarjetas (en vez de dejarlas desbordar y hacer scroll), y como cada
tarjeta tenía `overflow:hidden`, el nombre y el tiempo quedaban recortados
y visualmente superpuestos (confirmado con las capturas del usuario).
Arreglo aplicado: `.q-card{flex-shrink:0;min-height:68px;overflow:visible}`
y `.session-queue{max-height:620px}` con mejor padding para el scrollbar.
**Pendiente de verificar:** probar en navegador real con 8-10 ejercicios
en la cola para confirmar visualmente que ya no hay superposición
(no se pudo abrir un navegador real en esta sesión, solo se razonó sobre
el CSS/flexbox — revisar con Playwright apenas se pueda).

**2. Anamnesis Vocal — protocolo completo del `FORMATO_PROTOCOLO_ADAPTADO.docx`**
Se extrajeron las 21 tablas del docx (vía `python-docx`) y se agregó todo
el contenido faltante a `/anamnesis-vocal/index.html`:
- Identificación extendida: RUT, domicilio, teléfono, email, actividad
  secundaria, previsión social.
- Motivo de consulta: instalación de la queja vocal (abrupta/progresiva) +
  evento asociado.
- Nueva sección colapsable (`<details class="card" id="protocoloDetails">`)
  "📋 Protocolo de evaluación de voz — ficha completa", con 8 sub-bloques
  que siguen fielmente la estructura I-V del formato original:
  1. Antecedentes mórbidos (Dx ORL, métodos de exploración, patologías y
     tratamientos vocales previos, 9 pares Sí/No con campo "¿cuál?":
     psiquiátricos, desórdenes hormonales, cirugías, rinitis, RGE/RFL,
     hipoacusia, patologías dentales, hipotiroidismo/hipertiroidismo,
     hospitalización c/intubación — medicamentos, otros dx/tto, obs.)
  2. Antecedentes sociales y entrenamiento vocal.
  3. Hábitos de comportamiento vocal (6 Sí/No) + consumo de irritantes
     (8 Sí/No) + factores de riesgo (agua, sueño, dieta).
  4. Autovaloración vocal: 12 síntomas Sí/No, detalle de acidez, hándicap
     vocal (instrumento/puntajes/análisis).
  5. Parámetros no locutivos: postura estática, altura laríngea,
     postura dinámica (nota + textarea), tonicidad general/laríngea.
  6. Parámetros locutivos: tipo/modo respiratorio reposo-fonación, CFR,
     TMS, TMF, índice S/Z, apoyo respiratorio, resonancia.
  7. Evaluación perceptual: sonoridad, registro, ataque vocal, extensión/
     altura tonal, quiebres, calidad vocal, 7 chips de rasgos de voz
     (ronca/áspera/susurrada/soplada/infantilizada/virilizada/diplofónica),
     escala RASATI (6 campos numéricos 0-3), parámetros del habla
     (fluidez, inteligibilidad, velocidad, articulación).
  8. Evaluaciones objetivas: F0, jitter, shimmer, HNR, tipo de voz I/II/III,
     nasofibrolaringoscopía, más nota sobre el texto de lectura estándar
     "El abuelo" mencionado en el docx (no se agregó como textarea
     editable porque es un texto de lectura fijo, solo se referencia).
- Todo el protocolo se guarda dentro de `registro.protocolo` en
  `localStorage` (clave `anamnesis_vocal_v1`, mismo storage de siempre,
  estructura extendida — las fichas guardadas ANTES de este cambio no
  tienen `.protocolo`, el código lo maneja con `if(r.protocolo)` así que
  no rompe el historial viejo).
- Exportación a PDF extendida: cada ficha ahora agrega una página nueva
  con las 8 secciones del protocolo resumidas en texto (no se intentó
  replicar las tablas visualmente en el PDF, por tiempo — es un resumen
  legible, no una reproducción exacta del formulario en papel).
- **i18n:** se agregaron 161 claves nuevas (`data-i18n`) a
  `anamnesis-vocal/i18n-dict.js`, traducidas a ES/PT/EN (traducción
  directa, no revisada por una fonoaudióloga lusófona/anglófona — a
  diferencia del IDV-Cl, este es un formulario clínico genérico, no un
  instrumento con validación cultural que dependa de una redacción exacta,
  así que la traducción de la interfaz aquí sí es apropiada, a diferencia
  del cuidado especial que requieren los ítems del VHI/IDV-Cl).
  Paridad ES/PT/EN verificada con el script de siempre: **0 diferencias**
  reales (una comprobación con una regex distinta arrojó un falso positivo
  en `labelMotivo`/`toastFaltaNombre`, pero se confirmó con `grep` que las
  tres claves existen en los tres bloques — no hay nada que corregir ahí).
- **Accesibilidad:** se corrigieron 18 `<select>`/`<label>` sin atributo
  `for` (mismo tipo de bug recurrente ya documentado abajo) más 6 casos
  puntuales (`fInstalacionQueja`, `fEventoAsociado`, `fObservaciones`
  —este último preexistente de antes de esta sesión—, `pPosturaDinamicaObs`,
  y los 6 campos de la escala RASATI). Verificado con un script Python
  (no Playwright real, no había navegador disponible en esta sesión):
  **0 inputs/selects/textareas sin nombre accesible** en todo el archivo.
- **Pendiente real de verificar con navegador/Playwright en el próximo
  turno** (no se pudo esta vez): que el `<details>` colapsable abra/cierre
  bien con el tema oscuro/claro de los 5 pastel themes, que el flujo
  completo de guardar→exportar PDF con el protocolo lleno no tire errores
  de consola, y correr el tour de bienvenida del portal para confirmar que
  nada se rompió (no se tocó el portal `index.html` en esta sesión, solo
  `anamnesis-vocal/` y `bitacora-sesiones/`, así que es improbable que se
  haya roto, pero no se verificó).

---

Este documento existe porque el usuario pidió una lista larga de herramientas
nuevas (numeradas 1,2,3,4,6,7,8,9,10 de una propuesta previa) y el trabajo
excede lo que se puede completar en una sola sesión. Este archivo registra
**exactamente qué se hizo, qué se investigó, qué decisiones se tomaron y por
qué, y qué falta** para que puedas retomarlo sin repetir la investigación ni
romper lo ya construido.

**Estado actual: 4 de 9 ítems completos (1, 2, 3 combinados en una
herramienta + 7 + 8 + 9 como herramientas separadas). Portal con 7
tarjetas en la sección clínica.**

---

## ✅ YA CONSTRUIDO Y ENTREGADO

### "Evaluación Clínica de Voz" — `/evaluacion-vocal/` (ítems 1, 2 y 3)

Nueva herramienta en `/evaluacion-vocal/index.html` + `i18n-dict.js`, ya
integrada en el portal (`index.html`, sección `#clinico`, tarjeta con acento
`--teal`, ícono 🩺). Contiene:

### 1. IDV-Cl / IDV-Cl-10 (adaptación chilena oficial del VHI)
- **Texto real de los 30 ítems** (y el subconjunto de 10 para la versión
  breve) obtenido vía `web_fetch` del PDF de acceso abierto:
  Correa Forno, S. A., Rangel Azevedo, R., & Côrtes Gama, A. C. (2023).
  *Adaptación lingüística y cultural chilena del Voice Handicap Index (VHI)
  y del Voice Handicap Index 10 (VHI-10)*. Revista Chilena de Fonoaudiología,
  22(1), 1–17. https://doi.org/10.5354/0719-4692.2023.66978
  (Universidad de Valparaíso, Chile — journal de acceso abierto, ítems
  publicados explícitamente como Anexo 1 y Anexo 2 para uso clínico).
- **IMPORTANTE — decisión deliberada:** este instrumento es solo una
  **adaptación lingüística y cultural**, NO una validación psicométrica con
  punto de corte para Chile. El propio artículo original lo dice explícito:
  "Como en este trabajo no fue realizado un análisis factorial no es
  posible considerar puntos de corte". Por eso la herramienta:
  - NO muestra ningún punto de corte ni clasifica "normal/anormal".
  - Muestra un `disclaimer` visible explicando esto en español, portugués e
    inglés (el disclaimer sí se traduce; **los ítems del cuestionario en sí
    NO se traducen** — están y deben quedar siempre en español chileno,
    porque traducirlos invalidaría la adaptación cultural que le da su
    valor. Este es un patrón importante a mantener: contenido clínico
    validado en un idioma específico no se traduce, solo la interfaz
    alrededor de él).
  - El puntaje se calcula (total + 3 subescalas: Funcional/Física/Emocional)
    para uso cualitativo intrapersona a lo largo de la terapia, no para
    comparar contra la población.

### 2. GRBAS
- Escala perceptual internacional (Hirano, 1981), 5 parámetros (G/R/B/A/S),
  0-3 cada uno. Es un instrumento de juicio clínico del profesional (no un
  autoinforme traducido), por eso SÍ se tradujo la interfaz completa a los
  3 idiomas sin problema — no hay "versión chilena" que respetar aquí, es
  universal.

### 3. TMF (tiempo máximo de fonación) + relación s/z
- Cronómetro con 3 intentos por tarea (/a/, /s/, /z/), se guarda el mejor de
  cada una, calcula automáticamente la relación s/z.
- Valores de referencia (no son "cuestionarios" que requieran validación
  chilena, son valores fisiológicos de la literatura): Eckel & Boone
  (1981); Boone et al. (2014), *The Voice and Voice Therapy*. Corte
  orientativo s/z > 1.4 sugiere (no diagnostica) incompetencia glótica.

### Extras ya incluidos
- Historial de registros (localStorage, clave `evaluacion_vocal_v1`) con
  exportación a PDF (jsPDF, con `defer` en el script — ver nota de bug del
  turno anterior sobre por qué `defer` es importante).
- Botón toast propio (esta herramienta no tenía `shared.js` con toast, se
  implementó localmente, igual que en `respiracion-cuadrada`).
- Integrado con `theme-switcher.js`, `i18n-engine.js`, `a11y-reader.js`
  (los 3 scripts compartidos — igual patrón que las otras 6 herramientas).
- Verificado con Playwright: cálculo de puntajes correcto, GRBAS, TMF,
  cambio de idioma ES/PT/EN, tour de bienvenida del portal sigue
  funcionando con la card nueva, cero errores de consola.

### ⚠️ Instrumentos que se investigaron pero NO se incluyeron (y por qué)
- **RSI (Reflux Symptom Index):** buscado extensamente. La única
  validación en español encontrada (Sp-RSI, J Voice 2019) es de **España**,
  no de Chile. No existe (a la fecha de la búsqueda) una validación
  específicamente chilena del RSI. Por el requisito estricto del usuario
  ("solo versiones chilenas"), se excluyó. Si en el futuro aparece una
  validación chilena publicada, se puede agregar siguiendo el mismo patrón
  que IDV-Cl (fetch del PDF de acceso abierto, reproducir ítems con cita).
- **ESV-CL (adaptación chilena del VoiSS):** este SÍ es el instrumento
  chileno con la validación más fuerte encontrada — cutoff real de 35.5
  (sensibilidad 90%, especificidad 75%), publicado en:
  Contreras, F., Moreti, F., Vivero, M., Malebran, C., & Behlau, M. (2021).
  *Cross-Cultural Adaptation, Validation, and Cutoff Values of the Chilean
  Version of the Voice Symptom Scale: VoiSS*. Journal of Voice, 35(3),
  498.e31-8. **PROBLEMA:** este artículo está publicado en Journal of Voice
  (Elsevier), que es de pago/derechos reservados — no de acceso abierto. No
  se pudo obtener el texto real de los 30 ítems sin acceso legal a la
  fuente. **NO fabricar ítems inventados** haciéndolos pasar por el ESV-CL
  real — eso sería tanto clínicamente deshonesto (los ítems exactos
  importan para la validez del puntaje) como un riesgo de copyright.
  **Próximo paso si se retoma:** conseguir acceso legal al artículo (por
  ejemplo si el usuario tiene acceso institucional/Matilde puede
  proporcionar el PDF), o buscar si existe una versión de acceso abierto
  publicada en otro sitio (p.ej. CoDAS 2016 "Cross-cultural adaptation of
  the Chilean version of the Voice Symptom Scale – VoiSS" también aparece
  citado — revisar si CoDAS es de acceso abierto, es una revista brasileña
  que suele serlo, valdría la pena intentar `web_fetch` ahí primero).
- **CAPE-V:** la única adaptación al español encontrada (Fresno et al.,
  Acta Otorrinolaringológica Española, 2015) fue validada en **España**,
  no en Chile. Se decidió no incluirlo con las frases estímulo "oficiales"
  en español porque no se tenía el texto exacto verificado de esas 6 frases
  fonéticamente diseñadas, y presentarlo como "la versión validada" sin
  serlo (ni ser chilena) sería incorrecto. GRBAS se dejó como la escala
  perceptual principal de este primer lanzamiento.
- **VAPP (Voice Activity and Participation Profile):** existe adaptación
  chilena (Contreras-Ruston et al., 2021, CoDAS) pero no se confirmó si es
  validación completa con cutoff o solo adaptación cultural (como IDV-Cl).
  No se investigó a fondo por límite de tiempo — pendiente para el próximo
  round si se quiere agregar.

---

### "Higiene Vocal" — `/higiene-vocal/` (ítem 7)
Checklist diario de hábitos, sin bloqueo de investigación clínica (es un
hábito-tracker, no un instrumento psicométrico que requiera validación).

- 10 hábitos: hidratación (con slider de vasos de agua 0-12), síntomas de
  reflujo, cafeína, alcohol, descanso vocal, gritar/forzar, carraspeo,
  sueño, humedad ambiental, ejercicios vocales.
- Navegación por día (← / Hoy / →), cada día guarda su propio estado en
  `localStorage` (clave `higiene_vocal_v1`, estructura
  `{ 'YYYY-MM-DD': { habits:{}, sliders:{}, notas:'' } }`).
- Racha de días consecutivos con al menos un hábito marcado + contador de
  días totales registrados.
- Calendario visual de los últimos 28 días (más lleno = más hábitos ese
  día).
- Integrado en el portal con ícono 💧 y acento `--teal`.
- Verificado con Playwright: 10 hábitos renderizados, racha se actualiza al
  marcar, calendario refleja el día actual, 0 inputs sin nombre accesible,
  cero errores de consola.

### "Anamnesis Vocal" — `/anamnesis-vocal/` (ítem 8)
Ficha de ingreso estructurada, tampoco tiene bloqueo de investigación (es
un formulario clínico, no un test estandarizado que requiera validación
psicométrica chilena).

- Secciones: Identificación, Motivo de consulta (con severidad percibida
  0-10), Antecedentes relevantes (9 chips clínicos: reflujo, alergias,
  tiroides, cirugía cervical, intubación reciente, neurológico, menopausia,
  terapia hormonal —incluye afirmación de género—, asma/corticoides),
  Hábitos y factores de riesgo (10 chips: tabaco, alcohol, cafeína,
  hidratación baja, uso vocal profesional, ambiente ruidoso, gritar,
  ambiente seco, canto sin entrenamiento, estrés), Observaciones clínicas.
- Guarda fichas en `localStorage` (clave `anamnesis_vocal_v1`), historial
  con tabla + exportación a PDF (multi-página, una ficha por página, con
  `defer` en jsPDF siguiendo la convención ya establecida).
- Integrado en el portal con ícono 📝 y acento `--gold`.
- Verificado con Playwright: guardado bloqueado si falta el nombre (con
  toast de error), chips se marcan y persisten, historial se actualiza,
  cambio de idioma ES/PT/EN correcto, 0 inputs sin nombre accesible (se
  encontró y corrigió 1: el slider de severidad no tenía `aria-label` —
  mismo tipo de bug de accesibilidad que se viene repitiendo en la
  plataforma, revisar SIEMPRE con la auditoría Playwright antes de dar por
  terminada una herramienta nueva).

**Portal actualizado:** sección `#clinico` ahora tiene 6 tarjetas
(`countTools6` = "06 herramientas"), orden: Evaluación clínica de voz →
Anamnesis vocal → Bitácora de sesiones → Sesión diaria → Esfuerzo vocal →
Higiene vocal. Tour de bienvenida de 8 pasos verificado que sigue
funcionando sin romperse tras el cambio estructural de esa sección.

---

### "Biblioteca Educativa" — `/biblioteca-educativa/` (ítem 9)
Contenido educativo puro, sin bloqueo de investigación clínica (no es un
instrumento psicométrico) pero sí requirió cuidado editorial: tono cálido,
sin alarmar, sin lenguaje diagnóstico ("puedes tener X" nunca se dice,
siempre se habla en general).

- 9 temas en acordeón expandible: ¿Cómo se produce la voz? (anatomía
  básica), Nódulos vocales, Pólipos vocales, Reflujo laringofaríngeo,
  Disfonía por tensión muscular, Edema de Reinke, Parálisis/paresia de
  cuerda vocal, Presbifonía (voz y envejecimiento), ¿Cuándo consultar?
- Cada tema sigue la misma estructura: "¿Qué es?" → "Síntomas frecuentes"
  → "¿Qué suele ayudar?" — deliberadamente NO dice "tratamiento" sino "qué
  suele ayudar", para no sonar prescriptivo.
- Buscador en vivo que filtra por texto completo (no solo título) — por
  ejemplo buscar "reflujo" muestra tanto el tema de Reflujo como el de
  Edema de Reinke, porque lo menciona en su texto. Es el comportamiento
  esperado, no un bug.
- Disclaimer visible arriba de todo: contenido educativo y general, no
  reemplaza evaluación profesional ni es diagnóstico.
- Sin `localStorage`, sin PDF, sin `toast()` — es la herramienta más simple
  de la plataforma a propósito (solo contenido + acordeón + buscador).
- Integrada en el portal con ícono 📚 y acento `--coral` (reutilizado).
- Verificado con Playwright: 9 temas renderizan, acordeón abre/cierra,
  buscador filtra correctamente, cambio de idioma ES/PT/EN, 0 inputs sin
  nombre accesible, tour de bienvenida sigue funcionando, cero errores de
  consola.

**Portal actualizado (de nuevo):** sección `#clinico` ahora tiene **7
tarjetas** (`countTools7` = "07 herramientas"). Nota técnica: al agregar
esta card se cometió un error de edición (el primer intento de insertar
las claves ES/PT en `i18n-dict.js` con `str_replace` por Python falló
silenciosamente porque el ancla de texto no coincidía exactamente —
había una línea `sectionClinico:` en medio que no se tuvo en cuenta). Se
detectó inmediatamente por el chequeo de paridad ES/PT/EN (que SIEMPRE hay
que correr después de tocar un dict) y se corrigió. Moraleja: correr
siempre el chequeo de paridad después de cualquier edición a un
`i18n-dict.js`, incluso si el `str_replace`/script "no tiró error" — un
`replace()` que no encuentra el string simplemente no hace nada, no
avisa.

---

## 🚧 PENDIENTE — Ítems que el usuario pidió y AÚN NO se construyeron

**Ninguno. Los 10 ítems del roadmap original (1-10) están construidos.**
El ítem 10 (dashboard longitudinal) se completó en la sesión más
reciente de todas — ver resumen arriba. A partir de aquí, cualquier
trabajo nuevo requiere que el usuario pida algo explícitamente; no hay
compromisos previos pendientes de construir.

### 10. ~~Dashboard de evolución longitudinal~~ — COMPLETADO
Ver resumen al inicio de este documento. Carpeta `/dashboard-longitudinal/`,
ya integrada en el portal, ya probada con Playwright con datos
sintéticos. **Limitación conocida y explicada en el disclaimer de la
propia herramienta (no un bug):** el cruce depende de que el nombre del
paciente esté escrito igual (normalizado por trim+lowercase) en
Evaluación vocal, Esfuerzo vocal y Anamnesis vocal; Praat Web y Rango
tonal afirmativo no tienen historial por paciente y no participan del
cruce.

---

## 🗂️ Convenciones a mantener (para que lo nuevo encaje con lo existente)

- Cada herramienta nueva es una carpeta con `index.html` + `i18n-dict.js`
  propio, cargando `../assets/i18n-engine.js`, `../assets/theme-switcher.js`
  (defer), `../assets/a11y-reader.js` (defer), y opcionalmente
  `../assets/shared.js` (para `escapeHtml`; `toast()` hay que definirlo
  local si la herramienta no tiene otro ya).
- Todo el CSS de tema usa las mismas variables `--bg`, `--card`, `--accent`,
  `--muted`, `--border` con los 5 bloques `:root[data-pastel-theme="..."]`
  (rosa/lavanda/menta/durazno/cielo) — copiar el bloque tal cual de una
  herramienta existente, no reinventarlo.
  ADVERTENCIA DE COLOR: cada herramienta usa un `--accent` "hardcodeado"
  ligeramente distinto en el `:root{}` base fuera de los bloques de tema
  (ej. acá se usó `#e0559e`), pero eso se sobreescribe cuando hay un tema
  pastel seleccionado. Está bien así, sigue el patrón existente.
- jsPDF SIEMPRE con `defer` en el `<script>` (bug real corregido en un
  turno anterior — sin `defer` puede bloquear la carga de toda la página
  si la CDN es lenta o está bloqueada, rompiendo también el botón Guardar).
- Todo formulario/slider necesita `<label for="id">` apuntando al control,
  NUNCA un `<label>` que se cierra antes del `<input>` sin conectarlo (bug
  real encontrado y corregido dos veces ya — revisar con la Playwright
  audit descrita abajo antes de dar por terminada cualquier herramienta
  nueva).
- Paridad ES/PT/EN se verifica así (ejecutar tras cualquier cambio a un
  `i18n-dict.js`):
  ```bash
  node --check ruta/i18n-dict.js
  python3 -c "
  import re
  s = open('ruta/i18n-dict.js', encoding='utf-8').read()
  parts = s.split('  pt: {'); es = parts[0]
  rest = parts[1].split('  en: {'); pt = rest[0]; en = rest[1]
  def keys(b): return set(re.findall(r'([a-zA-Z0-9]+):\s*[\'\`]', b))
  kes,kpt,ken = keys(es),keys(pt),keys(en)
  print('ES-PT diff:', kes ^ kpt); print('ES-EN diff:', kes ^ ken)
  "
  ```
- Auditoría de accesibilidad que conviene correr sobre cualquier
  herramienta nueva antes de darla por terminada (detecta inputs sin
  nombre accesible — Playwright, patrón usado en turnos anteriores):
  ```python
  bad = pg.evaluate("""
    Array.from(document.querySelectorAll('input,select,textarea')).filter(el=>{
      if(el.type==='hidden'||el.type==='button'||el.type==='submit') return false;
      const id = el.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
      const ph = el.getAttribute('placeholder');
      return !hasLabel && !aria && !ph && !el.closest('label');
    }).length
  """)
  ```
- Playwright + Chromium ya están instalados en el entorno (`python3 -m
  playwright install chromium` si hiciera falta reinstalar). Servir la
  carpeta local así antes de probar:
  ```bash
  cd /home/claude/proj && setsid nohup python3 -m http.server 8934 > /tmp/http.log 2>&1 < /dev/null &
  ```
  (usar `setsid nohup ... &` exactamente así — un `&` simple se mata entre
  llamadas a la herramienta bash en este entorno).
- `cdnjs.cloudflare.com` (jsPDF) y `fonts.googleapis.com` están BLOQUEADOS
  en el sandbox de pruebas (403/CORS en consola) — es una limitación del
  entorno de desarrollo, no un bug real; en producción (GitHub Pages)
  cargan normalmente. No perder tiempo intentando "arreglar" esos errores
  de consola durante pruebas locales.
- El archivo `contexto-traduccion-i18n_7.md` en la raíz del repo tiene el
  historial completo de todo lo hecho en rondas anteriores (traducciones,
  accesibilidad, bugs de la bitácora, tour actualizado) — leerlo si hace
  falta más contexto histórico de decisiones ya tomadas.

## 📌 Siguiente paso sugerido

**El roadmap original de 10 ítems está cerrado.** No hay ningún ítem
pendiente que el usuario haya pedido y no se haya construido. Para la
próxima instancia:

1. **Preguntar primero qué quiere el usuario a continuación** — no asumir
   que hay que seguir construyendo algo del roadmap viejo, porque ya no
   queda nada de esa lista.
2. Posibles mejoras opcionales que quedaron anotadas pero que NO son
   compromisos adquiridos, solo ideas sueltas mencionadas en sesiones
   anteriores — proponerlas, no asumir que se quieren:
   - Un esquema real de ID de paciente compartido entre todas las
     herramientas (hoy cada una usa nombre libre); esto permitiría que el
     dashboard longitudinal fusione pacientes de forma confiable en vez
     de depender de que el nombre esté escrito igual.
   - Agregar un campo de nombre/ID de paciente a
     `rango-tonal-afirmativo` y a `praat-web` para que puedan sumarse al
     cruce del dashboard longitudinal (hoy no participan, ver nota
     arriba).
   - Graficar GRBAS y TMF/s-z numéricamente en el dashboard longitudinal
     (hoy sólo aparecen como texto en la tabla, no en el gráfico, porque
     `evaluacion-vocal` guarda su resumen como texto ya formateado en vez
     de valores numéricos individuales).
   - Actualizar el `README.md` general, que quedó desactualizado
     (menciona "6 herramientas" cuando ya hay 13 carpetas de
     herramientas en el repo) — no se corrigió en ninguna sesión reciente
     por estar fuera del alcance puntual pedido.
3. Pendiente sin resolver de sesiones anteriores, nunca vuelto a
   preguntar: ¿el usuario quiere que se intente conseguir el ESV-CL vía
   CoDAS (posible acceso abierto) antes de cerrar el tema de
   cuestionarios, o seguir solo con IDV-Cl por ahora?
4. Verificaciones reales pendientes (no se pudieron hacer en sandbox, ver
   detalle en cada sesión arriba): mapa de vocales y ejercicio de glide
   de rango tonal con micrófono real (no sólo con audio sintético o datos
   inyectados), y revisión visual de las 3 herramientas más nuevas
   (mapa de vocales, rango tonal, dashboard longitudinal) con los 5 temas
   pastel y en viewport mobile.

# Vocalizer 2026

Entrenador vocal 100% local: asistente de rango con clasificación de voz, más de 30
ejercicios (mayores, menores, pentatónicas, cromáticas, intervalos, arpegios y técnica
vocal), afinador con modo nota fija/auto-detección, evaluación de grabaciones con
puntaje y curva de pitch, entrenamiento de vibrato, rutinas personalizadas, grabadora
con biblioteca persistente y metrónomo. Sin cuentas, sin nube, sin conexión requerida.

Autora original de Vocalizer: **Matilde Pizarro Toro**. Esta versión (2026) es una
reconstrucción completa del proyecto original, manteniendo su espíritu y su autoría.

## Versión 2 — funciones añadidas a pedido

- **Asistente de bienvenida** (se puede omitir): elige tu tipo de voz o descúbrelo
  cantando; clasifica automáticamente entre bajo, barítono, tenor, contralto, mezzosoprano
  o soprano según el rango grabado.
- **Biblioteca de ejercicios ampliada**: 34 ejercicios en 7 categorías (mayores, menores,
  pentatónicas, cromáticas, intervalos, arpegios, técnica vocal — incluye Mum, Ney, Lip
  Trill y Siren con portamento real), con buscador, filtro por categoría y favoritos (★).
- **Progresiones guiadas** y **rutinas personalizadas** (arma tu propia secuencia de
  ejercicios, guárdala y reprodúcela cuando quieras).
- **Afinador dedicado** con dos modos: "Seleccionar nota" (tono guía fijo) y "Detectar
  automático" (el tono guía sigue tu voz), con métricas de ataque, sostenido e intonación.
- **Evaluación de grabaciones**: graba siguiendo un ejercicio o importa un audio externo;
  se calcula un puntaje de afinación, se dibuja la curva de pitch sobre una línea de
  tiempo con bandas de color, se puede arrastrar para seleccionar y repetir en bucle una
  sección, y cada nota del desglose se puede tocar individualmente o repetir todas sus
  apariciones.
- **Entrenamiento de vibrato**: graba una nota sostenida y obtén velocidad (Hz), extensión
  (cents) y consistencia, con gráfico de la sesión y progreso histórico.
- **Ajustes ampliados**: tolerancia de afinación, compensación de latencia (0–600 ms),
  velocidad de reproducción (0.5×–1.5×), diapasón, notación y opción de omitir el
  asistente de bienvenida.

## Bugs corregidos en esta revisión

- **El botón "Detener" no cortaba el sonido**: las notas de un ejercicio se programaban
  todas por adelantado con tiempos absolutos de Web Audio, así que limpiar los `setTimeout`
  de la interfaz no silenciaba el audio ya en curso. Ahora cada nodo activo queda
  registrado y `stopAll()` lo apaga de inmediato (fade rápido + `osc.stop()`).
- **Condición de carrera del micrófono**: un clic podía disparar dos solicitudes de
  `getUserMedia` casi simultáneas (el listener global de "activar audio" y el botón que
  se acababa de pulsar), duplicando la conexión al analizador. Ahora `ensureMic()` reutiliza
  una única promesa en curso.
- **Aguja del afinador mal centrada** en algunos navegadores por una interacción entre
  `transform-origin` en píxeles y el `viewBox` del SVG; se fijó explícitamente
  `transform-box: view-box`.

## Qué cambió respecto a la versión anterior

**Arquitectura**
- El `app.js` monolítico se dividió en módulos ES (`js/pitch.js`, `js/audio.js`, `js/mic.js`,
  `js/exercises.js`, `js/storage.js`, `js/wav-encoder.js`, `js/app.js`) para que el proyecto
  sea mantenible y fácil de extender.
- Un único `MediaStream` de micrófono se comparte entre el afinador, la grabadora y el
  detector de rango (antes se abrían 2–3 accesos a micrófono distintos).
- La reproducción de ejercicios se planifica sobre el reloj del `AudioContext`, evitando el
  desfase acumulado (*drift*) de encadenar `setTimeout`.

**Funciones nuevas**
- Afinador visual con aguja tipo VU-meter (SVG), coloreado verde cuando la nota está afinada.
- Metrónomo independiente con acento en el primer tiempo.
- Ajustes: notación (solfeo o cifrado americano), diapasón (La4 ajustable), sensibilidad del
  detector de tono, y reducción de animaciones.
- Persistencia real: las grabaciones se guardan en **IndexedDB** (antes no se guardaban al
  recargar la página) y los ajustes en `localStorage`.
- Descarga de grabaciones en `.webm` (nativo) o `.wav` (PCM, compatible con cualquier editor
  de audio), gracias a un codificador WAV incluido.
- Diálogo accesible para "Encontrar mi rango" con barra de progreso, en vez de `alert()`
  bloqueantes.
- Tema claro/oscuro, foco de teclado visible, `aria-live` en los resultados del afinador.
- **PWA instalable**: `manifest.webmanifest` + `sw.js` cachean la app para que funcione sin
  conexión y se pueda añadir a la pantalla de inicio del teléfono o del escritorio.

**Detección de tono**
- Se mantiene una implementación propia y compacta del algoritmo **YIN** (de Cheveigné &
  Kawahara, 2002), con umbral configurable y una puerta de silencio por RMS para no
  "perseguir" ruido de fondo. Para escenarios de producción con mucho ruido ambiente sigue
  siendo razonable evaluar librerías dedicadas como `pitchfinder` o `yinjs`.

## Sonido guía: piano con grabaciones reales

El timbre **"Piano real"** ya no es sintetizado: reproduce 30 grabaciones reales de un
piano de cola Yamaha C5 (**Salamander Grand Piano**, por Alexander Holm, licencia
**CC BY 3.0** — créditos completos en `assets/piano-samples/CREDITS.md`), espaciadas
cada tercera menor, y afina las notas intermedias ajustando la velocidad de reproducción
(`playbackRate`), igual que cualquier sampler de piano profesional. Las 30 muestras
(~2 MB en total) están empaquetadas dentro de `assets/piano-samples/` y precacheadas por
el Service Worker, así que la app sigue siendo 100% local y funciona sin conexión después
de la primera visita. Si por algún motivo las muestras no llegan a cargar (por ejemplo,
la primerísima vez y sin conexión), el motor cae automáticamente al piano sintetizado
como respaldo, sin cortar el sonido.

Los timbres "Voz humana", "Suave", "Cálido" y "Brillante" siguen siendo síntesis pura
(formantes vocales / osciladores con envolvente), sin archivos de audio de por medio.

## Archivos

```
index.html
style.css
manifest.webmanifest
sw.js
js/
  app.js          orquesta la interfaz
  audio.js        motor de audio, sintetizador guía y metrónomo
  mic.js          gestor único del micrófono
  pitch.js        YIN + utilidades de nota/frecuencia
  exercises.js    biblioteca de 15 ejercicios vocales
  storage.js      IndexedDB (grabaciones) + localStorage (ajustes)
  wav-encoder.js  exportación a WAV
icons/
  icon.svg, icon-192.png, icon-512.png
assets/
  metronome_click.wav, demo_exercise_1.wav, pickup_note.wav, scale_C_major.wav
  piano-samples/   30 grabaciones reales de piano (Salamander Grand Piano, CC BY 3.0)
                   + CREDITS.md con la atribución
```

## Uso

Abre `index.html` en Chrome, Edge, Firefox o Safari. Da permiso al micrófono cuando se
solicite. Toca una vez en cualquier parte de la página para activar el audio (requerido por
los navegadores). Para instalarla como app, usa "Añadir a pantalla de inicio" o el ícono de
instalación de tu navegador.

> Nota: por tratarse de módulos ES (`type="module"`), si abres el archivo con doble clic
> (protocolo `file://`) algunos navegadores bloquean la carga de módulos. Sírvelo con un
> servidor estático simple, por ejemplo `python3 -m http.server` desde la carpeta del
> proyecto, y abre `http://localhost:8000`.

## Compatibilidad

Chrome/Edge/Firefox/Safari recientes. Requiere `AudioContext`, `getUserMedia`, `IndexedDB`
y `MediaRecorder`. El Service Worker es progresivo: si el navegador no lo soporta, la app
sigue funcionando igual, solo sin caché offline.

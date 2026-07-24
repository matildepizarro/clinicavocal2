# Consultorio Vocal — plataforma integrada

Portal único que reúne las 6 herramientas de fonoaudiología vocal de Matilde Pizarro
Toro. Cada herramienta conserva **exactamente** su código y funcionamiento original;
esta integración solo agrega una página de entrada (`index.html`) que enlaza a cada una
desde su propia carpeta. Nada se reescribió por dentro de los proyectos originales, así
que ninguna función se perdió.

## Estructura

```
/
├── index.html                 ← portal principal (elige herramienta)
├── vocalizador/                ← Ejercicios Vocales (entrenador vocal, PWA offline)
├── praat-web/                  ← Plataforma de Análisis Acústico de la Voz
├── bitacora-sesiones/          ← Bitácora de sesiones clínicas
├── sesion-diaria/               ← Sesión diaria / acompañamiento vocal
├── esfuerzo-vocal/              ← Medición del esfuerzo vocal
└── respiracion-cuadrada/        ← Respira Fácil (temporizador de respiración)
```

Cada carpeta funciona también de forma independiente si se abre directamente
(por ejemplo `tudominio.github.io/tu-repo/vocalizador/`).

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub y sube **todo el contenido de esta carpeta**
   (no la carpeta contenedora, sino los archivos y subcarpetas que están dentro).
2. En el repositorio: **Settings → Pages → Source**, elige la rama `main` y la carpeta
   `/ (root)`.
3. Guarda. GitHub te dará una URL del tipo
   `https://tu-usuario.github.io/tu-repo/` — esa es tu portal.
4. El archivo `.nojekyll` ya está incluido para que GitHub Pages sirva todos los
   archivos (incluidos los que empiezan con `_` o viven en carpetas como `assets/`)
   sin que el procesador Jekyll los ignore o los transforme.

No hace falta build, backend ni configuración adicional: todo es HTML/CSS/JS estático.

## Notas técnicas de la integración (revisión de una experta)

- **Sin colisión de datos entre apps**: todas usan `localStorage` con claves con
  prefijo propio (`chain_mode_v1`, `afimart_panel_state`, `rf_presets`, etc.) y
  Ejercicios Vocales usa su propia base IndexedDB (`vocalizer2026`). Al vivir todas bajo
  el mismo dominio de GitHub Pages comparten origen, pero no comparten claves, así
  que no hay riesgo de que una herramienta sobrescriba los datos de otra.
- **Rutas relativas**: se verificó que ningún archivo use rutas absolutas (`/algo`)
  que pudieran romperse al publicar el sitio en una subcarpeta de GitHub Pages
  (`usuario.github.io/repo/...` en vez de la raíz del dominio). Todas las rutas son
  relativas (`./`, `js/...`, `assets/...`), por lo que el sitio funciona igual en
  local, en una subcarpeta o en un dominio propio.
- **Service Worker de Ejercicios Vocales**: su `scope` es `./`, o sea que solo controla
  su propia carpeta `vocalizador/` y no interfiere con el resto del portal ni con las
  demás herramientas.
- **Sintaxis JS**: todos los módulos de `vocalizador/js/*.js` y el JavaScript interno
  de cada herramienta de una sola página pasaron validación de sintaxis sin errores.
- **Archivo eliminado por ser residuo**: `vocalizador/app.js` (raíz) correspondía a una
  versión monolítica anterior ya reemplazada por los módulos en `vocalizador/js/`; el
  `index.html` de Ejercicios Vocales solo carga `js/app.js`, así que el archivo viejo se quitó
  para no generar confusión ni peso extra.
- **Dependencias externas**: algunas herramientas cargan Google Fonts y, para exportar
  PDF/ZIP, las librerías `jspdf` y `jszip` desde cdnjs. Esto requiere conexión a
  internet la primera vez que se usan esas funciones; el resto de cada app funciona
  sin conexión.

## Autoría

Todas las herramientas fueron creadas originalmente por **Matilde Pizarro Toro**,
Fonoaudióloga. Esta integración solo organiza y presenta el trabajo ya existente.

/* ============================================================
   Consultorio Vocal — utilidades JS compartidas entre herramientas
   ============================================================
   escapeHtml(texto): convierte un string en su versión segura para
   insertar dentro de innerHTML (evita XSS cuando el texto viene de
   un nombre de archivo, una nota clínica u otro dato ingresado por
   la persona usuaria). Uso:

     el.innerHTML = `<strong>${escapeHtml(nombrePaciente)}</strong>`;

   Se expone como función global (script clásico, no módulo) para
   que también pueda usarse desde módulos ES (los módulos sí pueden
   leer globales definidas por scripts clásicos cargados antes).
   ============================================================ */
(function(){
  function escapeHtml(texto){
    if(texto === null || texto === undefined) return '';
    return String(texto)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  /* csvField / toCsv / downloadCsv: utilidades compartidas de exportación CSV.

     - Cada campo se envuelve siempre entre comillas y las comillas internas
       se duplican (RFC 4180), evitando que una coma, salto de línea o
       comilla dentro de una nota clínica rompa la estructura del archivo.
     - Si un campo empieza con '=', '+', '-', '@' (o tab/retorno de carro),
       se antepone una comilla simple. Sin esto, Excel/Sheets puede
       interpretar ese valor como una fórmula al abrir el archivo
       ("inyección de fórmulas / CSV injection") — relevante porque estos
       campos suelen contener texto que la persona usuaria escribió
       libremente (nombre de paciente, observaciones).
     - downloadCsv agrega el BOM UTF-8 ('\uFEFF') para que los acentos y
       la 'ñ' se vean correctos al abrir el archivo directamente en Excel
       en Windows, y encapsula el patrón repetido de Blob + <a> + revoke. */
  function csvField(value){
    var s = (value === null || value === undefined) ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function toCsv(rows){
    return rows.map(function(row){ return row.map(csvField).join(','); }).join('\r\n');
  }
  function downloadCsv(filename, rows){
    var csv = toCsv(rows);
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  window.escapeHtml = escapeHtml;
  window.csvField = csvField;
  window.toCsv = toCsv;
  window.downloadCsv = downloadCsv;

  /* cvLoadScript(url): carga un <script> externo bajo demanda (la primera
     vez que hace falta, no en cada carga de página) y devuelve una Promise
     que se resuelve cuando termina de cargar. Memoiza por URL: si dos
     funciones piden el mismo script casi al mismo tiempo (p. ej. dos clics
     rápidos en "Exportar PDF"), solo se inyecta una vez.
     Uso típico dentro de una función de exportación:
       await cvLoadScript('https://cdnjs.../jspdf.umd.min.js');
       const { jsPDF } = window.jspdf; */
  var scriptPromises = {};
  function cvLoadScript(url){
    if (scriptPromises[url]) return scriptPromises[url];
    scriptPromises[url] = new Promise(function(resolve, reject){
      var s = document.createElement('script');
      s.src = url;
      s.crossOrigin = 'anonymous';
      s.referrerPolicy = 'no-referrer';
      s.onload = function(){ resolve(); };
      s.onerror = function(){ delete scriptPromises[url]; reject(new Error('No se pudo cargar ' + url)); };
      document.head.appendChild(s);
    });
    return scriptPromises[url];
  }
  window.cvLoadScript = cvLoadScript;

  /* canonical / og:url: este proyecto se despliega en distintos dominios
     (GitHub Pages de usuario u organización, dominio propio, subcarpeta,
     etc.), por lo que no existe una URL absoluta correcta para escribir a
     mano en cada archivo .html. Se completan en tiempo de ejecución a
     partir de location.href (sin query ni hash) apenas carga la página. */
  function ensureMeta(selector, create){
    var el = document.querySelector(selector);
    if (!el){ el = create(); document.head.appendChild(el); }
    return el;
  }
  try {
    var cleanUrl = location.origin + location.pathname;
    ensureMeta('link[rel="canonical"]', function(){
      var l = document.createElement('link'); l.setAttribute('rel', 'canonical'); return l;
    }).setAttribute('href', cleanUrl);
    ensureMeta('meta[property="og:url"]', function(){
      var m = document.createElement('meta'); m.setAttribute('property', 'og:url'); return m;
    }).setAttribute('content', cleanUrl);
  } catch(e){ /* location access blocked (e.g. sandboxed iframe) — non-fatal */ }
})();

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
  window.escapeHtml = escapeHtml;
})();

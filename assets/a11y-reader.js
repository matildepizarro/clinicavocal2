/* ============================================================
   Consultorio Vocal — Lector de accesibilidad compartido
   ============================================================
   Widget flotante 🔊 (mismo espíritu que el de tema 🎨 e idioma 🌐)
   que activa un modo de lectura en voz alta: al pasar el mouse
   (hover) o al enfocar con teclado (Tab) cualquier elemento de la
   página, se lee su texto accesible usando la Web Speech API
   (SpeechSynthesis). Pensado para personas con baja visión o
   dificultades de lectura.

   - Estado (activado/desactivado) y velocidad de lectura se
     guardan en localStorage, compartidos entre TODAS las
     herramientas de la plataforma (igual que el tema y el idioma).
   - El propio panel del widget funciona como "Ajustes" de este
     modo: no hace falta duplicar el control en cada herramienta.
   - Respeta el idioma activo (ES/PT/EN) tanto para elegir la voz
     de síntesis como para las palabras de estado ("activado" /
     "desactivado" / "seleccionado").
   - Esc detiene la lectura en curso. Mover el foco o el mouse a
     otro elemento cancela la lectura anterior y empieza la nueva.
   - Se agrega además una leyenda (caption) en la parte inferior de
     la pantalla con el texto que se está leyendo, útil también
     para personas sordas o con hipoacusia, o si el navegador no
     tiene voces instaladas.
   ============================================================ */
(function(){
  var ON_KEY = 'cv-a11y-on';
  var RATE_KEY = 'cv-a11y-rate';
  var HOVER_DELAY = 160;

  function tr(key, fallback){
    if (window.CV_I18N && typeof window.CV_I18N.t === 'function'){
      var v = window.CV_I18N.t(key);
      if (v && v !== key) return v;
    }
    return fallback;
  }

  function isOn(){ try { return localStorage.getItem(ON_KEY) === '1'; } catch(e){ return false; } }
  function setOn(v){ try { localStorage.setItem(ON_KEY, v ? '1' : '0'); } catch(e){} }
  function getRate(){
    try { var r = parseFloat(localStorage.getItem(RATE_KEY)); return isNaN(r) ? 1 : r; }
    catch(e){ return 1; }
  }
  function setRate(r){ try { localStorage.setItem(RATE_KEY, String(r)); } catch(e){} }

  var synth = window.speechSynthesis;
  var supported = !!synth && typeof window.SpeechSynthesisUtterance === 'function';

  var LANG_CODE = { es:'es-ES', pt:'pt-BR', en:'en-US' };
  function currentLangCode(){
    var l = (window.CV_I18N && window.CV_I18N.lang) || 'es';
    return LANG_CODE[l] || 'es-ES';
  }
  function pickVoice(langCode){
    if (!supported) return null;
    var voices = [];
    try { voices = synth.getVoices() || []; } catch(e){}
    var exact = voices.filter(function(v){ return v.lang === langCode; })[0];
    if (exact) return exact;
    var short = langCode.split('-')[0];
    var partial = voices.filter(function(v){ return v.lang && v.lang.indexOf(short) === 0; })[0];
    return partial || null;
  }

  // Built via the RegExp constructor (not a /u-flag literal) so that on the
  // rare engine without Unicode property support the *construction* fails
  // and is caught here, rather than a parse-time SyntaxError taking down
  // this entire script for every visitor on that engine.
  var EMOJI_RE = null;
  try { EMOJI_RE = new RegExp('[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\u{FE0F}\\u{200D}]', 'gu'); }
  catch(e){ EMOJI_RE = null; }
  function stripEmojiForSpeech(text){
    if (!EMOJI_RE) return text;
    var cleaned = text.replace(EMOJI_RE, '').replace(/\s+/g, ' ').trim();
    return cleaned || text; // if the text was emoji-only, speak the original rather than nothing
  }

  function stateWord(key){
    return tr('a11yState' + key.charAt(0).toUpperCase() + key.slice(1),
      key === 'on' ? 'activado' : (key === 'off' ? 'desactivado' : 'seleccionado'));
  }

  function findLabelFor(el){
    if (el.id){
      try {
        var l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
        if (l) return l;
      } catch(e){}
    }
    return el.closest ? el.closest('label') : null;
  }

  function getReadableText(el){
    if (!el || el.nodeType !== 1) return '';
    if (el.hasAttribute('aria-label')){
      var al = el.getAttribute('aria-label').trim();
      if (al) return al;
    }
    if (el.hasAttribute('aria-labelledby')){
      var ids = el.getAttribute('aria-labelledby').split(/\s+/);
      var txt = ids.map(function(id){
        var e = document.getElementById(id);
        return e ? e.textContent.trim() : '';
      }).filter(Boolean).join(', ');
      if (txt) return txt;
    }
    var tag = el.tagName;
    if (tag === 'IMG') return (el.getAttribute('alt') || '').trim();
    if (tag === 'INPUT'){
      var type = (el.getAttribute('type') || 'text').toLowerCase();
      if (type === 'checkbox' || type === 'radio'){
        var lbl = findLabelFor(el);
        var base = lbl ? lbl.textContent.trim() : (el.title || '').trim();
        return (base ? base + ', ' : '') + stateWord(el.checked ? 'on' : 'off');
      }
      if (type === 'button' || type === 'submit' || type === 'reset'){
        return (el.value || el.title || '').trim();
      }
      if (type === 'range'){
        var lbl2 = findLabelFor(el);
        return [(lbl2 ? lbl2.textContent.trim() : ''), el.value].filter(Boolean).join(': ');
      }
      var lbl3 = findLabelFor(el);
      var lblText = lbl3 ? lbl3.textContent.trim() : '';
      var val = el.value ? String(el.value).trim() : '';
      var ph = el.getAttribute('placeholder') || '';
      return [lblText, (val || ph)].filter(Boolean).join(': ');
    }
    if (tag === 'SELECT'){
      var lbl4 = findLabelFor(el);
      var opt = el.options[el.selectedIndex];
      return [(lbl4 ? lbl4.textContent.trim() : ''), (opt ? opt.textContent.trim() : '')].filter(Boolean).join(': ');
    }
    if (tag === 'TEXTAREA'){
      var lbl5 = findLabelFor(el);
      var lblText5 = lbl5 ? lbl5.textContent.trim() : '';
      var val5 = el.value ? el.value.trim() : (el.getAttribute('placeholder') || '');
      return [lblText5, val5].filter(Boolean).join(': ');
    }
    var title = (el.getAttribute && el.getAttribute('title')) || '';
    if (title.trim()) return title.trim();
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length > 500) text = text.slice(0, 500) + '…';
    return text;
  }

  var TARGET_SELECTOR = [
    'button', 'a[href]', 'input', 'select', 'textarea', 'label', 'summary',
    '[role="button"]', '[role="tab"]', '[role="option"]', '[role="link"]', '[role="checkbox"]',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'p', 'td', 'th', 'figcaption', '[data-a11y-read]'
  ].join(',');

  function resolveTarget(el){
    if (!el || !el.closest) return el;
    var found = el.closest(TARGET_SELECTOR);
    return found || el;
  }

  var lastEl = null, hoverTimer = null;
  var captionEl, fabRef, panelRef, toggleRef, rateRef;
  var panelTitleRef, toggleLabelRef, hintRef, rateLabelRef, noSupportRef;

  function speak(text, el){
    if (!text) return;
    if (el === lastEl && supported && synth.speaking) return;
    if (supported){
      synth.cancel();
      var utter = new SpeechSynthesisUtterance(stripEmojiForSpeech(text));
      var langCode = currentLangCode();
      utter.lang = langCode;
      var voice = pickVoice(langCode);
      if (voice) utter.voice = voice;
      utter.rate = getRate();
      synth.speak(utter);
    }
    lastEl = el;
    highlight(el);
    showCaption(text);
  }

  function stop(){
    if (supported){ try { synth.cancel(); } catch(e){} }
    lastEl = null;
    highlight(null);
    hideCaption();
  }

  function highlight(el){
    var prev = document.querySelectorAll('.cv-a11y-active');
    for (var i = 0; i < prev.length; i++) prev[i].classList.remove('cv-a11y-active');
    if (el && el.nodeType === 1) el.classList.add('cv-a11y-active');
  }

  function showCaption(text){
    if (!captionEl) return;
    captionEl.textContent = text;
    captionEl.classList.add('show');
  }
  function hideCaption(){
    if (!captionEl) return;
    captionEl.classList.remove('show');
  }

  function isOwnWidget(el){
    return !!(el.closest && el.closest('#cv-a11y-fab, #cv-a11y-panel'));
  }

  function onPointerOver(e){
    if (!isOn()) return;
    if (isOwnWidget(e.target)) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(function(){
      var target = resolveTarget(e.target);
      var text = getReadableText(target);
      if (text) speak(text, target);
    }, HOVER_DELAY);
  }
  function onPointerOut(){
    clearTimeout(hoverTimer);
  }
  function onFocusIn(e){
    if (!isOn()) return;
    if (isOwnWidget(e.target)) return;
    clearTimeout(hoverTimer);
    var target = resolveTarget(e.target);
    var text = getReadableText(target);
    if (text) speak(text, target);
  }
  function onKeydown(e){
    if (e.key !== 'Escape') return;
    stop();
    if (panelRef && panelRef.classList.contains('open')) setPanelOpen(false, { returnFocus: true });
  }

  function attachListeners(){
    document.addEventListener('mouseover', onPointerOver, true);
    document.addEventListener('mouseout', onPointerOut, true);
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('keydown', onKeydown, true);
  }

  function applyState(){
    var on = isOn();
    document.documentElement.classList.toggle('cv-a11y-on', on);
    if (toggleRef) toggleRef.checked = on;
    if (fabRef){
      fabRef.classList.toggle('active', on);
      fabRef.setAttribute('aria-pressed', String(on));
    }
    if (!on) stop();
  }

  function setPanelOpen(open, opts){
    if (!panelRef || !fabRef) return;
    panelRef.classList.toggle('open', open);
    fabRef.setAttribute('aria-expanded', String(open));
    if (!open && opts && opts.returnFocus) fabRef.focus();
  }

  function refreshLabels(){
    if (fabRef) fabRef.setAttribute('aria-label', tr('a11yToggleLabel', 'Lector de accesibilidad (leer al pasar el mouse o enfocar)'));
    if (panelTitleRef) panelTitleRef.textContent = tr('a11yPanelTitle', 'Lector de accesibilidad');
    if (toggleLabelRef) toggleLabelRef.textContent = tr('a11yToggleText', 'Leer en voz alta al pasar el mouse o enfocar');
    if (hintRef) hintRef.textContent = supported
      ? tr('a11yHint', 'Recorré la pantalla con el mouse o el teclado (Tab) y vas a escuchar el texto de cada elemento. Presioná Esc para detener la lectura.')
      : tr('a11yNoSupport', 'Tu navegador no admite lectura en voz alta.');
    if (rateLabelRef) rateLabelRef.textContent = tr('a11yRateLabel', 'Velocidad de lectura');
    if (rateRef) rateRef.setAttribute('aria-label', tr('a11yRateLabel', 'Velocidad de lectura'));
  }

  function buildWidget(){
    var css = document.createElement('style');
    css.textContent = [
      '#cv-a11y-fab{position:fixed;bottom:18px;right:138px;z-index:9999;',
      'width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;',
      'background:linear-gradient(135deg,#8fa39c,#8fa8bb);color:#fff;font-size:20px;',
      'box-shadow:0 8px 24px rgba(40,90,80,.24);display:flex;align-items:center;justify-content:center;',
      'transition:transform .18s ease,background .18s ease;}',
      /* Off state stays fully opaque (a translucent a11y button would be
         ironic: it must stay easy to find for the low-vision users it is
         meant to help) and uses a visibly muted color instead of reduced
         contrast to signal "inactive". */
      '#cv-a11y-fab.active{background:linear-gradient(135deg,#4fb894,#5bb3e0);}',
      '#cv-a11y-fab:hover{transform:scale(1.08) rotate(6deg);}',
      '#cv-a11y-panel{position:fixed;bottom:78px;right:138px;z-index:9999;',
      'background:#fff;border-radius:16px;padding:16px;box-shadow:0 16px 44px rgba(40,70,60,.28);',
      'font-family:Inter,system-ui,sans-serif;min-width:230px;max-width:270px;display:none;border:1px solid rgba(140,190,170,.35);}',
      '#cv-a11y-panel.open{display:block;}',
      '#cv-a11y-panel h4{margin:0 0 10px;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:#2f6b56;font-weight:700;}',
      '.cv-a11y-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;}',
      '.cv-a11y-row label{font-size:.86rem;color:#2c4a40;cursor:pointer;}',
      '.cv-a11y-switch{position:relative;width:40px;height:22px;flex:0 0 auto;cursor:pointer;}',
      '.cv-a11y-switch input{opacity:0;width:0;height:0;position:absolute;}',
      '.cv-a11y-slider{position:absolute;inset:0;background:#d8e6e0;border-radius:22px;cursor:pointer;transition:.18s;}',
      '.cv-a11y-slider:before{content:"";position:absolute;width:16px;height:16px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.18s;box-shadow:0 1px 3px rgba(0,0,0,.25);}',
      '.cv-a11y-switch input:checked + .cv-a11y-slider{background:#4fb894;}',
      '.cv-a11y-switch input:checked + .cv-a11y-slider:before{transform:translateX(18px);}',
      '.cv-a11y-hint{font-size:.74rem;color:#5a7a70;line-height:1.4;margin-top:2px;}',
      '.cv-a11y-rate-label{font-size:.74rem;color:#5a7a70;margin-bottom:4px;display:block;}',
      '.cv-a11y-rate{width:100%;accent-color:#4fb894;}',
      '.cv-a11y-active{outline:3px solid #4fb894 !important;outline-offset:2px;border-radius:4px;}',
      '#cv-a11y-caption{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:10000;',
      'max-width:min(560px,90vw);background:rgba(20,30,28,.9);color:#fff;padding:10px 16px;border-radius:12px;',
      'font-family:Inter,system-ui,sans-serif;font-size:.86rem;line-height:1.4;text-align:center;opacity:0;pointer-events:none;',
      'transition:opacity .15s ease;}',
      '#cv-a11y-caption.show{opacity:1;}',
      '@media (max-width:480px){#cv-a11y-fab{right:126px;bottom:14px;width:44px;height:44px;font-size:18px;}',
      '#cv-a11y-panel{right:14px;bottom:70px;}}'
    ].join('');
    document.head.appendChild(css);

    var fab = document.createElement('button');
    fab.id = 'cv-a11y-fab';
    fab.type = 'button';
    fab.textContent = '🔊';
    fab.setAttribute('aria-haspopup', 'true');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'cv-a11y-panel');
    fabRef = fab;

    var panel = document.createElement('div');
    panel.id = 'cv-a11y-panel';
    panelRef = panel;

    var title = document.createElement('h4');
    panel.appendChild(title);
    panelTitleRef = title;

    var row = document.createElement('div');
    row.className = 'cv-a11y-row';
    var lbl = document.createElement('label');
    lbl.setAttribute('for', 'cv-a11y-toggle');
    row.appendChild(lbl);
    toggleLabelRef = lbl;

    var sw = document.createElement('label');
    sw.className = 'cv-a11y-switch';
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'cv-a11y-toggle';
    var slider = document.createElement('span');
    slider.className = 'cv-a11y-slider';
    sw.appendChild(input);
    sw.appendChild(slider);
    row.appendChild(sw);
    panel.appendChild(row);
    toggleRef = input;

    var hint = document.createElement('div');
    hint.className = 'cv-a11y-hint';
    panel.appendChild(hint);
    hintRef = hint;

    if (supported){
      var rateWrap = document.createElement('div');
      rateWrap.style.marginTop = '12px';
      var rateLbl = document.createElement('span');
      rateLbl.className = 'cv-a11y-rate-label';
      rateWrap.appendChild(rateLbl);
      rateLabelRef = rateLbl;
      var rateInput = document.createElement('input');
      rateInput.type = 'range';
      rateInput.min = '0.6';
      rateInput.max = '1.6';
      rateInput.step = '0.1';
      rateInput.className = 'cv-a11y-rate';
      rateInput.value = String(getRate());
      rateWrap.appendChild(rateInput);
      panel.appendChild(rateWrap);
      rateRef = rateInput;
      rateInput.addEventListener('input', function(){ setRate(parseFloat(rateInput.value)); });
    } else {
      input.disabled = true;
    }

    input.checked = isOn();
    input.addEventListener('change', function(){ setOn(input.checked); applyState(); });

    fab.addEventListener('click', function(){ setPanelOpen(!panel.classList.contains('open')); });
    document.addEventListener('click', function(e){
      if (!panel.contains(e.target) && e.target !== fab && panel.classList.contains('open')){
        setPanelOpen(false);
      }
    });

    var caption = document.createElement('div');
    caption.id = 'cv-a11y-caption';
    caption.setAttribute('aria-live', 'polite');
    captionEl = caption;

    document.body.appendChild(fab);
    document.body.appendChild(panel);
    document.body.appendChild(caption);

    refreshLabels();
    applyState();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ buildWidget(); attachListeners(); });
  } else {
    buildWidget();
    attachListeners();
  }
  window.addEventListener('cv-lang-changed', refreshLabels);
  if (supported && 'onvoiceschanged' in synth){
    synth.addEventListener('voiceschanged', function(){ /* voces cargadas de forma asíncrona en algunos navegadores */ });
  }
})();

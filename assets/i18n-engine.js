/* ============================================================
   Consultorio Vocal — motor de idiomas compartido (ES / PT / EN)
   ============================================================
   Cada herramienta define su propio diccionario (ver archivo
   "i18n-dict.js" junto a cada index.html) con esta forma:

     window.CV_I18N_DICT = {
       es: { clave: "Texto en español", ... },
       pt: { clave: "Texto em português", ... },
       en: { clave: "Text in English", ... }
     };

   Y marca el HTML así:
     <h2 data-i18n="tituloSeccion">Título por defecto (es)</h2>
     <input data-i18n-placeholder="buscarPlaceholder" placeholder="Buscar...">
     <button data-i18n-title="cerrarTooltip" title="Cerrar">✕</button>
     <button data-i18n-aria="cerrarBoton" aria-label="Cerrar">✕</button>
     <option data-i18n="opcionUno">Opción 1</option>

   Este script:
   - Lee/guarda el idioma elegido en localStorage['cv-lang'] (compartido
     entre TODAS las herramientas de la plataforma, igual que el tema).
   - Aplica las traducciones a todo elemento con data-i18n* al cargar y
     cada vez que la persona cambia de idioma.
   - Expone window.CV_I18N.t(clave) y window.CV_I18N.lang para que el
     código propio de cada herramienta traduzca también el contenido que
     genera dinámicamente (listas de ejercicios, informes PDF, etc).
   - Dispara el evento 'cv-lang-changed' en window cada vez que cambia el
     idioma, para que cada herramienta pueda re-renderizar lo dinámico.
   - Dibuja un botón flotante 🌐 (idéntico en espíritu al selector de
     temas 🎨) para elegir Español / Português / English.
   ============================================================ */
(function(){
  var KEY = 'cv-lang';
  var LANGS = [
    { id:'es', label:'Español',   flag:'🇪🇸' },
    { id:'pt', label:'Português', flag:'🇧🇷' },
    { id:'en', label:'English',   flag:'🇬🇧' }
  ];

  function currentLang(){
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'es' || v === 'pt' || v === 'en') return v;
      return 'es';
    } catch(e){ return 'es'; }
  }

  var CORE_DICT = {
    es: {
      backToPortal: 'Volver al portal',
      chooseTheme: 'Elige un tema',
      changeTheme: 'Cambiar tema de color',
      changeLanguage: 'Cambiar idioma / Change language / Mudar idioma',
      langPanelTitle: 'Idioma / Language',
      themeRosa: 'Rosa', themeLavanda: 'Lavanda', themeMenta: 'Menta',
      themeDurazno: 'Durazno', themeCielo: 'Cielo',
      a11yToggleLabel: 'Lector de accesibilidad (leer al pasar el mouse o enfocar)',
      a11yPanelTitle: 'Lector de accesibilidad',
      a11yToggleText: 'Leer en voz alta al pasar el mouse o enfocar',
      a11yHint: 'Recorré la pantalla con el mouse o el teclado (Tab) y vas a escuchar el texto de cada elemento. Presioná Esc para detener la lectura.',
      a11yRateLabel: 'Velocidad de lectura',
      a11yStateOn: 'activado', a11yStateOff: 'desactivado', a11yStateSelected: 'seleccionado',
      a11yNoSupport: 'Tu navegador no admite lectura en voz alta.'
    },
    pt: {
      backToPortal: 'Voltar ao portal',
      chooseTheme: 'Escolha um tema',
      changeTheme: 'Mudar tema de cor',
      changeLanguage: 'Cambiar idioma / Change language / Mudar idioma',
      langPanelTitle: 'Idioma / Language',
      themeRosa: 'Rosa', themeLavanda: 'Lavanda', themeMenta: 'Menta',
      themeDurazno: 'Pêssego', themeCielo: 'Céu',
      a11yToggleLabel: 'Leitor de acessibilidade (ler ao passar o mouse ou focar)',
      a11yPanelTitle: 'Leitor de acessibilidade',
      a11yToggleText: 'Ler em voz alta ao passar o mouse ou focar',
      a11yHint: 'Percorra a tela com o mouse ou o teclado (Tab) e você vai ouvir o texto de cada elemento. Pressione Esc para parar a leitura.',
      a11yRateLabel: 'Velocidade de leitura',
      a11yStateOn: 'ativado', a11yStateOff: 'desativado', a11yStateSelected: 'selecionado',
      a11yNoSupport: 'Seu navegador não é compatível com leitura em voz alta.'
    },
    en: {
      backToPortal: 'Back to portal',
      chooseTheme: 'Choose a theme',
      changeTheme: 'Change color theme',
      changeLanguage: 'Cambiar idioma / Change language / Mudar idioma',
      langPanelTitle: 'Idioma / Language',
      themeRosa: 'Pink', themeLavanda: 'Lavender', themeMenta: 'Mint',
      themeDurazno: 'Peach', themeCielo: 'Sky',
      a11yToggleLabel: 'Accessibility reader (read on hover or focus)',
      a11yPanelTitle: 'Accessibility reader',
      a11yToggleText: 'Read aloud on hover or focus',
      a11yHint: 'Move over the screen with the mouse or keyboard (Tab) and you\u2019ll hear each element\u2019s text. Press Esc to stop reading.',
      a11yRateLabel: 'Reading speed',
      a11yStateOn: 'on', a11yStateOff: 'off', a11yStateSelected: 'selected',
      a11yNoSupport: 'Your browser does not support text-to-speech.'
    }
  };

  function mergedDict(pageDict){
    var out = { es:{}, pt:{}, en:{} };
    ['es','pt','en'].forEach(function(l){
      out[l] = Object.assign({}, CORE_DICT[l], pageDict && pageDict[l] ? pageDict[l] : {});
    });
    return out;
  }

  var state = { lang: currentLang(), dict: mergedDict(window.CV_I18N_DICT || null) };

  function t(key){
    var d = state.dict;
    if (!d) return key;
    var byLang = d[state.lang] || d.es || {};
    if (Object.prototype.hasOwnProperty.call(byLang, key)) return byLang[key];
    // Si falta la clave en el idioma elegido, cae a español antes que mostrar la clave cruda
    if (d.es && Object.prototype.hasOwnProperty.call(d.es, key)) return d.es[key];
    return key;
  }

  function applyToDom(root){
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function(el){
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    root.querySelectorAll('[data-i18n-html]').forEach(function(el){
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    root.querySelectorAll('[data-i18n-title]').forEach(function(el){
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(function(el){
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    root.querySelectorAll('[data-i18n-value]').forEach(function(el){
      el.setAttribute('value', t(el.getAttribute('data-i18n-value')));
    });
    root.querySelectorAll('[data-i18n-content]').forEach(function(el){
      el.setAttribute('content', t(el.getAttribute('data-i18n-content')));
    });
    document.documentElement.setAttribute('lang', state.lang === 'pt' ? 'pt-BR' : state.lang);
  }

  function setLang(id){
    if (id !== 'es' && id !== 'pt' && id !== 'en') return;
    state.lang = id;
    try { localStorage.setItem(KEY, id); } catch(e){}
    applyToDom(document);
    updateWidgetActive();
    window.dispatchEvent(new CustomEvent('cv-lang-changed', { detail:{ lang:id } }));
  }

  function init(dict){
    if (dict) state.dict = mergedDict(dict);
    applyToDom(document);
    window.dispatchEvent(new CustomEvent('cv-lang-changed', { detail:{ lang: state.lang, initial:true } }));
  }

  window.CV_I18N = {
    get lang(){ return state.lang; },
    t: t,
    setLang: setLang,
    init: init,
    applyToDom: applyToDom
  };

  /* ---------------- Widget flotante 🌐 ---------------- */
  var panelEl, fabEl;

  function updateWidgetActive(){
    if (!panelEl) return;
    panelEl.querySelectorAll('.cv-lang-opt').forEach(function(b){
      b.classList.toggle('active', b.dataset.langId === state.lang);
    });
  }

  function buildWidget(){
    var css = document.createElement('style');
    css.textContent = [
      '#cv-lang-fab{position:fixed;bottom:18px;right:78px;z-index:9999;',
      'width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;',
      'background:linear-gradient(135deg,#5bb3e0,#4fb894);color:#fff;font-size:20px;',
      'box-shadow:0 8px 24px rgba(30,90,110,.35);display:flex;align-items:center;justify-content:center;',
      'transition:transform .18s ease;}',
      '#cv-lang-fab:hover{transform:scale(1.08) rotate(6deg);}',
      '#cv-lang-panel{position:fixed;bottom:78px;right:78px;z-index:9999;',
      'background:#fff;border-radius:16px;padding:14px;box-shadow:0 16px 44px rgba(20,70,90,.28);',
      'font-family:Inter,system-ui,sans-serif;min-width:190px;display:none;border:1px solid rgba(140,190,210,.35);}',
      '#cv-lang-panel.open{display:block;}',
      '#cv-lang-panel h4{margin:0 0 10px;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:#31707f;font-weight:700;}',
      '.cv-lang-opt{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border-radius:10px;',
      'border:none;background:transparent;cursor:pointer;font-size:.86rem;color:#1c3a42;text-align:left;font-family:inherit;}',
      '.cv-lang-opt:hover{background:#eef8fa;}',
      '.cv-lang-opt.active{background:#e2f3f6;font-weight:700;}',
      '.cv-lang-flag{font-size:18px;line-height:1;}',
      '@media (max-width:480px){#cv-lang-fab{right:70px;bottom:14px;width:44px;height:44px;font-size:18px;}',
      '#cv-lang-panel{right:14px;bottom:70px;}}'
    ].join('');
    document.head.appendChild(css);

    fabEl = document.createElement('button');
    fabEl.id = 'cv-lang-fab';
    fabEl.type = 'button';
    fabEl.setAttribute('aria-label', t('changeLanguage'));
    fabEl.textContent = '🌐';

    panelEl = document.createElement('div');
    panelEl.id = 'cv-lang-panel';
    var title = document.createElement('h4');
    title.textContent = t('langPanelTitle');
    panelEl.appendChild(title);

    LANGS.forEach(function(l){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cv-lang-opt' + (l.id === state.lang ? ' active' : '');
      btn.dataset.langId = l.id;
      var flag = document.createElement('span');
      flag.className = 'cv-lang-flag';
      flag.textContent = l.flag;
      btn.appendChild(flag);
      btn.appendChild(document.createTextNode(l.label));
      btn.addEventListener('click', function(){
        setLang(l.id);
        panelEl.classList.remove('open');
      });
      panelEl.appendChild(btn);
    });

    fabEl.addEventListener('click', function(){
      panelEl.classList.toggle('open');
    });
    document.addEventListener('click', function(e){
      if (!panelEl.contains(e.target) && e.target !== fabEl && panelEl.classList.contains('open')){
        panelEl.classList.remove('open');
      }
    });

    document.body.appendChild(fabEl);
    document.body.appendChild(panelEl);
  }

  function boot(){
    document.documentElement.setAttribute('lang', state.lang === 'pt' ? 'pt-BR' : state.lang);
    if (window.CV_I18N_DICT){ state.dict = mergedDict(window.CV_I18N_DICT); applyToDom(document); }
    buildWidget();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

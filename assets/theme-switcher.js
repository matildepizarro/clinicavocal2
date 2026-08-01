/* Consultorio Vocal — selector de temas pasteles compartido
   Aplica un atributo data-pastel-theme al <html>. Cada página define en su
   propio <style> las reglas :root[data-pastel-theme="..."] con sus colores.
   Este script solo dibuja el widget flotante y persiste la elección
   (compartida entre todas las herramientas vía localStorage). */
(function(){
  var KEY = 'cv-pastel-theme';
  var THEMES = [
    { id:'rosa',    key:'themeRosa',    emoji:'🌸', swatch:'#e0559e' },
    { id:'lavanda', key:'themeLavanda', emoji:'💜', swatch:'#9b7bd9' },
    { id:'menta',   key:'themeMenta',   emoji:'🌿', swatch:'#4fb894' },
    { id:'durazno', key:'themeDurazno', emoji:'🍑', swatch:'#ff9d66' },
    { id:'cielo',   key:'themeCielo',   emoji:'☁️', swatch:'#5bb3e0' }
  ];

  function tr(key, fallback){
    if (window.CV_I18N && typeof window.CV_I18N.t === 'function'){
      var v = window.CV_I18N.t(key);
      if (v && v !== key) return v;
    }
    return fallback;
  }

  function currentTheme(){
    try { return localStorage.getItem(KEY) || 'rosa'; } catch(e){ return 'rosa'; }
  }
  function syncThemeColorMeta(id){
    var theme = THEMES.filter(function(t){ return t.id === id; })[0] || THEMES[0];
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta){
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', theme.swatch);
  }
  function applyTheme(id){
    document.documentElement.setAttribute('data-pastel-theme', id);
    syncThemeColorMeta(id);
    try { localStorage.setItem(KEY, id); } catch(e){}
  }

  // Apply immediately (in case this file loads after paint on slow connections)
  applyTheme(currentTheme());

  var panelTitleEl, fabRef, panelRef;

  function setPanelOpen(open, opts){
    if (!panelRef || !fabRef) return;
    panelRef.classList.toggle('open', open);
    fabRef.setAttribute('aria-expanded', String(open));
    if (!open && opts && opts.returnFocus) fabRef.focus();
  }

  function refreshLabels(){
    if (fabRef) fabRef.setAttribute('aria-label', tr('changeTheme','Cambiar tema de color'));
    if (panelTitleEl) panelTitleEl.textContent = tr('chooseTheme','Elige un tema');
    if (panelTitleEl){
      var opts = panelTitleEl.parentNode.querySelectorAll('.cv-theme-opt');
      THEMES.forEach(function(t, i){
        var label = opts[i] && opts[i].querySelector('.cv-theme-label');
        if (label) label.textContent = tr(t.key, t.emoji);
      });
    }
  }

  function buildWidget(){
    var css = document.createElement('style');
    css.textContent = [
      '#cv-theme-fab{position:fixed;bottom:18px;right:18px;z-index:9999;',
      'width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;',
      'background:linear-gradient(135deg,#e0559e,#9b7bd9);color:#fff;font-size:20px;',
      'box-shadow:0 8px 24px rgba(120,50,100,.35);display:flex;align-items:center;justify-content:center;',
      'transition:transform .18s ease;}',
      '#cv-theme-fab:hover{transform:scale(1.08) rotate(-6deg);}',
      '#cv-theme-panel{position:fixed;bottom:78px;right:18px;z-index:9999;',
      'background:#fff;border-radius:16px;padding:14px;box-shadow:0 16px 44px rgba(90,40,80,.28);',
      'font-family:Inter,system-ui,sans-serif;min-width:190px;display:none;border:1px solid rgba(200,150,190,.35);}',
      '#cv-theme-panel.open{display:block;}',
      '#cv-theme-panel h4{margin:0 0 10px;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:#8a5b7a;font-weight:700;}',
      '.cv-theme-opt{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border-radius:10px;',
      'border:none;background:transparent;cursor:pointer;font-size:.86rem;color:#4a2140;text-align:left;font-family:inherit;}',
      '.cv-theme-opt:hover{background:#fdf1f8;}',
      '.cv-theme-opt.active{background:#fde6f3;font-weight:700;}',
      '.cv-theme-dot{width:18px;height:18px;border-radius:50%;flex:0 0 auto;box-shadow:inset 0 0 0 2px rgba(255,255,255,.6);}'
    ].join('');
    document.head.appendChild(css);

    var fab = document.createElement('button');
    fab.id = 'cv-theme-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', tr('changeTheme','Cambiar tema de color'));
    fab.setAttribute('aria-haspopup', 'true');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'cv-theme-panel');
    fab.textContent = '🎨';
    fabRef = fab;

    var panel = document.createElement('div');
    panel.id = 'cv-theme-panel';
    panelRef = panel;
    var title = document.createElement('h4');
    title.textContent = tr('chooseTheme','Elige un tema');
    panel.appendChild(title);
    panelTitleEl = title;

    var active = currentTheme();
    THEMES.forEach(function(t){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cv-theme-opt' + (t.id === active ? ' active' : '');
      btn.dataset.themeId = t.id;
      var dot = document.createElement('span');
      dot.className = 'cv-theme-dot';
      dot.style.background = t.swatch;
      btn.appendChild(dot);
      var label = document.createElement('span');
      label.className = 'cv-theme-label';
      label.textContent = tr(t.key, t.emoji + ' ' + t.id);
      btn.appendChild(document.createTextNode(t.emoji + ' '));
      btn.appendChild(label);
      btn.addEventListener('click', function(){
        applyTheme(t.id);
        panel.querySelectorAll('.cv-theme-opt').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
      });
      panel.appendChild(btn);
    });

    fab.addEventListener('click', function(){
      setPanelOpen(!panel.classList.contains('open'));
    });
    document.addEventListener('click', function(e){
      if (!panel.contains(e.target) && e.target !== fab && panel.classList.contains('open')){
        setPanelOpen(false);
      }
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && panel.classList.contains('open')) setPanelOpen(false, { returnFocus: true });
    });

    document.body.appendChild(fab);
    document.body.appendChild(panel);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
  window.addEventListener('cv-lang-changed', refreshLabels);
})();

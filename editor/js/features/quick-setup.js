(function () {
  'use strict';
  const tr = (value) => window.OluntirI18N ? window.OluntirI18N.translateText(value) : value;
  const tk = (key) => window.OluntirI18N ? window.OluntirI18N.t(key) : key;

  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  const images = Array(8).fill('assets/images/logo.svg');

  function getRoot(component) {
    let current = component;
    while (current && current.parent && current.parent()) {
      const attrs = current.getAttributes ? current.getAttributes() : {};
      if (attrs && attrs['data-pb-quick']) return current;
      current = current.parent();
    }
    return component;
  }

  function attr(component, name, fallback) {
    const attrs = component && component.getAttributes ? component.getAttributes() : {};
    return attrs && attrs[name] != null ? attrs[name] : fallback;
  }

  function setInner(component, html) {
    component.components(html);
    component.set('pbConfigured', true);
  }

  function colClasses(xs, md, lg) {
    const result = [];
    if (xs) result.push(`col-${xs}`);
    if (md) result.push(`col-md-${md}`);
    if (lg) result.push(`col-lg-${lg}`);
    return result.join(' ');
  }

  function gridHtml(config, bs5) {
    const layouts = {
      '12': [12], '6-6': [6,6], '4-4-4': [4,4,4], '3-3-3-3': [3,3,3,3],
      '8-4': [8,4], '4-8': [4,8], '3-9': [3,9], '9-3': [9,3], '2-8-2': [2,8,2]
    };
    const widths = layouts[config.layout] || layouts['4-4-4'];
    const gap = bs5 ? `g-${config.gap}` : '';
    const vertical = config.align ? `align-items-${config.align}` : '';
    const columns = widths.map((desktop, index) => {
      const tablet = config.tablet === 'auto' ? (desktop >= 6 ? 6 : desktop) : Number(config.tablet || 12);
      const mobile = Number(config.mobile || 12);
      return `<div class="${colClasses(mobile, tablet, desktop)}"><div class="p-3 border rounded h-100"><h3>Spalte ${index + 1}</h3><p>Inhalt per Drag & Drop ergänzen.</p></div></div>`;
    }).join('');
    return `<div class="container${config.fluid ? '-fluid' : ''}"><div class="row ${gap} ${vertical}">${columns}</div></div>`;
  }

  function galleryHtml(config, bs5) {
    const count = Math.max(2, Math.min(12, Number(config.count || 6)));
    const mobile = Number(config.mobile || 1);
    const tablet = Number(config.tablet || 2);
    const desktop = Number(config.desktop || 3);
    const col = `${colClasses(Math.max(1, Math.floor(12/mobile)), Math.max(1, Math.floor(12/tablet)), Math.max(1, Math.floor(12/desktop)))}`;
    const gap = bs5 ? `g-${config.gap}` : '';
    const rounded = config.rounded ? ' rounded' : '';
    const shadow = config.shadow ? ' shadow-sm' : '';
    const ratioClass = bs5 && config.ratio !== 'auto' ? ` ratio ratio-${config.ratio}` : '';
    const items = Array.from({length: count}, (_, index) => {
      const src = images[index % images.length];
      const image = `<img src="${src}" class="img-fluid w-100${rounded}${shadow}" alt="Galeriebild ${index + 1}"${config.ratio !== 'auto' ? ' style="aspect-ratio: 4/3;object-fit:cover"' : ''}>`;
      const mode = config.viewerMode || 'modal';
      const linked = mode !== 'none' ? `<a class="pb-gallery-trigger d-block" href="${src}" data-pb-gallery-desktop="${src}" data-alt="Galeriebild ${index + 1}" data-caption="Galeriebild ${index + 1}">${image}</a>` : image;
      return `<div class="${col}"><figure class="mb-0${ratioClass}">${linked}${config.caption ? `<figcaption class="small text-muted mt-2">Bild ${index + 1}</figcaption>` : ''}</figure></div>`;
    }).join('');
    return `<div class="container pb-gallery" data-pb-gallery data-pb-gallery-viewer="${config.viewerMode || 'modal'}" data-pb-gallery-caption="${config.caption ? 'true' : 'false'}" data-pb-gallery-counter="${config.counter !== false ? 'true' : 'false'}" data-pb-gallery-loop="${config.loop !== false ? 'true' : 'false'}"><div class="row ${gap}">${items}</div></div>`;
  }

  function navbarHtml(config, bs5) {
    const ex = bs5 ? { expand: 'navbar-expand-lg', toggler: 'data-bs-toggle="collapse" data-bs-target="#pbNavbar"', collapse: 'collapse navbar-collapse', ml: 'ms-auto', close: 'btn-close' }
      : { expand: 'navbar-expand-lg', toggler: 'data-toggle="collapse" data-target="#pbNavbar"', collapse: 'collapse navbar-collapse', ml: 'ml-auto', close: 'close' };
    const dark = config.theme === 'dark';
    const theme = dark ? 'navbar-dark bg-dark' : config.theme === 'primary' ? 'navbar-dark bg-primary' : 'navbar-light bg-light';
    const pos = config.position === 'sticky' ? 'sticky-top' : config.position === 'fixed' ? 'fixed-top' : '';
    const brand = `<a class="navbar-brand" href="#">${config.logo ? '<span class="d-inline-block mr-2 me-2" aria-hidden="true">◆</span>' : ''}${esc(config.brand || 'Meine Website')}</a>`;
    const links = `<ul class="navbar-nav ${ex.ml} mb-2 mb-lg-0"><li class="nav-item"><a class="nav-link active" href="#">Start</a></li><li class="nav-item"><a class="nav-link" href="#">Über uns</a></li><li class="nav-item"><a class="nav-link" href="#">Galerie</a></li><li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" ${bs5?'data-bs-toggle':'data-toggle'}="dropdown">Mehr</a><div class="dropdown-menu"><a class="dropdown-item" href="#">Leistung</a><a class="dropdown-item" href="#">Kontakt</a></div></li></ul>`;
    const search = config.search ? '<form class="d-flex ml-lg-3 ms-lg-3"><input class="form-control mr-2 me-2" type="search" placeholder="Suchen"><button class="btn btn-outline-success" type="submit">Suchen</button></form>' : '';
    const cta = config.cta ? '<a class="btn btn-warning ml-lg-3 ms-lg-3" href="#">Kontakt</a>' : '';
    if (config.variant === 'center') {
      return `<nav class="navbar ${ex.expand} ${theme} ${pos}"><div class="container flex-lg-column">${brand}<button class="navbar-toggler" type="button" ${ex.toggler}><span class="navbar-toggler-icon"></span></button><div class="${ex.collapse} justify-content-center" id="pbNavbar">${links}${search}${cta}</div></div></nav>`;
    }
    if (config.variant === 'offcanvas' && bs5) {
      return `<nav class="navbar navbar-dark bg-dark ${pos}"><div class="container"><a class="navbar-brand" href="#">${esc(config.brand || 'Meine Website')}</a><button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#pbOffcanvas"><span class="navbar-toggler-icon"></span></button><div class="offcanvas offcanvas-end text-bg-dark" id="pbOffcanvas"><div class="offcanvas-header"><h5 class="offcanvas-title">Navigation</h5><button class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button></div><div class="offcanvas-body">${links}${search}${cta}</div></div></div></nav>`;
    }
    return `<nav class="navbar ${ex.expand} ${theme} ${pos}"><div class="container">${brand}<button class="navbar-toggler" type="button" ${ex.toggler}><span class="navbar-toggler-icon"></span></button><div class="${ex.collapse}" id="pbNavbar">${links}${search}${cta}</div></div></nav>`;
  }

  function footerHtml(config) {
    const theme = config.theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark';
    const muted = config.theme === 'dark' ? 'text-white-50' : 'text-muted';
    const legal = `<div class="d-flex flex-wrap justify-content-between border-top pt-3 mt-4"><small class="${muted}">© 2026 Meine Website</small><div><a href="#" class="${muted} mr-3 me-3">Impressum</a><a href="#" class="${muted}">Datenschutz</a></div></div>`;
    if (config.variant === 'minimal') return `<footer class="py-4 ${theme}"><div class="container text-center"><strong>Meine Website</strong><p class="mb-0 ${muted}">Ein kleines, freies Webprojekt.</p>${legal}</div></footer>`;
    if (config.variant === 'newsletter') return `<footer class="py-5 ${theme}"><div class="container"><div class="row"><div class="col-lg-6"><h2>Newsletter</h2><p class="${muted}">Neuigkeiten gelegentlich per E-Mail.</p></div><div class="col-lg-6"><div class="input-group"><input class="form-control" type="email" placeholder="E-Mail-Adresse"><button class="btn btn-primary">Anmelden</button></div></div></div>${legal}</div></footer>`;
    const cols = Number(config.columns || 4);
    const width = Math.floor(12 / cols);
    const columnHtml = Array.from({length: cols}, (_, i) => `<div class="col-12 col-md-6 col-lg-${width} mb-4"><h3 class="h5">${i === 0 ? 'Meine Website' : `Bereich ${i + 1}`}</h3><ul class="list-unstyled"><li><a href="#" class="${muted}">Eintrag 1</a></li><li><a href="#" class="${muted}">Eintrag 2</a></li><li><a href="#" class="${muted}">Eintrag 3</a></li></ul></div>`).join('');
    return `<footer class="py-5 ${theme}"><div class="container"><div class="row">${columnHtml}</div>${config.social ? `<p class="mb-0">Social: <a href="#">Mastodon</a> · <a href="#">GitHub</a> · <a href="#">Instagram</a></p>` : ''}${legal}</div></footer>`;
  }

  function cardHtml(config, bs5) {
    const count = Math.max(1, Math.min(12, Number(config.count || 3)));
    const desktop = Math.max(1, Math.min(6, Number(config.desktop || 3)));
    const tablet = Math.max(1, Math.min(4, Number(config.tablet || 2)));
    const mobile = Math.max(1, Math.min(2, Number(config.mobile || 1)));
    const col = colClasses(Math.floor(12 / mobile), Math.floor(12 / tablet), Math.floor(12 / desktop));
    const gap = bs5 ? `g-${config.gap}` : '';
    const shadow = config.shadow ? ' shadow-sm' : '';
    const border = config.border ? '' : ' border-0';
    const rounded = config.rounded ? ' rounded' : ' rounded-0';
    const cards = Array.from({length: count}, (_, index) => {
      const title = `Card ${index + 1}`;
      const image = `<img src="${images[index % images.length]}" class="card-img-top" alt="${title}" style="aspect-ratio:${config.ratio === 'square' ? '1/1' : config.ratio === 'wide' ? '16/9' : '4/3'};object-fit:cover">`;
      const badge = config.badge ? '<span class="badge bg-secondary badge-secondary mb-2">Neu</span>' : '';
      const button = config.button ? `<a href="#" class="btn btn-${config.buttonStyle || 'primary'}" data-pb-edit="button">${esc(config.buttonText || 'Mehr erfahren')}</a>` : '';
      const body = `<div class="card-body">${badge}<h3 class="card-title h5" data-pb-edit="heading">${title}</h3><p class="card-text" data-pb-edit="text">Kurzer Beispieltext. Inhalt und Gestaltung lassen sich anschließend direkt bearbeiten.</p>${button}</div>`;
      const footer = config.footer ? '<div class="card-footer text-muted">Zusatzinformation</div>' : '';
      if (config.variant === 'overlay') return `<div class="${col}"><div class="card text-white${shadow}${border}${rounded}" data-pb-edit="card">${image}<div class="card-img-overlay d-flex flex-column justify-content-end"><h3 class="card-title h5" data-pb-edit="heading">${title}</h3><p class="card-text" data-pb-edit="text">Text auf dem Bild.</p>${button}</div></div></div>`;
      if (config.variant === 'horizontal') return `<div class="${col}"><div class="card h-100${shadow}${border}${rounded}" data-pb-edit="card"><div class="row no-gutters g-0"><div class="col-md-5">${image}</div><div class="col-md-7">${body}${footer}</div></div></div></div>`;
      return `<div class="${col}"><div class="card h-100${shadow}${border}${rounded}" data-pb-edit="card">${config.image ? image : ''}${config.header ? '<div class="card-header">Card-Kopf</div>' : ''}${body}${footer}</div></div>`;
    }).join('');
    return `<div class="container"><div class="row ${gap}">${cards}</div></div>`;
  }

  const definitions = {
    grid: {
      title: 'Grid / Spalten schnell konfigurieren',
      fields: [
        ['layout','Layout','select',[['12','12'],['6-6','6 / 6'],['4-4-4','4 / 4 / 4'],['3-3-3-3','3 / 3 / 3 / 3'],['8-4','8 / 4'],['4-8','4 / 8'],['3-9','3 / 9'],['9-3','9 / 3'],['2-8-2','2 / 8 / 2']]],
        ['tablet','Tablet-Spaltenbreite','select',[['auto','Automatisch'],['12','12'],['6','6'],['4','4'],['3','3']]],
        ['mobile','Mobil-Spaltenbreite','select',[['12','12'],['6','6']]],
        ['gap','Abstand','select',[['0','Keiner'],['1','Sehr klein'],['2','Klein'],['3','Normal'],['4','Groß'],['5','Sehr groß']]],
        ['align','Vertikale Ausrichtung','select',[['start','Oben'],['center','Mitte'],['end','Unten'],['stretch','Strecken']]],
        ['fluid','Volle Breite','checkbox']
      ],
      defaults: {layout:'4-4-4',tablet:'auto',mobile:'12',gap:'4',align:'stretch',fluid:false},
      render: gridHtml
    },
    gallery: {
      title: 'Responsive Bildergalerie konfigurieren',
      fields: [
        ['count','Anzahl Beispielbilder','number'],['desktop','Desktop: Bilder je Reihe','select',[['2','2'],['3','3'],['4','4'],['6','6']]],
        ['tablet','Tablet: Bilder je Reihe','select',[['1','1'],['2','2'],['3','3'],['4','4']]],
        ['mobile','Mobil: Bilder je Reihe','select',[['1','1'],['2','2']]],
        ['gap','Bildabstand','select',[['0','Keiner'],['1','Sehr klein'],['2','Klein'],['3','Normal'],['4','Groß'],['5','Sehr groß']]],
        ['ratio','Bildformat','select',[['auto','Original'],['1x1','Quadrat'],['4x3','4 : 3'],['16x9','16 : 9']]],
        ['rounded','Abgerundete Ecken','checkbox'],['shadow','Schatten','checkbox'],['caption','Bildunterschriften','checkbox'],['viewerMode','Klickvergrößerung','select',[['none','Keine'],['modal','Modal'],['lightbox','Lightbox']]],['counter','Bildzähler','checkbox'],['loop','Navigation zyklisch','checkbox']
      ],
      defaults: {count:6,desktop:'3',tablet:'2',mobile:'1',gap:'3',ratio:'4x3',rounded:true,shadow:false,caption:false,viewerMode:'modal',counter:true,loop:true},
      render: galleryHtml
    },
    navbar: {
      title: 'Navigation konfigurieren',
      fields: [
        ['variant','Variante','select',[['standard','Standard'],['center','Logo und Menü zentriert'],['offcanvas','Offcanvas rechts (BS5)']]],
        ['brand','Projekt-/Markenname','text'],['theme','Farbschema','select',[['light','Hell'],['dark','Dunkel'],['primary','Primärfarbe']]],
        ['position','Position','select',[['normal','Normal'],['sticky','Sticky Top'],['fixed','Fixed Top']]],
        ['logo','Logo-Platzhalter','checkbox'],['search','Suchfeld','checkbox'],['cta','CTA-Schaltfläche','checkbox']
      ],
      defaults: {variant:'standard',brand:'Meine Website',theme:'light',position:'normal',logo:true,search:false,cta:true},
      render: navbarHtml
    },
    footer: {
      title: 'Footer konfigurieren',
      fields: [
        ['variant','Variante','select',[['minimal','Minimal'],['columns','Spalten / Sitemap'],['newsletter','Newsletter']]],
        ['columns','Spalten','select',[['2','2'],['3','3'],['4','4']]],['theme','Farbschema','select',[['light','Hell'],['dark','Dunkel']]],['social','Social-Links','checkbox']
      ],
      defaults: {variant:'columns',columns:'4',theme:'dark',social:true},
      render: footerHtml
    },
    card: {
      title: 'Cards schnell konfigurieren',
      fields: [
        ['variant','Card-Variante','select',[['standard','Bild oben'],['horizontal','Bild seitlich'],['overlay','Bild-Overlay']]],
        ['count','Anzahl Cards','number'],
        ['desktop','Desktop: Cards je Reihe','select',[['1','1'],['2','2'],['3','3'],['4','4'],['6','6']]],
        ['tablet','Tablet: Cards je Reihe','select',[['1','1'],['2','2'],['3','3'],['4','4']]],
        ['mobile','Mobil: Cards je Reihe','select',[['1','1'],['2','2']]],
        ['gap','Abstand','select',[['0','0'],['1','0.25rem'],['2','0.5rem'],['3','1rem'],['4','1.5rem'],['5','3rem']]],
        ['ratio','Bildformat','select',[['classic','4:3'],['wide','16:9'],['square','1:1']]],
        ['buttonStyle','Buttonfarbe','select',[['primary','Primär'],['secondary','Sekundär'],['success','Erfolg'],['danger','Gefahr'],['warning','Warnung'],['info','Info'],['dark','Dunkel'],['light','Hell']]],
        ['buttonText','Buttontext','text'],
        ['image','Bild anzeigen','checkbox'],['header','Kopfzeile','checkbox'],['footer','Fußzeile','checkbox'],['badge','Badge','checkbox'],['button','Button','checkbox'],['shadow','Schatten','checkbox'],['border','Rahmen','checkbox'],['rounded','Abgerundete Ecken','checkbox']
      ],
      defaults: {variant:'standard',count:'3',desktop:'3',tablet:'2',mobile:'1',gap:'4',ratio:'classic',buttonStyle:'primary',buttonText:'Mehr erfahren',image:true,header:false,footer:false,badge:false,button:true,shadow:true,border:true,rounded:true},
      render: cardHtml
    }
  };

  function makeField(field, value) {
    const [name,label,type,options] = field;
    if (type === 'checkbox') return `<label class="pbq-check"><input data-pbq-field="${name}" type="checkbox" ${value ? 'checked' : ''}> ${esc(tr(label))}</label>`;
    if (type === 'select') return `<label><span>${esc(tr(label))}</span><select data-pbq-field="${name}">${options.map(([v,t]) => `<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(tr(t))}</option>`).join('')}</select></label>`;
    return `<label><span>${esc(tr(label))}</span><input data-pbq-field="${name}" type="${type}" value="${esc(value)}"></label>`;
  }

  function readForm(panel, def) {
    const result = {};
    def.fields.forEach(([name,,type]) => {
      const input = panel.querySelector(`[data-pbq-field="${name}"]`);
      result[name] = type === 'checkbox' ? input.checked : input.value;
    });
    return result;
  }

  function normalizeConfigValue(value) {
    return typeof value === 'boolean' ? value : String(value == null ? '' : value);
  }

  function onlyFieldChanged(previous, next, fieldName, defaults) {
    const keys = Object.keys(Object.assign({}, defaults || {}, previous || {}, next || {}));
    let selectedFieldChanged = false;
    for (const key of keys) {
      const before = normalizeConfigValue(previous && previous[key] != null ? previous[key] : defaults && defaults[key]);
      const after = normalizeConfigValue(next && next[key] != null ? next[key] : defaults && defaults[key]);
      if (key === fieldName) selectedFieldChanged = before !== after;
      else if (before !== after) return false;
    }
    return selectedFieldChanged;
  }

  function componentClasses(component) {
    if (!component) return [];
    if (typeof component.getClasses === 'function') return component.getClasses();
    const attrs = component.getAttributes ? component.getAttributes() : {};
    return String(attrs && attrs.class || '').split(/\s+/).filter(Boolean);
  }

  function findDescendantByClass(component, className) {
    if (!component) return null;
    if (componentClasses(component).includes(className)) return component;
    const collection = component.components && component.components();
    const children = collection && (collection.models || collection);
    if (!children || typeof children.forEach !== 'function') return null;
    let result = null;
    children.forEach((child) => {
      if (!result) result = findDescendantByClass(child, className);
    });
    return result;
  }

  function isTextNode(component) {
    if (!component) return false;
    if (typeof component.is === 'function' && component.is('textnode')) return true;
    return component.get && component.get('type') === 'textnode';
  }

  function updateNavbarBrandPreservingStructure(component, value) {
    const brand = findDescendantByClass(component, 'navbar-brand');
    if (!brand) return false;
    const collection = brand.components && brand.components();
    const children = collection && (collection.models || collection);
    let firstText = null;
    const extraTextNodes = [];
    if (children && typeof children.forEach === 'function') {
      children.forEach((child) => {
        if (!isTextNode(child)) return;
        if (!firstText) firstText = child;
        else extraTextNodes.push(child);
      });
    }
    if (firstText && typeof firstText.set === 'function') firstText.set('content', String(value || ''));
    else if (typeof brand.append === 'function') brand.append({ type: 'textnode', content: String(value || '') });
    extraTextNodes.forEach((child) => child && typeof child.remove === 'function' && child.remove());
    try { if (brand.view && typeof brand.view.render === 'function') brand.view.render(); } catch (_) {}
    return brand;
  }

  window.registerQuickSetup = function registerQuickSetup(editor, version) {
    const bs5 = version === 'bs5';
    const panel = document.createElement('aside');
    panel.id = 'pb-quick-panel';
    panel.hidden = true;
    panel.innerHTML = `<div class="pbq-head"><div><strong data-pbq-i18n="heading">${tk('quickSetup.heading')}</strong><small data-pbq-i18n="subtitle">${tk('quickSetup.subtitle')}</small></div><button type="button" data-pbq-close aria-label="${tk('common.close')}">×</button></div><div class="pbq-body"></div><div class="pbq-advanced"><strong data-pbq-i18n="advanced">${tk('quickSetup.advanced')}</strong><p data-pbq-i18n="advancedText">${tk('quickSetup.advancedText')}</p></div>`;
    document.body.appendChild(panel);
    let current = null;
    let openedConfig = null;

    function open(component) {
      component = getRoot(component);
      const type = attr(component, 'data-pb-quick', '');
      const def = definitions[type];
      if (!def) { panel.hidden = true; current = null; return; }
      current = component;
      let saved = {};
      try { saved = JSON.parse(attr(component, 'data-pb-config', '{}')); } catch (_) {}
      const cfg = Object.assign({}, def.defaults, saved);
      openedConfig = Object.assign({}, cfg);
      panel.querySelector('.pbq-body').innerHTML = `<h2>${esc(tr(def.title))}</h2><div class="pbq-fields">${def.fields.map((f) => makeField(f, cfg[f[0]])).join('')}</div><div class="pbq-actions"><button type="button" data-pbq-apply class="btn-primary">${tk('common.apply')}</button><button type="button" data-pbq-reset>${tk('common.reset')}</button></div>`;
      panel.hidden = false;
      document.dispatchEvent(new CustomEvent('pb:quick-setup-open'));
    }

    function commitOverlayDocuments() {
      const documents = [];
      const add = (candidate) => {
        if (candidate && candidate.documentElement && !documents.includes(candidate)) documents.push(candidate);
      };
      add(document);
      add(panel && panel.ownerDocument);
      try { add(window.top && window.top.document); } catch (_) {}
      try {
        const toolWindow = window.OluntirMultiMonitorManager && window.OluntirMultiMonitorManager.getToolWindow
          ? window.OluntirMultiMonitorManager.getToolWindow()
          : null;
        add(toolWindow && toolWindow.document);
      } catch (_) {}
      return documents;
    }

    function ensureCommitOverlay(targetDocument) {
      if (!targetDocument) return null;
      const host = targetDocument.body || targetDocument.documentElement;
      if (!host) return null;
      let overlay = targetDocument.getElementById('oluntir-quick-setup-commit-overlay');
      if (overlay) return overlay;
      overlay = targetDocument.createElement('div');
      overlay.id = 'oluntir-quick-setup-commit-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-busy', 'true');
      overlay.style.cssText = 'position:fixed!important;inset:0!important;z-index:2147483647!important;display:none!important;align-items:center!important;justify-content:center!important;padding:24px!important;background:rgba(8,10,14,.72)!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;pointer-events:all!important;cursor:progress!important;box-sizing:border-box!important';
      overlay.innerHTML = '<div style="width:min(440px,calc(100vw - 48px));box-sizing:border-box;padding:28px 30px;border:1px solid rgba(255,255,255,.24);border-radius:12px;background:#292c33;color:#f7f7f7;font-family:Arial,sans-serif;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.68)"><span aria-hidden="true" style="display:inline-block;width:28px;height:28px;border:3px solid rgba(255,255,255,.28);border-top-color:#fff;border-radius:50%;animation:oluntirQuickSetupSpin .8s linear infinite"></span><strong style="display:block;margin-top:14px;font:700 18px/1.3 Arial,sans-serif;color:#fff">Änderungen werden übernommen…</strong><small style="display:block;margin-top:7px;font:400 14px/1.4 Arial,sans-serif;color:#d4d8df">Bitte einen Moment warten.</small><p style="margin:14px 0 0;font:400 12px/1.5 Arial,sans-serif;color:#aeb4bf">Navigation, Footer und weitere gemeinsame Inhalte werden aktualisiert.</p></div>';
      if (!targetDocument.getElementById('oluntir-quick-setup-commit-keyframes')) {
        const style = targetDocument.createElement('style');
        style.id = 'oluntir-quick-setup-commit-keyframes';
        style.textContent = '@keyframes oluntirQuickSetupSpin{to{transform:rotate(360deg)}}';
        (targetDocument.head || host).appendChild(style);
      }
      host.appendChild(overlay);
      return overlay;
    }

    function setCommitBusy(isBusy) {
      commitOverlayDocuments().forEach((targetDocument) => {
        const overlay = ensureCommitOverlay(targetDocument);
        if (!overlay) return;
        overlay.style.setProperty('display', isBusy ? 'flex' : 'none', 'important');
        overlay.style.setProperty('visibility', isBusy ? 'visible' : 'hidden', 'important');
        overlay.style.setProperty('opacity', isBusy ? '1' : '0', 'important');
        if (isBusy) void overlay.offsetWidth;
      });
      const button = panel.querySelector('[data-pbq-apply]');
      if (button) button.disabled = Boolean(isBusy);
    }

    function waitForRenderTurn() {
      return new Promise((resolve) => {
        const schedule = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 0));
        schedule(() => schedule(resolve));
      });
    }

    async function apply(useDefaults) {
      if (!current || panel.dataset.commitBusy === 'true') return;
      panel.dataset.commitBusy = 'true';
      const startedAt = Date.now();
      setCommitBusy(true);
      await waitForRenderTurn();
      await new Promise((resolve) => window.setTimeout(resolve, 80));
      try {
        const type = attr(current, 'data-pb-quick', '');
      const def = definitions[type];
      if (!def) return;
      let saved = {};
      try { saved = JSON.parse(attr(current, 'data-pb-config', '{}')); } catch (_) {}
      const previous = Object.assign({}, def.defaults, openedConfig || saved);
      const cfg = useDefaults ? Object.assign({}, def.defaults) : readForm(panel, def);
      const updatedBrand = type === 'navbar'
        && !useDefaults
        && onlyFieldChanged(previous, cfg, 'brand', def.defaults)
        ? updateNavbarBrandPreservingStructure(current, cfg.brand)
        : null;
      const preserveNavbar = Boolean(updatedBrand);
      if (!preserveNavbar) setInner(current, def.render(cfg, bs5));
      else current.set('pbConfigured', true);
      current.addAttributes({'data-pb-config': JSON.stringify(cfg)});
      editor.select(current);

      // Quick Setup changes are model-authoritative. Commit the selected page
      // immediately to Shared Content and propagate header/navigation/footer to
      // all project pages before a page switch can restore stale Canvas markup.
      const shared = window.OluntirSharedContentManager;
      const selectedPage = editor.Pages && editor.Pages.getSelected ? editor.Pages.getSelected() : null;
      if (shared && selectedPage && preserveNavbar && typeof shared.commitSharedComponentChange === 'function') {
        shared.commitSharedComponentChange(updatedBrand, selectedPage, { propagate: true });
      } else if (shared && selectedPage && typeof shared.commitModelChange === 'function') {
        shared.commitModelChange(selectedPage, { propagate: true });
      } else if (shared && selectedPage && typeof shared.flushPage === 'function') {
        shared.flushPage(selectedPage, { propagate: true });
        if (typeof editor.store === 'function') Promise.resolve().then(() => editor.store()).catch(() => {});
      }

        if (typeof editor.store === 'function') {
          try { await Promise.resolve(editor.store()); }
          catch (storeError) { console.warn('Projektstatus konnte nach der Schnellbearbeitung nicht sofort gespeichert werden:', storeError); }
        }
        const remaining = 1200 - (Date.now() - startedAt);
        if (remaining > 0) await new Promise((resolve) => window.setTimeout(resolve, remaining));
        open(current);
      } catch (error) {
        console.warn('Schnellbearbeitung konnte nicht vollständig übernommen werden:', error);
      } finally {
        setCommitBusy(false);
        delete panel.dataset.commitBusy;
      }
    }

    panel.addEventListener('click', (event) => {
      if (event.target.closest('[data-pbq-close]')) { panel.hidden = true; return; }
      if (event.target.closest('[data-pbq-apply]')) apply(false);
      if (event.target.closest('[data-pbq-reset]')) apply(true);
    });

    document.addEventListener('pb:quick-edit-open', () => { panel.hidden = true; });
    editor.on('component:selected', open);
    editor.on('block:drag:stop', (component) => {
      const root = getRoot(component);
      if (!attr(root, 'data-pb-quick', '')) return;
      setTimeout(() => { editor.select(root); open(root); }, 50);
    });
    editor.on('component:remove', (component) => { if (component === current) { current = null; panel.hidden = true; } });

    editor.Commands.add('pb-open-quick-setup', { run() { const selected = editor.getSelected(); if (selected) open(selected); } });
    editor.Panels.addButton('options', { id:'pb-quick-setup', className:'fa fa-sliders', command:'pb-open-quick-setup', attributes:{title:tk('tool.quickSetup'),'aria-label':tk('tool.quickSetup')} });
    window.addEventListener('oluntir:languagechange', () => {
      const button = editor.Panels.getButton('options','pb-quick-setup');
      if (button) button.set('attributes', Object.assign({}, button.get('attributes'), {title:tk('tool.quickSetup'),'aria-label':tk('tool.quickSetup')}));
      if (!panel.hidden && current) open(current);
    });
  };
})();

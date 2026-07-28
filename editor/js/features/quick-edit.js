(function () {
  'use strict';
  const tr = (value) => window.OluntirI18N ? window.OluntirI18N.translateText(value) : value;
  const tk = (key) => window.OluntirI18N ? window.OluntirI18N.t(key) : key;

  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  const BOOTSTRAP_COLORS = ['primary','secondary','success','danger','warning','info','light','dark'];
  const FONT_SIZES = [
    ['0.75rem','Sehr klein · 0,75rem'],['0.875rem','Klein · 0,875rem'],['1rem','Normal · 1rem'],
    ['1.125rem','Etwas größer · 1,125rem'],['1.25rem','Groß · 1,25rem'],['1.5rem','Sehr groß · 1,5rem'],
    ['2rem','Überschrift · 2rem'],['3rem','Display · 3rem']
  ];

  function attrs(component) { return component && component.getAttributes ? component.getAttributes() : {}; }
  function classes(component) { return component && component.getClasses ? component.getClasses() : []; }
  function tag(component) { return String(component && component.get ? component.get('tagName') || '' : '').toLowerCase(); }
  function hasClass(component, className) { return classes(component).indexOf(className) !== -1; }
  function getText(component) {
    const el = component && component.getEl ? component.getEl() : null;
    if (el) return (el.textContent || '').trim();
    return String(component && component.get ? component.get('content') || '' : '');
  }
  function style(component, name, fallback) {
    const all = component && component.getStyle ? component.getStyle() : {};
    return all && all[name] != null ? all[name] : fallback;
  }
  function classify(component) {
    if (!component) return null;
    const explicit = attrs(component)['data-pb-edit'];
    if (explicit) return explicit;
    const t = tag(component);
    if ((t === 'a' || t === 'button') && hasClass(component, 'btn')) return 'button';
    if (/^h[1-6]$/.test(t)) return 'heading';
    if (t === 'p' || t === 'span' || t === 'small') return 'text';
    if (t === 'img') return 'image';
    if (hasClass(component, 'card')) return 'card';
    return null;
  }
  function bootstrapColor(component, prefix, fallback) {
    const found = classes(component).find((name) => name.indexOf(prefix) === 0);
    return found ? found.slice(prefix.length) : fallback;
  }
  function replaceClassGroup(component, matcher, value) {
    const next = classes(component).filter((name) => !matcher(name));
    if (value) next.push(value);
    component.setClass(next);
  }
  function setText(component, value) { component.components(esc(value)); }
  function formValue(panel, name) {
    const el = panel.querySelector(`[data-pbe-field="${name}"]`);
    if (!el) return '';
    return el.type === 'checkbox' ? el.checked : el.value;
  }
  function field(name, label, type, value, options, help) {
    let control = '';
    if (type === 'select') {
      control = `<select data-pbe-field="${name}">${options.map(([v,l]) => `<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
    } else if (type === 'checkbox') {
      return `<label class="pbe-check"><input data-pbe-field="${name}" type="checkbox" ${value ? 'checked' : ''}> <span>${esc(tr(label))}</span></label>`;
    } else if (type === 'color') {
      control = `<div class="pbe-color-row"><input data-pbe-field="${name}" type="color" value="${esc(value || '#000000')}"><input data-pbe-field="${name}Text" type="text" value="${esc(value || '#000000')}" placeholder="#000000"></div>`;
    } else if (type === 'textarea') {
      control = `<textarea data-pbe-field="${name}" rows="3">${esc(value)}</textarea>`;
    } else {
      control = `<input data-pbe-field="${name}" type="${type}" value="${esc(value)}">`;
    }
    return `<label class="pbe-field"><span>${esc(tr(label))}</span>${control}${help ? `<small>${esc(help)}</small>` : ''}</label>`;
  }

  function buttonForm(component) {
    const a = attrs(component);
    return {
      title: 'Button · Schnellbearbeitung',
      hint: 'Inhalt, Link und sichtbare Gestaltung',
      html: [
        '<section><h3>Inhalt</h3>',
        field('text','Beschriftung','text',getText(component)),
        field('href','Linkziel','text',a.href || '#'),
        field('target','Link öffnen','select',a.target || '_self',[['_self','Im selben Fenster'],['_blank','In neuem Fenster']]),
        '</section><section><h3>Darstellung</h3>',
        field('variant','Bootstrap-Farbe','select',bootstrapColor(component,'btn-','primary'),BOOTSTRAP_COLORS.map(c=>[c,c.charAt(0).toUpperCase()+c.slice(1)]).concat([['link','Link']])),
        field('outline','Outline statt Fläche','checkbox',classes(component).some(c=>c.indexOf('btn-outline-')===0)),
        field('fontFamily','Schriftart','select',style(component,'font-family',''),[['','Projektstandard (Inter)'],['Inter','Inter'],['Arial, sans-serif','Arial'],['Georgia, serif','Georgia']]),
        field('fontSize','Schriftgröße','select',style(component,'font-size','1rem'),FONT_SIZES.concat([['custom','Eigener Wert']])),
        field('fontSizeCustom','Eigene Schriftgröße','text',style(component,'font-size','1rem'),null,'Zum Beispiel 1.5em, 18px oder 1.25rem'),
        field('fontWeight','Schriftstärke','select',style(component,'font-weight','400'),[['300','Leicht · 300'],['400','Normal · 400'],['500','Mittel · 500'],['600','Halbfett · 600'],['700','Fett · 700']]),
        field('radius','Eckenradius','text',style(component,'border-radius',''),null,'Zum Beispiel 0.25rem, 8px oder 50px'),
        field('customColors','Eigene Farben statt Bootstrap-Farbe verwenden','checkbox',Boolean(style(component,'background-color','') || style(component,'color',''))),
        field('customColor','Eigene Hintergrundfarbe','color',style(component,'background-color','#0d6efd')),
        field('customTextColor','Eigene Textfarbe','color',style(component,'color','#ffffff')),
        '</section><section><h3>Größe</h3>',
        field('size','Bootstrap-Größe','select',hasClass(component,'btn-lg')?'lg':hasClass(component,'btn-sm')?'sm':'normal',[['sm','Klein'],['normal','Normal'],['lg','Groß']]),
        field('full','Volle Breite','checkbox',hasClass(component,'w-100') || hasClass(component,'btn-block')),
        '</section>'
      ].join(''),
      apply(panel) {
        setText(component, formValue(panel,'text'));
        component.addAttributes({href: formValue(panel,'href') || '#', target: formValue(panel,'target') || '_self'});
        const variant = formValue(panel,'variant') || 'primary';
        const outline = formValue(panel,'outline');
        replaceClassGroup(component, c => /^btn-(outline-)?(primary|secondary|success|danger|warning|info|light|dark|link)$/.test(c), variant === 'link' ? 'btn-link' : `btn-${outline ? 'outline-' : ''}${variant}`);
        replaceClassGroup(component, c => c === 'btn-sm' || c === 'btn-lg', formValue(panel,'size') === 'normal' ? '' : `btn-${formValue(panel,'size')}`);
        const fullClass = window.PAGEBUILDER_FRAMEWORK && window.PAGEBUILDER_FRAMEWORK.id === 'bs4' ? 'btn-block' : 'w-100';
        replaceClassGroup(component, c => c === 'btn-block' || c === 'w-100', formValue(panel,'full') ? fullClass : '');
        const chosenSize = formValue(panel,'fontSize') === 'custom' ? formValue(panel,'fontSizeCustom') : formValue(panel,'fontSize');
        component.addStyle({
          'font-family': formValue(panel,'fontFamily') || '',
          'font-size': chosenSize || '',
          'font-weight': formValue(panel,'fontWeight') || '',
          'border-radius': formValue(panel,'radius') || '',
          'background-color': formValue(panel,'customColors') ? (formValue(panel,'customColorText') || formValue(panel,'customColor') || '') : '',
          'color': formValue(panel,'customColors') ? (formValue(panel,'customTextColorText') || formValue(panel,'customTextColor') || '') : ''
        });
      }
    };
  }

  function textForm(component, isHeading) {
    return {
      title: `${isHeading ? 'Überschrift' : 'Text'} · Schnellbearbeitung`,
      hint: 'Typografie ohne technische Nebenoptionen',
      html: [
        '<section><h3>Inhalt</h3>',field('text','Text','textarea',getText(component)),'</section>',
        '<section><h3>Typografie</h3>',
        field('fontFamily','Schriftart','select',style(component,'font-family',''),[['','Projektstandard (Inter)'],['Inter','Inter'],['Arial, sans-serif','Arial'],['Georgia, serif','Georgia']]),
        field('fontSize','Schriftgröße','select',style(component,'font-size',isHeading?'2rem':'1rem'),FONT_SIZES.concat([['custom','Eigener Wert']])),
        field('fontSizeCustom','Eigene Schriftgröße','text',style(component,'font-size',isHeading?'2rem':'1rem'),null,'Zum Beispiel 1.5em, 24px oder 2rem'),
        field('fontWeight','Schriftstärke','select',style(component,'font-weight',isHeading?'700':'400'),[['300','Leicht · 300'],['400','Normal · 400'],['500','Mittel · 500'],['600','Halbfett · 600'],['700','Fett · 700'],['800','Extra fett · 800']]),
        field('lineHeight','Zeilenhöhe','text',style(component,'line-height','1.5'),null,'Zum Beispiel 1.5, 1.8 oder 2em'),
        field('letterSpacing','Zeichenabstand','text',style(component,'letter-spacing',''),null,'Zum Beispiel 0.02em oder 1px'),
        field('align','Ausrichtung','select',style(component,'text-align','left'),[['left','Links'],['center','Zentriert'],['right','Rechts'],['justify','Blocksatz']]),
        field('color','Textfarbe','color',style(component,'color','#212529')),
        '</section>'
      ].join(''),
      apply(panel) {
        setText(component, formValue(panel,'text'));
        const chosenSize = formValue(panel,'fontSize') === 'custom' ? formValue(panel,'fontSizeCustom') : formValue(panel,'fontSize');
        component.addStyle({
          'font-family': formValue(panel,'fontFamily') || '', 'font-size': chosenSize || '',
          'font-weight': formValue(panel,'fontWeight') || '', 'line-height': formValue(panel,'lineHeight') || '',
          'letter-spacing': formValue(panel,'letterSpacing') || '', 'text-align': formValue(panel,'align') || '',
          'color': formValue(panel,'colorText') || formValue(panel,'color') || ''
        });
      }
    };
  }

  function imageForm(component) {
    const a=attrs(component);
    return {
      title:'Bild · Schnellbearbeitung', hint:'Bildquelle, Beschreibung und sichtbare Form',
      html:[
        '<section><h3>Bild</h3>',field('src','Bildquelle','text',a.src || ''),field('alt','Alternativtext','text',a.alt || ''),field('title','Titel','text',a.title || ''),'</section>',
        '<section><h3>Darstellung</h3>',field('width','Breite','text',style(component,'width','100%'),null,'Zum Beispiel 100%, 480px oder 30rem'),field('height','Höhe','text',style(component,'height','auto')),field('fit','Bildanpassung','select',style(component,'object-fit','cover'),[['cover','Ausfüllen'],['contain','Einpassen'],['fill','Strecken'],['none','Original']]),field('radius','Eckenradius','text',style(component,'border-radius',''),null,'Zum Beispiel 0.5rem, 12px oder 50%'),field('shadow','Schatten','checkbox',hasClass(component,'shadow')||hasClass(component,'shadow-sm')),'</section>'
      ].join(''),
      apply(panel){
        component.addAttributes({src:formValue(panel,'src'),alt:formValue(panel,'alt'),title:formValue(panel,'title')});
        component.addStyle({'width':formValue(panel,'width')||'','height':formValue(panel,'height')||'','object-fit':formValue(panel,'fit')||'','border-radius':formValue(panel,'radius')||''});
        replaceClassGroup(component,c=>c==='shadow'||c==='shadow-sm',formValue(panel,'shadow')?'shadow-sm':'');
      }
    };
  }

  function cardForm(component) {
    return {
      title:'Card · Schnellbearbeitung', hint:'Oberfläche der ausgewählten Card',
      html:[
        '<section><h3>Darstellung</h3>',field('background','Hintergrundfarbe','color',style(component,'background-color','#ffffff')),field('color','Textfarbe','color',style(component,'color','#212529')),field('borderColor','Rahmenfarbe','color',style(component,'border-color','#dee2e6')),field('radius','Eckenradius','text',style(component,'border-radius','0.375rem'),null,'Zum Beispiel 0.375rem, 12px oder 0'),field('shadow','Schatten','select',hasClass(component,'shadow')?'shadow':hasClass(component,'shadow-sm')?'shadow-sm':'none',[['none','Keiner'],['shadow-sm','Leicht'],['shadow','Normal']]),'</section>'
      ].join(''),
      apply(panel){
        component.addStyle({'background-color':formValue(panel,'backgroundText')||formValue(panel,'background'),'color':formValue(panel,'colorText')||formValue(panel,'color'),'border-color':formValue(panel,'borderColorText')||formValue(panel,'borderColor'),'border-radius':formValue(panel,'radius')||''});
        replaceClassGroup(component,c=>c==='shadow'||c==='shadow-sm',formValue(panel,'shadow')==='none'?'':formValue(panel,'shadow'));
      }
    };
  }

  window.registerQuickEditing = function registerQuickEditing(editor) {
    const panel = document.createElement('aside');
    panel.id = 'pb-quick-edit';
    panel.hidden = true;
    panel.innerHTML = `<div class="pbe-head"><div><strong>${tk('quickEdit.heading')}</strong><small>${tk('quickEdit.subtitle')}</small></div><button type="button" data-pbe-close aria-label="${tk('common.close')}">×</button></div><div class="pbe-body"></div><div class="pbe-foot"><button type="button" data-pbe-apply class="pbe-primary">${tk('common.apply')}</button><button type="button" data-pbe-advanced>${tk('quickEdit.advanced')}</button></div>`;
    document.body.appendChild(panel);
    let current = null;
    let definition = null;

    function build(component) {
      const kind = classify(component);
      if (kind === 'button') return buttonForm(component);
      if (kind === 'heading') return textForm(component,true);
      if (kind === 'text') return textForm(component,false);
      if (kind === 'image') return imageForm(component);
      if (kind === 'card') return cardForm(component);
      return null;
    }
    function open(component) {
      const def = build(component);
      if (!def) { panel.hidden = true; current = null; definition = null; return; }
      current = component; definition = def;
      panel.querySelector('.pbe-body').innerHTML = `<h2>${esc(tr(def.title))}</h2><p class="pbe-hint">${esc(tr(def.hint))}</p>${window.OluntirI18N ? window.OluntirI18N.translateHtml(def.html) : def.html}`;
      panel.hidden = false;
      document.dispatchEvent(new CustomEvent('pb:quick-edit-open'));
    }
    function apply() {
      if (!current || !definition) return;
      definition.apply(panel);
      editor.select(current);
      if (window.toast) window.toast(tk('quickEdit.applied'));
      open(current);
    }
    panel.addEventListener('input', event => {
      if (event.target.matches('input[type="color"]')) {
        const text = panel.querySelector(`[data-pbe-field="${event.target.dataset.pbeField}Text"]`);
        if (text) text.value = event.target.value;
      }
    });
    panel.addEventListener('click', event => {
      if (event.target.closest('[data-pbe-close]')) panel.hidden = true;
      if (event.target.closest('[data-pbe-apply]')) apply();
      if (event.target.closest('[data-pbe-advanced]')) {
        panel.hidden = true;
        try { editor.Panels.getButton('views','open-sm').set('active',true); } catch (_) {}
      }
    });
    document.addEventListener('pb:quick-setup-open', () => { panel.hidden = true; });
    editor.on('component:selected', component => setTimeout(() => open(component), 20));
    editor.on('component:remove', component => { if (component === current) panel.hidden = true; });
    editor.Commands.add('pb-open-quick-edit', {run(){ const selected=editor.getSelected(); if(selected) open(selected); }});
    editor.Panels.addButton('options',{id:'pb-quick-edit-button',className:'fa fa-magic',command:'pb-open-quick-edit',attributes:{title:tk('tool.quickEdit'),'aria-label':tk('tool.quickEdit')}});
    window.addEventListener('oluntir:languagechange', () => {
      const button=editor.Panels.getButton('options','pb-quick-edit-button');
      if(button) button.set('attributes',Object.assign({},button.get('attributes'),{title:tk('tool.quickEdit'),'aria-label':tk('tool.quickEdit')}));
      panel.querySelector('.pbe-head strong').textContent=tk('quickEdit.heading');
      panel.querySelector('.pbe-head small').textContent=tk('quickEdit.subtitle');
      panel.querySelector('[data-pbe-apply]').textContent=tk('common.apply');
      panel.querySelector('[data-pbe-advanced]').textContent=tk('quickEdit.advanced');
      if(!panel.hidden && current) open(current);
    });
  };
})();

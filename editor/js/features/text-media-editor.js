// Erweiterte Textbearbeitung für GrapesJS:
// - Bilder direkt an der Cursorposition in editierbare Textbereiche einsetzen
// - Bootstrap-4-konforme Textausrichtung für den gesamten Textblock
// - Ausrichtung des/der von einer Textmarkierung betroffenen Absatzes/Absätze
(function () {
  'use strict';

  const ALIGN_CLASSES = ['text-left', 'text-center', 'text-right', 'text-justify'];
  const BLOCK_SELECTOR = 'p,h1,h2,h3,h4,h5,h6,div,li,blockquote,figcaption,td,th';

  function getComponentFromElement(editor, element) {
    if (!element) return null;
    try {
      const dc = editor.getModel().get('DomComponents');
      if (dc && typeof dc.getComponent === 'function') return dc.getComponent(element);
    } catch (error) {
      console.warn('Textkomponente konnte nicht ermittelt werden:', error);
    }
    return null;
  }

  function normalizeClassList(component, alignmentClass) {
    if (!component) return;
    ALIGN_CLASSES.forEach((name) => {
      if (typeof component.removeClass === 'function') component.removeClass(name);
    });
    if (typeof component.addClass === 'function') component.addClass(alignmentClass);
  }

  function isTextLike(component) {
    if (!component || !component.get) return false;
    const type = String(component.get('type') || '').toLowerCase();
    const tag = String(component.get('tagName') || '').toLowerCase();
    return type === 'text' || /^(p|h[1-6]|li|blockquote|figcaption|td|th)$/.test(tag);
  }

  function applyGlobalAlignment(editor, component, alignmentClass) {
    if (!component) return;
    normalizeClassList(component, alignmentClass);
    editor.select(component);
    editor.trigger('component:update', component);
    if (window.toast) window.toast('Textbereich wurde mit Bootstrap ausgerichtet.');
  }

  function nearestBlock(element, root) {
    let current = element && element.nodeType === 3 ? element.parentElement : element;
    while (current && current !== root) {
      if (current.matches && current.matches(BLOCK_SELECTOR)) return current;
      current = current.parentElement;
    }
    if (root && root.matches && root.matches(BLOCK_SELECTOR)) return root;
    return root || null;
  }

  function selectedBlocks(range, root) {
    const blocks = [];
    const add = (element) => {
      if (element && !blocks.includes(element)) blocks.push(element);
    };

    add(nearestBlock(range.startContainer, root));
    add(nearestBlock(range.endContainer, root));

    if (root && root.querySelectorAll && typeof range.intersectsNode === 'function') {
      root.querySelectorAll(BLOCK_SELECTOR).forEach((element) => {
        try {
          if (range.intersectsNode(element)) add(element);
        } catch (error) {
          /* Nicht alle Browser erlauben intersectsNode für jeden Knotentyp. */
        }
      });
    }
    return blocks.filter(Boolean);
  }

  function applySelectionAlignment(editor, rte, alignmentClass) {
    const doc = editor.Canvas.getDocument();
    const win = editor.Canvas.getWindow();
    const selection = win && win.getSelection ? win.getSelection() : null;
    const root = rte && rte.el ? rte.el : null;

    if (!selection || !selection.rangeCount || !root) {
      applyGlobalAlignment(editor, editor.getSelected(), alignmentClass);
      return;
    }

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      applyGlobalAlignment(editor, editor.getSelected(), alignmentClass);
      return;
    }

    const blocks = selectedBlocks(range, root);
    if (!blocks.length) {
      applyGlobalAlignment(editor, editor.getSelected(), alignmentClass);
      return;
    }

    blocks.forEach((element) => {
      const component = getComponentFromElement(editor, element);
      if (component) {
        normalizeClassList(component, alignmentClass);
      } else {
        ALIGN_CLASSES.forEach((name) => element.classList.remove(name));
        element.classList.add(alignmentClass);
      }
    });

    root.dispatchEvent(new doc.defaultView.Event('input', { bubbles: true }));
    if (rte && typeof rte.sync === 'function') rte.sync();
    if (window.toast) window.toast('Markierter Absatz wurde mit Bootstrap ausgerichtet.');
  }

  function assetSource(asset) {
    if (!asset) return '';
    if (typeof asset.getSrc === 'function') return asset.getSrc() || '';
    if (asset.get) return asset.get('src') || '';
    return '';
  }

  function escapeAttribute(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function stableImageAttributes(src) {
    const attrs = {
      src,
      alt: (src.split('/').pop() || 'Bild').replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      class: 'img-fluid my-2',
      loading: 'lazy',
      'data-pb-inline-image': 'true',
    };
    if (src.indexOf('images/') === 0 || src.indexOf('assets/user_upload/') === 0) {
      attrs['data-stable-path'] = src;
    }
    return attrs;
  }

  function attributesToHtml(attributes) {
    return Object.keys(attributes)
      .map((name) => name + '="' + escapeAttribute(attributes[name]) + '"')
      .join(' ');
  }

  function syncEditableRoot(editor, rte, editableRoot, component) {
    if (!editableRoot) return;

    // WICHTIG: Den Inhalt NICHT mit component.components(innerHTML) neu aufbauen.
    // Das würde GrapesJS-Unterkomponenten, Bootstrap-Klassen und die umgebende
    // Template-Struktur neu parsen und kann dadurch das ursprüngliche Design verlieren.
    // Stattdessen ausschließlich GrapesJS' normalen Rich-Text-Synchronisationsweg nutzen.
    const win = editor.Canvas.getWindow();
    editableRoot.dispatchEvent(new win.InputEvent('input', {
      bubbles: true,
      inputType: 'insertHTML',
      data: null,
    }));
    editableRoot.dispatchEvent(new win.Event('change', { bubbles: true }));

    if (rte && typeof rte.sync === 'function') {
      try { rte.sync(); } catch (error) { console.warn('RTE-Synchronisation fehlgeschlagen:', error); }
    }

    if (component) {
      // Nur den INNEREN Inhalt der exakt zum contenteditable-Element gehörenden
      // Textkomponente aktualisieren. `component.set('content', ...)` darf hier nicht
      // verwendet werden: Bei GrapesJS kann das den kompletten Textbaustein durch einen
      // Rohinhalt ersetzen und damit den Block aus seiner Bootstrap-Struktur lösen.
      //
      // `components(innerHTML)` parst ausschließlich die Kinder des bestehenden
      // Elements neu. Tag, Klassen, Attribute, Spalte und umgebendes Layout bleiben
      // dadurch erhalten.
      try {
        const exactComponent = getComponentFromElement(editor, editableRoot) || component;
        const view = exactComponent && typeof exactComponent.getView === 'function'
          ? exactComponent.getView()
          : null;
        const isExactRoot = !view || !view.el || view.el === editableRoot;

        if (exactComponent && isExactRoot && typeof exactComponent.components === 'function') {
          exactComponent.components(editableRoot.innerHTML);
          component = exactComponent;
        } else {
          console.warn('Inline-Bild wurde nicht gespeichert: Textkomponente und Editorwurzel stimmen nicht überein.');
        }
      } catch (error) {
        console.warn('Textinhalt konnte nicht im GrapesJS-Modell gespeichert werden:', error);
      }

      editor.select(component);
      editor.trigger('component:update', component);
      if (typeof window.OluntirPersistProjectSoon === 'function') {
        window.OluntirPersistProjectSoon(100);
      }
    }

    setTimeout(() => {
      try {
        const doc = editor.Canvas.getDocument();
        if (typeof window.patchUploadedImageRefs === 'function') {
          window.patchUploadedImageRefs(doc);
        } else if (typeof patchUploadedImageRefs === 'function') {
          patchUploadedImageRefs(doc);
        }
      } catch (error) { /* reine Vorschaukorrektur */ }
    }, 0);
  }

  function openImageAssetManager(editor, options) {
    const editableRoot = options.editableRoot || null;
    const component = options.component || null;
    const rte = options.rte || null;
    const marker = options.marker || null;
    const replaceImage = options.replaceImage || null;
    let completed = false;

    const cleanupMarker = () => {
      if (!completed && marker && marker.parentNode) marker.parentNode.removeChild(marker);
    };

    // Bei Abbruch darf kein unsichtbarer Cursor-Marker im Text verbleiben.
    if (typeof editor.once === 'function') editor.once('asset:close', cleanupMarker);

    const handleSelectedAsset = (asset, complete) => {
      if (completed) return;
      const src = assetSource(asset);
      if (!src) return;
      completed = true;

      const attrs = stableImageAttributes(src);

      if (replaceImage) {
        Object.keys(attrs).forEach((name) => replaceImage.setAttribute(name, attrs[name]));
        if (!Object.prototype.hasOwnProperty.call(attrs, 'data-stable-path')) {
          replaceImage.removeAttribute('data-stable-path');
        }
      } else if (marker && marker.parentNode) {
        const image = editor.Canvas.getDocument().createElement('img');
        Object.keys(attrs).forEach((name) => image.setAttribute(name, attrs[name]));
        marker.parentNode.replaceChild(image, marker);
      } else if (editableRoot) {
        editableRoot.insertAdjacentHTML('beforeend', '<img ' + attributesToHtml(attrs) + '>');
      }

      syncEditableRoot(editor, rte, editableRoot, component);
      if (complete !== false) editor.AssetManager.close();
      if (window.toast) window.toast(replaceImage ? 'Bild wurde ausgetauscht.' : 'Bild wurde in den Textbereich eingefügt.');
    };

    // Bei dieser GrapesJS-Version wird je nach Bedienweg entweder der Callback des
    // open-assets-Kommandos oder das globale asset:select-Ereignis ausgelöst. Beide
    // Wege zeigen deshalb auf dieselbe, gegen Doppelausführung geschützte Funktion.
    if (typeof editor.once === 'function') editor.once('asset:select', handleSelectedAsset);

    editor.runCommand('open-assets', {
      types: ['image'],
      select: handleSelectedAsset,
    });
  }

  function insertImageAtSelection(editor, rte) {
    const win = editor.Canvas.getWindow();
    const doc = editor.Canvas.getDocument();
    const selection = win && win.getSelection ? win.getSelection() : null;
    const editableRoot = rte && rte.el ? rte.el : null;
    const selected = editor.getSelected();
    const mapped = getComponentFromElement(editor, editableRoot);
    // Der aktuell ausgewählte Textbaustein ist zuverlässiger als ein übergeordnetes
    // Element, das über das Canvas-DOM ermittelt wurde.
    const component = isTextLike(selected) ? selected : (mapped || selected);

    if (!editableRoot) {
      if (window.toast) window.toast('Bitte zuerst einen Textbereich bearbeiten.');
      return;
    }

    // Der Marker bleibt im Canvas bestehen, auch wenn der Asset-Manager den Fokus übernimmt.
    // Dadurch ist die Einfügeposition unabhängig vom Browser-Selection-Objekt zuverlässig.
    const marker = doc.createElement('span');
    marker.setAttribute('data-pb-image-insert-marker', 'true');
    marker.style.display = 'none';

    if (selection && selection.rangeCount) {
      const range = selection.getRangeAt(0);
      if (editableRoot.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(marker);
      } else {
        editableRoot.appendChild(marker);
      }
    } else {
      editableRoot.appendChild(marker);
    }

    openImageAssetManager(editor, { editableRoot, component, rte, marker });
  }

  function findTextRootForImage(editor, image) {
    let element = image ? image.parentElement : null;
    while (element) {
      const component = getComponentFromElement(editor, element);
      if (component && isTextLike(component)) return { element, component };
      element = element.parentElement;
    }
    return null;
  }

  function bindInlineImageDoubleClick(editor) {
    const doc = editor.Canvas.getDocument();
    if (!doc || doc.__pageBuilderInlineImageBound) return;
    doc.__pageBuilderInlineImageBound = true;

    doc.addEventListener('dblclick', (event) => {
      const image = event.target && event.target.closest ? event.target.closest('img') : null;
      if (!image) return;

      // Galerie- und Lightbox-Bilder werden weiterhin von der speziellen Linklogik behandelt.
      if (image.closest('a.portfolio-img')) return;

      // Funktioniert sowohl während aktiver Texteingabe als auch bei einem normalen
      // Doppelklick auf ein bereits im Textbereich vorhandenes Bild.
      const activeRoot = image.closest('[contenteditable="true"]');
      const located = activeRoot
        ? { element: activeRoot, component: getComponentFromElement(editor, activeRoot) || editor.getSelected() }
        : findTextRootForImage(editor, image);
      if (!located || !located.element || !located.component) return;

      event.preventDefault();
      event.stopPropagation();

      editor.select(located.component);
      openImageAssetManager(editor, {
        editableRoot: located.element,
        component: located.component,
        replaceImage: image,
      });
    }, true);
  }

  function alignmentAction(editor, id, icon, title, alignmentClass) {
    editor.RichTextEditor.add(id, {
      icon: '<i class="fa ' + icon + '"></i>',
      attributes: { title },
      result(rte) {
        applySelectionAlignment(editor, rte, alignmentClass);
      },
    });
  }

  function alignmentToolbar(component, currentToolbar, editor) {
    const existing = Array.isArray(currentToolbar) ? currentToolbar.slice() : [];
    const filtered = existing.filter((item) => !(item && item.attributes && item.attributes['data-pb-align']));
    const buttons = [
      ['text-left', 'fa-align-left', 'Linksbündig'],
      ['text-center', 'fa-align-center', 'Zentriert'],
      ['text-justify', 'fa-align-justify', 'Blocksatz'],
      ['text-right', 'fa-align-right', 'Rechtsbündig'],
    ].map(([className, icon, title]) => ({
      attributes: {
        class: 'fa ' + icon,
        title: title + ' (gesamter Textbereich)',
        'data-pb-align': className,
      },
      command() {
        applyGlobalAlignment(editor, component, className);
      },
    }));
    return buttons.concat(filtered);
  }

  function ensureLocalUploadButton(editor) {
    const modalContent = document.querySelector('.gjs-mdl-content');
    if (!modalContent || modalContent.querySelector('[data-pb-local-upload]')) return;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-pb-local-upload', 'true');
    wrapper.style.cssText = 'padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.15);text-align:right;';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gjs-btn-prim';
    button.textContent = 'Bild vom Computer hochladen';
    button.style.cssText = 'padding:8px 14px;cursor:pointer;';
    button.addEventListener('click', function () {
      const input = document.getElementById('input-asset-upload');
      if (!input) {
        alert('Der lokale Bild-Upload ist nicht verfügbar.');
        return;
      }
      input.click();
    });

    wrapper.appendChild(button);
    modalContent.insertBefore(wrapper, modalContent.firstChild);
  }

  window.registerTextMediaEditing = function registerTextMediaEditing(editor) {
    alignmentAction(editor, 'pb-align-left', 'fa-align-left', 'Linksbündig (Bootstrap)', 'text-left');
    alignmentAction(editor, 'pb-align-center', 'fa-align-center', 'Zentriert (Bootstrap)', 'text-center');
    alignmentAction(editor, 'pb-align-justify', 'fa-align-justify', 'Blocksatz (Bootstrap)', 'text-justify');
    alignmentAction(editor, 'pb-align-right', 'fa-align-right', 'Rechtsbündig (Bootstrap)', 'text-right');

    editor.RichTextEditor.add('pb-insert-image', {
      icon: '<i class="fa fa-image"></i>',
      attributes: { title: 'Bild an Cursorposition einfügen' },
      result(rte) {
        insertImageAtSelection(editor, rte);
      },
    });

    editor.on('component:selected', (component) => {
      if (!isTextLike(component)) return;
      const current = component.get('toolbar') || [];
      component.set('toolbar', alignmentToolbar(component, current, editor));
    });

    editor.on('load', () => bindInlineImageDoubleClick(editor));
    editor.on('page', () => setTimeout(() => bindInlineImageDoubleClick(editor), 0));
    editor.on('asset:open', () => setTimeout(() => ensureLocalUploadButton(editor), 0));
  };
})();

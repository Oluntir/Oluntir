// Responsive Bildergalerien: Desktop 1920/90, Tablet 1600/88, Mobil 1200/85.
// Das Original bleibt unverändert unter assets/user_upload/original/ erhalten.
const GALLERY_MAX_TOTAL_MB = 300;
const GALLERY_VIEWER_STORAGE_KEY = 'oluntir-gallery-viewer-options-v1';

function getStoredGalleryViewerOptions() {
  const defaults = { mode: 'modal', caption: true, download: true, counter: true, loop: true };
  try {
    const stored = JSON.parse(localStorage.getItem(GALLERY_VIEWER_STORAGE_KEY) || '{}');
    const result = Object.assign(defaults, stored || {});
    if (!['modal', 'lightbox'].includes(result.mode)) result.mode = 'modal';
    return result;
  } catch (_) {
    return defaults;
  }
}

function chooseGalleryViewerOptions() {
  const saved = getStoredGalleryViewerOptions();
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'pb-modal-overlay pb-gallery-options-overlay';
    overlay.setAttribute('role', 'presentation');
    overlay.innerHTML = `
      <div class="pb-modal pb-gallery-options-modal" role="dialog" aria-modal="true" aria-labelledby="pb-gallery-options-title">
        <h2 id="pb-gallery-options-title">Galerie erstellen</h2>
        <p>Wähle die Vergrößerungsart und die sichtbaren Bildfunktionen.</p>
        <fieldset class="pb-gallery-options-field">
          <legend>Vergrößerung</legend>
          <label class="pb-modal-check"><input type="radio" name="pb-gallery-viewer-mode" value="modal" data-gallery-option="mode"> Modal</label>
          <label class="pb-modal-check"><input type="radio" name="pb-gallery-viewer-mode" value="lightbox" data-gallery-option="mode"> Lightbox</label>
        </fieldset>
        <label class="pb-modal-check"><input type="checkbox" data-gallery-option="caption"> Bildbezeichnung anzeigen</label>
        <label class="pb-modal-check"><input type="checkbox" data-gallery-option="download"> Download ermöglichen</label>
        <p class="pb-gallery-options-note">Anschließend öffnet sich die Windows-Dateiauswahl. Dort können mehrere Bilder gleichzeitig ausgewählt werden.</p>
        <div class="pb-modal-actions">
          <button type="button" class="btn btn-secondary" data-gallery-cancel>Abbrechen</button>
          <button type="button" class="btn btn-primary" data-gallery-confirm>Bilder auswählen…</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    const modal = overlay.querySelector('.pb-gallery-options-modal');
    const modes = Array.from(overlay.querySelectorAll('[data-gallery-option="mode"]'));
    const caption = overlay.querySelector('[data-gallery-option="caption"]');
    const download = overlay.querySelector('[data-gallery-option="download"]');
    const selectedMode = modes.find(input => input.value === saved.mode) || modes[0];
    if (selectedMode) selectedMode.checked = true;
    caption.checked = saved.caption !== false;
    download.checked = saved.download !== false;

    let finished = false;
    const finish = (value) => {
      if (finished) return;
      finished = true;
      document.removeEventListener('keydown', onKeyDown, true);
      overlay.remove();
      resolve(value);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish(null);
      }
      if (event.key === 'Tab') {
        const focusable = Array.from(modal.querySelectorAll('button, input:not(:disabled)'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) finish(null); });
    overlay.querySelector('[data-gallery-cancel]').addEventListener('click', () => finish(null));
    overlay.querySelector('[data-gallery-confirm]').addEventListener('click', () => {
      const checkedMode = modes.find(input => input.checked);
      const options = {
        mode: checkedMode ? checkedMode.value : 'modal',
        caption: caption.checked,
        download: download.checked,
        counter: true,
        loop: true
      };
      localStorage.setItem(GALLERY_VIEWER_STORAGE_KEY, JSON.stringify(options));
      finish(options);
    });
    if (selectedMode) selectedMode.focus();
  });
}


function chooseGalleryFiles(inputElement, options) {
  const cfg = options || {};
  const input = inputElement || document.getElementById('input-gallery-files');
  if (!input) return Promise.reject(new Error('GALLERY_FILE_INPUT_MISSING'));
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'pb-modal-overlay pb-gallery-file-overlay';
    overlay.innerHTML = `<div class="pb-modal pb-gallery-file-modal" role="dialog" aria-modal="true" aria-labelledby="pb-gallery-file-title">
      <h2 id="pb-gallery-file-title">Bilder für die Galerie auswählen</h2>
      <div class="pb-modal-actions">
        <button type="button" class="btn btn-secondary" data-gallery-file-cancel>Abbrechen</button>
        <button type="button" class="btn btn-primary" data-gallery-file-select>Bilder auswählen</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    let finished = false;
    const cleanup = () => {
      input.removeEventListener('change', onChange);
      input.removeEventListener('cancel', onCancel);
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
    };
    const finish = (value) => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(value);
    };
    const onChange = () => {
      const files = Array.from(input.files || []);
      input.value = '';
      finish(files.length ? files : null);
    };
    const onCancel = () => finish(null);
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); finish(null); }
    };
    input.value = '';
    input.addEventListener('change', onChange);
    input.addEventListener('cancel', onCancel);
    document.addEventListener('keydown', onKey, true);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) finish(null); });
    overlay.querySelector('[data-gallery-file-cancel]').addEventListener('click', () => finish(null));
    overlay.querySelector('[data-gallery-file-select]').addEventListener('click', () => input.click());
    overlay.querySelector('[data-gallery-file-select]').focus();
  });
}
window.chooseGalleryFiles = chooseGalleryFiles;

function galleryDataAttributes(options) {
  const cfg = options || getStoredGalleryViewerOptions();
  return `data-pb-gallery data-pb-gallery-viewer="${cfg.mode}" data-pb-gallery-caption="${cfg.caption ? 'true' : 'false'}" data-pb-gallery-counter="${cfg.counter ? 'true' : 'false'}" data-pb-gallery-loop="${cfg.loop ? 'true' : 'false'}" data-pb-gallery-download="${cfg.download !== false ? 'true' : 'false'}"`;
}

function galleryTrigger(entry, index, image, options, extraClass) {
  const cfg = options || getStoredGalleryViewerOptions();
  const label = entry.originalName || `Galeriebild ${index + 1}`;
  return `<a class="pb-gallery-trigger ${extraClass || ''}" data-oluntir-gallery-image href="${entry.desktopUrl}" data-stable-path="${entry.desktopPath}" data-pb-gallery-mobile="${entry.mobileUrl}" data-pb-gallery-tablet="${entry.tabletUrl}" data-pb-gallery-desktop="${entry.desktopUrl}" data-pb-gallery-mobile-path="${entry.mobilePath}" data-pb-gallery-tablet-path="${entry.tabletPath}" data-pb-gallery-desktop-path="${entry.desktopPath}" data-download="${entry.downloadPath}" data-filename="${entry.originalName}" data-alt="${label}" data-caption="${label}" aria-label="${label} vergrößern">${image}</a>`;
}


function getGalleryIconProfile() {
  const framework = window.PAGEBUILDER_FRAMEWORK || { id: 'bs4' };
  if (framework.id === 'bs5') {
    return {
      baseClass: 'fas',
      zoomClass: 'fa-arrows-alt',
      downloadClass: 'fa-download'
    };
  }
  return {
    baseClass: 'fa',
    zoomClass: 'fa-arrows-alt',
    downloadClass: 'fa-download'
  };
}

function galleryActionIcon(type) {
  const profile = getGalleryIconProfile();
  const iconClass = type === 'download' ? profile.downloadClass : profile.zoomClass;
  return `<i class="${profile.baseClass} ${iconClass}" aria-hidden="true"></i>`;
}

function ensureGalleryActionIcons(editorInstance) {
  if (!editorInstance || !editorInstance.Pages) return;
  const zoomMarkup = galleryActionIcon('zoom');
  const downloadMarkup = galleryActionIcon('download');

  editorInstance.Pages.getAll().forEach((page) => {
    const root = page.getMainComponent ? page.getMainComponent() : null;
    if (!root || !root.find) return;

    root.find('.pb-gallery-open-button').forEach((component) => {
      component.components(zoomMarkup);
    });

    root.find('.portfolio-download').forEach((component) => {
      component.components(downloadMarkup);
    });
  });
}
window.ensureGalleryActionIcons = ensureGalleryActionIcons;

function componentHasClass(component, className) {
  const classes = component && component.getClasses ? component.getClasses() : [];
  return Array.isArray(classes) && classes.indexOf(className) >= 0;
}

function componentTag(component) {
  return component && component.get ? String(component.get('tagName') || '').toLowerCase() : '';
}

function findGalleryItemComponent(component) {
  let current = component;
  while (current) {
    const attrs = current.getAttributes ? current.getAttributes() : {};
    if (componentHasClass(current, 'pb-gallery-item') || Object.prototype.hasOwnProperty.call(attrs || {}, 'data-pb-gallery-item')) {
      return current;
    }
    current = current.parent ? current.parent() : null;
  }
  return null;
}

function isGalleryVisualComponent(component) {
  if (!component) return false;
  const tag = componentTag(component);
  return tag === 'img' || tag === 'picture' || componentHasClass(component, 'pb-gallery-trigger');
}

function normalizeGalleryComponentModel(editorInstance) {
  if (!editorInstance || !editorInstance.Pages) return;
  const normalize = () => {
    editorInstance.Pages.getAll().forEach((page) => {
      const root = page.getMainComponent ? page.getMainComponent() : null;
      if (!root || !root.find) return;

      root.find('.pb-gallery-actions').forEach((actions) => {
        const item = actions.parent ? actions.parent() : null;
        if (item) {
          const attrs = Object.assign({}, item.getAttributes ? item.getAttributes() : {}, { 'data-pb-gallery-item': '' });
          item.addAttributes ? item.addAttributes({ 'data-pb-gallery-item': '' }) : item.set && item.set('attributes', attrs);
          item.set && item.set({ removable: true, draggable: false, copyable: true });
        }
        actions.set && actions.set({ removable: false, draggable: false, copyable: false, selectable: false, hoverable: false });
        const descendants = actions.find ? actions.find('*') : [];
        descendants.forEach((control) => control.set && control.set({ removable: false, draggable: false, copyable: false, selectable: false }));

        // The image/trigger is only a visual child of one atomic gallery item.
        // Deletion must target the gallery item itself so GrapesJS records exactly
        // one undoable operation and can restore it with Redo.
        if (item && item.find) {
          item.find('img, picture, .pb-gallery-trigger').forEach((visual) => {
            visual.set && visual.set({ removable: false, draggable: false, copyable: false, selectable: true, hoverable: true });
          });
        }
      });
    });
  };
  const undoManager = editorInstance.UndoManager;
  if (undoManager && typeof undoManager.skip === 'function') undoManager.skip(normalize);
  else normalize();
}
window.normalizeGalleryComponentModel = normalizeGalleryComponentModel;

function bindGalleryItemLifecycle(editorInstance) {
  if (!editorInstance || editorInstance.__oluntirGalleryItemLifecycleBound) return;
  editorInstance.__oluntirGalleryItemLifecycleBound = true;

  const normalize = () => normalizeGalleryComponentModel(editorInstance);
  editorInstance.on('load', normalize);
  editorInstance.on('project:load', normalize);
  editorInstance.on('page', normalize);
  editorInstance.on('component:add', (component) => {
    if (componentHasClass(component, 'pb-gallery') || componentHasClass(component, 'pb-gallery-actions') || componentHasClass(component, 'pb-gallery-item')) {
      window.requestAnimationFrame(normalize);
    }
  });

  // Die Drop-Position ist bereits die bestätigte Einfügeposition. GrapesJS 0.23.2
  // übergibt bei block:drag:stop je nach Blockquelle nicht zuverlässig die erzeugte
  // Komponente. Maßgeblich ist deshalb component:add: Der Launcher selbst ist der
  // kurzlebige Positionsanker und wird nach Optionen + Mehrfachauswahl atomar ersetzt.
  const launchDroppedFrameworkGallery = (component) => {
    if (!component || component.__oluntirGalleryLauncherHandled) return false;
    const attrs = component.getAttributes ? component.getAttributes() : {};
    if (!Object.prototype.hasOwnProperty.call(attrs || {}, 'data-oluntir-gallery-launcher')) return false;
    component.__oluntirGalleryLauncherHandled = true;
    if (component.set) component.set({ selectable: false, hoverable: false, removable: false, copyable: false });
    window.setTimeout(() => {
      // Der Anker kann durch Undo, Seitenwechsel oder einen Abbruch bereits entfernt sein.
      if (!component || typeof component.parent !== 'function' || !component.parent()) return;
      if (typeof window.startFrameworkGalleryWorkflow !== 'function') {
        if (typeof component.remove === 'function') component.remove();
        alert('Der Galerie-Assistent ist nicht verfügbar.');
        return;
      }
      window.startFrameworkGalleryWorkflow(editorInstance, {
        source: 'framework-block',
        framework: String(attrs['data-oluntir-gallery-launcher'] || ''),
        dropComponent: component
      }).catch((error) => {
        if (typeof component.remove === 'function' && typeof component.parent === 'function' && component.parent()) component.remove();
        console.error('Oluntir: Framework-Galerie konnte nicht gestartet werden.', error);
        alert('Der Galerie-Assistent konnte nicht gestartet werden: ' + error.message);
      });
    }, 0);
    return true;
  };

  editorInstance.on('component:add', (component) => {
    launchDroppedFrameworkGallery(component);
  });

  // Kompatibilitäts-Fallback für Blockquellen, die in GrapesJS tatsächlich die
  // erzeugte Komponente an block:drag:stop übergeben.
  editorInstance.on('block:drag:stop', (component) => {
    launchDroppedFrameworkGallery(component);
  });

  // Galerie-Visuals bleiben im Bearbeitungsmodus direkt auswählbar. Nur der
  // Löschbefehl löst anschließend den atomaren Galerie-Wrapper auf. Dadurch kann
  // der Bildmanager das konkrete IMG bzw. den Galerie-Trigger zuverlässig erkennen.


  // Galerie-Items werden über die Oluntir-Dokumenttransaktion entfernt. Die
  // eigentliche Modellmutation läuft außerhalb der nativen History; nur der
  // atomare Oluntir-Marker wird in den gemeinsamen UndoManager geschrieben.
  const commands = editorInstance.Commands;
  if (commands && typeof commands.get === 'function' && typeof commands.add === 'function' && !editorInstance.__oluntirGalleryDeleteCommandBound) {
    editorInstance.__oluntirGalleryDeleteCommandBound = true;
    const originalDelete = commands.get('core:component-delete');
    if (originalDelete) {
      if (typeof commands.remove === 'function') commands.remove('core:component-delete');
      commands.add('core:component-delete', {
        run(ed, sender, options) {
          const selected = ed && typeof ed.getSelected === 'function' ? ed.getSelected() : null;
          const item = findGalleryItemComponent(selected);
          if (item && window.OluntirDocumentApi && typeof window.OluntirDocumentApi.removeComponent === 'function') {
            const removed = window.OluntirDocumentApi.removeComponent(item, { label: 'gallery.item.remove' });
            if (removed && typeof ed.select === 'function') ed.select(null);
            return removed;
          }
          if (typeof originalDelete.run === 'function') return originalDelete.run.call(originalDelete, ed, sender, options || {});
          return false;
        },
        stop(ed, sender, options) {
          if (typeof originalDelete.stop === 'function') return originalDelete.stop.call(originalDelete, ed, sender, options || {});
          return undefined;
        }
      });
    }
  }
}
window.bindGalleryItemLifecycle = bindGalleryItemLifecycle;


function buildGalleryItemsHtml(entries, viewerOptions) {
  const framework = window.PAGEBUILDER_FRAMEWORK || { id: 'bs4' };
  if (framework.id === 'bs5') {
    return entries.map((e, index) => {
      const image = `<picture>
        <source media="(max-width: 767.98px)" srcset="${e.mobileUrl}" data-stable-srcset-path="${e.mobilePath}">
        <source media="(max-width: 1199.98px)" srcset="${e.tabletUrl}" data-stable-srcset-path="${e.tabletPath}">
        <img class="card-img-top img-fluid" src="${e.desktopUrl}" data-stable-path="${e.desktopPath}" alt="${e.originalName || `Galeriebild ${index + 1}`}" loading="lazy">
      </picture>`;
      const trigger = galleryTrigger(e, index, image, viewerOptions, 'd-block');
      return `<div class="col-12 col-sm-6 col-lg-4">
        <article class="card border-0 shadow-sm pb-bs5-gallery-card h-100">
          <div class="position-relative pb-gallery-item" data-pb-gallery-item data-oluntir-gallery-item>${trigger}
            <div class="pb-gallery-actions" role="group" aria-label="Bildaktionen">
              ${`<button class="pb-gallery-action pb-gallery-open-button" type="button" data-pb-gallery-open-index="${index}" title="Bild vergrößern" aria-label="Bild vergrößern">${galleryActionIcon('zoom')}</button>`}
              ${viewerOptions.download === false ? '' : `<a class="pb-gallery-action portfolio-download" data-oluntir-gallery-download href="${e.downloadUrl}" data-stable-download-path="${e.downloadPath}" download="${e.originalName}" title="Originalbild herunterladen" aria-label="Originalbild herunterladen">${galleryActionIcon('download')}</a>`}
            </div>
          </div>
        </article>
      </div>`;
    }).join('');
  }
  return entries.map((e, index) => {
    const image = `<picture class="d-block w-100">
      <source media="(max-width: 767.98px)" srcset="${e.mobileUrl}" data-stable-srcset-path="${e.mobilePath}">
      <source media="(max-width: 1199.98px)" srcset="${e.tabletUrl}" data-stable-srcset-path="${e.tabletPath}">
      <img class="img-fluid w-100" src="${e.desktopUrl}" data-stable-path="${e.desktopPath}" alt="${e.originalName || `Galeriebild ${index + 1}`}" loading="lazy">
    </picture>`;
    const trigger = galleryTrigger(e, index, image, viewerOptions, 'd-block');
    return `<div class="col-md-4 col-sm-6 mb-4"><div class="portfolio-item"><div class="position-relative pb-gallery-item" data-pb-gallery-item data-oluntir-gallery-item>${trigger}
      <div class="pb-gallery-actions" role="group" aria-label="Bildaktionen">
        ${`<button class="pb-gallery-action pb-gallery-open-button" type="button" data-pb-gallery-open-index="${index}" title="Bild vergrößern" aria-label="Bild vergrößern">${galleryActionIcon('zoom')}</button>`}
        ${viewerOptions.download === false ? '' : `<a class="pb-gallery-action portfolio-download" data-oluntir-gallery-download href="${e.downloadUrl}" data-stable-download-path="${e.downloadPath}" download="${e.originalName}" title="Originalbild herunterladen" aria-label="Originalbild herunterladen">${galleryActionIcon('download')}</a>`}
      </div></div></div></div>`;
  }).join('');
}

function buildGalleryHtml(entries, viewerOptions, structureMode) {
  const api = window.OluntirTemplateStructureApi;
  if (!api || typeof api.createGalleryStructure !== 'function') throw new Error('TEMPLATE_STRUCTURE_API_MISSING');
  return api.createGalleryStructure({
    mode: structureMode && structureMode.mode || 'existing-layout',
    width: structureMode && structureMode.width || null,
    framework: window.PAGEBUILDER_FRAMEWORK || { id: 'bs4' },
    galleryAttributes: galleryDataAttributes(viewerOptions),
    itemsHtml: buildGalleryItemsHtml(entries, viewerOptions)
  });
}

async function insertGalleryFromFiles(editor, fileList, preparedOptions) {
  const files = Array.from(fileList || []).filter((f) => f.type && f.type.startsWith('image/'));
  if (!files.length) { alert('Keine Bilddateien gefunden.'); return; }
  const prepared = preparedOptions || {};
  const dropComponent = prepared.dropComponent || null;
  if (!dropComponent) throw new Error('FRAMEWORK_GALLERY_DROP_COMPONENT_MISSING');
  const structureMode = prepared.structureMode || Object.freeze({ mode: 'new-area', width: 'container-fluid' });
  const viewerOptions = prepared.viewerOptions || await chooseGalleryViewerOptions();
  if (!viewerOptions) return;
  if (files.length > 60 && !confirm(`${files.length} Bilder gefunden. Das kann etwas dauern. Trotzdem fortfahren?`)) return;
  const totalMB = files.reduce((s, f) => s + f.size, 0) / (1024 * 1024);
  if (totalMB > GALLERY_MAX_TOTAL_MB && !confirm(`Die ausgewählten Bilder sind zusammen ca. ${totalMB.toFixed(0)} MB groß. Trotzdem fortfahren?`)) return;
  showProgress('Responsive Bildergalerie wird erstellt');
  const entries = [];
  try {
    for (let i = 0; i < files.length; i++) {
      updateProgress(Math.round((i / files.length) * 100), `Bild ${i + 1} von ${files.length}: ${files[i].name}`);
      await nextFrame();
      entries.push(await createResponsiveImageAssets(files[i]));
    }
  } catch (e) { hideProgress(); alert('Galerie konnte nicht erstellt werden: ' + e.message); return; }
  updateProgress(100, 'Füge Galerie in die Seite ein …');
  await nextFrame();
  const html = buildGalleryHtml(entries, viewerOptions, structureMode);
  let inserted = null;
  if (!window.OluntirDocumentApi || typeof window.OluntirDocumentApi.insertHtml !== 'function') {
    hideProgress();
    alert('Die Oluntir-Dokument-API ist nicht verfügbar.');
    return;
  }
  try {
    const anchor = dropComponent;
    const parent = anchor && typeof anchor.parent === 'function' ? anchor.parent() : null;
    if (!parent || typeof anchor.replaceWith !== 'function') throw new Error('GALLERY_DROP_POSITION_UNAVAILABLE');
    const replacement = anchor.replaceWith(html);
    inserted = Array.isArray(replacement) ? replacement[0] : replacement;
  } catch (error) {
    hideProgress();
    alert('Die Galerie konnte an der gewählten Position nicht eingefügt werden: ' + error.message);
    return false;
  }
  if (inserted && editor.select) editor.select(inserted);
  editor.trigger('oluntir:history:changed');
  hideProgress();
  toast(`Galerie mit ${files.length} Bild${files.length === 1 ? '' : 'ern'} eingefügt.`);
  return true;
}

async function startFrameworkGalleryWorkflow(editor, options) {
  const cfg = options || {};
  if (!editor) throw new Error('GALLERY_EDITOR_MISSING');
  if (cfg.source !== 'framework-block' || !cfg.dropComponent) {
    throw new Error('FRAMEWORK_GALLERY_DROP_REQUIRED');
  }

  const removeDropAnchor = () => {
    const anchor = cfg.dropComponent;
    if (anchor && typeof anchor.remove === 'function' && typeof anchor.parent === 'function' && anchor.parent()) anchor.remove();
  };

  const viewerOptions = await chooseGalleryViewerOptions();
  if (!viewerOptions) { removeDropAnchor(); return false; }

  const input = document.getElementById('input-gallery-files');
  const files = await chooseGalleryFiles(input);
  if (!files || !files.length) { removeDropAnchor(); return false; }

  const inserted = await insertGalleryFromFiles(editor, files, {
    dropComponent: cfg.dropComponent,
    structureMode: Object.freeze({ mode: 'new-area', width: 'container-fluid' }),
    viewerOptions
  });
  if (!inserted) removeDropAnchor();
  return Boolean(inserted);
}
window.startFrameworkGalleryWorkflow = startFrameworkGalleryWorkflow;


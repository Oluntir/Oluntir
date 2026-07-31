// Responsive Bildergalerien: Desktop 1920/90, Tablet 1600/88, Mobil 1200/85.
// Das Original bleibt unverändert unter assets/user_upload/original/ erhalten.
const GALLERY_MAX_TOTAL_MB = 300;
const GALLERY_VIEWER_STORAGE_KEY = 'oluntir-gallery-viewer-options-v1';

function getStoredGalleryViewerOptions() {
  const defaults = { mode: 'modal', caption: true, counter: true, loop: true };
  try {
    const stored = JSON.parse(localStorage.getItem(GALLERY_VIEWER_STORAGE_KEY) || '{}');
    return Object.assign(defaults, stored || {});
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
        <h2 id="pb-gallery-options-title">Darstellung der Klickvergrößerung</h2>
        <p>Wähle, wie Bilder dieser Galerie beim Anklicken geöffnet werden.</p>
        <label class="pb-gallery-options-field">
          <span>Darstellungsmodus</span>
          <select data-gallery-option="mode">
            <option value="none">Keine Vergrößerung</option>
            <option value="modal">Modal</option>
            <option value="lightbox">Lightbox</option>
          </select>
        </label>
        <label class="pb-modal-check"><input type="checkbox" data-gallery-option="caption"> Bildunterschrift anzeigen</label>
        <label class="pb-modal-check"><input type="checkbox" data-gallery-option="counter"> Bildzähler anzeigen</label>
        <label class="pb-modal-check"><input type="checkbox" data-gallery-option="loop"> Navigation am Ende fortsetzen</label>
        <p class="pb-gallery-options-note">Die Tastaturnavigation ist bei Modal und Lightbox immer aktiv: Pfeiltasten, Pos1, Ende und Escape.</p>
        <div class="pb-modal-actions">
          <button type="button" class="btn btn-secondary" data-gallery-cancel>Abbrechen</button>
          <button type="button" class="btn btn-primary" data-gallery-confirm>Galerie erstellen</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    const modal = overlay.querySelector('.pb-gallery-options-modal');
    const mode = overlay.querySelector('[data-gallery-option="mode"]');
    const caption = overlay.querySelector('[data-gallery-option="caption"]');
    const counter = overlay.querySelector('[data-gallery-option="counter"]');
    const loop = overlay.querySelector('[data-gallery-option="loop"]');
    mode.value = saved.mode;
    caption.checked = saved.caption !== false;
    counter.checked = saved.counter !== false;
    loop.checked = saved.loop !== false;

    const updateDisabled = () => {
      const disabled = mode.value === 'none';
      caption.disabled = disabled;
      counter.disabled = disabled;
      loop.disabled = disabled;
    };
    updateDisabled();
    mode.addEventListener('change', updateDisabled);

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
        const focusable = Array.from(modal.querySelectorAll('button, select, input:not(:disabled)'));
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
      const options = { mode: mode.value, caption: caption.checked, counter: counter.checked, loop: loop.checked };
      localStorage.setItem(GALLERY_VIEWER_STORAGE_KEY, JSON.stringify(options));
      finish(options);
    });
    mode.focus();
  });
}

function galleryDataAttributes(options) {
  const cfg = options || getStoredGalleryViewerOptions();
  return `data-pb-gallery data-pb-gallery-viewer="${cfg.mode}" data-pb-gallery-caption="${cfg.caption ? 'true' : 'false'}" data-pb-gallery-counter="${cfg.counter ? 'true' : 'false'}" data-pb-gallery-loop="${cfg.loop ? 'true' : 'false'}"`;
}

function galleryTrigger(entry, index, image, options, extraClass) {
  const cfg = options || getStoredGalleryViewerOptions();
  if (cfg.mode === 'none') return image;
  const label = entry.originalName || `Galeriebild ${index + 1}`;
  return `<a class="pb-gallery-trigger ${extraClass || ''}" href="${entry.desktopUrl}" data-stable-path="${entry.desktopPath}" data-pb-gallery-mobile="${entry.mobileUrl}" data-pb-gallery-tablet="${entry.tabletUrl}" data-pb-gallery-desktop="${entry.desktopUrl}" data-pb-gallery-mobile-path="${entry.mobilePath}" data-pb-gallery-tablet-path="${entry.tabletPath}" data-pb-gallery-desktop-path="${entry.desktopPath}" data-download="${entry.downloadPath}" data-filename="${entry.originalName}" data-alt="${label}" data-caption="${label}" aria-label="${label} vergrößern">${image}</a>`;
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

function buildGalleryHtml(entries, viewerOptions) {
  const framework = window.PAGEBUILDER_FRAMEWORK || { id: 'bs4' };
  const galleryAttrs = galleryDataAttributes(viewerOptions);

  if (framework.id === 'bs5') {
    const items = entries.map((e, index) => {
      const image = `<picture>
        <source media="(max-width: 767.98px)" srcset="${e.mobileUrl}" data-stable-srcset-path="${e.mobilePath}">
        <source media="(max-width: 1199.98px)" srcset="${e.tabletUrl}" data-stable-srcset-path="${e.tabletPath}">
        <img class="card-img-top img-fluid" src="${e.desktopUrl}" data-stable-path="${e.desktopPath}" alt="${e.originalName || `Galeriebild ${index + 1}`}" loading="lazy">
      </picture>`;
      const trigger = galleryTrigger(e, index, image, viewerOptions, 'd-block');
      return `<div class="col-12 col-sm-6 col-lg-4">
        <article class="card border-0 shadow-sm pb-bs5-gallery-card h-100">
          <div class="position-relative">${trigger}
            <div class="pb-gallery-actions" role="group" aria-label="Bildaktionen">
              ${viewerOptions.mode === 'none' ? '' : `<button class="pb-gallery-action pb-gallery-open-button" type="button" data-pb-gallery-open-index="${index}" title="Bild vergrößern" aria-label="Bild vergrößern">${galleryActionIcon('zoom')}</button>`}
              <a class="pb-gallery-action portfolio-download" href="${e.downloadUrl}" data-stable-download-path="${e.downloadPath}" download="${e.originalName}" title="Originalbild herunterladen" aria-label="Originalbild herunterladen">${galleryActionIcon('download')}</a>
            </div>
          </div>
        </article>
      </div>`;
    }).join('');
    return `<section class="py-5 pb-gallery" ${galleryAttrs}><div class="container-fluid px-3 px-lg-4"><div class="row g-4">${items}</div></div></section>`;
  }

  const items = entries.map((e, index) => {
    const image = `<picture class="d-block w-100">
      <source media="(max-width: 767.98px)" srcset="${e.mobileUrl}" data-stable-srcset-path="${e.mobilePath}">
      <source media="(max-width: 1199.98px)" srcset="${e.tabletUrl}" data-stable-srcset-path="${e.tabletPath}">
      <img class="img-fluid w-100" src="${e.desktopUrl}" data-stable-path="${e.desktopPath}" alt="${e.originalName || `Galeriebild ${index + 1}`}" loading="lazy">
    </picture>`;
    const trigger = galleryTrigger(e, index, image, viewerOptions, 'd-block');
    return `<div class="col-md-4 col-sm-6 mb-4"><div class="portfolio-item"><div class="position-relative">${trigger}
      <div class="pb-gallery-actions" role="group" aria-label="Bildaktionen">
        ${viewerOptions.mode === 'none' ? '' : `<button class="pb-gallery-action pb-gallery-open-button" type="button" data-pb-gallery-open-index="${index}" title="Bild vergrößern" aria-label="Bild vergrößern">${galleryActionIcon('zoom')}</button>`}
        <a class="pb-gallery-action portfolio-download" href="${e.downloadUrl}" data-stable-download-path="${e.downloadPath}" download="${e.originalName}" title="Originalbild herunterladen" aria-label="Originalbild herunterladen">${galleryActionIcon('download')}</a>
      </div></div></div></div>`;
  }).join('');
  return `<section class="space-ptb pb-gallery" ${galleryAttrs}><div class="container-fluid"><div class="row">${items}</div></div></section>`;
}

async function insertGalleryFromFiles(editor, fileList) {
  const files = Array.from(fileList || []).filter((f) => f.type && f.type.startsWith('image/'));
  if (!files.length) { alert('Keine Bilddateien gefunden.'); return; }
  const viewerOptions = await chooseGalleryViewerOptions();
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
  const html = buildGalleryHtml(entries, viewerOptions);
  const selected = editor.getSelected();
  if (selected && selected.parent()) selected.parent().append(html, { at: selected.index() + 1 });
  else editor.getWrapper().append(html);
  hideProgress();
  toast(`Galerie mit ${files.length} Bild${files.length === 1 ? '' : 'ern'} eingefügt.`);
}

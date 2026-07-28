// Responsive Bildergalerien: Desktop 1920/90, Tablet 1600/88, Mobil 1200/85.
// Das Original bleibt unverändert unter images/downloads/ erhalten.
const GALLERY_MAX_TOTAL_MB = 300;

function buildGalleryHtml(entries) {
  const framework = window.PAGEBUILDER_FRAMEWORK || { id: 'bs4' };

  if (framework.id === 'bs5') {
    const modalId = `pbGalleryModal-${Math.random().toString(36).slice(2, 9)}`;
    const items = entries.map((e, index) => `
      <div class="col-12 col-sm-6 col-lg-4">
        <article class="card border-0 shadow-sm pb-bs5-gallery-card h-100">
          <div class="position-relative">
            <picture>
              <source media="(max-width: 767.98px)" srcset="${e.mobileUrl}" data-stable-srcset-path="${e.mobilePath}">
              <source media="(max-width: 1199.98px)" srcset="${e.tabletUrl}" data-stable-srcset-path="${e.tabletPath}">
              <img class="card-img-top img-fluid" src="${e.desktopUrl}" data-stable-path="${e.desktopPath}" alt="${e.originalName || `Galeriebild ${index + 1}`}" loading="lazy">
            </picture>
            <div class="pb-bs5-gallery-overlay">
              <a class="btn btn-light portfolio-img pb-bs5-gallery-open" href="${e.desktopUrl}" data-stable-path="${e.desktopPath}" data-pb-gallery-mobile="${e.mobileUrl}" data-pb-gallery-tablet="${e.tabletUrl}" data-pb-gallery-desktop="${e.desktopUrl}" data-pb-gallery-mobile-path="${e.mobilePath}" data-pb-gallery-tablet-path="${e.tabletPath}" data-pb-gallery-desktop-path="${e.desktopPath}" data-bs-toggle="modal" data-bs-target="#${modalId}" data-download="${e.downloadPath}" data-filename="${e.originalName}" data-alt="${e.originalName}" aria-label="Bild vergrößern"><span aria-hidden="true">⛶</span></a>
              <a class="btn btn-light portfolio-download" href="${e.downloadUrl}" data-stable-download-path="${e.downloadPath}" download="${e.originalName}" aria-label="Originalbild herunterladen"><span aria-hidden="true">⇩</span></a>
            </div>
          </div>
        </article>
      </div>`).join('');

    return `<section class="py-5" data-pb-bs5-gallery>
      <div class="container-fluid px-3 px-lg-4"><div class="row g-4">${items}</div></div>
      <div class="modal fade pb-bs5-gallery-modal" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen-xl-down modal-xl modal-dialog-centered pb-gallery-dialog">
          <div class="modal-content">
            <div class="modal-header"><h2 class="modal-title fs-5">Bildansicht</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button></div>
            <div class="modal-body position-relative text-center bg-body-tertiary pb-gallery-stage">
              <img class="img-fluid pb-gallery-modal-image" data-pb-gallery-modal-image alt="" decoding="async">
              <button class="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-3" type="button" data-pb-gallery-nav="prev" aria-label="Vorheriges Bild">‹</button>
              <button class="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-3" type="button" data-pb-gallery-nav="next" aria-label="Nächstes Bild">›</button>
            </div>
            <div class="modal-footer"><a class="btn btn-primary" data-pb-gallery-modal-download href="#" download>Original herunterladen</a><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button></div>
          </div>
        </div>
      </div>
    </section>`;
  }

  const items = entries.map((e) => `
    <div class="col-md-4 col-sm-6 mb-4">
      <div class="portfolio-item">
        <div class="position-relative">
          <picture class="d-block w-100">
            <source media="(max-width: 767.98px)" srcset="${e.mobileUrl}" data-stable-srcset-path="${e.mobilePath}">
            <source media="(max-width: 1199.98px)" srcset="${e.tabletUrl}" data-stable-srcset-path="${e.tabletPath}">
            <img class="img-fluid w-100" src="${e.desktopUrl}" data-stable-path="${e.desktopPath}" alt="" loading="lazy">
          </picture>
          <div class="portfolio-overlay">
            <a class="portfolio-img" href="${e.desktopUrl}" data-stable-path="${e.desktopPath}" data-pb-gallery-mobile="${e.mobileUrl}" data-pb-gallery-tablet="${e.tabletUrl}" data-pb-gallery-desktop="${e.desktopUrl}" data-pb-gallery-mobile-path="${e.mobilePath}" data-pb-gallery-tablet-path="${e.tabletPath}" data-pb-gallery-desktop-path="${e.desktopPath}"><i class="fas fa-arrows-alt"></i></a>
            <a class="portfolio-download" href="${e.downloadUrl}" data-stable-download-path="${e.downloadPath}" download="${e.originalName}" title="Originalbild herunterladen" aria-label="Originalbild herunterladen"><i class="fas fa-download"></i></a>
          </div>
        </div>
      </div>
    </div>`).join('');
  return `<section class="space-ptb"><div class="container-fluid"><div class="row popup-gallery">${items}</div></div></section>`;
}

async function insertGalleryFromFiles(editor, fileList) {
  const files = Array.from(fileList || []).filter((f) => f.type && f.type.startsWith('image/'));
  if (!files.length) { alert('Keine Bilddateien gefunden.'); return; }
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
  const html = buildGalleryHtml(entries);
  const selected = editor.getSelected();
  if (selected && selected.parent()) selected.parent().append(html, { at: selected.index() + 1 });
  else editor.getWrapper().append(html);
  hideProgress();
  toast(`Galerie mit ${files.length} Bild${files.length === 1 ? '' : 'ern'} eingefügt.`);
}

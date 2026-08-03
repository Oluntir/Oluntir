(function () {
  const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

  window.buildBootstrap5ClassicGalleryHtml = function () {
    const modalId = uid('pbGalleryModal');
    const images = ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg'];
    const items = images.map((name, index) => `
      <div class="col-12 col-sm-6 col-lg-4">
        <article class="card border-0 shadow-sm pb-bs5-gallery-card h-100">
          <div class="position-relative pb-gallery-item" data-pb-gallery-item data-oluntir-gallery-item>
            <picture>
              <source media="(max-width: 767.98px)" srcset="assets/images/logo.svg">
              <source media="(max-width: 1199.98px)" srcset="assets/images/logo.svg">
              <img class="card-img-top img-fluid" src="assets/images/logo.svg" alt="Galeriebild ${index + 1}" loading="lazy">
            </picture>
            <div class="pb-bs5-gallery-overlay">
              <a class="btn btn-light pb-bs5-gallery-open pb-gallery-trigger" data-oluntir-gallery-image href="assets/images/logo.svg" data-pb-gallery-mobile="assets/images/logo.svg" data-pb-gallery-tablet="assets/images/logo.svg" data-pb-gallery-desktop="assets/images/logo.svg" data-bs-toggle="modal" data-bs-target="#${modalId}" data-download="assets/images/logo.svg" data-filename="${name}" data-alt="Galeriebild ${index + 1}" aria-label="Bild vergrößern">
                <span aria-hidden="true">⛶</span>
              </a>
              <a class="btn btn-light portfolio-download" data-oluntir-gallery-download href="assets/images/logo.svg" download="${name}" aria-label="Bild herunterladen">
                <span aria-hidden="true">⇩</span>
              </a>
            </div>
          </div>
        </article>
      </div>`).join('');

    return `<section class="py-5" data-pb-bs5-gallery>
      <div class="container-fluid px-3 px-lg-4">
        <div class="row g-4">${items}</div>
      </div>
      <div class="modal fade pb-bs5-gallery-modal" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen-xl-down modal-xl modal-dialog-centered pb-gallery-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title fs-5">Bildansicht</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
            </div>
            <div class="modal-body position-relative text-center bg-body-tertiary pb-gallery-stage">
              <img class="img-fluid pb-gallery-modal-image" data-pb-gallery-modal-image alt="" decoding="async">
              <button class="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-3" type="button" data-pb-gallery-nav="prev" aria-label="Vorheriges Bild">‹</button>
              <button class="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-3" type="button" data-pb-gallery-nav="next" aria-label="Nächstes Bild">›</button>
            </div>
            <div class="modal-footer">
              <a class="btn btn-primary" data-pb-gallery-modal-download href="#" download>Original herunterladen</a>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  };

  window.registerBootstrap5Blocks = function (editor) {
    const bm = editor.BlockManager;
    const add = (id, label, category, content) => bm.add(id, { label, category, content });

    add('bs5-container', 'Container', 'BS5 · Layout', '<section class="py-5"><div class="container"><h2>Container</h2><p>Inhalt hier einfügen.</p></div></section>');
    add('bs5-container-fluid', 'Container fluid', 'BS5 · Layout', '<section class="py-5"><div class="container-fluid px-4"><h2>Container fluid</h2><p>Volle Breite mit Innenabstand.</p></div></section>');
    add('bs5-grid-2', 'Grid – 2 Spalten', 'BS5 · Layout', '<section class="py-5"><div class="container"><div class="row g-4"><div class="col-12 col-md-6"><div class="p-4 border rounded-3">Spalte 1</div></div><div class="col-12 col-md-6"><div class="p-4 border rounded-3">Spalte 2</div></div></div></div></section>');
    add('bs5-grid-3', 'Grid – 3 Spalten', 'BS5 · Layout', '<section class="py-5"><div class="container"><div class="row g-4"><div class="col-12 col-md-4"><div class="p-4 border rounded-3">Spalte 1</div></div><div class="col-12 col-md-4"><div class="p-4 border rounded-3">Spalte 2</div></div><div class="col-12 col-md-4"><div class="p-4 border rounded-3">Spalte 3</div></div></div></div></section>');
    add('bs5-grid-auto', 'Grid – Auto-Spalten', 'BS5 · Layout', '<section class="py-5"><div class="container"><div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4"><div class="col"><div class="p-3 bg-body-tertiary rounded">1</div></div><div class="col"><div class="p-3 bg-body-tertiary rounded">2</div></div><div class="col"><div class="p-3 bg-body-tertiary rounded">3</div></div><div class="col"><div class="p-3 bg-body-tertiary rounded">4</div></div></div></div></section>');

    add('bs5-typography', 'Typografie', 'BS5 · Content', '<section class="py-5"><div class="container"><h1 class="display-4">Display-Überschrift</h1><p class="lead">Ein hervorgehobener Einleitungstext.</p><p>Fließtext mit <strong>fetter</strong>, <em>kursiver</em> und <mark>markierter</mark> Darstellung.</p><blockquote class="blockquote"><p>Ein aussagekräftiges Zitat.</p><footer class="blockquote-footer">Quelle</footer></blockquote></div></section>');
    add('bs5-figure', 'Figure mit Bild', 'BS5 · Content', '<figure class="figure"><img src="assets/images/logo.svg" class="figure-img img-fluid rounded" alt="Beispielbild"><figcaption class="figure-caption">Bildunterschrift</figcaption></figure>');
    add('bs5-table', 'Responsive Tabelle', 'BS5 · Content', '<div class="table-responsive"><table class="table table-striped table-hover align-middle"><thead><tr><th>Spalte A</th><th>Spalte B</th><th>Status</th></tr></thead><tbody><tr><td>Eintrag 1</td><td>Wert</td><td><span class="badge text-bg-success">Aktiv</span></td></tr><tr><td>Eintrag 2</td><td>Wert</td><td><span class="badge text-bg-secondary">Offen</span></td></tr></tbody></table></div>');

    add('bs5-form', 'Formular', 'BS5 · Forms', '<section class="py-5"><div class="container"><form class="row g-3"><div class="col-md-6"><label class="form-label">Vorname</label><input type="text" class="form-control"></div><div class="col-md-6"><label class="form-label">Nachname</label><input type="text" class="form-control"></div><div class="col-12"><label class="form-label">E-Mail</label><input type="email" class="form-control"></div><div class="col-12"><label class="form-label">Nachricht</label><textarea class="form-control" rows="5"></textarea></div><div class="col-12"><div class="form-check"><input class="form-check-input" type="checkbox" id="privacy"><label class="form-check-label" for="privacy">Datenschutz akzeptiert</label></div></div><div class="col-12"><button class="btn btn-primary" type="submit">Absenden</button></div></form></div></section>');
    add('bs5-floating-form', 'Floating Labels', 'BS5 · Forms', '<div class="vstack gap-3"><div class="form-floating"><input type="email" class="form-control" id="floatingEmail" placeholder="name@example.de"><label for="floatingEmail">E-Mail-Adresse</label></div><div class="form-floating"><textarea class="form-control" placeholder="Nachricht" id="floatingMessage" style="height: 140px"></textarea><label for="floatingMessage">Nachricht</label></div></div>');
    add('bs5-input-group', 'Input Group', 'BS5 · Forms', '<div class="input-group"><span class="input-group-text">@</span><input type="text" class="form-control" placeholder="Benutzername"><button class="btn btn-outline-secondary" type="button">Prüfen</button></div>');

    const accordionId = uid('accordion');
    add('bs5-accordion', 'Accordion', 'BS5 · Components', `<div class="accordion" id="${accordionId}"><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${accordionId}-one">Bereich 1</button></h2><div id="${accordionId}-one" class="accordion-collapse collapse show" data-bs-parent="#${accordionId}"><div class="accordion-body">Inhalt des ersten Bereichs.</div></div></div><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${accordionId}-two">Bereich 2</button></h2><div id="${accordionId}-two" class="accordion-collapse collapse" data-bs-parent="#${accordionId}"><div class="accordion-body">Inhalt des zweiten Bereichs.</div></div></div></div>`);
    add('bs5-alerts', 'Alerts', 'BS5 · Components', '<div class="vstack gap-2"><div class="alert alert-primary" role="alert">Primärer Hinweis</div><div class="alert alert-success" role="alert">Erfolgreiche Aktion</div><div class="alert alert-warning alert-dismissible fade show" role="alert">Warnung<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Schließen"></button></div></div>');
    add('bs5-buttons', 'Buttons', 'BS5 · Components', '<div class="d-flex flex-wrap gap-2"><a class="btn btn-primary" href="#">Primary</a><a class="btn btn-secondary" href="#">Secondary</a><a class="btn btn-outline-primary" href="#">Outline</a><a class="btn btn-link" href="#">Link</a></div>');
    add('bs5-card', 'Card', 'BS5 · Components', '<article class="card shadow-sm"><img src="assets/images/logo.svg" class="card-img-top" alt=""><div class="card-body"><h3 class="card-title h5">Card-Titel</h3><p class="card-text">Kurzer Beschreibungstext.</p><a href="#" class="btn btn-primary">Mehr erfahren</a></div></article>');
    add('bs5-card-grid', 'Card-Grid', 'BS5 · Components', '<section class="py-5"><div class="container"><div class="row row-cols-1 row-cols-md-3 g-4"><div class="col"><div class="card h-100 shadow-sm"><div class="card-body"><h3 class="h5">Card 1</h3><p>Inhalt</p></div></div></div><div class="col"><div class="card h-100 shadow-sm"><div class="card-body"><h3 class="h5">Card 2</h3><p>Inhalt</p></div></div></div><div class="col"><div class="card h-100 shadow-sm"><div class="card-body"><h3 class="h5">Card 3</h3><p>Inhalt</p></div></div></div></div></div></section>');
    const carouselId = uid('carousel');
    add('bs5-carousel', 'Carousel', 'BS5 · Components', `<div id="${carouselId}" class="carousel slide"><div class="carousel-indicators"><button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="0" class="active" aria-current="true"></button><button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="1"></button></div><div class="carousel-inner"><div class="carousel-item active"><img src="assets/images/logo.svg" class="d-block w-100" alt=""><div class="carousel-caption"><h5>Erstes Bild</h5></div></div><div class="carousel-item"><img src="assets/images/logo.svg" class="d-block w-100" alt=""><div class="carousel-caption"><h5>Zweites Bild</h5></div></div></div><button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button><button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button></div>`);
    add('bs5-dropdown', 'Dropdown', 'BS5 · Components', '<div class="dropdown"><button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">Dropdown</button><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">Aktion</a></li><li><a class="dropdown-item" href="#">Weitere Aktion</a></li><li><hr class="dropdown-divider"></li><li><a class="dropdown-item" href="#">Getrennter Link</a></li></ul></div>');
    add('bs5-list-group', 'List Group', 'BS5 · Components', '<div class="list-group"><a href="#" class="list-group-item list-group-item-action active">Aktiver Eintrag</a><a href="#" class="list-group-item list-group-item-action">Zweiter Eintrag</a><a href="#" class="list-group-item list-group-item-action">Dritter Eintrag</a></div>');
    const modalId = uid('modal');
    add('bs5-modal', 'Modal', 'BS5 · Components', `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${modalId}">Modal öffnen</button><div class="modal fade" id="${modalId}" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h2 class="modal-title fs-5">Modal-Titel</h2><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><p>Modal-Inhalt.</p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button><button type="button" class="btn btn-primary">Speichern</button></div></div></div></div>`);
    add('bs5-navbar', 'Navbar', 'BS5 · Components', '<nav class="navbar navbar-expand-lg bg-body-tertiary"><div class="container"><a class="navbar-brand" href="#">Marke</a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="mainNavbar"><ul class="navbar-nav me-auto mb-2 mb-lg-0"><li class="nav-item"><a class="nav-link active" href="#">Start</a></li><li class="nav-item"><a class="nav-link" href="#">Leistungen</a></li><li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Mehr</a><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">Unterseite</a></li></ul></li></ul><a class="btn btn-primary" href="#">Kontakt</a></div></div></nav>');
    add('bs5-tabs', 'Tabs', 'BS5 · Components', '<div><ul class="nav nav-tabs" role="tablist"><li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-one" type="button">Tab 1</button></li><li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-two" type="button">Tab 2</button></li></ul><div class="tab-content border border-top-0 p-4"><div class="tab-pane fade show active" id="tab-one">Inhalt 1</div><div class="tab-pane fade" id="tab-two">Inhalt 2</div></div></div>');
    const offcanvasId = uid('offcanvas');
    add('bs5-offcanvas', 'Offcanvas', 'BS5 · Components', `<button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#${offcanvasId}">Offcanvas öffnen</button><div class="offcanvas offcanvas-start" tabindex="-1" id="${offcanvasId}"><div class="offcanvas-header"><h2 class="offcanvas-title fs-5">Offcanvas</h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button></div><div class="offcanvas-body">Inhalt der seitlichen Fläche.</div></div>`);
    add('bs5-pagination', 'Pagination', 'BS5 · Components', '<nav aria-label="Seitennavigation"><ul class="pagination"><li class="page-item disabled"><a class="page-link" href="#">Zurück</a></li><li class="page-item active"><a class="page-link" href="#">1</a></li><li class="page-item"><a class="page-link" href="#">2</a></li><li class="page-item"><a class="page-link" href="#">Weiter</a></li></ul></nav>');
    add('bs5-progress', 'Progress', 'BS5 · Components', '<div class="vstack gap-3"><div class="progress" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:25%">25%</div></div><div class="progress" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar bg-success" style="width:75%">75%</div></div></div>');
    add('bs5-spinners', 'Spinner', 'BS5 · Components', '<div class="d-flex gap-3 align-items-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lädt …</span></div><div class="spinner-grow text-success" role="status"><span class="visually-hidden">Lädt …</span></div></div>');
    add('bs5-toast', 'Toast', 'BS5 · Components', '<div class="toast show" role="alert"><div class="toast-header"><strong class="me-auto">Hinweis</strong><small>gerade eben</small><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div><div class="toast-body">Das ist eine Toast-Nachricht.</div></div>');

    add('bs5-ratio', 'Responsive Ratio', 'BS5 · Helpers', '<div class="ratio ratio-16x9"><iframe src="about:blank" title="Responsive Einbettung" allowfullscreen></iframe></div>');
    add('bs5-stacks', 'Stacks', 'BS5 · Helpers', '<div class="vstack gap-3"><div class="p-3 bg-body-tertiary border rounded">Element 1</div><div class="p-3 bg-body-tertiary border rounded">Element 2</div><div class="hstack gap-3"><button class="btn btn-primary">Speichern</button><div class="vr"></div><button class="btn btn-outline-danger">Löschen</button></div></div>');
    add('bs5-utilities-flex', 'Flex-Utilities', 'BS5 · Utilities', '<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-4 border rounded"><div><h3 class="h5 mb-1">Flex-Inhalt</h3><p class="mb-0 text-body-secondary">Responsive ausgerichtet.</p></div><a class="btn btn-primary flex-shrink-0" href="#">Aktion</a></div>');
    add('bs5-utilities-spacing', 'Spacing & Farben', 'BS5 · Utilities', '<div class="p-3 p-md-5 bg-primary-subtle text-primary-emphasis border border-primary-subtle rounded-4 shadow-sm"><h3>Utility-Beispiel</h3><p class="mb-0">Abstände, Farben, Rahmen, Radius und Schatten über Bootstrap 5.3.</p></div>');
    add('bs5-gallery-classic', 'Bildergalerie BS5', 'BS5 · Galerie', '<div data-oluntir-gallery-launcher="bs5" aria-label="BS5-Gallery konfigurieren"></div>');
  };
})();

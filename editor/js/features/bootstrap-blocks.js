(function () {
  const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  const section = (html) => `<section class="py-5"><div class="container">${html}</div></section>`;

  function markup(id, version) {
    const bs5 = version === 'bs5';
    const toggle = bs5 ? 'data-bs-toggle' : 'data-toggle';
    const target = bs5 ? 'data-bs-target' : 'data-target';
    const dismiss = bs5 ? 'data-bs-dismiss' : 'data-dismiss';
    const close = bs5 ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Schließen"></button>' : '<button type="button" class="close" data-dismiss="alert" aria-label="Schließen"><span aria-hidden="true">&times;</span></button>';
    const gap = bs5 ? 'g-4' : '';
    const muted = bs5 ? 'text-body-secondary' : 'text-muted';
    const bgLight = bs5 ? 'bg-body-tertiary' : 'bg-light';
    const badge = bs5 ? 'badge text-bg-primary' : 'badge badge-primary';
    const ratio = bs5 ? '<div class="ratio ratio-16x9"><iframe src="about:blank" title="Responsive Inhalt"></iframe></div>' : '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="about:blank" title="Responsive Inhalt"></iframe></div>';
    const videoFrameClass = bs5 ? 'ratio ratio-16x9 bg-dark rounded overflow-hidden' : 'embed-responsive embed-responsive-16by9 bg-dark rounded';
    const videoClass = bs5 ? 'w-100 h-100' : 'embed-responsive-item';
    const videoMarkup = section(`<div class="${videoFrameClass}"><video class="${videoClass}" data-oluntir-bootstrap-video="${version}" controls preload="metadata" playsinline poster="assets/images/logo.svg"><source data-oluntir-video-source="webm" src="assets/media/video.webm" type="video/webm"><source data-oluntir-video-source="mp4" src="assets/media/video.mp4" type="video/mp4"><source data-oluntir-video-source="ogg" src="assets/media/video.ogv" type="video/ogg">Ihr Browser unterstützt HTML5-Video nicht. <a data-oluntir-video-fallback="inline" href="assets/media/video.mp4" download>Video herunterladen</a>.</video></div><p class="small ${muted} mt-2 mb-0">Falls die Wiedergabe nicht startet: <a data-oluntir-video-fallback="download" href="assets/media/video.mp4" download>MP4 herunterladen</a>. Quellen und Poster können über die Video-Eigenschaften angepasst werden.</p>`);
    const modalId=uid('pbModal'), collapseId=uid('pbCollapse'), accId=uid('pbAccordion'), carId=uid('pbCarousel');
    const m = {
      'layout-breakpoints': section('<h2>Responsive Breakpoints</h2><div class="row"><div class="col-12 col-sm-6 col-md-4 col-lg-3"><div class="p-3 border">Responsiver Bereich</div></div></div>'),
      'layout-containers': '<section class="py-4"><div class="container border p-4 mb-3">Container</div><div class="container-fluid border p-4">Container fluid</div></section>',
      'layout-grid': section(`<div class="row ${gap}"><div class="col-12 col-md-4"><div class="p-3 border">Spalte 1</div></div><div class="col-12 col-md-4"><div class="p-3 border">Spalte 2</div></div><div class="col-12 col-md-4"><div class="p-3 border">Spalte 3</div></div></div>`),
      'layout-columns': section('<div class="row align-items-center"><div class="col-md-8"><div class="p-3 border">Breite Spalte</div></div><div class="col-md-4"><div class="p-3 border">Schmale Spalte</div></div></div>'),
      'layout-gutters': section(`<div class="row ${bs5?'gx-5 gy-3':'mx-n3'}"><div class="col-md-6"><div class="p-3 border">Gutter A</div></div><div class="col-md-6"><div class="p-3 border">Gutter B</div></div></div>`),
      'layout-utilities': section('<div class="d-flex justify-content-between align-items-center p-3 border"><span>Ausrichtung</span><span>Utility</span></div>'),
      'layout-zindex': section('<div class="position-relative" style="height:160px"><div class="position-absolute p-4 bg-primary text-white" style="left:20px;top:20px;z-index:1">Ebene 1</div><div class="position-absolute p-4 bg-warning" style="left:80px;top:60px;z-index:2">Ebene 2</div></div>'),
      'layout-cssgrid': section(bs5?'<div class="d-grid gap-3"><div class="p-3 border">CSS Grid Element 1</div><div class="p-3 border">CSS Grid Element 2</div></div>':'<p class="alert alert-info">CSS Grid ist kein Bestandteil des Bootstrap-4-Profils.</p>'),
      'content-reboot': section('<h1>Reboot-Beispiel</h1><p>Normalisierte HTML-Basiselemente.</p><hr><code>const bootstrap = true;</code>'),
      'content-typography': section('<h1 class="display-4">Display</h1><p class="lead">Lead-Text und <mark>Markierung</mark>.</p><blockquote class="blockquote"><p>Zitat</p><footer class="blockquote-footer">Quelle</footer></blockquote>'),
      'content-images': section('<img src="assets/images/logo.svg" class="img-fluid rounded" alt="Responsives Beispielbild">'),
      'content-tables': section('<div class="table-responsive"><table class="table table-striped table-hover"><thead><tr><th>Name</th><th>Status</th></tr></thead><tbody><tr><td>Eintrag</td><td>Aktiv</td></tr><tr><td>Weiterer Eintrag</td><td>Offen</td></tr></tbody></table></div>'),
      'content-figures': section('<figure class="figure"><img src="assets/images/logo.svg" class="figure-img img-fluid rounded" alt="Beispiel"><figcaption class="figure-caption">Bildunterschrift</figcaption></figure>'),
      'content-video': videoMarkup,
      'forms-overview': section('<form><div class="form-group mb-3"><label class="form-label">E-Mail</label><input class="form-control" type="email"></div><div class="form-group mb-3"><label class="form-label">Nachricht</label><textarea class="form-control" rows="4"></textarea></div><button class="btn btn-primary">Absenden</button></form>'),
      'forms-control': section('<label class="form-label">Form Control</label><input class="form-control mb-3" placeholder="Text"><textarea class="form-control" rows="3" placeholder="Textarea"></textarea>'),
      'forms-select': section('<label class="form-label">Auswahl</label><select class="form-control"><option>Option 1</option><option>Option 2</option></select>'),
      'forms-checks': section('<div class="form-check"><input class="form-check-input" type="checkbox" id="check1"><label class="form-check-label" for="check1">Checkbox</label></div><div class="form-check"><input class="form-check-input" type="radio" name="radio" id="radio1"><label class="form-check-label" for="radio1">Radio</label></div>'),
      'forms-range': section('<label class="form-label">Bereich</label><input type="range" class="form-range custom-range" min="0" max="100">'),
      'forms-input-group': section('<div class="input-group"><span class="input-group-text input-group-prepend"><span class="input-group-text">@</span></span><input class="form-control" placeholder="Benutzername"><button class="btn btn-outline-secondary" type="button">Prüfen</button></div>'),
      'forms-floating': section(bs5?'<div class="form-floating"><input class="form-control" id="floatingInput" placeholder="name@example.de"><label for="floatingInput">E-Mail</label></div>':'<p class="alert alert-info">Floating Labels gehören nicht zum Bootstrap-4-Kern.</p>'),
      'forms-layout': section(`<form><div class="form-row row ${gap}"><div class="form-group col-md-6 mb-3"><label>Vorname</label><input class="form-control"></div><div class="form-group col-md-6 mb-3"><label>Nachname</label><input class="form-control"></div></div></form>`),
      'forms-validation': section('<form class="was-validated"><label class="form-label">Pflichtfeld</label><input class="form-control" required><div class="valid-feedback">In Ordnung</div><div class="invalid-feedback">Bitte ausfüllen</div></form>'),
      'forms-custom': bs5 ? null : section('<div class="custom-control custom-checkbox mb-3"><input type="checkbox" class="custom-control-input" id="customCheck1"><label class="custom-control-label" for="customCheck1">Custom Checkbox</label></div><select class="custom-select mb-3"><option selected>Custom Select</option><option>Option 2</option></select><div class="custom-file"><input type="file" class="custom-file-input" id="customFile1"><label class="custom-file-label" for="customFile1">Datei auswählen</label></div>'),
      'comp-accordion': section(bs5?`<div class="accordion" id="${accId}"><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">Accordion</button></h2><div id="${collapseId}" class="accordion-collapse collapse show" data-bs-parent="#${accId}"><div class="accordion-body">Inhalt</div></div></div></div>`:`<div id="${accId}"><div class="card"><div class="card-header"><button class="btn btn-link" data-toggle="collapse" data-target="#${collapseId}">Accordion</button></div><div id="${collapseId}" class="collapse show" data-parent="#${accId}"><div class="card-body">Inhalt</div></div></div></div>`),
      'comp-alerts': section(`<div class="alert alert-warning alert-dismissible fade show" role="alert"><strong>Hinweis:</strong> Beispielmeldung.${close}</div>`),
      'comp-badge': section(`<h3>Überschrift <span class="${badge}">Neu</span></h3>`),
      'comp-breadcrumb': section('<nav aria-label="Breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="#">Start</a></li><li class="breadcrumb-item active" aria-current="page">Seite</li></ol></nav>'),
      'comp-buttons': section('<button class="btn btn-primary mr-2 me-2">Primary</button><button class="btn btn-outline-secondary">Outline</button>'),
      'comp-button-group': section('<div class="btn-group" role="group"><button class="btn btn-primary">Links</button><button class="btn btn-primary">Mitte</button><button class="btn btn-primary">Rechts</button></div>'),
      'comp-card': section('<div class="card" style="max-width:24rem"><img src="assets/images/logo.svg" class="card-img-top" alt=""><div class="card-body"><h3 class="card-title">Card</h3><p class="card-text">Karteninhalt.</p><a href="#" class="btn btn-primary">Aktion</a></div></div>'),
      'comp-carousel': section(`<div id="${carId}" class="carousel slide" data-ride="carousel" data-bs-ride="carousel"><div class="carousel-inner"><div class="carousel-item active"><img src="assets/images/logo.svg" class="d-block w-100" alt="Slide 1"></div><div class="carousel-item"><img src="assets/images/logo.svg" class="d-block w-100" alt="Slide 2"></div></div><button class="carousel-control-prev" type="button" ${target}="#${carId}" ${toggle}="carousel" data-slide="prev" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button><button class="carousel-control-next" type="button" ${target}="#${carId}" ${toggle}="carousel" data-slide="next" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button></div>`),
      'comp-close': section(bs5?'<button class="btn-close" aria-label="Schließen"></button>':'<button class="close" aria-label="Schließen"><span aria-hidden="true">&times;</span></button>'),
      'comp-collapse': section(`<button class="btn btn-primary" ${toggle}="collapse" ${target}="#${collapseId}">Ein-/ausblenden</button><div id="${collapseId}" class="collapse mt-3"><div class="card card-body">Collapse-Inhalt</div></div>`),
      'comp-dropdown': section(`<div class="dropdown"><button class="btn btn-primary dropdown-toggle" ${toggle}="dropdown">Menü</button><div class="dropdown-menu"><a class="dropdown-item" href="#">Aktion</a><a class="dropdown-item" href="#">Weitere Aktion</a></div></div>`),
      'comp-list-group': section('<div class="list-group"><a href="#" class="list-group-item list-group-item-action active">Aktiv</a><a href="#" class="list-group-item list-group-item-action">Eintrag</a></div>'),
      'comp-modal': section(`<button class="btn btn-primary" ${toggle}="modal" ${target}="#${modalId}">Modal öffnen</button><div class="modal fade" id="${modalId}" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Modal</h5>${bs5?'<button class="btn-close" data-bs-dismiss="modal"></button>':'<button class="close" data-dismiss="modal"><span>&times;</span></button>'}</div><div class="modal-body">Inhalt</div><div class="modal-footer"><button class="btn btn-secondary" ${dismiss}="modal">Schließen</button></div></div></div></div>`),
      'comp-navs': section(`<ul class="nav nav-tabs"><li class="nav-item"><a class="nav-link active" ${toggle}="tab" href="#">Aktiv</a></li><li class="nav-item"><a class="nav-link" href="#">Link</a></li></ul>`),
      'comp-navbar': `<nav class="navbar navbar-expand-lg navbar-light bg-light px-3"><a class="navbar-brand" href="#">Marke</a><button class="navbar-toggler" type="button" ${toggle}="collapse" ${target}="#nav-${modalId}"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="nav-${modalId}"><ul class="navbar-nav ml-auto ms-auto"><li class="nav-item"><a class="nav-link active" href="#">Start</a></li><li class="nav-item"><a class="nav-link" href="#">Kontakt</a></li></ul></div></nav>`,
      'comp-offcanvas': section(bs5?`<button class="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#off-${modalId}">Offcanvas öffnen</button><div class="offcanvas offcanvas-start" id="off-${modalId}"><div class="offcanvas-header"><h5>Offcanvas</h5><button class="btn-close" data-bs-dismiss="offcanvas"></button></div><div class="offcanvas-body">Inhalt</div></div>`:'<p class="alert alert-info">Offcanvas gehört nicht zum Bootstrap-4-Kern.</p>'),
      'comp-pagination': section('<nav><ul class="pagination"><li class="page-item disabled"><a class="page-link" href="#">Zurück</a></li><li class="page-item active"><a class="page-link" href="#">1</a></li><li class="page-item"><a class="page-link" href="#">2</a></li></ul></nav>'),
      'comp-placeholders': section(bs5?'<p class="placeholder-glow"><span class="placeholder col-8"></span></p><a class="btn btn-primary disabled placeholder col-4"></a>':'<p class="alert alert-info">Placeholders gehören nicht zum Bootstrap-4-Kern.</p>'),
      'comp-popovers': section(`<button class="btn btn-secondary" ${toggle}="popover" title="Popover" data-content="Popover-Inhalt" data-bs-content="Popover-Inhalt">Popover</button>`),
      'comp-progress': section('<div class="progress"><div class="progress-bar" style="width:65%">65%</div></div>'),
      'comp-scrollspy': section('<nav class="navbar navbar-light bg-light"><a class="navbar-brand" href="#bereich1">Scrollspy</a></nav><div style="height:180px;overflow:auto"><h4 id="bereich1">Bereich 1</h4><p>Scroll-Inhalt</p><h4>Bereich 2</h4><p>Weiterer Inhalt</p></div>'),
      'comp-spinners': section('<div class="spinner-border text-primary" role="status"><span class="sr-only visually-hidden">Lädt...</span></div>'),
      'comp-toasts': section(`<div class="toast show" role="alert"><div class="toast-header"><strong class="mr-auto me-auto">Hinweis</strong><button class="${bs5?'btn-close':'close'}" ${dismiss}="toast"></button></div><div class="toast-body">Toast-Nachricht</div></div>`),
      'comp-tooltips': section(`<button class="btn btn-secondary" ${toggle}="tooltip" title="Tooltip-Text">Tooltip</button>`),
      'comp-jumbotron': bs5 ? null : '<section class="jumbotron"><div class="container"><h1 class="display-4">Jumbotron</h1><p class="lead">Großer Bootstrap-4-Hinweisbereich für Marketing- oder Informationsinhalte.</p><hr class="my-4"><p>Weiterführender Inhalt.</p><a class="btn btn-primary btn-lg" href="#">Mehr erfahren</a></div></section>',
      'comp-media-object': bs5 ? null : section('<div class="media"><img src="assets/images/logo.svg" class="mr-3" style="width:72px;height:72px" alt="Beispiel"><div class="media-body"><h5 class="mt-0">Media object</h5><p>Medieninhalt neben einem flexiblen Textbereich.</p></div></div>'),
      'helpers-clearfix': section('<div class="clearfix border p-3"><span class="float-left float-start">Links</span><span class="float-right float-end">Rechts</span></div>'),
      'helpers-color-bg': section(`<div class="p-4 bg-primary text-white">Farbe und Hintergrund</div>`),
      'helpers-colored-links': section(`<a href="#" class="link-primary text-primary">Farbiger Link</a>`),
      'helpers-focus-ring': section(bs5?'<a class="d-inline-flex focus-ring focus-ring-success py-1 px-2 text-decoration-none border rounded" href="#">Focus Ring</a>':'<p class="alert alert-info">Focus Ring ist eine Bootstrap-5-Hilfe.</p>'),
      'helpers-icon-link': section(bs5?'<a class="icon-link" href="#">Icon Link <span aria-hidden="true">→</span></a>':'<a href="#">Link mit Icon →</a>'),
      'helpers-position': section('<div class="position-relative border" style="height:130px"><span class="position-absolute top-0 start-0 p-2 bg-primary text-white">Positioniert</span></div>'),
      'helpers-ratio': section(ratio),
      'helpers-stacks': section(bs5?'<div class="vstack gap-3"><div class="p-2 border">Element 1</div><div class="p-2 border">Element 2</div></div>':'<div class="d-flex flex-column"><div class="p-2 border mb-2">Element 1</div><div class="p-2 border">Element 2</div></div>'),
      'helpers-stretched-link': section('<div class="card position-relative"><div class="card-body"><h3>Card</h3><p>Gesamte Karte anklickbar.</p><a href="#" class="stretched-link">Öffnen</a></div></div>'),
      'helpers-text-truncation': section('<div class="text-truncate" style="max-width:260px">Sehr langer Text, der bei unzureichender Breite abgeschnitten wird.</div>'),
      'helpers-vertical-rule': section(bs5?'<div class="d-flex" style="height:90px"><div>Links</div><div class="vr mx-3"></div><div>Rechts</div></div>':'<div class="d-flex"><div class="pr-3 border-right">Links</div><div class="pl-3">Rechts</div></div>'),
      'helpers-visually-hidden': section(`<button class="btn btn-primary">Symbol <span class="${bs5?'visually-hidden':'sr-only'}">Zusatztext für Screenreader</span></button>`),
      'util-api': section('<p class="p-3 border">Utility API: kombinierbare Hilfsklassen als Baustein.</p>'),
      'util-background': section(`<div class="p-4 bg-success text-white">Hintergrund</div>`),
      'util-borders': section('<div class="p-4 border border-primary rounded">Rahmen</div>'),
      'util-colors': section('<p class="text-primary">Primärfarbe</p><p class="text-success">Erfolgsfarbe</p>'),
      'util-display': section('<div class="d-none d-md-block p-3 border">Ab md sichtbar</div>'),
      'util-flex': section('<div class="d-flex justify-content-around align-items-center p-3 border"><span>Flex 1</span><span>Flex 2</span></div>'),
      'util-float': section('<div class="clearfix"><span class="float-left float-start">Links</span><span class="float-right float-end">Rechts</span></div>'),
      'util-interactions': section(bs5?'<p class="user-select-all">Dieser Text lässt sich vollständig auswählen.</p>':'<p class="alert alert-info">Interaction Utilities sind in BS5 erweitert.</p>'),
      'util-link': section(bs5?'<a class="link-offset-2 link-underline link-underline-opacity-0" href="#">Link Utility</a>':'<a class="text-decoration-none" href="#">Link Utility</a>'),
      'util-object-fit': section(bs5?'<img src="assets/images/logo.svg" class="object-fit-cover w-100" style="height:220px" alt="Object fit">':'<img src="assets/images/logo.svg" class="w-100" style="height:220px;object-fit:cover" alt="Object fit">'),
      'util-opacity': section(bs5?'<div class="p-4 bg-primary text-white opacity-50">50 % Deckkraft</div>':'<div class="p-4 bg-primary text-white" style="opacity:.5">50 % Deckkraft</div>'),
      'util-overflow': section('<div class="overflow-auto border p-2" style="height:100px"><div style="height:220px">Scrollbarer Inhalt</div></div>'),
      'util-position': section('<div class="position-relative border" style="height:120px"><div class="position-absolute bottom-0 right-0 end-0 p-2 bg-warning">Unten rechts</div></div>'),
      'util-shadows': section('<div class="p-4 shadow rounded">Schatten</div>'),
      'util-sizing': section('<div class="w-75 p-3 bg-primary text-white">75 % Breite</div>'),
      'util-spacing': section('<div class="m-3 p-4 border">Margin und Padding</div>'),
      'util-text': section(`<p class="text-center text-uppercase font-weight-bold fw-bold ${muted}">Text Utilities</p>`),
      'util-vertical-align': section('<span class="align-baseline">baseline</span> <span class="align-top">top</span> <span class="align-middle">middle</span>'),
      'util-visibility': section('<div class="visible">Sichtbar</div><div class="invisible">Unsichtbar</div>'),
      'util-zindex': section(bs5?'<div class="position-relative" style="height:110px"><div class="position-absolute z-1 p-3 bg-primary text-white">z-1</div><div class="position-absolute z-2 p-3 bg-warning" style="left:70px;top:35px">z-2</div></div>':'<p class="alert alert-info">Benannte z-index Utilities sind in Bootstrap 5 verfügbar.</p>'),
      'gallery': bs5 ? '<div data-oluntir-gallery-launcher="bs5" aria-label="BS5-Gallery konfigurieren"></div>' : section('<div class="row"><div class="col-md-4 mb-3"><img class="img-fluid" src="assets/images/logo.svg" alt="Galeriebild"></div><div class="col-md-4 mb-3"><img class="img-fluid" src="assets/images/logo.svg" alt="Galeriebild"></div><div class="col-md-4 mb-3"><img class="img-fluid" src="assets/images/logo.svg" alt="Galeriebild"></div></div>')
    };
    return m[id];
  }

  const groups = [
    ['Layout', [['layout-breakpoints','Breakpoints'],['layout-containers','Containers'],['layout-grid','Grid'],['layout-columns','Columns'],['layout-gutters','Gutters'],['layout-utilities','Utilities for layout'],['layout-zindex','Z-index'],['layout-cssgrid','CSS Grid']]],
    ['Content', [['content-reboot','Reboot'],['content-typography','Typography'],['content-images','Images'],['content-tables','Tables'],['content-figures','Figures'],['content-video','Video (HTML5)']]],
    ['Forms', [['forms-overview','Overview'],['forms-control','Form control'],['forms-select','Select'],['forms-checks','Checks & radios'],['forms-range','Range'],['forms-input-group','Input group'],['forms-floating','Floating labels'],['forms-layout','Layout'],['forms-validation','Validation'],['forms-custom','Custom forms (BS4)']]],
    ['Components', [['comp-accordion','Accordion'],['comp-alerts','Alerts'],['comp-badge','Badge'],['comp-breadcrumb','Breadcrumb'],['comp-buttons','Buttons'],['comp-button-group','Button group'],['comp-card','Card'],['comp-carousel','Carousel'],['comp-close','Close button'],['comp-collapse','Collapse'],['comp-dropdown','Dropdowns'],['comp-list-group','List group'],['comp-modal','Modal'],['comp-navs','Navs & tabs'],['comp-navbar','Navbar'],['comp-offcanvas','Offcanvas'],['comp-pagination','Pagination'],['comp-placeholders','Placeholders'],['comp-popovers','Popovers'],['comp-progress','Progress'],['comp-scrollspy','Scrollspy'],['comp-spinners','Spinners'],['comp-toasts','Toasts'],['comp-tooltips','Tooltips'],['comp-jumbotron','Jumbotron (BS4)'],['comp-media-object','Media object (BS4)']]],
    ['Helpers', [['helpers-clearfix','Clearfix'],['helpers-color-bg','Color & background'],['helpers-colored-links','Colored links'],['helpers-focus-ring','Focus ring'],['helpers-icon-link','Icon link'],['helpers-position','Position'],['helpers-ratio','Ratio'],['helpers-stacks','Stacks'],['helpers-stretched-link','Stretched link'],['helpers-text-truncation','Text truncation'],['helpers-vertical-rule','Vertical rule'],['helpers-visually-hidden','Visually hidden']]],
    ['Utilities', [['util-api','API'],['util-background','Background'],['util-borders','Borders'],['util-colors','Colors'],['util-display','Display'],['util-flex','Flex'],['util-float','Float'],['util-interactions','Interactions'],['util-link','Link'],['util-object-fit','Object fit'],['util-opacity','Opacity'],['util-overflow','Overflow'],['util-position','Position'],['util-shadows','Shadows'],['util-sizing','Sizing'],['util-spacing','Spacing'],['util-text','Text'],['util-vertical-align','Vertical align'],['util-visibility','Visibility'],['util-zindex','Z-index']]],
    ['Galerie', [['gallery','Responsive Bildergalerie']]]
  ];

  function quickTypeFor(id) {
    if (['layout-grid', 'layout-columns', 'layout-gutters'].includes(id)) return 'grid';
    if (id === 'gallery') return 'gallery';
    if (id === 'comp-navbar') return 'navbar';
    return '';
  }

  function addQuickMarker(content, type) {
    if (!type || !content) return content;
    return content.replace(/^(\s*<[^>\s]+)/, `$1 data-pb-quick=\"${type}\"`);
  }

  window.registerBootstrapBlocks = function (editor, version) {
    const bm = editor.BlockManager;
    groups.forEach(([group, entries]) => entries.forEach(([id,label]) => {
      const content = addQuickMarker(markup(id, version), quickTypeFor(id));
      if (content) bm.add(`${version}-${id}`, { label, category: `${version.toUpperCase()} · ${group}`, content });
    }));
  };
})();

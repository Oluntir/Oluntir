// GrapesJS-Setup für die neutrale Bootstrap Community Edition.
// Läuft komplett lokal im Browser (file://), kein Backend nötig.

const ACTIVE_FRAMEWORK = window.PAGEBUILDER_FRAMEWORK || window.PAGEBUILDER_FRAMEWORKS.bs4;
const SITE_CSS = ACTIVE_FRAMEWORK.canvasStyles;
const SITE_JS = ACTIVE_FRAMEWORK.canvasScripts;
const oluntirT = (key, vars) => window.OluntirI18N ? window.OluntirI18N.t(key, vars) : key;
const oluntirTr = (text) => window.OluntirI18N ? window.OluntirI18N.translateText(text) : text;

let editor;

// Zuvor hochgeladene Bilder aus IndexedDB laden (siehe asset-store.js). Läuft bewusst
// PARALLEL zur Editor-Initialisierung, nicht davor: IndexedDB kann sich in manchen
// Browser-/Sicherheitskonfigurationen (z. B. unter file://) langsam verhalten oder sogar
// hängen bleiben – der Editor selbst (Design, Bausteine, Bedienung) darf davon niemals
// abhängen und muss immer laden, auch wenn diese Zusatzfunktion mal ausfällt.
const assetHydration = Promise.race([
  hydrateAssetStore().catch((e) => {
    console.warn('Eigene Bilder konnten nicht geladen werden (IndexedDB):', e);
    return 0;
  }),
  new Promise((resolve) => setTimeout(() => resolve('timeout'), 4000)),
]);

(async function initPageBuilder() {
  if (window.OluntirStartup && window.OluntirStartup.ready) {
    await window.OluntirStartup.ready;
  }
  editor = grapesjs.init({
    container: '#gjs',
    height: '100%',
    width: '100%',
    fromElement: false,
    storageManager: {
      type: 'local',
      autosave: true,
      autoload: true,
      stepsBeforeSave: 1,
      options: { local: { key: ACTIVE_FRAMEWORK.storageKey } },
    },
    pageManager: {},
    canvas: {
      styles: SITE_CSS,
      scripts: SITE_JS,
    },
    deviceManager: {
      devices: [
        { name: oluntirT('device.desktop'), width: '' },
        { name: oluntirT('device.tablet'), width: '768px', widthMedia: '992px' },
        { name: oluntirT('device.mobile'), width: '375px', widthMedia: '575px' },
      ],
    },
    plugins: ['gjs-preset-webpage'],
    pluginsOpts: {
      'gjs-preset-webpage': {
        aviaryOpts: false,
        filestackOpts: null,
        // Aus: die generischen Basis-Bausteine (1/2/3 Columns, Text, Quote, …) tragen
        // keine Bootstrap-/Template-Klassen und sehen dadurch unförmig aus, wenn man sie
        // auf die Seite zieht. Damit wirklich jeder Baustein von Anfang an im
        // Template-Design erscheint (WYSIWYG), gibt es nur noch die echten Template-Bausteine.
        blocksBasicOpts: false,
        navbarOpts: false,
        countdownOpts: false,
        exportOpts: { btnLabel: oluntirT('grapes.code') },
        formsOpts: false,
      },
    },
    assetManager: {
      // Kein Base64: eigene Bilder kommen ausschließlich über "+ Bildergalerie" /
      // "+ Bild hochladen" hinein (siehe weiter unten) und werden dort als echte Dateien
      // registriert (asset-store.js). Die eingebaute Drop-Zone/Upload-Funktion des
      // Asset-Managers bleibt deshalb aus – sie würde sonst wieder Base64 einbetten.
      embedAsBase64: false,
      upload: false,
      dropzone: false,
      assets: (window.SITE_IMAGES || []).map((path) => ({
        type: 'image',
        src: 'assets/' + path,
        name: path.split('/').pop(),
      })),
    },
  });

  if (typeof window.registerTextMediaEditing === 'function') {
    window.registerTextMediaEditing(editor);
  }

  if (typeof window.registerSmartLinkEditing === 'function') {
    window.registerSmartLinkEditing(editor);
  }

  if (typeof window.registerBootstrapBlocks === 'function') {
    window.registerBootstrapBlocks(editor, ACTIVE_FRAMEWORK.id);
  } else if (ACTIVE_FRAMEWORK.id === 'bs5' && typeof window.registerBootstrap5Blocks === 'function') {
    window.registerBootstrap5Blocks(editor);
  }

  if (typeof window.registerPageBuilderVariants === 'function') {
    window.registerPageBuilderVariants(editor, ACTIVE_FRAMEWORK.id);
  }

  if (typeof window.registerQuickSetup === 'function') {
    window.registerQuickSetup(editor, ACTIVE_FRAMEWORK.id);
  }

  if (typeof window.registerQuickEditing === 'function') {
    window.registerQuickEditing(editor);
  }


  function categoryLabel(category) {
    if (typeof category === 'string') return category;
    if (!category) return '';
    return category.get ? (category.get('label') || category.get('id') || '') : (category.label || category.id || '');
  }

  function localizeEditorUi() {
    const blocks = editor.BlockManager.getAll();
    blocks.forEach((block) => {
      if (!block.__oluntirBaseLabel) block.__oluntirBaseLabel = String(block.get('label') || '');
      if (!block.__oluntirBaseCategory) block.__oluntirBaseCategory = String(categoryLabel(block.get('category')) || '');
      block.set('label', oluntirTr(block.__oluntirBaseLabel), { silent: true });
      if (block.__oluntirBaseCategory) block.set('category', oluntirTr(block.__oluntirBaseCategory), { silent: true });
    });
    try { editor.BlockManager.render(); } catch (_) {}

    // Auch die von GrapesJS erzeugten MouseOver-Texte lokal halten.
    document.querySelectorAll('.gjs-pn-btn[title], .gjs-block[title], .gjs-layer-title, .gjs-sm-title, .gjs-trt-trait__label').forEach((el) => {
      if (el.title) {
        if (!el.dataset.oluntirBaseTitle) el.dataset.oluntirBaseTitle = el.title;
        el.title = oluntirTr(el.dataset.oluntirBaseTitle);
        el.setAttribute('aria-label', el.title);
      }
    });
  }

  window.addEventListener('oluntir:languagechange', () => window.requestAnimationFrame(localizeEditorUi));
  editor.on('load block:add block:update', () => window.requestAnimationFrame(localizeEditorUi));
  window.requestAnimationFrame(localizeEditorUi);

  window.OluntirEditor = editor;
  if (window.OluntirSharedContentManager && typeof window.OluntirSharedContentManager.bind === 'function') {
    window.OluntirSharedContentManager.bind(editor);
  }
  window.dispatchEvent(new CustomEvent('oluntir:editorready'));

  // Ein paar generische Bausteine registriert grapesjs-preset-webpage unabhängig von
  // blocksBasicOpts. Auch die entfernen, damit ausschließlich fertig gestylte
  // Template-Bausteine zur Auswahl stehen (echtes WYSIWYG per Drag & Drop).
  ['link-block', 'quote', 'text-basic'].forEach((id) => editor.BlockManager.remove(id));

  if (typeof window.registerOluntirBlockSearch === 'function') {
    window.registerOluntirBlockSearch(editor);
  }

  // Zuvor hochgeladene Bilder (aus IndexedDB wiederhergestellt, siehe hydrateAssetStore
  // oben) auch wieder als auswählbare Assets im Asset-Manager anbieten – sonst wären sie
  // nach einem Neuladen nur noch über bereits platzierte Komponenten erreichbar.
  // WICHTIG: erst NACH dem "load"-Event registrieren – das automatische Laden des
  // gespeicherten Projekts (autoload) läuft asynchron und überschreibt sonst diese
  // Liste, wenn man sie schon vorher befüllt.
  editor.on('load', async () => {
    // Auf die (parallel zur Editor-Initialisierung laufende) Bild-Wiederherstellung
    // warten, damit hier wirklich alle zuvor hochgeladenen Bilder erfasst werden – das
    // blockiert nur diesen Zusatzschritt, nicht das Laden des Editors selbst.
    await assetHydration;
    assetBlobs.forEach((blob, path) => {
      if (editor.AssetManager.get(path)) return; // nicht doppelt hinzufügen
      editor.AssetManager.add({ type: 'image', src: path, name: path.split('/').pop() });
    });
    // Zweiter, jetzt garantiert vollständiger Anlauf für Bilder, die schon beim ersten
    // (sofortigen) Patch-Versuch nach dem Laden noch nicht auflösbar waren.
    try {
      const win = editor.Canvas.getWindow();
      if (win) patchUploadedImageRefs(win.document);
    } catch (e) {
      /* Vorschau-only */
    }
  });

  // ---------------------------------------------------------------------------
  // Eigene Toolbar: Seitenverwaltung, Speichern, Backup, Export
  // ---------------------------------------------------------------------------

  window.toast = (msg) => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(window.toast._t);
    window.toast._t = setTimeout(() => el.classList.remove('visible'), 2800);
  };
  const toast = window.toast;

  // Sekundäre Werkzeugleiste: häufige, aber nicht platzkritische Funktionen werden
  // als klare Symbole in die bereits vorhandene GrapesJS-Leiste verschoben.
  // Die title-/aria-label-Texte liefern eine verständliche MouseOver-Information.
  function registerSecondaryToolbarTools() {
    const panels = editor.Panels;
    const commandMap = [
      {
        id: 'pb-ui-toolbar-settings',
        icon: 'fa fa-desktop',
        titleKey: 'tool.ui',
        separator: true,
        action: () => document.getElementById('btn-ui-settings').click(),
      },
      {
        id: 'pb-ui-toolbar-save',
        icon: 'fa fa-floppy-o',
        titleKey: 'tool.save',
        action: () => document.getElementById('btn-save').click(),
      },
      {
        id: 'pb-ui-toolbar-backup-save',
        icon: 'fa fa-archive',
        titleKey: 'tool.backupSave',
        action: () => document.getElementById('btn-backup').click(),
      },
      {
        id: 'pb-ui-toolbar-backup-load',
        icon: 'fa fa-folder-open',
        titleKey: 'tool.backupLoad',
        action: () => document.getElementById('input-restore').click(),
      },
    ];

    commandMap.forEach((tool) => {
      const commandId = tool.id + '-command';
      editor.Commands.add(commandId, { run: tool.action });
      panels.addButton('options', {
        id: tool.id,
        className: tool.icon,
        command: commandId,
        attributes: {
          title: window.OluntirI18N ? window.OluntirI18N.t(tool.titleKey) : tool.titleKey,
          'aria-label': window.OluntirI18N ? window.OluntirI18N.t(tool.titleKey) : tool.titleKey,
          'data-pb-toolbar-tool': 'true',
          'data-pb-toolbar-separator': tool.separator ? 'true' : 'false',
        },
      });
    });
    window.addEventListener('oluntir:languagechange', () => {
      commandMap.forEach((tool) => {
        const button = panels.getButton('options', tool.id);
        if (!button) return;
        const title = window.OluntirI18N.t(tool.titleKey);
        button.set('attributes', Object.assign({}, button.get('attributes'), { title, 'aria-label': title }));
      });
    });
  }
  registerSecondaryToolbarTools();

  const frameworkSelect = document.getElementById('framework-select');
  if (frameworkSelect) {
    frameworkSelect.value = ACTIVE_FRAMEWORK.id;
    frameworkSelect.addEventListener('change', () => {
      const next = frameworkSelect.value;
      if (next === ACTIVE_FRAMEWORK.id) return;
      const label = window.PAGEBUILDER_FRAMEWORKS[next].label;
      if (!confirm(oluntirT('framework.switchConfirm', { label }))) {
        frameworkSelect.value = ACTIVE_FRAMEWORK.id;
        return;
      }
      window.setPageBuilderFramework(next);
      location.reload();
    });
  }

  const pageSelect = document.getElementById('page-select');

  function refreshPageList() {
    const pages = editor.Pages.getAll();
    const selected = editor.Pages.getSelected();
    pageSelect.innerHTML = '';
    pages.forEach((page) => {
      const opt = document.createElement('option');
      opt.value = page.id;
      opt.textContent = page.getName() || page.id;
      if (page === selected) opt.selected = true;
      pageSelect.appendChild(opt);
    });
  }

  editor.on('load', () => {
    const pages = editor.Pages.getAll();
    if (pages.length && !pages[0].getName()) {
      pages[0].setName('Startseite (index)');
    }
    refreshPageList();
  });
  editor.on('page', refreshPageList);

  // ---------------------------------------------------------------------------
  // Vorschau-Extras am Leben halten:
  // 1) Lightbox (Klick-Vergrößerung mit Vor/Zurück) – custom.js initialisiert
  //    Magnific-Popup nur einmal beim (anfangs leeren) Laden des Canvas, neue Galerien
  //    bräuchten sonst nie eine funktionierende Vorschau. die Website-Helfer aus custom.js sind
  //    bewusst gekapselt; deshalb wird die Magnific-Popup-Konfiguration hier zusätzlich
  //    direkt gebunden (nur auf Galerien ohne bestehende Instanz).
  // 2) Hochgeladene Bilder: im Datenmodell/Export steht immer der stabile Pfad
  //    "images/uploads/…", für die Anzeige im Canvas muss er live auf die aktuell
  //    gültige blob:-URL umgebogen werden (siehe asset-store.js).
  // ---------------------------------------------------------------------------
  // Bildpfad-Korrektur MUSS sofort/synchron passieren (kein setTimeout-Delay): Sobald ein
  // <img src="images/uploads/…"> ins DOM kommt, startet der Browser augenblicklich einen
  // (zwangsläufig scheiternden) Ladeversuch für diesen nicht auflösbaren Pfad – bei jeder
  // Verzögerung greift GrapesJS' eigene Fehlerbehandlung zuerst und tauscht den Pfad
  // gegen ein Kaputt-Bild-Platzhaltersymbol, das mein späterer Patch dann nicht mehr
  // findet (die Selektor-Übereinstimmung "src^=images/uploads/" ist dann schon weg).
  function patchCanvasUploadedImagesNow() {
    try {
      const win = editor.Canvas.getWindow();
      if (win) patchUploadedImageRefs(win.document);
    } catch (e) {
      /* Nur die Editor-Vorschau betroffen, darf ruhig mal fehlschlagen */
    }
  }
  editor.on('load', patchCanvasUploadedImagesNow);
  editor.on('component:add', patchCanvasUploadedImagesNow);
  editor.on('component:update', patchCanvasUploadedImagesNow);
  editor.on('page', patchCanvasUploadedImagesNow);

  // Lightbox-Bindung ist zeitlich unkritisch (kein Ladefehler-Risiko) und bleibt debounced.
  let reinitTimer = null;
  function reinitLightbox() {
    clearTimeout(reinitTimer);
    reinitTimer = setTimeout(() => {
      try {
        const win = editor.Canvas.getWindow();
        if (!win) return;
        patchUploadedImageRefs(win.document); // Sicherheitsnetz, falls der Sofort-Patch etwas verpasst hat

        const $ = win.jQuery || win.$;
        if (!$ || !$.fn || !$.fn.magnificPopup) return;

        $('.popup-gallery').each(function () {
          const $el = $(this);
          if ($el.data('magnificPopup')) return;
          $el.magnificPopup({
            delegate: 'a.portfolio-img',
            type: 'image',
            tLoading: 'Loading image #%curr%...',
            mainClass: 'mfp-img-mobile',
            gallery: { enabled: true, navigateByImgClick: true, preload: [0, 1] },
          });
        });

        $('.popup-single').each(function () {
          const $el = $(this);
          if ($el.data('magnificPopup')) return;
          $el.magnificPopup({ type: 'image' });
        });
      } catch (e) {
        /* Nur die Editor-Vorschau betroffen, darf ruhig mal fehlschlagen */
      }
    }, 200);
  }
  if (ACTIVE_FRAMEWORK.id === 'bs4') {
    editor.on('load', reinitLightbox);
    editor.on('component:add', reinitLightbox);
    editor.on('page', reinitLightbox);
  }

  // Asset-Manager-Vorschaubilder (liegen im Hauptfenster, nicht im Canvas-iframe) auf
  // dieselbe Art sofort auflösen, sobald sie ins DOM kommen (z. B. beim Öffnen des Panels)
  // – aus demselben Grund ohne Verzögerung.
  const parentPatchObserver = new MutationObserver(() => patchUploadedImageRefs(document));
  parentPatchObserver.observe(document.body, { childList: true, subtree: true });

  function pageComponentHtml(page) {
    if (!page || typeof page.getMainComponent !== 'function') return '';
    const component = page.getMainComponent();
    if (!component) return '';
    if (typeof component.getInnerHTML === 'function') return String(component.getInnerHTML() || '');
    if (typeof editor.getHtml === 'function') {
      try { return String(editor.getHtml({ component }) || ''); } catch (_) { /* Fallback below */ }
    }
    return typeof component.toHTML === 'function' ? String(component.toHTML() || '') : '';
  }

  function reusableRegionsEnabled() {
    const includeState = window.OluntirIncludes && typeof window.OluntirIncludes.getState === 'function'
      ? window.OluntirIncludes.getState()
      : null;
    return Boolean(includeState && includeState.enabled);
  }

  function extractSharedLayoutRegions(page) {
    if (!reusableRegionsEnabled()) return null;
    const template = document.createElement('template');
    template.innerHTML = pageComponentHtml(page);
    const read = (selector) => {
      const element = template.content.querySelector(selector);
      return element ? element.outerHTML : '';
    };
    return {
      header: read('header'),
      navigation: read('nav'),
      footer: read('footer')
    };
  }

  function synchronizeSharedRegionsFromPage(page) {
    if (window.OluntirSharedContentManager && typeof window.OluntirSharedContentManager.flushPage === 'function') {
      return window.OluntirSharedContentManager.flushPage(page);
    }
    if (!page || !window.OluntirIncludes || typeof window.OluntirIncludes.updateLayoutRegions !== 'function') return false;
    const regions = extractSharedLayoutRegions(page);
    if (regions) window.OluntirIncludes.updateLayoutRegions(regions);
    return Boolean(regions);
  }

  function applySharedRegionsToPage(page) {
    if (window.OluntirSharedContentManager && typeof window.OluntirSharedContentManager.applyToPage === 'function') {
      return window.OluntirSharedContentManager.applyToPage(page);
    }
    if (!page || !reusableRegionsEnabled()) return false;
    const includeState = window.OluntirIncludes.getState();
    const sourceHtml = pageComponentHtml(page);
    const template = document.createElement('template');
    template.innerHTML = sourceHtml;

    const replaceRegion = (selector, html) => {
      if (!html || !String(html).trim()) return;
      const current = template.content.querySelector(selector);
      const replacementTemplate = document.createElement('template');
      replacementTemplate.innerHTML = String(html).trim();
      const replacement = replacementTemplate.content.firstElementChild;
      if (!replacement) return;
      if (current) current.replaceWith(replacement);
      else if (selector === 'footer') template.content.appendChild(replacement);
      else template.content.insertBefore(replacement, template.content.firstChild);
    };

    replaceRegion('header', includeState.regions.header);
    replaceRegion('nav', includeState.regions.navigation);
    replaceRegion('footer', includeState.regions.footer);

    const updatedHtml = template.innerHTML;
    if (updatedHtml === sourceHtml) return false;
    const component = page.getMainComponent && page.getMainComponent();
    if (!component || typeof component.components !== 'function') return false;
    component.components(updatedHtml);
    return true;
  }

  function refreshSelectedPageVisuals() {
    window.requestAnimationFrame(() => {
      patchCanvasUploadedImagesNow();
      if (ACTIVE_FRAMEWORK.id === 'bs4') reinitLightbox();
    });
    window.setTimeout(() => {
      patchCanvasUploadedImagesNow();
      if (ACTIVE_FRAMEWORK.id === 'bs4') reinitLightbox();
    }, 120);
  }

  function selectPageById(pageId) {
    const page = editor.Pages.getAll().find((item) => item.id === pageId);
    if (!page) return false;

    const previousPage = editor.Pages.getSelected();
    if (previousPage && previousPage !== page) synchronizeSharedRegionsFromPage(previousPage);
    editor.Pages.select(page);
    applySharedRegionsToPage(page);
    refreshPageList();
    refreshSelectedPageVisuals();
    return true;
  }

  pageSelect.addEventListener('change', () => {
    selectPageById(pageSelect.value);
  });

  function reusablePageTemplate() {
    const includeState = window.OluntirIncludes && typeof window.OluntirIncludes.getState === 'function'
      ? window.OluntirIncludes.getState()
      : null;
    if (!includeState || !includeState.enabled) return '';

    // Shared Content Manager: neue Seiten referenzieren den aktuellen zentralen
    // Stand. Individuelle Inhalte der Startseite werden bewusst nicht kopiert.
    const regions = includeState.regions || {};
    const startPage = editor.Pages.getAll()[0];
    const startHtml = pageComponentHtml(startPage);
    const template = document.createElement('template');
    template.innerHTML = startHtml;
    const existingMain = template.content.querySelector('main');
    let main = '<main></main>';
    if (existingMain) {
      const emptyMain = existingMain.cloneNode(false);
      main = emptyMain.outerHTML;
    }

    // Header templates often contain their own <nav>. In that case the
    // standalone navigation region must not be appended a second time.
    const headerTemplate = document.createElement('template');
    headerTemplate.innerHTML = String(regions.header || '');
    const headerOwnsNavigation = Boolean(headerTemplate.content.querySelector('header nav'));

    return [
      regions.header,
      headerOwnsNavigation ? '' : regions.navigation,
      main,
      regions.footer
    ]
      .filter((value) => String(value || '').trim())
      .join('\n');
  }

  document.getElementById('btn-new-page').addEventListener('click', () => {
    const name = prompt(oluntirT('page.newPrompt'));
    if (!name) return;

    synchronizeSharedRegionsFromPage(editor.Pages.getSelected());
    const component = reusablePageTemplate();
    const pageConfig = component ? { name, component } : { name };
    const page = editor.Pages.add(pageConfig, { select: true });
    if (page) {
      editor.Pages.select(page);
      applySharedRegionsToPage(page);
    }
    refreshPageList();
    refreshSelectedPageVisuals();
    toast(oluntirT('page.created', { name }));
  });

  document.getElementById('btn-rename-page').addEventListener('click', () => {
    const page = editor.Pages.getSelected();
    const name = prompt(oluntirT('page.renamePrompt'), page.getName() || '');
    if (!name) return;
    page.setName(name);
    refreshPageList();
  });

  document.getElementById('btn-delete-page').addEventListener('click', () => {
    const pages = editor.Pages.getAll();
    if (pages.length <= 1) {
      alert(oluntirT('page.lastCannotDelete'));
      return;
    }

    const page = editor.Pages.getSelected();
    if (!page) {
      alert(oluntirT('page.noneSelected'));
      return;
    }
    if (!confirm(oluntirT('page.deleteConfirm', { name: page.getName() || page.id }))) return;

    // Vor dem Entfernen eine noch existierende Ersatzseite bestimmen. GrapesJS entfernt
    // die ausgewählte Seite zwar aus der Collection, setzt je nach Version aber nicht
    // zuverlässig eine neue aktive Canvas-Seite. Das Select zeigt dann bereits die
    // Startseite an, während der Canvas intern noch auf die gelöschte Seite verweist.
    const removedIndex = pages.indexOf(page);
    const fallbackPage = pages[removedIndex - 1] || pages[removedIndex + 1] || pages[0];

    // Änderungen an Header, Navigation und Footer gehören zum gemeinsamen Oluntir-Zustand
    // und müssen auch dann erhalten bleiben, wenn die aktuell bearbeitete Seite gelöscht wird.
    synchronizeSharedRegionsFromPage(page);
    editor.Pages.remove(page);

    if (fallbackPage && editor.Pages.getAll().includes(fallbackPage)) {
      editor.Pages.select(fallbackPage);
      applySharedRegionsToPage(fallbackPage);
    }

    refreshPageList();
    refreshSelectedPageVisuals();
    toast(oluntirT('page.deleted', { name: page.getName() || page.id }));
  });

  // ---------------------------------------------------------------------------
  // Speichern: Fehler (v. a. voller localStorage durch viele Bilder) früher sichtbar
  // machen, statt sie stillschweigend zu verschlucken.
  // ---------------------------------------------------------------------------
  let saveErrorAlreadyShown = false;

  function describeSaveError(err) {
    const msg = (err && (err.message || err.name)) || String(err || '');
    const isQuota = /quota/i.test(msg);
    return isQuota
      ? 'Speichern fehlgeschlagen: Das Projekt ist zu groß für den Browser-Speicher (localStorage fasst meist nur wenige MB).\n\n' +
          'Deine letzten Änderungen wurden NICHT gespeichert. Bitte jetzt über "Backup speichern" eine Sicherung als Datei anlegen.'
      : 'Speichern fehlgeschlagen: ' + msg + '\n\nBitte über "Backup speichern" eine Sicherung als Datei anlegen.';
  }

  editor.on('storage:error', (err) => {
    console.error('Autosave fehlgeschlagen:', err);
    if (!saveErrorAlreadyShown) {
      saveErrorAlreadyShown = true;
      alert(describeSaveError(err));
    }
  });
  editor.on('storage:store', () => {
    saveErrorAlreadyShown = false;
  });

  const pendingRestore = localStorage.getItem('pagebuilder-pending-restore');
  if (pendingRestore) {
    localStorage.removeItem('pagebuilder-pending-restore');
    try {
      const pending = JSON.parse(pendingRestore);
      if (pending && pending.projectData) {
        await importPortableAssetBackup(pending.assets);
        editor.loadProjectData(pending.projectData);
        await nextFrame();
        patchUploadedImageRefs(editor.Canvas.getDocument());
        refreshPageList();
        toast(oluntirT('backup.loaded'));
      }
    } catch (e) {
      console.error('Zwischengespeichertes Backup konnte nicht geladen werden:', e);
    }
  }

  document.getElementById('btn-save').addEventListener('click', async () => {
    try {
      if (window.OluntirSharedContentManager) window.OluntirSharedContentManager.flushSelected();
      await editor.store();
      if (window.OluntirStartup) window.OluntirStartup.setMeta({ projectType: window.OluntirIncludes && window.OluntirIncludes.getState().enabled ? 'reusable-regions' : 'classic' });
      toast('Gespeichert (lokal im Browser).');
    } catch (e) {
      console.error(e);
      alert(describeSaveError(e));
    }
  });

  const PBK4_MAGIC = new Uint8Array([0x57, 0x42, 0x50, 0x42, 0x4b, 0x34, 0x0d, 0x0a]); // "WBPBK4\r\n"

  function uint32le(value) {
    const bytes = new Uint8Array(4);
    new DataView(bytes.buffer).setUint32(0, value, true);
    return bytes;
  }

  function readUint32le(bytes, offset) {
    return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, true);
  }

  function bytesEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  async function buildBinaryBackupDescriptor(projectData) {
    // Vor dem Sichern werden temporäre blob:-URLs aus dem GrapesJS-Modell entfernt.
    // Im Projekt verbleiben ausschließlich stabile relative Pfade.
    if (typeof normalizeStableAssetReferences === 'function') {
      normalizeStableAssetReferences(editor);
      projectData = editor.getProjectData();
    }

    const items = await getPortableBackupAssetItems();
    const assets = items.map((item) => ({
      path: item.path,
      type: (item.blob && item.blob.type) || 'application/octet-stream',
      size: (item.blob && item.blob.size) || 0
    }));
    const manifest = {
      format: 'WB0D9X15X-Oluntir-Project',
      version: 4,
      encoding: 'binary-raw-assets',
      createdAt: new Date().toISOString(),
      framework: (window.PAGEBUILDER_FRAMEWORK || { id: 'bs4-bulky' }).id,
      assetCount: assets.length,
      assetBytes: assets.reduce((sum, item) => sum + item.size, 0),
      assets,
      includesConfig: window.OluntirIncludes ? window.OluntirIncludes.exportState() : null,
      projectData
    };
    const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest));
    return { items, manifest, manifestBytes };
  }

  async function writeBinaryBackupToHandle(handle, projectData) {
    const descriptor = await buildBinaryBackupDescriptor(projectData);
    const writable = await handle.createWritable();
    let processed = 0;
    try {
      await writable.write(PBK4_MAGIC);
      await writable.write(uint32le(descriptor.manifestBytes.length));
      await writable.write(descriptor.manifestBytes);

      for (let i = 0; i < descriptor.items.length; i++) {
        const item = descriptor.items[i];
        await writable.write(item.blob); // rohe Bildbytes, kein Base64
        processed += item.blob.size || 0;
        const percent = descriptor.manifest.assetBytes
          ? 8 + Math.round((processed / descriptor.manifest.assetBytes) * 88)
          : 96;
        updateProgress(percent, `${i + 1} von ${descriptor.items.length} Dateien geschrieben …`);
        await nextFrame();
      }
      await writable.close();
      return descriptor.manifest;
    } catch (e) {
      try { await writable.abort(); } catch (_) { /* ignorieren */ }
      throw e;
    }
  }

  async function createBinaryBackupBlob(projectData) {
    const descriptor = await buildBinaryBackupDescriptor(projectData);
    const parts = [PBK4_MAGIC, uint32le(descriptor.manifestBytes.length), descriptor.manifestBytes];
    let processed = 0;
    for (let i = 0; i < descriptor.items.length; i++) {
      parts.push(descriptor.items[i].blob); // Blob-Teile referenzieren die Daten, ohne Base64-Kopie
      processed += descriptor.items[i].blob.size || 0;
      const percent = descriptor.manifest.assetBytes
        ? 8 + Math.round((processed / descriptor.manifest.assetBytes) * 88)
        : 96;
      updateProgress(percent, `${i + 1} von ${descriptor.items.length} Dateien vorbereitet …`);
      if (i % 4 === 0) await nextFrame();
    }
    return { blob: new Blob(parts, { type: 'application/x-oluntir-project' }), manifest: descriptor.manifest };
  }

  async function isBinaryBackup(file) {
    if (!file || file.size < PBK4_MAGIC.length + 4) return false;
    const probe = new Uint8Array(await file.slice(0, PBK4_MAGIC.length).arrayBuffer());
    return bytesEqual(probe, PBK4_MAGIC);
  }

  async function readBinaryBackup(file) {
    const fixedHeaderSize = PBK4_MAGIC.length + 4;
    const header = new Uint8Array(await file.slice(0, fixedHeaderSize).arrayBuffer());
    if (!bytesEqual(header.slice(0, PBK4_MAGIC.length), PBK4_MAGIC)) {
      throw new Error('Unbekannter Backup-Dateikopf.');
    }
    const manifestLength = readUint32le(header, PBK4_MAGIC.length);
    if (!manifestLength || manifestLength > 256 * 1024 * 1024) {
      throw new Error('Ungültige Manifestgröße im Backup.');
    }
    const manifestStart = fixedHeaderSize;
    const manifestEnd = manifestStart + manifestLength;
    const manifestText = await file.slice(manifestStart, manifestEnd).text();
    const manifest = JSON.parse(manifestText);
    if (manifest.format !== 'WB0D9X15X-Oluntir-Project' || manifest.version !== 4) {
      throw new Error('Nicht unterstützte binäre Backup-Version.');
    }
    if (manifest.framework && manifest.framework !== (window.PAGEBUILDER_FRAMEWORK || {}).id) {
      const target = window.PAGEBUILDER_FRAMEWORKS && window.PAGEBUILDER_FRAMEWORKS[manifest.framework];
      const label = target ? target.label : manifest.framework;
      throw new Error(`Dieses Backup gehört zum Profil „${label}“. Bitte zuerst dieses Profil auswählen und die Datei erneut laden.`);
    }

    let offset = manifestEnd;
    let imported = 0;
    let received = 0;
    const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
    for (let i = 0; i < assets.length; i++) {
      const meta = assets[i];
      const size = Number(meta.size) || 0;
      if (!meta.path || size < 0 || offset + size > file.size) {
        throw new Error(`Beschädigter Asset-Eintrag ${i + 1}.`);
      }
      const blob = file.slice(offset, offset + size, meta.type || 'application/octet-stream');
      await registerUploadedAssetAtPathAsync(blob, meta.path);
      offset += size;
      imported++;
      received += size;
      const percent = manifest.assetBytes
        ? 8 + Math.round((received / manifest.assetBytes) * 76)
        : 70;
      updateProgress(percent, `${imported} von ${assets.length} Dateien importiert …`);
      if (i % 3 === 0) await nextFrame();
    }
    return { projectData: manifest.projectData, includesConfig: manifest.includesConfig || null, imported, portable: true };
  }

  async function readLegacyJsonLinesBackup(file) {
    const decoder = new TextDecoder();
    const reader = file.stream().getReader();
    let buffer = '';
    let manifest = null;
    let imported = 0;

    async function processLine(line) {
      if (!line.trim()) return;
      const record = JSON.parse(line);
      if (record.record === 'manifest') {
        manifest = record;
        if (record.framework && record.framework !== (window.PAGEBUILDER_FRAMEWORK || {}).id) {
          const target = window.PAGEBUILDER_FRAMEWORKS && window.PAGEBUILDER_FRAMEWORKS[record.framework];
          const label = target ? target.label : record.framework;
          throw new Error(`Dieses Backup gehört zum Profil „${label}“. Bitte zuerst dieses Profil auswählen und die Datei erneut laden.`);
        }
      } else if (record.record === 'asset') {
        const blob = dataUrlToBlob(record.dataUrl);
        await registerUploadedAssetAtPathAsync(blob, record.path);
        imported++;
      }
    }

    while (true) {
      const result = await reader.read();
      if (result.done) break;
      buffer += decoder.decode(result.value, { stream: true });
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        await processLine(line);
      }
    }
    buffer += decoder.decode();
    if (buffer.trim()) await processLine(buffer);
    if (!manifest || !manifest.projectData) throw new Error('Das Backup enthält keine gültigen Projektdaten.');
    return { projectData: manifest.projectData, includesConfig: manifest.includesConfig || null, imported, portable: true };
  }

  async function detectLegacyJsonLinesBackup(file) {
    const probe = await file.slice(0, Math.min(file.size, 1024 * 1024)).text();
    const newline = probe.indexOf('\n');
    if (newline < 0) return false;
    try {
      const first = JSON.parse(probe.slice(0, newline));
      return first && first.record === 'manifest' && first.format === 'WB0D9X15X-Oluntir-Project';
    } catch (_) {
      return false;
    }
  }

  document.getElementById('btn-backup').addEventListener('click', async () => {
    if (window.OluntirSharedContentManager) window.OluntirSharedContentManager.flushSelected();
    showProgress('Binäres Projekt-Backup wird erstellt');
    try {
      updateProgress(3, 'Sammle Projektdaten und Asset-Verzeichnis …');
      const projectData = editor.getProjectData();

      if (typeof window.showSaveFilePicker === 'function') {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: 'Oluntir-Projekt.oluntir',
            types: [{
              description: 'Oluntir-Projektdatei',
              accept: { 'application/x-oluntir-project': ['.oluntir'] }
            }]
          });
          const manifest = await writeBinaryBackupToHandle(handle, projectData);
          toast(`Backup mit ${manifest.assetCount} Datei(en) gespeichert.`);
          return;
        } catch (e) {
          if (e && e.name === 'AbortError') return;
          console.warn('Direktes Schreiben nicht möglich, nutze Browser-Download:', e);
        }
      }

      // Firefox/Safari: ein einzelner binärer Blob aus Rohdaten-Teilen, ohne Base64 und JSON-Gesamtstring.
      const result = await createBinaryBackupBlob(projectData);
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Oluntir-Projekt.oluntir';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast(`Backup mit ${result.manifest.assetCount} Datei(en) heruntergeladen.`);
    } catch (e) {
      console.error(e);
      alert('Backup konnte nicht erstellt werden: ' + e.message);
    } finally {
      hideProgress();
    }
  });

  document.getElementById('input-restore').addEventListener('change', async (ev) => {
    const file = ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    showProgress('Projekt-Backup wird geladen');
    try {
      let result;
      if (await isBinaryBackup(file)) {
        result = await readBinaryBackup(file);
      } else if (await detectLegacyJsonLinesBackup(file)) {
        result = await readLegacyJsonLinesBackup(file);
      } else {
        const text = await file.text();
        const data = JSON.parse(text);
        const portable = data && data.format === 'WB0D9X15X-Oluntir-Project' && data.projectData;
        const projectData = portable ? data.projectData : data;
        if (portable && data.framework && data.framework !== (window.PAGEBUILDER_FRAMEWORK || {}).id) {
          const target = window.PAGEBUILDER_FRAMEWORKS && window.PAGEBUILDER_FRAMEWORKS[data.framework];
          const label = target ? target.label : data.framework;
          throw new Error(`Dieses Backup gehört zum Profil „${label}“. Bitte zuerst dieses Profil auswählen und die Datei erneut laden.`);
        }
        const imported = portable ? await importPortableAssetBackup(data.assets) : 0;
        result = { projectData, includesConfig: portable ? (data.includesConfig || null) : null, imported, portable };
      }

      updateProgress(88, 'Lade Seiten und Komponenten …');
      editor.loadProjectData(result.projectData);
      if (result.includesConfig && window.OluntirIncludes) window.OluntirIncludes.importState(result.includesConfig);
      await nextFrame();
      if (typeof normalizeStableAssetReferences === 'function') normalizeStableAssetReferences(editor);
      patchUploadedImageRefs(editor.Canvas.getDocument());
      setTimeout(() => patchUploadedImageRefs(editor.Canvas.getDocument()), 250);
      setTimeout(() => patchUploadedImageRefs(editor.Canvas.getDocument()), 1000);
      refreshPageList();
      toast(result.portable
        ? `Portables Projekt mit ${result.imported} Datei(en) geladen.`
        : 'Älteres Projekt geladen. Darin enthaltene Browserbilder können fehlen.');
    } catch (e) {
      console.error(e);
      alert('Backup-Datei konnte nicht gelesen werden: ' + e.message);
    } finally {
      hideProgress();
    }
  });

  configureExportControls();

  const exportFolderButton = document.getElementById('btn-export-folder');
  if (exportFolderButton) exportFolderButton.addEventListener('click', () => {
    exportSitePackage(editor, 'folder').catch((e) => {
      console.error(e);
      alert('Ordnerexport fehlgeschlagen: ' + e.message);
    });
  });

  const exportZipButton = document.getElementById('btn-export-zip');
  if (exportZipButton) exportZipButton.addEventListener('click', () => {
    exportSitePackage(editor, 'zip').catch((e) => {
      console.error(e);
      alert('ZIP-Export fehlgeschlagen: ' + e.message);
    });
  });

  const exportTarButton = document.getElementById('btn-export-tar');
  if (exportTarButton) exportTarButton.addEventListener('click', () => {
    exportSitePackage(editor, 'tar').catch((e) => {
      console.error(e);
      alert('TAR-Export fehlgeschlagen: ' + e.message);
    });
  });

  (function configureFirefoxExportNotice() {
    const isFirefox = /Firefox\//i.test(navigator.userAgent || '');
    const storageKey = 'pagebuilder-firefox-export-notice-hidden';
    if (!isFirefox || localStorage.getItem(storageKey) === 'true') return;

    const notice = document.getElementById('firefox-export-notice');
    const closeButton = document.getElementById('firefox-export-notice-ok');
    const hideCheckbox = document.getElementById('firefox-export-notice-hide');
    if (!notice || !closeButton) return;

    // Apply the active language immediately before the Firefox notice is shown.
    // This avoids displaying the German HTML fallback when English is active and
    // also keeps the open dialog synchronized after a language switch.
    const applyNoticeLanguage = () => {
      if (window.OluntirI18N && typeof window.OluntirI18N.apply === 'function') {
        window.OluntirI18N.apply(notice);
      }
    };

    applyNoticeLanguage();
    window.addEventListener('oluntir:languagechange', applyNoticeLanguage);

    notice.hidden = false;
    notice.setAttribute('aria-hidden', 'false');
    closeButton.focus();
    closeButton.addEventListener('click', () => {
      if (hideCheckbox && hideCheckbox.checked) localStorage.setItem(storageKey, 'true');
      notice.hidden = true;
      notice.setAttribute('aria-hidden', 'true');
      window.removeEventListener('oluntir:languagechange', applyNoticeLanguage);
    }, { once: true });
  })();

  document.getElementById('input-gallery-files').addEventListener('change', (ev) => {
    insertGalleryFromFiles(editor, ev.target.files);
    ev.target.value = '';
  });

  document.getElementById('input-gallery-folder').addEventListener('change', (ev) => {
    insertGalleryFromFiles(editor, ev.target.files);
    ev.target.value = '';
  });

  // "+ Bild hochladen": fügt (ein oder mehrere) Bilder dem Asset-Manager hinzu, ohne
  // Base64 – Auswahl über den Asset-Manager (Doppelklick auf ein Bild-Element) möglich.
  document.getElementById('input-asset-upload').addEventListener('change', async (ev) => {
    const files = Array.from(ev.target.files || []).filter((f) => f.type && f.type.startsWith('image/'));
    ev.target.value = '';
    if (!files.length) return;

    showProgress('Bilder werden hinzugefügt');
    try {
      for (let i = 0; i < files.length; i++) {
        updateProgress(Math.round((i / files.length) * 100), `Bild ${i + 1} von ${files.length}: ${files[i].name}`);
        await nextFrame();
        const responsive = await createResponsiveImageAssets(files[i]);
        editor.AssetManager.add({ type: 'image', src: responsive.desktopPath, name: files[i].name });
      }
      toast(`${files.length} Bild${files.length === 1 ? '' : 'er'} zum Asset-Manager hinzugefügt.`);
    } catch (e) {
      alert('Bilder konnten nicht hinzugefügt werden: ' + e.message);
    } finally {
      hideProgress();
    }
  });
})();

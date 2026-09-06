// GrapesJS-Setup für die neutrale Bootstrap Community Edition.
// Läuft komplett lokal im Browser (file://), kein Backend nötig.

let ACTIVE_FRAMEWORK = window.PAGEBUILDER_FRAMEWORK || window.PAGEBUILDER_FRAMEWORKS.bs4;
let SITE_CSS = ACTIVE_FRAMEWORK.canvasStyles;
let SITE_JS = ACTIVE_FRAMEWORK.canvasScripts;
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

assetHydration.then(() => {
  if (window.OluntirAssetService && window.OluntirAssetService.restoreConnectedProjectFolder) {
    return window.OluntirAssetService.restoreConnectedProjectFolder();
  }
  return null;
}).catch((error) => console.warn('Upload-Ordner-Synchronisierung konnte nicht wiederhergestellt werden:', error));

(async function initPageBuilder() {
  if (window.OluntirStartup && window.OluntirStartup.ready) {
    await window.OluntirStartup.ready;
  }
  if (window.OluntirFrameworkReady) {
    await window.OluntirFrameworkReady;
    ACTIVE_FRAMEWORK = window.PAGEBUILDER_FRAMEWORK || ACTIVE_FRAMEWORK;
    SITE_CSS = ACTIVE_FRAMEWORK.canvasStyles || [];
    SITE_JS = ACTIVE_FRAMEWORK.canvasScripts || [];
  }

  // Repeat-Definitionen/Instanzen sind Oluntir-Projektmetadaten und kein nativer
  // GrapesJS-Modellbestandteil. GrapesJS kann unbekannte Top-Level-Felder beim
  // Autoload bereits verwerfen, bevor der Repeat-Engine-Load-Handler gebunden ist.
  // Deshalb wird der rohe persistierte Projektsnapshot VOR grapesjs.init() gesichert.
  // So bleibt die Repeat-Familie auch nach Schließen/erneutem Öffnen des Projekts
  // verfügbar und kann danach wieder mit dem aktuellen GrapesJS-Baum hydriert werden.
  let initialPersistedProjectData = null;
  try {
    const raw = localStorage.getItem(ACTIVE_FRAMEWORK.storageKey);
    if (raw) initialPersistedProjectData = JSON.parse(raw);
  } catch (error) {
    console.warn('Persistierte Oluntir-Projektmetadaten konnten vor dem Editorstart nicht gelesen werden:', error);
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

  if (window.OluntirLoggingConsent && typeof window.OluntirLoggingConsent.initialize === 'function') {
    window.OluntirLoggingConsent.initialize().catch(error => console.warn('Logging-Freigabe konnte nicht initialisiert werden:', error));
  }

  if (window.OluntirRuntimeActions) {
    window.OluntirRuntimeActions.ensure();
    window.OluntirRuntimeActions.emit('editor.loaded', { framework: ACTIVE_FRAMEWORK.id });
    editor.on('page:select', page => window.OluntirRuntimeActions.emit('page.selected', { pageId: page && page.id, pageName: page && page.getName ? page.getName() : null }));
    editor.on('page:add', page => window.OluntirRuntimeActions.emit('page.created', { pageId: page && page.id, pageName: page && page.getName ? page.getName() : null }));
    editor.on('page:remove', page => window.OluntirRuntimeActions.emit('page.deleted', { pageId: page && page.id, pageName: page && page.getName ? page.getName() : null }));
    editor.on('component:add', component => {
      const classes = component && component.getClasses ? component.getClasses() : [];
      const isGallery = classes && classes.indexOf('pb-gallery') >= 0;
      window.OluntirRuntimeActions.emit(isGallery ? 'gallery.updated' : 'component.added', { componentId: component && component.getId ? component.getId() : null, type: component && component.get ? component.get('type') : null });
    });
    editor.on('component:update', component => {
      const tag = component && component.get ? String(component.get('tagName') || '').toLowerCase() : '';
      const category = tag === 'nav' || tag === 'header' || tag === 'footer' ? 'shared-content.updated' : 'component.updated';
      window.OluntirRuntimeActions.emit(category, { componentId: component && component.getId ? component.getId() : null, tagName: tag || null });
    });
    editor.on('component:remove', component => window.OluntirRuntimeActions.emit('component.removed', { componentId: component && component.getId ? component.getId() : null }));
    editor.on('storage:store', () => window.OluntirRuntimeActions.emit('project.saved', { storage: 'local' }));
  }


  let oluntirHistoryReplayActive = false;

  function bindOluntirUndoRedo(editorInstance) {
    if (!editorInstance || editorInstance.__oluntirUndoRedoBound) return;
    editorInstance.__oluntirUndoRedoBound = true;
    const commands = editorInstance.Commands;
    const panels = editorInstance.Panels;
    const manager = editorInstance.UndoManager;
    if (!commands || !panels || !manager) return;
    commands.add('oluntir:undo', {
      run() {
        if (typeof manager.undo === 'function' && (typeof manager.hasUndo !== 'function' || manager.hasUndo())) {
          cancelPendingProjectPersist();
          oluntirHistoryReplayActive = true;
          try {
            manager.undo();
          } finally {
            oluntirHistoryReplayActive = false;
          }
          persistHistoryReplayStateSoon();
          return true;
        }
        return false;
      }
    });
    commands.add('oluntir:redo', {
      run() {
        if (typeof manager.redo === 'function' && (typeof manager.hasRedo !== 'function' || manager.hasRedo())) {
          cancelPendingProjectPersist();
          oluntirHistoryReplayActive = true;
          try {
            manager.redo();
          } finally {
            oluntirHistoryReplayActive = false;
          }
          persistHistoryReplayStateSoon();
          return true;
        }
        return false;
      }
    });
    const undoButton = panels.getButton('options', 'undo');
    const redoButton = panels.getButton('options', 'redo');
    if (undoButton) undoButton.set('command', 'oluntir:undo');
    if (redoButton) redoButton.set('command', 'oluntir:redo');
  }
  window.bindOluntirUndoRedo = bindOluntirUndoRedo;
  bindOluntirUndoRedo(editor);

  function bindOluntirPreviewUx(editorInstance) {
    if (!editorInstance || editorInstance.__oluntirPreviewUxBound) return;
    editorInstance.__oluntirPreviewUxBound = true;

    const PREVIEW_COMMAND = 'preview';
    let hintTimer = null;
    let previewWasActive = false;

    function previewIsActive() {
      try {
        return !!(editorInstance.Commands && editorInstance.Commands.isActive && editorInstance.Commands.isActive(PREVIEW_COMMAND));
      } catch (_) {
        return false;
      }
    }

    function ensureHint() {
      let hint = document.getElementById('oluntir-preview-hint');
      if (hint) return hint;
      hint = document.createElement('div');
      hint.id = 'oluntir-preview-hint';
      hint.className = 'oluntir-preview-hint';
      hint.setAttribute('role', 'status');
      hint.setAttribute('aria-live', 'polite');
      hint.setAttribute('aria-atomic', 'true');
      hint.innerHTML = '<span class="fa fa-eye" aria-hidden="true"></span><span><strong>Vorschau aktiv</strong><small>ESC zum Beenden</small></span>';
      document.body.appendChild(hint);
      return hint;
    }

    function hideHint() {
      if (hintTimer) {
        window.clearTimeout(hintTimer);
        hintTimer = null;
      }
      const hint = document.getElementById('oluntir-preview-hint');
      if (hint) hint.classList.remove('is-visible');
    }

    function showHint() {
      const hint = ensureHint();
      hideHint();
      // Zwei Frames stellen sicher, dass die Preview-Umschaltung und ihre
      // Sichtbarkeitsregeln bereits abgeschlossen sind.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          hint.classList.add('is-visible');
          hintTimer = window.setTimeout(() => {
            hint.classList.remove('is-visible');
            hintTimer = null;
          }, 3200);
        });
      });
    }

    function syncPreviewState() {
      const active = previewIsActive();
      if (active && !previewWasActive) showHint();
      if (!active && previewWasActive) hideHint();
      previewWasActive = active;
    }

    // GrapesJS-Ereignisse dienen nur als schnelle Benachrichtigung. Der
    // Statusabgleich bleibt bewusst Oluntir-eigen und funktioniert auch dann,
    // wenn sich Ereignisnamen oder deren Reihenfolge ändern.
    editorInstance.on('run:preview', () => window.setTimeout(syncPreviewState, 0));
    editorInstance.on('stop:preview', () => window.setTimeout(syncPreviewState, 0));
    window.setInterval(syncPreviewState, 150);
    syncPreviewState();

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !previewIsActive()) return;
      const lightbox = document.querySelector('.oluntir-lightbox[aria-hidden="false"], .oluntir-lightbox.is-open');
      if (lightbox) return;
      event.preventDefault();
      event.stopPropagation();
      editorInstance.stopCommand(PREVIEW_COMMAND);
      window.setTimeout(syncPreviewState, 0);
    }, true);
  }
  bindOluntirPreviewUx(editor);

  if (typeof window.registerTextMediaEditing === 'function') {
    window.registerTextMediaEditing(editor);
  }

  if (typeof window.registerSmartLinkEditing === 'function') {
    window.registerSmartLinkEditing(editor);
  }

  const isBuiltInBootstrapFramework = !ACTIVE_FRAMEWORK.sourcePackage && ['bs4', 'bs5'].includes(ACTIVE_FRAMEWORK.id);
  if (isBuiltInBootstrapFramework && typeof window.registerBootstrapBlocks === 'function') {
    window.registerBootstrapBlocks(editor, ACTIVE_FRAMEWORK.id);
  } else if (isBuiltInBootstrapFramework && ACTIVE_FRAMEWORK.id === 'bs5' && typeof window.registerBootstrap5Blocks === 'function') {
    window.registerBootstrap5Blocks(editor);
  }

  if (isBuiltInBootstrapFramework && typeof window.registerPageBuilderVariants === 'function') {
    window.registerPageBuilderVariants(editor, ACTIVE_FRAMEWORK.id);
  }

  if (ACTIVE_FRAMEWORK.sourcePackage && window.OluntirSourcePackageGrapesJsAdapter) {
    window.OluntirSourcePackageGrapesJsAdapter.connect(editor, ACTIVE_FRAMEWORK.sourcePackage)
      .then(result => {
        if (result.connected) console.info('Oluntir Universal-Source-Bridge verbunden:', result.blocks.added);
        else console.warn('Oluntir Universal-Source-Bridge blockiert:', result.issues);
      })
      .catch(error => console.warn('Universal-Source-Bridge konnte nicht verbunden werden:', error));
  }

  if (isBuiltInBootstrapFramework && typeof window.registerQuickSetup === 'function') {
    window.registerQuickSetup(editor, ACTIVE_FRAMEWORK.id);
  }

  if (typeof window.registerQuickEditing === 'function') {
    window.registerQuickEditing(editor);
  }

  if (window.OluntirImageLightboxApi && typeof window.OluntirImageLightboxApi.bindEditorPreview === 'function') {
    window.OluntirImageLightboxApi.bindEditorPreview(editor);
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
  window.OluntirGrapes = window.OluntirGrapesAdapter.create(editor);
  console.info('Oluntir GrapesJS adapter:', window.OluntirGrapes.selfTest());
  if (window.OluntirDocumentApi && typeof window.OluntirDocumentApi.bind === 'function') {
    window.OluntirDocumentApi.bind(editor);
  }
  if (window.OluntirSharedContentManager && typeof window.OluntirSharedContentManager.bind === 'function') {
    window.OluntirSharedContentManager.bind(editor);
  }
  if (window.OluntirLayoutIdentities) window.OluntirLayoutIdentities.bind(editor);
  if (window.OluntirRepeatEngineV2) {
    window.OluntirRepeatEngineV2.bind(editor, {
      initialProjectData: initialPersistedProjectData,
      hydrationSource: 'pre-grapesjs-local-storage'
    });
  }
  if (window.OluntirRepeatAutoSynchronization && typeof window.OluntirRepeatAutoSynchronization.bind === 'function') window.OluntirRepeatAutoSynchronization.bind(editor);
  if (window.OluntirFavicon) window.OluntirFavicon.bind(editor);
  window.dispatchEvent(new CustomEvent('oluntir:editorready'));

  // Ein paar generische Bausteine registriert grapesjs-preset-webpage unabhängig von
  // blocksBasicOpts. Auch die entfernen, damit ausschließlich fertig gestylte
  // Template-Bausteine zur Auswahl stehen (echtes WYSIWYG per Drag & Drop).
  ['link-block', 'quote', 'text-basic'].forEach((id) => editor.BlockManager.remove(id));

  if (typeof window.registerOluntirBlockSearch === 'function') {
    window.registerOluntirBlockSearch(editor);
  }


  // Bestehende und neu geladene Galerien aus früheren DEV-Ständen reparieren.
  // Der Download-Link erhält ein echtes DOM-Zeichen, das Vorschau und Export übernehmen.
  const repairGalleryIcons = () => {
    if (typeof window.ensureGalleryActionIcons === 'function') {
      window.ensureGalleryActionIcons(editor);
    }
  };
  editor.on('load', repairGalleryIcons);
  editor.on('project:load', repairGalleryIcons);
  editor.on('page', repairGalleryIcons);
  editor.on('component:add', (component) => {
    const classes = component && component.getClasses ? component.getClasses() : [];
    if (classes.includes('portfolio-download') || classes.includes('pb-gallery')) {
      window.requestAnimationFrame(repairGalleryIcons);
    }
  });
  if (typeof window.bindGalleryItemLifecycle === 'function') {
    window.bindGalleryItemLifecycle(editor);
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

  window.toast = (msg, options) => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(window.toast._t);
    const duration = options && Number(options.duration) > 0 ? Number(options.duration) : 2800;
    window.toast._t = setTimeout(() => el.classList.remove('visible'), duration);
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
        id: 'pb-ui-toolbar-favicon',
        icon: 'fa fa-star',
        titleKey: 'tool.favicon',
        action: () => window.OluntirFavicon && window.OluntirFavicon.openDialog(),
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
      {
        id: 'pb-ui-toolbar-export-tar',
        icon: 'fa fa-file-archive-o',
        titleKey: 'tool.exportTar',
        separator: true,
        action: () => document.getElementById('btn-export-tar').click(),
      },
      {
        id: 'pb-ui-toolbar-export-zip',
        icon: 'fa fa-file-archive-o',
        titleKey: 'tool.exportZip',
        action: () => document.getElementById('btn-export-zip').click(),
      },
      {
        id: 'pb-ui-toolbar-export-folder',
        icon: 'fa fa-download',
        titleKey: 'tool.exportFolder',
        action: () => document.getElementById('btn-export-folder').click(),
      },
      {
        id: 'pb-ui-toolbar-repeat-content',
        panel: 'views',
        icon: 'fa fa-retweet',
        titleKey: 'tool.repeatContent',
        attributes: { 'data-oluntir-repeat-tool': 'true' },
        action: () => window.OluntirRepeatUi && window.OluntirRepeatUi.open(),
      },
      {
        id: 'pb-ui-toolbar-repeat-library',
        panel: 'views',
        icon: 'fa fa-retweet',
        titleKey: 'tool.repeatLibrary',
        attributes: { 'data-oluntir-repeat-library-tool': 'true' },
        action: () => window.OluntirRepeatUi && window.OluntirRepeatUi.openLibrary(),
      },
      {
        id: 'pb-ui-toolbar-monitor-toggle',
        icon: 'fa fa-desktop',
        titleKey: 'tool.monitorToggle',
        separator: true,
        attributes: { 'data-oluntir-monitor-toggle': 'true' },
        action: () => window.OluntirMultiMonitor && window.OluntirMultiMonitor.toggle(),
      },
      {
        id: 'pb-ui-toolbar-monitor-focus',
        icon: 'fa fa-window-restore',
        titleKey: 'tool.monitorFocus',
        attributes: { 'data-oluntir-monitor-focus': 'true' },
        action: () => window.OluntirMultiMonitor && window.OluntirMultiMonitor.focusOrOpen(),
      },
    ];

    commandMap.forEach((tool) => {
      const commandId = tool.id + '-command';
      editor.Commands.add(commandId, { run: tool.action });
      panels.addButton(tool.panel || 'options', {
        id: tool.id,
        className: tool.icon,
        command: commandId,
        attributes: Object.assign({
          title: window.OluntirI18N ? window.OluntirI18N.t(tool.titleKey) : tool.titleKey,
          'aria-label': window.OluntirI18N ? window.OluntirI18N.t(tool.titleKey) : tool.titleKey,
          'data-pb-toolbar-tool': 'true',
          'data-pb-toolbar-separator': tool.separator ? 'true' : 'false',
        }, tool.attributes || {}),
      });
    });
    window.addEventListener('oluntir:languagechange', () => {
      commandMap.forEach((tool) => {
        const button = panels.getButton(tool.panel || 'options', tool.id);
        if (!button) return;
        const title = window.OluntirI18N.t(tool.titleKey);
        button.set('attributes', Object.assign({}, button.get('attributes'), { title, 'aria-label': title }));
      });
    });
  }
  registerSecondaryToolbarTools();

  const frameworkSelect = document.getElementById('framework-select');
  if (frameworkSelect) {
    Object.keys(window.PAGEBUILDER_FRAMEWORKS || {}).forEach((id) => {
      if (Array.from(frameworkSelect.options).some(option => option.value === id)) return;
      const profile = window.PAGEBUILDER_FRAMEWORKS[id];
      const option = document.createElement('option'); option.value = id; option.textContent = profile.label || id;
      frameworkSelect.appendChild(option);
    });
    frameworkSelect.value = ACTIVE_FRAMEWORK.id;
    frameworkSelect.addEventListener('change', async () => {
      const next = frameworkSelect.value;
      if (next === ACTIVE_FRAMEWORK.id) return;
      const target = window.PAGEBUILDER_FRAMEWORKS[next];
      const label = target && target.label ? target.label : next;
      const warning = `Ein Oluntir-Projekt ist immer fest an genau ein Framework und genau eine Version gebunden.\n\n` +
        `Der aktuelle Stand von „${ACTIVE_FRAMEWORK.label || ACTIVE_FRAMEWORK.id}“ wird jetzt gespeichert.\n` +
        `Danach wird „${label}“ als separates Framework-Projekt geöffnet. Eine Vermischung der Projektstände findet nicht statt.\n\n` +
        `Framework wechseln und vorher speichern?`;
      if (!target || !confirm(warning)) {
        frameworkSelect.value = ACTIVE_FRAMEWORK.id;
        return;
      }
      try {
        if (typeof window.OluntirPersistProjectNow !== 'function') throw new Error('Der aktuelle Projektstand kann momentan nicht gespeichert werden.');
        await window.OluntirPersistProjectNow();
        window.setPageBuilderFramework(next);
        location.reload();
      } catch (error) {
        frameworkSelect.value = ACTIVE_FRAMEWORK.id;
        toast(`Frameworkwechsel abgebrochen: ${error.message || error}`);
      }
    });

    function activateImportedPackage(manifest) {
      const bridge = window.OluntirSourcePackageBridge;
      if (!bridge || !manifest) return;
      if (typeof bridge.isEditorSupported === 'function' && !bridge.isEditorSupported(manifest)) {
        toast(`Source Package analysiert: ${manifest.displayName || manifest.packageId}. Das erkannte Framework ist derzeit nur für Analyse freigegeben; es wurde nicht als Editorprofil aktiviert.`);
        return;
      }
      const profile = bridge.toFrameworkProfile(manifest);
      window.PAGEBUILDER_FRAMEWORKS[profile.id] = profile;
      let option = Array.from(frameworkSelect.options).find(item => item.value === profile.id);
      if (!option) { option = document.createElement('option'); option.value = profile.id; option.textContent = profile.label; frameworkSelect.appendChild(option); }
      bridge.bind(manifest);
      if (confirm(`Source Package „${manifest.displayName || manifest.packageId}“ wurde importiert. Jetzt als Frontend-Framework aktivieren?`)) {
        window.setPageBuilderFramework(profile.id); location.reload();
      }
    }

    async function importWithPrompt(importer, argument, defaultName) {
      const bridge = window.OluntirSourcePackageBridge;
      if (!bridge) return;
      const frameworkId = prompt('Framework-ID (z. B. bootstrap5 oder bootstrap4; andere werden nur analysiert):', 'unclassified');
      if (!frameworkId) return;
      const displayName = prompt('Anzeigename des Source Packages:', defaultName || frameworkId);
      if (!displayName) return;
      try {
        const manifest = await importer(argument, { frameworkId, displayName });
        activateImportedPackage(manifest);
      } catch (error) { toast(`Source-Import fehlgeschlagen: ${error.message}`, { duration: 12000 }); }
    }

    const urlButton = document.getElementById('btn-import-source-url');
    if (urlButton) urlButton.addEventListener('click', () => {
      const url = prompt('Download-URL des Framework- oder Template-Archivs:');
      if (url) importWithPrompt((value, options) => window.OluntirSourcePackageBridge.importUrl(value, options), url, url.split('/').pop());
    });
    const folderInput = document.getElementById('input-source-folder');
    if (folderInput) folderInput.addEventListener('change', () => {
      const files = Array.from(folderInput.files || []); const first = files[0];
      if (files.length) importWithPrompt((_, options) => window.OluntirSourcePackageBridge.importBrowserFiles(files, options), null, first.webkitRelativePath ? first.webkitRelativePath.split('/')[0] : first.name);
      folderInput.value = '';
    });
    const archiveInput = document.getElementById('input-source-archive');
    if (archiveInput) archiveInput.addEventListener('change', () => {
      const file = archiveInput.files && archiveInput.files[0];
      if (file) importWithPrompt((_, options) => window.OluntirSourcePackageBridge.importBrowserArchive(file, options), null, file.name.replace(/\.(tar\.gz|tgz|zip|tar)$/i, ''));
      archiveInput.value = '';
    });
    const recoveryInput = document.getElementById('input-source-recovery');
    if (recoveryInput) recoveryInput.addEventListener('change', async () => {
      const file = recoveryInput.files && recoveryInput.files[0]; recoveryInput.value = '';
      if (!file || !window.OluntirSourcePackageBridge) return;
      try {
        const manifest = await window.OluntirSourcePackageBridge.restoreBrowserRecovery(file);
        activateImportedPackage(manifest);
      } catch (error) { toast(`Source-Recovery fehlgeschlagen: ${error.message}`, { duration: 12000 }); }
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
  //    "assets/user_upload/…", für die Anzeige im Canvas muss er live auf die aktuell
  //    gültige blob:-URL umgebogen werden (siehe asset-store.js).
  // ---------------------------------------------------------------------------
  // Bildpfad-Korrektur MUSS sofort/synchron passieren (kein setTimeout-Delay): Sobald ein
  // <img src="assets/user_upload/…"> ins DOM kommt, startet der Browser augenblicklich einen
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
      const raw = element ? element.outerHTML : '';
      const semantics = window.OluntirTemplateSemantics;
      return semantics && typeof semantics.normalizeReferencedIds === 'function'
        ? semantics.normalizeReferencedIds(raw)
        : raw;
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

    // Keep the page contract intact even when a legacy/partially initialized
    // reusable page consists only of shared regions. The existing Canvas CSS
    // renders its insertion hint exclusively on an actual empty <main>.
    if (!template.content.querySelector('main')) {
      const main = document.createElement('main');
      const footer = template.content.querySelector('footer');
      if (footer) template.content.insertBefore(main, footer);
      else template.content.appendChild(main);
    }

    const semantics = window.OluntirTemplateSemantics;
    const updatedHtml = semantics && typeof semantics.normalizeReferencedIds === 'function'
      ? semantics.normalizeReferencedIds(template.innerHTML)
      : template.innerHTML;
    if (updatedHtml === sourceHtml) return false;
    const component = page.getMainComponent && page.getMainComponent();
    if (!component || typeof component.components !== 'function') return false;
    component.components(updatedHtml);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Editorinterne Einfügezone für ein tatsächlich leeres <main>.
  //
  // Neue Seiten übernehmen bewusst die Attribute und Klassen des <main> der
  // Startseite. Enthält dieses z. B. eine Flex-Wachstumsregel, würde ein leeres
  // <main> sonst die gesamte freie Canvas-Höhe beanspruchen. Nur im leeren Zustand
  // wird diese Wachstumseigenschaft im Canvas neutralisiert und als kompakte
  // Einfügezone dargestellt. Sobald eine Section eingefügt wurde, greifen wieder
  // vollständig die ursprünglichen Projektklassen. Projektmodell und Export bleiben
  // unverändert.
  // ---------------------------------------------------------------------------
  function ensureCanvasWorkspaceStyle() {
    let doc;
    try { doc = editor.Canvas.getDocument(); } catch (_) { return; }
    if (!doc || doc.getElementById('oluntir-canvas-workspace-style')) return;

    const style = doc.createElement('style');
    style.id = 'oluntir-canvas-workspace-style';
    style.textContent = `
      html {
        min-height: 100% !important;
        overflow-y: auto !important;
        scrollbar-gutter: stable;
      }
      body {
        min-height: 100% !important;
        padding-bottom: 0 !important;
        box-sizing: border-box !important;
        overflow-y: visible !important;
      }
      body::after {
        content: "";
        display: block;
        flex: 0 0 220px;
        width: 100%;
        height: 220px;
        min-height: 220px;
        pointer-events: none;
      }
      main:empty {
        position: relative !important;
        flex: 0 0 64px !important;
        flex-grow: 0 !important;
        flex-shrink: 0 !important;
        width: 100%;
        height: 64px !important;
        min-height: 64px !important;
        max-height: 64px !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box;
        overflow: hidden;
        outline: 1px dashed rgba(74, 144, 226, .9);
        outline-offset: -6px;
        background-color: rgba(241, 247, 255, .72);
        background-image:
          linear-gradient(45deg, rgba(74, 144, 226, .09) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(74, 144, 226, .09) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(74, 144, 226, .09) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(74, 144, 226, .09) 75%);
        background-size: 16px 16px;
        background-position: 0 0, 0 8px, 8px -8px, -8px 0;
      }
      main:empty::before {
        content: '+ Hier Section einfügen';
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #245d98;
        font: 600 12px/1.2 Arial, Helvetica, sans-serif;
        letter-spacing: .02em;
        pointer-events: none;
        user-select: none;
      }
    `;
    (doc.head || doc.documentElement).appendChild(style);

    const staleOverlay = doc.getElementById('oluntir-section-insert-overlay');
    if (staleOverlay) staleOverlay.remove();
  }

  editor.on('load', ensureCanvasWorkspaceStyle);
  editor.on('page', () => window.requestAnimationFrame(ensureCanvasWorkspaceStyle));

  function refreshSelectedPageVisuals() {
    window.requestAnimationFrame(() => {
      patchCanvasUploadedImagesNow();
      ensureCanvasWorkspaceStyle();
      if (ACTIVE_FRAMEWORK.id === 'bs4') reinitLightbox();
    });
    window.setTimeout(() => {
      patchCanvasUploadedImagesNow();
      ensureCanvasWorkspaceStyle();
      if (ACTIVE_FRAMEWORK.id === 'bs4') reinitLightbox();
    }, 120);
  }

  function selectPageById(pageId) {
    const page = editor.Pages.getAll().find((item) => item.id === pageId || (window.OluntirLayoutIdentities && window.OluntirLayoutIdentities.pageId && window.OluntirLayoutIdentities.pageId(item) === pageId));
    if (!page) return false;

    const previousPage = editor.Pages.getSelected();
    if (previousPage === page) {
      refreshPageList();
      return true;
    }

    // A page switch can be initiated while GrapesJS still owns an active RTE
    // session. Finish that session before reading the current page; otherwise
    // the visible content may never reach the component model.
    if (richTextEditingActive && editor.RichTextEditor && typeof editor.RichTextEditor.disable === 'function') {
      try { editor.RichTextEditor.disable(); } catch (error) {
        console.warn('RTE konnte vor dem Seitenwechsel nicht beendet werden:', error);
      }
    }

    // Page switching is a model-authoritative transaction. Finish any generic
    // Canvas-derived asset references first, but do not flush Shared Content yet.
    // Shared header/navigation/footer are then read only from the GrapesJS model;
    // a stale frame must never overwrite a newer model edit from the source page.
    try {
      commitCurrentCanvasStateToModel({ skipSharedContent: true });
      if (window.OluntirSharedContentManager && typeof window.OluntirSharedContentManager.commitSelectedCanvasToShared === 'function') {
        window.OluntirSharedContentManager.commitSelectedCanvasToShared(previousPage, { targetPage: page });
      }
      if (window.OluntirLogger && typeof window.OluntirLogger.info === 'function') {
        window.OluntirLogger.info('page', 'page-switch-source-committed', {
          sourcePageId: previousPage && previousPage.id || null,
          targetPageId: page && page.id || null,
          richTextEditingActive: Boolean(richTextEditingActive)
        });
      }
    } catch (error) {
      console.error('Aktuelle Seite konnte vor dem Wechsel nicht ins Modell übernommen werden:', error);
      refreshPageList();
      toast(`Seitenwechsel abgebrochen: ${error.message || error}`);
      return false;
    }

    // Complete a delayed shared-content transaction while its source page is
    // still active. The manager keeps the original source page, so a debounce
    // can never run against the page selected a few milliseconds later.
    try {
      if (window.OluntirSharedContentManager && typeof window.OluntirSharedContentManager.flushPending === 'function') {
        window.OluntirSharedContentManager.flushPending();
      }
      // This is the last synchronous write before Pages.select(). It contains
      // both pages and the current repeatEngine metadata. If a delayed raw
      // editor.store() is already queued, the persistence barrier below writes
      // the decorated snapshot once more after that store has completed.
      writeCurrentProjectSnapshotSynchronously({ skipSharedContent: true });
    } catch (error) {
      console.error('Aktuelle Seite konnte vor dem Wechsel nicht gespeichert werden:', error);
      refreshPageList();
      toast(`Seitenwechsel abgebrochen: ${error.message || error}`);
      return false;
    }

    // The target page model already contains the authoritative shared regions.
    // Pages.select() only switches the existing GrapesJS page/frame; no Canvas DOM
    // is used as a reverse synchronization source during the transition.
    editor.Pages.select(page);
    refreshPageList();
    refreshSelectedPageVisuals();
    // The source page and shared regions were committed before Pages.select().
    // Do not flush shared content again against the freshly selected page while
    // its Canvas is still rendering the pre-propagation frame.
    persistCurrentProjectStateSoon(0, { skipSharedContent: true });
    return true;
  }

  // Repeat-UI und externe Werkzeugfenster verwenden denselben gehärteten
  // Seitenwechsel wie die sichtbare Seitenauswahl. Dadurch bleibt der aktuelle
  // Canvas-Stand auch bei der Zielbereichsauswahl persistent.
  window.OluntirSelectPageById = selectPageById;

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

  function createUniquePageRecord() {
    const existing = new Set(editor.Pages.getAll().map(page => String(page && page.id || '')));
    const identities = window.OluntirLayoutIdentities;
    let semanticId = identities && typeof identities.createId === 'function'
      ? identities.createId('page')
      : `ol_page_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    let modelId = `oluntir-page-${semanticId.replace(/^ol_page_/, '')}`;
    while (existing.has(modelId)) {
      semanticId = identities && typeof identities.createId === 'function'
        ? identities.createId('page')
        : `ol_page_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      modelId = `oluntir-page-${semanticId.replace(/^ol_page_/, '')}`;
    }
    return { modelId, semanticId };
  }

  document.getElementById('btn-new-page').addEventListener('click', () => {
    const name = prompt(oluntirT('page.newPrompt'));
    if (!name) return;

    if (window.OluntirSharedContentManager && typeof window.OluntirSharedContentManager.flushPending === 'function') {
      window.OluntirSharedContentManager.flushPending();
    } else {
      synchronizeSharedRegionsFromPage(editor.Pages.getSelected());
    }
    const component = reusablePageTemplate();
    const pageRecord = createUniquePageRecord();
    const pageConfig = component
      ? { id: pageRecord.modelId, name, component, oluntirPageId: pageRecord.semanticId }
      : { id: pageRecord.modelId, name, oluntirPageId: pageRecord.semanticId };
    // reusablePageTemplate() already contains the current shared regions and an
    // explicit empty <main>. Do not rebuild the freshly created page before its
    // first Canvas selection, otherwise GrapesJS can retain the previous frame.
    const page = editor.Pages.add(pageConfig, { select: true });
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
    if (window.OluntirSharedContentManager && typeof window.OluntirSharedContentManager.flushPending === 'function') {
      window.OluntirSharedContentManager.flushPending();
    } else {
      synchronizeSharedRegionsFromPage(page);
    }
    const deletedModelId = String(page.id || '');
    const deletedSemanticId = window.OluntirLayoutIdentities && typeof window.OluntirLayoutIdentities.pageId === 'function'
      ? window.OluntirLayoutIdentities.pageId(page)
      : null;
    editor.Pages.remove(page);

    if (window.OluntirIncludes && typeof window.OluntirIncludes.removePageReferences === 'function') {
      window.OluntirIncludes.removePageReferences(deletedModelId);
    }
    if (window.OluntirRepeatEngineV2 && typeof window.OluntirRepeatEngineV2.removePageReferences === 'function') {
      window.OluntirRepeatEngineV2.removePageReferences(deletedSemanticId || deletedModelId);
    }

    if (fallbackPage && editor.Pages.getAll().includes(fallbackPage)) {
      editor.Pages.select(fallbackPage);
    }

    refreshPageList();
    refreshSelectedPageVisuals();
    // Deletion is a project-state mutation, not a display-only action. Persist it
    // immediately so a newly created page with the same label can never revive
    // the deleted model from an older autosave snapshot.
    persistCurrentProjectStateSoon(0);
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
  let skipSharedContentForNextStorageSnapshot = false;
  editor.on('storage:store', () => {
    saveErrorAlreadyShown = false;
    // Während der aktiven Rich-Text-Bearbeitung darf der Metadaten-Snapshot
    // keinen erneuten Modell-/Canvas-Commit auslösen. GrapesJS verwendet in
    // dieser Phase ein contenteditable-Element; ein Modell-Refresh würde den
    // Textcursor (Caret) und den Eingabefokus verlieren.
    if (typeof window.OluntirIsRichTextEditing === 'function' && window.OluntirIsRichTextEditing()) return;
    // GrapesJS kennt den externen Repeat-Zustand nicht. Nach jedem normalen
    // Autosave wird deshalb derselbe Projektdatensatz nochmals mit allen
    // Oluntir-Metadaten geschrieben. Dadurch kann ein verzögerter GrapesJS-Store
    // keinen zuvor gesicherten repeatEngine-Zustand mehr verlieren.
    const skipSharedContent = skipSharedContentForNextStorageSnapshot;
    skipSharedContentForNextStorageSnapshot = false;
    try { writeCurrentProjectSnapshotSynchronously(skipSharedContent ? { skipSharedContent: true } : undefined); }
    catch (error) { console.error('Oluntir-Metadaten konnten nach dem Autosave nicht ergänzt werden:', error); }
  });

  // Bildänderungen entstehen teilweise zuerst im Canvas-DOM (RichText/Asset-Manager)
  // und erst kurz danach im GrapesJS-Komponentenmodell. Vor jedem expliziten oder
  // bildbedingten Speichern wird deshalb der sichtbare Canvas-Zustand verbindlich ins
  // Projektmodell übernommen. So kann niemals die zuletzt eingefügte Bildaktion fehlen.
  let projectPersistTimer = 0;
  let historyReplayPersistTimer = 0;
  let projectPersistRunning = false;
  let projectPersistAgain = false;
  let projectCommitRunning = false;
  let richTextEditingActive = false;

  // GrapesJS ersetzt beim Zurückschreiben von Komponenteninhalt das aktive
  // contenteditable-Element. Während einer laufenden RTE-Sitzung darf deshalb kein
  // automatischer Canvas-/Shared-Content-Commit stattfinden, weil sonst die
  // Einfügemarke nach jedem Zeichen an den Anfang springt.
  window.OluntirIsRichTextEditing = () => richTextEditingActive;
  editor.on('rte:enable', () => {
    richTextEditingActive = true;
    window.clearTimeout(projectPersistTimer);
    projectPersistTimer = 0;
  });
  editor.on('rte:disable', () => {
    richTextEditingActive = false;
    if (window.OluntirSharedContentManager && typeof window.OluntirSharedContentManager.flushSelected === 'function') {
      window.OluntirSharedContentManager.flushSelected();
    }
    persistCurrentProjectStateSoon(80);
  });

  function commitCurrentCanvasStateToModel(options) {
    if (projectCommitRunning) return;
    projectCommitRunning = true;
    try {
    if (typeof commitCanvasAssetReferencesToModel === 'function') {
      commitCanvasAssetReferencesToModel(editor);
    }
    if (typeof commitInlineTextImagesToModel === 'function') {
      commitInlineTextImagesToModel(editor);
    }
    if (typeof normalizeStableAssetReferences === 'function') {
      normalizeStableAssetReferences(editor);
    }
    if (!options || options.skipSharedContent !== true) {
      if (window.OluntirSharedContentManager) {
        window.OluntirSharedContentManager.flushSelected();
      }
    }
    } finally {
      projectCommitRunning = false;
    }
  }

  // Zusätzlich zum GrapesJS-Store wird der aktuelle Projektzustand synchron in den
  // von GrapesJS verwendeten localStorage-Schlüssel geschrieben. Das ist absichtlich
  // redundant: pagehide/beforeunload geben einem asynchronen editor.store() nicht
  // garantiert genug Zeit. Ohne diesen synchronen letzten Schreibvorgang konnte genau
  // die zuletzt eingefügte Bildgruppe beim nächsten Start fehlen, obwohl Export und
  // Canvas bereits korrekt waren.
  function writeCurrentProjectSnapshotSynchronously(options) {
    commitCurrentCanvasStateToModel(options);
    let projectData = editor.getProjectData();
    if (window.OluntirLayoutIdentities) { window.OluntirLayoutIdentities.ensureAll(editor); projectData = window.OluntirLayoutIdentities.decorateProjectData(projectData); }
    if (window.OluntirRepeatEngineV2) projectData = window.OluntirRepeatEngineV2.decorateProjectData(projectData);
    if (window.OluntirFavicon) projectData = window.OluntirFavicon.decorateProjectData(projectData);
    localStorage.setItem(ACTIVE_FRAMEWORK.storageKey, JSON.stringify(projectData));
    if (window.OluntirStartup) {
      window.OluntirStartup.setMeta({
        projectType: window.OluntirIncludes && window.OluntirIncludes.getState().enabled
          ? 'reusable-regions'
          : 'classic',
        frameworkId: ACTIVE_FRAMEWORK.id,
        frameworkVersion: ACTIVE_FRAMEWORK.version || 'unversioned'
      });
    }
    return projectData;
  }

  async function persistCurrentProjectState(options) {
    if (projectPersistRunning) {
      projectPersistAgain = true;
      return;
    }
    projectPersistRunning = true;
    try {
      commitCurrentCanvasStateToModel(options);
      await nextFrame();
      if (options && options.skipSharedContent === true) skipSharedContentForNextStorageSnapshot = true;
      await editor.store();
      // editor.store() kann intern verzögert oder vom Browser beim Schließen abgebrochen
      // werden. Der synchrone Snapshot ist deshalb die verbindliche Abschlusskopie.
      writeCurrentProjectSnapshotSynchronously(options);
    } finally {
      projectPersistRunning = false;
      if (projectPersistAgain) {
        projectPersistAgain = false;
        await persistCurrentProjectState(options);
      }
    }
  }

  function cancelPendingProjectPersist() {
    window.clearTimeout(projectPersistTimer);
    projectPersistTimer = 0;
  }

  function writeHistoryReplaySnapshotSynchronously() {
    let projectData = editor.getProjectData();
    if (window.OluntirLayoutIdentities) {
      projectData = window.OluntirLayoutIdentities.decorateProjectData(projectData);
    }
    if (window.OluntirRepeatEngineV2) projectData = window.OluntirRepeatEngineV2.decorateProjectData(projectData);
    if (window.OluntirFavicon) projectData = window.OluntirFavicon.decorateProjectData(projectData);
    localStorage.setItem(ACTIVE_FRAMEWORK.storageKey, JSON.stringify(projectData));
    return projectData;
  }

  function persistHistoryReplayStateSoon() {
    window.clearTimeout(historyReplayPersistTimer);
    historyReplayPersistTimer = window.setTimeout(async () => {
      historyReplayPersistTimer = 0;
      try {
        // Undo/Redo darf keine nachträgliche Canvas-Normalisierung auslösen. Jede
        // zusätzliche Modellmutation würde GrapesJS' Redo-Stack verwerfen.
        await editor.store();
        writeHistoryReplaySnapshotSynchronously();
      } catch (error) {
        console.error('Undo-/Redo-Zustand konnte nicht gespeichert werden:', error);
      }
    }, 0);
  }

  function persistCurrentProjectStateSoon(delay, options) {
    // Während aktiver Texteingabe niemals das Komponentenmodell neu schreiben.
    // Der Abschluss wird durch rte:disable einmalig und vollständig gespeichert.
    if (richTextEditingActive) return;
    window.clearTimeout(projectPersistTimer);
    projectPersistTimer = window.setTimeout(() => {
      projectPersistTimer = 0;
      if (richTextEditingActive) return;
      persistCurrentProjectState(options).catch((error) => {
        console.error('Bildänderung konnte nicht dauerhaft gespeichert werden:', error);
      });
    }, Number.isFinite(delay) ? delay : 80);
  }

  window.OluntirPersistProjectNow = persistCurrentProjectState;
  window.OluntirPersistProjectSoon = persistCurrentProjectStateSoon;
  window.OluntirWriteProjectSnapshotNow = writeCurrentProjectSnapshotSynchronously;

  // Letzte Änderungen beim Verlassen verbindlich sichern. pagehide deckt auch Reload,
  // Tab-Schließen und den Back/Forward-Cache ab; visibilitychange sichert zusätzlich,
  // sobald der Tab in den Hintergrund wechselt. Hier niemals auf Promises warten.
  const persistBeforeLeaving = () => {
    try {
      window.clearTimeout(projectPersistTimer);
      projectPersistTimer = 0;
      writeCurrentProjectSnapshotSynchronously();
    } catch (error) {
      console.error('Letzter synchroner Projektsnapshot fehlgeschlagen:', error);
    }
  };
  window.addEventListener('pagehide', persistBeforeLeaving);
  window.addEventListener('beforeunload', persistBeforeLeaving);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persistBeforeLeaving();
  });

  // Nicht nur explizite Asset-Events, sondern jede echte Änderung an Bild- oder
  // Textkomponenten löst eine kurze, zusammengefasste Persistierung aus. Damit werden
  // auch mehrere direkt nacheinander eingefügte Card-/Inline-Bilder vollständig erfasst.
  editor.on('component:update', (component) => {
    if (oluntirHistoryReplayActive || projectCommitRunning || richTextEditingActive || !component || !component.get) return;
    const type = String(component.get('type') || '').toLowerCase();
    const tag = String(component.get('tagName') || '').toLowerCase();
    // Bildänderungen werden weiterhin zeitnah gesichert. Text wird erst beim
    // Verlassen des RTE gespeichert, damit keine Cursorposition verloren geht.
    if (type === 'image' || tag === 'img') {
      persistCurrentProjectStateSoon(120);
    }
  });

  const pendingRestore = localStorage.getItem('pagebuilder-pending-restore');
  if (pendingRestore) {
    localStorage.removeItem('pagebuilder-pending-restore');
    try {
      const pending = JSON.parse(pendingRestore);
      if (pending && pending.projectData) {
        await importPortableAssetBackup(pending.assets);
        editor.loadProjectData(pending.projectData);
        if (window.OluntirRepeatEngineV2 && pending.projectData.oluntir && pending.projectData.oluntir.repeatEngine) window.OluntirRepeatEngineV2.importState(pending.projectData.oluntir.repeatEngine);
        if (window.OluntirFavicon) window.OluntirFavicon.importState(pending.projectData.oluntir && pending.projectData.oluntir.favicon);
        if (window.OluntirLayoutIdentities) window.OluntirLayoutIdentities.ensureAll(editor);
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
      await persistCurrentProjectState();
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
      if (window.OluntirLayoutIdentities) { window.OluntirLayoutIdentities.ensureAll(editor); projectData = window.OluntirLayoutIdentities.decorateProjectData(projectData); }
      if (window.OluntirRepeatEngineV2) projectData = window.OluntirRepeatEngineV2.decorateProjectData(projectData);
      if (window.OluntirFavicon) projectData = window.OluntirFavicon.decorateProjectData(projectData);
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
    showProgress('Binäres Projekt-Backup wird erstellt');
    try {
      updateProgress(3, 'Synchronisiere und sichere den aktuellen Projektstand …');
      await persistCurrentProjectState();
      const projectData = writeCurrentProjectSnapshotSynchronously();

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
      if (window.OluntirRepeatEngineV2 && result.projectData.oluntir && result.projectData.oluntir.repeatEngine) window.OluntirRepeatEngineV2.importState(result.projectData.oluntir.repeatEngine);
      if (window.OluntirFavicon) window.OluntirFavicon.importState(result.projectData.oluntir && result.projectData.oluntir.favicon);
      if (window.OluntirLayoutIdentities) window.OluntirLayoutIdentities.ensureAll(editor);
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

  // "+ Bild hochladen": fügt (ein oder mehrere) Bilder dem Asset-Manager hinzu, ohne
  // Base64 – Auswahl über den Asset-Manager (Doppelklick auf ein Bild-Element) möglich.
  // Entfernt bei eigenen Uploads nicht nur den Asset-Manager-Eintrag, sondern auch
  // die zugehörigen Responsive-Dateien und das Original aus IndexedDB.
  editor.on('run:open-assets', () => window.requestAnimationFrame(() => patchUploadedImageRefs(document)));
  editor.on('asset:open', () => window.requestAnimationFrame(() => patchUploadedImageRefs(document)));
  editor.on('asset:add', () => window.requestAnimationFrame(() => patchUploadedImageRefs(document)));
  editor.on('asset:select', (asset, _complete, meta) => {
    if (meta && meta.oluntirHandled) return;
    const stablePath = asset && asset.get ? String(asset.get('src') || '') : '';
    const isPersistentUpload = stablePath.indexOf('assets/user_upload/') === 0 ||
      stablePath.indexOf('images/uploads/') === 0 || stablePath.indexOf('images/downloads/') === 0;
    if (!isPersistentUpload) return;

    // GrapesJS verarbeitet die Standardauswahl teilweise erst nach dem asset:select-
    // Ereignis. Deshalb den aktuell ausgewählten Bildbaustein im nächsten Frame erneut
    // mit dem dauerhaften Projektpfad synchronisieren.
    window.requestAnimationFrame(() => {
      const component = editor.getSelected && editor.getSelected();
      if (!component || !component.get || !component.addAttributes) return;
      const tagName = String(component.get('tagName') || '').toLowerCase();
      const type = String(component.get('type') || '').toLowerCase();
      if (tagName !== 'img' && type !== 'image') return;

      if (window.OluntirDocumentApi && typeof window.OluntirDocumentApi.updateAttributes === 'function') {
        window.OluntirDocumentApi.updateAttributes(component, { src: stablePath, 'data-stable-path': stablePath }, { label: 'image.replace', merge: true });
      } else {
        component.addAttributes({ src: stablePath, 'data-stable-path': stablePath });
      }
      editor.trigger('component:update', component);
      persistCurrentProjectStateSoon(100);
      try {
        const win = editor.Canvas.getWindow();
        if (win) patchUploadedImageRefs(win.document);
      } catch (_) { /* Vorschau-only */ }
    });
  });

  editor.on('asset:remove', (asset) => {
    const src = asset && asset.get ? asset.get('src') : '';
    if (!src || typeof removeUploadedAsset !== 'function') return;
    const isUserUpload = src.indexOf('assets/user_upload/') === 0 ||
      src.indexOf('images/uploads/') === 0 || src.indexOf('images/downloads/') === 0;
    if (isUserUpload) removeUploadedAsset(src);
  });

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

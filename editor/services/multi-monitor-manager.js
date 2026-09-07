(() => {
  'use strict';

  const SETTINGS_KEY = 'workspace.monitor';
  const DEFAULTS = Object.freeze({
    preferredMode: 'ask',
    askOnStart: true,
    rememberWindowPosition: true,
    preferredScreenId: null,
    toolWindowBounds: { left: null, top: null, width: 760, height: 900 }
  });

  let settings = Object.assign({}, DEFAULTS);
  let toolWindow = null;
  let activeMode = 'single';
  let fallbackReason = null;
  let movedNodes = [];
  let quickPanelEntries = [];
  let quickPanelObservers = [];
  let closeWatcher = null;
  let saveBoundsTimer = null;
  let toolMoveTimer = null;
  let toolMoveObserver = null;
  let livePanelObserver = null;
  let panelSyncTimer = null;
  let repeatPanelEntries = [];
  let startupResolved;
  const startupReady = new Promise(resolve => { startupResolved = resolve; });

  function store() { return window.OluntirSettingsStore; }
  function notify(message) {
    if (typeof window.toast === 'function') window.toast(message);
    else console.info(message);
  }

  async function loadSettings() {
    const saved = store() ? await store().get(SETTINGS_KEY, {}) : {};
    settings = Object.assign({}, DEFAULTS, saved || {}, {
      toolWindowBounds: Object.assign({}, DEFAULTS.toolWindowBounds, saved && saved.toolWindowBounds || {})
    });
    return settings;
  }

  async function persist(patch) {
    const previous = settings;
    settings = Object.assign({}, settings, patch || {});
    if (patch && patch.toolWindowBounds) settings.toolWindowBounds = Object.assign({}, previous.toolWindowBounds, patch.toolWindowBounds);
    try {
      if (store()) await store().set(SETTINGS_KEY, settings);
    } catch (error) {
      settings = previous;
      throw error;
    }
    renderSettingsControls();
    return settings;
  }

  function monitorApiSupported() {
    return typeof window.getScreenDetails === 'function';
  }

  async function getScreens() {
    if (monitorApiSupported()) {
      try {
        const details = await window.getScreenDetails();
        return Array.from(details.screens || []);
      } catch (_) { /* permission denied or unsupported in current context */ }
    }
    return [{ left: window.screen.availLeft || 0, top: window.screen.availTop || 0, width: window.screen.availWidth, height: window.screen.availHeight, isPrimary: true, isFallback: true }];
  }

  function screenContainsPoint(screen, x, y) {
    return x >= screen.left && x < screen.left + screen.width && y >= screen.top && y < screen.top + screen.height;
  }

  function currentScreenFrom(screens) {
    const centerX = window.screenX + Math.max(1, window.outerWidth) / 2;
    const centerY = window.screenY + Math.max(1, window.outerHeight) / 2;
    return screens.find(screen => screenContainsPoint(screen, centerX, centerY)) || screens.find(screen => screen.isPrimary) || screens[0];
  }

  function screenIdentity(screen) {
    return screen && (screen.id || screen.label || `${screen.left}:${screen.top}:${screen.width}:${screen.height}`);
  }

  function intersects(bounds, screen) {
    if (!bounds || bounds.left == null || bounds.top == null) return false;
    return bounds.left < screen.left + screen.width && bounds.left + bounds.width > screen.left && bounds.top < screen.top + screen.height && bounds.top + bounds.height > screen.top;
  }

  async function resolveBounds() {
    const screens = await getScreens();
    const stored = settings.toolWindowBounds;
    const current = currentScreenFrom(screens);
    const preferred = screens.find(screen => screenIdentity(screen) === settings.preferredScreenId);
    const secondary = preferred || screens.find(screen => screen !== current) || current;

    // Gespeicherte Koordinaten nur übernehmen, wenn sie auf einem aktuell sichtbaren
    // Bildschirm liegen. Bei mehreren Monitoren hat der explizit gewählte zweite
    // Bildschirm Vorrang vor einer alten Position auf dem Hauptmonitor.
    if (stored && screens.some(screen => intersects(stored, screen))) {
      const storedScreen = screens.find(screen => intersects(stored, screen));
      if (screens.length === 1 || storedScreen === secondary || preferred) return stored;
    }

    const width = Math.min(stored.width || 760, Math.max(520, secondary.width - 80));
    const height = Math.min(stored.height || 900, Math.max(620, secondary.height - 80));
    return {
      left: secondary.left + Math.max(20, secondary.width - width - 30),
      top: secondary.top + 30,
      width,
      height,
      targetScreenId: screenIdentity(secondary),
      usedFallbackScreen: !!secondary.isFallback
    };
  }

  function popupFeatures(bounds) {
    return `popup=yes,left=${Math.round(bounds.left)},top=${Math.round(bounds.top)},width=${Math.round(bounds.width)},height=${Math.round(bounds.height)},resizable=yes,scrollbars=yes`;
  }

  function writeToolDocument(win) {
    win.document.open();
    win.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; object-src 'none'"><title>Oluntir 2.2.1 – Werkzeuge</title><link rel="stylesheet" href="${new URL('vendor/grapesjs/0.23.2/grapes.min.css', location.href)}"><link rel="stylesheet" href="${new URL('plugins/editor/font-awesome/css/font-awesome.min.css', location.href)}"><link rel="stylesheet" href="${new URL('editor/css/editor.css?v=2.2.1', location.href)}"></head><body class="oluntir-tool-window"><header class="oluntir-tool-window-head"><div><strong>Oluntir</strong><span>2.2.1 · Werkzeugmonitor</span></div><button id="oluntir-return-tools" type="button" title="Werkzeuge ins Hauptfenster zurückholen" aria-label="Werkzeuge ins Hauptfenster zurückholen"><i class="fa fa-compress" aria-hidden="true"></i></button></header><main id="oluntir-tool-window-layout" aria-label="Oluntir-Werkzeuge"><section id="oluntir-tool-window-host" aria-label="GrapesJS-Werkzeugspalte"></section><aside id="oluntir-tool-window-quick-edit" aria-label="Schnellbearbeitung"><div class="oluntir-quick-edit-title"><i class="fa fa-magic" aria-hidden="true"></i><span>Schnellbearbeitung</span></div><div id="oluntir-quick-edit-placeholder">Wähle im Hauptfenster ein unterstütztes Element aus. Die Schnellbearbeitung erscheint anschließend hier.</div></aside></main><div id="oluntir-tool-window-status" role="status">Mit dem Hauptfenster verbunden</div></body></html>`);
    win.document.close();
    win.document.getElementById('oluntir-return-tools').addEventListener('click', () => returnToSingle('user'));
  }

  function setToolWindowStatus(message, state) {
    if (!toolWindow || toolWindow.closed) return;
    try {
      const status = toolWindow.document.getElementById('oluntir-tool-window-status');
      if (!status) return;
      status.textContent = message;
      status.dataset.state = state || 'info';
    } catch (_) { /* Fenster wird gerade aufgebaut oder geschlossen. */ }
  }

  function stopToolMoveWaiter() {
    if (toolMoveTimer) clearInterval(toolMoveTimer);
    toolMoveTimer = null;
    if (toolMoveObserver) toolMoveObserver.disconnect();
    toolMoveObserver = null;
  }

  function stopLivePanelSync() {
    if (panelSyncTimer) clearTimeout(panelSyncTimer);
    panelSyncTimer = null;
    if (livePanelObserver) livePanelObserver.disconnect();
    livePanelObserver = null;
  }

  function schedulePanelSync() {
    if (panelSyncTimer || activeMode === 'single') return;
    panelSyncTimer = setTimeout(() => {
      panelSyncTimer = null;
      moveToolsToPopup();
    }, 30);
  }

  function startLivePanelSync() {
    stopLivePanelSync();
    if (typeof MutationObserver !== 'function' || !document.documentElement) return;
    livePanelObserver = new MutationObserver(schedulePanelSync);
    livePanelObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  function waitForTools(win) {
    stopToolMoveWaiter();
    setToolWindowStatus('GrapesJS wird geladen – Werkzeugfenster bleibt geöffnet …', 'waiting');

    const attempt = () => {
      if (!win || win.closed || win !== toolWindow) {
        stopToolMoveWaiter();
        return false;
      }
      if (!moveToolsToPopup()) return false;
      stopToolMoveWaiter();
      setToolWindowStatus('Mit dem Hauptfenster verbunden', 'connected');
      startLivePanelSync();
      startCloseWatcher();
      try { win.focus(); } catch (_) {}
      return true;
    };

    if (attempt()) return;
    toolMoveTimer = setInterval(attempt, 250);
    if (document.documentElement && typeof MutationObserver === 'function') {
      toolMoveObserver = new MutationObserver(attempt);
      toolMoveObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  function findToolNodes() {
    const adapter = window.OluntirGrapes;
    if (!adapter || typeof adapter.getWorkspacePanelNodes !== 'function') return [];
    return adapter.getWorkspacePanelNodes();
  }

  function quickPanels() {
    const ids = ['pb-quick-edit', 'pb-quick-panel'];
    return ids.map((id) => document.getElementById(id) || (toolWindow && !toolWindow.closed ? toolWindow.document.getElementById(id) : null)).filter(Boolean);
  }

  function syncQuickEditPlaceholder() {
    if (!toolWindow || toolWindow.closed) return;
    const placeholder = toolWindow.document.getElementById('oluntir-quick-edit-placeholder');
    const visible = quickPanels().some((panel) => !panel.hidden);
    if (placeholder) placeholder.hidden = visible;
  }

  function moveQuickEditToPopup() {
    if (!toolWindow || toolWindow.closed) return false;
    const quickHost = toolWindow.document.getElementById('oluntir-tool-window-quick-edit');
    if (!quickHost) return false;
    const panels = quickPanels();
    if (!panels.length) return false;

    quickPanelObservers.forEach((observer) => observer.disconnect());
    quickPanelObservers = [];

    panels.forEach((panel) => {
      if (!quickPanelEntries.some((entry) => entry.node === panel)) {
        quickPanelEntries.push({ node: panel, parent: panel.parentNode, next: panel.nextSibling });
      }
      if (panel.ownerDocument !== toolWindow.document) quickHost.appendChild(panel);
      const observer = new MutationObserver(syncQuickEditPlaceholder);
      observer.observe(panel, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] });
      quickPanelObservers.push(observer);
    });
    syncQuickEditPlaceholder();
    return true;
  }

  function restoreQuickEdit() {
    quickPanelObservers.forEach((observer) => observer.disconnect());
    quickPanelObservers = [];
    quickPanelEntries.forEach(({ node, parent, next }) => {
      if (!parent) return;
      if (next && next.parentNode === parent) parent.insertBefore(node, next);
      else parent.appendChild(node);
    });
    quickPanelEntries = [];
  }

  function moveRepeatPanelToPopup() {
    if (!toolWindow || toolWindow.closed) return false;
    const host = toolWindow.document.getElementById('oluntir-tool-window-quick-edit');
    if (!host) return false;
    const panels = ['oluntir-repeat-panel', 'oluntir-repeat-library-panel']
      .map((id) => document.getElementById(id) || toolWindow.document.getElementById(id))
      .filter(Boolean);
    if (!panels.length) return false;
    panels.forEach((panel) => {
      if (!repeatPanelEntries.some((entry) => entry.node === panel)) {
        repeatPanelEntries.push({ node: panel, parent: panel.parentNode, next: panel.nextSibling });
      }
      if (panel.ownerDocument !== toolWindow.document) host.appendChild(panel);
    });
    return panels.every((panel) => panel.ownerDocument === toolWindow.document);
  }

  function restoreRepeatPanel() {
    repeatPanelEntries.slice().reverse().forEach(({ node, parent, next }) => {
      if (!parent) return;
      if (next && next.parentNode === parent) parent.insertBefore(node, next);
      else parent.appendChild(node);
    });
    repeatPanelEntries = [];
  }

  function moveToolsToPopup() {
    if (!toolWindow || toolWindow.closed) return false;
    const host = toolWindow.document.getElementById('oluntir-tool-window-host');
    if (!host) return false;
    const nodes = findToolNodes();
    if (!nodes.length && !movedNodes.length) return false;

    nodes.forEach((node) => {
      if (!node || node.ownerDocument === toolWindow.document) return;
      if (!movedNodes.some((entry) => entry.node === node)) {
        movedNodes.push({ node, parent: node.parentNode, next: node.nextSibling });
      }
      host.appendChild(node);
    });
    moveQuickEditToPopup();
    moveRepeatPanelToPopup();

    document.body.classList.add('oluntir-dual-monitor');
    activeMode = 'dual';
    fallbackReason = null;
    updateToolbarButton();
    updateStatus();
    return movedNodes.length > 0;
  }

  function restoreMovedNodes() {
    stopLivePanelSync();
    restoreQuickEdit();
    restoreRepeatPanel();
    movedNodes.forEach(({ node, parent, next }) => {
      if (!parent) return;
      if (next && next.parentNode === parent) parent.insertBefore(node, next);
      else parent.appendChild(node);
    });
    movedNodes = [];
    document.body.classList.remove('oluntir-dual-monitor');
  }

  function captureBounds() {
    if (!toolWindow || toolWindow.closed || !settings.rememberWindowPosition) return;
    clearTimeout(saveBoundsTimer);
    saveBoundsTimer = setTimeout(() => {
      persist({ toolWindowBounds: { left: toolWindow.screenX, top: toolWindow.screenY, width: toolWindow.outerWidth, height: toolWindow.outerHeight } }).catch(console.warn);
    }, 250);
  }

  function startCloseWatcher() {
    clearInterval(closeWatcher);
    let closedChecks = 0;
    closeWatcher = setInterval(() => {
      const isClosed = !toolWindow || toolWindow.closed;
      if (isClosed) closedChecks += 1;
      else closedChecks = 0;

      // Zwei aufeinanderfolgende Prüfungen verhindern eine Fehlreaktion während
      // Fensterbewegungen, Größenänderungen oder browserinternem Neuzeichnen.
      if (closedChecks >= 2) {
        clearInterval(closeWatcher);
        closeWatcher = null;
        stopToolMoveWaiter();
        restoreMovedNodes();
        toolWindow = null;
        activeMode = 'single';
        fallbackReason = 'tool-window-closed';
        updateToolbarButton();
        updateStatus();
        notify('Das Werkzeugfenster wurde geschlossen. Die Werkzeuge sind wieder im Hauptfenster.');
      } else if (!isClosed) captureBounds();
    }, 1000);
  }

  async function startDual(options) {
    options = options || {};
    if ((activeMode === 'dual' || activeMode === 'dual-pending') && toolWindow && !toolWindow.closed) { toolWindow.focus(); return true; }
    // Das Fenster muss unmittelbar innerhalb der Benutzeraktion geöffnet werden.
    // Bildschirmabfrage und Positionsberechnung folgen erst danach; andernfalls kann
    // der Browser den nach einem await ausgeführten window.open()-Aufruf blockieren.
    const initial = settings.toolWindowBounds || DEFAULTS.toolWindowBounds;
    const win = window.open('', 'oluntir-tool-window', popupFeatures({
      left: window.screenX + 60,
      top: window.screenY + 60,
      width: initial.width || 760,
      height: initial.height || 900
    }));
    if (!win) {
      activeMode = 'single-fallback';
      fallbackReason = 'popup-blocked';
      updateToolbarButton();
      updateStatus();
      notify('Das Werkzeugfenster wurde als Pop-up blockiert. Bitte Pop-ups für Oluntir erlauben.');
      return false;
    }
    toolWindow = win;
    writeToolDocument(win);
    setToolWindowStatus('Bildschirme und Fensterposition werden geprüft …', 'positioning');

    const bounds = await resolveBounds();
    try {
      win.moveTo(Math.round(bounds.left), Math.round(bounds.top));
      win.resizeTo(Math.round(bounds.width), Math.round(bounds.height));
    } catch (_) {
      setToolWindowStatus('Die Position konnte nicht automatisch gesetzt werden. Das Fenster kann manuell verschoben werden.', 'manual-move');
    }
    activeMode = 'dual-pending';
    fallbackReason = null;
    updateToolbarButton();
    updateStatus();

    if (bounds.targetScreenId && !bounds.usedFallbackScreen) {
      persist({ preferredScreenId: bounds.targetScreenId }).catch(console.warn);
    } else if (bounds.usedFallbackScreen) {
      setToolWindowStatus('Fenster geöffnet. Bitte bei Bedarf manuell auf den zweiten Monitor verschieben.', 'manual-move');
    }

    // Kein Abbruch-Timer mehr: Ein langsamer GrapesJS-Start darf das vom Benutzer
    // geöffnete Werkzeugfenster nicht schließen. Die Übernahme erfolgt automatisch,
    // sobald die Panels vorhanden sind.
    waitForTools(win);
    startCloseWatcher();
    if (options.persistPreference) await persist({ preferredMode: 'dual', askOnStart: false });
    return true;
  }

  async function returnToSingle(reason) {
    captureBounds();
    restoreMovedNodes();
    const win = toolWindow;
    toolWindow = null;
    if (win && !win.closed) try { win.close(); } catch (_) {}
    clearInterval(closeWatcher); closeWatcher = null;
    stopToolMoveWaiter();
    activeMode = 'single'; fallbackReason = reason || null;
    updateToolbarButton(); updateStatus();
    return true;
  }

  async function toggle() {
    if (activeMode === 'dual' || activeMode === 'dual-pending') return returnToSingle('toolbar-toggle');
    return startDual({ persistPreference: false });
  }

  async function focusOrOpen() {
    if (toolWindow && !toolWindow.closed) {
      try { toolWindow.focus(); } catch (_) {}
      return true;
    }
    return startDual({ persistPreference: false });
  }

  function updateToolbarButton() {
    const dual = activeMode === 'dual' || activeMode === 'dual-pending';
    const title = dual ? 'Werkzeugspalte ins Hauptfenster zurückholen' : (fallbackReason ? 'Werkzeugspalte erneut auslagern' : 'Werkzeugspalte in zweites Fenster auslagern');
    document.querySelectorAll('[data-oluntir-monitor-toggle]').forEach((button) => {
      button.setAttribute('title', title);
      button.setAttribute('aria-label', title);
      button.classList.toggle('gjs-pn-active', dual);
      button.classList.toggle('oluntir-monitor-active', dual);
    });
    document.querySelectorAll('[data-oluntir-monitor-focus]').forEach((button) => {
      const focusTitle = dual ? 'Werkzeugfenster in den Vordergrund holen' : 'Werkzeugspalte in neuem Fenster öffnen';
      button.setAttribute('title', focusTitle);
      button.setAttribute('aria-label', focusTitle);
    });
  }

  function updateStatus() {
    const el = document.getElementById('oluntir-monitor-status');
    if (!el) return;
    const labels = {
      dual: 'Zweiter Monitor verbunden',
      'dual-pending': 'Werkzeugfenster geöffnet – GrapesJS wird verbunden',
      single: 'Ein-Monitor-Modus',
      'single-fallback': 'Ein-Monitor-Fallback'
    };
    el.textContent = labels[activeMode] || activeMode;
    const reason = document.getElementById('oluntir-monitor-fallback-reason');
    if (reason) reason.textContent = fallbackReason ? `Grund: ${fallbackReason}` : '';
  }

  function registerToolbarButton() {
    const editor = window.OluntirEditor;
    if (!editor || !editor.Panels) return false;

    // Die beiden Monitor-Schaltflächen werden fest mit der sekundären Oluntir-
    // Werkzeugleiste registriert. Der Manager ergänzt keinen dritten Ersatzknopf.
    if (editor.Panels.getButton('options', 'pb-ui-toolbar-monitor-toggle')) {
      setTimeout(updateToolbarButton, 0);
      return true;
    }
    return false;
  }

  function ensureToolbarButton() {
    if (registerToolbarButton()) return;
    const timer = setInterval(() => { if (registerToolbarButton()) clearInterval(timer); }, 100);
    setTimeout(() => clearInterval(timer), 15000);
  }

  function renderSettingsControls() {
    document.querySelectorAll('input[name="oluntir-monitor-mode"]').forEach(input => { input.checked = input.value === settings.preferredMode; });
    const ask = document.getElementById('oluntir-monitor-ask-start');
    if (ask) ask.checked = !!settings.askOnStart;
    const remember = document.getElementById('oluntir-monitor-remember-position');
    if (remember) remember.checked = !!settings.rememberWindowPosition;
    updateStatus();
  }

  function bindSettingsControls() {
    document.querySelectorAll('input[name="oluntir-monitor-mode"]').forEach(input => input.addEventListener('change', async () => {
      try { await persist({ preferredMode: input.value, askOnStart: input.value === 'ask' }); }
      catch (error) { alert('Die Monitor-Einstellung konnte nicht gespeichert werden: ' + error.message); renderSettingsControls(); }
    }));
    const ask = document.getElementById('oluntir-monitor-ask-start');
    if (ask) ask.addEventListener('change', () => persist({ askOnStart: ask.checked }).catch(error => alert(error.message)));
    const remember = document.getElementById('oluntir-monitor-remember-position');
    if (remember) remember.addEventListener('change', () => persist({ rememberWindowPosition: remember.checked }).catch(error => alert(error.message)));
    const start = document.getElementById('oluntir-monitor-start-now');
    if (start) start.addEventListener('click', () => startDual({ persistPreference: false }));
    const back = document.getElementById('oluntir-monitor-return-now');
    if (back) back.addEventListener('click', () => returnToSingle('settings'));
  }

  function showStartupChoice() {
    return new Promise(resolve => {
      const overlay = document.getElementById('oluntir-monitor-startup');
      if (!overlay) { resolve('single'); return; }
      overlay.hidden = false; overlay.setAttribute('aria-hidden', 'false');
      const remember = document.getElementById('oluntir-monitor-start-remember');
      const finish = async mode => {
        try {
          if (remember && remember.checked) await persist({ preferredMode: mode, askOnStart: false });
          else await persist({ preferredMode: settings.preferredMode, askOnStart: true });
        } catch (error) { console.warn(error); }
        overlay.hidden = true; overlay.setAttribute('aria-hidden', 'true');
        resolve(mode);
      };
      document.getElementById('oluntir-monitor-start-single').onclick = () => finish('single');
      document.getElementById('oluntir-monitor-start-dual').onclick = async () => {
        const opened = await startDual({ persistPreference: !!(remember && remember.checked) });
        finish(opened ? 'dual' : 'single');
      };
    });
  }

  async function prepareStartup() {
    await loadSettings();
    let chosen = 'single';
    if (settings.askOnStart || settings.preferredMode === 'ask') chosen = await showStartupChoice();
    else if (settings.preferredMode === 'dual') {
      // A user gesture is required by many browsers. Show a compact start confirmation.
      chosen = await showStartupChoice();
    }
    if (chosen !== 'dual') activeMode = 'single';
    else if (activeMode !== 'dual' && activeMode !== 'dual-pending') activeMode = 'dual-pending';
    startupResolved({ mode: chosen });
    return { mode: chosen };
  }

  document.addEventListener('DOMContentLoaded', async () => {
    bindSettingsControls();
    ensureToolbarButton();
    renderSettingsControls();
    window.addEventListener('beforeunload', captureBounds);
  });

  window.OluntirMultiMonitor = {
    startupReady, prepareStartup, startDual, returnToSingle, toggle, focusOrOpen, getSettings: () => Object.assign({}, settings),
    getState: () => ({ preferredMode: settings.preferredMode, activeMode, fallbackReason }),
    getToolDocument: () => toolWindow && !toolWindow.closed ? toolWindow.document : null,
    monitorApiSupported
  };
})();

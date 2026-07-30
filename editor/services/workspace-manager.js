(() => {
  'use strict';

  const workspaces = new Map();
  let host = null;
  let content = null;
  let title = null;
  let activeId = null;
  let previousFocus = null;
  const hiddenPanels = [];

  function ensureHost() {
    if (host) return host;
    host = document.createElement('section');
    host.id = 'oluntir-workspace';
    host.hidden = true;
    host.setAttribute('role', 'dialog');
    host.setAttribute('aria-modal', 'true');
    host.innerHTML = `
      <header class="oluntir-workspace-head">
        <h1 data-role="workspace-title">Werkzeug</h1>
        <div class="oluntir-workspace-head-actions">
          <button type="button" data-action="workspace-close" title="Workspace schließen" aria-label="Workspace schließen">×</button>
        </div>
      </header>
      <div class="oluntir-workspace-content" data-role="workspace-content"></div>`;
    document.body.appendChild(host);
    content = host.querySelector('[data-role="workspace-content"]');
    title = host.querySelector('[data-role="workspace-title"]');
    host.querySelector('[data-action="workspace-close"]').addEventListener('click', close);
    host.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
    });
    return host;
  }

  function register(id, definition) {
    if (!id || !definition || typeof definition.mount !== 'function') throw new Error('Ungültige Workspace-Definition.');
    workspaces.set(id, definition);
  }

  function hideEditorPanels() {
    hiddenPanels.length = 0;
    ['#pb-quick-edit', '#pb-quick-panel'].forEach((selector) => {
      const panel = document.querySelector(selector);
      if (!panel) return;
      hiddenPanels.push({ panel, hidden: panel.hidden });
      panel.hidden = true;
    });
    document.body.classList.add('oluntir-workspace-open');
    document.dispatchEvent(new CustomEvent('oluntir:workspace-open'));
  }

  function restoreEditorPanels() {
    hiddenPanels.forEach(({ panel, hidden }) => { panel.hidden = hidden; });
    hiddenPanels.length = 0;
    document.body.classList.remove('oluntir-workspace-open');
    document.dispatchEvent(new CustomEvent('oluntir:workspace-close'));
  }

  async function open(id, options) {
    const definition = workspaces.get(id);
    if (!definition) throw new Error(`Workspace "${id}" ist nicht registriert.`);
    ensureHost();
    if (activeId) await close(false);
    previousFocus = document.activeElement;
    activeId = id;
    title.textContent = definition.title || 'Werkzeug';
    content.replaceChildren();
    hideEditorPanels();
    host.hidden = false;
    const node = await definition.mount(options || {});
    if (node) content.appendChild(node);
    host.focus({ preventScroll: true });
    return node;
  }

  async function close(restoreFocus = true) {
    if (!activeId) return;
    const id = activeId;
    const definition = workspaces.get(id);
    activeId = null;
    if (definition && typeof definition.unmount === 'function') await definition.unmount();
    if (content) content.replaceChildren();
    if (host) host.hidden = true;
    restoreEditorPanels();
    if (restoreFocus && previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  }

  function isOpen(id) { return id ? activeId === id : !!activeId; }
  function getActive() { return activeId; }

  window.OluntirWorkspaceManager = { register, open, close, isOpen, getActive };
})();

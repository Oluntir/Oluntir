(() => {
  'use strict';
  function register(adapter) {
    const editor = adapter.editor;
    const service = window.OluntirAssetService;
    const workspace = window.OluntirWorkspaceManager;
    const state = window.OluntirImageSelectState();
    const PAGE_SIZE = 60;
    let root = null;
    let currentOptions = {};
    let currentMode = 'manage';
    let meta = [];
    let visibleList = [];
    let renderedCount = 0;
    let sizeMap = new Map();
    let sentinelObserver = null;
    let listResizeObserver = null;


    function applyListResponsiveClass(container) {
      if (!container) return;
      const width = Math.round(container.getBoundingClientRect().width || container.clientWidth || 0);
      container.classList.remove('is-size-wide', 'is-size-medium', 'is-size-compact', 'is-size-stacked');
      if (width < 620) container.classList.add('is-size-stacked');
      else if (width < 820) container.classList.add('is-size-compact');
      else if (width < 1120) container.classList.add('is-size-medium');
      else container.classList.add('is-size-wide');
    }

    function sizeListRow(card, size) {
      if (!card || state.view !== 'list') return;
      const container = root && root.querySelector('[data-role="list"]');
      if (!container) return;
      const stacked = container.classList.contains('is-size-stacked');
      const available = Math.max(0, container.clientWidth - 24);
      const imageWidth = stacked ? available : Math.max(1, available * 0.75);
      const width = Number(size && size.width) || 16;
      const height = Number(size && size.height) || 9;
      const imageHeight = Math.max(90, Math.round(imageWidth * height / width));
      const media = card.querySelector('.oluntir-is-list-media');
      if (media) {
        media.style.height = `${imageHeight}px`;
        media.style.aspectRatio = 'auto';
      }
      card.style.minHeight = stacked ? '0' : `${imageHeight}px`;
      card.style.height = 'auto';
    }

    function resizeRenderedListRows() {
      if (!root || state.view !== 'list') return;
      root.querySelectorAll('[data-role="list"] .oluntir-is-list-card').forEach((card) => {
        const size = sizeMap.get(card.dataset.path);
        sizeListRow(card, size);
      });
    }
    function observeListWidth() {
      const container = root && root.querySelector('[data-role="list"]');
      if (!container) return;
      listResizeObserver?.disconnect();
      if (typeof ResizeObserver === 'function') {
        listResizeObserver = new ResizeObserver(() => { applyListResponsiveClass(container); resizeRenderedListRows(); });
        listResizeObserver.observe(container);
      }
      requestAnimationFrame(() => { applyListResponsiveClass(container); resizeRenderedListRows(); });
    }

    function filtered() {
      let list = state.variants === 'all' ? meta.slice() : service.primary(meta);
      const q = state.query.trim().toLowerCase();
      if (q) list = list.filter((item) => `${item.name} ${item.path} ${item.variant.label}`.toLowerCase().includes(q));
      list = list.filter((item) => {
        if (state.filter === 'used') return item.used > 0;
        if (state.filter === 'unused') return item.used === 0;
        if (state.filter === 'svg') return /\.svg(?:$|\?)/i.test(item.path);
        if (state.filter === 'raster') return !/\.svg(?:$|\?)/i.test(item.path);
        return true;
      });
      list.sort((a, b) => {
        if (state.sort === 'name') return a.name.localeCompare(b.name, 'de');
        if (state.sort === 'size') return b.bytes - a.bytes;
        if (state.sort === 'usage') return b.used - a.used;
        // GrapesJS führt neu hinzugefügte Assets am Anfang der Collection.
        // Für gruppierte Responsive-Versionen wird deshalb der kleinste Index
        // der gesamten Bildgruppe als Sortierwert verwendet.
        return (a.recentIndex ?? a.index) - (b.recentIndex ?? b.index);
      });
      return list;
    }
    function selected() { return meta.find((item) => item.path === state.selectedPath) || null; }
    function groupFor(item) { return item ? meta.filter((entry) => entry.variant.group === item.variant.group) : []; }

    async function hydrateSizes(items) {
      const pending = items.filter((item) => !sizeMap.has(item.path));
      await Promise.all(pending.map(async (item) => sizeMap.set(item.path, await service.imageSize(item.path))));
      if (!root) return;
      items.forEach((item) => {
        const card = root.querySelector(`[data-path="${CSS.escape(item.path)}"]`);
        const label = card && card.querySelector('[data-resolution]');
        const size = sizeMap.get(item.path);
        if (label && size) label.textContent = size.width ? `${size.width} × ${size.height} px` : 'Auflösung unbekannt';
        if (card && size && size.width > 0 && size.height > 0) {
          card.dataset.imageWidth = String(size.width);
          card.dataset.imageHeight = String(size.height);
          const image = card.querySelector('img');
          if (image) {
            image.width = size.width;
            image.height = size.height;
          }
          sizeListRow(card, size);
        }
      });
      renderDetails();
    }
    function renderDetails() {
      if (!root) return;
      const item = selected();
      root.querySelector('[data-role="details"]').innerHTML = window.OluntirImageSelectUi.details(item, groupFor(item), sizeMap, currentMode);
      const lightboxOption = root.querySelector('[data-role="lightbox-option"]');
      if (lightboxOption && window.OluntirImageLightboxApi) {
        const selectedComponent = editor.getSelected && editor.getSelected();
        lightboxOption.checked = window.OluntirImageLightboxApi.isEnabled(selectedComponent);
        const downloadOption = root.querySelector('[data-role="lightbox-download-option"]');
        const captionOption = root.querySelector('[data-role="lightbox-caption-option"]');
        if (downloadOption) downloadOption.checked = window.OluntirImageLightboxApi.isDownloadEnabled(selectedComponent);
        if (captionOption) captionOption.checked = window.OluntirImageLightboxApi.isCaptionEnabled(selectedComponent);
      }
      root.querySelector('[data-action="use"]')?.addEventListener('click', () => choose(item));
      root.querySelector('[data-action="replace"]')?.addEventListener('click', () => replaceSelected(item));
    }
    function appendPage() {
      if (!root || renderedCount >= visibleList.length) return;
      const container = root.querySelector('[data-role="list"]');
      const end = Math.min(renderedCount + PAGE_SIZE, visibleList.length);
      const fragment = document.createDocumentFragment();
      const pageItems = visibleList.slice(renderedCount, end);
      pageItems.forEach((item) => {
        const card = state.view === 'list'
          ? window.OluntirImageListView.card(item, item.path === state.selectedPath, service.previewUrl(item.path), currentMode, window.OluntirImageSelectUi.formatBytes)
          : window.OluntirImageSelectUi.card(item, item.path === state.selectedPath, service.previewUrl(item.path), currentMode);
        fragment.appendChild(card);
      });
      const oldSentinel = container.querySelector('.oluntir-is-sentinel');
      if (oldSentinel) oldSentinel.remove();
      container.appendChild(fragment);
      renderedCount = end;
      if (state.view === 'list') resizeRenderedListRows();
      hydrateSizes(pageItems);
      if (renderedCount < visibleList.length) {
        const sentinel = document.createElement('div'); sentinel.className = 'oluntir-is-sentinel';
        container.appendChild(sentinel);
        sentinelObserver?.disconnect();
        sentinelObserver = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) appendPage(); }, { root: container, rootMargin: '600px 0px' });
        sentinelObserver.observe(sentinel);
      }
    }
    function render() {
      if (!root) return;
      meta = service.metadata(editor);
      visibleList = filtered();
      renderedCount = 0;
      sentinelObserver?.disconnect();
      const container = root.querySelector('[data-role="list"]');
      container.classList.toggle('is-list', state.view === 'list');
      applyListResponsiveClass(container);
      container.replaceChildren();
      if (!visibleList.length) container.innerHTML = '<p class="oluntir-is-empty">Keine passenden Bilder gefunden.</p>';
      else appendPage();
      const user = meta.filter((item) => item.user); const groups = new Set(user.map((item) => item.variant.group)); const bytes = user.reduce((sum, item) => sum + item.bytes, 0);
      root.querySelector('[data-role="summary"]').textContent = `${groups.size} ${groups.size === 1 ? 'Bild' : 'Bilder'} · ${user.length} Versionen · ${window.OluntirImageSelectUi.formatBytes(bytes)}`;
      renderDetails();
    }
    function selectItem(item) {
      if (!root || !item) return;
      state.selectedPath = item.path;

      // Die Auswahl verändert weder Filter noch Sortierung. Ein vollständiges
      // Neurendern würde deshalb nur die Bildliste ersetzen und deren
      // Scrollposition auf den Anfang zurücksetzen. Stattdessen werden nur
      // Auswahlmarkierung und Detailbereich aktualisiert.
      root.querySelectorAll('[data-role="list"] .is-selected').forEach((card) => {
        card.classList.remove('is-selected');
        card.setAttribute('aria-pressed', 'false');
      });
      const selectedCard = root.querySelector(`[data-role="list"] [data-path="${CSS.escape(item.path)}"]`);
      if (selectedCard) {
        selectedCard.classList.add('is-selected');
        selectedCard.setAttribute('aria-pressed', 'true');
      }
      renderDetails();
    }
    function choose(item) {
      if (!item || currentMode !== 'assign') return;
      const lightboxEnabled = !!(root && root.querySelector('[data-role="lightbox-option"]') && root.querySelector('[data-role="lightbox-option"]').checked);
      const lightboxDownload = !!(root && root.querySelector('[data-role="lightbox-download-option"]') && root.querySelector('[data-role="lightbox-download-option"]').checked);
      const lightboxCaption = !!(root && root.querySelector('[data-role="lightbox-caption-option"]') && root.querySelector('[data-role="lightbox-caption-option"]').checked);
      if (typeof currentOptions.select === 'function') currentOptions.select(item.asset, false);
      editor.trigger('asset:select', item.asset, false);
      if (window.OluntirImageLightboxApi) {
        const selected = editor.getSelected && editor.getSelected();
        window.OluntirImageLightboxApi.apply(selected, lightboxEnabled, { download: lightboxDownload, caption: lightboxCaption });
      }
      workspace.close();
    }
    async function deleteItems(items, label) {
      if (!items.length) { window.alert('Es wurden keine passenden Bilder gefunden.'); return; }
      const used = items.filter((item) => item.used > 0);
      if (!window.confirm(`${label}?\n\n${items.length} Bilder werden einschließlich aller Versionen dauerhaft gelöscht.`)) return;
      if (used.length && !window.confirm(`${used.length} der Bilder werden im Projekt verwendet. Dadurch können Bildreferenzen fehlen. Trotzdem löschen?`)) return;
      for (const item of items) await service.removeGroup(editor, item);
      state.selectedPath = null; render();
    }
    async function replaceSelected(item) {
      if (!item || !item.user) return;
      const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
      input.addEventListener('change', async () => {
        const file = input.files && input.files[0]; if (!file) return;
        const oldGroup = groupFor(item); const generated = await createResponsiveImageAssets(file);
        const newPaths = [generated.desktopPath, generated.tabletPath, generated.mobilePath, generated.downloadPath];
        const order = ['desktop', 'tablet', 'mobile', 'original'];
        for (let i = 0; i < order.length; i++) {
          const old = oldGroup.find((entry) => entry.variant.type === order[i]); const blob = window.OluntirIndexedDbAssetStore.get(newPaths[i]);
          if (old && blob) await window.OluntirIndexedDbAssetStore.put(old.path, blob);
          await window.OluntirIndexedDbAssetStore.removeSingle(newPaths[i]);
        }
        sizeMap = new Map(); render(); if (window.toast) window.toast('Bild wurde ersetzt; bestehende Pfade bleiben erhalten.');
      }, { once: true }); input.click();
    }
    function bind() {
      root.querySelector('[data-role="search"]').addEventListener('input', (e) => { state.query = e.target.value; render(); });
      root.querySelector('[data-role="filter"]').addEventListener('change', (e) => { state.filter = e.target.value; render(); });
      root.querySelector('[data-role="variants"]').addEventListener('change', (e) => { state.variants = e.target.value; render(); });
      root.querySelector('[data-role="sort"]').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
      root.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => { state.view = button.dataset.view; root.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('is-active', b === button)); render(); }));
      root.querySelector('[data-role="upload"]').addEventListener('change', async (e) => { await service.upload(editor, e.target.files); e.target.value = ''; render(); });
      root.querySelector('[data-role="list"]').addEventListener('click', async (e) => {
        const card = e.target.closest('[data-path]'); if (!card) return; const item = meta.find((entry) => entry.path === card.dataset.path); if (!item) return;
        if (e.target.closest('.oluntir-is-trash')) { e.stopPropagation(); await deleteItems([item], 'Dieses Bild löschen'); return; }
        if (state.selectedPath === item.path && currentMode === 'assign') choose(item); else selectItem(item);
      });
      root.querySelector('[data-role="list"]').addEventListener('dblclick', (e) => { if (currentMode !== 'assign') return; const card = e.target.closest('[data-path]'); const item = card && meta.find((entry) => entry.path === card.dataset.path); choose(item); });
      root.querySelector('[data-role="list"]').addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('[data-path]');
        const item = card && meta.find((entry) => entry.path === card.dataset.path);
        if (!item) return;
        e.preventDefault();
        if (state.selectedPath === item.path && currentMode === 'assign') choose(item); else selectItem(item);
      });
      const projectFolderInfo = root.querySelector('[data-role="project-folder-info"]');
      const closeProjectFolderInfo = () => {
        projectFolderInfo.hidden = true;
        root.querySelector('[data-action="sync-folder"]').focus();
      };
      root.querySelector('[data-action="sync-folder"]').addEventListener('click', () => {
        projectFolderInfo.hidden = false;
        projectFolderInfo.querySelector('[data-action="choose-project-folder"]').focus();
      });
      projectFolderInfo.querySelectorAll('[data-action="cancel-project-folder"]').forEach((button) => button.addEventListener('click', closeProjectFolderInfo));
      projectFolderInfo.querySelector('[data-action="choose-project-folder"]').addEventListener('click', async () => {
        projectFolderInfo.hidden = true;
        try {
          const result = await service.connectAndSyncProjectFolder();
          if (window.toast) window.toast(`${result.count} Upload-Datei(en) wurden nach assets/user_upload geschrieben.`);
        } catch (error) {
          if (error && error.name === 'AbortError') return;
          window.alert('Projektordner konnte nicht synchronisiert werden: ' + error.message);
        }
      });
      root.querySelector('[data-action="delete-unused"]').addEventListener('click', () => deleteItems(service.primary(meta).filter((item) => item.user && item.used === 0), 'Alle nicht verwendeten Bilder löschen'));
      root.querySelector('[data-action="delete-all"]').addEventListener('click', () => deleteItems(service.primary(meta).filter((item) => item.user), 'Alle hochgeladenen Bilder löschen'));
    }
    async function mount(options) {
      currentOptions = options || {};
      currentMode = typeof currentOptions.select === 'function' && currentOptions.source !== 'toolbar' ? 'assign' : 'manage';
      state.selectedPath = null;
      root = window.OluntirImageSelectUi.shell(currentMode);
      bind();
      observeListWidth();
      render(); editor.trigger('asset:open');
      return root;
    }
    async function unmount() {
      sentinelObserver?.disconnect(); listResizeObserver?.disconnect();
      sentinelObserver = null; listResizeObserver = null; root = null;
      editor.trigger('asset:close');

      // Wird der Workspace über sein eigenes X oder Escape geschlossen, muss
      // auch der aktive GrapesJS-Befehl beendet werden. Andernfalls betrachtet
      // GrapesJS `open-assets` weiterhin als aktiv und führt ihn beim nächsten
      // Klick auf ein Bild nicht erneut aus.
      ['open-assets', 'oluntir-open-image-manager'].forEach((commandId) => {
        try {
          if (editor.Commands && typeof editor.Commands.isActive === 'function' && editor.Commands.isActive(commandId)) {
            editor.Commands.stop(commandId);
          }
        } catch (error) {
          console.warn(`Oluntir: Befehl ${commandId} konnte beim Schließen nicht zurückgesetzt werden.`, error);
        }
      });
    }
    workspace.register('images', { title: 'Bildmanager', mount, unmount });
    adapter.setImageSelector({ open: (options) => workspace.open('images', options || {}), close: () => workspace.close(), isOpen: () => workspace.isOpen('images') });
  }
  window.OluntirImageSelect = { register };
})();

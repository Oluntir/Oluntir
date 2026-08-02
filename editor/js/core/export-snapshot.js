(function (root, factory) {
  const api = factory(root || globalThis);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirExportSnapshot = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const VERSION = 1;
  let sequence = 0;
  const freeze = value => Object.freeze(value);
  const nextFrame = () => new Promise(resolve => {
    if (typeof root.requestAnimationFrame === 'function') root.requestAnimationFrame(() => resolve());
    else root.setTimeout(resolve, 0);
  });

  function pageHtml(editor, page) {
    if (!page || typeof page.getMainComponent !== 'function') return '';
    const component = page.getMainComponent();
    if (!component) return '';
    if (typeof component.getInnerHTML === 'function') return String(component.getInnerHTML() || '');
    if (editor && typeof editor.getHtml === 'function') {
      try { return String(editor.getHtml({ component }) || ''); } catch (_) { /* fallback */ }
    }
    return typeof component.toHTML === 'function' ? String(component.toHTML() || '') : '';
  }

  async function create(editor, options) {
    if (!editor || !editor.Pages || typeof editor.Pages.getAll !== 'function') throw new Error('EXPORT_SNAPSHOT_EDITOR_REQUIRED');
    const pages = editor.Pages.getAll();
    if (!pages || !pages.length) throw new Error('EXPORT_SNAPSHOT_NO_PAGES');

    const shared = root.OluntirSharedContentManager;
    const selected = editor.Pages.getSelected ? editor.Pages.getSelected() : null;
    let sharedReceipt = null;
    if (shared && selected && typeof shared.prepareForExport === 'function') {
      sharedReceipt = await shared.prepareForExport(selected);
    }

    const assets = root.OluntirAssetReadiness;
    const assetSnapshot = assets && typeof assets.captureExportSnapshot === 'function'
      ? await assets.captureExportSnapshot({ quietFrames: 2, timeoutMs: Number(options && options.timeoutMs) || 10000 })
      : freeze({ schemaVersion: 1, capturedAt: new Date().toISOString(), operationSequence: 0, entries: freeze([]) });

    if (typeof root.OluntirPersistProjectNow === 'function') await root.OluntirPersistProjectNow();
    else if (typeof root.OluntirWriteProjectSnapshotNow === 'function') root.OluntirWriteProjectSnapshotNow();
    await nextFrame();

    const pageSnapshots = pages.map((page, index) => freeze({
      id: String(page.id || ''),
      name: String((typeof page.getName === 'function' && page.getName()) || page.id || `Seite ${index + 1}`),
      html: pageHtml(editor, page)
    }));

    const snapshot = {
      schemaVersion: VERSION,
      snapshotId: `oluntir-export-${Date.now()}-${++sequence}`,
      createdAt: new Date().toISOString(),
      selectedPageId: selected ? String(selected.id || '') : null,
      sharedCommitToken: sharedReceipt && sharedReceipt.commitToken || null,
      assetOperationSequence: assetSnapshot.operationSequence || 0,
      css: String((editor.getCss && editor.getCss()) || ''),
      pages: freeze(pageSnapshots),
      assets: freeze(assetSnapshot.entries.slice())
    };
    return freeze(snapshot);
  }

  return freeze({ VERSION, create });
});

const assert = require('assert');
const path = require('path');

const root = global;
root.window = root;
root.globalThis = root;
root.setTimeout = setTimeout;
root.requestAnimationFrame = cb => setTimeout(cb, 0);
root.OluntirPersistProjectNow = async () => true;
root.OluntirSharedContentManager = {
  prepareForExport: async () => ({ committed: true, commitToken: 1 })
};
root.OluntirAssetReadiness = {
  captureExportSnapshot: async () => ({
    schemaVersion: 1,
    operationSequence: 3,
    entries: Object.freeze([{ path: 'assets/user_upload/desktop/test.jpg', blob: { size: 10 } }])
  })
};
const pageComponent = html => ({ getInnerHTML: () => html });
const pages = [
  { id: 'index', getName: () => 'Start', getMainComponent: () => pageComponent('<main>Start</main>') },
  { id: 'sub', getName: () => 'Unterseite', getMainComponent: () => pageComponent('<main>Unterseite</main>') }
];
const editor = {
  Pages: { getAll: () => pages, getSelected: () => pages[0] },
  getCss: () => '.x{display:block}'
};
const api = require(path.join(process.cwd(), 'editor/js/core/export-snapshot.js'));
(async () => {
  const snapshot = await api.create(editor);
  assert.ok(Object.isFrozen(snapshot));
  assert.strictEqual(snapshot.pages.length, 2);
  assert.strictEqual(snapshot.pages[1].html, '<main>Unterseite</main>');
  assert.strictEqual(snapshot.assets.length, 1);
  assert.strictEqual(snapshot.assetOperationSequence, 3);
  assert.ok(snapshot.snapshotId.startsWith('oluntir-export-'));
  console.log('EXPORT-SNAPSHOT-TRANSACTION-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });

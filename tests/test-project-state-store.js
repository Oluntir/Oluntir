'use strict';

const assert = require('assert');
const ProjectStore = require('../editor/js/core/project-state-store.js');

(async function run() {
  const store = ProjectStore.create({
    projectId: 'ol_project_test',
    initialState: {
      pages: {
        index: { title: 'Start', components: [] },
        contact: { title: 'Kontakt', components: [] }
      },
      repeat: { definitions: [] }
    },
    checkpointEvery: 2
  });

  const tx1 = store.beginTransaction({ type: 'page.update', label: 'Titel ändern' });
  store.record(tx1.transactionId, {
    type: 'state.set',
    pageId: 'index',
    identity: 'ol_page_index',
    path: 'pages.index.title',
    beforeExists: true,
    before: 'Start',
    after: 'Startseite'
  });
  const commit1 = store.commit(tx1.transactionId);
  assert.strictEqual(commit1.revisionAfter, 1);
  assert.strictEqual(store.getState().currentState.pages.index.title, 'Startseite');
  assert.strictEqual(store.canUndo(), true);

  const tx2 = store.beginTransaction({ type: 'component.insert', scope: 'page' });
  store.record(tx2.transactionId, {
    type: 'collection.insert',
    pageId: 'index',
    identity: 'ol_component_card',
    path: 'pages.index.components',
    index: 0,
    value: { identity: 'ol_component_card', type: 'card' }
  });
  store.commit(tx2.transactionId);
  assert.strictEqual(store.getState().currentState.pages.index.components.length, 1);
  assert.strictEqual(store.getState().checkpointCount, 1);

  const undo2 = store.undo();
  assert.strictEqual(undo2.revision, 1);
  assert.strictEqual(store.getState().currentState.pages.index.components.length, 0);
  assert.strictEqual(store.canRedo(), true);

  const redo2 = store.redo();
  assert.strictEqual(redo2.revision, 2);
  assert.strictEqual(store.getState().currentState.pages.index.components.length, 1);

  store.undo();
  store.undo();
  assert.strictEqual(store.getState().currentState.pages.index.title, 'Start');
  assert.strictEqual(store.getState().currentState.pages.index.components.length, 0);
  store.redo();
  store.redo();
  assert.strictEqual(store.getState().currentState.pages.index.title, 'Startseite');
  assert.strictEqual(store.getState().currentState.pages.index.components.length, 1);

  const image = store.registerAsset({
    assetId: 'asset_sunset',
    hash: 'sha256:test',
    path: 'assets/user_upload/desktop/sunset.jpg',
    size: 1234,
    variants: { tablet: 'assets/user_upload/tablet/sunset.jpg' }
  });
  const duplicate = store.registerAsset({ hash: 'sha256:test', path: 'duplicate.jpg' });
  assert.strictEqual(duplicate.assetId, image.assetId);
  store.addAssetReference(image.assetId, { pageId: 'index', identity: 'ol_component_card' });
  assert.strictEqual(store.listAssets()[0].referenceCount, 1);

  const verification = store.verify();
  assert.strictEqual(verification.valid, true);
  assert.strictEqual(verification.transactionCount, 2);

  const incremental = store.createBackupPlan({ sinceRevision: 1 });
  assert.strictEqual(incremental.type, 'incremental');
  assert.strictEqual(incremental.transactions.length, 1);

  const full = store.createBackupPlan({ full: true });
  assert.strictEqual(full.type, 'full');
  assert.strictEqual(full.assets.length, 1);

  const bundle = store.exportBundle();
  const restored = ProjectStore.create({ projectId: 'other' });
  restored.loadBundle(bundle);
  assert.deepStrictEqual(restored.getState().currentState, store.getState().currentState);
  assert.strictEqual(restored.verify().valid, true);

  const memory = { bundle: null };
  restored.connectAdapter({
    async saveBundle(value) { memory.bundle = value; },
    async loadBundle() { return memory.bundle; }
  });
  await restored.persist();
  const loaded = ProjectStore.create({ adapter: restored.adapter });
  await loaded.load();
  assert.deepStrictEqual(loaded.getState().currentState, restored.getState().currentState);

  const bad = JSON.parse(JSON.stringify(bundle));
  bad.journal[0].transactionHash = 'invalid';
  const rejected = ProjectStore.create();
  assert.throws(() => rejected.loadBundle(bad), error => error.code === 'PROJECT_STORE_BUNDLE_INVALID');

  console.log('PROJECT-STATE-STORE-TEST ERFOLGREICH');
})().catch(error => {
  console.error(error);
  process.exit(1);
});

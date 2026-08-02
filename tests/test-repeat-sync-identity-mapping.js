const assert = require('assert');
const api = require('../editor/js/core/repeat-sync-access-adapter.js');

function createComponent(definition, parentRef) {
  const def = definition || {};
  const state = Object.assign({}, def, {
    tagName: def.tagName || 'div',
    attributes: Object.assign({}, def.attributes || {}),
    components: []
  });
  let parent = parentRef || null;
  const component = {
    get(key) { return state[key]; },
    set(key, value) { state[key] = value; },
    getAttributes() { return Object.assign({}, state.attributes); },
    setAttributes(value) { state.attributes = Object.assign({}, value || {}); },
    addAttributes(value) { state.attributes = Object.assign({}, state.attributes, value || {}); },
    parent() { return parent; },
    index() { return parent ? parent.components().models.indexOf(component) : 0; },
    move(nextParent, options) {
      if (parent) {
        const current = parent.components().models.indexOf(component);
        if (current >= 0) parent.components().models.splice(current, 1);
      }
      parent = nextParent;
      const at = Math.max(0, Math.min(Number(options && options.at) || 0, nextParent.components().models.length));
      nextParent.components().models.splice(at, 0, component);
      return component;
    },
    remove() {
      if (!parent) return;
      const index = parent.components().models.indexOf(component);
      if (index >= 0) parent.components().models.splice(index, 1);
      parent = null;
    },
    components() { return collection; },
    toJSON() {
      const output = {};
      Object.keys(state).forEach(key => {
        if (key === 'components') return;
        output[key] = JSON.parse(JSON.stringify(state[key]));
      });
      output.attributes = Object.assign({}, state.attributes);
      output.components = state.components.map(item => item.toJSON());
      return output;
    }
  };
  const collection = {
    models: state.components,
    add(childDefinition, options) {
      const child = createComponent(childDefinition, component);
      const at = options && Number.isInteger(options.at) ? options.at : state.components.length;
      state.components.splice(Math.max(0, Math.min(at, state.components.length)), 0, child);
      return child;
    },
    remove(child) {
      const index = state.components.indexOf(child);
      if (index >= 0) state.components.splice(index, 1);
    }
  };
  (def.components || []).forEach(child => collection.add(child));
  return component;
}

function page(id, root) {
  return {
    get(key) { return key === 'oluntirPageId' ? id : null; },
    getMainComponent() { return root; }
  };
}

const source = createComponent({
  tagName: 'section',
  attributes: { 'data-oluntir-section-id': 'source-root', class: 'repeat-list' },
  components: [
    { tagName: 'article', attributes: { 'data-oluntir-component-id': 'source-a', class: 'card' }, content: 'A' },
    { tagName: 'article', attributes: { 'data-oluntir-component-id': 'source-b', class: 'card' }, content: 'B' }
  ]
});
const target = createComponent({
  tagName: 'section',
  attributes: { 'data-oluntir-section-id': 'target-root', class: 'repeat-list' },
  components: [
    { tagName: 'article', attributes: { 'data-oluntir-component-id': 'target-a', class: 'card' }, content: 'Alt A' },
    { tagName: 'article', attributes: { 'data-oluntir-component-id': 'target-b', class: 'card' }, content: 'Alt B' }
  ]
});
const editor = { Pages: { getAll() { return [page('page-source', source), page('page-target', target)]; } } };
const adapter = api.create(editor);
const operation = { sourcePageId: 'page-source', sourceIdentity: 'source-root', targetPageId: 'page-target', targetIdentity: 'target-root' };

// Initial mapping keeps all existing target identities.
let sourceSnapshot = adapter.readSource(operation);
let targetSnapshot = adapter.readTarget(operation);
adapter.validateWrite(operation, sourceSnapshot, targetSnapshot);
adapter.writeTarget(operation, sourceSnapshot);
assert.deepStrictEqual(target.components().models.map(item => item.getAttributes()['data-oluntir-component-id']), ['target-a', 'target-b']);
assert.deepStrictEqual(target.components().models.map(item => item.get(api.SOURCE_IDENTITY_PROPERTY)), ['source-a', 'source-b']);
assert.deepStrictEqual(target.components().models.map(item => item.get('content')), ['A', 'B']);

// Add a new source child in the middle. Existing mapped target identities remain stable.
source.components().add({
  tagName: 'article',
  attributes: { 'data-oluntir-component-id': 'source-new', class: 'card' },
  content: 'Neu'
}, { at: 1 });
const beforeInsertIds = target.components().models.map(item => item.getAttributes()['data-oluntir-component-id']);
const rollbackBeforeInsert = adapter.captureRollback(adapter.readTarget(operation));
sourceSnapshot = adapter.readSource(operation);
adapter.writeTarget(operation, sourceSnapshot);
const afterInsert = target.components().models;
assert.strictEqual(afterInsert.length, 3);
assert.strictEqual(afterInsert[0].getAttributes()['data-oluntir-component-id'], beforeInsertIds[0]);
assert.strictEqual(afterInsert[2].getAttributes()['data-oluntir-component-id'], beforeInsertIds[1]);
assert.strictEqual(afterInsert[1].get(api.SOURCE_IDENTITY_PROPERTY), 'source-new');
assert.ok(afterInsert[1].getAttributes()['data-oluntir-component-id']);
assert.notStrictEqual(afterInsert[1].getAttributes()['data-oluntir-component-id'], 'source-new');
assert.deepStrictEqual(afterInsert.map(item => item.get('content')), ['A', 'Neu', 'B']);

// Rollback restores exact previous topology and target identities.
adapter.restoreTarget(operation, rollbackBeforeInsert);
assert.strictEqual(target.components().models.length, 2);
assert.deepStrictEqual(target.components().models.map(item => item.getAttributes()['data-oluntir-component-id']), beforeInsertIds);
assert.deepStrictEqual(target.components().models.map(item => item.get('content')), ['A', 'B']);

// Reapply insertion and then remove source A. Only its mapped target is removed.
adapter.writeTarget(operation, adapter.readSource(operation));
source.components().models[0].remove();
adapter.writeTarget(operation, adapter.readSource(operation));
assert.strictEqual(target.components().models.length, 2);
assert.deepStrictEqual(target.components().models.map(item => item.get(api.SOURCE_IDENTITY_PROPERTY)), ['source-new', 'source-b']);
assert.deepStrictEqual(target.components().models.map(item => item.get('content')), ['Neu', 'B']);
assert.strictEqual(target.components().models[1].getAttributes()['data-oluntir-component-id'], 'target-b');

// Duplicate source identities are rejected before mutation.
source.components().add({ tagName: 'article', attributes: { 'data-oluntir-component-id': 'source-b' }, content: 'Duplicate' });
assert.throws(() => adapter.validateWrite(operation, adapter.readSource(operation), adapter.readTarget(operation)), error => error.code === 'REPEAT_SYNC_SOURCE_IDENTITY_DUPLICATE');

console.log('Repeat Sync Identity Mapping DEV_007: OK');

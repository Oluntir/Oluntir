const assert = require('assert');
const api = require('../editor/js/core/repeat-sync-access-adapter.js');

function collection(models) { return { models }; }
function component(tag, attributes, content, kids) {
  const state = { tagName: tag, attributes: Object.assign({}, attributes), content: content || '', components: kids || [] };
  return {
    get(key) { return state[key]; },
    set(key, value) { state[key] = value; },
    getAttributes() { return Object.assign({}, state.attributes); },
    setAttributes(value) { state.attributes = Object.assign({}, value); },
    addAttributes(value) { state.attributes = Object.assign({}, state.attributes, value); },
    components() { return collection(state.components); },
    toJSON() { return { tagName: state.tagName, attributes: Object.assign({}, state.attributes), content: state.content, components: state.components.map(item => item.toJSON()) }; }
  };
}
const source = component('section', {'data-oluntir-section-id':'source-root', class:'source'}, '', [component('p', {'data-oluntir-component-id':'source-child'}, 'Neu', [])]);
const target = component('section', {'data-oluntir-section-id':'target-root', class:'target'}, '', [component('p', {'data-oluntir-component-id':'target-child'}, 'Alt', [])]);
const pages = [
  { get(key){ return key === 'oluntirPageId' ? 'page-source' : null; }, getMainComponent(){ return source; } },
  { get(key){ return key === 'oluntirPageId' ? 'page-target' : null; }, getMainComponent(){ return target; } }
];
const editor = { Pages: { getAll(){ return pages; } } };
const adapter = api.create(editor);
const op = { sourcePageId:'page-source', sourceIdentity:'source-root', targetPageId:'page-target', targetIdentity:'target-root' };
const sourceSnapshot = adapter.readSource(op);
const targetSnapshot = adapter.readTarget(op);
assert.notStrictEqual(adapter.fingerprint(sourceSnapshot), adapter.fingerprint(targetSnapshot));
const rollback = adapter.captureRollback(targetSnapshot);
adapter.validateWrite(op, sourceSnapshot, targetSnapshot);
adapter.writeTarget(op, sourceSnapshot);
assert.strictEqual(target.getAttributes()['data-oluntir-section-id'], 'target-root');
assert.strictEqual(target.components().models[0].getAttributes()['data-oluntir-component-id'], 'target-child');
assert.strictEqual(target.components().models[0].get('content'), 'Neu');
adapter.restoreTarget(op, rollback);
assert.strictEqual(target.components().models[0].get('content'), 'Alt');

const mismatch = component('section', {'data-oluntir-section-id':'other'}, '', []);
assert.strictEqual(api.topologyCompatible(sourceSnapshot, mismatch.toJSON()), false);
console.log('Repeat Sync Access Adapter DEV_006: OK');

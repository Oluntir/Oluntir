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

// 2.2.1: central library publishes a stored snapshot directly to a target
// without requiring a live GrapesJS source component.
const directSource = JSON.parse(JSON.stringify(sourceSnapshot));
directSource.components[0].content = 'Zentral publiziert';
adapter.writeSnapshot('page-target', 'target-root', directSource);
assert.strictEqual(target.components().models[0].get('content'), 'Zentral publiziert');
const directRead = adapter.readByIdentity('page-target', 'target-root');
assert.strictEqual(directRead.components[0].content, 'Zentral publiziert');
adapter.restoreByIdentity('page-target', 'target-root', rollback);
assert.strictEqual(target.components().models[0].get('content'), 'Alt');
console.log('Repeat Sync Access Adapter 2.2 central snapshot: OK');

// 2.2.1 v30: GrapesJS interaction locks belong to materialized page
// instances, not to the canonical Repeat content. Otherwise a stored locked
// instance would make the central Draft workspace uneditable after reopening.
const lockedDefinition = {
  tagName:'section', editable:false, stylable:false, draggable:false, droppable:false, removable:false, copyable:false,
  attributes:{ 'data-oluntir-section-id':'locked-root' },
  components:[{
    tagName:'div', type:'text', editable:false, stylable:false, draggable:false, droppable:false, removable:false, copyable:false,
    attributes:{ 'data-oluntir-component-id':'locked-text' }, content:'Editierbar', components:[]
  }]
};
const cleanedLockedDefinition = api.cleanDefinition(lockedDefinition);
['editable','stylable','draggable','droppable','removable','copyable'].forEach(key => {
  assert.strictEqual(Object.prototype.hasOwnProperty.call(cleanedLockedDefinition, key), false, `Canonical Repeat root must not persist ${key}.`);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(cleanedLockedDefinition.components[0], key), false, `Canonical Repeat child must not persist ${key}.`);
});
console.log('Repeat Sync Access Adapter 2.2 workspace capability cleanup: OK');

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync(path.join(__dirname, '..', 'editor/integrations/grapesjs/grapesjs-adapter.js'), 'utf8');

function component(identity, children = []) {
  const model = {
    identity,
    _parent: null,
    _children: children,
    append(html, options) { this.lastAppend = { html, at: options.at }; return [{ html }]; },
    parent() { return this._parent; },
    components() { return { models: this._children }; },
    getAttributes() { return { 'data-oluntir-component-id': identity }; },
    getClasses() { return []; },
    get(name) { return name === 'tagName' ? 'div' : null; }
  };
  children.forEach(child => { child._parent = model; });
  return model;
}

const before = component('before');
const anchor = component('anchor');
const after = component('after');
const realParent = component('real-parent', [before, anchor, after]);
const semanticParent = component('semantic-parent');
const page = { get: key => key === 'id' ? 'page-1' : null };
const byId = new Map([
  ['before', before], ['anchor', anchor], ['after', after],
  ['real-parent', realParent], ['semantic-parent', semanticParent]
]);

const context = {
  console,
  document: { querySelectorAll() { return []; } },
  globalThis: {},
};
context.window = context.globalThis;
context.globalThis.OluntirGrapesCompatibility = { check() { return {}; } };
context.globalThis.OluntirImageSelect = { register() {} };
context.globalThis.OluntirLayoutIdentities = {
  pageId() { return 'page-1'; },
  findById(_page, id) { return byId.get(id) || null; },
  componentId(model) { return model.identity; }
};
vm.runInNewContext(source, context);
const factory = context.globalThis.OluntirGrapesAdapter;
const editor = {
  AssetManager: { getAll() { return []; } },
  Pages: { getSelected() { return page; }, getAll() { return [page]; } },
  Commands: { get() { return null; }, add() {}, remove() {} },
  Panels: { getButton() { return null; }, addButton() {} }
};
const adapter = factory.create(editor);

let resolved = adapter.resolveInsertionTarget({
  pageId: 'page-1', mode: 'after', anchorIdentity: 'anchor',
  // Deliberately semantic/non-immediate parent. Must not be used for after.
  parentIdentity: 'semantic-parent'
});
assert.strictEqual(resolved.parent, realParent, 'after must use anchor runtime parent');
assert.strictEqual(resolved.at, 2, 'after must insert at anchor index + 1');

resolved = adapter.resolveInsertionTarget({ pageId: 'page-1', mode: 'before', anchorIdentity: 'anchor', parentIdentity: 'semantic-parent' });
assert.strictEqual(resolved.parent, realParent, 'before must use anchor runtime parent');
assert.strictEqual(resolved.at, 1, 'before must insert at anchor index');

resolved = adapter.resolveInsertionTarget({ pageId: 'page-1', mode: 'inside-start', parentIdentity: 'semantic-parent' });
assert.strictEqual(resolved.parent, semanticParent);
assert.strictEqual(resolved.at, 0);

semanticParent._children.push(component('child'));
resolved = adapter.resolveInsertionTarget({ pageId: 'page-1', mode: 'inside-end', parentIdentity: 'semantic-parent' });
assert.strictEqual(resolved.parent, semanticParent);
assert.strictEqual(resolved.at, 1);

console.log('STRUCTURE-INSERTION-POSITION-MODES-TEST ERFOLGREICH');

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const source = fs.readFileSync('editor/js/core/oluntir-document-api.js', 'utf8');

const components = {
  container: { identity:'container', templateRole:'container', tagName:'div', classes:['container'], parentIdentity:'section' },
  row1: { identity:'row1', templateRole:'row', tagName:'div', classes:['row'], parentIdentity:'container' },
  row2: { identity:'row2', templateRole:'row', tagName:'div', classes:['row','align-items-stretch'], parentIdentity:'container' },
  card: { identity:'card', templateRole:'card', tagName:'div', classes:['card'], parentIdentity:'row1' }
};
const structure = {
  pageId:'page', roots:[{identity:'container', children:[
    {identity:'row1', children:[{identity:'card', children:[]}]},
    {identity:'row2', children:[]}
  ]}]
};
const page = { get(){ return 'page'; } };
const root = {
  OluntirStructureResolver:{ resolvePage(){ return structure; } },
  OluntirGrapes:{
    getSelectedPage(){ return page; },
    describeIdentity(_page,id){ return components[id]; },
    describeIdentityPosition(_page,id){ return { parentIdentity: components[id].parentIdentity, index: id==='row2'?1:0 }; },
    resolveInsertionTarget(target){ return target; },
    highlightInsertionTarget(){ return ()=>{}; }
  }
};
root.window=root; root.globalThis=root;
vm.runInNewContext(source, root);
const model=root.OluntirDocumentApi.buildInsertionModel({});
assert.strictEqual(model.modelType,'bootstrap-row-insertion-slots');
assert.strictEqual(model.roots.length,1);
assert.strictEqual(model.roots[0].templateRole,'container');
assert.strictEqual(model.roots[0].rows.length,2);
assert.strictEqual(model.nodes.every(n=>n.templateRole==='row'),true,'Only direct ROWs should be primary nodes');
const rowSlots = model.slots.filter(slot => slot.slotKind !== 'new-gallery-area');
assert.strictEqual(rowSlots.length,3);
assert.strictEqual(rowSlots[0].slotKind,'before-row');
assert.strictEqual(rowSlots[1].slotKind,'between-rows');
assert.strictEqual(rowSlots[2].slotKind,'after-last-row');
assert.strictEqual(model.slots.some(s=>s.anchorIdentity==='card'),false,'Nested card DIV must not become a primary gallery slot');
console.log('BOOTSTRAP-ROW-INSERTION-SLOTS-TEST ERFOLGREICH');

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const source = fs.readFileSync('editor/js/core/oluntir-document-api.js', 'utf8');

const components = {
  headerContainer: { identity:'headerContainer', templateRole:'container', tagName:'div', classes:['container'], parentIdentity:'header', origin:'shared-header' },
  main: { identity:'main', templateRole:'main', tagName:'main', classes:[], parentIdentity:null, origin:'main' },
  section1: { identity:'section1', templateRole:'section', tagName:'section', classes:['py-5'], parentIdentity:'main', origin:'page' },
  container1: { identity:'container1', templateRole:'container', tagName:'div', classes:['container'], parentIdentity:'section1', origin:'page' },
  row1: { identity:'row1', templateRole:'row', tagName:'div', classes:['row'], parentIdentity:'container1', origin:'page' },
  section2: { identity:'section2', templateRole:'section', tagName:'section', classes:['py-5'], parentIdentity:'main', origin:'page' },
  container2: { identity:'container2', templateRole:'container', tagName:'div', classes:['container'], parentIdentity:'section2', origin:'page' },
  row2: { identity:'row2', templateRole:'row', tagName:'div', classes:['row'], parentIdentity:'container2', origin:'page' }
};
const structure = {
  pageId:'page',
  roots:[
    {identity:'headerContainer', children:[]},
    {identity:'main', children:[
      {identity:'section1', children:[{identity:'container1', children:[{identity:'row1', children:[]}]}]},
      {identity:'section2', children:[{identity:'container2', children:[{identity:'row2', children:[]}]}]}
    ]}
  ]
};
const page = {};
const root = {
  OluntirStructureResolver:{ resolvePage(){ return structure; } },
  OluntirGrapes:{
    getSelectedPage(){ return page; },
    describeIdentity(_page,id){ return components[id]; },
    describeIdentityPosition(_page,id){ return { parentIdentity: components[id].parentIdentity, index:0 }; },
    resolveInsertionTarget(target){ return target; },
    highlightInsertionTarget(){ return ()=>{}; }
  }
};
root.window=root; root.globalThis=root;
vm.runInNewContext(source, root);
const model=root.OluntirDocumentApi.buildInsertionModel({});
const headerGroup=model.roots.find(group => group.origin === 'shared-header');
assert(headerGroup, 'Shared header must remain visible as orientation context');
assert.strictEqual(headerGroup.contextOnly, true, 'Shared header must be context-only');
assert.strictEqual(model.slots.some(slot => slot.parentIdentity === 'headerContainer'), false, 'Shared header must not expose gallery insertion slots');
const areaSlots=model.slots.filter(slot => slot.slotKind === 'new-gallery-area');
assert.strictEqual(areaSlots.length,3,'MAIN with two sections needs before, between and after area slots');
assert.strictEqual(areaSlots[0].mode,'before');
assert.strictEqual(areaSlots[1].mode,'after');
assert.strictEqual(areaSlots[2].mode,'after');
assert.strictEqual(areaSlots.every(slot => slot.parentIdentity === 'main'),true,'New area slots must target MAIN, never shared header/footer containers');
assert.strictEqual(model.visualAreas.length,2,'Two direct page areas must define the inter-container sequence');
assert.strictEqual(areaSlots[0].visualIndex,0);
assert.strictEqual(areaSlots[1].visualIndex,1);
assert.strictEqual(areaSlots[2].visualIndex,2);
console.log('GALLERY-AREA-SLOTS-TEST ERFOLGREICH');

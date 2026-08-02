const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('editor/js/core/oluntir-document-api.js', 'utf8');
const descriptors = {
  c1: { templateRole:'container-fluid', tagName:'div', classes:['container-fluid'], origin:'page' },
  r1: { templateRole:'row', tagName:'div', classes:['row'], origin:'page' },
  c2: { templateRole:'container-fluid', tagName:'div', classes:['container-fluid'], origin:'page' },
  r2: { templateRole:'row', tagName:'div', classes:['row'], origin:'page' },
  c3: { templateRole:'container-fluid', tagName:'div', classes:['container-fluid'], origin:'page' }
};
const positions = {
  c1:{parentIdentity:'main-runtime',index:0,path:[0]}, r1:{parentIdentity:'c1',index:0,path:[0,0]},
  c2:{parentIdentity:'main-runtime',index:1,path:[1]}, r2:{parentIdentity:'c2',index:0,path:[1,0]},
  c3:{parentIdentity:'main-runtime',index:2,path:[2]}
};
const structure = { pageId:'page', roots:[
  {identity:'c1',children:[{identity:'r1',children:[]}]},
  {identity:'c2',children:[{identity:'r2',children:[]}]},
  {identity:'c3',children:[]}
]};
const root = {
  OluntirStructureResolver:{resolvePage(){return structure;}},
  OluntirGrapes:{
    getSelectedPage(){return {};},
    describeIdentity(_page,id){return descriptors[id] || null;},
    describeIdentityPosition(_page,id){return positions[id] || null;},
    resolveInsertionTarget(target){return target;},
    highlightInsertionTarget(){return ()=>{};}
  }
};
root.window=root; root.globalThis=root;
vm.runInNewContext(source, root);
const model=root.OluntirDocumentApi.buildInsertionModel({});
assert.deepStrictEqual(Array.from(model.visualAreas, a=>a.identity), ['c1','c2','c3']);
assert.strictEqual(model.areaSlots.length,4);
assert.deepStrictEqual(Array.from(model.areaSlots, s=>s.visualIndex), [0,1,2,3]);
assert(model.areaSlots.every(s=>s.parentIdentity==='main-runtime'));
assert.strictEqual(model.slots.filter(s=>s.slotKind==='empty-layout-area').length,0);
assert(!source.includes('Hier platzieren – leerer ${roleLabel'));
console.log('DEV_011-FIX2-UNRESOLVED-MAIN-BOUNDARIES-TEST ERFOLGREICH');

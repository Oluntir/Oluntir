const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('editor/js/core/oluntir-document-api.js', 'utf8');

// Regression: Real templates may describe MAIN with an origin other than
// "main" or "page". The MAIN role, not the origin label, owns area slots.
const descriptors = {
  main: { identity:'main', templateRole:'main', tagName:'main', classes:[], parentIdentity:null, origin:'template-root' },
  c1: { identity:'c1', templateRole:'container-fluid', tagName:'div', classes:['container-fluid'], parentIdentity:'main', origin:'page' },
  r1: { identity:'r1', templateRole:'row', tagName:'div', classes:['row'], parentIdentity:'c1', origin:'page' },
  c2: { identity:'c2', templateRole:'container-fluid', tagName:'div', classes:['container-fluid'], parentIdentity:'main', origin:'page' },
  r2: { identity:'r2', templateRole:'row', tagName:'div', classes:['row'], parentIdentity:'c2', origin:'page' },
  c3: { identity:'c3', templateRole:'container-fluid', tagName:'div', classes:['container-fluid'], parentIdentity:'main', origin:'page' }
};
const order = { c1:0, c2:1, c3:2, r1:0, r2:0, main:0 };
const structure = { pageId:'page', roots:[{ identity:'main', children:[
  {identity:'c1',children:[{identity:'r1',children:[]}]},
  {identity:'c2',children:[{identity:'r2',children:[]}]},
  {identity:'c3',children:[]}
]}] };
const page = {};
const root = {
  OluntirStructureResolver:{ resolvePage(){ return structure; } },
  OluntirGrapes:{
    getSelectedPage(){ return page; },
    describeIdentity(_page,id){ return descriptors[id]; },
    describeIdentityPosition(_page,id){
      return { parentIdentity: descriptors[id].parentIdentity, index: order[id] || 0, path:[order[id] || 0] };
    },
    resolveInsertionTarget(target){ return target; },
    highlightInsertionTarget(){ return ()=>{}; }
  }
};
root.window=root; root.globalThis=root;
vm.runInNewContext(source, root);
const model=root.OluntirDocumentApi.buildInsertionModel({});
assert.deepStrictEqual(Array.from(model.visualAreas, item => item.identity), ['c1','c2','c3']);
const slots=Array.from(model.areaSlots);
assert.strictEqual(slots.length,4, 'Three complete MAIN areas require before, two between and after');
assert.deepStrictEqual(slots.map(slot => slot.visualIndex), [0,1,2,3]);
assert.deepStrictEqual(slots.map(slot => slot.anchorIdentity), ['c1','c1','c2','c3']);
assert(slots.every(slot => slot.parentIdentity === 'main'));
console.log('DEV_011-FIX1-MAIN-ORIGIN-AREA-SLOTS-TEST ERFOLGREICH');

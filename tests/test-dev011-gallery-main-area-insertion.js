const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const apiSource = fs.readFileSync('editor/js/core/oluntir-document-api.js', 'utf8');
const adapterSource = fs.readFileSync('editor/integrations/grapesjs/grapesjs-adapter.js', 'utf8');
const templateApi = require('../editor/js/core/template-structure-api.js');
const gallerySource = fs.readFileSync('editor/js/features/gallery.js', 'utf8');

// Contract 1: only direct Bootstrap page areas beneath MAIN generate area slots.
const descriptors = {
  main: { identity:'main', templateRole:'main', tagName:'main', classes:[], parentIdentity:null, origin:'main' },
  text: { identity:'text', templateRole:'paragraph', tagName:'p', classes:[], parentIdentity:'main', origin:'main' },
  section1: { identity:'section1', templateRole:'section', tagName:'section', classes:['one'], parentIdentity:'main', origin:'main' },
  container1: { identity:'container1', templateRole:'container', tagName:'div', classes:['container'], parentIdentity:'section1', origin:'main' },
  row1: { identity:'row1', templateRole:'row', tagName:'div', classes:['row'], parentIdentity:'container1', origin:'main' },
  section2: { identity:'section2', templateRole:'section', tagName:'section', classes:['two'], parentIdentity:'main', origin:'main' },
  container2: { identity:'container2', templateRole:'container-fluid', tagName:'div', classes:['container-fluid'], parentIdentity:'section2', origin:'main' },
  row2: { identity:'row2', templateRole:'row', tagName:'div', classes:['row'], parentIdentity:'container2', origin:'main' }
};
const structure = { pageId:'page', roots:[{ identity:'main', children:[
  {identity:'text',children:[]},
  {identity:'section1',children:[{identity:'container1',children:[{identity:'row1',children:[]}]}]},
  {identity:'section2',children:[{identity:'container2',children:[{identity:'row2',children:[]}]}]}
]}] };
const page = {};
const root = {
  OluntirStructureResolver:{ resolvePage(){ return structure; } },
  OluntirGrapes:{
    getSelectedPage(){ return page; },
    describeIdentity(_page,id){ return descriptors[id]; },
    describeIdentityPosition(_page,id){
      const order = {text:0,section1:1,section2:2,container1:0,row1:0,container2:0,row2:0};
      return { parentIdentity: descriptors[id].parentIdentity, index: order[id] || 0, path:[order[id] || 0] };
    },
    resolveInsertionTarget(target){ return target; },
    highlightInsertionTarget(){ return ()=>{}; }
  }
};
root.window=root; root.globalThis=root;
vm.runInNewContext(apiSource, root);
const model=root.OluntirDocumentApi.buildInsertionModel({});
assert.deepStrictEqual(Array.from(model.visualAreas, area => area.identity), ['section1','section2']);
const slots=Array.from(model.areaSlots);
assert.strictEqual(slots.length,3);
assert.strictEqual(slots[0].anchorIdentity,'section1');
assert.strictEqual(slots[1].anchorIdentity,'section1');
assert.strictEqual(slots[2].anchorIdentity,'section2');
assert(slots.every(slot => slot.parentIdentity === 'main'));
assert(slots.every(slot => slot.structureScope === 'main'));
assert(slots.every(slot => slot.structureKind === 'section-container-row-gallery'));

// Contract 2: generated HTML is exactly SECTION > CONTAINER(-FLUID) > ROW > gallery.
const html = templateApi.createGalleryStructure({
  mode:'new-area', width:'container-fluid', framework:{id:'bs5'},
  galleryAttributes:'data-pb-gallery', itemsHtml:'<div class="col-12">Bild</div>'
});
assert(/^<section[^>]+data-oluntir-layout-area="gallery"><div class="container-fluid px-3 px-lg-4"><div class="row g-4 pb-gallery" data-pb-gallery>/.test(html));
assert(html.endsWith('</div></div></section>'));

// Contract 3: adapter has a dedicated MAIN target branch and rejects nested/stale anchors.
assert(adapterSource.includes("target.slotKind === 'new-gallery-area'"));
assert(adapterSource.includes("parentRole === 'main' || parentTagName === 'main'"));
assert(adapterSource.includes("anchorElement.closest('main')"));
assert(adapterSource.includes('const boundaryIdentity = adapter.componentIdentity(boundary);'));
assert(adapterSource.includes('const liveBoundary = children[index] || boundary;'));
assert(adapterSource.includes("structureScope: 'main'"));

// Contract 4: the removed toolbar gallery dialog must not return.
assert(!gallerySource.includes('Neuen Galerie-Bereich erstellen'));
assert(gallerySource.includes("cfg.source !== 'framework-block'"));
assert(gallerySource.includes("Object.freeze({ mode: 'new-area', width: 'container-fluid' })"));

console.log('DEV_011-GALLERY-MAIN-AREA-INSERTION-TEST ERFOLGREICH');

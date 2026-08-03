const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('editor/js/core/oluntir-document-api.js', 'utf8');
const rootComponent = {
  components() { return { models: [] }; }
};
const page = {
  getMainComponent() { return rootComponent; }
};
const globalRoot = {
  OluntirGrapes: {
    getSelectedPage() { return page; },
    componentIdentity() { return null; },
    describeIdentity() { return null; },
    describeIdentityPosition() { return null; }
  },
  OluntirStructureResolver: {
    resolvePage() { return { pageId: 'page-empty-1', roots: [] }; }
  }
};
const context = { console, globalThis: globalRoot, window: globalRoot };
vm.runInNewContext(source, context);
const api = globalRoot.OluntirDocumentApi;
const model = api.buildInsertionModel({ Pages: { getSelected() { return page; } }, on() {} });

assert.strictEqual(model.pageId, 'page-empty-1');
assert.strictEqual(model.roots.length, 0, 'Blank page must not invent layout groups');
assert.strictEqual(model.areaSlots.length, 1, 'Blank page must expose exactly one area slot');
assert.strictEqual(model.slots.length, 1, 'Blank page must expose exactly one insertion slot');
assert.strictEqual(model.areaSlots[0].slotKind, 'new-gallery-area');
assert.strictEqual(model.areaSlots[0].structureScope, 'page-root');
assert.strictEqual(model.areaSlots[0].mode, 'inside-end');
assert.strictEqual(model.areaSlots[0].parentIdentity, 'page-root:page-empty-1');
assert.strictEqual(model.areaSlots[0].emptyPage, true);

const adapterSource = fs.readFileSync('editor/integrations/grapesjs/grapesjs-adapter.js', 'utf8');
assert(adapterSource.includes("target.structureScope === 'page-root'"), 'Adapter must resolve the blank-page slot');
assert(adapterSource.includes('`page-root:${target.pageId}`'), 'Adapter must use the page-scoped root boundary instead of a missing layout identity');
assert(adapterSource.includes("EMPTY_PAGE_NO_LONGER_EMPTY"), 'Adapter must reject stale blank-page targets');
assert(adapterSource.includes("stage: 'resolved-empty-page'"), 'Adapter must report successful blank-page resolution');

console.log('EMPTY-PROJECT-GALLERY-INSERTION-TEST ERFOLGREICH');

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const source = fs.readFileSync('editor/js/core/oluntir-preview-api.js', 'utf8');

let scrolled = 0;
let highlighted = 0;
let restored = 0;
const root = {
  setTimeout,
  clearTimeout,
  requestAnimationFrame(fn){ fn(); },
  OluntirDocumentApi:{
    validateTarget(){ return true; },
    highlightTarget(){ highlighted += 1; return () => { restored += 1; }; }
  },
  OluntirGrapes:{
    scrollInsertionTarget(){ scrolled += 1; return true; }
  }
};
root.window = root;
root.globalThis = root;
vm.runInNewContext(source, root);

(async () => {
  const slot = { pageId:'page', parentIdentity:'container', anchorIdentity:'row2', mode:'before' };
  const shown = await root.OluntirPreviewApi.showSlot(slot, { delayMs:0 });
  assert.strictEqual(shown, true);
  assert.strictEqual(scrolled, 1);
  assert.strictEqual(highlighted, 1);
  await root.OluntirPreviewApi.scrollTo(slot, { behavior:'auto' });
  assert.strictEqual(scrolled, 2);
  assert.strictEqual(highlighted, 2);
  assert.ok(restored >= 1, 'Previous marker should be restored before repaint');
  root.OluntirPreviewApi.clear();
  assert.strictEqual(root.OluntirPreviewApi.getState().active, false);
  console.log('INTERACTIVE-PREVIEW-NAVIGATION-TEST ERFOLGREICH');
})().catch(error => { console.error(error); process.exit(1); });

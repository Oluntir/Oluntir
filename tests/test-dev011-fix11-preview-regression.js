const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const adapter = fs.readFileSync(path.join(root, 'editor/integrations/grapesjs/grapesjs-adapter.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(adapter.includes('const strict = adapter.resolveInsertionTarget(target);'), 'Preview must first reuse the productive resolver.');
assert(adapter.includes("structureScope: 'main-boundary-preview'"), 'FIX9 read-only preview fallback is missing.');
assert(adapter.includes('anchor.getEl()'), 'Preview fallback must require a visible runtime anchor.');
assert(adapter.includes("if (!page || !target.anchorIdentity || !['before', 'after'].includes(target.mode)) return null;"), 'Preview fallback boundary validation is missing.');
assert(adapter.includes("if (target.slotKind === 'new-gallery-area') {\n          return adapter.resolveAreaInsertionTarget(target);"), 'Productive insertion must keep the shared strict AreaSlot resolver.');

console.log('DEV_011-FIX11-PREVIEW-REGRESSION-TEST ERFOLGREICH');

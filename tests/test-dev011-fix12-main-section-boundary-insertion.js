'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const adapter = fs.readFileSync(path.join(root, 'editor/integrations/grapesjs/grapesjs-adapter.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(adapter.includes("anchorElement.closest('main')"), 'Productive resolver must use the actual canvas MAIN boundary.');
assert(adapter.includes('main = componentFromElement(mainElement);'), 'Canvas MAIN must be mapped back to its GrapesJS component.');
assert(adapter.includes('boundary = componentFromElement(boundaryElement);'), 'Direct canvas MAIN child must be mapped back to its GrapesJS component.');
assert(adapter.includes("if (!main || !boundary) {"), 'Model-parent fallback must remain available before the canvas is mounted.');
assert(adapter.includes("if (parentRole === 'main' || parentTagName === 'main')"), 'Fallback MAIN recognition is missing.');
assert(adapter.includes('const boundaryIdentity = adapter.componentIdentity(boundary);'), 'Insertion index must resolve the direct MAIN child by stable identity.');
assert(adapter.includes('boundaryDom === childDom'), 'Insertion index must support direct MAIN-child DOM matching.');
assert(adapter.includes('parent: main,'), 'Productive insertion must append to MAIN.');
assert(adapter.includes('anchor: liveBoundary,'), 'Resolved live boundary must be retained for insertion and preview.');
assert(adapter.includes('sourceAnchor: anchor,'), 'Original visible anchor must remain available for diagnostics.');

console.log('DEV_011-FIX12-MAIN-SECTION-BOUNDARY-INSERTION-TEST ERFOLGREICH');

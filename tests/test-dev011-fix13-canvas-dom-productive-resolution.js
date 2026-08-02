'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const adapter = fs.readFileSync(path.join(root, 'editor/integrations/grapesjs/grapesjs-adapter.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(adapter.includes('Template First: determine the real boundary from the rendered canvas'), 'Template-first productive resolution documentation is missing.');
assert(adapter.includes('while (boundaryElement && boundaryElement.parentElement !== mainElement)'), 'Resolver must climb to the direct DOM child of MAIN.');
assert(adapter.includes('const componentFromElement = (element) => {'), 'Canvas DOM-to-component bridge is missing.');
assert(adapter.includes('main = componentFromElement(mainElement);'), 'MAIN DOM-to-model mapping is missing.');
assert(adapter.includes('boundary = componentFromElement(boundaryElement);'), 'Boundary DOM-to-model mapping is missing.');
assert(adapter.includes('if (!main || !boundary || typeof main.append !== \'function\') return null;'), 'Productive target must still require a valid appendable MAIN and boundary.');

console.log('DEV_011-FIX13-CANVAS-DOM-PRODUCTIVE-RESOLUTION-TEST ERFOLGREICH');

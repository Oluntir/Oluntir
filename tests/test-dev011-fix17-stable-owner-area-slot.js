'use strict';
const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('editor/integrations/grapesjs/grapesjs-adapter.js', 'utf8');

assert(source.includes('resolved-stable-area-slot'), 'Stable AreaSlot success stage missing.');
assert(source.includes("ownerKind: ownerTag === 'main' ? 'main' : 'semantic-page-root'"), 'Semantic page-root owner support missing.');
assert(source.includes('let declaredOwner = target.parentIdentity'), 'AreaSlot parentIdentity is not used as the primary owner contract.');
assert(source.includes('directParent === declaredOwner'), 'Anchor is not validated against the declared stable owner.');
assert(source.includes("return { page, parent: declaredOwner, at, anchor: liveBoundary"), 'Insertion does not return the declared stable owner.');

console.log('DEV_011-FIX17-STABLE-OWNER-AREA-SLOT-TEST ERFOLGREICH');

const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('editor/integrations/grapesjs/grapesjs-adapter.js', 'utf8');

assert(!source.includes('const index = children.indexOf(boundary);'), 'productive area insertion must not use Backbone object-reference index lookup');
assert(source.includes('const boundaryIdentity = adapter.componentIdentity(boundary);'), 'stable boundary identity lookup missing');
assert(source.includes('boundaryDom === childDom'), 'DOM boundary lookup missing');
assert(source.includes('const liveBoundary = children[index] || boundary;'), 'resolved live MAIN child must be returned');

console.log('DEV_011-FIX16-STABLE-BOUNDARY-INDEX-TEST ERFOLGREICH');

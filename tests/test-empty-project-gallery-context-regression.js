const fs = require('fs');
const source = fs.readFileSync('editor/js/core/oluntir-document-api.js', 'utf8');
function must(value, message) { if (!value) throw new Error(message); }
must(source.includes('if (!areaSlots.length && !visualAreas.length) {'), 'Blank-page fallback is incorrectly blocked by resolver context groups.');
must(source.includes('rootChildren.length === 0'), 'Blank-page fallback does not verify the actual page root is empty.');
must(!source.includes('!visualAreas.length && !groups.length'), 'Obsolete groups.length gate still blocks empty projects.');
console.log('EMPTY-PROJECT-GALLERY-CONTEXT-REGRESSION-TEST ERFOLGREICH');

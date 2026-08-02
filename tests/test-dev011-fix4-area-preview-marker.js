const fs = require('fs');
const path = require('path');
function must(value, message) { if (!value) throw new Error(message); }
const source = fs.readFileSync(path.join(__dirname, '..', 'editor', 'integrations', 'grapesjs', 'grapesjs-adapter.js'), 'utf8');
must(source.includes("insertionTargetGeometry(target, resolved)"), 'Shared insertion geometry contract missing');
must(source.includes("target.slotKind === 'new-gallery-area'"), 'Gallery-area marker distinction missing');
must(source.includes("const accent = isAreaInsert ? '#ff5a00' : '#1687ff'"), 'Orange gallery-area marker color missing');
must(source.includes("'NEUER GALERIE-BEREICH'"), 'Gallery-area preview label missing');
must(source.includes("if (afterRect) top = afterRect.top"), 'Boundary before following MAIN child is not used');
must(source.includes("else if (beforeRect) top = beforeRect.bottom"), 'Boundary after preceding MAIN child is not used');
must(source.includes("data-oluntir-insertion-marker-kind"), 'Marker kind diagnostics missing');
console.log('DEV_011-FIX4-AREA-PREVIEW-MARKER-TEST ERFOLGREICH');

const fs = require('fs');
const path = require('path');
function must(value, message) { if (!value) throw new Error(message); }
const source = fs.readFileSync(path.join(__dirname, '..', 'editor', 'integrations', 'grapesjs', 'grapesjs-adapter.js'), 'utf8');
must(source.includes("left: isAreaInsert ? 0"), 'MAIN area geometry does not start at the editor viewport edge');
must(source.includes("width: isAreaInsert ? viewportWidth"), 'MAIN area geometry is not full editor viewport width');
must(source.includes("marker.style.width = '100vw'"), 'Visible MAIN marker is not full canvas viewport width');
must(source.includes("marker.style.background = 'rgba(255,90,0,.18)'"), 'Visible orange area background missing');
must(source.includes("marker.style.borderBottom = `3px solid ${accent}`"), 'Full area marker lower boundary missing');
must(source.includes('currentGeometry.top - markerHeight / 2'), 'Area marker is not centered on the current insertion boundary');
must(source.includes("const targetY = geometry.top + markerHeight / 2"), 'Scroll target does not account for marker height');
console.log('DEV_011-FIX5-FULL-WIDTH-AREA-PREVIEW-MARKER-TEST ERFOLGREICH');

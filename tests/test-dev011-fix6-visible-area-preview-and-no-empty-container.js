const fs = require('fs');
const path = require('path');
function must(value, message) { if (!value) throw new Error(message); }
const targetSource = fs.readFileSync(path.join(__dirname, '..', 'editor', 'js', 'core', 'structure-insertion-target.js'), 'utf8');
const adapterSource = fs.readFileSync(path.join(__dirname, '..', 'editor', 'integrations', 'grapesjs', 'grapesjs-adapter.js'), 'utf8');
must(targetSource.includes('return Array.isArray(group.rows) && group.rows.length > 0;'), 'Empty Bootstrap containers are still rendered in the chooser');
must(targetSource.includes("delayMs: slot.slotKind === 'new-gallery-area' ? 0 : 180"), 'MAIN area preview is still delayed and can be lost during hover');
must(adapterSource.includes("marker.style.position = 'fixed'"), 'Area marker is not fixed inside the canvas viewport');
must(adapterSource.includes('currentGeometry.top - markerHeight / 2'), 'Area marker does not preserve the real insertion boundary after scrolling');
must(adapterSource.includes("marker.style.width = '100vw'"), 'Area marker is not full canvas width');
must(adapterSource.includes('const host = doc.body || doc.documentElement;'), 'Area marker is not attached to the visible canvas body');
console.log('DEV_011-FIX6-VISIBLE-AREA-PREVIEW-AND-NO-EMPTY-CONTAINER-TEST ERFOLGREICH');

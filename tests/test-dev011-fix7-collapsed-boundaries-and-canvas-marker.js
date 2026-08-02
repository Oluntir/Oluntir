const fs = require('fs');
const path = require('path');
function must(value, message) { if (!value) throw new Error(message); }
const targetSource = fs.readFileSync(path.join(__dirname, '..', 'editor', 'js', 'core', 'structure-insertion-target.js'), 'utf8');
const adapterSource = fs.readFileSync(path.join(__dirname, '..', 'editor', 'integrations', 'grapesjs', 'grapesjs-adapter.js'), 'utf8');
must(targetSource.includes('.filter(entry => entry.groups.length > 0)'), 'Empty resolver areas are not removed from the visible sequence');
must(targetSource.includes('const boundaryIndex = isLastVisible ? entry.index + 1 : nextVisible.index;'), 'Collapsed boundary selection is missing');
must(targetSource.includes("label: isLastVisible\n              ? 'Neuen Galerie-Bereich nach dem letzten Seitenbereich erstellen'"), 'Last visible boundary is not relabelled consistently');
must(adapterSource.includes("marker.style.position = 'fixed'"), 'Canvas marker still relies on document-absolute positioning');
must(adapterSource.includes("host.appendChild(marker)"), 'Marker is not appended to the canvas body');
must(adapterSource.includes("canvasWindow.addEventListener('scroll', updatePosition"), 'Marker position is not refreshed during canvas scrolling');
must(adapterSource.includes("canvasWindow.addEventListener('resize', updatePosition)"), 'Marker width/position is not refreshed after canvas resize');
console.log('DEV_011-FIX7-COLLAPSED-BOUNDARIES-AND-CANVAS-MARKER-TEST ERFOLGREICH');

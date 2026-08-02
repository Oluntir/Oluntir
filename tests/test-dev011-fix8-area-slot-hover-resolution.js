const fs = require('fs');
const path = require('path');
function must(value, message) { if (!value) throw new Error(message); }
const source = fs.readFileSync(path.join(__dirname, '..', 'editor', 'js', 'core', 'structure-insertion-target.js'), 'utf8');
must(source.includes("Array.from(model.areaSlots || []).find(item => item.slotId === slotId)"), 'Orange area slots are not resolved by the hover/click handler');
must(source.includes("if (preview && typeof preview.clear === 'function') preview.clear();"), 'Active insertion previews are not cleared on mouse leave');
must(!source.includes("const slotFor = () => model.slots.find(item => item.slotId === button.getAttribute('data-slot-id'))"), 'Legacy row-only slot resolution is still active');
console.log('DEV_011-FIX8-AREA-SLOT-HOVER-RESOLUTION-TEST ERFOLGREICH');

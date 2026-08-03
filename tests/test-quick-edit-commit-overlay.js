const fs = require('fs');
function must(value, message) { if (!value) throw new Error(message); }
const js = fs.readFileSync('editor/js/features/quick-edit.js', 'utf8');
const css = fs.readFileSync('editor/css/editor.css', 'utf8');
must(js.includes('oluntir-quick-edit-commit-overlay'), 'Quick-edit commit overlay missing.');
must(js.includes("await Promise.resolve(editor.store())"), 'Quick-edit does not await persistence.');
must(js.includes('minimumVisibleTime = 1200'), 'User-visible pause missing.');
must(js.includes("panel.dataset.commitBusy === 'true'"), 'Duplicate apply protection missing.');
must(css.includes('#oluntir-quick-edit-commit-overlay'), 'Commit overlay CSS missing.');
must(js.includes('z-index:2147483647!important'), 'Commit overlay must block the complete Oluntir UI.');
must(js.includes('panel && panel.ownerDocument'), 'Overlay must follow the actual quick-edit window.');
must(js.includes('host.appendChild(overlay)'), 'Overlay must be attached to a visible document host.');
must(!js.includes("window.toast(tk('quickEdit.applied'))"), 'The small success toast must not replace the modal overlay.');
must(!js.includes("window.toast('Änderungen konnten nicht vollständig übernommen werden.')"), 'A bottom toast must not replace the modal overlay.');
console.log('Quick-edit commit overlay contract OK');

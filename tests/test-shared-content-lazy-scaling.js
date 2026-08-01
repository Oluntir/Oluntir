const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('editor/js/core/shared-content-manager.js', 'utf8');
assert(source.includes('const pageRegionCache = new WeakMap()'), 'Regionen-Cache fehlt.');
assert(source.includes('const pageAppliedFingerprints = new WeakMap()'), 'Fingerprint-Cache fehlt.');
assert(source.includes('if (changed && options && options.propagate === true) applyToAll(page);'), 'Projektweite Synchronisierung darf nur noch explizit erfolgen.');
assert(!source.includes("if (changed && !(options && options.propagate === false)) applyToAll(page);"), 'Eager applyToAll ist weiterhin aktiv.');

const loadStart = source.indexOf("editor.on('load'");
const loadEnd = source.indexOf('\n    });', loadStart);
const loadBody = source.slice(loadStart, loadEnd + 7);
assert(!loadBody.includes('applyToAll(selected)'), 'Beim Laden dürfen nicht alle Seiten synchronisiert werden.');

console.log('SHARED-CONTENT-LAZY-SCALING-TEST ERFOLGREICH');

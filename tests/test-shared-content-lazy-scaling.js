const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('editor/js/core/shared-content-manager.js', 'utf8');
assert(!source.includes('const pageRegionCache = new WeakMap()'), 'GrapesJS-Komponentenobjekte dürfen nicht seitenübergreifend gecacht werden.');
assert(source.includes("header: findComponentByTag(root, 'header')"), 'Header muss bei jeder Anwendung aus dem aktuellen Seitenbaum aufgelöst werden.');
assert(source.includes("footer: findComponentByTag(root, 'footer')"), 'Footer muss bei jeder Anwendung aus dem aktuellen Seitenbaum aufgelöst werden.');
assert(source.includes('const pageAppliedFingerprints = new WeakMap()'), 'Fingerprint-Cache fehlt.');
assert(source.includes('const propagatedPages = changed && options && options.propagate === true ? applyToAll(page) : 0;'), 'Explizit angeforderte projektweite Synchronisierung fehlt.');
assert(source.includes('const propagatedPages = changed ? applyToAll(page) : 0;'), 'Modell-Commit muss geänderten Shared Content auf alle Seiten übertragen.');

const loadStart = source.indexOf("editor.on('load'");
const loadEnd = source.indexOf('\n    });', loadStart);
const loadBody = source.slice(loadStart, loadEnd + 7);
assert(!loadBody.includes('applyToAll(selected)'), 'Beim Laden dürfen nicht alle Seiten synchronisiert werden.');

console.log('SHARED-CONTENT-LAZY-SCALING-TEST ERFOLGREICH');

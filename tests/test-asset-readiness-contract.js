const fs = require('fs');
const assert = require('assert');
const source = fs.readFileSync('editor/js/core/asset-store.js', 'utf8');
assert.ok(source.includes('trackAssetOperation((async () =>'), 'Responsive image processing is not tracked as an asset operation');
assert.ok(source.includes('await Promise.all(['), 'Responsive IndexedDB writes are not awaited');
assert.ok(source.includes('window.OluntirAssetReadiness'), 'Asset readiness API is missing');
assert.ok(source.includes('prepareForExport: prepareAssetsForExport'), 'Asset export preparation contract is missing');
assert.ok(source.includes('verifyExportCommit: verifyAssetExportCommit'), 'Asset commit verification contract is missing');
console.log('ASSET-READINESS-CONTRACT-TEST ERFOLGREICH');

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const readiness = fs.readFileSync(path.join(__dirname, '../editor/js/core/export-readiness.js'), 'utf8');
const snapshot = fs.readFileSync(path.join(__dirname, '../editor/js/core/export-snapshot.js'), 'utf8');
const shared = fs.readFileSync(path.join(__dirname, '../editor/js/core/shared-content-manager.js'), 'utf8');

assert.ok(snapshot.includes("typeof shared.prepareForExport === 'function'"), 'Atomic Shared Content export contract missing from snapshot transaction');
assert.ok(!/prepareForExport[\s\S]{0,1200}flushSelected\s*\(/.test(snapshot), 'Export snapshot must not trigger a second flushSelected after atomic preparation');
assert.ok(!readiness.includes('shared-content-flush'), 'Readiness must not use the generic Shared Content pending flag as an export barrier');
assert.ok(shared.includes('async function prepareForExport(page)'), 'Shared Content atomic export preparation missing');
assert.ok(shared.includes('exportPreparing = true'), 'Shared Content export scheduling guard missing');
assert.ok(shared.includes('if (applying || exportPreparing || !enabled() || isRichTextEditing()) return;'), 'Shared Content schedule guard does not suppress export-generated debounce');

console.log('EXPORT-READINESS-ATOMIC-CONTRACT-TEST ERFOLGREICH');

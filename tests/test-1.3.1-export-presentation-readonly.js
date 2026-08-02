#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const shared = fs.readFileSync(path.join(root, 'editor/js/core/shared-content-manager.js'), 'utf8');
const snapshot = fs.readFileSync(path.join(root, 'editor/js/core/export-snapshot.js'), 'utf8');
if (/prepareForExport[\s\S]*persistTree\s*\(/.test(shared)) {
  throw new Error('prepareForExport must not persist the complete presentation tree');
}
if (!/materializeHtml\(html,\s*\{\s*stripMetadata:\s*true\s*\}\)/.test(snapshot)) {
  throw new Error('export snapshot must materialize explicit presentation metadata');
}
if (!/const committed = flushPage\(page, \{ propagate: true \}\)/.test(shared)) {
  throw new Error('shared model commit missing');
}
console.log('OLUNTIR-1.3.1-EXPORT-PRESENTATION-READONLY-TEST ERFOLGREICH');

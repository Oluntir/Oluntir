'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const inventoryApi = require('../core/source-inventory.js');
const analyzer = require('../core/static-html-analyzer.js');
const contract = require('../contracts/source-inventory-contract.json');

const fixturePath = path.join(__dirname, 'fixtures', 'source-inventory-sample.html');
const html = fs.readFileSync(fixturePath, 'utf8');
const result = analyzer.analyze(html, { file: 'fixtures/source-inventory-sample.html', createdAt: '2026-08-04T00:00:00Z' });

assert.equal(result.kind, 'oluntir-source-inventory');
assert.equal(result.policies.readOnly, true);
assert.equal(result.policies.semanticInterpretation, false);
assert.equal(result.policies.frameworkDetection, false);
assert.equal(result.policies.sourceMutation, false);
assert.deepEqual(inventoryApi.COLLECTIONS, contract.requiredCollections);
assert.equal(result.documents.length, 1);
assert.ok(result.nodes.some(node => node.tagName === 'main'));
assert.ok(result.attributes.some(attr => attr.name === 'data-template' && attr.value === 'agency'));
assert.ok(result.references.some(ref => ref.kind === 'stylesheet' && ref.value === 'css/app.css'));
assert.ok(result.references.some(ref => ref.kind === 'script' && ref.value === 'js/app.js'));
assert.equal(result.references.filter(ref => ref.kind === 'srcset-candidate').length, 2);
assert.ok(result.assets.some(asset => asset.kind === 'font' && asset.uri === 'fonts/site.woff2'));
assert.ok(result.assets.some(asset => asset.kind === 'download' && asset.uri === 'downloads/info.pdf'));
assert.ok(result.references.some(ref => ref.kind === 'inline-style'));
assert.equal(result.diagnostics.length, 0);

const mainNode = result.nodes.find(node => node.tagName === 'main');
const imageNode = result.nodes.find(node => node.tagName === 'img');
assert.equal(imageNode.parentId, mainNode.id);
assert.equal(mainNode.source.start.line, 10);

const malformed = analyzer.analyze('<main><div', { file: 'broken.html' });
assert.equal(malformed.diagnostics[0].code, 'HTML_UNCLOSED_TAG');

console.log('SOURCE-INVENTORY-HTML-ANALYZER-TEST ERFOLGREICH');

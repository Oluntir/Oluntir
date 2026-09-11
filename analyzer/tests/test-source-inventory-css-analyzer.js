'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const analyzer = require('../core/static-css-analyzer.js');
const contract = require('../contracts/css-source-analysis-contract.json');

const fixturePath = path.join(__dirname, 'fixtures', 'source-inventory-sample.css');
const css = fs.readFileSync(fixturePath, 'utf8');
const result = analyzer.analyze(css, { file: 'fixtures/source-inventory-sample.css', createdAt: '2026-08-04T00:00:00Z' });

assert.equal(result.kind, 'oluntir-source-inventory');
assert.equal(result.policies.readOnly, true);
assert.equal(contract.boundaries.presentationInterpretation, false);
assert.equal(result.documents.length, 1);
assert.equal(result.stylesheets.length, 1);
assert.ok(result.cssRules.some(rule => rule.ruleType === 'qualified-rule' && rule.selectors.includes('.card')));
assert.ok(result.cssRules.some(rule => rule.name === 'media'));
assert.ok(result.cssRules.some(rule => rule.name === 'container'));
assert.ok(result.cssRules.some(rule => rule.name === 'font-face'));
assert.ok(result.cssRules.some(rule => rule.name === 'keyframes'));
assert.ok(result.declarations.some(item => item.name === '--brand-space' && item.customProperty === true));
assert.ok(result.declarations.some(item => item.name === 'color' && item.important === true));
assert.ok(result.references.some(item => item.kind === 'css-import' && item.value === 'base/reset.css'));
assert.ok(result.references.some(item => item.kind === 'css-url' && item.value === '../fonts/studio.woff2'));
assert.ok(result.assets.some(item => item.kind === 'image' && item.uri === '../images/pattern.svg'));
assert.ok(result.assets.some(item => item.kind === 'font' && item.uri === '../fonts/studio.woff2'));
assert.equal(result.diagnostics.length, 0);

const malformed = analyzer.analyze('.broken { color: red;', { file: 'broken.css' });
assert.ok(malformed.diagnostics.some(item => item.code === 'CSS_UNCLOSED_BLOCK'));

const unclosedComment = analyzer.analyze('/* broken', { file: 'comment.css' });
assert.ok(unclosedComment.diagnostics.some(item => item.code === 'CSS_UNCLOSED_COMMENT'));

console.log('SOURCE-INVENTORY-CSS-ANALYZER-TEST ERFOLGREICH');

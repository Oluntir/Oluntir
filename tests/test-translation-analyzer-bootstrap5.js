'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const analyzer = require('../editor/js/core/translation-analyzer.js');

const html = fs.readFileSync(path.join(__dirname, 'fixtures/bootstrap5-source.html'), 'utf8');
const result = analyzer.analyze({
  html,
  css: '.custom { @include media-breakpoint-up(md); }',
  js: 'bootstrap.Collapse.getOrCreateInstance(element);',
  scss: '$grid-breakpoints: (md: 768px);'
}, { frameworkId: 'bs5' });

assert.equal(result.valid, true);
assert.equal(result.readOnly, true);
assert.equal(result.mutationEnabled, false);
assert.equal(result.frameworkId, 'bs5');
assert.equal(result.allRulesRecognized, true);
assert.equal(result.recognizedRuleCount, result.profileRuleCount);
assert.equal(result.implementableRuleCount > 0, true);
assert.equal(result.capabilities.includes('bootstrap-js-behavior'), true);
assert.equal(result.capabilities.includes('responsive-layout'), true);
assert.equal(result.matches.some(item => item.semanticId === 'interactive-behavior'), true);
assert.equal(result.matches.some(item => item.semanticId === 'column'), true);
assert.equal(Object.isFrozen(result), true);

console.log('TRANSLATION-ANALYZER-BOOTSTRAP5-TEST ERFOLGREICH');

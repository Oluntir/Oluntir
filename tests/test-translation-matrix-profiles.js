'use strict';

const assert = require('assert');
const profiles = require('../editor/js/core/translation-matrix-profiles.js');

assert.equal(profiles.readOnly, true);
assert.equal(profiles.mutationEnabled, false);
assert.equal(profiles.getProfile('bs5').version, '5.3.8');
assert.equal(profiles.getProfile('bs4').version, '4.6.2');
assert.equal(profiles.findRules({ frameworkId: 'bs5', semanticId: 'row' }).length, 1);
assert.equal(profiles.findRules({ frameworkId: 'bs5', semanticId: 'interactive-behavior' }).length, 3);
assert.equal(profiles.findRules({ frameworkId: 'bs4', semanticId: 'interactive-behavior' }).length, 3);
assert.equal(profiles.findRules({ frameworkId: 'bs5', semanticId: 'spacing', direction: 'emit' }).length > 0, true);
assert.equal(profiles.findRules({ frameworkId: 'bs5', semanticId: 'spacing' }).some(rule => rule.variant === 'logical-start'), true);
assert.equal(profiles.findRules({ frameworkId: 'bs4', semanticId: 'spacing' }).some(rule => rule.variant === 'logical-start'), true);
assert.equal(Object.isFrozen(profiles.registry), true);
assert.equal(Object.isFrozen(profiles.getProfile('bs5').rules), true);

console.log('TRANSLATION-MATRIX-PROFILES-TEST ERFOLGREICH');

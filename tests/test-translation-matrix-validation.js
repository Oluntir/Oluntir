'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const profiles = require('../editor/js/core/translation-matrix-profiles.js');
const analyzer = require('../editor/js/core/translation-analyzer.js');
const resolver = require('../editor/js/core/translation-resolver.js');
const validation = require('../editor/js/core/translation-matrix-validation.js');

const html = fs.readFileSync(path.join(__dirname, 'fixtures/bootstrap5-source.html'), 'utf8');
const analysis = analyzer.analyze({ html }, { frameworkId: 'bs5' });
const plan = resolver.compile(analysis);
const audit = validation.audit({ registry: profiles.registry, analysis, plan });

assert.equal(audit.valid, true);
assert.equal(audit.readOnly, true);
assert.equal(audit.mutationEnabled, false);
assert.equal(audit.registry.valid, true);
assert.equal(audit.analysis.valid, true);
assert.equal(audit.plan.valid, true);
assert.equal(audit.issues.length, 0);
assert.equal(Object.isFrozen(audit), true);

const invalid = validation.validatePlan({ valid: true, readOnly: true, mutationEnabled: true, entries: [] });
assert.equal(invalid.valid, false);
assert.equal(invalid.issues[0].code, 'PLAN_MUTATION_FLAG_FORBIDDEN');

console.log('TRANSLATION-MATRIX-VALIDATION-TEST ERFOLGREICH');

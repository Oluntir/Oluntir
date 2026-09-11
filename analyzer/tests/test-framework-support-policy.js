'use strict';

const assert = require('assert');
const policy = require('../core/framework-support-policy.js');

const bootstrap5 = policy.classify({ frameworkId: 'bootstrap5' });
assert.strictEqual(bootstrap5.status, 'supported');
assert.strictEqual(bootstrap5.editorActivationAllowed, true);
assert.strictEqual(bootstrap5.major, 5);

const unknownFramework = policy.classify({ frameworkId: 'other-framework', frameworkFamily: 'other-framework' });
assert.strictEqual(unknownFramework.status, 'analysis-only');
assert.strictEqual(unknownFramework.editorActivationAllowed, false);
assert.strictEqual(unknownFramework.runtimeAdapterAllowed, false);

const detectedBootstrap4 = policy.classify({ frameworkId: 'unclassified', report: { frameworks: [{ id: 'bootstrap4', detected: true, confidence: 0.9 }] } });
assert.strictEqual(detectedBootstrap4.frameworkId, 'bootstrap4');
assert.strictEqual(detectedBootstrap4.status, 'supported');

console.log('FRAMEWORK-SUPPORT-POLICY-TEST ERFOLGREICH');

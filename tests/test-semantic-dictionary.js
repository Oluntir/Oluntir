'use strict';

const assert = require('assert');
const dictionary = require('../editor/js/core/semantic-dictionary.js');

assert.equal(dictionary.SCHEMA_VERSION, 1);
assert.equal(dictionary.resolve({ tagName: 'NAV' }).id, 'navigation');
assert.equal(dictionary.resolve({ tagName: 'header' }).role, 'header');
assert.equal(dictionary.resolve({ tagName: 'footer' }).role, 'footer');
assert.equal(dictionary.resolve({ tagName: 'main' }).role, 'main-content');
assert.equal(dictionary.resolve({ tagName: 'section' }), null);
assert.equal(dictionary.getComponentType('navigation').cardinality.max, 1);
assert.deepEqual(dictionary.getComponentType('main-content').capabilities, ['page-structure', 'content-container']);
assert.equal(Object.isFrozen(dictionary), true);
assert.equal(Object.isFrozen(dictionary.COMPONENT_TYPES), true);
assert.equal(Object.isFrozen(dictionary.COMPONENT_TYPES.navigation), true);
assert.equal(Object.isFrozen(dictionary.COMPONENT_TYPES.navigation.cardinality), true);
assert.equal(Object.isFrozen(dictionary.COMPONENT_TYPES.navigation.capabilities), true);

console.log('SEMANTIC-DICTIONARY-TEST ERFOLGREICH');

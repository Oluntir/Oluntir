'use strict';

const assert = require('assert');
const resolver = require('../editor/js/core/identity-resolver.js');

assert.equal(resolver.SCHEMA_VERSION, 1);

const navigation = resolver.resolve({
  tagName: ' NAV ',
  type: 'default',
  classes: ['Navbar', 'navbar-expand-lg']
});
assert.equal(navigation.resolved, true);
assert.equal(navigation.source, 'semantic-dictionary');
assert.equal(navigation.componentType, 'navigation');
assert.equal(navigation.role, 'primary-navigation');
assert.deepEqual(navigation.cardinality, { scope: 'page', min: 0, max: 1 });
assert.deepEqual(navigation.capabilities, ['navigation', 'shared-content']);
assert.equal(navigation.context.tagName, 'nav');
assert.equal(navigation.context.type, 'default');
assert.deepEqual(navigation.context.classes, ['navbar', 'navbar-expand-lg']);
assert.equal(Object.isFrozen(navigation), true);
assert.equal(Object.isFrozen(navigation.context), true);
assert.equal(Object.isFrozen(navigation.context.classes), true);

const unknown = resolver.resolve({ tagName: 'article', classes: 'Teaser featured' });
assert.equal(unknown.resolved, false);
assert.equal(unknown.source, null);
assert.equal(unknown.componentType, null);
assert.equal(unknown.role, null);
assert.equal(unknown.cardinality, null);
assert.deepEqual(unknown.capabilities, []);
assert.deepEqual(unknown.context.classes, ['teaser', 'featured']);

console.log('IDENTITY-RESOLVER-TEST ERFOLGREICH');

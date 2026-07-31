'use strict';

const assert = require('assert');
const resolver = require('../editor/js/core/context-resolver.js');

class Component {
  constructor(tagName = 'div', attrs = {}, parent = null) {
    this.data = { tagName, type: tagName === 'body' ? 'wrapper' : '', attributes: { ...attrs } };
    this._parent = parent;
  }
  get(key) { return this.data[key]; }
  getAttributes() { return this.data.attributes; }
  getClasses() { return String(this.data.attributes.class || '').split(/\s+/).filter(Boolean); }
  parent() { return this._parent; }
}

function classify(component, isRoot) {
  if (isRoot) return 'page';
  const attrs = component.getAttributes();
  if (attrs['data-oluntir-section-id']) return 'section';
  return 'component';
}

const page = new Component('body', { 'data-oluntir-page-id': 'page-1' });
const header = new Component('header', { 'data-oluntir-component-id': 'header-1' }, page);
const navigation = new Component('nav', { 'data-oluntir-component-id': 'nav-1' }, header);
const link = new Component('a', { 'data-oluntir-component-id': 'link-1' }, navigation);

const context = resolver.resolve(link, { classify });
assert.equal(resolver.SCHEMA_VERSION, 1);
assert.equal(context.pageId, 'page-1');
assert.equal(context.parent.identity, 'nav-1');
assert.equal(context.parent.role, 'primary-navigation');
assert.equal(context.nearestSemanticAncestor.role, 'primary-navigation');
assert.deepEqual(context.semanticAncestors.map(item => item.role), ['primary-navigation', 'header']);
assert.equal(context.inside.navigation, true);
assert.equal(context.inside.header, true);
assert.equal(context.inside.footer, false);
assert.equal(context.inside.mainContent, false);
assert.equal(context.inside.repeat, false);
assert.equal(context.repeatId, null);
assert.equal(Object.isFrozen(context), true);
assert.equal(Object.isFrozen(context.ancestors), true);
assert.equal(Object.isFrozen(context.inside), true);

const section = new Component('section', {
  'data-oluntir-section-id': 'section-1',
  'data-oluntir-repeat-id': 'repeat-1'
}, page);
const repeatedCard = new Component('div', { 'data-oluntir-component-id': 'card-1' }, section);
const repeatedContext = resolver.resolve(repeatedCard, { classify, pageId: 'explicit-page' });
assert.equal(repeatedContext.pageId, 'explicit-page');
assert.equal(repeatedContext.repeatId, 'repeat-1');
assert.equal(repeatedContext.inside.repeat, true);
assert.equal(repeatedContext.parent.structuralKind, 'section');

console.log('CONTEXT-RESOLVER-TEST ERFOLGREICH');

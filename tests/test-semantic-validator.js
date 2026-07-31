'use strict';

const assert = require('assert');
const ids = require('../editor/js/core/layout-identities.js');
const validator = require('../editor/js/core/semantic-validator.js');

class Collection {
  constructor(models = []) { this.models = models; }
}

class Component {
  constructor(tagName = 'div', attrs = {}, children = []) {
    this.data = { tagName, type: tagName === 'body' ? 'wrapper' : '', attributes: { ...attrs } };
    this.childCollection = new Collection(children);
    children.forEach(child => { child._parent = this; });
  }
  get(key) { return this.data[key]; }
  set(key, value) { this.data[key] = value; }
  getAttributes() { return this.data.attributes; }
  addAttributes(attrs) { Object.assign(this.data.attributes, attrs); }
  getClasses() { return String(this.data.attributes.class || '').split(/\s+/).filter(Boolean); }
  components() { return this.childCollection; }
  parent() { return this._parent || null; }
  toJSON() {
    return {
      tagName: this.data.tagName,
      attributes: { ...this.data.attributes },
      components: this.childCollection.models.map(child => child.toJSON())
    };
  }
}

class Page {
  constructor(id, root) { this.id = id; this.data = {}; this.root = root; }
  get(key) { return this.data[key]; }
  set(key, value) { this.data[key] = value; }
  getMainComponent() { return this.root; }
}

function createPage(id, navigationCount) {
  const navigations = [];
  for (let index = 0; index < navigationCount; index += 1) {
    navigations.push(new Component('nav', { class: 'navbar' }));
  }
  const section = new Component('section', {}, navigations);
  const root = new Component('body', {}, [section]);
  return new Page(id, root);
}

function createEditor(pages) {
  return { Pages: { getAll: () => pages } };
}

const validPage = createPage('valid', 1);
const invalidPage = createPage('invalid', 2);
const editor = createEditor([validPage, invalidPage]);
ids.ensureAll(editor);

const validSnapshot = JSON.stringify(validPage.getMainComponent().toJSON());
const validResult = validator.validatePage(validPage);
assert.equal(validResult.ok, true);
assert.equal(validResult.scope, 'page');
assert.equal(validResult.checkedComponents, 1);
assert.equal(validResult.errors.length, 0);
assert.equal(JSON.stringify(validPage.getMainComponent().toJSON()), validSnapshot);

const invalidSnapshot = JSON.stringify(invalidPage.getMainComponent().toJSON());
const invalidResult = validator.validatePage(invalidPage);
assert.equal(invalidResult.ok, false);
assert.equal(invalidResult.checkedComponents, 2);
assert.equal(invalidResult.errors.length, 1);
assert.equal(invalidResult.errors[0].code, 'SEMANTIC_CARDINALITY_MAX_EXCEEDED');
assert.equal(invalidResult.errors[0].role, 'primary-navigation');
assert.equal(invalidResult.errors[0].componentType, 'navigation');
assert.equal(invalidResult.errors[0].scope, 'page');
assert.equal(invalidResult.errors[0].count, 2);
assert.equal(invalidResult.errors[0].max, 1);
assert.equal(invalidResult.errors[0].identities.length, 2);
assert.equal(JSON.stringify(invalidPage.getMainComponent().toJSON()), invalidSnapshot);

const projectResult = validator.validateProject(editor);
assert.equal(projectResult.ok, false);
assert.equal(projectResult.checkedPages, 2);
assert.equal(projectResult.checkedComponents, 3);
assert.equal(projectResult.pages.length, 2);
assert.equal(projectResult.errors.length, 1);
assert.equal(Object.isFrozen(projectResult), true);
assert.equal(Object.isFrozen(projectResult.pages), true);
assert.equal(Object.isFrozen(projectResult.errors), true);
assert.equal(Object.isFrozen(invalidResult.errors[0]), true);

const separatePagesEditor = createEditor([createPage('one', 1), createPage('two', 1)]);
ids.ensureAll(separatePagesEditor);
assert.equal(validator.validateProject(separatePagesEditor).ok, true);


const duplicateHeaderPage = new Page('duplicate-header', new Component('body', {}, [
  new Component('header'),
  new Component('header'),
  new Component('main'),
  new Component('footer')
]));
const duplicateHeaderEditor = createEditor([duplicateHeaderPage]);
ids.ensureAll(duplicateHeaderEditor);
const duplicateHeaderResult = validator.validatePage(duplicateHeaderPage);
assert.equal(duplicateHeaderResult.ok, false);
assert.equal(duplicateHeaderResult.errors.length, 1);
assert.equal(duplicateHeaderResult.errors[0].role, 'header');
assert.equal(duplicateHeaderResult.errors[0].componentType, 'header');

console.log('SEMANTIC-VALIDATOR-TEST ERFOLGREICH');

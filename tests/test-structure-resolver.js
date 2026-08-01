'use strict';

const assert = require('assert');
const identities = require('../editor/js/core/layout-identities.js');
const resolver = require('../editor/js/core/structure-resolver.js');

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

const page = new Page('page', new Component('body', {}, [
  new Component('header', {}, [new Component('div', { class: 'wrapper' }, [new Component('nav')])]),
  new Component('main', {}, [
    new Component('section', {}, [
      new Component('div', { class: 'row' }, [
        new Component('div', { class: 'col-md-6' }, [new Component('article', { class: 'card' })])
      ])
    ])
  ]),
  new Component('footer')
]));
const editor = { Pages: { getAll: () => [page] } };
identities.ensureAll(editor);

const before = JSON.stringify(page.getMainComponent().toJSON());
const result = resolver.resolvePage(page);
const after = JSON.stringify(page.getMainComponent().toJSON());

assert.equal(resolver.SCHEMA_VERSION, 1);
assert.equal(result.scope, 'page');
assert.equal(result.pageId, identities.pageId(page));
assert.equal(result.roots.length, 1);
assert.equal(result.roots[0].structuralKind, 'page');
assert.deepEqual(result.roots[0].children.map(node => node.role), ['header', 'main-content', 'footer']);
assert.equal(result.roots[0].children[0].children[0].structuralKind, 'component');
assert.equal(result.roots[0].children[0].children[0].children[0].role, 'primary-navigation');
assert.equal(result.roots[0].children[1].children[0].structuralKind, 'section');
assert.equal(result.roots[0].children[1].children[0].children[0].structuralKind, 'row');
assert.equal(result.roots[0].children[1].children[0].children[0].children[0].structuralKind, 'slot');
assert.equal(result.roots[0].children[1].children[0].children[0].children[0].children[0].structuralKind, 'component');
assert.equal(result.roles.find(item => item.role === 'primary-navigation').count, 1);
assert.equal(result.semanticAreas.find(item => item.componentType === 'main-content').count, 1);
assert.equal(result.cardinality.find(item => item.componentType === 'navigation').max, 1);
assert.equal(before, after);
assert.equal(Object.isFrozen(result), true);
assert.equal(Object.isFrozen(result.roots), true);
assert.equal(Object.isFrozen(result.roots[0]), true);
assert.equal(Object.isFrozen(result.roots[0].children), true);

const project = resolver.resolveProject(editor);
assert.equal(project.scope, 'project');
assert.equal(project.pageCount, 1);
assert.deepEqual(project.pages[0], result);

console.log('STRUCTURE-RESOLVER-TEST ERFOLGREICH');

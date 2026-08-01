'use strict';

const assert = require('assert');
const identities = require('../editor/js/core/layout-identities.js');
const resolver = require('../editor/js/core/relationship-resolver.js');

class Collection { constructor(models = []) { this.models = models; } }
class Component {
  constructor(tagName = 'div', attrs = {}, children = []) {
    this.data = { tagName, type: tagName === 'body' ? 'wrapper' : '', attributes: { ...attrs } };
    this.childCollection = new Collection(children);
    children.forEach(child => { child._parent = this; });
  }
  get(key) { return this.data[key]; }
  getAttributes() { return this.data.attributes; }
  addAttributes(attrs) { Object.assign(this.data.attributes, attrs); }
  getClasses() { return String(this.data.attributes.class || '').split(/\s+/).filter(Boolean); }
  components() { return this.childCollection; }
  parent() { return this._parent || null; }
  toJSON() { return { tagName: this.data.tagName, attributes: { ...this.data.attributes }, components: this.childCollection.models.map(child => child.toJSON()) }; }
}
class Page {
  constructor(id, root) { this.id = id; this.data = {}; this.root = root; }
  get(key) { return this.data[key]; }
  set(key, value) { this.data[key] = value; }
  getMainComponent() { return this.root; }
}

const page = new Page('page', new Component('body', {}, [
  new Component('header', {}, [
    new Component('nav', {}, [new Component('ul', {}, [
      new Component('li', {}, [new Component('a')]),
      new Component('li', {}, [new Component('a')])
    ])])
  ]),
  new Component('main', {}, [
    new Component('section', {}, [
      new Component('div', { class: 'row' }, [
        new Component('div', { class: 'col-md-6' }, [
          new Component('article', { class: 'card' }, [
            new Component('div', { class: 'card-header' }),
            new Component('div', { class: 'card-body' }, [new Component('h2')]),
            new Component('div', { class: 'card-footer' })
          ])
        ])
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
assert.equal(before, after);
assert.equal(Object.isFrozen(result), true);
assert.equal(Object.isFrozen(result.relationships), true);

const pageLayout = result.relationships.find(item => item.type === 'page-layout');
assert.ok(pageLayout);
assert.deepEqual(pageLayout.members.map(item => item.role), ['header', 'main-content', 'footer']);

const navigation = result.relationships.find(item => item.type === 'navigation');
assert.ok(navigation);
assert.equal(navigation.members.filter(item => item.role === 'item').length, 2);
assert.equal(navigation.members.filter(item => item.role === 'item-link').length, 2);

const card = result.relationships.find(item => item.type === 'card');
assert.ok(card);
assert.deepEqual(card.members.map(item => item.role), ['header', 'body', 'title', 'footer']);
assert.equal(Object.isFrozen(card), true);
assert.equal(Object.isFrozen(card.members), true);

const types = Object.fromEntries(result.relationshipTypes.map(item => [item.type, item.count]));
assert.equal(types['page-layout'], 1);
assert.equal(types.navigation, 1);
assert.equal(types.card, 1);

const project = resolver.resolveProject(editor);
assert.equal(project.scope, 'project');
assert.equal(project.pageCount, 1);
assert.equal(project.relationshipCount, result.relationshipCount);

console.log('RELATIONSHIP-RESOLVER-TEST ERFOLGREICH');

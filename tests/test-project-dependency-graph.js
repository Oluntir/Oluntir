'use strict';

const assert = require('assert');
const identities = require('../editor/js/core/layout-identities.js');
const dependencyApi = require('../editor/js/core/project-dependency-graph.js');

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
}
class Page {
  constructor(id, root) { this.id = id; this.data = {}; this.root = root; }
  get(key) { return this.data[key]; }
  set(key, value) { this.data[key] = value; }
  getMainComponent() { return this.root; }
}

function makePage(id) {
  return new Page(id, new Component('body', {}, [
    new Component('header', {}, [
      new Component('nav', { role: 'navigation' }, [new Component('ul', {}, [
        new Component('li', {}, [new Component('a')])
      ])])
    ]),
    new Component('main', {}, [
      new Component('section', {}, [
        new Component('article', { class: 'card' }, [
          new Component('div', { class: 'card-body' })
        ])
      ])
    ]),
    new Component('footer')
  ]));
}

const pages = [makePage('index'), makePage('about')];
const editor = { Pages: { getAll: () => pages } };
identities.ensureAll(editor);

const before = JSON.stringify(pages.map(page => page.getMainComponent().getAttributes()));
const graph = dependencyApi.buildProject(editor);
const initial = graph.snapshot();
const after = JSON.stringify(pages.map(page => page.getMainComponent().getAttributes()));

assert.equal(dependencyApi.SCHEMA_VERSION, 1);
assert.equal(before, after, 'Dependency graph must not mutate document attributes after identities exist');
assert.equal(initial.scope, 'project');
assert.equal(initial.built, true);
assert.equal(Object.isFrozen(initial), true);
assert.equal(Object.isFrozen(initial.nodes), true);
const indexPageId = identities.pageId(pages[0]);
const aboutPageId = identities.pageId(pages[1]);
assert.ok(initial.nodes.some(node => node.type === 'page' && node.pageId === indexPageId));
assert.ok(initial.nodes.some(node => node.type === 'relationship' && node.subtype === 'card'));
assert.ok(initial.nodes.some(node => node.type === 'shared' && node.subtype === 'navigation'));
assert.ok(initial.nodes.some(node => node.type === 'export' && node.pageId === aboutPageId));

const navigationNode = initial.nodes.find(node => node.type === 'shared' && node.subtype === 'navigation');
assert.ok(navigationNode);
const dirty = graph.markDirty(navigationNode.id, 'navigation-changed');
assert.ok(dirty.dirtyCount >= 6);
assert.ok(dirty.dirtyNodes.some(node => node.id === navigationNode.id));
assert.ok(dirty.dirtyNodes.filter(node => node.type === 'page').length === 2);
assert.ok(dirty.dirtyNodes.filter(node => node.type === 'export').length === 2);
assert.ok(dirty.dirtyNodes.some(node => node.type === 'system' && node.subtype === 'shared-content'));
assert.ok(dirty.dirtyNodes.every(node => Object.isFrozen(node)));

const cardRelationship = initial.nodes.find(node => node.type === 'relationship' && node.subtype === 'card');
graph.clear();
const relationshipDirty = graph.markDirty(cardRelationship.identity, 'card-relationship-changed');
assert.ok(relationshipDirty.dirtyNodes.some(node => node.type === 'system' && node.subtype === 'validator'));
assert.ok(relationshipDirty.dirtyNodes.some(node => node.type === 'system' && node.subtype === 'repeat'));
assert.ok(relationshipDirty.dirtyNodes.some(node => node.type === 'export' && node.pageId === cardRelationship.pageId));
assert.equal(graph.clear().dirtyCount, 0);

console.log('PROJECT-DEPENDENCY-GRAPH-TEST ERFOLGREICH');

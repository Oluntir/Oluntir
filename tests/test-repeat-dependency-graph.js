const assert = require('assert');
function collection(items) { return { models: items, forEach(cb) { items.forEach(cb); }, map(cb) { return items.map(cb); } }; }
function attr(tag, classes) { if (tag === 'body') return 'data-oluntir-page-id'; if (tag === 'section') return 'data-oluntir-section-id'; if ((classes || []).includes('row')) return 'data-oluntir-row-id'; return 'data-oluntir-component-id'; }
function component(identity, tag, children = [], classes = []) { return { getAttributes() { return { [attr(tag, classes)]: identity }; }, get(key) { if (key === 'tagName') return tag; if (key === 'type') return ''; return null; }, getClasses() { return classes; }, components() { return collection(children); } }; }
function page(id, root) { return { get(key) { return key === 'oluntirPageId' ? id : null; }, getMainComponent() { return root; } }; }
const home = page('page-home', component('ol_page_home', 'body', [component('ol_source_a', 'section'), component('ol_source_b', 'section')]));
const contact = page('page-contact', component('ol_page_contact', 'body', [component('ol_instance_a', 'section'), component('ol_instance_b', 'section')]));
const editor = { Pages: { getAll() { return [home, contact]; } } };
global.OluntirLayoutIdentities = require('../editor/js/core/layout-identities.js');
global.OluntirSemanticDictionary = require('../editor/js/core/semantic-dictionary.js');
global.OluntirIdentityResolver = require('../editor/js/core/identity-resolver.js');
global.OluntirContextResolver = require('../editor/js/core/context-resolver.js');
global.OluntirStructureResolver = require('../editor/js/core/structure-resolver.js');
global.OluntirRelationshipResolver = require('../editor/js/core/relationship-resolver.js');
const repeat = require('../editor/js/core/repeat-engine-v2.js');
global.OluntirRepeatEngineV2 = repeat;
global.OluntirRepeatContractResolver = require('../editor/js/core/repeat-contract-resolver.js');
const graphApi = require('../editor/js/core/repeat-dependency-graph.js');
repeat.reset();
const a = repeat.createDefinition({ repeatKey: 'a', source: { pageId: 'page-home', rootIdentity: 'ol_source_a', relativeIdentityPath: [] }, scope: 'section' });
const b = repeat.createDefinition({ repeatKey: 'b', source: { pageId: 'page-home', rootIdentity: 'ol_source_b', relativeIdentityPath: [] }, scope: 'section' });
const ia = repeat.createInstance(a.definitionId, { pageId: 'page-contact', rootIdentity: 'ol_instance_a' });
repeat.createInstance(b.definitionId, { pageId: 'page-contact', rootIdentity: 'ol_instance_b', parentInstanceId: ia.instanceId });
repeat.createReference({ ownerDefinitionId: a.definitionId, targetDefinitionId: b.definitionId, ownerIdentity: 'ol_source_a' });
const graph = graphApi.buildProject(editor);
const snapshot = graph.snapshot();
assert.strictEqual(snapshot.valid, true);
assert.ok(snapshot.nodes.some(node => node.type === 'definition' && node.definitionId === a.definitionId));
assert.ok(snapshot.edges.some(edge => edge.type === 'has-instance'));
assert.strictEqual(snapshot.cycleCount, 0);
const impact = graph.resolveImpact(a.definitionId);
assert.ok(impact.affectedDefinitions.includes(a.definitionId));
assert.ok(impact.affectedDefinitions.includes(b.definitionId));
assert.ok(impact.affectedPages.includes('page-contact'));
assert.ok(Object.isFrozen(snapshot));
repeat.createReference({ ownerDefinitionId: b.definitionId, targetDefinitionId: a.definitionId, ownerIdentity: 'ol_source_b' });
const cyclic = graphApi.buildProject(editor).snapshot();
assert.strictEqual(cyclic.valid, false);
assert.strictEqual(cyclic.cycleCount, 1);
assert.ok(cyclic.issues.some(item => item.code === 'REPEAT_DEPENDENCY_CYCLE'));
assert.throws(() => repeat.apply(), error => error && error.code === 'REPEAT_SYNC_RUNTIME_NOT_BOUND');
console.log('Repeat Dependency Graph DEV_003: OK');

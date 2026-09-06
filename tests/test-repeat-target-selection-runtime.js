'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function uiElement(id, document) {
  const listeners = {};
  const children = [];
  return {
    id, ownerDocument: document, hidden: false, disabled: false, value: '', textContent: '', innerHTML: '', dataset: {},
    appendChild(child) { children.push(child); if (child.selected) this.value = child.value; return child; },
    addEventListener(name, fn) { (listeners[name] ||= []).push(fn); },
    fire(name, event) { (listeners[name] || []).forEach(fn => fn(event || { target: this })); },
    focus() {}, setAttribute() {}, get listeners() { return listeners; }
  };
}

function component(identity, tagName, parent, childDefs) {
  const state = { identity, tagName, attributes: {}, values: {}, children: [] };
  const item = {
    identity,
    get(key) { if (key === 'tagName') return state.tagName; return state.values[key]; },
    set(key, value) { state.values[key] = value; },
    getAttributes() { return Object.assign({}, state.attributes); },
    parent() { return parent || null; },
    components() { return { models: state.children }; },
    toJSON() { return { tagName: state.tagName, attributes: Object.assign({}, state.attributes), components: [] }; },
    append() {
      const created = component('created-' + Math.random().toString(16).slice(2), 'section', item, []);
      state.children.push(created);
      return [created];
    },
    remove() { if (!parent) return; const list = parent.components().models; const index = list.indexOf(item); if (index >= 0) list.splice(index, 1); },
    getEl() { return item._el || null; },
    _setEl(el) { item._el = el; }
  };
  (childDefs || []).forEach(child => state.children.push(child));
  return item;
}

function canvasElement(model, rect, parentElement) {
  const el = {
    __gjsv: { model }, parentElement: parentElement || null,
    getBoundingClientRect() { return Object.assign({}, rect); },
    contains(node) { let current = node; while (current) { if (current === el) return true; current = current.parentElement; } return false; }
  };
  model._setEl(el);
  return el;
}

const document = {
  readyState: 'complete', elements: new Map(),
  getElementById(id) { return this.elements.get(id) || null; },
  createElement(tag) { return uiElement(tag, this); },
  addEventListener() {}
};
[
  'oluntir-repeat-panel','oluntir-repeat-status','oluntir-repeat-selection-info','oluntir-repeat-define',
  'oluntir-repeat-source-target-selection-info','oluntir-repeat-source-target-page','oluntir-repeat-source-target-position',
  'oluntir-repeat-source-target-clear','oluntir-repeat-source-insert','oluntir-repeat-source-help','oluntir-repeat-source-help-popover',
  'oluntir-repeat-undo','oluntir-repeat-definition-select','oluntir-repeat-name','oluntir-repeat-type','oluntir-repeat-reset',
  'oluntir-repeat-clear-selection','oluntir-repeat-close',
  'oluntir-repeat-library-panel','oluntir-repeat-library-close','oluntir-repeat-library-status','oluntir-repeat-library-source-info','oluntir-repeat-current-source',
  'oluntir-repeat-library-target-selection-info','oluntir-repeat-library-target-page','oluntir-repeat-library-target-position',
  'oluntir-repeat-library-target-clear','oluntir-repeat-library-insert','oluntir-repeat-library-help','oluntir-repeat-library-help-popover'
].forEach(id => document.elements.set(id, uiElement(id, document)));
document.getElementById('oluntir-repeat-type').value = 'explicit-repeat';
document.getElementById('oluntir-repeat-source-target-position').value = 'inside';
document.getElementById('oluntir-repeat-library-target-position').value = 'inside';

const sourceBody = component('source-body', 'body', null, []);
const sourceMain = component('source-main', 'main', sourceBody, []);
const sourceSection = component('source-section', 'section', sourceMain, []);
sourceMain.components().models.push(sourceSection);
sourceBody.components().models.push(sourceMain);

const targetBody = component('target-body', 'body', null, []);
const targetMain = component('target-main', 'main', targetBody, []);
const targetSectionA = component('target-a', 'section', targetMain, []);
const targetSectionB = component('target-b', 'section', targetMain, []);
targetMain.components().models.push(targetSectionA, targetSectionB);
targetBody.components().models.push(targetMain);

const emptyBody = component('empty-body', 'body', null, []);
const emptyMain = component('empty-main', 'main', emptyBody, []);
emptyBody.components().models.push(emptyMain);

const sourceMainEl = canvasElement(sourceMain, { top: 0, bottom: 500, height: 500, left: 0, right: 800, width: 800 }, null);
canvasElement(sourceSection, { top: 100, bottom: 200, height: 100, left: 0, right: 800, width: 800 }, sourceMainEl);
const targetMainEl = canvasElement(targetMain, { top: 0, bottom: 500, height: 500, left: 0, right: 800, width: 800 }, null);
const targetAEl = canvasElement(targetSectionA, { top: 100, bottom: 200, height: 100, left: 0, right: 800, width: 800 }, targetMainEl);
const targetBEl = canvasElement(targetSectionB, { top: 300, bottom: 400, height: 100, left: 0, right: 800, width: 800 }, targetMainEl);
const emptyMainEl = canvasElement(emptyMain, { top: 0, bottom: 500, height: 500, left: 0, right: 800, width: 800 }, null);

const sourcePage = { id: 'source-page', getName: () => 'Source', getMainComponent: () => sourceBody };
const targetPage = { id: 'target-page', getName: () => 'Target', getMainComponent: () => targetBody };
const emptyPage = { id: 'empty-page', getName: () => 'Empty', getMainComponent: () => emptyBody };
const allPages = [sourcePage, targetPage, emptyPage];
let selectedPage = sourcePage;
const editorListeners = {};
const canvasListeners = {};
const canvasDocument = {
  addEventListener(name, fn, capture) { canvasListeners[name] = { fn, capture }; },
  removeEventListener(name, fn, capture) { const current = canvasListeners[name]; if (current && current.fn === fn && current.capture === capture) delete canvasListeners[name]; }
};
const editor = {
  Pages: { getAll: () => allPages, getSelected: () => selectedPage },
  Canvas: { getDocument: () => canvasDocument },
  on(name, fn) { (editorListeners[name] ||= []).push(fn); },
  select() {}, getSelected() { return null; }
};
const definition = { definitionId: 'def-1', repeatKey: 'cards', source: { pageId: 'source-page', rootIdentity: 'source-section' }, scope: 'section', metadata: { repeatType: 'explicit-repeat', displayName: 'Kartenliste' } };
let instanceCount = 0;
const engine = {
  SYNC_POLICY: { AUTOMATIC: 'automatic' },
  getDefinitions: () => [definition], getDefinition: id => id === definition.definitionId ? definition : null,
  createInstance(_id, data) { instanceCount += 1; return { instanceId: 'instance-' + instanceCount, definitionId: definition.definitionId, ...data }; },
  removeInstance() {}, removeDefinition() {}
};
const logs = [];
const descriptions = new Map([
  [sourceBody, ['source-body','page']], [sourceMain, ['source-main','main']], [sourceSection, ['source-section','section']],
  [targetBody, ['target-body','page']], [targetMain, ['target-main','main']], [targetSectionA, ['target-a','section']], [targetSectionB, ['target-b','section']],
  [emptyBody, ['empty-body','page']], [emptyMain, ['empty-main','main']]
]);
const identities = {
  ATTR: { component: 'data-oluntir-component-id' },
  pageId: page => page && page.id,
  describe(item, options) { const known = descriptions.get(item); return { identity: known ? known[0] : item.identity, structuralKind: known ? known[1] : 'section', tagName: item.get('tagName'), pageId: options && options.page && options.page.id }; },
  findById(page, identity) {
    let found = null;
    function walk(item) { if (!item || found) return; if ((descriptions.get(item) || [item.identity])[0] === identity) { found = item; return; } item.components().models.forEach(walk); }
    walk(page.getMainComponent()); return found;
  },
  ensureAll() {}, ensureAdded(item) { if (!descriptions.has(item)) descriptions.set(item, [item.identity, 'section']); }
};
const highlights = [];
const documentApi = {
  validateTarget: () => true,
  highlightTarget(slot) { highlights.push(slot); return () => {}; },
  resolveTarget(slot) {
    const page = allPages.find(p => p.id === slot.pageId);
    const target = identities.findById(page, slot.parentIdentity || slot.anchorIdentity);
    if (!target) return null;
    if (slot.mode === 'inside-end') return { parent: target, at: target.components().models.length };
    const parent = target.parent(); const index = parent.components().models.indexOf(target);
    return { parent, at: slot.mode === 'before' ? index : index + 1 };
  }
};
const root = {
  OluntirEditor: editor, OluntirRepeatEngineV2: engine, OluntirLayoutIdentities: identities, OluntirDocumentApi: documentApi,
  OluntirSelectPageById(id) { selectedPage = allPages.find(p => p.id === id); return Boolean(selectedPage); },
  OluntirPersistProjectSoon() {},
  OluntirLogger: { info(_channel, message, data) { logs.push({ message, data }); } },
  addEventListener() {}
};
root.window = root;
const context = { window: root, document, console, setTimeout: fn => { fn(); return 1; }, clearTimeout() {} };
vm.runInNewContext(fs.readFileSync('editor/js/core/repeat-ui.js','utf8'), context, { filename: 'repeat-ui.js' });

// Hauptwerkzeug: aktuelle Quelle -> Zielseite -> Position -> Einsetzen.
root.OluntirRepeatUi.open();
assert.strictEqual(document.getElementById('oluntir-repeat-panel').hidden, false, 'Das Hauptwerkzeug muss geöffnet werden können.');
assert.strictEqual(document.getElementById('oluntir-repeat-library-panel').hidden, true, 'Beim Hauptwerkzeug muss die Bibliothek geschlossen sein.');
(editorListeners['component:selected'] || []).forEach(fn => fn(sourceSection));
assert.ok(document.getElementById('oluntir-repeat-current-source').textContent.includes('Kartenliste'), 'Das Hauptwerkzeug muss die aktuelle Quelle verständlich anzeigen.');

function selectTargetPageFor(workflow, pageId) {
  const pageSelect = document.getElementById(workflow === 'library' ? 'oluntir-repeat-library-target-page' : 'oluntir-repeat-source-target-page');
  pageSelect.value = pageId; pageSelect.fire('change', { target: pageSelect });
  assert.strictEqual(canvasListeners.click.capture, true, 'Zielklick muss in Capture-Phase registriert sein.');
  assert.strictEqual(canvasListeners.mousemove.capture, true, 'Zielvorschau muss in Capture-Phase registriert sein.');
}
function unlockTarget(workflow) {
  document.getElementById(workflow === 'library' ? 'oluntir-repeat-library-target-clear' : 'oluntir-repeat-source-target-clear').fire('click');
}
function lockAt(workflow, target, y) {
  const info = document.getElementById(workflow === 'library' ? 'oluntir-repeat-library-target-selection-info' : 'oluntir-repeat-source-target-selection-info');
  canvasListeners.mousemove.fn({ target, clientY: y });
  assert.strictEqual(info.dataset.locked, 'false');
  canvasListeners.click.fn({ target, clientY: y });
  assert.strictEqual(info.dataset.locked, 'true');
  return highlights[highlights.length - 1];
}

selectTargetPageFor('source', 'target-page');
let slot = lockAt('source', targetAEl, 150);
assert.strictEqual(slot.mode, 'inside-end', 'Das Hauptwerkzeug muss ein Inside-Ziel bestätigen.');
assert.strictEqual(document.getElementById('oluntir-repeat-source-insert').disabled, false, 'Das Hauptwerkzeug muss nach bestätigtem Ziel „Bereich einsetzen“ aktivieren.');
document.getElementById('oluntir-repeat-source-insert').fire('click');
assert.strictEqual(instanceCount, 1, 'Das Hauptwerkzeug muss genau eine Repeat-Instanz erzeugen.');
assert.strictEqual(document.getElementById('oluntir-repeat-source-insert').disabled, true, 'Der Hauptworkflow muss sich nach Einsetzen zurücksetzen.');

// Listenwerkzeug: Element aus Liste -> Zielseite -> Position -> Einsetzen.
root.OluntirRepeatUi.openLibrary();
assert.strictEqual(document.getElementById('oluntir-repeat-library-panel').hidden, false, 'Das Listen-Werkzeug muss separat geöffnet werden können.');
assert.strictEqual(document.getElementById('oluntir-repeat-panel').hidden, true, 'Beim Öffnen der Bibliothek muss das Quellenfenster geschlossen sein.');
const libraryDefinition = document.getElementById('oluntir-repeat-definition-select');
libraryDefinition.value = 'def-1';
libraryDefinition.fire('change', { target: libraryDefinition });
assert.ok(document.getElementById('oluntir-repeat-library-source-info').textContent.includes('Kartenliste'), 'Die Bibliothek muss den verständlichen Quellenname statt der internen ID anzeigen.');

function selectDefinitionAndPage(pageId) {
  const defSelect = document.getElementById('oluntir-repeat-definition-select');
  defSelect.value = 'def-1'; defSelect.fire('change', { target: defSelect });
  selectTargetPageFor('library', pageId);
}

selectDefinitionAndPage('target-page');
slot = lockAt('library', targetAEl, 150);
assert.strictEqual(slot.mode, 'inside-end', 'Klick mitten in einem Bereich muss Inside-Ziel bestätigen.');
assert.strictEqual(document.getElementById('oluntir-repeat-library-insert').disabled, false, 'Ein bestätigtes Bibliotheksziel muss „Bereich einsetzen“ aktivieren.');
const lockedSlotId = slot.slotId;
(editorListeners['component:hover'] || []).forEach(fn => fn(targetSectionB));
canvasListeners.mousemove.fn({ target: targetBEl, clientY: 350 });
assert.strictEqual(highlights[highlights.length - 1].slotId, lockedSlotId, 'Hover/Mousemove darf bestätigten Slot nicht verändern.');
assert.ok(logs.some(entry => entry.message === 'target-selected' && entry.data.slotId === lockedSlotId), 'target-selected-Log fehlt.');

document.getElementById('oluntir-repeat-library-insert').fire('click');
assert.strictEqual(instanceCount, 2, 'Das Listenwerkzeug muss genau eine weitere Repeat-Instanz erzeugen.');
assert.ok(logs.some(entry => entry.message === 'instance-created'), 'instance-created-Log fehlt.');
assert.strictEqual(document.getElementById('oluntir-repeat-library-insert').disabled, true, 'Bibliotheksworkflow muss sich nach Einsetzen zurücksetzen.');

// Vor / zwischen / nach direkten <main>-Kindern im Listenworkflow.
selectDefinitionAndPage('target-page');
slot = lockAt('library', targetMainEl, 50);
assert.strictEqual(slot.mode, 'before'); assert.strictEqual(slot.anchorIdentity, 'target-a');
unlockTarget('library'); selectDefinitionAndPage('target-page');
slot = lockAt('library', targetMainEl, 250);
assert.strictEqual(slot.mode, 'before'); assert.strictEqual(slot.anchorIdentity, 'target-b');
unlockTarget('library'); selectDefinitionAndPage('target-page');
slot = lockAt('library', targetMainEl, 450);
assert.strictEqual(slot.mode, 'after'); assert.strictEqual(slot.anchorIdentity, 'target-b');

// Leerer Main bleibt ein gültiges, bestätigbares Inside-Ziel.
unlockTarget('library'); selectDefinitionAndPage('empty-page');
slot = lockAt('library', emptyMainEl, 200);
assert.strictEqual(slot.mode, 'inside-end'); assert.strictEqual(slot.parentIdentity, 'empty-main');

console.log('REPEAT-TARGET-SELECTION-RUNTIME-TEST ERFOLGREICH');

'use strict';
const assert = require('assert');

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }

let idCounter = 100;
const projectMutationObservations = [];
function observeProjectMutation(operation) {
  const manager = global.OluntirRepeatLibraryManager;
  projectMutationObservations.push({ operation, active: Boolean(manager && manager.isProjectMutationActive && manager.isProjectMutationActive()) });
}
function makeComponent(data, parent) {
  const input = clone(data || {});
  const state = {
    identity: input.identity || input.oluntirId || `cmp-${++idCounter}`,
    tagName: input.tagName || 'section',
    attributes: Object.assign({}, input.attributes || {}),
    content: input.content || '',
    props: {},
    children: []
  };
  ['editable','stylable','draggable','droppable','removable','copyable','selectable','hoverable'].forEach(key => {
    if (Object.prototype.hasOwnProperty.call(input, key)) state.props[key] = input[key];
  });
  const component = {
    identity: state.identity,
    get(key) { if (key === 'tagName') return state.tagName; if (key === 'content') return state.content; return state.props[key]; },
    set(key, value) {
      if (typeof key === 'object') { Object.assign(state.props, key); return; }
      if (key === 'content') state.content = value; else state.props[key] = value;
    },
    setContent(value) { state.content = String(value); },
    getAttributes() { return Object.assign({}, state.attributes); },
    addAttributes(attrs) { Object.assign(state.attributes, attrs || {}); },
    components() { return { models: state.children }; },
    parent() { return parent || null; },
    append(snapshot, options) {
      observeProjectMutation('component.append');
      const created = makeComponent(snapshot, component);
      const at = options && Number.isInteger(options.at) ? options.at : state.children.length;
      state.children.splice(Math.max(0, Math.min(at, state.children.length)), 0, created);
      return [created];
    },
    remove() {
      observeProjectMutation('component.remove');
      if (!parent) return;
      const list = parent.components().models;
      const index = list.indexOf(component);
      if (index >= 0) list.splice(index, 1);
    },
    toJSON() {
      return Object.assign({
        identity: state.identity,
        tagName: state.tagName,
        attributes: Object.assign({}, state.attributes),
        content: state.content,
        components: state.children.map(child => child.toJSON())
      }, state.props);
    },
    replaceSnapshot(snapshot) {
      const next = clone(snapshot || {});
      state.tagName = next.tagName || state.tagName;
      state.attributes = Object.assign({}, next.attributes || {});
      state.content = next.content || '';
      state.children = (next.components || []).map(child => makeComponent(child, component));
    }
  };
  state.children = (input.components || []).map(child => makeComponent(child, component));
  return component;
}

function makePage(id, name, rootData) {
  const body = makeComponent({ identity: `${id}-body`, tagName:'body', components:[rootData] }, null);
  return {
    id, name,
    getName() { return name; },
    getMainComponent() { return body; },
    get(key) { return this[key]; }
  };
}

const pageA = makePage('page-a', 'Start', { identity:'root-a', tagName:'section', content:'ALT' });
const pageB = makePage('page-b', 'Produkte', { identity:'root-b', tagName:'section', content:'ALT' });
let selectedPage = pageA;
const allPages = [pageA, pageB];
const listeners = {};
const Pages = {
  getAll() { return allPages.slice(); },
  getSelected() { return selectedPage; },
  add(input, options) {
    const draft = input.component && input.component.components && input.component.components[0];
    const page = makePage(input.id, input.name, draft || { tagName:'section' });
    page.oluntirInternalPage = input.oluntirInternalPage;
    page.get = key => key === 'oluntirInternalPage' ? page.oluntirInternalPage : page[key];
    allPages.push(page);
    if (options && options.select) selectedPage = page;
    return page;
  },
  select(page) {
    selectedPage = page;
    (listeners['page:select'] || []).forEach(fn => fn(page));
    return page;
  },
  remove(page) {
    // GrapesJS darf die aktuell selektierte Seite nicht entfernen. Dieser Mock
    // bildet den Runtime-Fehler nach, der sonst intern als getAttributes()-Fehler
    // sichtbar wird.
    if (selectedPage === page) throw new Error('Cannot read properties of undefined (reading "getAttributes")');
    const index = allPages.indexOf(page); if (index >= 0) allPages.splice(index, 1);
  }
};
const editor = {
  Pages,
  on(name, fn) { (listeners[name] ||= []).push(fn); },
  select() {}
};

function walk(component, wanted) {
  if (!component) return null;
  if (component.identity === wanted) return component;
  for (const child of component.components().models) { const hit = walk(child, wanted); if (hit) return hit; }
  return null;
}

const identities = {
  ATTR: { repeat:'data-oluntir-repeat-id' },
  pageId: page => page.id,
  findById(page, identity) { return walk(page.getMainComponent(), identity); },
  ensureAll() {},
  ensureAdded(component) { if (!component.identity) component.identity = `cmp-${++idCounter}`; },
  describe(component, context) { return { identity: component.identity, pageId: context && context.page && context.page.id }; }
};

const adapter = {
  snapshot(component) { return clone(component.toJSON()); },
  cleanDefinition(snapshot) { return clone(snapshot); },
  semanticSnapshot(snapshot) { return clone(snapshot); },
  create() {
    return {
      readByIdentity(pageId, identity) {
        const page = allPages.find(item => item.id === pageId);
        const component = page && identities.findById(page, identity);
        if (!component) throw new Error(`missing ${pageId}/${identity}`);
        return clone(component.toJSON());
      },
      writeSnapshot(pageId, identity, snapshot) {
        observeProjectMutation('adapter.writeSnapshot');
        const page = allPages.find(item => item.id === pageId);
        const component = page && identities.findById(page, identity);
        if (!component) throw new Error(`missing ${pageId}/${identity}`);
        component.replaceSnapshot(snapshot);
        return true;
      },
      restoreByIdentity(pageId, identity, snapshot) {
        observeProjectMutation('adapter.restoreByIdentity');
        const page = allPages.find(item => item.id === pageId);
        const component = page && identities.findById(page, identity);
        if (!component) throw new Error(`missing ${pageId}/${identity}`);
        component.replaceSnapshot(snapshot);
        return true;
      }
    };
  }
};


const uiElements = new Map();
function uiElement(id) { return { id, hidden: id === 'oluntir-repeat-library-panel', disabled: false, textContent: '', value: '', addEventListener() {}, focus() {} }; }
['oluntir-repeat-library-panel','oluntir-repeat-manager-publish','oluntir-repeat-manager-discard','oluntir-repeat-manager-return','oluntir-repeat-manager-undo','oluntir-repeat-manager-redo','oluntir-repeat-manager-insert','oluntir-repeat-manager-current','oluntir-repeat-manager-usage','oluntir-repeat-manager-state','btn-new-page','btn-rename-page','btn-delete-page','page-select'].forEach(id => uiElements.set(id, uiElement(id)));
global.document = { readyState: 'complete', body: { classList: { toggle() {} } }, getElementById(id) { return uiElements.get(id) || null; }, addEventListener() {} };

global.OluntirPersistProjectSoon = () => {};
global.OluntirLayoutIdentities = identities;
global.OluntirRepeatSyncAccessAdapter = adapter;
global.OluntirLogger = { info() {}, error() {} };
const repeatUiSelections = [];
const repeatUiResumes = [];
global.OluntirRepeatUi = {
  selectLibraryDefinition(id) { repeatUiSelections.push(id); return true; },
  resumeLibraryInsertion(id, targetPageId) { repeatUiResumes.push({ id, targetPageId }); return true; }
};
global.OluntirSelectPageById = id => { const page = allPages.find(item => item.id === id); if (page) selectedPage = page; return Boolean(page); };

const engine = require('../editor/js/core/repeat-engine-v2.js');
global.OluntirRepeatEngineV2 = engine;
engine.reset();
const legacyLockedSnapshot = adapter.cleanDefinition(adapter.snapshot(identities.findById(pageA,'root-a')));
['editable','stylable','draggable','droppable','removable','copyable'].forEach(key => { legacyLockedSnapshot[key] = false; });
legacyLockedSnapshot.components = [{
  identity:'text-child', tagName:'div', type:'text', content:'Text', attributes:{}, components:[],
  editable:false, stylable:false, draggable:false, droppable:false, removable:false, copyable:false
}];
const definition = engine.createDefinition({
  definitionId:'def-central', repeatKey:'central-card',
  source:{ pageId:'page-a', rootIdentity:'root-a', relativeIdentityPath:[] },
  scope:'section', synchronizationPolicy:'manual',
  metadata:{ displayName:'Produktkarte', centralLibraryMode:true, manualSynchronizationExplicit:true,
    libraryPublishedSnapshot: clone(legacyLockedSnapshot),
    libraryDraftSnapshot: clone(legacyLockedSnapshot),
    libraryPublishedRevision:1, libraryDraftRevision:1, libraryDirty:false }
});
engine.createInstance(definition.definitionId, { instanceId:'inst-a', pageId:'page-a', rootIdentity:'root-a', appliedRevision:1 });
engine.createInstance(definition.definitionId, { instanceId:'inst-b', pageId:'page-b', rootIdentity:'root-b', appliedRevision:1 });

const manager = require('../editor/js/core/repeat-library-manager.js');
manager.bind(editor);
manager.initializeProject();
assert.strictEqual(manager.usage(definition.definitionId).length, 2, 'Beide materialisierten Vorkommen müssen erkannt werden.');
assert.strictEqual(identities.findById(pageA,'root-a').get('editable'), false, 'Seiteninstanzen müssen gegen direkte Bearbeitung gesperrt sein.');
assert.strictEqual(identities.findById(pageB,'root-b').get('editable'), false, 'Alle Seiteninstanzen müssen gesperrt sein.');

assert.strictEqual(manager.openEditor(definition.definitionId), true, 'Zentrale Repeat-Bearbeitung muss geöffnet werden.');
assert.strictEqual(repeatUiSelections[repeatUiSelections.length - 1], definition.definitionId, 'Zentrale Bearbeitung muss dieselbe Familie automatisch fuer den Einsetzen-Workflow auswaehlen.');
const workspace = Pages.getSelected();
assert.strictEqual(manager.isWorkspacePage(workspace), true, 'Bearbeitung muss in internem Repeat-Workspace laufen.');
const workspaceRoot = workspace.getMainComponent().components().models[0];
['editable','stylable','draggable','droppable','removable','copyable'].forEach(key => {
  assert.notStrictEqual(workspaceRoot.get(key), false, `Zentraler Workspace darf die Seiteninstanz-Sperre ${key}=false nicht erben.`);
});
const workspaceText = workspaceRoot.components().models[0];
assert.ok(workspaceText, 'Der zentrale Workspace muss den Text-Unterknoten enthalten.');
assert.notStrictEqual(workspaceText.get('editable'), false, 'Text im zentralen Workspace muss fuer GrapesJS/RTE editierbar bleiben.');
workspaceRoot.setContent('NEU');
assert.strictEqual(identities.findById(pageA,'root-a').get('content'), 'ALT', 'Während Draft-Bearbeitung darf Quelle auf Projektseite unverändert bleiben.');
assert.strictEqual(identities.findById(pageB,'root-b').get('content'), 'ALT', 'Während Draft-Bearbeitung dürfen Geschwisterinstanzen unverändert bleiben.');

assert.strictEqual(manager.publishActive(), true, 'Publish muss funktionieren.');
assert.strictEqual(identities.findById(pageA,'root-a').get('content'), 'NEU', 'Publish muss das erste Vorkommen aktualisieren.');
assert.strictEqual(identities.findById(pageB,'root-b').get('content'), 'NEU', 'Publish muss alle weiteren Vorkommen aktualisieren.');
assert.strictEqual(manager.getState().historyCount, 1, 'Publish muss eine Undo-Transaktion erzeugen.');

assert.strictEqual(manager.undo(), true, 'Publish-Undo muss funktionieren.');
assert.strictEqual(identities.findById(pageA,'root-a').get('content'), 'ALT');
assert.strictEqual(identities.findById(pageB,'root-b').get('content'), 'ALT');
assert.strictEqual(manager.redo(), true, 'Publish-Redo muss funktionieren.');
assert.strictEqual(identities.findById(pageA,'root-a').get('content'), 'NEU');
assert.strictEqual(identities.findById(pageB,'root-b').get('content'), 'NEU');

manager.closeEditor();
assert.strictEqual(manager.removeInstanceById('inst-b'), true, 'Ein einzelnes Seitenvorkommen muss entfernbar sein.');
assert.strictEqual(manager.usage(definition.definitionId).length, 1, 'Verwendungsliste muss nach Remove aktualisiert sein.');
assert.strictEqual(identities.findById(pageB,'root-b'), null, 'Entferntes Vorkommen darf nicht im Seitenmodell verbleiben.');
assert.strictEqual(manager.undo(), true, 'Remove-Undo muss funktionieren.');
assert.strictEqual(manager.usage(definition.definitionId).length, 2, 'Undo muss das Vorkommen wieder registrieren.');
assert.ok(identities.findById(pageB,'root-b'), 'Undo muss das Vorkommen an der Seite wiederherstellen.');
assert.strictEqual(manager.redo(), true, 'Remove-Redo muss funktionieren.');
assert.strictEqual(manager.usage(definition.definitionId).length, 1, 'Redo muss das Vorkommen wieder entfernen.');

const guardedOperations = projectMutationObservations.filter(item => ['adapter.writeSnapshot', 'adapter.restoreByIdentity', 'component.remove', 'component.append'].includes(item.operation));
assert.ok(guardedOperations.length >= 4, 'Runtime-Test muss Publish/Undo/Redo/Remove als Projektmutationen beobachten.');
assert.ok(guardedOperations.every(item => item.active), `Alle materialisierenden Repeat-Operationen müssen innerhalb der Oluntir-Projektmutation laufen: ${JSON.stringify(guardedOperations)}`);
assert.strictEqual(manager.isProjectMutationActive(), false, 'Nach Abschluss darf kein Repeat-Projektmutations-Lock aktiv bleiben.');


// 2.2.0 BETA v25: Ein normaler Seitenwechsel muss den temporären Repeat-Workspace
// vor der allgemeinen Canvas-/Shared-Persistenz sauber beenden.
assert.strictEqual(manager.openEditor(definition.definitionId), true, 'Workspace muss für Navigationstest erneut geöffnet werden.');
assert.ok(Pages.getAll().some(manager.isWorkspacePage), 'Workspace-Seite muss vor Navigation vorhanden sein.');
assert.strictEqual(manager.prepareForPageNavigation('page-b'), true, 'Navigation auf echte Projektseite muss Workspace beenden.');
assert.strictEqual(Pages.getSelected(), pageB, 'Vor dem Entfernen des Workspace muss die Zielseite bereits im PageManager ausgewählt sein.');
assert.ok(!Pages.getAll().some(manager.isWorkspacePage), 'Workspace-Seite muss nach sicherem Handoff entfernt sein.');
assert.strictEqual(manager.getState().activeDefinitionId, '', 'Aktive zentrale Bearbeitung muss beim Seitenwechsel beendet sein.');

// Sicherheitsnetz: Auch ein direkter GrapesJS page:select außerhalb des gehärteten
// Oluntir-Seitenwechslers muss einen noch offenen Workspace beenden.
assert.strictEqual(manager.openEditor(definition.definitionId), true, 'Workspace muss für externen page:select-Test geöffnet werden.');
assert.ok(listeners['page:select'] && listeners['page:select'].length >= 1, 'page:select-Sicherheitslistener fehlt.');
selectedPage = pageB;
listeners['page:select'].forEach(fn => fn(pageB));
assert.ok(!Pages.getAll().some(manager.isWorkspacePage), 'Externer page:select muss Workspace ebenfalls entfernen.');
assert.strictEqual(manager.getState().activeDefinitionId, '', 'Externer page:select darf keinen aktiven Repeat-Editor zurücklassen.');

// v28: Zielauswahl direkt aus der zentralen Bearbeitung. Der Workspace muss
// geschlossen werden, die Bibliothek/Familienauswahl aber erhalten bleiben.
assert.strictEqual(manager.openEditor(definition.definitionId), true, 'Workspace muss fuer den Insert-Handoff erneut geöffnet werden.');
assert.strictEqual(manager.isEditorActive(), true, 'Zentraler Repeat-Editor muss als aktiv erkennbar sein.');
assert.strictEqual(manager.prepareForInsertionNavigation('page-b'), true, 'Zielauswahl aus zentraler Bearbeitung muss den Workspace kontrolliert verlassen.');
assert.strictEqual(Pages.getSelected(), pageB, 'Insert-Handoff muss direkt auf die Zielseite wechseln.');
assert.ok(!Pages.getAll().some(manager.isWorkspacePage), 'Insert-Handoff darf keinen internen Workspace zuruecklassen.');
assert.deepStrictEqual(repeatUiResumes[repeatUiResumes.length - 1], { id: definition.definitionId, targetPageId: 'page-b' }, 'Insert-Handoff muss Quelle UND Zielseite ohne Reset fortsetzen.');

// v29: Ist kein zentraler Workspace aktiv, darf ein normaler Seitenwechsel
// die geoeffnete Bibliothek bzw. einen laufenden Einsetzvorgang nicht schließen.
const libraryPanel = global.document.getElementById('oluntir-repeat-library-panel');
libraryPanel.hidden = false;
assert.strictEqual(manager.isEditorActive(), false, 'Vor dem normalen Bibliotheks-Seitenwechsel darf kein Workspace aktiv sein.');
assert.strictEqual(manager.prepareForPageNavigation('page-a'), true, 'Normaler Seitenwechsel ohne Workspace muss erlaubt bleiben.');
assert.strictEqual(libraryPanel.hidden, false, 'Normaler Seitenwechsel darf die Repeat-Bibliothek nicht schließen.');

console.log('REPEAT-LIBRARY-MANAGER-RUNTIME-TEST ERFOLGREICH');

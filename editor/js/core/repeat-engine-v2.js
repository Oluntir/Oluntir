(function (root, factory) {
  const api = factory(root && root.OluntirLayoutIdentities);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRepeatEngineV2 = api;
})(typeof window !== 'undefined' ? window : globalThis, function (identities) {
  'use strict';
  const SCHEMA_VERSION = 2;
  let editor = null;
  let definitions = [];
  const clone = value => JSON.parse(JSON.stringify(value));
  function attrsOf(c) { return c && c.getAttributes ? (c.getAttributes() || {}) : {}; }
  function parentOf(c) { return c && c.parent ? c.parent() : null; }
  function identityOf(c) {
    const attrs = attrsOf(c); if (!identities) return null;
    return Object.values(identities.ATTR).map(a => attrs[a]).find(Boolean) || null;
  }
  function kindOf(c) { return identities ? identities.classify(c, false) : 'component'; }
  function contextRoot(component, mode) {
    if (mode !== 'context') return component;
    let current = component; let candidate = component;
    while (current) {
      const kind = kindOf(current);
      if (kind === 'slot' || kind === 'row' || kind === 'section') candidate = current;
      if (kind === 'row' || kind === 'section') break;
      current = parentOf(current);
    }
    return candidate;
  }
  function componentJson(component) {
    if (component && component.toJSON) return clone(component.toJSON());
    throw new Error('Die Quellkomponente kann nicht serialisiert werden.');
  }
  function pageById(pageId) { return editor.Pages.getAll().find(page => identities.pageId(page) === pageId || String(page.id) === String(pageId)); }
  function children(c) { const list = c && c.components ? c.components() : null; return list && list.models ? list.models : []; }
  function findChildByIdentity(parent, id) { return children(parent).find(child => identityOf(child) === id) || null; }
  function addJson(parent, json) { const added = parent.components().add(clone(json)); return Array.isArray(added) ? added[0] : added; }
  function mergeTree(source, target) {
    children(source).forEach(sourceChild => {
      const id = identityOf(sourceChild); let targetChild = id ? findChildByIdentity(target, id) : null;
      if (!targetChild) targetChild = addJson(target, componentJson(sourceChild));
      else mergeTree(sourceChild, targetChild);
    });
    return target;
  }
  function resolveTarget(definition, page) {
    const root = page.getMainComponent();
    const path = Array.isArray(definition.targetPath) ? definition.targetPath : [];
    let current = root;
    for (const id of path) {
      let next = identities.findById(page, id);
      if (!next) break;
      current = next;
    }
    return current;
  }
  function define(component, options) {
    if (!editor || !component) throw new Error('Repeat Engine V2 ist nicht gebunden.');
    identities.ensureAll(editor);
    const sourcePage = editor.Pages.getSelected();
    const unit = contextRoot(component, options && options.mode);
    const repeatId = (options && options.repeatId) || identities.createId('repeat');
    component.addAttributes({ [identities.ATTR.repeat]: repeatId });
    const path = []; let cursor = unit;
    while (cursor && cursor !== sourcePage.getMainComponent()) { const id = identityOf(cursor); if (id) path.unshift(id); cursor = parentOf(cursor); }
    const definition = {
      repeatId, sourcePageId: identities.pageId(sourcePage), sourceComponentId: identityOf(component),
      unitId: identityOf(unit), unitKind: kindOf(unit), targetPageIds: clone((options && options.targetPageIds) || []),
      targetPath: clone((options && options.targetPath) || path.slice(0, -1)), mode: (options && options.mode) === 'context' ? 'context' : 'selected',
      schemaVersion: SCHEMA_VERSION
    };
    definitions = definitions.filter(item => item.repeatId !== repeatId); definitions.push(definition); return clone(definition);
  }
  function apply(repeatId) {
    const definition = definitions.find(item => item.repeatId === repeatId); if (!definition) throw new Error('Repeat-Definition nicht gefunden.');
    const sourcePage = pageById(definition.sourcePageId); if (!sourcePage) throw new Error('Quellseite nicht gefunden.');
    const sourceUnit = identities.findById(sourcePage, definition.unitId); if (!sourceUnit) throw new Error('Wiederholungseinheit nicht gefunden.');
    const results = [];
    definition.targetPageIds.forEach(targetPageId => {
      const page = pageById(targetPageId); if (!page || page === sourcePage) return;
      const targetParent = resolveTarget(definition, page);
      let existing = identities.findById(page, definition.unitId);
      if (existing) mergeTree(sourceUnit, existing);
      else existing = addJson(targetParent, componentJson(sourceUnit));
      identities.ensureAll(editor); results.push({ pageId: identities.pageId(page), componentId: identityOf(existing) });
    });
    return results;
  }
  function exportState() { return { schemaVersion: SCHEMA_VERSION, definitions: clone(definitions) }; }
  function importState(state) { definitions = state && Array.isArray(state.definitions) ? clone(state.definitions) : []; return exportState(); }
  function decorateProjectData(data) { data.oluntir = Object.assign({}, data.oluntir || {}, { repeatEngineSchemaVersion: SCHEMA_VERSION, repeatEngine: exportState() }); return data; }
  function bind(nextEditor) { editor = nextEditor; if (editor && editor.on) editor.on('load', function () { const data = editor.getProjectData ? editor.getProjectData() : null; if (data && data.oluntir && data.oluntir.repeatEngine) importState(data.oluntir.repeatEngine); }); }
  return { SCHEMA_VERSION, bind, define, apply, exportState, importState, decorateProjectData };
});

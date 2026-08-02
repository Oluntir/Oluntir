(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirDocumentApi = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const SCHEMA_VERSION = 8;
  let boundEditor = null;

  function adapter() {
    return root && root.OluntirGrapes ? root.OluntirGrapes : null;
  }

  function resolver() {
    return root && root.OluntirStructureResolver ? root.OluntirStructureResolver : null;
  }


  function selectedPage() {
    const a = adapter();
    if (a && typeof a.getSelectedPage === 'function') return a.getSelectedPage();
    return boundEditor && boundEditor.Pages && boundEditor.Pages.getSelected
      ? boundEditor.Pages.getSelected()
      : null;
  }

  function displayDescriptor(page, node) {
    const a = adapter();
    if (!a || typeof a.describeIdentity !== 'function' || !node || !node.identity) return null;
    return a.describeIdentity(page, node.identity);
  }

  function usefulToken(value) {
    let token = String(value || '').trim();
    if (!token) return '';
    // GrapesJS erzeugt bei ID-Kollisionen Ketten wie "-2-2-2-2". Diese
    // technische Deduplizierung ist keine verständliche Strukturbezeichnung.
    const semantics = root && root.OluntirTemplateSemantics;
    token = semantics && typeof semantics.cleanCollisionSuffix === 'function'
      ? semantics.cleanCollisionSuffix(token)
      : token.replace(/(?:-\d+){2,}$/i, '');
    if (!token || token.length > 50) return '';
    if (/^(?:[\d-]{8,}|i[a-z0-9]{5,})$/i.test(token)) return '';
    return token;
  }

  function roleLabel(role, tagName) {
    const labels = {
      row: 'ROW',
      column: 'COLUMN',
      container: 'CONTAINER',
      'container-fluid': 'CONTAINER-FLUID',
      card: 'CARD',
      'card-header': 'CARD-HEADER',
      'card-body': 'CARD-BODY',
      'card-footer': 'CARD-FOOTER',
      section: 'SECTION',
      navigation: 'NAVIGATION',
      header: 'HEADER',
      main: 'MAIN',
      footer: 'FOOTER',
      div: 'DIV'
    };
    return labels[role] || String(tagName || 'ELEMENT').toUpperCase();
  }

  function nodeLabel(node, descriptor) {
    const classes = (descriptor.classes || []).map(usefulToken).filter(Boolean);
    const id = usefulToken(descriptor.attributes && descriptor.attributes.id);
    const templateRole = descriptor.templateRole || node.templateRole || (descriptor.isRow ? 'row' : descriptor.tagName);
    const type = roleLabel(templateRole, descriptor.tagName);
    const parts = [type];
    if (id) parts.push(`#${id}`);
    if (classes.length) parts.push(`.${classes.slice(0, 5).join('.')}`);
    return parts.join(' ');
  }

  function aPosition(page, identity) {
    const a = adapter();
    if (!a || typeof a.describeIdentityPosition !== 'function') return null;
    return a.describeIdentityPosition(page, identity);
  }

  function collectTemplateNodes(page, structure) {
    const nodes = [];

    function visit(node) {
      const descriptor = displayDescriptor(page, node);
      if (descriptor) {
        const templateRole = descriptor.templateRole || node.templateRole || descriptor.tagName || 'element';
        const position = aPosition(page, node.identity);
        nodes.push(Object.freeze({
          identity: node.identity,
          parentIdentity: position && position.parentIdentity ? position.parentIdentity : (node.parentIdentity || null),
          templateRole,
          frameworkRole: descriptor.frameworkRole || node.frameworkRole || null,
          framework: descriptor.framework || node.framework || null,
          origin: descriptor.origin || 'page',
          tagName: descriptor.tagName || node.tagName || null,
          classes: Object.freeze((descriptor.classes || []).slice()),
          label: nodeLabel(node, descriptor),
          structuralKind: node.structuralKind || null,
          componentType: node.componentType || null,
          positionIndex: position && Number.isInteger(position.index) ? position.index : 0,
          positionPath: Object.freeze(position && Array.isArray(position.path) ? position.path.slice() : [])
        }));
      }
      (node.children || []).forEach(visit);
    }

    (structure.roots || []).forEach(visit);
    return nodes;
  }

  function createRowSlotModel(page, structure) {
    const all = collectTemplateNodes(page, structure);
    const byIdentity = new Map(all.map(node => [node.identity, node]));
    const parentRoles = new Set(['main', 'section', 'container', 'container-fluid']);
    const rows = all.filter(node => node.templateRole === 'row');
    const groups = [];
    const groupByParent = new Map();

    rows.forEach((row) => {
      const parent = row.parentIdentity ? byIdentity.get(row.parentIdentity) : null;
      if (!parent || !parentRoles.has(parent.templateRole)) return;
      let group = groupByParent.get(parent.identity);
      if (!group) {
        group = {
          nodeId: `row-parent:${groups.length}`,
          pageId: structure.pageId,
          identity: parent.identity,
          parentIdentity: parent.parentIdentity || null,
          type: parent.templateRole,
          templateRole: parent.templateRole,
          frameworkRole: parent.frameworkRole,
          framework: parent.framework,
          origin: parent.origin,
          tagName: parent.tagName,
          classes: parent.classes,
          label: parent.label,
          rows: []
        };
        groupByParent.set(parent.identity, group);
        groups.push(group);
      }
      group.rows.push(Object.assign({}, row, {
        nodeId: `row-node:${group.rows.length}:${row.identity}`,
        type: 'row'
      }));
    });

    // Empty layout parents remain visible for orientation, but they are not
    // offered as gallery ROW targets. DEV_011 only supports the established
    // before/between/after ROW positions and the separate MAIN-area insertion.
    all.filter(node => parentRoles.has(node.templateRole)).forEach((parent) => {
      if (groupByParent.has(parent.identity)) return;
      const group = {
        nodeId: `row-parent:${groups.length}`,
        pageId: structure.pageId,
        identity: parent.identity,
        parentIdentity: parent.parentIdentity || null,
        type: parent.templateRole,
        templateRole: parent.templateRole,
        frameworkRole: parent.frameworkRole,
        framework: parent.framework,
        origin: parent.origin,
        tagName: parent.tagName,
        classes: parent.classes,
        label: parent.label,
        rows: []
      };
      groupByParent.set(parent.identity, group);
      groups.push(group);
    });

    const slots = [];
    groups.forEach((group) => {
      if (group.origin === 'shared-header' || group.origin === 'shared-footer') return;
      if (!group.rows.length) return;

      group.rows.forEach((row, index) => {
        if (index === 0) {
          slots.push(Object.freeze({
            slotId: `${group.nodeId}:before-first`,
            pageId: structure.pageId,
            nodeId: row.nodeId,
            mode: 'before',
            parentIdentity: group.identity,
            anchorIdentity: row.identity,
            slotKind: 'before-row',
            label: 'Hier platzieren – vor der ersten ROW'
          }));
        }

        slots.push(Object.freeze({
          slotId: `${group.nodeId}:after-row:${index}`,
          pageId: structure.pageId,
          nodeId: row.nodeId,
          mode: 'after',
          parentIdentity: group.identity,
          anchorIdentity: row.identity,
          slotKind: index === group.rows.length - 1 ? 'after-last-row' : 'between-rows',
          label: index === group.rows.length - 1
            ? 'Hier platzieren – nach der letzten ROW'
            : `Hier platzieren – zwischen ROW ${index + 1} und ROW ${index + 2}`
        }));
      });
    });


    // New gallery areas are inserted between the direct visual children of MAIN.
    // Existing containers remain visible as row targets, while these dedicated
    // slots create a complete new SECTION/CONTAINER/ROW structure.
    const mainNodes = all.filter(node =>
      node.templateRole === 'main' &&
      !['shared-header', 'shared-footer'].includes(node.origin)
    );
    const areaSlots = [];
    const visualAreas = [];
    mainNodes.forEach((mainNode) => {
      const directAreas = all
        .filter(node => node.parentIdentity === mainNode.identity)
        .filter(node => !['shared-header', 'shared-footer'].includes(node.origin))
        .filter(node => ['section', 'container', 'container-fluid'].includes(node.templateRole))
        .sort((left, right) => {
          const li = Number.isInteger(left.positionIndex) ? left.positionIndex : 0;
          const ri = Number.isInteger(right.positionIndex) ? right.positionIndex : 0;
          return li - ri;
        });

      directAreas.forEach(area => visualAreas.push(area));
      if (!directAreas.length) {
        areaSlots.push(Object.freeze({
          slotId: `new-area:${mainNode.identity}:empty`,
          pageId: structure.pageId,
          nodeId: `new-area:${mainNode.identity}:empty`,
          mode: 'inside-end',
          parentIdentity: mainNode.identity,
          anchorIdentity: null,
          slotKind: 'new-gallery-area',
          actionKind: 'new-area',
          structureScope: 'main',
          structureKind: 'section-container-row-gallery',
          visualIndex: 0,
          label: 'Neuen Galerie-Bereich im leeren MAIN erstellen'
        }));
        return;
      }

      areaSlots.push(Object.freeze({
        slotId: `new-area:${mainNode.identity}:before-first`,
        pageId: structure.pageId,
        nodeId: `new-area:${mainNode.identity}:before-first`,
        mode: 'before',
        parentIdentity: mainNode.identity,
        anchorIdentity: directAreas[0].identity,
        slotKind: 'new-gallery-area',
        actionKind: 'new-area',
        structureScope: 'main',
        structureKind: 'section-container-row-gallery',
        visualIndex: 0,
        label: 'Neuen Galerie-Bereich vor dem ersten Seitenbereich erstellen'
      }));

      directAreas.forEach((area, index) => {
        areaSlots.push(Object.freeze({
          slotId: `new-area:${mainNode.identity}:after:${area.identity}`,
          pageId: structure.pageId,
          nodeId: `new-area:${mainNode.identity}:after:${area.identity}`,
          mode: 'after',
          parentIdentity: mainNode.identity,
          anchorIdentity: area.identity,
          slotKind: 'new-gallery-area',
          actionKind: 'new-area',
          structureScope: 'main',
          structureKind: 'section-container-row-gallery',
          visualIndex: index + 1,
          label: index === directAreas.length - 1
            ? 'Neuen Galerie-Bereich nach dem letzten Seitenbereich erstellen'
            : `Neuen Galerie-Bereich zwischen Seitenbereich ${index + 1} und ${index + 2} erstellen`
        }));
      });
    });
    // Some completed templates expose the direct MAIN children through the
    // resolver, but not the MAIN node itself. In that valid template-first
    // case, derive the missing MAIN boundaries from the real parentIdentity
    // shared by the visible top-level Bootstrap areas. Parent and anchors still
    // come from resolved template positions and are revalidated before insertion.
    if (!areaSlots.length) {
      const candidates = groups
        .filter(group => ['main', 'page'].includes(group.origin))
        .filter(group => ['section', 'container', 'container-fluid'].includes(group.templateRole))
        .filter(group => Boolean(group.parentIdentity))
        .sort((left, right) => {
          const lp = Array.isArray(left.positionPath) ? left.positionPath : [];
          const rp = Array.isArray(right.positionPath) ? right.positionPath : [];
          const length = Math.max(lp.length, rp.length);
          for (let i = 0; i < length; i += 1) {
            const lv = Number.isInteger(lp[i]) ? lp[i] : -1;
            const rv = Number.isInteger(rp[i]) ? rp[i] : -1;
            if (lv !== rv) return lv - rv;
          }
          return (left.positionIndex || 0) - (right.positionIndex || 0);
        });
      const byParent = new Map();
      candidates.forEach((group) => {
        if (!byParent.has(group.parentIdentity)) byParent.set(group.parentIdentity, []);
        byParent.get(group.parentIdentity).push(group);
      });
      const owner = Array.from(byParent.entries())
        .map(([parentIdentity, ownedGroups]) => ({ parentIdentity, ownedGroups }))
        .sort((left, right) => right.ownedGroups.length - left.ownedGroups.length)[0] || null;

      if (owner && owner.ownedGroups.length) {
        const effectiveAreas = owner.ownedGroups;
        effectiveAreas.forEach(area => visualAreas.push(Object.freeze({
          identity: area.identity,
          parentIdentity: owner.parentIdentity,
          templateRole: area.templateRole,
          label: area.label,
          positionIndex: area.positionIndex,
          positionPath: area.positionPath
        })));
        areaSlots.push(Object.freeze({
          slotId: `new-area:${owner.parentIdentity}:before-first`,
          pageId: structure.pageId,
          nodeId: `new-area:${owner.parentIdentity}:before-first`,
          mode: 'before',
          parentIdentity: owner.parentIdentity,
          anchorIdentity: effectiveAreas[0].identity,
          slotKind: 'new-gallery-area',
          actionKind: 'new-area',
          structureScope: 'main',
          structureKind: 'section-container-row-gallery',
          visualIndex: 0,
          label: 'Neuen Galerie-Bereich vor dem ersten Seitenbereich erstellen'
        }));
        effectiveAreas.forEach((area, index) => {
          areaSlots.push(Object.freeze({
            slotId: `new-area:${owner.parentIdentity}:after:${area.identity}`,
            pageId: structure.pageId,
            nodeId: `new-area:${owner.parentIdentity}:after:${area.identity}`,
            mode: 'after',
            parentIdentity: owner.parentIdentity,
            anchorIdentity: area.identity,
            slotKind: 'new-gallery-area',
            actionKind: 'new-area',
            structureScope: 'main',
            structureKind: 'section-container-row-gallery',
            visualIndex: index + 1,
            label: index === effectiveAreas.length - 1
              ? 'Neuen Galerie-Bereich nach dem letzten Seitenbereich erstellen'
              : `Neuen Galerie-Bereich zwischen Seitenbereich ${index + 1} und ${index + 2} erstellen`
          }));
        });
      }
    }

    slots.push(...areaSlots);

    function topLevelAreaIdentity(group) {
      let current = byIdentity.get(group.identity) || null;
      let candidate = current;
      while (current && current.parentIdentity) {
        const parent = byIdentity.get(current.parentIdentity) || null;
        if (!parent) break;
        if (parent.templateRole === 'main') return candidate ? candidate.identity : current.identity;
        candidate = parent;
        current = parent;
      }
      return candidate && candidate.identity ? candidate.identity : group.identity;
    }

    groups.forEach((group) => {
      group.areaIdentity = topLevelAreaIdentity(group);
      const source = byIdentity.get(group.identity);
      group.positionPath = source && source.positionPath ? source.positionPath : [];
      group.contextOnly = group.origin === 'shared-header' || group.origin === 'shared-footer';
    });
    const originRank = {
      'shared-header': 0,
      'main': 1,
      'page': 1,
      'shared-footer': 2
    };
    groups.sort((left, right) => {
      const leftRank = Object.prototype.hasOwnProperty.call(originRank, left.origin) ? originRank[left.origin] : 1;
      const rightRank = Object.prototype.hasOwnProperty.call(originRank, right.origin) ? originRank[right.origin] : 1;
      if (leftRank !== rightRank) return leftRank - rightRank;
      return String(left.label || left.identity || '').localeCompare(String(right.label || right.identity || ''));
    });

    const visibleGroups = groups
      .filter(group => ['shared-header', 'shared-footer', 'main', 'page'].includes(group.origin))
      .sort((left, right) => {
        const leftRank = Object.prototype.hasOwnProperty.call(originRank, left.origin) ? originRank[left.origin] : 1;
        const rightRank = Object.prototype.hasOwnProperty.call(originRank, right.origin) ? originRank[right.origin] : 1;
        if (leftRank !== rightRank) return leftRank - rightRank;
        const lp = Array.isArray(left.positionPath) ? left.positionPath : [];
        const rp = Array.isArray(right.positionPath) ? right.positionPath : [];
        const length = Math.max(lp.length, rp.length);
        for (let i = 0; i < length; i += 1) {
          const lv = Number.isInteger(lp[i]) ? lp[i] : -1;
          const rv = Number.isInteger(rp[i]) ? rp[i] : -1;
          if (lv !== rv) return lv - rv;
        }
        return String(left.label || left.identity || '').localeCompare(String(right.label || right.identity || ''));
      });
    const frozenGroups = Object.freeze(visibleGroups.map(group => Object.freeze(Object.assign({}, group, {
      classes: Object.freeze((group.classes || []).slice()),
      positionPath: Object.freeze((group.positionPath || []).slice()),
      rows: Object.freeze(group.rows.map(row => Object.freeze(Object.assign({}, row, {
        classes: Object.freeze((row.classes || []).slice())
      }))))
    }))));
    const flatRows = Object.freeze(frozenGroups.flatMap(group => group.rows));
    return {
      roots: frozenGroups,
      nodes: flatRows,
      slots: Object.freeze(slots),
      areaSlots: Object.freeze(areaSlots.slice()),
      visualAreas: Object.freeze(visualAreas.map(area => Object.freeze(Object.assign({}, area))))
    };
  }

  function buildInsertionModel(editor) {
    if (editor && editor !== boundEditor) bind(editor);
    const page = selectedPage();
    const structureResolver = resolver();
    if (!page || !structureResolver || typeof structureResolver.resolvePage !== 'function') {
      return Object.freeze({ schemaVersion: SCHEMA_VERSION, pageId: null, roots: Object.freeze([]), nodes: Object.freeze([]), slots: Object.freeze([]) });
    }
    const structure = structureResolver.resolvePage(page);
    const model = createRowSlotModel(page, structure);
    return Object.freeze({
      schemaVersion: SCHEMA_VERSION,
      modelType: 'bootstrap-row-insertion-slots',
      pageId: structure.pageId || null,
      roots: model.roots,
      nodes: model.nodes,
      slots: model.slots,
      areaSlots: model.areaSlots || Object.freeze([]),
      visualAreas: model.visualAreas || Object.freeze([])
    });
  }

  function highlightTarget(target) {
    const a = adapter();
    if (!a || typeof a.highlightInsertionTarget !== 'function') return function () {};
    return a.highlightInsertionTarget(target);
  }

  function resolveTarget(target) {
    const a = adapter();
    if (!a || typeof a.resolveInsertionTarget !== 'function') return null;
    return a.resolveInsertionTarget(target);
  }

  function validateTarget(target) {
    return Boolean(resolveTarget(target));
  }

  function getLastTargetDiagnostic() {
    const a = adapter();
    return a && typeof a.getLastAreaInsertionDiagnostic === 'function'
      ? a.getLastAreaInsertionDiagnostic()
      : null;
  }

  function canPreviewTarget(target) {
    const a = adapter();
    if (!a) return false;
    if (typeof a.canPreviewInsertionTarget === 'function') return Boolean(a.canPreviewInsertionTarget(target));
    return validateTarget(target);
  }

  function insertHtml(target, html, options) {
    const a = adapter();
    if (!a || typeof a.insertHtmlAtTarget !== 'function') throw new Error('OLUNTIR_DOCUMENT_ADAPTER_UNAVAILABLE');
    const resolved = resolveTarget(target);
    if (!resolved) throw new Error('OLUNTIR_DOCUMENT_TARGET_UNAVAILABLE');
    return a.insertHtmlAtTarget(target, html);
  }

  function removeComponent(component, options) {
    const a = adapter();
    if (!a || !component || typeof a.removeComponent !== 'function') return false;
    return a.removeComponent(component);
  }

  function attributesEqual(left, right) {
    const leftKeys = Object.keys(left || {}).sort();
    const rightKeys = Object.keys(right || {}).sort();
    if (leftKeys.length !== rightKeys.length) return false;
    return leftKeys.every((key, index) => key === rightKeys[index] && String(left[key]) === String(right[key]));
  }

  function updateAttributes(component, attributes, options) {
    const a = adapter();
    if (!a || !component || typeof a.componentAttributes !== 'function' || typeof a.setComponentAttributes !== 'function') return false;
    const before = a.componentAttributes(component);
    const merge = !options || options.merge !== false;
    const after = merge ? Object.assign({}, before, attributes || {}) : Object.assign({}, attributes || {});
    if (options && Array.isArray(options.remove)) options.remove.forEach(name => delete after[name]);
    if (attributesEqual(before, after)) return false;
    return a.setComponentAttributes(component, after);
  }

  function updateAttributesBatch(updates, options) {
    const a = adapter();
    if (!a) return false;
    let changed = false;
    (updates || []).filter(entry => entry && entry.component).forEach(entry => {
      const before = a.componentAttributes(entry.component);
      const after = entry.merge === false ? Object.assign({}, entry.attributes || {}) : Object.assign({}, before, entry.attributes || {});
      (entry.remove || []).forEach(name => delete after[name]);
      if (!attributesEqual(before, after)) {
        a.setComponentAttributes(entry.component, after);
        changed = true;
      }
    });
    return changed;
  }

  function highlightNode(pageId, identity) {
    const a = adapter();
    if (!a || typeof a.highlightIdentity !== 'function') return function () {};
    return a.highlightIdentity(pageId, identity, {
      outline: '3px solid #4b9be8',
      outlineOffset: '3px',
      boxShadow: '0 0 0 5px rgba(75,155,232,.28)'
    });
  }

  function undoManager() {
    return boundEditor && boundEditor.UndoManager ? boundEditor.UndoManager : null;
  }

  function canUndo() {
    const manager = undoManager();
    return Boolean(manager && (typeof manager.hasUndo !== 'function' || manager.hasUndo()));
  }

  function canRedo() {
    const manager = undoManager();
    return Boolean(manager && (typeof manager.hasRedo !== 'function' || manager.hasRedo()));
  }

  function undo() {
    const manager = undoManager();
    if (!manager || typeof manager.undo !== 'function' || !canUndo()) return false;
    manager.undo();
    notify();
    return true;
  }

  function redo() {
    const manager = undoManager();
    if (!manager || typeof manager.redo !== 'function' || !canRedo()) return false;
    manager.redo();
    notify();
    return true;
  }

  function notify() {
    if (boundEditor && typeof boundEditor.trigger === 'function') {
      boundEditor.trigger('oluntir:history:changed', { canUndo: canUndo(), canRedo: canRedo() });
    }
  }

  function bind(editor) {
    if (!editor || boundEditor === editor) return;
    boundEditor = editor;
    if (editor.on) editor.on('undo redo component:add component:remove component:update', notify);
    notify();
  }

  function getHistoryState() {
    return Object.freeze({ schemaVersion: SCHEMA_VERSION, provider: 'grapesjs-undo-manager', canUndo: canUndo(), canRedo: canRedo() });
  }

  return Object.freeze({
    SCHEMA_VERSION,
    bind,
    buildInsertionModel,
    resolveTarget,
    validateTarget,
    getLastTargetDiagnostic,
    canPreviewTarget,
    insertHtml,
    removeComponent,
    updateAttributes,
    updateAttributesBatch,
    highlightNode,
    highlightTarget,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistoryState
  });
});

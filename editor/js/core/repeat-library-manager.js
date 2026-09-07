(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirRepeatLibraryManager = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const WORKSPACE_PAGE_ID = 'oluntir-repeat-workspace';
  const WORKSPACE_PAGE_NAME = 'Repeat-Arbeitsbereich';
  const SOURCE_MAPPING = 'oluntirRepeatSourceIdentity';
  const HISTORY_LIMIT = 20;
  const state = {
    editor: null,
    activeDefinitionId: '',
    returnPageId: '',
    workspacePage: null,
    workspaceRoot: null,
    draftTimer: 0,
    applying: false,
    projectMutationDepth: 0,
    projectMutation: null,
    history: [],
    redo: [],
    initialized: false,
    workspaceClosing: false,
    recoveringUi: false,
    catalogSort: 'recent',
    catalogExpanded: false
  };

  const text = value => value == null ? '' : String(value).trim();
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const engine = () => root.OluntirRepeatEngineV2;
  const identities = () => root.OluntirLayoutIdentities;
  const adapterApi = () => root.OluntirRepeatSyncAccessAdapter;
  const pages = () => state.editor && state.editor.Pages ? state.editor.Pages.getAll().filter(page => !isWorkspacePage(page)) : [];
  const pageId = page => text(identities() && identities().pageId ? identities().pageId(page) : page && page.id);
  const pageName = page => text(page && page.getName ? page.getName() : page && page.id);
  const children = component => {
    if (!component || typeof component.components !== 'function') return [];
    const collection = component.components();
    return collection && Array.isArray(collection.models) ? collection.models : (Array.isArray(collection) ? collection : []);
  };
  const logger = (message, data) => {
    if (root.OluntirLogger && typeof root.OluntirLogger.info === 'function') root.OluntirLogger.info('repeat', message, data || {});
  };
  const errorLog = (message, data) => {
    if (root.OluntirLogger && typeof root.OluntirLogger.error === 'function') root.OluntirLogger.error('repeat', message, data || {});
  };
  const toolDocument = () => { try { return root.OluntirMultiMonitor && typeof root.OluntirMultiMonitor.getToolDocument === 'function' ? root.OluntirMultiMonitor.getToolDocument() : null; } catch (_) { return null; } };
  const byId = id => (root.document && root.document.getElementById ? root.document.getElementById(id) : null) || (toolDocument() && toolDocument().getElementById ? toolDocument().getElementById(id) : null);

  function beginProjectMutation(kind) {
    const mutationKind = text(kind) || 'repeat-library';
    state.projectMutationDepth += 1;
    if (state.projectMutationDepth === 1) {
      state.projectMutation = {
        kind: mutationKind,
        startedAt: Date.now(),
        suppressedSharedStructuralEvents: 0,
        suppressedSharedStructuralEventTypes: Object.create(null)
      };
      logger('repeat.library-project-mutation-begin', { kind: mutationKind });
    }
    return state.projectMutation;
  }

  function endProjectMutation() {
    if (state.projectMutationDepth <= 0) return;
    state.projectMutationDepth -= 1;
    if (state.projectMutationDepth > 0) return;
    const mutation = state.projectMutation;
    state.projectMutation = null;
    if (!mutation) return;
    logger('repeat.library-project-mutation-end', {
      kind: mutation.kind,
      durationMs: Math.max(0, Date.now() - Number(mutation.startedAt || Date.now())),
      suppressedSharedStructuralEvents: Number(mutation.suppressedSharedStructuralEvents || 0),
      suppressedSharedStructuralEventTypes: Object.assign({}, mutation.suppressedSharedStructuralEventTypes || {})
    });
  }

  function withProjectMutation(kind, callback) {
    beginProjectMutation(kind);
    try {
      return callback();
    } finally {
      endProjectMutation();
    }
  }

  function isProjectMutationActive() {
    return state.projectMutationDepth > 0;
  }

  function noteSharedStructuralEventSuppressed(eventName) {
    const mutation = state.projectMutation;
    if (!mutation || state.projectMutationDepth <= 0) return false;
    const name = text(eventName) || 'component:structural';
    mutation.suppressedSharedStructuralEvents += 1;
    mutation.suppressedSharedStructuralEventTypes[name] = Number(mutation.suppressedSharedStructuralEventTypes[name] || 0) + 1;
    return true;
  }

  function isWorkspacePage(page) {
    if (!page) return false;
    const id = text(page.id || page.get && page.get('id'));
    const marker = page.get && page.get('oluntirInternalPage');
    return id === WORKSPACE_PAGE_ID || marker === 'repeat-workspace';
  }

  function definitionLabel(definition) {
    return text(definition && definition.metadata && definition.metadata.displayName) || 'Unbenannte Repeat-Quelle';
  }

  function explicitDefinitions() {
    const all = engine() && engine().getDefinitions ? engine().getDefinitions() : [];
    return (all || []).filter(definition => !(definition && definition.metadata && (definition.metadata.repeatType === 'shared-layout' || definition.metadata.regionRole)));
  }

  function definitionById(definitionId) {
    return engine() && engine().getDefinition ? engine().getDefinition(definitionId) : null;
  }

  function sortDefinitions(definitions) {
    const indexed = (definitions || []).map((definition, index) => ({ definition, index }));
    if (state.catalogSort === 'alpha') {
      indexed.sort((a, b) => definitionLabel(a.definition).localeCompare(definitionLabel(b.definition), 'de', { sensitivity: 'base' }) || a.index - b.index);
    } else {
      indexed.sort((a, b) => {
        const aMeta = a.definition && a.definition.metadata || {};
        const bMeta = b.definition && b.definition.metadata || {};
        const aTime = Date.parse(aMeta.libraryCreatedAt || aMeta.createdAt || '') || 0;
        const bTime = Date.parse(bMeta.libraryCreatedAt || bMeta.createdAt || '') || 0;
        if (aTime !== bTime) return bTime - aTime;
        return b.index - a.index;
      });
    }
    return indexed.map(entry => entry.definition);
  }

  function updateCatalogControls(definitionCount) {
    const hosts = [byId('oluntir-repeat-library-catalog'), byId('oluntir-repeat-insert-catalog')].filter(Boolean);
    const recent = byId('oluntir-repeat-library-sort-recent');
    const alpha = byId('oluntir-repeat-library-sort-alpha');
    const expand = byId('oluntir-repeat-library-expand');
    hosts.forEach(host => { host.dataset.expanded = state.catalogExpanded ? 'true' : 'false'; });
    if (recent) {
      const active = state.catalogSort !== 'alpha';
      recent.classList.toggle('is-active', active);
      recent.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    if (alpha) {
      const active = state.catalogSort === 'alpha';
      alpha.classList.toggle('is-active', active);
      alpha.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    if (expand) {
      expand.hidden = Number(definitionCount || 0) < 5;
      expand.disabled = Number(definitionCount || 0) < 5;
      expand.setAttribute('aria-expanded', state.catalogExpanded ? 'true' : 'false');
      expand.textContent = state.catalogExpanded ? 'Gesamtliste reduzieren' : 'Gesamtliste erweitern';
    }
  }

  function pageById(identity) {
    const id = text(identity);
    return pages().find(page => pageId(page) === id || text(page && page.id) === id) || null;
  }

  function componentByIdentity(pageIdentity, componentIdentity) {
    const page = pageById(pageIdentity);
    return page && identities() && identities().findById ? identities().findById(page, componentIdentity) : null;
  }

  function canonicalSnapshot(component) {
    if (!component || !adapterApi()) return null;
    const snap = adapterApi().snapshot(component);
    return adapterApi().cleanDefinition(snap);
  }

  // Materialisierte Repeat-Instanzen sind auf normalen Projektseiten absichtlich
  // gegen direkte Bearbeitung gesperrt. Diese GrapesJS-Interaktionsflags duerfen
  // jedoch niemals Bestandteil des zentralen Draft-Arbeitsbereichs werden.
  // Alte 2.2-Snapshots koennen die Flags bereits enthalten, deshalb wird der
  // Draft vor dem Erzeugen der Workspace-Komponenten rekursiv bereinigt. Ohne
  // diese Trennung bleiben Textkomponenten `editable:false` und GrapesJS blendet
  // auch die normalen Komponenten-Toolbars aus.
  const WORKSPACE_INTERACTION_KEYS = Object.freeze([
    'editable', 'stylable', 'draggable', 'droppable', 'removable', 'copyable'
  ]);

  function workspaceEditableDefinition(snapshot) {
    const output = clone(snapshot || {});
    WORKSPACE_INTERACTION_KEYS.forEach(key => { delete output[key]; });
    output.components = (output.components || []).map(workspaceEditableDefinition);
    return output;
  }

  function fingerprint(snapshot) {
    if (!snapshot) return '';
    const semantic = adapterApi() && adapterApi().semanticSnapshot ? adapterApi().semanticSnapshot(snapshot) : snapshot;
    const input = JSON.stringify(semantic);
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) { hash ^= input.charCodeAt(i); hash = Math.imul(hash, 16777619); }
    return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
  }

  function libraryMeta(definition) {
    const meta = clone(definition && definition.metadata || {});
    return {
      publishedSnapshot: clone(meta.libraryPublishedSnapshot || null),
      draftSnapshot: clone(meta.libraryDraftSnapshot || meta.libraryPublishedSnapshot || null),
      publishedRevision: Math.max(0, Number(meta.libraryPublishedRevision || 0)),
      draftRevision: Math.max(0, Number(meta.libraryDraftRevision || meta.libraryPublishedRevision || 0)),
      dirty: meta.libraryDirty === true,
      central: meta.centralLibraryMode === true
    };
  }

  function ensureMarker(component, definition, instance) {
    if (!component || !definition) return false;
    const attrs = component.getAttributes ? (component.getAttributes() || {}) : {};
    const next = {};
    let changed = false;
    const repeatAttr = identities() && identities().ATTR && identities().ATTR.repeat;
    if (repeatAttr && text(attrs[repeatAttr]) !== text(definition.repeatKey)) { next[repeatAttr] = definition.repeatKey; changed = true; }
    const displayName = definitionLabel(definition);
    if (displayName && text(attrs['data-oluntir-repeat-name']) !== displayName) { next['data-oluntir-repeat-name'] = displayName; changed = true; }
    if (instance && text(attrs['data-oluntir-repeat-instance-id']) !== text(instance.instanceId)) { next['data-oluntir-repeat-instance-id'] = instance.instanceId; changed = true; }
    if (changed && typeof component.addAttributes === 'function') component.addAttributes(next);
    return changed;
  }

  function lockTree(component) {
    if (!component) return;
    if (typeof component.set === 'function') {
      component.set({ editable: false, stylable: false, draggable: false, droppable: false, removable: false, copyable: false });
    }
    children(component).forEach(lockTree);
  }

  function findSourceComponent(definition) {
    if (!definition || !definition.source) return null;
    return componentByIdentity(definition.source.pageId, definition.source.rootIdentity);
  }

  function findFirstInstanceComponent(definitionId) {
    const instances = engine() && engine().getInstances ? engine().getInstances(definitionId) : [];
    for (const instance of instances || []) {
      if (!instance || instance.state === 'detached') continue;
      const component = componentByIdentity(instance.pageId, instance.rootIdentity);
      if (component) return { component, instance };
    }
    return null;
  }

  function ensureOriginInstance(definition, sourceComponent, publishedRevision) {
    if (!definition || !sourceComponent || !engine()) return null;
    const existing = (engine().getInstances(definition.definitionId) || []).find(instance => text(instance.pageId) === text(definition.source.pageId) && text(instance.rootIdentity) === text(definition.source.rootIdentity));
    if (existing) {
      ensureMarker(sourceComponent, definition, existing);
      lockTree(sourceComponent);
      return existing;
    }
    const instance = engine().createInstance(definition.definitionId, {
      pageId: definition.source.pageId,
      rootIdentity: definition.source.rootIdentity,
      correlationId: definition.correlationId || definition.definitionId,
      appliedRevision: publishedRevision || 1,
      appliedFingerprint: '',
      metadata: {
        originSourceMaterialized: true,
        centralLibraryMode: true,
        sourceIdentity: definition.source.rootIdentity,
        mappingProperty: SOURCE_MAPPING
      }
    });
    ensureMarker(sourceComponent, definition, instance);
    lockTree(sourceComponent);
    return instance;
  }

  function ensureDefinition(definition) {
    if (!definition || !engine()) return null;
    let current = definitionById(definition.definitionId) || definition;
    let meta = libraryMeta(current);
    let sourceComponent = findSourceComponent(current);
    if (!meta.publishedSnapshot) {
      if (!sourceComponent) {
        const fallback = findFirstInstanceComponent(current.definitionId);
        sourceComponent = fallback && fallback.component || null;
      }
      const snapshot = canonicalSnapshot(sourceComponent);
      if (!snapshot) return current;
      const revision = Math.max(1, Number(current.revision || 1));
      current = engine().updateDefinition(current.definitionId, {
        synchronizationPolicy: engine().SYNC_POLICY.MANUAL,
        metadata: Object.assign({}, current.metadata || {}, {
          centralLibraryMode: true,
          manualSynchronizationExplicit: true,
          libraryPublishedSnapshot: snapshot,
          libraryDraftSnapshot: snapshot,
          libraryPublishedRevision: revision,
          libraryDraftRevision: revision,
          libraryDirty: false,
          libraryInitializedAt: new Date().toISOString()
        })
      });
      meta = libraryMeta(current);
      logger('repeat.library-initialized', { definitionId: current.definitionId, displayName: definitionLabel(current), revision: meta.publishedRevision });
    } else if (current.synchronizationPolicy !== engine().SYNC_POLICY.MANUAL || !current.metadata || current.metadata.centralLibraryMode !== true || current.metadata.manualSynchronizationExplicit !== true) {
      current = engine().updateDefinition(current.definitionId, {
        synchronizationPolicy: engine().SYNC_POLICY.MANUAL,
        metadata: Object.assign({}, current.metadata || {}, { centralLibraryMode: true, manualSynchronizationExplicit: true })
      });
      meta = libraryMeta(current);
    }
    sourceComponent = findSourceComponent(current);
    if (sourceComponent) ensureOriginInstance(current, sourceComponent, meta.publishedRevision || 1);
    (engine().getInstances(current.definitionId) || []).forEach(instance => {
      if (!instance || instance.state === 'detached') return;
      const component = componentByIdentity(instance.pageId, instance.rootIdentity);
      if (!component) return;
      ensureMarker(component, current, instance);
      lockTree(component);
    });
    return definitionById(current.definitionId);
  }

  function recoverExplicitDefinitions(source) {
    let definitions = explicitDefinitions();
    if (definitions.length || state.recoveringUi || !engine()) return definitions;
    state.recoveringUi = true;
    try {
      if (typeof engine().recoverFromCurrentProjectMarkers === 'function') {
        engine().recoverFromCurrentProjectMarkers({ source: text(source) || 'repeat-library-empty-catalog' });
      }
      if (typeof engine().reconcileCurrentProjectBindings === 'function') {
        try { engine().reconcileCurrentProjectBindings({ source: `${text(source) || 'repeat-library-empty-catalog'}-reconcile` }); } catch (_) {}
      }
      definitions = explicitDefinitions();
    } finally {
      state.recoveringUi = false;
    }
    return definitions;
  }

  function initializeProject() {
    if (!state.editor || !engine() || !identities()) return false;
    identities().ensureAll(state.editor);
    // Recovery must be based on explicit Repeat families, not on the total
    // definition count. Older projects may still contain legacy shared-layout
    // definitions for header/nav/footer; those must never prevent recovery of
    // user-created Repeat families from their stable page markers.
    let definitions = explicitDefinitions();
    if (!definitions.length) definitions = recoverExplicitDefinitions('repeat-library-initialize-no-explicit-definitions');
    else if (typeof engine().recoverFromCurrentProjectMarkers === 'function') {
      // Also reconcile partially present projects: marker recovery is idempotent
      // and can restore missing instances without inventing positional identities.
      engine().recoverFromCurrentProjectMarkers({ source: 'repeat-library-initialize-partial-state' });
      definitions = explicitDefinitions();
    }
    definitions.forEach(ensureDefinition);
    refreshUi();
    return true;
  }

  function usage(definitionId) {
    const instances = engine() && engine().getInstances ? engine().getInstances(definitionId) : [];
    return (instances || []).filter(instance => instance && instance.state !== 'detached').map(instance => {
      const page = pageById(instance.pageId);
      return { instance, page, pageId: instance.pageId, pageName: page ? pageName(page) : instance.pageId };
    });
  }

  function selectedInsertionDefinitionId() {
    const select = byId('oluntir-repeat-definition-select');
    return text(select && select.value);
  }

  function catalogDetails(definition) {
    const meta = libraryMeta(definition);
    const used = usage(definition.definitionId);
    const pagesText = used.length ? Array.from(new Set(used.map(entry => entry.pageName))).join(', ') : 'noch nicht eingesetzt';
    return { meta, used, pagesText };
  }

  function fillCatalogMain(main, definition, details) {
    const strong = main.querySelector('strong');
    const pagesHost = main.querySelector('.oluntir-repeat-catalog-pages');
    const metaHost = main.querySelector('small');
    if (strong) strong.textContent = definitionLabel(definition);
    if (pagesHost) pagesHost.textContent = `Verwendet auf: ${details.pagesText}`;
    if (metaHost) metaHost.textContent = `${details.used.length}× · R${details.meta.publishedRevision || 1}${details.meta.dirty ? ' · offen' : ''}`;
  }

  function renderEditCatalog(host, definitions) {
    if (!host) return;
    host.innerHTML = '';
    if (!definitions.length) {
      const empty = host.ownerDocument.createElement('p');
      empty.className = 'oluntir-repeat-muted';
      empty.textContent = 'Noch keine wiederholbaren Bereiche im Projekt.';
      host.appendChild(empty);
      return;
    }
    definitions.forEach(definition => {
      const item = host.ownerDocument.createElement('article');
      item.className = 'oluntir-repeat-catalog-item';
      item.dataset.definitionId = definition.definitionId;
      item.innerHTML = '<div class="oluntir-repeat-catalog-main"><strong></strong><span class="oluntir-repeat-catalog-pages"></span><small></small></div><div class="oluntir-repeat-catalog-actions"><button type="button" data-repeat-action="edit">Zentral bearbeiten</button></div>';
      fillCatalogMain(item.querySelector('.oluntir-repeat-catalog-main'), definition, catalogDetails(definition));
      item.querySelector('[data-repeat-action="edit"]').addEventListener('click', () => openEditor(definition.definitionId));
      host.appendChild(item);
    });
  }

  function renderInsertCatalog(host, definitions) {
    if (!host) return;
    const selectedId = selectedInsertionDefinitionId();
    host.innerHTML = '';
    if (!definitions.length) {
      const empty = host.ownerDocument.createElement('p');
      empty.className = 'oluntir-repeat-muted';
      empty.textContent = 'Noch keine wiederholbaren Bereiche im Projekt.';
      host.appendChild(empty);
      return;
    }
    definitions.forEach(definition => {
      const item = host.ownerDocument.createElement('article');
      item.className = 'oluntir-repeat-catalog-item';
      item.dataset.definitionId = definition.definitionId;
      item.dataset.selected = selectedId === definition.definitionId ? 'true' : 'false';
      const button = host.ownerDocument.createElement('button');
      button.type = 'button';
      button.className = 'oluntir-repeat-catalog-select';
      button.setAttribute('aria-pressed', selectedId === definition.definitionId ? 'true' : 'false');
      button.innerHTML = '<span class="oluntir-repeat-catalog-main"><strong></strong><span class="oluntir-repeat-catalog-pages"></span><small></small></span>';
      fillCatalogMain(button.querySelector('.oluntir-repeat-catalog-main'), definition, catalogDetails(definition));
      button.addEventListener('click', () => {
        if (root.OluntirRepeatUi && typeof root.OluntirRepeatUi.selectLibraryDefinition === 'function') {
          root.OluntirRepeatUi.selectLibraryDefinition(definition.definitionId);
          return;
        }
        refreshUi();
      });
      item.appendChild(button);
      host.appendChild(item);
    });
  }

  function refreshUi() {
    const editHost = byId('oluntir-repeat-library-catalog');
    const insertHost = byId('oluntir-repeat-insert-catalog');
    if (!editHost && !insertHost) return;
    let definitions = explicitDefinitions();
    if (!definitions.length) definitions = recoverExplicitDefinitions('repeat-library-refresh-empty-catalog');
    definitions = sortDefinitions(definitions);
    updateCatalogControls(definitions.length);
    renderEditCatalog(editHost, definitions);
    renderInsertCatalog(insertHost, definitions);
    updateManagerState();
  }

  function updateManagerState() {
    const doc = root.document || toolDocument();
    if (!doc && !toolDocument()) return;
    const definition = state.activeDefinitionId ? definitionById(state.activeDefinitionId) : null;
    const editorSection = byId('oluntir-repeat-manager-editor');
    const title = byId('oluntir-repeat-manager-current');
    const usageHost = byId('oluntir-repeat-manager-usage');
    const publish = byId('oluntir-repeat-manager-publish');
    const discard = byId('oluntir-repeat-manager-discard');
    const undo = byId('oluntir-repeat-manager-undo');
    const redo = byId('oluntir-repeat-manager-redo');
    if (editorSection) editorSection.hidden = !definition;
    if (title) title.textContent = definition ? `Zentrale Bearbeitung: ${definitionLabel(definition)}` : 'Keine Repeat-Quelle zur Bearbeitung geöffnet.';
    if (usageHost) usageHost.textContent = definition ? `Verwendet auf: ${Array.from(new Set(usage(definition.definitionId).map(item => item.pageName))).join(', ') || 'keinen Seiten'}` : '';
    const meta = definition ? libraryMeta(definition) : null;
    if (publish) publish.disabled = !definition || !state.workspaceRoot || !(meta && meta.dirty);
    if (discard) discard.disabled = !definition || !state.workspaceRoot;
    if (undo) undo.disabled = !state.history.length;
    if (redo) redo.disabled = !state.redo.length;
  }

  function removeWorkspacePage(targetPageId) {
    if (!state.editor || !state.editor.Pages) return false;
    const workspace = state.editor.Pages.getAll().find(isWorkspacePage);
    if (!workspace) {
      state.workspacePage = null;
      state.workspaceRoot = null;
      return true;
    }

    // GrapesJS darf niemals die aktuell selektierte Seite entfernen. Genau das
    // führte beim bisherigen Workspace-Abschluss dazu, dass der PageManager kurz
    // ohne gültigen Komponentenbaum dastand und intern auf einer nicht mehr
    // existierenden Komponente getAttributes() aufrief. Deshalb erfolgt der
    // Handoff immer zuerst auf eine reale Projektseite und erst danach wird die
    // temporäre Repeat-Seite entfernt.
    const selected = currentPage();
    const preferredTarget = pageById(targetPageId) || pageById(state.returnPageId) || pages()[0] || null;
    state.workspaceClosing = true;
    let removed = false;
    try {
      if (selected === workspace) {
        if (!preferredTarget) {
          throw new Error('Repeat-Arbeitsbereich kann nicht geschlossen werden, weil keine normale Projektseite verfügbar ist.');
        }
        if (state.editor && typeof state.editor.select === 'function') {
          try { state.editor.select(null); } catch (_) {}
        }
        state.editor.Pages.select(preferredTarget);
        if (currentPage() === workspace) {
          throw new Error('Der Wechsel vom Repeat-Arbeitsbereich auf die Projektseite konnte nicht abgeschlossen werden.');
        }
        logger('repeat.library-workspace-handoff', {
          targetPageId: pageId(preferredTarget),
          targetPageName: pageName(preferredTarget)
        });
      }

      state.editor.Pages.remove(workspace);
      if (currentPage() === workspace) {
        throw new Error('Der Repeat-Arbeitsbereich blieb nach dem Entfernen als aktive GrapesJS-Seite zurück.');
      }
      if (state.editor.Pages.getAll().includes(workspace)) {
        throw new Error('Der Repeat-Arbeitsbereich konnte nicht aus dem GrapesJS-PageManager entfernt werden.');
      }
      removed = true;
      return true;
    } finally {
      if (removed) {
        state.workspacePage = null;
        state.workspaceRoot = null;
      } else {
        state.workspacePage = workspace;
      }
      state.workspaceClosing = false;
    }
  }

  function currentPage() {
    return state.editor && state.editor.Pages ? state.editor.Pages.getSelected() : null;
  }

  function setPageControlsDisabled(disabled) {
    if (!root.document) return;
    // Im zentralen Repeat-Workspace dürfen Seiten nicht strukturell verändert
    // werden. Die Seitenauswahl selbst bleibt aber absichtlich aktiv: Ein
    // Wechsel auf eine normale Projektseite beendet den Workspace kontrolliert.
    ['btn-new-page', 'btn-rename-page', 'btn-delete-page'].forEach(id => {
      const control = root.document.getElementById(id);
      if (control) control.disabled = Boolean(disabled);
    });
    const pageSelect = root.document.getElementById('page-select');
    if (pageSelect) pageSelect.disabled = false;
    if (root.document.body) root.document.body.classList.toggle('oluntir-repeat-workspace-active', Boolean(disabled));
  }

  function openEditor(definitionId) {
    if (!state.editor) return false;
    const definition = ensureDefinition(definitionById(definitionId));
    if (!definition) return false;
    captureDraftNow();
    const selected = currentPage();
    if (selected && !isWorkspacePage(selected)) state.returnPageId = pageId(selected);
    removeWorkspacePage(state.returnPageId);
    const meta = libraryMeta(definition);
    const storedDraft = clone(meta.draftSnapshot || meta.publishedSnapshot);
    if (!storedDraft) return false;
    const draft = workspaceEditableDefinition(storedDraft);
    const page = state.editor.Pages.add({
      id: WORKSPACE_PAGE_ID,
      name: WORKSPACE_PAGE_NAME,
      oluntirInternalPage: 'repeat-workspace',
      component: { type: 'wrapper', components: [draft] }
    }, { select: true });
    state.workspacePage = page;
    state.activeDefinitionId = definition.definitionId;
    // The central editor and the insertion workflow represent the same Repeat
    // family. Keep the library selection synchronized so a target page can be
    // chosen directly from central editing without having to reselect the item.
    if (root.OluntirRepeatUi && typeof root.OluntirRepeatUi.selectLibraryDefinition === 'function') {
      root.OluntirRepeatUi.selectLibraryDefinition(definition.definitionId);
    }
    setPageControlsDisabled(true);
    const wrapper = page.getMainComponent && page.getMainComponent();
    state.workspaceRoot = children(wrapper)[0] || null;
    if (identities()) identities().ensureAll(state.editor);
    if (state.editor.select && state.workspaceRoot) state.editor.select(state.workspaceRoot);
    logger('repeat.library-workspace-editability-restored', {
      definitionId: definition.definitionId,
      displayName: definitionLabel(definition),
      strippedInteractionKeys: WORKSPACE_INTERACTION_KEYS.slice()
    });
    const panel = byId('oluntir-repeat-library-panel');
    if (panel) panel.hidden = false;
    updateManagerState();
    logger('repeat.library-editor-opened', { definitionId: definition.definitionId, displayName: definitionLabel(definition), returnPageId: state.returnPageId || null });
    return true;
  }

  function captureDraftNow() {
    root.clearTimeout(state.draftTimer);
    state.draftTimer = 0;
    if (!state.activeDefinitionId || !state.workspaceRoot || !engine()) return null;
    const definition = definitionById(state.activeDefinitionId);
    if (!definition) return null;
    const snapshot = canonicalSnapshot(state.workspaceRoot);
    if (!snapshot) return null;
    const meta = libraryMeta(definition);
    const dirty = fingerprint(snapshot) !== fingerprint(meta.publishedSnapshot);
    if (fingerprint(snapshot) === fingerprint(meta.draftSnapshot) && dirty === meta.dirty) { updateManagerState(); return definition; }
    const nextRevision = dirty ? Math.max(meta.draftRevision, meta.publishedRevision + 1) : meta.publishedRevision;
    const updated = engine().updateDefinition(definition.definitionId, {
      synchronizationPolicy: engine().SYNC_POLICY.MANUAL,
      metadata: Object.assign({}, definition.metadata || {}, {
        centralLibraryMode: true,
        manualSynchronizationExplicit: true,
        libraryDraftSnapshot: snapshot,
        libraryDraftRevision: nextRevision,
        libraryDirty: dirty,
        libraryDraftUpdatedAt: new Date().toISOString()
      })
    });
    updateManagerState();
    refreshUi();
    return updated;
  }

  function scheduleDraftCapture() {
    root.clearTimeout(state.draftTimer);
    state.draftTimer = root.setTimeout(captureDraftNow, 700);
  }

  function componentInsideWorkspace(component) {
    let current = component;
    const seen = new Set();
    while (current && !seen.has(current)) {
      if (current === state.workspaceRoot) return true;
      seen.add(current);
      current = typeof current.parent === 'function' ? current.parent() : null;
    }
    return false;
  }

  function publishActive() {
    if (!state.activeDefinitionId || !state.workspaceRoot || state.applying) return false;
    captureDraftNow();
    const definition = definitionById(state.activeDefinitionId);
    if (!definition) return false;
    const meta = libraryMeta(definition);
    const sourceSnapshot = clone(meta.draftSnapshot || meta.publishedSnapshot);
    if (!sourceSnapshot) return false;
    const targets = usage(definition.definitionId);
    const access = adapterApi().create(state.editor);
    const before = [];
    const changed = [];
    state.applying = true;
    return withProjectMutation('publish', () => {
      try {
        targets.forEach(entry => {
          const snapshot = access.readByIdentity(entry.instance.pageId, entry.instance.rootIdentity);
          before.push({ instance: clone(entry.instance), snapshot });
        });
        targets.forEach(entry => {
          access.writeSnapshot(entry.instance.pageId, entry.instance.rootIdentity, sourceSnapshot);
          changed.push(entry);
          const component = componentByIdentity(entry.instance.pageId, entry.instance.rootIdentity);
          if (component) { ensureMarker(component, definition, entry.instance); lockTree(component); }
        });
        const nextRevision = Math.max(meta.publishedRevision + 1, meta.draftRevision || 0, 1);
        const fp = fingerprint(sourceSnapshot);
        const result = engine().commitLibraryPublication(definition.definitionId, {
          libraryPublishedSnapshot: sourceSnapshot,
          libraryDraftSnapshot: sourceSnapshot,
          libraryPublishedRevision: nextRevision,
          libraryDraftRevision: nextRevision,
          libraryDirty: false,
          libraryPublishedAt: new Date().toISOString()
        }, targets.map(entry => ({ instanceId: entry.instance.instanceId, appliedRevision: nextRevision, appliedFingerprint: fp, metadata: Object.assign({}, entry.instance.metadata || {}, { centralLibraryMode: true, lastPublishedAt: new Date().toISOString() }) })));
        const after = targets.map(entry => ({ instance: clone((result.instances || []).find(item => item.instanceId === entry.instance.instanceId) || entry.instance), snapshot: access.readByIdentity(entry.instance.pageId, entry.instance.rootIdentity) }));
        pushHistory({ type: 'publish', definitionId: definition.definitionId, before, after, beforeDefinition: clone(definition), afterDefinition: clone(result.definition), label: `„${definitionLabel(definition)}“ auf ${targets.length} Vorkommen angewendet` });
        if (typeof root.OluntirPersistProjectSoon === 'function') root.OluntirPersistProjectSoon(0);
        logger('repeat.library-published', { definitionId: definition.definitionId, displayName: definitionLabel(definition), revision: nextRevision, instanceCount: targets.length });
        refreshUi();
        updateManagerState();
        return true;
      } catch (error) {
        for (let index = before.length - 1; index >= 0; index -= 1) {
          const entry = before[index];
          try { access.restoreByIdentity(entry.instance.pageId, entry.instance.rootIdentity, entry.snapshot); } catch (_) {}
        }
        errorLog('repeat.library-publish-failed', { definitionId: definition.definitionId, message: error && error.message || String(error) });
        throw error;
      } finally {
        state.applying = false;
      }
    });
  }

  function discardDraft() {
    const definition = state.activeDefinitionId ? definitionById(state.activeDefinitionId) : null;
    if (!definition) return false;
    const meta = libraryMeta(definition);
    engine().updateDefinition(definition.definitionId, {
      synchronizationPolicy: engine().SYNC_POLICY.MANUAL,
      metadata: Object.assign({}, definition.metadata || {}, {
        libraryDraftSnapshot: clone(meta.publishedSnapshot),
        libraryDraftRevision: meta.publishedRevision,
        libraryDirty: false,
        libraryDraftUpdatedAt: new Date().toISOString()
      })
    });
    openEditor(definition.definitionId);
    return true;
  }

  function finishWorkspace(options) {
    const opts = options || {};
    const workspace = state.editor && state.editor.Pages ? state.editor.Pages.getAll().find(isWorkspacePage) : null;
    const hadWorkspace = Boolean(state.workspaceRoot || state.workspacePage || workspace);
    if (!hadWorkspace) {
      // Kein zentraler Workspace aktiv: Ein normaler Seitenwechsel darf die
      // Repeat-Bibliothek und einen bereits begonnenen Einsetzvorgang nicht
      // schließen. Die Bibliothek ist ein Werkzeugzustand, keine Workspace-Seite.
      return false;
    }
    captureDraftNow();
    const removed = removeWorkspacePage(opts.targetPageId);
    if (!removed) return false;
    state.activeDefinitionId = '';
    state.returnPageId = '';
    setPageControlsDisabled(false);
    if (opts.hidePanel) {
      const panel = byId('oluntir-repeat-library-panel');
      if (panel) panel.hidden = true;
    }
    if (typeof root.OluntirPersistProjectSoon === 'function') root.OluntirPersistProjectSoon(0, { skipSharedContent: true });
    updateManagerState();
    refreshUi();
    logger('repeat.library-editor-closed', { reason: text(opts.reason) || 'close', targetPageId: text(opts.targetPageId) || null });
    return true;
  }

  function isEditorActive() {
    if (state.workspaceRoot || state.workspacePage) return true;
    return Boolean(state.editor && state.editor.Pages && state.editor.Pages.getAll().some(isWorkspacePage));
  }

  function prepareForInsertionNavigation(targetPageId) {
    const targetId = text(targetPageId);
    if (!targetId || targetId === WORKSPACE_PAGE_ID) return false;
    if (!isEditorActive()) return true;
    const definitionId = state.activeDefinitionId;
    const closed = finishWorkspace({ hidePanel: false, reason: 'insert-target-selection', targetPageId: targetId });
    if (!closed && pageId(currentPage()) !== targetId) return false;
    const panel = byId('oluntir-repeat-library-panel');
    if (panel) panel.hidden = false;
    if (definitionId && root.OluntirRepeatUi) {
      if (typeof root.OluntirRepeatUi.resumeLibraryInsertion === 'function') {
        root.OluntirRepeatUi.resumeLibraryInsertion(definitionId, targetId);
      } else if (typeof root.OluntirRepeatUi.selectLibraryDefinition === 'function') {
        root.OluntirRepeatUi.selectLibraryDefinition(definitionId);
      }
    }
    logger('repeat.library-insertion-handoff', { definitionId: definitionId || null, targetPageId: targetId });
    return true;
  }

  function beginInsertion(definitionId) {
    const id = text(definitionId || state.activeDefinitionId);
    const definition = id && ensureDefinition(definitionById(id));
    if (!definition) return false;
    if (isEditorActive()) {
      const returnId = state.returnPageId || pageId(pages()[0]);
      const closed = finishWorkspace({ hidePanel: false, reason: 'switch-to-insertion', targetPageId: returnId });
      if (!closed && isEditorActive()) return false;
    }
    const panel = byId('oluntir-repeat-library-panel');
    if (panel) panel.hidden = false;
    if (root.OluntirRepeatUi && typeof root.OluntirRepeatUi.selectLibraryDefinition === 'function') {
      root.OluntirRepeatUi.selectLibraryDefinition(definition.definitionId);
    }
    const targetSelect = byId('oluntir-repeat-library-target-page');
    if (targetSelect && typeof targetSelect.focus === 'function') targetSelect.focus({ preventScroll: true });
    logger('repeat.library-insertion-started', { definitionId: definition.definitionId, displayName: definitionLabel(definition) });
    return true;
  }

  function prepareForPageNavigation(targetPageId) {
    const targetId = text(targetPageId);
    if (!targetId || targetId === WORKSPACE_PAGE_ID) return false;
    // Nur der zentrale Bearbeitungs-Workspace muss vor einem normalen
    // Seitenwechsel beendet werden. Ist kein Workspace aktiv, bleibt die
    // Repeat-Bibliothek unverändert offen (inkl. Einsetz-/Target-Zustand).
    if (!isEditorActive()) return true;
    return finishWorkspace({ hidePanel: true, reason: 'page-navigation', targetPageId: targetId });
  }

  function closeEditor() {
    const returnId = state.returnPageId;
    const closed = finishWorkspace({ hidePanel: false, reason: 'return-to-page', targetPageId: returnId });
    if (closed && returnId && typeof root.OluntirSelectPageById === 'function' && pageId(currentPage()) !== returnId) {
      root.OluntirSelectPageById(returnId);
    }
  }

  function pushHistory(entry) {
    state.history.push(entry);
    if (state.history.length > HISTORY_LIMIT) state.history.shift();
    state.redo = [];
    updateManagerState();
  }

  function restoreComponentSnapshot(record) {
    const access = adapterApi().create(state.editor);
    access.restoreByIdentity(record.instance.pageId, record.instance.rootIdentity, record.snapshot);
  }

  function undo() {
    const entry = state.history.pop();
    if (!entry) return false;
    return withProjectMutation(`undo:${entry.type}`, () => {
      try {
        if (entry.type === 'publish') {
          entry.before.forEach(restoreComponentSnapshot);
          engine().commitLibraryPublication(entry.definitionId, clone(entry.beforeDefinition.metadata || {}), entry.before.map(item => ({ instanceId: item.instance.instanceId, appliedRevision: item.instance.appliedRevision, appliedFingerprint: item.instance.appliedFingerprint, metadata: clone(item.instance.metadata || {}) })));
        } else if (entry.type === 'remove-instance') {
          restoreRemovedInstance(entry);
        }
        state.redo.push(entry);
        if (typeof root.OluntirPersistProjectSoon === 'function') root.OluntirPersistProjectSoon(0);
        refreshUi();
        updateManagerState();
        logger('repeat.library-undo', { type: entry.type, definitionId: entry.definitionId || null });
        return true;
      } catch (error) {
        state.history.push(entry);
        throw error;
      }
    });
  }

  function redo() {
    const entry = state.redo.pop();
    if (!entry) return false;
    return withProjectMutation(`redo:${entry.type}`, () => {
      try {
        if (entry.type === 'publish') {
          entry.after.forEach(restoreComponentSnapshot);
          engine().commitLibraryPublication(entry.definitionId, clone(entry.afterDefinition.metadata || {}), entry.after.map(item => ({ instanceId: item.instance.instanceId, appliedRevision: item.instance.appliedRevision, appliedFingerprint: item.instance.appliedFingerprint, metadata: clone(item.instance.metadata || {}) })));
        } else if (entry.type === 'remove-instance') {
          removeInstanceById(entry.instance.instanceId, { recordHistory: false });
        }
        state.history.push(entry);
        if (typeof root.OluntirPersistProjectSoon === 'function') root.OluntirPersistProjectSoon(0);
        refreshUi();
        updateManagerState();
        logger('repeat.library-redo', { type: entry.type, definitionId: entry.definitionId || null });
        return true;
      } catch (error) {
        state.redo.push(entry);
        throw error;
      }
    });
  }

  function insertionRecord(component, page) {
    const parent = component && typeof component.parent === 'function' ? component.parent() : null;
    const siblings = parent ? children(parent) : [];
    const index = siblings.indexOf(component);
    const parentDescription = parent && identities() && identities().describe ? identities().describe(parent, { page }) : null;
    return { parentIdentity: text(parentDescription && parentDescription.identity), index: Math.max(0, index) };
  }

  function removeInstanceById(instanceId, options) {
    const instance = engine() && engine().getInstance ? engine().getInstance(instanceId) : null;
    if (!instance) return false;
    const definition = definitionById(instance.definitionId);
    if (!definition) return false;
    const page = pageById(instance.pageId);
    const component = componentByIdentity(instance.pageId, instance.rootIdentity);
    if (!page || !component) return false;
    const snapshot = adapterApi().snapshot(component);
    const insertion = insertionRecord(component, page);
    const record = { type: 'remove-instance', definitionId: definition.definitionId, instance: clone(instance), snapshot, insertion, label: `„${definitionLabel(definition)}“ von „${pageName(page)}“ entfernt` };
    return withProjectMutation('remove-instance', () => {
      engine().removeInstance(instance.instanceId);
      if (typeof component.remove === 'function') component.remove();
      if (!options || options.recordHistory !== false) pushHistory(record);
      if (typeof root.OluntirPersistProjectSoon === 'function') root.OluntirPersistProjectSoon(0);
      logger('repeat.library-instance-removed', { definitionId: definition.definitionId, instanceId: instance.instanceId, pageId: instance.pageId, pageName: pageName(page) });
      refreshUi();
      return true;
    });
  }

  function restoreRemovedInstance(entry) {
    const page = pageById(entry.instance.pageId);
    if (!page) throw new Error('Zielseite für Undo nicht mehr vorhanden.');
    const parent = identities() && identities().findById ? identities().findById(page, entry.insertion.parentIdentity) : null;
    if (!parent || typeof parent.append !== 'function') throw new Error('Einfügeposition für Undo nicht mehr vorhanden.');
    const result = parent.append(clone(entry.snapshot), { at: entry.insertion.index });
    const component = Array.isArray(result) ? result[0] : result && result.models ? result.models[0] : result;
    if (!component) throw new Error('Repeat-Instanz konnte nicht wiederhergestellt werden.');
    if (identities()) identities().ensureAdded(component);
    const restoredIdentity = identities().describe(component, { page }).identity;
    const restored = engine().createInstance(entry.instance.definitionId, Object.assign({}, clone(entry.instance), { rootIdentity: restoredIdentity, instanceId: entry.instance.instanceId }));
    const definition = definitionById(restored.definitionId);
    ensureMarker(component, definition, restored);
    lockTree(component);
    entry.instance = clone(restored);
    return true;
  }

  function removeBinding(binding) {
    if (!binding || !binding.instance) return false;
    return removeInstanceById(binding.instance.instanceId, { recordHistory: true });
  }

  function openFromBinding(binding) {
    const definitionId = text(binding && binding.definition && binding.definition.definitionId) || text(binding && binding.definitionId);
    if (!definitionId) return false;
    const sourcePanel = byId('oluntir-repeat-panel');
    if (sourcePanel) sourcePanel.hidden = true;
    const panel = byId('oluntir-repeat-library-panel');
    if (panel) panel.hidden = false;
    refreshUi();
    return openEditor(definitionId);
  }

  function publishedSnapshot(definitionId) {
    const definition = ensureDefinition(definitionById(definitionId));
    return clone(libraryMeta(definition).publishedSnapshot);
  }

  function createMaterializedInstance(definitionId, page, parent, at) {
    const definition = ensureDefinition(definitionById(definitionId));
    if (!definition) throw new Error('Repeat-Definition nicht gefunden.');
    const sourceSnapshot = publishedSnapshot(definition.definitionId);
    if (!sourceSnapshot) throw new Error('Zentrale Repeat-Quelle besitzt keinen veröffentlichten Inhalt.');
    if (!parent || typeof parent.append !== 'function') throw new Error('Zielposition ist nicht verfügbar.');
    return withProjectMutation('insert-instance', () => {
      const result = parent.append(clone(sourceSnapshot), { at });
      const component = Array.isArray(result) ? result[0] : result && result.models ? result.models[0] : result;
      if (!component) throw new Error('Wiederholbarer Bereich konnte nicht eingesetzt werden.');
      identities().ensureAdded(component);
      const rootIdentity = identities().describe(component, { page }).identity;
      const meta = libraryMeta(definition);
      const instance = engine().createInstance(definition.definitionId, {
        pageId: pageId(page), rootIdentity,
        correlationId: definition.correlationId || definition.definitionId,
        appliedRevision: meta.publishedRevision || 1,
        appliedFingerprint: fingerprint(sourceSnapshot),
        metadata: { insertedBy: 'repeat-library-manager', centralLibraryMode: true, sourceIdentity: definition.source.rootIdentity, mappingProperty: SOURCE_MAPPING }
      });
      ensureMarker(component, definition, instance);
      lockTree(component);
      refreshUi();
      return { component, instance, identity: rootIdentity };
    });
  }

  function bind(editor) {
    if (!editor || state.initialized) return false;
    state.editor = editor;
    state.initialized = true;
    const bootstrap = () => root.setTimeout(initializeProject, 0);
    editor.on('load', bootstrap);
    editor.on('page:select', page => {
      // Sicherheitsnetz für Seitenwechsel, die GrapesJS oder andere Oluntir-
      // Werkzeuge direkt auslösen und damit OluntirSelectPageById umgehen.
      // Sobald eine echte Projektseite gewählt wird, darf kein temporärer
      // Repeat-Workspace im Hintergrund aktiv bleiben.
      if (!state.workspaceClosing && state.workspaceRoot && page && !isWorkspacePage(page)) {
        finishWorkspace({ hidePanel: true, reason: 'external-page-select', targetPageId: pageId(page) });
      }
    });
    editor.on('oluntir:repeat:changed', () => { if (!state.applying) refreshUi(); });
    ['component:update', 'component:styleUpdate', 'component:add', 'component:remove'].forEach(eventName => {
      editor.on(eventName, component => {
        if (state.workspaceRoot && componentInsideWorkspace(component)) scheduleDraftCapture();
      });
    });
    root.setTimeout(initializeProject, 0);
    return true;
  }

  function attachUi() {
    const doc = root.document;
    if (!doc) return;
    const publish = byId('oluntir-repeat-manager-publish');
    const discard = byId('oluntir-repeat-manager-discard');
    const close = byId('oluntir-repeat-manager-return');
    const undoButton = byId('oluntir-repeat-manager-undo');
    const redoButton = byId('oluntir-repeat-manager-redo');
    const catalogSortRecent = byId('oluntir-repeat-library-sort-recent');
    const catalogSortAlpha = byId('oluntir-repeat-library-sort-alpha');
    const catalogExpand = byId('oluntir-repeat-library-expand');
    if (publish) publish.addEventListener('click', () => { try { publishActive(); } catch (error) { root.alert && root.alert(error.message || String(error)); } });
    if (discard) discard.addEventListener('click', () => { try { discardDraft(); } catch (error) { root.alert && root.alert(error.message || String(error)); } });
    if (close) close.addEventListener('click', closeEditor);
    if (undoButton) undoButton.addEventListener('click', () => { try { undo(); } catch (error) { root.alert && root.alert(error.message || String(error)); } });
    if (redoButton) redoButton.addEventListener('click', () => { try { redo(); } catch (error) { root.alert && root.alert(error.message || String(error)); } });
    if (catalogSortRecent) catalogSortRecent.addEventListener('click', () => { state.catalogSort = 'recent'; refreshUi(); });
    if (catalogSortAlpha) catalogSortAlpha.addEventListener('click', () => { state.catalogSort = 'alpha'; refreshUi(); });
    if (catalogExpand) catalogExpand.addEventListener('click', () => {
      state.catalogExpanded = !state.catalogExpanded;
      updateCatalogControls(explicitDefinitions().length);
    });
  }

  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', attachUi, { once: true });
    else attachUi();
  }

  return Object.freeze({
    WORKSPACE_PAGE_ID,
    bind,
    initializeProject,
    refreshUi,
    openEditor,
    openFromBinding,
    closeEditor,
    prepareForPageNavigation,
    prepareForInsertionNavigation,
    beginInsertion,
    publishActive,
    discardDraft,
    publishedSnapshot,
    createMaterializedInstance,
    removeBinding,
    removeInstanceById,
    undo,
    redo,
    usage,
    isWorkspacePage,
    isEditorActive,
    isProjectMutationActive,
    noteSharedStructuralEventSuppressed,
    usesManualPublishing: () => true,
    getState: () => clone({
      activeDefinitionId: state.activeDefinitionId,
      returnPageId: state.returnPageId,
      historyCount: state.history.length,
      redoCount: state.redo.length,
      projectMutationActive: isProjectMutationActive(),
      projectMutationKind: state.projectMutation && state.projectMutation.kind || '',
      suppressedSharedStructuralEvents: state.projectMutation && state.projectMutation.suppressedSharedStructuralEvents || 0,
      catalogSort: state.catalogSort,
      catalogExpanded: state.catalogExpanded
    })
  });
});

(function (root) {
  'use strict';
  let timer = 0;
  let graph = null;
  let lastSnapshot = null;
  const $ = id => document.getElementById(id);
  const json = value => JSON.stringify(value, null, 2);
  function editor() { return root.OluntirEditor || null; }
  function engine() { return root.OluntirRuntimeActions && root.OluntirRuntimeActions.getEngine ? root.OluntirRuntimeActions.getEngine() : null; }
  function runtimeSnapshot() {
    const ed = editor();
    const pages = ed && ed.Pages && ed.Pages.getAll ? ed.Pages.getAll() : [];
    const selected = ed && ed.Pages && ed.Pages.getSelected ? ed.Pages.getSelected() : null;
    const memory = root.performance && root.performance.memory ? {
      usedJSHeapSize: root.performance.memory.usedJSHeapSize,
      totalJSHeapSize: root.performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: root.performance.memory.jsHeapSizeLimit
    } : null;
    return { timestamp: new Date().toISOString(), editorReady: Boolean(ed), pageCount: pages.length || 0,
      selectedPageId: selected && selected.getId ? selected.getId() : null,
      logging: root.OluntirLogger ? root.OluntirLogger.getState() : null,
      exportReadiness: root.OluntirExportReadiness && root.OluntirExportReadiness.getState ? root.OluntirExportReadiness.getState() : null, memory };
  }
  function actionSnapshot() {
    const value = engine();
    return value ? { state: value.getState(), metrics: value.getMetrics(), queue: value.getQueueState(), actions: value.listActions().length, handlers: value.listHandlers().length } : { initialized: false };
  }
  function sharedSnapshot() {
    return root.OluntirSharedContentManager && root.OluntirSharedContentManager.getDiagnostics ? root.OluntirSharedContentManager.getDiagnostics() : { available: false };
  }

  function repeatSnapshot() {
    const ed = editor();
    const repeat = root.OluntirRepeatEngineV2;
    const resolver = root.OluntirRepeatContractResolver;
    const graphApi = root.OluntirRepeatDependencyGraph;
    const auto = root.OluntirRepeatAutoSynchronization;
    const runtime = root.OluntirRepeatSynchronizationRuntime;
    if (!repeat || !ed) return { available: false };
    const definitions = repeat.getDefinitions ? repeat.getDefinitions() : [];
    const instances = repeat.getInstances ? repeat.getInstances() : [];
    const autoDiag = auto && auto.getDiagnostics ? auto.getDiagnostics() : { definitions: [] };
    const dirtyById = new Map((autoDiag.definitions || []).map(item => [item.definitionId, item]));
    let resolved = null;
    let graph = null;
    try { resolved = resolver && resolver.resolveProject ? resolver.resolveProject(ed) : null; } catch (error) { resolved = { valid: false, issues: [{ code: error.code || 'REPEAT_DIAGNOSTICS_RESOLVE_FAILED', message: error.message }] }; }
    try { graph = graphApi && graphApi.buildProject ? graphApi.buildProject(ed).snapshot() : null; } catch (error) { graph = { valid: false, issues: [{ code: error.code || 'REPEAT_DIAGNOSTICS_GRAPH_FAILED', message: error.message }] }; }
    const resolvedById = new Map(((resolved && resolved.definitions) || []).map(item => [item.definition && item.definition.definitionId, item]));
    return {
      available: true,
      definitionCount: definitions.length,
      instanceCount: instances.length,
      autoSynchronization: autoDiag,
      runtime: runtime && runtime.getDiagnostics ? runtime.getDiagnostics() : (runtime && runtime.getState ? { state: runtime.getState(), transactions: [] } : null),
      graph: graph ? { valid: graph.valid, nodeCount: graph.nodeCount, edgeCount: graph.edgeCount, cycleCount: graph.cycleCount, issues: graph.issues || [] } : null,
      definitions: definitions.map(definition => {
        const resolvedItem = resolvedById.get(definition.definitionId);
        const definitionInstances = instances.filter(instance => instance.definitionId === definition.definitionId);
        const dirty = dirtyById.get(definition.definitionId) || null;
        return {
          definitionId: definition.definitionId,
          repeatKey: definition.repeatKey,
          policy: definition.synchronizationPolicy,
          source: definition.source,
          valid: resolvedItem ? resolvedItem.resolved === true : null,
          issueCount: resolvedItem && resolvedItem.issues ? resolvedItem.issues.length : 0,
          instanceCount: definitionInstances.length,
          instances: definitionInstances.map(instance => ({ instanceId: instance.instanceId, pageId: instance.pageId, rootIdentity: instance.rootIdentity, status: instance.status })),
          dirty: dirty
        };
      })
    };
  }
  function selectedRepeatDefinitionId() {
    const select = $('oluntir-diagnostics-repeat-definition');
    return select ? String(select.value || '').trim() : '';
  }
  function populateRepeatDefinitions(snapshot) {
    const select = $('oluntir-diagnostics-repeat-definition');
    if (!select) return;
    const previous = select.value;
    select.textContent = '';
    const empty = document.createElement('option'); empty.value=''; empty.textContent='Repeat-Definition wählen'; select.appendChild(empty);
    ((snapshot && snapshot.definitions) || []).forEach(item => { const option=document.createElement('option'); option.value=item.definitionId; option.textContent=item.repeatKey || item.definitionId; select.appendChild(option); });
    if (previous && Array.from(select.children || []).some(option => option.value === previous)) select.value = previous;
  }
  function repeatToolsResult(value) {
    const host = $('oluntir-diagnostics-repeat-result');
    if (host) host.textContent = json(value);
  }
  function repeatPlan(definitionId) {
    const ed=editor(), contracts=root.OluntirRepeatActionContracts;
    if (!definitionId || !ed || !contracts) throw new Error('Repeat-Definition oder Verträge fehlen.');
    return contracts.createPlan(ed,{reference:definitionId,definitionId});
  }
  function repeatDryRun() {
    try {
      const definitionId=selectedRepeatDefinitionId();
      const plan=repeatPlan(definitionId);
      const sync=root.OluntirTargetedSynchronizationService, adapterApi=root.OluntirRepeatSyncAccessAdapter;
      if (!sync || !adapterApi) throw new Error('Targeted Sync Service oder Adapter fehlt.');
      repeatToolsResult(sync.create().dryRun(plan,adapterApi.create(editor())));
    } catch(error) { repeatToolsResult({error:{code:error.code||'REPEAT_DIAGNOSTICS_DRY_RUN_FAILED',message:error.message}}); }
  }
  function repeatShowPlan() { try { repeatToolsResult(repeatPlan(selectedRepeatDefinitionId())); } catch(error) { repeatToolsResult({error:{code:error.code||'REPEAT_DIAGNOSTICS_PLAN_FAILED',message:error.message}}); } }
  async function repeatForceSync() {
    try { const definitionId=selectedRepeatDefinitionId(); if(!definitionId) throw new Error('Repeat-Definition fehlt.'); repeatToolsResult(await root.OluntirRepeatEngineV2.apply(definitionId)); refresh(false); }
    catch(error){ repeatToolsResult({error:{code:error.code||'REPEAT_DIAGNOSTICS_SYNC_FAILED',message:error.message}}); }
  }

  function graphSnapshot(build) {
    if (build) {
      const ed = editor();
      if (ed && root.OluntirDependencyGraph) graph = root.OluntirDependencyGraph.buildProject(ed);
    }
    if (!graph) return { built: false, note: 'Graph wird nur auf ausdrücklichen Klick analysiert.' };
    const snap = graph.snapshot();
    return { built: snap.built, nodeCount: snap.nodeCount, edgeCount: snap.edgeCount, dirty: graph.resolve() };
  }
  function logsSnapshot() { return root.OluntirLogger ? root.OluntirLogger.entries().slice(-100) : []; }
  function renderLogs(entries) {
    const host = $('oluntir-diagnostics-logs');
    host.textContent = '';
    entries.slice().reverse().forEach(entry => {
      const row = document.createElement('div'); row.className = 'oluntir-diagnostics-log-row'; row.dataset.level = entry.level;
      [entry.timestamp, entry.level, entry.category, entry.message].forEach(value => { const span=document.createElement('span'); span.textContent=String(value||''); row.appendChild(span); });
      host.appendChild(row);
    });
    if (!entries.length) host.textContent = 'Keine Einträge im Ringpuffer.';
  }
  function collect(buildGraph) {
    lastSnapshot = { schemaVersion: 2, runtime: runtimeSnapshot(), actionEngine: actionSnapshot(), sharedContent: sharedSnapshot(), repeat: repeatSnapshot(), dependencyGraph: graphSnapshot(buildGraph), logs: logsSnapshot() };
    return lastSnapshot;
  }
  function refresh(buildGraph) {
    const snap = collect(Boolean(buildGraph));
    $('oluntir-diagnostics-runtime').textContent = json(snap.runtime);
    $('oluntir-diagnostics-actions').textContent = json(snap.actionEngine);
    $('oluntir-diagnostics-shared').textContent = json(snap.sharedContent);
    $('oluntir-diagnostics-repeat').textContent = json(snap.repeat);
    populateRepeatDefinitions(snap.repeat);
    $('oluntir-diagnostics-dependency').textContent = json(snap.dependencyGraph);
    renderLogs(snap.logs);
    $('oluntir-diagnostics-status').textContent = 'Aktualisiert: ' + new Date().toLocaleTimeString();
  }
  function stopLive(){ if(timer) root.clearInterval(timer); timer=0; }
  function startLive(){ stopLive(); if($('oluntir-diagnostics-live').checked) timer=root.setInterval(()=>refresh(false),1000); }
  function open(){ const modal=$('oluntir-diagnostics-modal'); modal.hidden=false; modal.setAttribute('aria-hidden','false'); refresh(false); startLive(); if(root.OluntirLogger) root.OluntirLogger.info('session','Developer Diagnostics Center opened',{}); }
  function close(){ stopLive(); const modal=$('oluntir-diagnostics-modal'); modal.hidden=true; modal.setAttribute('aria-hidden','true'); }
  function exportSnapshot(){ const data=json(lastSnapshot||collect(false)); const blob=new Blob([data],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='oluntir-diagnostics-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),0); }
  function bind(){
    const openButton=$('oluntir-diagnostics-open'); if(!openButton) return;
    openButton.addEventListener('click',open); $('oluntir-diagnostics-close').addEventListener('click',close); $('oluntir-diagnostics-done').addEventListener('click',close);
    $('oluntir-diagnostics-refresh').addEventListener('click',()=>refresh(false)); $('oluntir-diagnostics-graph').addEventListener('click',()=>refresh(true));
    $('oluntir-diagnostics-live').addEventListener('change',startLive); $('oluntir-diagnostics-export').addEventListener('click',exportSnapshot);
    $('oluntir-diagnostics-repeat-plan').addEventListener('click',repeatShowPlan); $('oluntir-diagnostics-repeat-dry-run').addEventListener('click',repeatDryRun); $('oluntir-diagnostics-repeat-sync').addEventListener('click',repeatForceSync);
    $('oluntir-diagnostics-clear').addEventListener('click',()=>{ if(root.OluntirLogger) root.OluntirLogger.clear(); refresh(false); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind,{once:true}); else bind();
  root.OluntirDiagnostics = Object.freeze({ open, close, refresh, collect });
})(window);

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTemplateJavaScriptActivationPlanner = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const PLANNER_VERSION = '2.3.0';
  const SAFE_OPTIONAL_UNRESOLVED = new Set(['explicit-selector-not-found-in-primary-html']);
  const BLOCKING_SOURCE_PATTERNS = [
    { id: 'network', re: /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/, reason: 'network-capability-in-template-custom-script' },
    { id: 'dynamic-code', re: /\beval\s*\(|\bnew\s+Function\s*\(/, reason: 'dynamic-code-execution' },
    { id: 'document-write', re: /\bdocument\s*\.\s*(?:write|writeln)\s*\(/, reason: 'document-stream-mutation' },
    { id: 'cross-frame', re: /\bwindow\s*\.\s*(?:parent|top|opener)\b|\b(?:parent|top|opener)\s*\.\s*(?:document|location)\b/, reason: 'cross-frame-access' },
    { id: 'persistent-browser-state', re: /\b(?:localStorage|sessionStorage|indexedDB)\b|\bdocument\s*\.\s*cookie\b/, reason: 'persistent-browser-state-access' },
    { id: 'navigation', re: /\b(?:window\s*\.\s*)?location\s*(?:\.\s*href)?\s*=|\bwindow\s*\.\s*open\s*\(/, reason: 'navigation-side-effect' },
    { id: 'dynamic-import', re: /\bimport\s*\(/, reason: 'dynamic-import-not-controlled' },
    { id: 'worker', re: /\b(?:Worker|SharedWorker)\s*\(|\bserviceWorker\b/, reason: 'background-execution-capability' }
  ];

  function text(value) { return String(value == null ? '' : value); }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function unique(values) { return Array.from(new Set((values || []).filter(Boolean))); }
  function normalizeLibraryId(value) { return text(value).toLowerCase().replace(/[^a-z0-9]+/g, ''); }
  function escapeRegExp(value) { return text(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function sourceForScript(files, path) {
    const file = (files || []).find(item => item && item.path === path);
    return text(file && file.content);
  }

  function sourceRisks(source) {
    const value = text(source);
    return BLOCKING_SOURCE_PATTERNS.filter(item => item.re.test(value)).map(item => ({ id: item.id, reason: item.reason }));
  }

  function libraryMentioned(source, libraryId) {
    const id = text(libraryId).trim();
    if (!id) return false;
    const segments = id.split(/[^A-Za-z0-9]+/).filter(Boolean).map(escapeRegExp);
    if (!segments.length) return false;
    const compact = segments.join('[-_.\\s]*');
    const pattern = new RegExp(`(?:^|[^A-Za-z0-9])${compact}(?:[^A-Za-z0-9]|$)`, 'i');
    return pattern.test(text(source));
  }

  function usesJQuery(source) {
    return /\bjQuery\b|(?:^|[^\w$])\$\s*\(/m.test(text(source));
  }

  function groupedBindings(runtimePlan) {
    const all = [];
    const behaviors = runtimePlan && runtimePlan.behaviors || {};
    ['section','global','helper','unresolved'].forEach(group => (behaviors[group] || []).forEach(item => all.push(item)));
    const map = new Map();
    all.forEach(item => {
      if (!map.has(item.script)) map.set(item.script, []);
      map.get(item.script).push(item);
    });
    return map;
  }

  function scriptMap(manifest) {
    return new Map((manifest && manifest.scripts || []).map(script => [script.path, script]));
  }

  function orderedMap(runtimePlan) {
    return new Map((runtimePlan && runtimePlan.scripts && runtimePlan.scripts.ordered || []).map(item => [item.script, item]));
  }


  function activationOrder(enabledPaths, dependencyEdges, orderedRecords) {
    const ids = unique(enabledPaths);
    const idSet = new Set(ids);
    const baseOrder = new Map((orderedRecords || []).map((item, index) => [item.script, Number(item.order || index + 1)]));
    const incoming = new Map(ids.map(id => [id, 0]));
    const outgoing = new Map(ids.map(id => [id, []]));
    const seen = new Set();
    for (const edge of dependencyEdges || []) {
      if (!idSet.has(edge.from) || !idSet.has(edge.to) || edge.from === edge.to) continue;
      const key = `${edge.from}\0${edge.to}`;
      if (seen.has(key)) continue;
      seen.add(key);
      outgoing.get(edge.from).push(edge.to);
      incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1);
    }
    const sortReady = list => list.sort((a, b) => (baseOrder.get(a) || 999999) - (baseOrder.get(b) || 999999) || a.localeCompare(b));
    const ready = sortReady(ids.filter(id => incoming.get(id) === 0));
    const result = [];
    while (ready.length) {
      const current = ready.shift();
      result.push(current);
      for (const next of outgoing.get(current) || []) {
        incoming.set(next, incoming.get(next) - 1);
        if (incoming.get(next) === 0) { ready.push(next); sortReady(ready); }
      }
    }
    if (result.length !== ids.length) {
      const remaining = ids.filter(id => !result.includes(id));
      sortReady(remaining);
      result.push(...remaining);
    }
    return result;
  }

  function customDecision(script, runtimeRecord, bindings, source) {
    const risks = sourceRisks(source);
    const eligible = (bindings || []).filter(item => item.executionEligible);
    const unresolved = (bindings || []).filter(item => item.classification === 'unresolved');
    const unsafeUnresolved = unresolved.filter(item => !SAFE_OPTIONAL_UNRESOLVED.has(item.runtimeReason));
    const reasons = [];
    if (!script || script.sourceKind !== 'file' || script.inline) reasons.push('not-a-local-script-file');
    if (script && script.module) reasons.push('module-script-activation-deferred');
    if (!eligible.length) reasons.push('no-high-confidence-runtime-behavior');
    if (risks.length) reasons.push(...risks.map(item => item.reason));
    if (unsafeUnresolved.length) reasons.push('unresolved-runtime-behavior');
    const enabled = reasons.length === 0;
    return {
      enabled,
      reasons,
      risks,
      eligibleBindingIds: eligible.map(item => item.bindingId),
      optionalUnresolvedBindingIds: unresolved.filter(item => SAFE_OPTIONAL_UNRESOLVED.has(item.runtimeReason)).map(item => item.bindingId),
      confidence: enabled ? Math.min(...eligible.map(item => Number(item.runtimeConfidence || 0.65))) : 0,
      disposition: runtimeRecord && runtimeRecord.disposition || null
    };
  }

  function plan(manifest, runtimePlan, files, options) {
    if (!manifest || manifest.kind !== 'oluntir-template-javascript-behavior-manifest') throw new Error('Ungültiges JavaScript-Behavior-Manifest.');
    if (!runtimePlan || runtimePlan.kind !== 'oluntir-template-javascript-runtime-plan') throw new Error('Ungültiger JavaScript-Runtime-Plan.');
    const settings = options || {};
    const framework = settings.framework || runtimePlan.framework || manifest.framework || {};
    const scriptsByPath = scriptMap(manifest);
    const orderedByPath = orderedMap(runtimePlan);
    const bindingsByScript = groupedBindings(runtimePlan);
    const edges = runtimePlan.scripts && runtimePlan.scripts.dependencyEdges || [];
    const ordered = runtimePlan.scripts && runtimePlan.scripts.ordered || [];
    const enabled = new Set();
    const customEnabled = new Set();
    const baseProvided = new Set();
    const reasons = new Map();
    const customDecisions = [];
    const activationEdges = (edges || []).map(clone);

    function addReason(path, reason) {
      if (!reasons.has(path)) reasons.set(path, []);
      if (!reasons.get(path).includes(reason)) reasons.get(path).push(reason);
    }

    // 1. Only template-owned custom files with high-confidence mapped behaviors
    // are eligible to trigger automatic source activation.
    for (const runtimeRecord of ordered) {
      const script = scriptsByPath.get(runtimeRecord.script);
      if (!script || script.role !== 'template-custom') continue;
      const source = sourceForScript(files, script.path);
      const decision = customDecision(script, runtimeRecord, bindingsByScript.get(script.path) || [], source);
      customDecisions.push(Object.assign({ script: script.path, runtimePath: script.runtimePath }, decision));
      if (decision.enabled) {
        enabled.add(script.path);
        customEnabled.add(script.path);
        addReason(script.path, 'policy-approved-template-custom-script');
      }
    }

    function includeDependency(path, consumer, reason) {
      const runtimeRecord = orderedByPath.get(path);
      const script = scriptsByPath.get(path);
      if (!runtimeRecord || !script || script.scope !== 'primary' || script.sourceKind !== 'file' || script.inline) return false;
      if (/overlap$/.test(runtimeRecord.disposition || '')) {
        baseProvided.add(path);
        addReason(path, `provided-by-base:${consumer || 'template'}`);
        return false;
      }
      if (script.module) {
        addReason(path, 'module-dependency-deferred');
        return false;
      }
      enabled.add(path);
      addReason(path, reason || `dependency-of:${consumer || 'template'}`);
      return true;
    }

    // 2. Follow explicit/provider dependency edges backwards from approved
    // custom scripts. Dependencies are local primary files only.
    let changed = true;
    while (changed) {
      changed = false;
      for (const edge of edges) {
        if (!enabled.has(edge.to)) continue;
        const before = enabled.size + baseProvided.size;
        includeDependency(edge.from, edge.to, `${edge.kind || 'dependency'}:${edge.to}`);
        if (enabled.size + baseProvided.size > before) changed = true;
      }
    }

    // 3. Generic library-symbol correlation closes gaps where a vendor library
    // exposes a constructor/global but the static dependency graph cannot prove
    // the edge (for example compact/minified providers). No library name is
    // hard-coded here; the detected library id is matched against custom source.
    for (const customPath of customEnabled) {
      const source = sourceForScript(files, customPath);
      for (const runtimeRecord of ordered) {
        if (!runtimeRecord.library || runtimeRecord.script === customPath) continue;
        if (!libraryMentioned(source, runtimeRecord.library)) continue;
        includeDependency(runtimeRecord.script, customPath, `library-symbol-reference:${customPath}`);
        activationEdges.push({ from: runtimeRecord.script, to: customPath, kind: 'inferred-library-symbol', detail: runtimeRecord.library, confidence: 0.8 });
      }
      const jqueryRecord = ordered.find(item => item.library === 'jquery');
      if (usesJQuery(source) && jqueryRecord) {
        if (framework.baseFramework === 'bs4') {
          baseProvided.add(jqueryRecord.script);
          addReason(jqueryRecord.script, `jquery-provided-by-bs4:${customPath}`);
        } else {
          includeDependency(jqueryRecord.script, customPath, `jquery-required-by:${customPath}`);
          activationEdges.push({ from: jqueryRecord.script, to: customPath, kind: 'inferred-jquery-runtime', detail: 'jquery', confidence: 0.95 });
        }
      }
    }

    // 4. jQuery-style plugin providers require jQuery even if a minified plugin
    // did not expose a machine-readable import edge.
    const jqueryRecord = ordered.find(item => item.library === 'jquery');
    if (jqueryRecord) {
      for (const path of Array.from(enabled)) {
        const script = scriptsByPath.get(path);
        const jqueryProvider = script && (script.providers || []).some(provider => provider.kind === 'jquery-plugin');
        const jquerySource = script && usesJQuery(sourceForScript(files, path));
        if (!jqueryProvider && !jquerySource) continue;
        if (framework.baseFramework === 'bs4') {
          baseProvided.add(jqueryRecord.script);
          addReason(jqueryRecord.script, `jquery-provided-by-bs4:${path}`);
        } else {
          includeDependency(jqueryRecord.script, path, `jquery-required-by:${path}`);
          activationEdges.push({ from: jqueryRecord.script, to: path, kind: 'inferred-jquery-plugin-runtime', detail: 'jquery', confidence: 0.95 });
        }
      }
    }

    const enabledOrder = activationOrder(Array.from(enabled), activationEdges, ordered);
    const enabledRecords = enabledOrder.map(path => orderedByPath.get(path)).filter(Boolean).map(item => Object.assign({}, clone(item), {
      executionEnabled: true,
      activationReason: clone(reasons.get(item.script) || [])
    }));
    const baseRecords = ordered.filter(item => baseProvided.has(item.script)).map(item => Object.assign({}, clone(item), {
      executionEnabled: false,
      activationReason: clone(reasons.get(item.script) || [])
    }));

    const blocked = [];
    customDecisions.filter(item => !item.enabled).forEach(item => blocked.push({
      script: item.script,
      runtimePath: item.runtimePath,
      role: 'template-custom',
      reasons: item.reasons.slice(),
      risks: clone(item.risks || [])
    }));
    (manifest.scripts || []).filter(script => script.scope === 'primary' && script.inline).forEach(script => blocked.push({
      script: script.path, runtimePath: null, role: script.role, reasons: ['inline-script-activation-deferred'], risks: []
    }));
    (manifest.scripts || []).filter(script => script.scope === 'primary' && script.sourceKind === 'external').forEach(script => blocked.push({
      script: script.path, runtimePath: script.path, role: script.role, reasons: ['external-script-activation-disabled'], risks: []
    }));

    const enabledBindingIds = unique(customDecisions.filter(item => item.enabled).flatMap(item => item.eligibleBindingIds || []));
    const coLocatedOptionalUnresolved = unique(customDecisions.filter(item => item.enabled).flatMap(item => item.optionalUnresolvedBindingIds || []));
    const enabledRuntimePaths = enabledRecords.map(item => item.runtimePath).filter(Boolean);
    const skipped = ordered.filter(item => !enabled.has(item.script) && !baseProvided.has(item.script) && !blocked.some(block => block.script === item.script)).map(item => ({
      script: item.script,
      runtimePath: item.runtimePath,
      role: item.role,
      library: item.library,
      reason: 'not-required-by-approved-template-runtime'
    }));

    return {
      kind: 'oluntir-template-javascript-activation-plan',
      schemaVersion: SCHEMA_VERSION,
      plannerVersion: PLANNER_VERSION,
      framework: clone(framework),
      policy: {
        sourceExecution: enabledRuntimePaths.length > 0,
        automaticActivation: 'policy-gated',
        executionScope: 'grapesjs-canvas',
        coreMutation: false,
        baseFrameworkDuplication: false,
        externalScriptsEnabled: false,
        inlineScriptsEnabled: false,
        moduleScriptsEnabled: false,
        highRiskTemplateCustomScriptsEnabled: false,
        step: '4c-controlled-file-activation'
      },
      summary: {
        customScriptCandidates: customDecisions.length,
        enabledCustomScripts: enabledRecords.filter(item => item.role === 'template-custom').length,
        enabledDependencyScripts: enabledRecords.filter(item => item.role !== 'template-custom').length,
        enabledScriptFiles: enabledRecords.length,
        baseProvidedScriptFiles: baseRecords.length,
        blockedScriptFiles: customDecisions.filter(item => !item.enabled).length,
        deferredInlineScripts: blocked.filter(item => item.reasons.includes('inline-script-activation-deferred')).length,
        deferredExternalScripts: blocked.filter(item => item.reasons.includes('external-script-activation-disabled')).length,
        blockedUnits: blocked.length,
        skippedScriptFiles: skipped.length,
        enabledBehaviorBindings: enabledBindingIds.length,
        coLocatedOptionalUnresolvedBindings: coLocatedOptionalUnresolved.length
      },
      execution: {
        enabledRuntimePaths,
        enabledScripts: enabledRecords,
        enabledBindingIds,
        coLocatedOptionalUnresolvedBindingIds: coLocatedOptionalUnresolved,
        baseProvided: baseRecords,
        blocked,
        skipped,
        dependencyEdges: activationEdges.filter(edge => enabled.has(edge.from) && enabled.has(edge.to))
      },
      customDecisions
    };
  }

  return Object.freeze({
    SCHEMA_VERSION,
    PLANNER_VERSION,
    plan,
    sourceRisks,
    libraryMentioned,
    usesJQuery,
    activationOrder
  });
});

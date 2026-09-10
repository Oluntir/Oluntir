(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTemplateJavaScriptRuntimePlanner = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const PLANNER_VERSION = '2.3.0';
  const GLOBAL_EVENTS = new Set([
    'load','unload','beforeunload','pageshow','pagehide','resize','orientationchange','scroll',
    'hashchange','popstate','online','offline','visibilitychange','readystatechange'
  ]);
  const GLOBAL_SELECTORS = new Set(['window','document','html','body','html,body','body,html','html, body','body, html']);
  const SIDE_EFFECT_KINDS = new Set(['network']);
  const HELPER_BEHAVIORS = new Set(['dom-binding','data-driven']);

  function text(value) { return String(value == null ? '' : value); }
  function unique(values) { return Array.from(new Set((values || []).filter(Boolean))); }
  function normalizeSelector(value) { return text(value).trim().replace(/\s+/g, ' ').toLowerCase(); }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function mean(values) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : Number.POSITIVE_INFINITY; }

  function isGlobalSelector(selector) {
    const normalized = normalizeSelector(selector);
    if (!normalized) return false;
    if (GLOBAL_SELECTORS.has(normalized)) return true;
    return normalized.split(',').map(part => part.trim()).filter(Boolean).every(part => GLOBAL_SELECTORS.has(part));
  }

  function pageCoverage(binding, primaryCount) {
    if (!primaryCount) return 0;
    return Math.min(1, ((binding && binding.pages) || []).length / primaryCount);
  }

  function mappedToSection(binding) {
    return Boolean((binding.familyIds || []).length || (binding.regionIds || []).length);
  }

  function bindingDistance(a, b) {
    const ao = a && a.source && Number(a.source.offset);
    const bo = b && b.source && Number(b.source.offset);
    if (!Number.isFinite(ao) || !Number.isFinite(bo)) return Number.POSITIVE_INFINITY;
    return Math.abs(ao - bo);
  }

  function contextCandidate(binding, sameScriptBindings) {
    if (!binding || mappedToSection(binding) || isGlobalSelector(binding.selector)) return null;
    let best = null;
    for (const candidate of sameScriptBindings || []) {
      if (!candidate || candidate.bindingId === binding.bindingId) continue;
      const section = mappedToSection(candidate);
      const global = !section && (isGlobalSelector(candidate.selector) || ((candidate.pages || []).length >= 2 && (candidate.regionIds || []).length === 0 && (candidate.familyIds || []).length === 0));
      if (!section && !global) continue;
      const distance = bindingDistance(binding, candidate);
      if (!Number.isFinite(distance) || distance > 3200) continue;
      const semanticWeight = candidate.behavior && candidate.behavior !== 'dom-binding' ? 0 : 300;
      const score = distance + semanticWeight;
      if (!best || score < best.score) best = { binding: candidate, distance, score, classification: section ? 'section' : 'global' };
    }
    return best;
  }

  function classifyBinding(binding, context) {
    const primaryCount = context.primaryDocumentCount || 0;
    const coverage = pageCoverage(binding, primaryCount);

    if (SIDE_EFFECT_KINDS.has(binding.kind)) {
      return { classification: 'unresolved', role: 'side-effect', confidence: 0.3, reason: 'side-effect-requires-explicit-runtime-policy', blocked: true };
    }

    // Pure DOM references and data reads are evidence/configuration, not executable
    // behaviors on their own. Keep their HTML context, but never promote them to
    // automatic runtime behavior merely because they are close to a plugin call.
    if (HELPER_BEHAVIORS.has(binding.behavior)) {
      const inferred = mappedToSection(binding) ? null : contextCandidate(binding, context.sameScriptBindings || []);
      return {
        classification: 'helper',
        role: binding.behavior === 'data-driven' ? 'configuration' : 'dom-reference',
        confidence: mappedToSection(binding) ? Math.max(0.65, Number(binding.confidence || 0.65)) : inferred ? 0.5 : 0.4,
        reason: mappedToSection(binding) ? 'helper-with-direct-html-context' : inferred ? 'helper-near-runtime-context' : 'static-helper-without-runtime-target',
        inheritedFrom: inferred && inferred.binding.bindingId || null,
        inheritedFamilies: inferred && clone(inferred.binding.familyIds || []) || null,
        inheritedRegions: inferred && clone(inferred.binding.regionIds || []) || null,
        inheritedPages: inferred && clone(inferred.binding.pages || []) || null
      };
    }

    const directSection = mappedToSection(binding);
    if (directSection) {
      return {
        classification: 'section',
        role: binding.event ? 'event' : 'behavior',
        confidence: Math.max(0.7, Number(binding.confidence || 0.7)),
        reason: 'direct-html-section-mapping'
      };
    }

    if (isGlobalSelector(binding.selector)) {
      return {
        classification: 'global',
        role: binding.event ? 'event' : 'behavior',
        confidence: Math.max(0.75, Number(binding.confidence || 0.75)),
        reason: 'global-dom-target'
      };
    }

    if (binding.event && GLOBAL_EVENTS.has(text(binding.event).toLowerCase())) {
      return { classification: 'global', role: 'event', confidence: 0.72, reason: 'global-lifecycle-event' };
    }

    if (coverage >= 0.5 && !(binding.regionIds || []).length && !(binding.familyIds || []).length) {
      return {
        classification: 'global',
        role: binding.event ? 'event' : 'behavior',
        confidence: Math.max(0.68, Number(binding.confidence || 0.68)),
        reason: 'broad-page-coverage'
      };
    }

    // If a concrete selector was found but cannot be located in the primary HTML
    // corpus, do not guess. It may target a dynamically created node or a demo
    // variant that is not present in the current examples.
    if (binding.selector) {
      return {
        classification: 'unresolved',
        role: binding.event ? 'event' : binding.kind === 'timer' || binding.kind === 'observer' ? 'helper' : 'behavior',
        confidence: Math.min(0.55, Number(binding.confidence || 0.5)),
        reason: 'explicit-selector-not-found-in-primary-html',
        blocked: true
      };
    }

    // Selector-less event/timer calls may inherit a nearby *directly mapped*
    // behavior context, but only at short distance. This remains lower-confidence
    // evidence and is never inferred from another already inferred binding.
    const inferred = contextCandidate(binding, context.sameScriptBindings || []);
    if (inferred && inferred.distance <= 1100) {
      const inherited = inferred.binding;
      return {
        classification: inferred.classification,
        role: binding.event ? 'event' : 'helper',
        confidence: inferred.distance <= 450 ? 0.66 : 0.58,
        reason: 'nearby-direct-runtime-context',
        inheritedFrom: inherited.bindingId,
        inheritedFamilies: clone(inherited.familyIds || []),
        inheritedRegions: clone(inherited.regionIds || []),
        inheritedPages: clone(inherited.pages || [])
      };
    }

    return {
      classification: 'unresolved',
      role: binding.event ? 'event' : binding.kind === 'timer' || binding.kind === 'observer' ? 'helper' : 'behavior',
      confidence: Math.min(0.5, Number(binding.confidence || 0.45)),
      reason: 'insufficient-runtime-context',
      blocked: true
    };
  }

  function observedOrder(dependencyGraph) {
    const positions = new Map();
    for (const page of (dependencyGraph && dependencyGraph.loadOrders) || []) {
      (page.scripts || []).forEach((script, index) => {
        if (!positions.has(script)) positions.set(script, []);
        positions.get(script).push(index);
      });
    }
    const result = new Map();
    positions.forEach((values, script) => result.set(script, mean(values)));
    return result;
  }

  function topologicalOrder(scriptIds, edges, orderEvidence) {
    const ids = unique(scriptIds);
    const idSet = new Set(ids);
    const incoming = new Map(ids.map(id => [id, 0]));
    const outgoing = new Map(ids.map(id => [id, []]));
    for (const edge of edges || []) {
      if (!idSet.has(edge.from) || !idSet.has(edge.to)) continue;
      outgoing.get(edge.from).push(edge.to);
      incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1);
    }
    const evidence = orderEvidence || new Map();
    const sortReady = list => list.sort((a, b) => {
      const aa = evidence.has(a) ? evidence.get(a) : Number.POSITIVE_INFINITY;
      const bb = evidence.has(b) ? evidence.get(b) : Number.POSITIVE_INFINITY;
      return aa - bb || a.localeCompare(b);
    });
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
      const unresolved = ids.filter(id => !result.includes(id));
      sortReady(unresolved);
      result.push(...unresolved);
    }
    return result;
  }

  function baseFrameworkDisposition(script, framework) {
    const library = script && script.library && script.library.id;
    if (library === 'bootstrap') return { disposition: 'base-framework-overlap', reason: 'bootstrap-provided-by-oluntir-base-profile' };
    if (framework && framework.baseFramework === 'bs4' && library === 'jquery') return { disposition: 'base-runtime-overlap', reason: 'jquery-provided-by-oluntir-bs4-profile' };
    return { disposition: 'template-runtime-candidate', reason: 'template-owned-runtime-dependency' };
  }

  function makeDependencyRecords(manifest) {
    const framework = manifest.framework || {};
    const scripts = (manifest.scripts || []).filter(script => script.scope === 'primary' && !script.inline);
    return scripts.filter(script => ['framework','runtime-library','vendor-plugin'].includes(script.role)).map(script => {
      const disposition = baseFrameworkDisposition(script, framework);
      return {
        script: script.path,
        runtimePath: script.runtimePath,
        role: script.role,
        library: script.library && script.library.id || null,
        libraryVersion: script.library && script.library.version || null,
        sourceKind: script.sourceKind,
        disposition: disposition.disposition,
        reason: disposition.reason,
        executionEnabled: false
      };
    });
  }

  function makeScriptPlan(manifest, classifiedBindings) {
    const dependencyGraph = manifest.dependencyGraph || { edges: [], loadOrders: [] };
    const orderEvidence = observedOrder(dependencyGraph);
    const primaryFiles = (manifest.scripts || []).filter(script => script.scope === 'primary' && !script.inline && script.sourceKind === 'file');
    const orderedIds = topologicalOrder(primaryFiles.map(script => script.path), dependencyGraph.edges || [], orderEvidence);
    const byPath = new Map(primaryFiles.map(script => [script.path, script]));
    const bindingByScript = new Map();
    for (const item of classifiedBindings) {
      if (!bindingByScript.has(item.script)) bindingByScript.set(item.script, []);
      bindingByScript.get(item.script).push(item);
    }
    return orderedIds.map((id, index) => {
      const script = byPath.get(id);
      const disposition = baseFrameworkDisposition(script, manifest.framework || {});
      const classes = unique((bindingByScript.get(id) || []).map(item => item.classification));
      return {
        order: index + 1,
        script: id,
        runtimePath: script.runtimePath,
        role: script.role,
        library: script.library && script.library.id || null,
        libraryVersion: script.library && script.library.version || null,
        module: Boolean(script.module),
        disposition: disposition.disposition,
        reason: disposition.reason,
        behaviorClasses: classes,
        executionEnabled: false
      };
    });
  }

  function plan(manifest, options) {
    if (!manifest || manifest.kind !== 'oluntir-template-javascript-behavior-manifest') throw new Error('Ungültiges JavaScript-Behavior-Manifest.');
    const settings = options || {};
    const primaryDocumentCount = Array.isArray(settings.primaryDocuments) ? settings.primaryDocuments.length : 0;
    const byScript = new Map();
    for (const binding of manifest.bindings || []) {
      if (!byScript.has(binding.script)) byScript.set(binding.script, []);
      byScript.get(binding.script).push(binding);
    }

    const classified = (manifest.bindings || []).map(binding => {
      const result = classifyBinding(binding, { primaryDocumentCount, sameScriptBindings: byScript.get(binding.script) || [] });
      const familyIds = result.inheritedFamilies || binding.familyIds || [];
      const regionIds = result.inheritedRegions || binding.regionIds || [];
      const pages = result.inheritedPages || binding.pages || [];
      return Object.assign({}, clone(binding), {
        classification: result.classification,
        runtimeRole: result.role,
        runtimeConfidence: Number(result.confidence.toFixed(2)),
        runtimeReason: result.reason,
        inheritedFrom: result.inheritedFrom || null,
        runtimeFamilyIds: unique(familyIds),
        runtimeRegionIds: unique(regionIds),
        runtimePages: unique(pages),
        executionEligible: !result.blocked && ['section','global'].includes(result.classification) && ['behavior','event'].includes(result.role) && result.confidence >= 0.65,
        executionEnabled: false,
        blocked: Boolean(result.blocked)
      });
    });

    const groups = { section: [], global: [], dependency: [], helper: [], unresolved: [] };
    classified.forEach(item => groups[item.classification].push(item));
    groups.dependency = makeDependencyRecords(manifest);
    const scriptPlan = makeScriptPlan(manifest, classified);
    const unresolvedRisk = groups.unresolved.filter(item => item.blocked || item.kind === 'network');
    const eligible = classified.filter(item => item.executionEligible);

    return {
      kind: 'oluntir-template-javascript-runtime-plan',
      schemaVersion: SCHEMA_VERSION,
      plannerVersion: PLANNER_VERSION,
      framework: clone(manifest.framework || null),
      policy: {
        sourceExecution: false,
        automaticActivation: false,
        templateScriptsEnabled: false,
        unresolvedExecution: false,
        networkSideEffectsEnabled: false,
        step: '4b-classification-only'
      },
      summary: {
        bindings: classified.length,
        section: groups.section.length,
        global: groups.global.length,
        dependency: groups.dependency.length,
        helper: groups.helper.length,
        unresolved: groups.unresolved.length,
        executionEligible: eligible.length,
        executionEnabled: 0,
        blockedHighRisk: unresolvedRisk.length,
        plannedScriptFiles: scriptPlan.length,
        baseRuntimeOverlaps: scriptPlan.filter(item => /overlap$/.test(item.disposition)).length
      },
      behaviors: groups,
      scripts: {
        ordered: scriptPlan,
        observedLoadOrders: clone((manifest.dependencyGraph && manifest.dependencyGraph.loadOrders) || []),
        dependencyEdges: clone((manifest.dependencyGraph && manifest.dependencyGraph.edges) || [])
      },
      execution: {
        enabled: [],
        candidates: eligible.map(item => item.bindingId),
        blocked: groups.unresolved.map(item => ({ bindingId: item.bindingId, reason: item.runtimeReason, highRisk: Boolean(item.blocked) }))
      }
    };
  }

  return Object.freeze({
    SCHEMA_VERSION,
    PLANNER_VERSION,
    plan,
    classifyBinding,
    topologicalOrder,
    isGlobalSelector
  });
});

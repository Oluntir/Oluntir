(function (root, factory) {
  const matrix = root && root.OluntirTranslationMatrix
    ? root.OluntirTranslationMatrix
    : (typeof module === 'object' && module.exports ? require('./translation-matrix.js') : null);
  const profiles = root && root.OluntirTranslationProfiles
    ? root.OluntirTranslationProfiles
    : (typeof module === 'object' && module.exports ? require('./translation-matrix-profiles.js') : null);
  const analyzer = root && root.OluntirTranslationAnalyzer
    ? root.OluntirTranslationAnalyzer
    : (typeof module === 'object' && module.exports ? require('./translation-analyzer.js') : null);
  const api = factory(matrix, profiles, analyzer);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTranslationResolver = api;
})(typeof window !== 'undefined' ? window : globalThis, function (matrix, profiles, analyzer) {
  'use strict';

  if (!matrix || !profiles || !analyzer) throw new Error('Translation Matrix, profiles and analyzer are required.');

  const SCHEMA_VERSION = 1;

  function freeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(key => freeze(value[key]));
    return Object.freeze(value);
  }

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function token(value) {
    return text(value).toLowerCase();
  }

  function findRule(profile, ruleId) {
    return profile.rules.find(rule => rule.ruleId === ruleId) || null;
  }

  function candidateView(rule) {
    return {
      ruleId: rule.ruleId,
      semanticId: rule.semanticId,
      category: rule.category,
      frameworkId: rule.frameworkId,
      versionRange: rule.versionRange,
      direction: rule.direction,
      variant: rule.variant,
      detect: rule.detect,
      emit: rule.emit,
      capabilities: rule.capabilities,
      constraints: rule.constraints,
      dependencies: rule.dependencies,
      priority: rule.priority,
      confidence: rule.confidence,
      reversible: rule.reversible,
      lossy: rule.lossy,
      provenance: rule.provenance
    };
  }

  function requestView(request, profile) {
    const source = request || {};
    return {
      frameworkId: profile ? profile.id : token(source.frameworkId),
      semanticId: token(source.semanticId),
      direction: token(source.direction) || null,
      ruleId: text(source.ruleId) || null
    };
  }

  function resolveProfile(source, settings) {
    const input = source || {};
    const options = settings || {};
    const candidate = input.sourceProfile || options.sourceProfile;
    if (!candidate) return profiles.getProfile(input.frameworkId || options.frameworkId);
    try {
      const metadata = candidate.metadata || {};
      const packageId = input.sourcePackageId || options.sourcePackageId;
      const sourceHash = input.sourceHash || options.sourceHash;
      if (candidate.kind !== 'oluntir-source-framework-profile' || metadata.sourceBound !== true || metadata.reusable !== false) return null;
      if (packageId && metadata.sourcePackageId && packageId !== metadata.sourcePackageId) return null;
      if (sourceHash && metadata.sourceHash && sourceHash !== metadata.sourceHash) return null;
      return matrix.createProfile(candidate);
    } catch (_) { return null; }
  }

  function resolve(request) {
    const source = request || {};
    const profile = resolveProfile(source, source);
    const requestState = requestView(source, profile);
    if (!profile) {
      return freeze({
        schemaVersion: SCHEMA_VERSION,
        status: 'invalid',
        valid: false,
        readOnly: true,
        mutationEnabled: false,
        request: requestState,
        candidates: [],
        selected: null,
        issues: [{ code: 'UNKNOWN_FRAMEWORK_PROFILE', frameworkId: requestState.frameworkId }]
      });
    }

    let candidates = profiles.findRules({
      frameworkId: profile.id,
      semanticId: requestState.semanticId,
      direction: requestState.direction || undefined
    });
    if (requestState.ruleId) candidates = candidates.filter(rule => rule.ruleId === requestState.ruleId);

    const analysis = source.analysis || null;
    if (analysis && Array.isArray(analysis.matches)) {
      const evidenceRuleIds = new Set(analysis.matches.map(item => item.ruleId));
      candidates = candidates.filter(rule => evidenceRuleIds.has(rule.ruleId));
    }

    const views = candidates.map(candidateView);
    let status = 'unresolved';
    let selected = null;
    let issues = [];
    if (views.length === 1) {
      status = 'resolved';
      selected = views[0];
    } else if (views.length > 1) {
      status = 'ambiguous';
      issues = [{ code: 'AMBIGUOUS_TRANSLATION_RULE', semanticId: requestState.semanticId, candidateCount: views.length }];
    } else {
      issues = [{ code: 'NO_TRANSLATION_RULE', semanticId: requestState.semanticId, frameworkId: profile.id }];
    }

    return freeze({
      schemaVersion: SCHEMA_VERSION,
      status,
      valid: status === 'resolved',
      readOnly: true,
      mutationEnabled: false,
      request: requestState,
      candidates: views,
      selected,
      issues
    });
  }

  function compile(analysis, options) {
    const source = analysis || {};
    const settings = options || {};
    const profile = resolveProfile(source, settings);
    if (!profile || source.valid === false) {
      return freeze({
        schemaVersion: SCHEMA_VERSION,
        status: 'invalid',
        valid: false,
        readOnly: true,
        mutationEnabled: false,
        entries: [],
        unresolved: [],
        issues: [{ code: 'ANALYSIS_NOT_USABLE' }]
      });
    }

    const requested = Array.isArray(settings.semanticIds) && settings.semanticIds.length
      ? new Set(settings.semanticIds.map(token))
      : null;
    const entries = [];
    const unresolved = [];
    (source.matches || []).forEach(match => {
      if (requested && !requested.has(token(match.semanticId))) return;
      const rule = findRule(profile, match.ruleId);
      if (!rule) {
        unresolved.push({ code: 'ANALYZED_RULE_NOT_IN_PROFILE', ruleId: match.ruleId });
        return;
      }
      entries.push({
        ruleId: rule.ruleId,
        semanticId: rule.semanticId,
        category: rule.category,
        frameworkId: rule.frameworkId,
        variant: rule.variant,
        evidence: match.evidence || [],
        emit: rule.emit,
        capabilities: rule.capabilities,
        constraints: rule.constraints,
        dependencies: rule.dependencies,
        confidence: rule.confidence,
        reversible: rule.reversible,
        lossy: rule.lossy,
        implementable: match.implementable === true && rule.emit.length > 0
      });
    });

    const status = unresolved.length ? 'partial' : 'compiled';
    return freeze({
      schemaVersion: SCHEMA_VERSION,
      status,
      valid: true,
      readOnly: true,
      mutationEnabled: false,
      frameworkId: profile.id,
      frameworkVersion: profile.version,
      sourceRuleCount: source.recognizedRuleCount || 0,
      entries,
      unresolved,
      entryCount: entries.length,
      implementableEntryCount: entries.filter(entry => entry.implementable).length,
      capabilities: source.capabilities || []
    });
  }

  function compileSource(source, options) {
    const analysis = analyzer.analyze(source, options);
    const plan = compile(analysis, options);
    return freeze({
      schemaVersion: SCHEMA_VERSION,
      status: plan.status,
      valid: plan.valid,
      readOnly: true,
      mutationEnabled: false,
      analysis,
      plan
    });
  }

  return Object.freeze({
    SCHEMA_VERSION,
    readOnly: true,
    mutationEnabled: false,
    resolve,
    compile,
    compileSource
  });
});

(function (root, factory) {
  const matrix = root && root.OluntirTranslationMatrix
    ? root.OluntirTranslationMatrix
    : (typeof module === 'object' && module.exports ? require('./translation-matrix.js') : null);
  const profiles = root && root.OluntirTranslationProfiles
    ? root.OluntirTranslationProfiles
    : (typeof module === 'object' && module.exports ? require('./translation-matrix-profiles.js') : null);
  const api = factory(matrix, profiles);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTranslationMatrixValidation = api;
})(typeof window !== 'undefined' ? window : globalThis, function (matrix, profiles) {
  'use strict';

  if (!matrix || !profiles) throw new Error('Translation Matrix and profiles are required.');

  const SCHEMA_VERSION = 1;

  function freeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(key => freeze(value[key]));
    return Object.freeze(value);
  }

  function issue(code, path, severity, details) {
    return Object.assign({ code, path, severity }, details || {});
  }

  function descriptorSignature(rule) {
    return rule.detect.map(item => item.kind + ':' + item.value + ':' + JSON.stringify(item.metadata || {})).sort().join('|');
  }

  function validateProfile(profile) {
    const result = matrix.validateProfile(profile);
    const issues = result.issues.slice();
    const signatures = new Set();
    const warnings = [];

    profile.rules.forEach((rule, index) => {
      const signature = [rule.semanticId, rule.direction, rule.variant || '', rule.versionRange, descriptorSignature(rule)].join('|');
      if (signatures.has(signature)) {
        issues.push(issue('DUPLICATE_RULE_SIGNATURE', 'rules[' + index + ']', 'error', { ruleId: rule.ruleId }));
      }
      signatures.add(signature);
      if (rule.reversible && rule.lossy) {
        warnings.push(issue('REVERSIBLE_RULE_MARKED_LOSSY', 'rules[' + index + ']', 'warning', { ruleId: rule.ruleId }));
      }
      if (rule.confidence < 1) {
        warnings.push(issue('RULE_HAS_REDUCED_CONFIDENCE', 'rules[' + index + ']', 'warning', { ruleId: rule.ruleId, confidence: rule.confidence }));
      }
    });

    return freeze({
      schemaVersion: SCHEMA_VERSION,
      valid: issues.every(item => item.severity !== 'error'),
      profileId: profile.id,
      issues,
      warnings,
      ruleCount: profile.rules.length
    });
  }

  function validateRegistry(registry) {
    const source = registry || profiles.registry;
    const profileResults = source && Array.isArray(source.profiles)
      ? source.profiles.map(validateProfile)
      : [];
    const issues = [];
    const warnings = [];
    profileResults.forEach(result => {
      result.issues.forEach(item => issues.push(Object.assign({}, item, { profileId: result.profileId })));
      result.warnings.forEach(item => warnings.push(Object.assign({}, item, { profileId: result.profileId })));
    });
    if (!profileResults.length) issues.push(issue('EMPTY_TRANSLATION_PROFILE_REGISTRY', 'profiles', 'error'));
    return freeze({
      schemaVersion: SCHEMA_VERSION,
      valid: issues.every(item => item.severity !== 'error'),
      readOnly: true,
      mutationEnabled: false,
      profileCount: profileResults.length,
      ruleCount: profileResults.reduce((sum, result) => sum + result.ruleCount, 0),
      profiles: profileResults,
      issues,
      warnings
    });
  }

  function validateAnalysis(analysis) {
    const source = analysis || {};
    const issues = [];
    const warnings = [];
    if (source.valid !== true) issues.push(issue('INVALID_TRANSLATION_ANALYSIS', 'analysis', 'error'));
    if (source.mutationEnabled === true) issues.push(issue('ANALYSIS_MUTATION_FLAG_FORBIDDEN', 'mutationEnabled', 'error'));
    if (Array.isArray(source.unmatchedRules) && source.unmatchedRules.length) {
      warnings.push(issue('UNMATCHED_MATRIX_RULES', 'unmatchedRules', 'warning', { count: source.unmatchedRules.length }));
    }
    return freeze({
      schemaVersion: SCHEMA_VERSION,
      valid: issues.every(item => item.severity !== 'error'),
      readOnly: source.readOnly === true,
      mutationEnabled: source.mutationEnabled === true,
      recognizedRuleCount: Number(source.recognizedRuleCount || 0),
      issues,
      warnings
    });
  }

  function validatePlan(plan) {
    const source = plan || {};
    const issues = [];
    const warnings = [];
    if (source.valid !== true) issues.push(issue('INVALID_TRANSLATION_PLAN', 'plan', 'error'));
    if (source.mutationEnabled === true) issues.push(issue('PLAN_MUTATION_FLAG_FORBIDDEN', 'mutationEnabled', 'error'));
    if (Array.isArray(source.unresolved) && source.unresolved.length) {
      warnings.push(issue('PLAN_HAS_UNRESOLVED_ENTRIES', 'unresolved', 'warning', { count: source.unresolved.length }));
    }
    (source.entries || []).forEach((entry, index) => {
      if (entry.lossy === true) warnings.push(issue('LOSSY_TRANSLATION_ENTRY', 'entries[' + index + ']', 'warning', { ruleId: entry.ruleId }));
      if (entry.implementable !== true) warnings.push(issue('ENTRY_NOT_IMPLEMENTABLE', 'entries[' + index + ']', 'warning', { ruleId: entry.ruleId }));
    });
    return freeze({
      schemaVersion: SCHEMA_VERSION,
      valid: issues.every(item => item.severity !== 'error'),
      readOnly: source.readOnly === true,
      mutationEnabled: source.mutationEnabled === true,
      entryCount: Array.isArray(source.entries) ? source.entries.length : 0,
      issues,
      warnings
    });
  }

  function audit(input) {
    const source = input || {};
    const registry = validateRegistry(source.registry || profiles.registry);
    const analysis = source.analysis ? validateAnalysis(source.analysis) : null;
    const plan = source.plan ? validatePlan(source.plan) : null;
    const issues = registry.issues.slice();
    const warnings = registry.warnings.slice();
    [analysis, plan].filter(Boolean).forEach(result => {
      result.issues.forEach(item => issues.push(item));
      result.warnings.forEach(item => warnings.push(item));
    });
    return freeze({
      schemaVersion: SCHEMA_VERSION,
      valid: issues.every(item => item.severity !== 'error'),
      readOnly: true,
      mutationEnabled: false,
      registry,
      analysis,
      plan,
      issues,
      warnings
    });
  }

  return Object.freeze({
    SCHEMA_VERSION,
    readOnly: true,
    mutationEnabled: false,
    validateProfile,
    validateRegistry,
    validateAnalysis,
    validatePlan,
    audit
  });
});

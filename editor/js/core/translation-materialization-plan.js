(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OluntirTranslationMaterializationPlan = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const OUTPUT_KINDS = Object.freeze({
    className: 'output-class',
    attribute: 'output-attribute',
    style: 'output-style'
  });

  function freeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(key => freeze(value[key]));
    return Object.freeze(value);
  }

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function operationKind(descriptorKind) {
    if (descriptorKind === OUTPUT_KINDS.className) return 'class';
    if (descriptorKind === OUTPUT_KINDS.attribute) return 'attribute';
    if (descriptorKind === OUTPUT_KINDS.style) return 'style';
    return null;
  }

  function build(plan, options) {
    const source = plan || {};
    const settings = options || {};
    const issues = [];
    const deferred = [];
    const operations = [];
    if (source.mutationEnabled === true) issues.push({ code: 'PLAN_MUTATION_FLAG_FORBIDDEN' });
    if (source.readOnly !== true) issues.push({ code: 'PLAN_READONLY_FLAG_REQUIRED' });
    if (source.valid !== true) issues.push({ code: 'PLAN_INVALID' });

    (source.entries || []).forEach((entry, entryIndex) => {
      if (entry.implementable !== true) {
        deferred.push({ entryIndex, ruleId: entry.ruleId, reason: 'entry-not-implementable' });
        return;
      }
      (entry.emit || []).forEach((descriptor, descriptorIndex) => {
        const kind = operationKind(descriptor.kind);
        if (!kind) {
          deferred.push({ entryIndex, ruleId: entry.ruleId, descriptorIndex, reason: 'unsupported-output-descriptor' });
          return;
        }
        operations.push({
          operationId: entry.ruleId + ':' + descriptorIndex,
          operation: 'materialize-' + kind,
          ruleId: entry.ruleId,
          semanticId: entry.semanticId,
          frameworkId: entry.frameworkId,
          targetRef: text(settings.targetRef) || null,
          descriptor,
          dependencies: entry.dependencies || [],
          constraints: entry.constraints || [],
          reversible: entry.reversible === true,
          lossy: entry.lossy === true,
          requiresMutationGate: true
        });
      });
    });

    return freeze({
      schemaVersion: SCHEMA_VERSION,
      status: issues.length ? 'invalid' : 'prepared',
      valid: issues.length === 0,
      readOnly: true,
      mutationEnabled: false,
      requiresMutationGate: true,
      targetRef: text(settings.targetRef) || null,
      operations,
      operationCount: operations.length,
      deferred,
      issues
    });
  }

  return Object.freeze({
    SCHEMA_VERSION,
    OUTPUT_KINDS,
    readOnly: true,
    mutationEnabled: false,
    build
  });
});

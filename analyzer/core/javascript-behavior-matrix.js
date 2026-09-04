'use strict';

const SCHEMA_VERSION = 1;

const RULES = Object.freeze([
  { behaviorType: 'interaction.accordion-toggle', semanticId: 'interaction.accordion.toggle', label: 'Accordion umschalten', category: 'interaction', states: ['expanded', 'collapsed'] },
  { behaviorType: 'interaction.modal-toggle', semanticId: 'interaction.modal.toggle', label: 'Modal öffnen oder schließen', category: 'interaction', states: ['open', 'closed'] },
  { behaviorType: 'interaction.tabs-select', semanticId: 'interaction.tabs.select', label: 'Tab auswählen', category: 'interaction', states: ['selected', 'unselected'] },
  { behaviorType: 'interaction.dropdown-toggle', semanticId: 'interaction.dropdown.toggle', label: 'Dropdown umschalten', category: 'interaction', states: ['expanded', 'collapsed'] },
  { behaviorType: 'interaction.carousel-navigate', semanticId: 'interaction.carousel.navigate', label: 'Carousel oder Slider navigieren', category: 'interaction', states: ['active-slide'] },
  { behaviorType: 'interaction.offcanvas-toggle', semanticId: 'interaction.offcanvas.toggle', label: 'Offcanvas umschalten', category: 'interaction', states: ['open', 'closed'] },
  { behaviorType: 'runtime.event-listener', semanticId: 'runtime.event.listener', label: 'Event-Listener', category: 'runtime', states: ['listener-registered'] },
  { behaviorType: 'runtime.custom-event', semanticId: 'runtime.event.custom', label: 'Custom Event', category: 'runtime', states: ['event-dispatched'] },
  { behaviorType: 'runtime.dom-observer', semanticId: 'runtime.dom.observer', label: 'DOM-Observer', category: 'runtime', states: ['observing'] },
  { behaviorType: 'runtime.network-request', semanticId: 'runtime.network.request', label: 'Netzwerkanfrage', category: 'runtime', states: ['request-started'] },
  { behaviorType: 'runtime.timer', semanticId: 'runtime.timer', label: 'Timer oder Animation-Frame', category: 'runtime', states: ['scheduled'] },
  { behaviorType: 'runtime.dom-mutation', semanticId: 'runtime.dom.mutation', label: 'DOM-Mutation', category: 'runtime', states: ['dom-changed'] }
]);

const BY_TYPE = Object.freeze(RULES.reduce((result, rule) => {
  result[rule.behaviorType] = Object.freeze(rule);
  return result;
}, {}));

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).reduce((result, key) => { result[key] = clone(value[key]); return result; }, {});
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.keys(value).forEach(key => deepFreeze(value[key]));
  return Object.freeze(value);
}

function issue(code, path, message, severity = 'error') { return { code, path, message, severity }; }
function rules() { return clone(RULES); }

function compile(behaviorManifest, target = {}) {
  if (!behaviorManifest || behaviorManifest.kind !== 'oluntir-javascript-behavior-manifest') throw new Error('Ein gültiges JavaScript-Verhaltensmanifest ist erforderlich.');
  const availableScripts = new Set(behaviorManifest.scripts && behaviorManifest.scripts.available || []);
  const entries = (behaviorManifest.behaviors || []).map(behavior => {
    const rule = BY_TYPE[behavior.behaviorType];
    const requiredScripts = behavior.runtime && Array.isArray(behavior.runtime.scriptFiles) ? behavior.runtime.scriptFiles.slice() : [];
    const missingScripts = requiredScripts.filter(file => !availableScripts.has(file));
    return {
      kind: 'oluntir-javascript-behavior-plan-entry', schemaVersion: SCHEMA_VERSION,
      behaviorId: behavior.behaviorId, behaviorType: behavior.behaviorType,
      semanticId: rule ? rule.semanticId : null, category: rule ? rule.category : 'unknown',
      label: rule ? rule.label : 'Unbekanntes Verhalten', states: rule ? rule.states.slice() : [],
      status: !rule ? 'unsupported' : missingScripts.length ? 'invalid-dependency' : 'recognized',
      sourceEvidence: clone(behavior.evidence || []),
      framework: { id: target.frameworkId || behaviorManifest.frameworkId || 'unknown', version: target.version || null },
      implementation: { resolved: false, frameworkProfileRequired: true, adapterId: null },
      dependencies: { scripts: requiredScripts, styles: behavior.dependencies && behavior.dependencies.styleFiles || [], missingScripts, resolution: 'framework-profile-required' },
      runtime: { requiresScript: true, enabled: false, execution: 'deferred-until-explicit-gate' },
      activation: { allowed: false, policy: 'explicit-selection-only', reason: 'framework-profile-and-runtime-gate-required' }
    };
  });
  const plan = {
    kind: 'oluntir-javascript-behavior-plan', schemaVersion: SCHEMA_VERSION,
    sourcePackageId: behaviorManifest.sourcePackageId || null, frameworkId: target.frameworkId || behaviorManifest.frameworkId || null,
    frameworkVersion: target.version || null, generatedAt: new Date().toISOString(),
    matrix: { version: SCHEMA_VERSION, ruleCount: RULES.length, profileResolution: 'deferred' },
    policy: { readOnly: true, sourceExecution: false, runtimeActivation: false, documentMutation: false, repeatSynchronization: false, unitIdUntouched: true },
    entries
  };
  return deepFreeze(plan);
}

function validate(plan) {
  const issues = [];
  if (!plan || plan.kind !== 'oluntir-javascript-behavior-plan') {
    issues.push(issue('INVALID_BEHAVIOR_PLAN', '', 'Ungültiger JavaScript-Verhaltensplan.'));
    return { valid: false, issues, plan: clone(plan) };
  }
  const ids = new Set();
  (plan.entries || []).forEach((entry, index) => {
    const base = `entries[${index}]`;
    if (!entry.behaviorId) issues.push(issue('MISSING_BEHAVIOR_ID', `${base}.behaviorId`, 'behaviorId fehlt.'));
    if (ids.has(entry.behaviorId)) issues.push(issue('DUPLICATE_BEHAVIOR_ID', `${base}.behaviorId`, 'behaviorId ist nicht eindeutig.'));
    ids.add(entry.behaviorId);
    if (!BY_TYPE[entry.behaviorType]) issues.push(issue('UNSUPPORTED_BEHAVIOR_TYPE', `${base}.behaviorType`, `Kein Matrixeintrag für ${entry.behaviorType}.`, 'warning'));
    if (entry.activation && entry.activation.allowed === true) issues.push(issue('BEHAVIOR_ACTIVATION_FORBIDDEN', `${base}.activation.allowed`, 'Runtime-Aktivierung ist in DEV_025 nicht freigegeben.'));
    if (entry.runtime && entry.runtime.enabled === true) issues.push(issue('BEHAVIOR_RUNTIME_FORBIDDEN', `${base}.runtime.enabled`, 'Runtime-Ausführung ist in DEV_025 nicht freigegeben.'));
    if (entry.dependencies && (entry.dependencies.missingScripts || []).length) issues.push(issue('MISSING_BEHAVIOR_SCRIPT', `${base}.dependencies.missingScripts`, 'Eine Verhaltensabhängigkeit ist nicht im Source Package vorhanden.', 'warning'));
  });
  if (!plan.policy || plan.policy.runtimeActivation !== false) issues.push(issue('PLAN_RUNTIME_POLICY_INVALID', 'policy.runtimeActivation', 'Runtime-Aktivierung muss false sein.'));
  if (!plan.policy || plan.policy.documentMutation !== false) issues.push(issue('PLAN_MUTATION_POLICY_INVALID', 'policy.documentMutation', 'Dokumentmutation muss false sein.'));
  return deepFreeze({ valid: issues.every(item => item.severity !== 'error'), issues, plan: clone(plan) });
}

module.exports = Object.freeze({ SCHEMA_VERSION, rules, compile, validate });

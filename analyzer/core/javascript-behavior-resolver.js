'use strict';

const SCHEMA_VERSION = 1;

const JQUERY_SCRIPT = /\bjquery(?:[-_.][^/]+)?\.js$/i;
const BOOTSTRAP_SCRIPT = /\bbootstrap(?:[-_.][^/]+)?\.js$/i;
const BOOTSTRAP_STYLE = /\bbootstrap(?:[-_.][^/]+)?\.css$/i;

const PROFILES = Object.freeze([
  {
    id: 'bootstrap4', aliases: ['bootstrap4', 'bs4'], family: 'bootstrap', versionRange: '4.x',
    dependencies: { scriptGroups: [[JQUERY_SCRIPT], [BOOTSTRAP_SCRIPT]], styleGroups: [[BOOTSTRAP_STYLE]] },
    rules: {
      'interaction.accordion-toggle': { adapterId: 'bootstrap4.collapse', signals: [/data-toggle\s*=\s*["']collapse/i] },
      'interaction.modal-toggle': { adapterId: 'bootstrap4.modal', signals: [/data-toggle\s*=\s*["']modal/i] },
      'interaction.tabs-select': { adapterId: 'bootstrap4.tab', signals: [/data-toggle\s*=\s*["']tab/i] },
      'interaction.dropdown-toggle': { adapterId: 'bootstrap4.dropdown', signals: [/data-toggle\s*=\s*["']dropdown/i] },
      'interaction.carousel-navigate': { adapterId: 'bootstrap4.carousel', signals: [/data-ride\s*=\s*["']carousel/i, /\bcarousel\b/i] },
      'interaction.offcanvas-toggle': null
    }
  },
  {
    id: 'bootstrap5', aliases: ['bootstrap5', 'bs5'], family: 'bootstrap', versionRange: '5.x',
    dependencies: { scriptGroups: [[BOOTSTRAP_SCRIPT]], styleGroups: [[BOOTSTRAP_STYLE]] },
    rules: {
      'interaction.accordion-toggle': { adapterId: 'bootstrap5.collapse', signals: [/data-bs-toggle\s*=\s*["']collapse/i] },
      'interaction.modal-toggle': { adapterId: 'bootstrap5.modal', signals: [/data-bs-toggle\s*=\s*["']modal/i] },
      'interaction.tabs-select': { adapterId: 'bootstrap5.tab', signals: [/data-bs-toggle\s*=\s*["']tab/i] },
      'interaction.dropdown-toggle': { adapterId: 'bootstrap5.dropdown', signals: [/data-bs-toggle\s*=\s*["']dropdown/i] },
      'interaction.carousel-navigate': { adapterId: 'bootstrap5.carousel', signals: [/data-bs-ride\s*=\s*["']carousel/i, /\bcarousel\b/i] },
      'interaction.offcanvas-toggle': { adapterId: 'bootstrap5.offcanvas', signals: [/data-bs-toggle\s*=\s*["']offcanvas/i] }
    }
  }
]);

const PROFILE_BY_ALIAS = Object.freeze(PROFILES.reduce((result, profile) => {
  profile.aliases.forEach(alias => { result[alias] = profile; });
  return result;
}, {}));

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).reduce((result, key) => { result[key] = clone(value[key]); return result; }, {});
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.keys(value).forEach(key => deepFreeze(value[key]));
  return Object.freeze(value);
}

function normalize(value) { return String(value || '').trim().toLowerCase(); }
function profiles() { return clone(PROFILES); }

function selectProfile(target = {}, manifest = {}) {
  const requested = normalize(target.profileId || target.frameworkId || manifest.frameworkId);
  const version = String(target.version || manifest.frameworkVersion || '').trim();
  if (requested && PROFILE_BY_ALIAS[requested]) {
    const direct = PROFILE_BY_ALIAS[requested];
    const numericMajor = version.match(/^([0-9]+)/);
    if (numericMajor && direct.versionRange && numericMajor[1] !== direct.versionRange[0]) {
      return null;
    }
    return direct;
  }
  if (requested === 'bootstrap' && version) {
    const numericMajor = version.match(/^([0-9]+)/);
    return PROFILES.find(profile => numericMajor ? numericMajor[1] === profile.versionRange[0] : version.startsWith(profile.versionRange[0])) || null;
  }
  if (requested.startsWith('bootstrap')) return PROFILES.find(profile => profile.id === requested) || null;
  return null;
}

function dependencyMatches(groups, available) {
  return groups.map(group => group.some(pattern => available.some(file => pattern.test(file))));
}

function evidenceValues(entry) { return (entry.sourceEvidence || []).map(item => String(item.value || '')); }

function resolve(behaviorPlan, behaviorManifest, target = {}) {
  if (!behaviorPlan || behaviorPlan.kind !== 'oluntir-javascript-behavior-plan') throw new Error('Ein gültiger JavaScript-Verhaltensplan ist erforderlich.');
  if (!behaviorManifest || behaviorManifest.kind !== 'oluntir-javascript-behavior-manifest') throw new Error('Ein gültiges JavaScript-Verhaltensmanifest ist erforderlich.');
  const profile = selectProfile(target, behaviorManifest);
  const availableScripts = (behaviorManifest.scripts && behaviorManifest.scripts.available || []).slice().sort();
  const availableStyles = (behaviorManifest.styles && behaviorManifest.styles.available || []).slice().sort();
  const entries = (behaviorPlan.entries || []).map(entry => {
    const base = {
      kind: 'oluntir-javascript-behavior-resolution-entry', schemaVersion: SCHEMA_VERSION,
      behaviorId: entry.behaviorId, behaviorType: entry.behaviorType, semanticId: entry.semanticId,
      sourcePlanStatus: entry.status, framework: { profileId: profile && profile.id || null, family: profile && profile.family || null, versionRange: profile && profile.versionRange || null },
      evidence: clone(entry.sourceEvidence || []), activation: { allowed: false, policy: 'explicit-selection-only', reason: 'runtime-gate-required' },
      runtime: { enabled: false, execution: 'deferred-until-explicit-gate' }
    };
    if (entry.category === 'runtime') {
      return Object.assign(base, { status: 'evidence-only', implementation: { resolved: false, adapterId: null, reason: 'technical-runtime-evidence-needs-explicit-adapter' }, dependencies: { scripts: entry.dependencies.scripts || [], styles: entry.dependencies.styles || [], missing: [] } });
    }
    if (!profile) return Object.assign(base, { status: 'profile-required', implementation: { resolved: false, adapterId: null, reason: 'framework-profile-required' }, dependencies: { scripts: entry.dependencies.scripts || [], styles: entry.dependencies.styles || [], missing: [] } });
    const rule = profile.rules[entry.behaviorType];
    if (!rule) return Object.assign(base, { status: 'unsupported-by-profile', implementation: { resolved: false, adapterId: null, reason: 'behavior-not-supported-by-profile' }, dependencies: { scripts: [], styles: [], missing: [] } });
    const values = evidenceValues(entry);
    const triggerMatched = rule.signals.some(signal => values.some(value => signal.test(value)));
    const scriptMatches = dependencyMatches(profile.dependencies.scriptGroups, availableScripts);
    const styleMatches = dependencyMatches(profile.dependencies.styleGroups, availableStyles);
    const missing = [];
    scriptMatches.forEach((matched, index) => { if (!matched) missing.push(`script-group-${index + 1}`); });
    styleMatches.forEach((matched, index) => { if (!matched) missing.push(`style-group-${index + 1}`); });
    const status = !triggerMatched ? 'trigger-unresolved' : missing.length ? 'invalid-dependency' : 'resolved';
    return Object.assign(base, {
      status,
      implementation: { resolved: status === 'resolved', adapterId: status === 'resolved' ? rule.adapterId : null, profileRule: entry.behaviorType },
      trigger: { matched: triggerMatched, signals: rule.signals.map(signal => signal.source) },
      dependencies: { scripts: availableScripts.filter(file => profile.dependencies.scriptGroups.some(group => group.some(pattern => pattern.test(file)))), styles: availableStyles.filter(file => profile.dependencies.styleGroups.some(group => group.some(pattern => pattern.test(file)))), missing }
    });
  });
  return deepFreeze({
    kind: 'oluntir-javascript-behavior-resolution', schemaVersion: SCHEMA_VERSION,
    sourcePackageId: behaviorManifest.sourcePackageId || behaviorPlan.sourcePackageId || null,
    framework: { requestedId: target.frameworkId || behaviorManifest.frameworkId || null, requestedVersion: target.version || null, profileId: profile && profile.id || null, family: profile && profile.family || null, versionRange: profile && profile.versionRange || null },
    generatedAt: new Date().toISOString(),
    policy: { readOnly: true, sourceExecution: false, runtimeActivation: false, documentMutation: false, repeatSynchronization: false, unitIdUntouched: true },
    entries
  });
}

function validate(resolution) {
  const issues = [];
  if (!resolution || resolution.kind !== 'oluntir-javascript-behavior-resolution') {
    issues.push({ code: 'INVALID_BEHAVIOR_RESOLUTION', path: '', message: 'Ungültige JavaScript-Verhaltensauflösung.', severity: 'error' });
    return { valid: false, issues, resolution: clone(resolution) };
  }
  (resolution.entries || []).forEach((entry, index) => {
    const base = `entries[${index}]`;
    if (entry.activation && entry.activation.allowed === true) issues.push({ code: 'RESOLUTION_ACTIVATION_FORBIDDEN', path: `${base}.activation.allowed`, message: 'Runtime-Aktivierung ist noch nicht freigegeben.', severity: 'error' });
    if (entry.runtime && entry.runtime.enabled === true) issues.push({ code: 'RESOLUTION_RUNTIME_FORBIDDEN', path: `${base}.runtime.enabled`, message: 'Runtime-Ausführung ist noch nicht freigegeben.', severity: 'error' });
    if (entry.status === 'resolved' && (!entry.implementation || entry.implementation.resolved !== true || !entry.implementation.adapterId)) issues.push({ code: 'RESOLVED_ENTRY_INCOMPLETE', path: `${base}.implementation`, message: 'Aufgelöster Eintrag benötigt Adapter-ID und resolved=true.', severity: 'error' });
  });
  if (!resolution.policy || resolution.policy.runtimeActivation !== false) issues.push({ code: 'RESOLUTION_RUNTIME_POLICY_INVALID', path: 'policy.runtimeActivation', message: 'Runtime-Aktivierung muss false sein.', severity: 'error' });
  if (!resolution.policy || resolution.policy.documentMutation !== false) issues.push({ code: 'RESOLUTION_MUTATION_POLICY_INVALID', path: 'policy.documentMutation', message: 'Dokumentmutation muss false sein.', severity: 'error' });
  return deepFreeze({ valid: issues.every(item => item.severity !== 'error'), issues, resolution: clone(resolution) });
}

module.exports = Object.freeze({ SCHEMA_VERSION, profiles, selectProfile, resolve, validate });

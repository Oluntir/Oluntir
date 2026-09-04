'use strict';

const crypto = require('crypto');

const SCHEMA_VERSION = 1;
const FRAMEWORK_LABELS = {
  bootstrap4: 'Bootstrap 4',
  bootstrap5: 'Bootstrap 5'
};

function text(value) { return String(value == null ? '' : value).trim(); }
function token(value) { return text(value).toLowerCase(); }
function unique(values) { return Array.from(new Set(values.filter(Boolean))); }
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }

function sourceDigest(sourceAnalysis) {
  const files = (sourceAnalysis && sourceAnalysis.files || []).slice().sort((a, b) => a.path.localeCompare(b.path));
  return sha256(files.map(file => `${file.path}\0${file.content}`).join('\n'));
}

function lineAt(content, offset) {
  const prefix = String(content || '').slice(0, offset);
  return { line: prefix.split('\n').length, column: offset - prefix.lastIndexOf('\n') };
}

function collectClasses(sourceAnalysis) {
  const classes = new Map();
  (sourceAnalysis && sourceAnalysis.files || []).forEach(file => {
    if (!/\.(html?|shtml|php|twig|vue|svelte|astro|jsx?|tsx?|mdx)$/i.test(file.path)) return;
    const expression = /\b(?:class|className)\s*=\s*["'`]([^"'`]*?)["'`]/gi;
    let match;
    while ((match = expression.exec(file.content)) !== null) {
      match[1].split(/\s+/).map(item => item.trim()).filter(Boolean).forEach(className => {
        if (!classes.has(className)) classes.set(className, []);
        classes.get(className).push({ file: file.path, source: Object.assign({ offset: match.index }, lineAt(file.content, match.index)) });
      });
    }
  });
  return classes;
}

function versionEvidence(sourceAnalysis, frameworkId) {
  const files = sourceAnalysis && sourceAnalysis.files || [];
  const name = frameworkId === 'bootstrap4' || frameworkId === 'bootstrap5' ? 'bootstrap' : frameworkId ? frameworkId.replace(/[^a-z0-9]/gi, '[^a-z0-9]') : '[a-z][a-z0-9_-]*';
  const expression = new RegExp(`${name}[^\\d]{0,20}(?:@|v|version["'\\s:=]+)?(\\d+\\.\\d+(?:\\.\\d+)?)`, 'i');
  for (const file of files) {
    const match = String(file.content || '').match(expression);
    if (match) return { version: match[1], evidence: [{ file: file.path, match: match[0] }] };
  }
  return { version: null, evidence: [] };
}

function cssDeclarations(sourceAnalysis) {
  const inventory = sourceAnalysis && sourceAnalysis.inventory;
  if (!inventory) return new Map();
  const declarationsByRule = new Map();
  (inventory.declarations || []).forEach(declaration => {
    if (!declarationsByRule.has(declaration.ruleId)) declarationsByRule.set(declaration.ruleId, []);
    declarationsByRule.get(declaration.ruleId).push({ name: token(declaration.normalizedName || declaration.name), value: text(declaration.value) });
  });
  const byClass = new Map();
  (inventory.cssRules || []).forEach(rule => {
    const declarations = declarationsByRule.get(rule.id) || [];
    (rule.selectors || []).forEach(selector => {
      const normalized = text(selector).replace(/\\([:\[\]().#/%])/g, '$1');
      const matches = normalized.match(/\.([a-zA-Z_][\w:-]*)/g) || [];
      matches.forEach(match => {
        const className = match.slice(1);
        if (!byClass.has(className)) byClass.set(className, []);
        byClass.get(className).push(...declarations);
      });
    });
  });
  return byClass;
}

function baseUtility(className) {
  const parts = text(className).split(':');
  return { variants: parts.slice(0, -1), utility: parts[parts.length - 1] };
}

function semanticFromDeclarations(declarations) {
  const names = new Set((declarations || []).map(item => item.name));
  if (names.has('visibility') || names.has('content-visibility') || declarations.some(item => item.name === 'display' && item.value === 'none')) return 'visibility';
  if (names.has('display') || names.has('grid-template-columns') || names.has('flex-direction')) return 'responsive-layout';
  if (Array.from(names).some(name => /^(margin|padding|gap|row-gap|column-gap)/.test(name))) return 'spacing';
  if (Array.from(names).some(name => /^(justify-content|align-items|align-content|align-self|text-align)$/.test(name))) return 'alignment';
  if (Array.from(names).some(name => /^(font-|line-height|letter-spacing|text-transform)/.test(name))) return 'typography';
  return null;
}

function semanticFromUtility(className) {
  const utility = baseUtility(className).utility;
  if (/^(flex|grid|block|inline|table|flow-root|grid-cols-|flex-row|flex-col|col-span-|container|columns-)/.test(utility)) return utility === 'flex-col' ? 'column' : utility === 'container' ? 'container' : 'responsive-layout';
  if (/^(m[trblxyse]?[-:]|p[trblxyse]?[-:]|gap-|space-[xy]-)/.test(utility) || utility === 'mx-auto') return 'spacing';
  if (/^(justify-|items-|content-|self-|text-(left|right|center|start|end))/.test(utility)) return 'alignment';
  if (/^(text-(xs|sm|base|lg|xl|[2-9]xl)|font-|leading-|tracking-)/.test(utility)) return 'typography';
  if (/^(hidden|invisible|visible|sr-only)$/.test(utility)) return 'visibility';
  return null;
}

function semanticFor(className, declarations) {
  const variants = baseUtility(className).variants;
  if (variants.some(item => /^(hover|focus|active|disabled|group-hover|focus-within)$/.test(item))) return { semanticId: 'interactive-behavior', category: 'behavior', variant: 'state', reason: 'variant-syntax' };
  if (variants.includes('dark')) return { semanticId: 'interactive-behavior', category: 'behavior', variant: 'dark-mode', reason: 'variant-syntax' };
  const semanticId = semanticFromDeclarations(declarations) || semanticFromUtility(className);
  if (!semanticId) return null;
  return { semanticId, category: ['container', 'responsive-layout', 'column'].includes(semanticId) ? (semanticId === 'responsive-layout' ? 'capability' : 'layout') : semanticId === 'visibility' ? 'capability' : semanticId === 'interactive-behavior' ? 'behavior' : 'presentation', variant: variants.length ? variants.join(':') : null, reason: declarations && declarations.length ? 'css-declaration' : 'token-structure' };
}

function ruleId(digest, semanticId, className) {
  return `source.${digest.slice(0, 16)}.${semanticId}.${sha256(className).slice(0, 10)}`.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function build(sourceAnalysis, options = {}) {
  const observations = options.observations || {};
  const framework = options.framework || {};
  const requestedIdValue = token(options.frameworkId || options.requestedFrameworkId);
  const requestedId = ['', 'unknown', 'unclassified'].includes(requestedIdValue) ? '' : requestedIdValue;
  const detected = (observations.frameworks || []).filter(item => item.detected).sort((a, b) => b.confidence - a.confidence || a.id.localeCompare(b.id))[0] || null;
  const frameworkId = requestedId || token(framework.id) || (detected && detected.id) || 'unknown';
  const detectedVersion = versionEvidence(sourceAnalysis, frameworkId);
  const version = text(options.frameworkVersion || options.requestedFrameworkVersion || detectedVersion.version || framework.version || 'unversioned');
  const requestedFamily = token(options.frameworkFamily);
  const family = ['', 'unknown', 'unclassified'].includes(requestedFamily) ? frameworkId : requestedFamily;
  const digest = text(options.sourceHash) || sourceDigest(sourceAnalysis);
  const packageId = text(options.sourcePackageId) || null;
  const profileId = `source-profile:${packageId || 'unbound'}:${digest.slice(0, 16)}`;
  const classes = collectClasses(sourceAnalysis);
  const declarations = cssDeclarations(sourceAnalysis);
  const rules = [];
  const unknownFeatures = [];
  const capabilities = new Set();

  classes.forEach((locations, className) => {
    const semantic = semanticFor(className, declarations.get(className) || []);
    if (!semantic) {
      unknownFeatures.push({ kind: 'class-token', value: className, evidence: locations });
      return;
    }
    if (semantic.semanticId === 'responsive-layout' || semantic.variant && /^(sm|md|lg|xl|2xl)/.test(semantic.variant)) capabilities.add('responsive-layout');
    if (semantic.semanticId === 'interactive-behavior') capabilities.add(semantic.variant === 'dark-mode' ? 'css-dark-mode' : 'css-state-variants');
    rules.push({
      schemaVersion: SCHEMA_VERSION,
      ruleId: ruleId(digest, semantic.semanticId, className),
      semanticId: semantic.semanticId,
      category: semantic.category,
      frameworkFamily: family,
      frameworkId: profileId,
      versionRange: version === 'unversioned' ? '*' : version,
      direction: 'bidirectional',
      detect: [{ kind: 'class', value: className, metadata: { match: 'exact', sourceBound: true } }],
      emit: [{ kind: 'output-class', value: className, metadata: { sourceBound: true } }],
      capabilities: Array.from(new Set([semantic.semanticId === 'responsive-layout' ? 'responsive-layout' : '', semantic.variant === 'dark-mode' ? 'css-dark-mode' : '', semantic.variant === 'state' ? 'css-state-variants' : ''])).filter(Boolean),
      constraints: ['source-bound-profile'],
      dependencies: [],
      priority: semantic.reason === 'css-declaration' ? 30 : 15,
      confidence: semantic.reason === 'css-declaration' ? 0.9 : 0.68,
      reversible: true,
      lossy: false,
      variant: semantic.variant,
      provenance: { source: 'source-profile-builder', sourcePackageId: packageId, sourceHash: digest, evidence: locations, inference: semantic.reason }
    });
  });

  const frameworkEvidence = detected ? detected.evidence : [];
  return Object.freeze({
    kind: 'oluntir-source-framework-profile', schemaVersion: SCHEMA_VERSION,
    id: profileId, profileId, sourcePackageId: packageId, sourceHash: digest,
    framework: { id: frameworkId, family, version, confidence: detected ? detected.confidence : (framework.confidence || 0), evidence: frameworkEvidence.concat(detectedVersion.evidence), candidates: (observations.frameworks || []).filter(item => item.detected).map(item => ({ id: item.id, confidence: item.confidence, evidence: item.evidence })) },
    family, version,
    label: `${FRAMEWORK_LABELS[frameworkId] || frameworkId} ${version}`.trim(),
    rules, capabilities: Array.from(capabilities).sort(), unknownFeatures,
    metadata: { sourceBound: true, reusable: false, sourcePackageId: packageId, sourceHash: digest, generatedBy: 'oluntir-source-profile-builder', schemaVersion: SCHEMA_VERSION },
    policy: { readOnly: true, sourceExecution: false, documentMutation: false, repeatSynchronization: false, crossPackageReuse: false, unitIdUntouched: true }
  });
}

function validate(profile) {
  const issues = [];
  if (!profile || profile.kind !== 'oluntir-source-framework-profile') issues.push({ code: 'INVALID_SOURCE_PROFILE', severity: 'error' });
  if (!profile || !profile.profileId || !profile.sourceHash) issues.push({ code: 'SOURCE_PROFILE_IDENTITY_MISSING', severity: 'error' });
  if (!profile || !profile.metadata || profile.metadata.sourceBound !== true || profile.metadata.reusable !== false) issues.push({ code: 'SOURCE_PROFILE_SCOPE_INVALID', severity: 'error' });
  if (profile && profile.policy && (profile.policy.documentMutation !== false || profile.policy.crossPackageReuse !== false)) issues.push({ code: 'SOURCE_PROFILE_POLICY_INVALID', severity: 'error' });
  return { valid: issues.every(item => item.severity !== 'error'), issues, profile };
}

module.exports = Object.freeze({ SCHEMA_VERSION, sourceDigest, build, validate });

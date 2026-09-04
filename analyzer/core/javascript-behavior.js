'use strict';

const crypto = require('crypto');

const SCHEMA_VERSION = 1;
const SCRIPT_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx']);
const STYLE_EXTENSIONS = new Set(['.css', '.scss', '.less']);

const INTERACTION_RULES = [
  { id: 'interaction.accordion-toggle', label: 'Accordion umschalten', pattern: /\baccordion\b|data-(?:bs-)?toggle\s*=\s*["']collapse|data-accordion\b/i },
  { id: 'interaction.modal-toggle', label: 'Modal öffnen oder schließen', pattern: /\b(?:modal|reveal)\b|data-(?:bs-)?toggle\s*=\s*["']modal|data-(?:reveal|open|close)\b/i },
  { id: 'interaction.tabs-select', label: 'Tab auswählen', pattern: /\b(?:tabs?|nav-tabs)\b|role\s*=\s*["']tab|data-tabs\b/i },
  { id: 'interaction.dropdown-toggle', label: 'Dropdown umschalten', pattern: /\bdropdown\b|data-(?:bs-)?toggle\s*=\s*["']dropdown|data-dropdown(?:-menu)?\b/i },
  { id: 'interaction.carousel-navigate', label: 'Carousel oder Slider navigieren', pattern: /\b(?:carousel|swiper|slick|splide|orbit)\b|data-orbit\b/i },
  { id: 'interaction.offcanvas-toggle', label: 'Offcanvas umschalten', pattern: /\boffcanvas\b|\boff-canvas\b|data-off-canvas\b/i }
];

const RUNTIME_RULES = [
  { id: 'runtime.event-listener', label: 'Event-Listener', kind: 'event-listener', category: 'runtime' },
  { id: 'runtime.custom-event', label: 'Custom Event', kind: 'custom-event', category: 'runtime' },
  { id: 'runtime.dom-observer', label: 'DOM-Observer', kind: 'observer', category: 'runtime' },
  { id: 'runtime.network-request', label: 'Netzwerkanfrage', kind: 'network-request', category: 'runtime' },
  { id: 'runtime.timer', label: 'Timer oder Animation-Frame', kind: 'timer', category: 'runtime' },
  { id: 'runtime.dom-mutation', label: 'DOM-Mutation', kind: 'dom-mutation', category: 'runtime' }
];

function sha256(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }

function position(text, offset) {
  const before = text.slice(0, offset);
  const lines = before.split('\n');
  return { offset, line: lines.length, column: lines[lines.length - 1].length + 1 };
}

function extension(file) { return String(file || '').slice(String(file || '').lastIndexOf('.')).toLowerCase(); }

function evidence(text, pattern, file, kind, valueIndex = 1) {
  const result = [];
  const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
  let match;
  while ((match = regex.exec(text))) {
    result.push({ kind, value: match[valueIndex] || match[0], source: { file, ...position(text, match.index) } });
  }
  return result;
}

function unique(values) { return Array.from(new Set(values.filter(Boolean))).sort(); }

function build(sourceAnalysis, metadata = {}) {
  const files = Array.isArray(sourceAnalysis && sourceAnalysis.files) ? sourceAnalysis.files : [];
  const scripts = files.filter(file => SCRIPT_EXTENSIONS.has(extension(file.path)));
  const styles = files.filter(file => STYLE_EXTENSIONS.has(extension(file.path)));
  const inventory = sourceAnalysis && sourceAnalysis.inventory;
  const documents = new Map((inventory && inventory.documents || []).map(document => [document.id, document.path]));
  const scriptDocumentIds = new Set(scripts.map(file => file.path));
  const scriptEvidence = (inventory && inventory.references || [])
    .filter(reference => scriptDocumentIds.has(documents.get(reference.documentId)))
    .map(reference => ({ kind: reference.kind, value: reference.value, source: { file: documents.get(reference.documentId), ...reference.source } }));

  const markupEvidence = [];
  files.filter(file => ['.html', '.htm', '.shtml'].includes(extension(file.path))).forEach(file => {
    INTERACTION_RULES.forEach(rule => markupEvidence.push(...evidence(String(file.content || ''), rule.pattern, file.path, `markup:${rule.id}`)));
  });

  const behaviors = [];
  INTERACTION_RULES.forEach(rule => {
    const markup = markupEvidence.filter(item => item.kind === `markup:${rule.id}`);
    if (!markup.length) return;
    const relatedScripts = scriptEvidence.filter(item => ['event-listener', 'dom-selector', 'class-manipulation', 'dataset-access', 'observer'].includes(item.kind));
    const allEvidence = markup.concat(relatedScripts);
    behaviors.push(createBehavior(rule.id, rule.label, 'interaction', allEvidence, scripts, styles, metadata));
  });

  RUNTIME_RULES.forEach(rule => {
    const matches = scriptEvidence.filter(item => item.kind === rule.kind);
    if (!matches.length) return;
    behaviors.push(createBehavior(rule.id, rule.label, rule.category, matches, scripts, styles, metadata));
  });

  behaviors.sort((a, b) => a.behaviorType.localeCompare(b.behaviorType) || a.behaviorId.localeCompare(b.behaviorId));
  return {
    kind: 'oluntir-javascript-behavior-manifest', schemaVersion: SCHEMA_VERSION,
    sourcePackageId: metadata.sourcePackageId || null, frameworkId: metadata.frameworkId || null,
    generatedAt: new Date().toISOString(),
    scripts: {
      available: scripts.map(file => file.path).sort(),
      enabledByDefault: [],
      activation: 'explicit-selection-only'
    },
    styles: { available: styles.map(file => file.path).sort(), resolution: 'deferred-to-behavior-matrix' },
    policy: {
      readOnlyAnalysis: true, sourceExecution: false, documentMutation: false,
      automaticActivation: false, unitIdUntouched: true, sourceOfTruth: 'original-source-and-analyzer-evidence'
    },
    behaviors
  };
}

function createBehavior(behaviorType, label, category, matches, scripts, styles, metadata) {
  const scriptFiles = unique(matches.filter(item => !String(item.kind).startsWith('markup:')).map(item => item.source.file));
  const evidenceKinds = unique(matches.map(item => item.kind));
  const sideEffects = unique(matches.map(item => ({
    'event-listener': 'event-listener', 'custom-event': 'custom-event', 'class-manipulation': 'class-state',
    'dataset-access': 'dataset-state', observer: 'observer', 'network-request': 'network-request',
    timer: 'timer', 'dom-mutation': 'dom-mutation'
  }[item.kind])));
  const identity = `${metadata.sourcePackageId || 'source'}\0${behaviorType}\0${scriptFiles.join('|')}\0${evidenceKinds.join('|')}`;
  return {
    kind: 'oluntir-javascript-behavior-candidate', schemaVersion: SCHEMA_VERSION,
    behaviorId: `source-behavior:${sha256(identity).slice(0, 20)}`,
    behaviorType, category, label, status: 'evidenced', confidence: category === 'interaction' && scriptFiles.length ? 0.8 : 0.6,
    evidence: matches, runtime: {
      requiresScript: true, scriptFiles, domRequired: true,
      execution: 'not-executed-during-analysis', defaultEnabled: false,
      activation: 'explicit-selection-only'
    },
    dependencies: {
      scriptFiles, availableScriptFiles: scripts.map(file => file.path).sort(),
      styleFiles: [], availableStyleFiles: styles.map(file => file.path).sort(),
      resolution: 'deferred-to-behavior-matrix'
    },
    sideEffects, reversible: !sideEffects.includes('network-request') && !sideEffects.includes('dom-mutation'),
    activation: { allowed: false, policy: 'explicit-manifest-selection', reason: 'behavior-matrix-not-yet-compiled' }
  };
}

module.exports = Object.freeze({ SCHEMA_VERSION, build });

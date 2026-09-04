'use strict';

const fs = require('fs');
const path = require('path');
const inventoryApi = require('./source-inventory.js');
const htmlAnalyzer = require('./static-html-analyzer.js');
const cssAnalyzer = require('./static-css-analyzer.js');
const scriptAnalyzer = require('./static-script-analyzer.js');
const frameworkAnalyzer = require('./framework-evidence-analyzer.js');
const capabilityAnalyzer = require('./capability-evidence-analyzer.js');
const evidenceStoreApi = require('./evidence-store.js');
const oirApi = require('./oir-project.js');
const knowledgeCompiler = require('./knowledge-compiler.js');
const capabilityCatalog = require('./capability-catalog.js');

const PIPELINE_VERSION = '0.2.0';
const EXTENSIONS = new Set(['.html', '.htm', '.shtml', '.php', '.twig', '.vue', '.svelte', '.astro', '.jsx', '.mdx', '.css', '.scss', '.less', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.yaml', '.yml']);
const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules', 'vendor']);

function walk(root, dir, files, limits) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(root, absolute, files, limits);
      continue;
    }
    if (!EXTENSIONS.has(path.extname(entry.name).toLowerCase()) || files.length >= limits.maxFiles) continue;
    const stat = fs.statSync(absolute);
    if (stat.size > limits.maxFileBytes) continue;
    files.push({
      path: path.relative(root, absolute).replace(/\\/g, '/'),
      content: fs.readFileSync(absolute, 'utf8'),
      size: stat.size
    });
  }
}

function analyzeSources(root, options) {
  const absoluteRoot = path.resolve(root);
  const limits = Object.assign({ maxFiles: 5000, maxFileBytes: 2 * 1024 * 1024 }, options || {});
  if (!fs.existsSync(absoluteRoot) || !fs.statSync(absoluteRoot).isDirectory()) {
    throw new Error('Template-Verzeichnis nicht gefunden.');
  }

  const files = [];
  walk(absoluteRoot, absoluteRoot, files, limits);
  const inventory = inventoryApi.create({
    inventoryId: `inventory:${path.basename(absoluteRoot)}`,
    createdAt: new Date().toISOString()
  });

  files.forEach(file => {
    const ext = path.extname(file.path).toLowerCase();
    if (['.html', '.htm', '.shtml'].includes(ext)) {
      htmlAnalyzer.analyze(file.content, { file: file.path, inventory });
    } else if (['.css', '.scss', '.less'].includes(ext)) {
      cssAnalyzer.analyze(file.content, { file: file.path, inventory });
    } else {
      scriptAnalyzer.analyze(file.content, { file: file.path, inventory });
    }
  });

  return { absoluteRoot, files, inventory };
}

function frameworkVersion(frameworkId) {
  if (frameworkId === 'bootstrap5') return '5';
  if (frameworkId === 'bootstrap4') return '4';
  return null;
}

function selectFramework(frameworks) {
  const detected = frameworks.filter(item => item.detected).sort((a, b) => b.confidence - a.confidence || a.id.localeCompare(b.id));
  if (!detected.length) return { id: 'unknown', version: null, confidence: 0 };
  return { id: detected[0].id, version: frameworkVersion(detected[0].id), confidence: detected[0].confidence };
}

function graphForCapability(capabilityId) {
  const capability = capabilityCatalog.get(capabilityId);
  if (!capability) return 'semantic';
  if (capability.domain === 'interaction') return 'interaction';
  if (capability.domain === 'asset') return 'asset';
  return 'semantic';
}

function vocabularyEntry(capability) {
  const id = capability.id;
  if (capability.domain === 'interaction') {
    return { id, kind: 'interaction-capability', capabilityId: id };
  }
  if (capability.domain === 'structure' || capability.domain === 'content') {
    return { id, kind: 'presentation-capability', capabilityId: id };
  }
  return null;
}

function addGraphNode(project, graphName, node) {
  const graph = project.graphs[graphName];
  if (!graph) throw new Error(`Unknown OIR graph: ${graphName}`);
  const value = Object.assign({}, node);
  if (!value.id) value.id = `${graphName}:${String(graph.nodes.length + 1).padStart(6, '0')}`;
  graph.nodes.push(value);
  return value;
}

function addVocabulary(project, name, entry) {
  if (!entry) return;
  const list = project.vocabularies[name];
  if (!list.some(item => item.id === entry.id)) list.push(entry);
}

function buildOir(sourceAnalysis, observations) {
  const store = evidenceStoreApi.create();
  const projectName = path.basename(sourceAnalysis.absoluteRoot);
  const project = oirApi.create({
    projectId: `project:${projectName}`,
    name: projectName,
    analyzerVersion: PIPELINE_VERSION,
    createdAt: new Date().toISOString()
  });

  project.sourceInventory.push({
    inventoryId: sourceAnalysis.inventory.inventoryId,
    schemaVersion: sourceAnalysis.inventory.schemaVersion,
    documentIds: sourceAnalysis.inventory.documents.map(item => item.id),
    readOnly: true
  });

  sourceAnalysis.inventory.diagnostics.forEach(diagnostic => project.diagnostics.push(Object.assign({}, diagnostic)));

  observations.frameworks.forEach(item => {
    const evidenceIds = item.evidence.map(match => {
      const evidence = store.add({
        kind: 'rule-match',
        source: { analyzer: 'framework-evidence-analyzer', frameworkId: item.id },
        payload: { ruleIndex: match.ruleIndex, match: match.match, detected: item.detected, confidence: item.confidence }
      });
      oirApi.addEvidence(project, evidence);
      return evidence.id;
    });
    addGraphNode(project, 'validation', {
      type: 'framework-observation',
      frameworkId: item.id,
      detected: item.detected,
      confidence: item.confidence,
      evidenceIds
    });
  });

  observations.capabilities.forEach(item => {
    const evidenceIds = item.evidence.map(match => {
      const evidence = store.add({
        kind: 'rule-match',
        source: { analyzer: 'capability-evidence-analyzer', capabilityId: item.id },
        payload: { ruleIndex: match.ruleIndex, match: match.match, status: item.status, confidence: item.confidence }
      });
      oirApi.addEvidence(project, evidence);
      return evidence.id;
    });

    const capabilityNode = oirApi.addCapability(project, {
      capabilityId: item.id,
      confidence: item.confidence,
      status: item.status,
      evidenceIds,
      support: item.access
    });

    const catalogEntry = capabilityCatalog.get(item.id);
    const graphName = graphForCapability(item.id);
    addGraphNode(project, graphName, {
      type: 'semantic-capability-reference',
      capabilityId: item.id,
      capabilityNodeId: capabilityNode.id,
      confidence: item.confidence,
      evidenceIds
    });

    const vocabulary = vocabularyEntry(catalogEntry);
    if (vocabulary && catalogEntry.domain === 'interaction') addVocabulary(project, 'interaction', vocabulary);
    else if (vocabulary) addVocabulary(project, 'presentation', vocabulary);
  });

  sourceAnalysis.inventory.assets.forEach(asset => addGraphNode(project, 'asset', {
    type: 'source-asset',
    sourceAssetId: asset.id,
    assetKind: asset.kind,
    uri: asset.uri,
    referenceIds: Array.isArray(asset.referenceIds) ? asset.referenceIds.slice() : []
  }));

  return project;
}

function buildConflicts(frameworks) {
  const conflicts = [];
  if (frameworks.filter(item => item.detected && item.id.startsWith('bootstrap')).length > 1) {
    conflicts.push({
      code: 'MULTIPLE_BOOTSTRAP_GENERATIONS',
      severity: 'warning',
      message: 'Indizien für Bootstrap 4 und 5 wurden gleichzeitig gefunden.'
    });
  }
  return conflicts;
}

function compileProject(root, options) {
  const sourceAnalysis = analyzeSources(root, options);
  const frameworks = frameworkAnalyzer.analyze(sourceAnalysis.files);
  const capabilities = capabilityAnalyzer.analyze(sourceAnalysis.files);
  const conflicts = buildConflicts(frameworks);
  const uncertainties = capabilities.filter(item => item.status === 'candidate').map(item => ({
    type: 'capability', id: item.id, confidence: item.confidence
  }));
  const framework = selectFramework(frameworks);
  const oir = buildOir(sourceAnalysis, { frameworks, capabilities });
  conflicts.forEach(conflict => oir.diagnostics.push(Object.assign({}, conflict)));
  const knowledge = knowledgeCompiler.compile(oir, { framework });

  return {
    pipelineVersion: PIPELINE_VERSION,
    sourceAnalysis,
    observations: { frameworks, capabilities, conflicts, uncertainties },
    framework,
    oir,
    knowledge
  };
}

module.exports = Object.freeze({
  PIPELINE_VERSION,
  analyzeSources,
  buildOir,
  compileProject,
  selectFramework
});

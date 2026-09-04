'use strict';

const path = require('path');
const pipeline = require('./compiler-pipeline.js');
const javascriptBehavior = require('./javascript-behavior.js');
const javascriptBehaviorMatrix = require('./javascript-behavior-matrix.js');
const javascriptBehaviorResolver = require('./javascript-behavior-resolver.js');
const sourceProfileBuilder = require('./source-profile-builder.js');

const ANALYZER_VERSION = '1.0.0-alpha';

function analyzeProject(root, options) {
  const result = pipeline.compileProject(root, options);
  const behaviorManifest = javascriptBehavior.build(result.sourceAnalysis, {
    sourcePackageId: options && options.sourcePackageId,
    frameworkId: options && options.frameworkId
  });
  const behaviorPlan = javascriptBehaviorMatrix.compile(behaviorManifest, {
    frameworkId: options && options.frameworkId,
    version: options && options.frameworkVersion
  });
  const behaviorResolution = javascriptBehaviorResolver.resolve(behaviorPlan, behaviorManifest, {
    frameworkId: options && options.frameworkId,
    version: options && options.frameworkVersion
  });
  const inventory = result.sourceAnalysis.inventory;
  const observations = result.observations;
  const sourceProfile = sourceProfileBuilder.build(result.sourceAnalysis, {
    sourcePackageId: options && options.sourcePackageId,
    sourceHash: options && options.sourceHash,
    frameworkId: options && options.frameworkId,
    frameworkFamily: options && options.frameworkFamily,
    frameworkVersion: options && options.frameworkVersion,
    framework: result.framework,
    observations
  });

  return {
    kind: 'oluntir-template-analysis-report',
    schemaVersion: 2,
    analyzerVersion: ANALYZER_VERSION,
    pipelineVersion: result.pipelineVersion,
    generatedAt: new Date().toISOString(),
    canonicalModel: 'oluntir-intermediate-representation',
    project: {
      name: path.basename(result.sourceAnalysis.absoluteRoot),
      path: result.sourceAnalysis.absoluteRoot
    },
    summary: {
      files: result.sourceAnalysis.files.length,
      documents: inventory.documents.length,
      nodes: inventory.nodes.length,
      cssRules: inventory.cssRules.length,
      declarations: inventory.declarations.length,
      references: inventory.references.length,
      assets: inventory.assets.length,
      diagnostics: result.oir.diagnostics.length,
      frameworksDetected: observations.frameworks.filter(item => item.detected).length,
      capabilities: observations.capabilities.length,
      conflicts: observations.conflicts.length,
      uncertainties: observations.uncertainties.length
    },
    framework: result.framework,
    frameworks: observations.frameworks,
    capabilities: observations.capabilities,
    conflicts: observations.conflicts,
    uncertainties: observations.uncertainties,
    behaviors: behaviorManifest,
    behaviorPlan,
    behaviorResolution,
    sourceProfile,
    diagnostics: result.oir.diagnostics,
    oir: result.oir,
    knowledge: result.knowledge,
    inventory
  };
}

module.exports = Object.freeze({ ANALYZER_VERSION, analyzeProject });

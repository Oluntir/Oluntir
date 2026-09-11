'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { analyzeProject } = require('../core/project-analyzer.js');
const profileBuilder = require('../core/source-profile-builder.js');
const matrixProfiles = require('../../editor/js/core/translation-matrix-profiles.js');
const translationAnalyzer = require('../../editor/js/core/translation-analyzer.js');
const translationResolver = require('../../editor/js/core/translation-resolver.js');
const materialization = require('../../editor/js/core/translation-materialization-plan.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oluntir-bootstrap-profile-test-'));
try {
  fs.writeFileSync(path.join(root, 'index.html'), `<!doctype html>
    <section class="container">
      <div class="row g-3">
        <article class="col-md-6 p-3 text-center fw-bold" data-bs-toggle="collapse">Bootstrap</article>
      </div>
    </section>`);
  fs.mkdirSync(path.join(root, 'css'), { recursive: true });
  fs.mkdirSync(path.join(root, 'js'), { recursive: true });
  fs.writeFileSync(path.join(root, 'css', 'bootstrap.css'), `/* bootstrap@5.3.8 */
.container { width: 100%; }
.row { display: flex; }
.col-md-6 { flex: 0 0 50%; }
.p-3 { padding: 1rem; }
.text-center { text-align: center; }
.fw-bold { font-weight: 700; }`);
  fs.writeFileSync(path.join(root, 'js', 'bootstrap.bundle.js'), '/* bootstrap@5.3.8 */');
  fs.writeFileSync(path.join(root, 'package.json'), '{"dependencies":{"bootstrap":"5.3.8"}}');

  const autoReport = analyzeProject(root, { sourcePackageId: 'bootstrap-package-auto', frameworkId: 'unclassified', frameworkFamily: 'unclassified' });
  assert.strictEqual(autoReport.sourceProfile.framework.id, 'bootstrap5');
  assert.strictEqual(autoReport.sourceProfile.framework.version, '5.3.8');

  const report = analyzeProject(root, {
    sourcePackageId: 'bootstrap-package-v5',
    frameworkId: 'bootstrap5',
    frameworkFamily: 'bootstrap',
    frameworkVersion: '5.3'
  });
  const profile = report.sourceProfile;
  assert.strictEqual(profile.kind, 'oluntir-source-framework-profile');
  assert.strictEqual(profile.framework.id, 'bootstrap5');
  assert.strictEqual(profile.framework.version, '5.3');
  assert.strictEqual(profile.sourceHash, profile.metadata.sourceHash);
  assert.strictEqual(profile.metadata.sourceBound, true);
  assert.strictEqual(profile.metadata.reusable, false);
  assert(profile.rules.some(rule => rule.semanticId === 'container'));
  assert(profile.rules.some(rule => rule.semanticId === 'responsive-layout'));
  assert(profile.rules.some(rule => rule.semanticId === 'spacing'));
  assert(profile.rules.some(rule => rule.semanticId === 'alignment'));
  assert(profile.rules.some(rule => rule.semanticId === 'typography'));
  assert(profileBuilder.validate(profile).valid);
  assert.strictEqual(matrixProfiles.getProfile(profile.profileId), null);

  const source = {
    sourcePackageId: profile.sourcePackageId,
    sourceHash: profile.sourceHash,
    html: fs.readFileSync(path.join(root, 'index.html'), 'utf8'),
    css: fs.readFileSync(path.join(root, 'css', 'bootstrap.css'), 'utf8'),
    js: fs.readFileSync(path.join(root, 'js', 'bootstrap.bundle.js'), 'utf8'),
    scss: ''
  };
  const analysis = translationAnalyzer.analyze(source, { sourceProfile: profile });
  assert.strictEqual(analysis.valid, true);
  assert.strictEqual(analysis.sourceProfileId, profile.profileId);
  assert(analysis.matches.length >= 5);
  assert(analysis.matches.every(match => match.implementable === true));
  const plan = translationResolver.compile(analysis, { sourceProfile: profile, sourcePackageId: profile.sourcePackageId, sourceHash: profile.sourceHash });
  assert.strictEqual(plan.valid, true);
  assert.strictEqual(plan.frameworkId, profile.profileId);
  assert(plan.entryCount >= 5);
  const materializationPlan = materialization.build(plan, { targetRef: 'source-component:bootstrap-card' });
  assert.strictEqual(materializationPlan.valid, true);
  assert(materializationPlan.operationCount >= 5);
  assert(materializationPlan.operations.every(operation => operation.requiresMutationGate === true));

  const wrongPackage = translationAnalyzer.analyze(source, { sourceProfile: profile, sourcePackageId: 'other-package' });
  assert.strictEqual(wrongPackage.valid, false);
  assert(wrongPackage.issues.some(issue => issue.code === 'SOURCE_PROFILE_PACKAGE_MISMATCH'));

  fs.appendFileSync(path.join(root, 'index.html'), '<div class="alert alert-primary">Update</div>');
  const updated = analyzeProject(root, { sourcePackageId: 'bootstrap-package-v5', frameworkId: 'bootstrap5', frameworkFamily: 'bootstrap', frameworkVersion: '5.3' }).sourceProfile;
  assert.notStrictEqual(updated.sourceHash, profile.sourceHash);
  assert.notStrictEqual(updated.profileId, profile.profileId);
  console.log(`SOURCE-FRAMEWORK-PROFILE-TEST ERFOLGREICH (${analysis.matches.length} übersetzbare Regeln)`);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

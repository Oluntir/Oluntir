'use strict';

const evidenceStore = require('../core/evidence-store.js');
const oir = require('../core/oir-project.js');
const compiler = require('../core/knowledge-compiler.js');

const evidence = evidenceStore.create();
const project = oir.create({ projectId: 'example-template', name: 'Example Template' });
const source = evidence.add({
  kind: 'source-location',
  source: { file: 'index.html', line: 42 },
  payload: { selector: '.gallery-grid' }
});
oir.addEvidence(project, source);
oir.addCapability(project, {
  capabilityId: 'media.image-collection',
  confidence: 0.85,
  evidenceIds: [source.id]
});

process.stdout.write(JSON.stringify(compiler.compile(project, {
  framework: { id: 'custom-template', version: '1' }
}), null, 2) + '\n');

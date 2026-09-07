'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { analyzeProject } = require('../core/project-analyzer.js');
const catalogApi = require('../core/source-component-catalog.js');

function run(name, html, frameworkId) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `oluntir-${name}-`));
  try {
    fs.writeFileSync(path.join(root, 'index.html'), html);
    const report = analyzeProject(root, { frameworkId, frameworkFamily:'bootstrap' });
    return catalogApi.build(report, root, { packageId:`pkg-${name}`, frameworkId });
  } finally { fs.rmSync(root, { recursive:true, force:true }); }
}

const bs4 = run('bs4-depth', '<div class="jumbotron"><h1>Hero</h1></div><div class="media"><div class="media-body"><h2>Kommentar</h2></div></div><div class="custom-control custom-checkbox"><input class="custom-control-input"></div>', 'bootstrap4');
assert(bs4.components.some(item => item.evidence.classes.includes('jumbotron')), 'Jumbotron muss als quellengebundene Komponente erkannt werden.');
assert(bs4.components.some(item => item.evidence.classes.includes('media')), 'Media object muss als quellengebundene Komponente erkannt werden.');
assert(bs4.components.some(item => item.evidence.classes.includes('custom-control')), 'BS4 Custom control muss als quellengebundene Struktur erkannt werden.');

const bs5 = run('bs5-depth', '<div class="offcanvas"><h2>Menü</h2></div><div class="list-group"><a class="list-group-item">A</a></div><div class="progress"><div class="progress-bar"></div></div>', 'bootstrap5');
assert(bs5.components.some(item => item.evidence.classes.includes('offcanvas')), 'Offcanvas muss als quellengebundene Komponente erkannt werden.');
assert(bs5.components.some(item => item.evidence.classes.includes('list-group')), 'List group muss als quellengebundene Komponente erkannt werden.');
assert(bs5.components.some(item => item.evidence.classes.includes('progress')), 'Progress muss als quellengebundene Komponente erkannt werden.');

console.log('BOOTSTRAP-COMPONENT-CATALOG-DEPTH-TEST ERFOLGREICH');

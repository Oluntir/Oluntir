'use strict';
const assert = require('assert');
const path = require('path');

function loadBlocks() {
  const registered = [];
  global.window = {};
  delete require.cache[require.resolve('../editor/js/features/bootstrap-blocks.js')];
  require('../editor/js/features/bootstrap-blocks.js');
  const editor = { BlockManager: { add(id, config) { registered.push({ id, config }); } } };
  return { registered, register: version => window.registerBootstrapBlocks(editor, version) };
}

let runtime = loadBlocks();
runtime.register('bs4');
const bs4Ids = new Set(runtime.registered.map(item => item.id));
assert(bs4Ids.has('bs4-comp-jumbotron'), 'Bootstrap 4 Jumbotron muss als nativer BS4-Baustein nutzbar sein.');
assert(bs4Ids.has('bs4-comp-media-object'), 'Bootstrap 4 Media object muss als nativer BS4-Baustein nutzbar sein.');
assert(bs4Ids.has('bs4-forms-custom'), 'Bootstrap 4 Custom forms müssen nutzbar sein.');
assert(runtime.registered.find(item => item.id === 'bs4-comp-jumbotron').config.content.includes('class="jumbotron"'));
assert(runtime.registered.find(item => item.id === 'bs4-comp-media-object').config.content.includes('class="media"'));

runtime = loadBlocks();
runtime.register('bs5');
const bs5Ids = new Set(runtime.registered.map(item => item.id));
assert(!bs5Ids.has('bs5-comp-jumbotron'), 'Entfernte BS4-Komponente Jumbotron darf nicht als BS5-Komponente erfunden werden.');
assert(!bs5Ids.has('bs5-comp-media-object'), 'Entferntes BS4 Media object darf nicht als BS5-Komponente erfunden werden.');
assert(!bs5Ids.has('bs5-forms-custom'), 'BS4 Custom forms dürfen nicht als BS5-Komponente registriert werden.');
assert(bs5Ids.has('bs5-comp-offcanvas'), 'Bootstrap 5 Offcanvas muss weiter verfügbar sein.');
assert(bs5Ids.has('bs5-comp-placeholders'), 'Bootstrap 5 Placeholders müssen weiter verfügbar sein.');

console.log('BOOTSTRAP-COMPONENT-COVERAGE-TEST ERFOLGREICH');

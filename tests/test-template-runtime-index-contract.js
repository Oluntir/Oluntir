'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const framework = fs.readFileSync(path.join(root, 'editor/js/core/framework.js'), 'utf8');
const editor = fs.readFileSync(path.join(root, 'editor/js/core/editor.js'), 'utf8');

const registryPos = index.indexOf('templates/registry.js?v=2.3.0');
const runtimePos = index.indexOf('editor/js/core/template-runtime.js?v=2.3.0');
const bootstrapPos = index.indexOf('editor/js/core/template-runtime-bootstrap.js?v=2.3.0');
const frameworkPos = index.indexOf('editor/js/core/framework.js?v=2.3.0');

assert.ok(registryPos >= 0 && runtimePos > registryPos && bootstrapPos > runtimePos && frameworkPos > bootstrapPos,
  'Registry und Template Runtime müssen vor der Framework-Auswahl geladen werden.');
assert.ok(framework.includes('OluntirTemplateRuntime.extendProfiles'), 'Framework-Auswahl muss den generischen Template-Registry-Hook verwenden.');
assert.ok(framework.includes('await window.OluntirTemplateRuntimeReady'), 'Framework-Auswahl muss auf die statische Template-Registry warten.');
assert.ok(editor.includes('ACTIVE_FRAMEWORK.templateRuntime && window.OluntirTemplateRuntime'), 'Editor muss kompilierte Templates über den generischen Runtime-Hook verbinden.');
assert.ok(index.includes('Oluntir 2.3.0'), 'User-Build muss als 2.3.0 sichtbar sein.');

console.log('TEMPLATE-RUNTIME-INDEX-CONTRACT-TEST ERFOLGREICH');

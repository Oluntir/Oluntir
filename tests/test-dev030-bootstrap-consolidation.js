'use strict';

const assert = require('assert');
const fs = require('fs');

const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
const bridge = fs.readFileSync('editor/js/core/source-package-bridge.js', 'utf8');
const adapter = fs.readFileSync('editor/js/core/source-package-grapesjs-adapter.js', 'utf8');

assert(editor.includes('bridge.isEditorSupported(manifest)'));
assert(editor.includes('nur für Analyse freigegeben'));
assert(bridge.includes("const SUPPORTED_FRAMEWORKS = new Set(['bootstrap4', 'bootstrap5'])"));
assert(bridge.includes('registry().filter(isEditorSupported)'));
assert(adapter.includes('GRAPESJS_SOURCE_FRAMEWORK_ANALYSIS_ONLY'));
assert(!editor.includes('frameworkId, bootstrap4, bootstrap5'));

console.log('DEV030-BOOTSTRAP-CONSOLIDATION-TEST ERFOLGREICH');

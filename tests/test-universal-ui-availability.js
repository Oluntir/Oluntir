'use strict';

const assert = require('assert');
const fs = require('fs');

const index = fs.readFileSync('index.html', 'utf8');
const framework = fs.readFileSync('editor/js/core/framework.js', 'utf8');
const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
const i18n = fs.readFileSync('editor/js/core/i18n.js', 'utf8');
const editorCss = fs.readFileSync('editor/css/editor.css', 'utf8');
const exportSource = fs.readFileSync('editor/js/core/export.js', 'utf8');

assert(index.includes('<option value="bs5">'));
assert(index.includes('<option value="bs4">'));
assert(index.includes('id="toolbar-secondary"'));
assert(index.includes('id="btn-export-tar"'));
assert(framework.includes('window.OluntirFrameworkReady'));
assert(framework.includes('window.OluntirSourcePackageBridge.discover'));
assert(editor.includes("id: 'pb-ui-toolbar-export-tar'"));
assert(editor.includes("id: 'pb-ui-toolbar-export-zip'"));
assert(editor.includes("id: 'pb-ui-toolbar-export-folder'"));
assert(i18n.includes("'toolbar.gallery':'+ Bildergalerie'"));
assert(i18n.includes("'toolbar.folderGallery':'+ Galerie aus Ordner'"));
assert(editorCss.includes('#toolbar-secondary'));
assert(editorCss.includes('#gjs .gjs-cv-canvas { height: 100%; }'));
assert(exportSource.includes('function loadImportedSourceAssets(framework)'));
assert(exportSource.includes("framework: frameworkDescriptor"));
console.log('UNIVERSAL-UI-AVAILABILITY-TEST ERFOLGREICH');

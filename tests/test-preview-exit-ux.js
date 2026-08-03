'use strict';
const fs = require('fs');
const assert = require('assert');

const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
const css = fs.readFileSync('editor/css/editor.css', 'utf8');

assert.ok(editor.includes("editorInstance.on('run:preview'"), 'preview start hook missing');
assert.ok(editor.includes("editorInstance.on('stop:preview'"), 'preview stop hook missing');
assert.ok(editor.includes("event.key !== 'Escape'"), 'ESC exit handling missing');
assert.ok(editor.includes("editorInstance.stopCommand(PREVIEW_COMMAND)"), 'ESC does not stop preview command');
assert.ok(editor.includes('ESC zum Beenden'), 'preview guidance text missing');
assert.ok(!css.includes('body.oluntir-preview-active .gjs-off-prv'), 'GrapesJS preview exit control must remain untouched');
assert.ok(editor.includes('window.setInterval(syncPreviewState, 150)'), 'preview hint must use an Oluntir-owned state watcher');
assert.ok(css.includes('.oluntir-preview-hint.is-visible'), 'preview hint visibility style missing');
console.log('Preview exit UX contract OK');

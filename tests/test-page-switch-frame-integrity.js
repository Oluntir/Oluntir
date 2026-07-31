#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const editorPath = path.join(root, 'editor/js/core/editor.js');
const source = fs.readFileSync(editorPath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const selectStart = source.indexOf('function selectPageById(pageId)');
const selectEnd = source.indexOf("pageSelect.addEventListener('change'", selectStart);
assert(selectStart >= 0 && selectEnd > selectStart, 'selectPageById() wurde nicht gefunden.');
const selectBody = source.slice(selectStart, selectEnd);

assert(selectBody.includes('editor.Pages.select(page);'), 'Die Zielseite wird nicht über Pages.select() gewählt.');
assert(!selectBody.includes('applySharedRegionsToPage(page);'), 'Der Ziel-Komponentenbaum darf beim Seitenwechsel nicht ersetzt werden.');

const newPageStart = source.indexOf("document.getElementById('btn-new-page')");
const renameStart = source.indexOf("document.getElementById('btn-rename-page')", newPageStart);
assert(newPageStart >= 0 && renameStart > newPageStart, 'Handler für neue Seiten wurde nicht gefunden.');
const newPageBody = source.slice(newPageStart, renameStart);

assert(newPageBody.includes("editor.Pages.add(pageConfig, { select: true })"), 'Neue Seiten müssen direkt über den PageManager ausgewählt werden.');
assert(!newPageBody.includes('applySharedRegionsToPage(page);'), 'Eine neue Seite darf vor der ersten Canvas-Auswahl nicht neu aufgebaut werden.');

console.log('PAGE-SWITCH-FRAME-INTEGRITY-TEST ERFOLGREICH');

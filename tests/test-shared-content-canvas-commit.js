#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const managerSource = fs.readFileSync(path.join(root, 'editor/js/core/shared-content-manager.js'), 'utf8');
const editorSource = fs.readFileSync(path.join(root, 'editor/js/core/editor.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(managerSource.includes('function commitSelectedCanvasToShared(page, options)'), 'Canvas-Commit-API fehlt.');
assert(managerSource.includes("canvasDocument.querySelector('header')"), 'Header wird nicht aus dem Canvas gelesen.');
assert(managerSource.includes("canvasDocument.querySelector('nav')"), 'Navigation wird nicht aus dem Canvas gelesen.');
assert(managerSource.includes("canvasDocument.querySelector('footer')"), 'Footer wird nicht aus dem Canvas gelesen.');
assert(managerSource.includes('component.components(canvasInnerHtml);'), 'Canvas-Inhalt wird nicht synchron ins Komponentenmodell geschrieben.');
assert(managerSource.includes('targetPage && targetPage !== page && applyToPage(targetPage)'), 'Die Zielseite wird nicht vorgezogen synchronisiert.');
assert(!managerSource.includes('Remaining pages are synchronized'), 'Der Seitenwechsel darf keine projektweite Nachsynchronisierung starten.');
assert(!managerSource.includes('editor.Pages.getAll().forEach((candidate)'), 'Der Canvas-Commit darf nicht alle Projektseiten neu aufbauen.');

const selectStart = editorSource.indexOf('function selectPageById(pageId)');
const selectEnd = editorSource.indexOf("pageSelect.addEventListener('change'", selectStart);
const selectBody = editorSource.slice(selectStart, selectEnd);
const commitIndex = selectBody.indexOf('commitSelectedCanvasToShared(previousPage, { targetPage: page })');
const selectIndex = selectBody.indexOf('editor.Pages.select(page);');
assert(commitIndex >= 0, 'Der Seitenwechsel führt keinen synchronen Canvas-Commit aus.');
assert(selectIndex > commitIndex, 'Die Zielseite wird vor dem Canvas-Commit ausgewählt.');
assert(!selectBody.includes('setTimeout('), 'Der Seitenwechsel darf nicht durch Timer verzögert werden.');

console.log('SHARED-CONTENT-CANVAS-COMMIT-TEST ERFOLGREICH');

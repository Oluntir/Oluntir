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

assert(managerSource.includes('let pendingFlushPage = null;'), 'Der Shared-Content-Debounce besitzt keine gebundene Ursprungsseite.');
assert(
  managerSource.includes('pendingFlushPage = editor && editor.Pages ? editor.Pages.getSelected() : null;'),
  'scheduleFlush() bindet die Transaktion nicht an die beim Ereignis ausgewählte Seite.'
);
assert(managerSource.includes('const page = pendingFlushPage;'), 'Der Timer liest seine gebundene Ursprungsseite nicht aus.');
assert(managerSource.includes('flushPage(page);'), 'Der Timer verarbeitet nicht die gebundene Ursprungsseite.');
assert(!/setTimeout\([\s\S]*?flushSelected\(\)/.test(managerSource), 'Ein verzögerter Flush darf nicht die später ausgewählte Seite verwenden.');
assert(managerSource.includes('flushPending,'), 'flushPending() wird nicht über die Manager-API bereitgestellt.');

const selectStart = editorSource.indexOf('function selectPageById(pageId)');
const selectEnd = editorSource.indexOf("pageSelect.addEventListener('change'", selectStart);
assert(selectStart >= 0 && selectEnd > selectStart, 'selectPageById() wurde nicht gefunden.');
const selectBody = editorSource.slice(selectStart, selectEnd);
const flushIndex = selectBody.indexOf('OluntirSharedContentManager.flushPending()');
const selectIndex = selectBody.indexOf('editor.Pages.select(page);');
assert(flushIndex >= 0, 'Ein ausstehender Shared-Content-Abgleich wird vor dem Seitenwechsel nicht abgeschlossen.');
assert(selectIndex > flushIndex, 'Pages.select() muss erst nach flushPending() ausgeführt werden.');
assert(!selectBody.includes('synchronizeSharedRegionsFromPage(previousPage)'), 'Der Seitenwechsel darf keinen separaten zweiten Shared-Content-Abgleich starten.');

console.log('SHARED-CONTENT-PAGE-TRANSACTION-TEST ERFOLGREICH');

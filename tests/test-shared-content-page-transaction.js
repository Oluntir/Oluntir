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
assert(managerSource.includes('let pendingSharedComponent = null;'), 'Shared-Content verwaltet keinen komponentengenauen Änderungsanker.');
assert(
  managerSource.includes('pendingFlushPage = editor && editor.Pages ? editor.Pages.getSelected() : null;'),
  'scheduleFlush() bindet die Transaktion nicht an die beim Ereignis ausgewählte Seite.'
);
assert(managerSource.includes('const page = pendingFlushPage;'), 'Der Timer liest seine gebundene Ursprungsseite nicht aus.');
assert(/flushPage\(page(?:, \{ propagate: true \})?\);/.test(managerSource), 'Der Timer verarbeitet nicht die gebundene Ursprungsseite.');
assert(!/setTimeout\([\s\S]*?flushSelected\(\)/.test(managerSource), 'Ein verzögerter Flush darf nicht die später ausgewählte Seite verwenden.');
assert(managerSource.includes('flushPending,'), 'flushPending() wird nicht über die Manager-API bereitgestellt.');
assert(managerSource.includes('commitSharedComponentChange(sharedEdit.component, page'), 'Eine Änderung in Nav/Footer wird nicht über den Komponentenpfad synchronisiert.');
assert(managerSource.includes('commitSharedComponentChange(sharedEdit.component, page, { propagate: true, render: false })'), 'Der verzögerte Shared-Content-Pfad darf den RTE-Cursor nicht durch Re-Render zurücksetzen.');
const sharedCommitStart = managerSource.indexOf('function commitSharedComponentChange');
const modelCommitStart = managerSource.indexOf('function commitModelChange', sharedCommitStart);
const sharedCommitBody = managerSource.slice(sharedCommitStart, modelCommitStart);
assert(!sharedCommitBody.includes('modelAuthoritativePages.add(page)'), 'Komponentenänderungen dürfen nicht fälschlich als modellautoritativ markiert werden.');
assert(managerSource.includes('flushPage(page, { propagate: true });'), 'Automatische Shared-Content-Änderungen werden nicht auf die übrigen Seiten propagiert.');

const selectStart = editorSource.indexOf('function selectPageById(pageId)');
const selectEnd = editorSource.indexOf("pageSelect.addEventListener('change'", selectStart);
assert(selectStart >= 0 && selectEnd > selectStart, 'selectPageById() wurde nicht gefunden.');
const selectBody = editorSource.slice(selectStart, selectEnd);
const flushIndex = selectBody.indexOf('OluntirSharedContentManager.flushPending()');
const selectIndex = selectBody.indexOf('editor.Pages.select(page);');
assert(flushIndex >= 0, 'Ein ausstehender Shared-Content-Abgleich wird vor dem Seitenwechsel nicht abgeschlossen.');
assert(selectIndex > flushIndex, 'Pages.select() muss erst nach flushPending() ausgeführt werden.');
assert(!selectBody.includes('synchronizeSharedRegionsFromPage(previousPage)'), 'Der Seitenwechsel darf keinen separaten zweiten Shared-Content-Abgleich starten.');
const modelCommitIndex = selectBody.indexOf('commitCurrentCanvasStateToModel({ skipSharedContent: true });');
const sharedCommitIndex = selectBody.indexOf('commitSelectedCanvasToShared(previousPage, { targetPage: page })');
assert(modelCommitIndex >= 0, 'Der Seitenwechsel übernimmt allgemeine Canvas-Referenzen nicht zuerst in das Projektmodell.');
assert(sharedCommitIndex > modelCommitIndex, 'Der Shared-Zustand muss nach dem allgemeinen Modell-Commit aus dem GrapesJS-Modell erzeugt werden.');
assert(selectBody.includes('writeCurrentProjectSnapshotSynchronously({ skipSharedContent: true });'), 'Der Snapshot vor Pages.select() darf keinen zweiten Shared-Flush starten.');
assert(selectBody.includes('persistCurrentProjectStateSoon(0, { skipSharedContent: true });'), 'Nach dem Seitenwechsel darf der Persistenzlauf den frisch synchronisierten Shared-Zustand nicht erneut aus dem Ziel-Canvas lesen.');

console.log('SHARED-CONTENT-PAGE-TRANSACTION-TEST ERFOLGREICH');

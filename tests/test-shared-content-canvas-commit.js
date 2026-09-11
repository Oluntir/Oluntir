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

assert(managerSource.includes('function commitSelectedCanvasToShared(page, options)'), 'Kompatibilitäts-API für den Seitenwechsel fehlt.');
const commitStart = managerSource.indexOf('function commitSelectedCanvasToShared(page, options)');
const commitEnd = managerSource.indexOf('function componentParent', commitStart);
const commitBody = managerSource.slice(commitStart, commitEnd);
assert(commitBody.includes('const regions = parseRegions(pageHtml(page));'), 'Shared Content wird beim Seitenwechsel nicht aus dem GrapesJS-Projektmodell gelesen.');
assert(commitBody.includes("source: 'grapesjs-project-model'"), 'Der modellautoritative Shared-Commit ist nicht diagnostisch ausgewiesen.');
assert(commitBody.includes('canvasWriteBack: false'), 'Die Diagnose weist den deaktivierten Canvas-Rückschreibepfad nicht aus.');
assert(!commitBody.includes('Canvas.getDocument'), 'Der Shared-Commit darf den Canvas nicht als persistente Quelle lesen.');
assert(!commitBody.includes('querySelector('), 'Der Shared-Commit darf keine Render-DOM-Regionen als Quelle auflösen.');
assert(!commitBody.includes('component.components(canvasInnerHtml)'), 'Veraltetes Canvas-HTML darf niemals in das aktuelle Komponentenmodell zurückgeschrieben werden.');
assert(commitBody.includes('const propagatedPages = changed ? applyToAll(page) : 0;'), 'Eine geänderte zentrale Shared-Quelle wird nicht auf alle übrigen Seiten übertragen.');
assert(commitBody.includes('!changed && targetPage && targetPage !== page && applyToPage(targetPage)'), 'Eine unveränderte zentrale Quelle muss die Zielseite über den Fingerprint-Fast-Path prüfen können.');

const selectStart = editorSource.indexOf('function selectPageById(pageId)');
const selectEnd = editorSource.indexOf("pageSelect.addEventListener('change'", selectStart);
const selectBody = editorSource.slice(selectStart, selectEnd);
const modelCommitIndex = selectBody.indexOf('commitCurrentCanvasStateToModel({ skipSharedContent: true });');
const sharedCommitIndex = selectBody.indexOf('commitSelectedCanvasToShared(previousPage, { targetPage: page })');
const snapshotIndex = selectBody.indexOf('writeCurrentProjectSnapshotSynchronously({ skipSharedContent: true });');
const selectIndex = selectBody.indexOf('editor.Pages.select(page);');
assert(modelCommitIndex >= 0, 'Der allgemeine Modell-Commit fehlt vor dem Shared-Commit.');
assert(sharedCommitIndex > modelCommitIndex, 'Shared Content muss aus dem bereits aktualisierten GrapesJS-Modell gelesen werden.');
assert(snapshotIndex > sharedCommitIndex && snapshotIndex < selectIndex, 'Der modellautoritative Shared-Zustand muss vor Pages.select() synchron persistiert werden.');
assert(selectIndex > sharedCommitIndex, 'Die Zielseite wird vor Abschluss des Shared-Commits ausgewählt.');
assert(selectBody.includes('persistCurrentProjectStateSoon(0, { skipSharedContent: true });'), 'Nach Pages.select() darf kein Zielseiten-Flush die zentrale Quelle zurücküberschreiben.');
assert(!selectBody.includes('setTimeout('), 'Der Seitenwechsel darf nicht durch einen zusätzlichen Timer verzögert werden.');

console.log('SHARED-CONTENT-MODEL-AUTHORITY-TEST ERFOLGREICH');

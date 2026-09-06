'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const index = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const ui = fs.readFileSync(path.join(__dirname, '../editor/js/core/repeat-ui.js'), 'utf8');
const manager = fs.readFileSync(path.join(__dirname, '../editor/js/core/repeat-library-manager.js'), 'utf8');
const engine = fs.readFileSync(path.join(__dirname, '../editor/js/core/repeat-engine-v2.js'), 'utf8');
const editor = fs.readFileSync(path.join(__dirname, '../editor/js/core/editor.js'), 'utf8');
const i18n = fs.readFileSync(path.join(__dirname, '../editor/js/core/i18n.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../editor/css/editor.css'), 'utf8');

assert.ok(index.includes('Oluntir 2.2.0 BETA'));
assert.ok(index.includes('id="oluntir-repeat-panel"'));
assert.ok(index.includes('id="oluntir-repeat-library-panel"'));
assert.ok(index.includes('Projektweite wiederholbare Bereiche'));
assert.ok(index.includes('id="oluntir-repeat-library-catalog"'));
assert.ok(index.includes('id="oluntir-repeat-manager-publish"'));
assert.ok(index.includes('Auf alle Vorkommen anwenden'));
assert.ok(index.includes('id="oluntir-repeat-manager-undo"'));
assert.ok(index.includes('id="oluntir-repeat-manager-redo"'));
assert.ok(index.includes('id="oluntir-repeat-manager-discard"'));
assert.ok(index.includes('id="oluntir-repeat-manager-return"'));
assert.ok(index.includes('Bereich aus Bibliothek einsetzen'));
assert.ok(index.includes('id="oluntir-repeat-definition-select"'));
assert.ok(index.includes('id="oluntir-repeat-library-target-page"'));
assert.ok(index.includes('id="oluntir-repeat-library-target-position"'));
assert.ok(index.includes('id="oluntir-repeat-library-insert"'));
assert.ok(index.includes('3. Auf Zielseite einsetzen'), 'Das Erstellwerkzeug behält den direkten Quelle→Ziel-Ablauf.');
assert.ok(index.includes('repeat-library-manager.js?v=2.2.0-beta-r9'));

assert.ok(ui.includes('function repeatBindingForComponent(component)'));
assert.ok(ui.includes('data-oluntir-repeat-hover-badge'));
assert.ok(ui.includes("background: '#f39c12'"));
assert.ok(ui.includes('data-repeat-overlay-action="edit"'));
assert.ok(ui.includes('data-repeat-overlay-action="remove"'));
assert.ok(ui.includes('OluntirRepeatLibraryManager.openFromBinding'));
assert.ok(ui.includes('OluntirRepeatLibraryManager.removeBinding'));
assert.ok(ui.includes('sharedRegionAncestor(component)'), 'Shared Content muss aus Repeat-Steuerung ausgeschlossen bleiben.');
assert.ok(ui.includes('function selectLibraryDefinition(definitionId)'));
assert.ok(ui.includes('createMaterializedInstance'));
assert.ok(ui.includes('engine().SYNC_POLICY.MANUAL'));
assert.ok(ui.includes('manualSynchronizationExplicit: true'));
assert.ok(ui.includes("doc.addEventListener('click', state.targetCanvasClick, true)"));
assert.ok(ui.includes('directMainBoundary'));
assert.ok(ui.includes("if (!models.length) return { component: main, slot: slotFromRoot(main, page, 'inside') };"));

assert.ok(manager.includes("const WORKSPACE_PAGE_ID = 'oluntir-repeat-workspace'"));
assert.ok(manager.includes('libraryPublishedSnapshot'));
assert.ok(manager.includes('libraryDraftSnapshot'));
assert.ok(manager.includes('libraryDirty'));
assert.ok(manager.includes('function publishActive()'));
assert.ok(manager.includes('function removeInstanceById(instanceId, options)'));
assert.ok(manager.includes('function restoreRemovedInstance(entry)'));
assert.ok(manager.includes("type: 'remove-instance'"));
assert.ok(manager.includes("type === 'publish'"));
assert.ok(manager.includes('function undo()'));
assert.ok(manager.includes('function redo()'));
assert.ok(manager.includes('lockTree(component)'));
assert.ok(manager.includes('editable: false'));
assert.ok(manager.includes('stylable: false'));
assert.ok(manager.includes('createMaterializedInstance'));
assert.ok(manager.includes('Verwendet auf:'));
assert.ok(manager.includes('Revision ${meta.publishedRevision'));

assert.ok(engine.includes("repeatArchitecture: 'central-library-manual-publish'"));
assert.ok(engine.includes("id !== 'oluntir-repeat-workspace'"));
assert.ok(engine.includes('commitLibraryPublication'));
assert.ok(engine.includes('updateInstance'));

assert.ok(editor.includes('OluntirRepeatLibraryManager.bind(editor)'));
assert.ok(editor.includes('} else if (window.OluntirRepeatAutoSynchronization'));
assert.ok(editor.includes("typeof repeatManager.isWorkspacePage === 'function'"));
assert.ok(i18n.includes("'tool.repeatContent':'Wiederholbaren Bereich erstellen'"));
assert.ok(i18n.includes("'tool.repeatLibrary':'Projektweite Repeat-Bibliothek verwalten'"));

assert.ok(css.includes('.oluntir-repeat-library-manager'));
assert.ok(css.includes('.oluntir-repeat-catalog-item'));
assert.ok(css.includes('border-left:3px solid #f39c12'));
assert.ok(css.includes('.gjs-pn-views .gjs-pn-btn[data-oluntir-repeat-library-tool="true"]::after'));

console.log('REPEAT-UI-CONTRACT-TEST ERFOLGREICH');

'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const manager = fs.readFileSync(path.join(__dirname, '../editor/js/core/repeat-library-manager.js'), 'utf8');
assert.ok(manager.includes('function prepareForPageNavigation(targetPageId)'), 'Workspace-Navigation-API fehlt.');
assert.ok(manager.includes("finishWorkspace({ hidePanel: true, reason: 'page-navigation'"), 'Seitenwechsel muss Repeat-Panel/Workspace kontrolliert beenden.');
assert.ok(manager.includes('state.editor.Pages.select(preferredTarget);'), 'Workspace muss vor dem Entfernen sicher auf eine normale Projektseite übergeben werden.');
assert.ok(manager.includes('if (selected === workspace)'), 'Der Handoff muss nur beim aktuell ausgewählten Workspace erzwungen werden.');
assert.ok(manager.includes('repeat.library-workspace-handoff'), 'Der sichere Workspace-Handoff muss diagnostizierbar sein.');
assert.ok(manager.includes("editor.on('page:select'"), 'Direkter GrapesJS-Seitenwechsel braucht ein Workspace-Sicherheitsnetz.');
assert.ok(manager.includes("['btn-new-page', 'btn-rename-page', 'btn-delete-page']"), 'Nur strukturelle Seitenaktionen dürfen im Repeat-Workspace gesperrt werden.');
assert.ok(!manager.includes("['btn-new-page', 'btn-rename-page', 'btn-delete-page', 'page-select']"), 'Seitenauswahl darf im Repeat-Workspace nicht mehr gesperrt sein.');

const editorSource = fs.readFileSync(path.join(__dirname, '../editor/js/core/editor.js'), 'utf8');
assert.ok(editorSource.includes("workspaceOpt.textContent = 'Zentrale Repeat-Bearbeitung'"), 'Seitenauswahl muss den aktiven Repeat-Workspace sichtbar als Statusoption darstellen.');
assert.ok(editorSource.includes("workspaceOpt.disabled = true"), 'Interner Repeat-Workspace darf nicht als normale Projektseite auswählbar sein.');

console.log('REPEAT-WORKSPACE-NAVIGATION-TEST ERFOLGREICH');

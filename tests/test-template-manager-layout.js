'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'template-manager.html'), 'utf8');

const importPos = html.indexOf('<h2>Template importieren und kompilieren</h2>');
const analyzeStepPos = html.indexOf('<h3>1. Template auswählen und analysieren</h3>');
const installStepPos = html.indexOf('<h3>2. Speicherort prüfen und Template aufnehmen</h3>');
const openStepPos = html.indexOf('<h3>3. Oluntir öffnen</h3>');
const unregisteredPos = html.indexOf('<h2>Nicht registrierte Template-Ordner</h2>');
const registeredPos = html.indexOf('<h2>Registrierte Templates</h2>');
const standardsPos = html.indexOf('<h2>Standard-Templates</h2>');

assert.ok(importPos >= 0, 'Import-/Compiler-Bereich fehlt');
assert.ok(analyzeStepPos > importPos, 'Analyse muss der erste Schritt des gemeinsamen Import-Workflows sein');
assert.ok(installStepPos > analyzeStepPos, 'Speicherort/Aufnahme muss direkt nach der Analyse folgen');
assert.ok(openStepPos > installStepPos, 'Oluntir öffnen muss der dritte Schritt sein');
assert.ok(!html.includes('<h2>Template-Ordner</h2>'), 'Template-Ordner darf nicht mehr als separater Hauptbereich erscheinen');
assert.ok(unregisteredPos > openStepPos, 'Nicht registrierte Template-Ordner müssen erst nach dem kompakten Import-Workflow folgen');
assert.ok(registeredPos > unregisteredPos, 'Registrierte Templates müssen unter den nicht registrierten Templates stehen');
assert.ok(standardsPos > registeredPos, 'Standard-Templates müssen unter den User-Template-Bereichen stehen');

assert.ok(html.includes('Empfohlener Ordner:'), 'Empfohlener templates-Ordner muss im Aufnahme-Schritt sichtbar bleiben');
assert.ok(html.includes('templates-Ordner auswählen und prüfen'), 'Ordner-Prüfbutton muss im Aufnahme-Schritt erhalten bleiben');
assert.ok(html.includes('Erneut prüfen'), 'Erneut-prüfen-Button muss erhalten bleiben');
assert.ok(html.includes('Template analysieren'), 'Analyse-Button für den modularen Import fehlt');
assert.ok(html.includes('Template aufnehmen'), 'Aufnahme-Button für das kompilierte Template fehlt');
assert.ok(html.includes('frameworks/</code> werden nicht verändert'), 'Hinweis auf unveränderten Oluntir-Kern/frameworks fehlt');
assert.ok(html.includes('const readyToAnalyze = Boolean(importNameEl.value.trim() && importArchiveEl.files && importArchiveEl.files[0])'), 'Analyse darf nicht von einem vorher gewählten templates-Ordner abhängen');
assert.ok(html.includes('installImportButton.disabled = !pendingCompilation'), 'Template aufnehmen muss nach erfolgreicher Analyse unabhängig von einer vorherigen Ordnerwahl aktiv werden');
assert.ok(html.includes('await selectAndInspectTemplatesRoot({ write: true });'), 'Schreibfreigabe muss beim Aufnehmen/Verwalten bei Bedarf angefordert werden');
assert.ok(!html.includes("${rootHandle ? '' : 'disabled'}"), 'Entfernen darf vor der Ordnerprüfung nicht dauerhaft ausgegraut sein');

assert.ok(html.includes('Bootstrap 5.3.8 – Community Edition'), 'Bootstrap-5-Systemtemplate fehlt');
assert.ok(html.includes('Version 5.3.8'), 'Bootstrap-5-Version muss sichtbar bleiben');
assert.ok(html.includes('Bootstrap 4.6.2 – Community Edition'), 'Bootstrap-4-Systemtemplate fehlt');
assert.ok(html.includes('Version 4.6.2'), 'Bootstrap-4-Version muss sichtbar bleiben');
assert.ok((html.match(/>geschützt</g) || []).length >= 2, 'Standard-Templates müssen weiterhin als geschützt markiert sein');
assert.ok(html.includes('können hier nicht administriert oder entfernt werden'), 'Referenzhinweis für geschützte Standard-Templates fehlt');

console.log('TEMPLATE-MANAGER-LAYOUT-TEST ERFOLGREICH');

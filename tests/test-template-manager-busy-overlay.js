'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'template-manager.html'), 'utf8');

assert.ok(html.includes('id="busy-overlay"'), 'Abdunklungs-/Busy-Overlay fehlt.');
assert.ok(html.includes('id="busy-progress"'), 'Fortschrittsanzeige fehlt.');
assert.ok(html.includes('id="busy-progress-bar"'), 'Fortschrittsbalken fehlt.');
assert.ok(html.includes('function showBusy('), 'Busy-Overlay muss programmatisch aktiviert werden können.');
assert.ok(html.includes('function updateBusy('), 'Fortschrittsanzeige muss aktualisierbar sein.');
assert.ok(html.includes('function hideBusy('), 'Busy-Overlay muss nach Abschluss zuverlässig geschlossen werden.');
assert.ok(html.includes("const pickerOptions = { id: 'oluntir-templates-root', mode: 'readwrite' }"), 'DirectoryPicker soll Chromium mit stabiler Picker-ID den zuletzt verwendeten Ort merken lassen.');
assert.ok(html.includes('pickerOptions.startIn = rememberedRootHandle'), 'Ein gemerkter templates-Ordner soll als Startort des Pickers verwendet werden.');
assert.ok(html.includes("onRootReady() { showBusy('Template wird aufgenommen'"), 'Nach der Ordnerauswahl muss die Oberfläche beim Aufnahmevorgang abgedunkelt werden.');
assert.ok(html.includes('const percent = Math.min(85'), 'Dateikopiervorgang muss einen determinierten Fortschritt liefern.');
assert.ok(html.includes("updateBusy('Template-Registry wird aktualisiert …', 95)"), 'Registry-Phase muss im Fortschritt sichtbar sein.');
assert.ok(html.includes("updateBusy('Aufnahme wird verifiziert und die Template-Liste neu geprüft …', 97)"), 'Abschließender Rescan muss im Fortschritt sichtbar sein.');

const pickerPos = html.indexOf('window.showDirectoryPicker(pickerOptions)');
const confirmInstallPos = html.indexOf("confirmInstallButton.addEventListener('click'");
const installBusyPos = html.indexOf("onRootReady() { showBusy('Template wird aufgenommen'", confirmInstallPos);
assert.ok(confirmInstallPos >= 0 && pickerPos >= 0 && installBusyPos >= 0, 'Aufnahmefluss unvollständig.');
assert.ok(pickerPos < installBusyPos, 'Das Overlay darf die für showDirectoryPicker nötige User-Geste nicht vor dem Picker verbrauchen.');


const analyzeHandlerStart = html.indexOf("analyzeImportButton.addEventListener('click'");
const installHandlerStart = html.indexOf("installImportButton.addEventListener('click'", analyzeHandlerStart);
assert.ok(analyzeHandlerStart >= 0 && installHandlerStart > analyzeHandlerStart, 'Analyse-Handler konnte nicht eindeutig bestimmt werden.');
const analyzeHandler = html.slice(analyzeHandlerStart, installHandlerStart);
assert.ok(/finally\s*\{[\s\S]*?hideBusy\(\);[\s\S]*?updateImportButtons\(\);[\s\S]*?\}/.test(analyzeHandler), 'Analyse muss das Busy-Overlay im finally sowohl bei Erfolg als auch bei Fehler schließen.');

console.log('TEMPLATE-MANAGER-BUSY-OVERLAY-TEST ERFOLGREICH');

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'template-manager.html'), 'utf8');

assert.ok(html.includes('id="install-confirmation"'), 'Die Aufnahme muss eine eigene Oluntir-Bestätigung besitzen.');
assert.ok(html.includes('id="confirm-install"'), 'Die Bestätigung braucht einen separaten Benutzer-Button.');

const start = html.indexOf("installImportButton.addEventListener('click'");
const confirmStart = html.indexOf("confirmInstallButton.addEventListener('click'", start);
const confirmEnd = html.indexOf("registeredEl.addEventListener('click'", confirmStart);
assert.ok(start >= 0 && confirmStart > start && confirmEnd > confirmStart, 'Aufnahme-Handler konnten nicht eindeutig gefunden werden.');

const firstHandler = html.slice(start, confirmStart);
const confirmHandler = html.slice(confirmStart, confirmEnd);
assert.ok(!firstHandler.includes('window.confirm('), 'Vor dem Directory-Picker darf kein natives confirm() die User-Geste verbrauchen.');
const pickerCall = 'await selectAndInspectTemplatesRoot({';
assert.ok(confirmHandler.includes(pickerCall), 'Der Directory-Picker muss direkt aus dem separaten Bestätigungs-Klick ausgelöst werden.');
const beforePicker = confirmHandler.slice(0, confirmHandler.indexOf(pickerCall));
assert.ok(!beforePicker.includes('await '), 'Vor dem Directory-Picker darf kein vorheriges await die User-Aktivierung verlieren.');

console.log('TEMPLATE-MANAGER-USER-GESTURE-TEST ERFOLGREICH');

#!/usr/bin/env node
'use strict';

const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('template-manager.html', 'utf8');
const registryJson = JSON.parse(fs.readFileSync('templates/registry.json', 'utf8'));
const registryJs = fs.readFileSync('templates/registry.js', 'utf8');

const start = html.indexOf("registeredEl.addEventListener('click', async event => {");
const end = html.indexOf("unregisteredEl.addEventListener('click'", start);
assert(start >= 0 && end > start, 'Handler für registrierte Templates wurde nicht gefunden.');
const handler = html.slice(start, end);

assert(handler.includes('ensureTemplatesRootForManagementAction()'), 'Entfernen verwendet nicht den bereits freigegebenen/gespeicherten templates-Handle.');
assert(!handler.includes('selectAndInspectTemplatesRoot('), 'Entfernen darf den Directory-Picker nicht implizit öffnen.');
assert(html.includes('Der Entfernen-Button öffnet bewusst keinen Explorer.'), 'Bei fehlender Ordnerfreigabe fehlt eine eindeutige Benutzerführung.');
assert.deepStrictEqual(registryJson.templates, [], 'Das synthetische runtime-test Template darf nicht mehr ausgeliefert werden.');
assert(!registryJs.includes('runtime-test'), 'registry.js enthält weiterhin runtime-test.');
assert(!fs.existsSync('templates/runtime-test'), 'Der Ordner templates/runtime-test wurde nicht aus dem Distributionsstand entfernt.');

console.log('TEMPLATE-MANAGER-REMOVE-ACTION-TEST ERFOLGREICH');

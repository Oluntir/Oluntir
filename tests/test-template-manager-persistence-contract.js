'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'template-manager.html'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'editor/js/core/template-runtime-bootstrap.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'editor/js/core/template-runtime.js'), 'utf8');
const marker = JSON.parse(fs.readFileSync(path.join(root, 'templates/template-root.json'), 'utf8'));

assert.strictEqual(marker.role, 'oluntir-template-root', 'templates/ braucht eine eindeutige Root-Kennung.');
assert.ok(html.includes('Empfohlener Ordner:'), 'Die Aufnahme muss den empfohlenen Zielordner sichtbar erklären.');
assert.ok(html.includes('recommendedTemplatesPath()'), 'Der Zielhinweis muss aus der aktuell geöffneten Oluntir-Installation abgeleitet werden.');
assert.ok(html.includes('await api.validateTemplatesRoot(handle)'), 'Ein ausgewählter templates-Ordner muss als Oluntir-Template-Root validiert werden.');
assert.ok(html.includes('const persistedRegistry = await api.readRegistry(rootHandle'), 'Nach der Aufnahme muss registry.json physisch zurückgelesen werden.');
assert.ok(html.includes('await api.verifyRegisteredTemplate(rootHandle, persistedEntry)'), 'Nach der Aufnahme müssen Ordner, template.json und template.js verifiziert werden.');
assert.ok(html.includes('Template aufgenommen und verifiziert.'), 'Erfolg darf erst nach der Datenträger-Selbstkontrolle gemeldet werden.');
assert.ok(html.includes('templates/registry.js?manager=${Date.now()}'), 'Der Manager muss registry.js beim Neustart cachefrei laden.');
assert.ok(bootstrap.includes('templates/registry.js?oluntir=${Date.now()}'), 'Der normale Oluntir-Start muss registry.js cachefrei laden.');
assert.ok(runtime.includes('oluntir=${Date.now()}'), 'Kompilierte template.js-Dateien müssen cachefrei geladen werden.');

console.log('TEMPLATE-MANAGER-PERSISTENCE-CONTRACT-TEST ERFOLGREICH');

'use strict';
const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('editor/js/core/shared-content-manager.js', 'utf8');
const applyStart = source.indexOf('function applyToPage(page, options)');
const applyEnd = source.indexOf('\n  function applyToAll', applyStart);
assert(applyStart >= 0 && applyEnd > applyStart, 'applyToPage() nicht gefunden.');
const body = source.slice(applyStart, applyEnd);

assert(body.includes("updateRegionComponent(components.header, 'header'"), 'Header muss gezielt aktualisiert werden.');
assert(body.includes("updateRegionComponent(components.navigation, 'nav'"), 'Navigation muss gezielt aktualisiert werden.');
assert(body.includes("updateRegionComponent(components.footer, 'footer'"), 'Footer muss gezielt aktualisiert werden.');
assert(body.includes('pageRegionComponents(page, root)'), 'Shared-Region-Komponenten müssen aus dem aktuellen Seitenbaum aufgelöst werden.');
assert(body.includes('pageAppliedFingerprints.get(page)'), 'Der Fingerprint-Hinweis für unveränderte Shared-Regionen fehlt.');
assert(body.includes('pageAppliedFingerprints.set(page, fingerprint)'), 'Erfolgreich synchronisierte Zielseiten werden nicht für den schnellen Folgepfad markiert.');
assert(!body.includes('component.components(after)'), 'Der komplette Seitenbaum darf nicht ersetzt werden.');
assert(!body.includes('replaceRegions(before, regions)'), 'applyToPage darf keinen vollständigen Seiten-Neuaufbau erzeugen.');
assert(!body.includes('regionFingerprint(parseRegions(pageHtml(page)))'), 'Die komplette Zielseite darf nicht nach jeder kleinen Shared-Änderung erneut serialisiert werden.');

console.log('SHARED-CONTENT-TARGETED-REGIONS-TEST ERFOLGREICH');

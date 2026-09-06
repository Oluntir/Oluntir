#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'editor/js/core/shared-content-manager.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(!source.includes('const pageRegionCache = new WeakMap()'), 'Shared Content darf keine langlebigen GrapesJS-Regionobjekte cachen.');

const regionStart = source.indexOf('function pageRegionComponents(page, root)');
const regionEnd = source.indexOf('\n  function commitSelectedCanvasToShared', regionStart);
assert(regionStart >= 0 && regionEnd > regionStart, 'pageRegionComponents() wurde nicht gefunden.');
const regionBody = source.slice(regionStart, regionEnd);
assert(regionBody.includes("header: findComponentByTag(root, 'header')"), 'Header wird nicht aus dem aktuellen Seitenbaum aufgelöst.');
assert(regionBody.includes("navigation: findComponentByTag(root, 'nav')"), 'Navigation wird nicht aus dem aktuellen Seitenbaum aufgelöst.');
assert(regionBody.includes("footer: findComponentByTag(root, 'footer')"), 'Footer wird nicht aus dem aktuellen Seitenbaum aufgelöst.');
assert(!regionBody.includes('.get(page)'), 'pageRegionComponents() darf keine alten Komponentenreferenzen aus einem Cache lesen.');
assert(!regionBody.includes('.set(page'), 'pageRegionComponents() darf keine Komponentenreferenzen dauerhaft speichern.');

const applyStart = source.indexOf('function applyToPage(page, options)');
const applyEnd = source.indexOf('\n  function applyToAll', applyStart);
assert(applyStart >= 0 && applyEnd > applyStart, 'applyToPage() wurde nicht gefunden.');
const applyBody = source.slice(applyStart, applyEnd);
assert(applyBody.includes('if (!force && pageAppliedFingerprints.get(page) === fingerprint) return false;'), 'Der schnelle Fingerprint-Pfad für bereits synchronisierte Seiten fehlt.');
assert(applyBody.includes('const components = pageRegionComponents(page, root);'), 'Zielregionen werden vor einer tatsächlichen Änderung nicht frisch aufgelöst.');
assert(applyBody.includes('const missingRegions = [];'), 'Nicht auflösbare Zielregionen werden nicht explizit erfasst.');
assert(applyBody.includes("diagnostic('shared-target-apply-incomplete'"), 'Fehlende Zielregionen werden nicht diagnostiziert.');
assert(!applyBody.includes('parseRegions(pageHtml(page))'), 'Der schnelle Zielseitenpfad darf nicht die komplette Seite serialisieren und erneut parsen.');
assert(!applyBody.includes('retryComponents'), 'Normale Shared-Anwendungen dürfen keinen zweiten vollständigen GrapesJS-Unterbaum-Write ausführen.');

console.log('SHARED-CONTENT-LIVE-TARGET-REFRESH-TEST ERFOLGREICH');

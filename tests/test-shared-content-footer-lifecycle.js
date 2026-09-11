#!/usr/bin/env node
'use strict';

const fs = require('fs');
const assert = require('assert');

const shared = fs.readFileSync('editor/js/core/shared-content-manager.js', 'utf8');
const includes = fs.readFileSync('editor/js/core/includes.js', 'utf8');

assert(shared.includes('let pendingFlushOptions = null;'), 'Strukturelle Shared-Flush-Optionen fehlen.');
assert(shared.includes("if (tagName === 'footer') return ['footer'];"), 'Footer-Löschung wird nicht als explizites Shared-Region-Clear erkannt.');
assert(shared.includes("if (tagName === 'header') return ['header', 'navigation'];"), 'Header-Löschung muss eingebettete Navigation mit berücksichtigen.');
assert(shared.includes("scheduleFlush(null, {\n          structural: true,"), 'Add/Remove darf nicht mehr das entfernte Komponentenmodell als autoritativen Shared-Commit verwenden.');
assert(shared.includes("clearRegions: eventName === 'component:remove' ? removedSharedRegions(component) : []"), 'component:remove übergibt keine expliziten Löschregionen.');
assert(shared.includes('window.OluntirIncludes.updateLayoutRegions(regions, { allowEmpty: clearRegions });'), 'Shared-Flush kann explizit gelöschte Regionen nicht leeren.');
assert(shared.includes('matches.forEach((current) => current.remove());'), 'Leere zentrale Shared-Regionen werden auf Zielseiten nicht entfernt.');
assert(shared.includes('const previousApplying = applying;') && shared.includes('persistEditableStyleInMarkup(component);'), 'Shared-Stilpersistenz besitzt keinen Rekursionsguard.');
assert(shared.includes('applying = true;') && shared.includes('applying = previousApplying;'), 'Selbst erzeugte component:update/styleUpdate-Ereignisse werden nicht unterdrückt.');

assert(includes.includes('updateLayoutRegions: (regions, options) => {'), 'Includes-API akzeptiert keine kontrollierte Empty-Region-Freigabe.');
assert(includes.includes('const allowEmpty = new Set('), 'Includes-API verwaltet keine allowEmpty-Regionen.');
assert(includes.includes("if (!regions[name].trim() && !allowEmpty.has(name)) return;"), 'Leere Regionen werden nicht nur bei expliziter Löschfreigabe übernommen.');

console.log('SHARED-CONTENT-FOOTER-LIFECYCLE-TEST ERFOLGREICH');

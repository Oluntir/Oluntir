#!/usr/bin/env node
'use strict';

const fs = require('fs');
const source = fs.readFileSync('editor/js/core/shared-content-manager.js', 'utf8');
const editor = fs.readFileSync('editor/js/core/editor.js', 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const sharedStart = source.indexOf('function commitSharedComponentChange');
const sharedEnd = source.indexOf('function commitModelChange', sharedStart);
assert(sharedStart >= 0 && sharedEnd > sharedStart, 'commitSharedComponentChange() nicht gefunden.');
const sharedBody = source.slice(sharedStart, sharedEnd);
assert(sharedBody.includes('const targetedPages = [];'), 'Komponentengenaue Zielseitenverfolgung fehlt.');
assert(sharedBody.includes('const fallbackPages = [];'), 'Struktureller Fallback wird nicht getrennt verfolgt.');
assert(sharedBody.includes('const target = targetRoot && componentAtPath(targetRoot, path);'), 'Shared-Textänderungen werden nicht über den exakten Komponentenpfad aufgelöst.');
assert(sharedBody.includes('targetedPages.forEach((targetPage) => pageAppliedFingerprints.set(targetPage, afterCentral));'), 'Gezielt aktualisierte Seiten werden nicht als synchron markiert.');
assert(sharedBody.includes('fallbackPages.forEach((targetPage)'), 'Fallback darf nur auf tatsächlich nicht auflösbaren Zielseiten laufen.');
assert(!sharedBody.includes('applyToAll(page)'), 'Eine normale Shared-Komponentenänderung darf nicht zusätzlich eine projektweite Vollpropagation auslösen.');

const modelStart = source.indexOf('function commitSelectedCanvasToShared');
const modelEnd = source.indexOf('function componentParent', modelStart);
const modelBody = source.slice(modelStart, modelEnd);
assert(modelBody.includes('const propagatedPages = changed ? applyToAll(page) : 0;'), 'Echte zentrale Strukturänderungen müssen weiterhin projektweit propagiert werden.');
assert(modelBody.includes('!changed && targetPage && targetPage !== page && applyToPage(targetPage)'), 'Beim Seitenwechsel ohne zentrale Änderung muss der günstige Zielseitenpfad verwendet werden.');
assert(!modelBody.includes('forceTarget'), 'Der Seitenwechsel darf keine erzwungene zweite Zielseiten-Neusynchronisierung mehr anfordern.');

const switchStart = editor.indexOf('function selectPageById(pageId)');
const switchEnd = editor.indexOf("pageSelect.addEventListener('change'", switchStart);
const switchBody = editor.slice(switchStart, switchEnd);
assert(switchBody.includes('commitSelectedCanvasToShared(previousPage, { targetPage: page })'), 'Seitenwechsel verwendet nicht den optimierten Shared-Commit.');
assert(!switchBody.includes('forceTarget: true'), 'Seitenwechsel erzwingt weiterhin unnötige Zielseiten-Vollarbeit.');

console.log('SHARED-CONTENT-PERFORMANCE-CONTRACT-TEST ERFOLGREICH');

const centralFingerprintIndex = sharedBody.indexOf('const centralChanged = beforeCentral !== afterCentral;');
const targetLoopIndex = sharedBody.indexOf('editor.Pages.getAll().forEach((targetPage) => {');
const noChangeExitIndex = sharedBody.indexOf('if (!centralChanged) {');
assert(centralFingerprintIndex >= 0 && noChangeExitIndex > centralFingerprintIndex, 'Shared Content muss vor Zielmutationen feststellen, ob sich der zentrale Inhalt wirklich geändert hat.');
assert(targetLoopIndex > noChangeExitIndex, 'Zielseiten dürfen erst nach dem centralChanged-Fast-Exit bearbeitet werden.');
assert(sharedBody.includes('skippedUnchanged: true'), 'Diagnose für übersprungene redundante Shared-Commits fehlt.');
assert(sharedBody.includes('}, 180);'), 'Shared-Content-Speichern muss kurz entprellt werden, statt jeden redundanten Event sofort zu speichern.');


const bindStart = source.indexOf('function bind(nextEditor)');
const bindBody = source.slice(bindStart);
assert(bindBody.includes("['component:update', 'component:styleUpdate']"), 'Shared Content muss normale Update-/Style-Events separat filtern.');
assert(bindBody.includes('if (!component || !sharedRegionInfo(component)) return;'), 'Nicht-Shared-Komponenten dürfen keinen Shared-Content-Flush auslösen.');
assert(bindBody.includes("['component:add', 'component:remove']"), 'Add/Remove muss als struktureller Sicherheitsfall beobachtet bleiben.');

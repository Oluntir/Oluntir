'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const editorSource = fs.readFileSync(path.join(__dirname, '../editor/js/core/editor.js'), 'utf8');
const storageCapture = editorSource.indexOf('localStorage.getItem(ACTIVE_FRAMEWORK.storageKey)');
const grapesInit = editorSource.indexOf('editor = grapesjs.init({');
assert.ok(storageCapture >= 0, 'Der persistierte Projektsnapshot muss vor dem Editorstart gelesen werden.');
assert.ok(grapesInit >= 0 && storageCapture < grapesInit, 'Repeat-Metadaten müssen vor grapesjs.init() gesichert werden, bevor GrapesJS unbekannte Top-Level-Daten verlieren kann.');
assert.ok(editorSource.includes("hydrationSource: 'pre-grapesjs-local-storage'"), 'Die Initialhydrierung muss ihren Ursprung diagnostisch ausweisen.');

const logs = [];
global.OluntirLogger = {
  info(category, message, data) { logs.push({ category, message, data }); }
};

const repeat = require('../editor/js/core/repeat-engine-v2.js');
repeat.reset();

const listeners = {};
const triggered = [];
const editor = {
  on(name, fn) { (listeners[name] ||= []).push(fn); },
  trigger(name, payload) { triggered.push({ name, payload }); },
  // Simuliert den entscheidenden Session-Fall: GrapesJS hat die unbekannten
  // oluntir-Top-Level-Metadaten nach dem Autoload nicht mehr in getProjectData().
  getProjectData() { return { pages: [{ id: 'page-source' }] }; }
};

const persistedProjectData = {
  pages: [{ id: 'page-source' }, { id: 'page-target' }],
  oluntir: {
    repeatEngine: {
      schemaVersion: 3,
      revision: 12,
      definitions: [{
        definitionId: 'def-session',
        correlationId: 'def-session',
        repeatKey: 'repeat-session',
        source: { pageId: 'page-source', rootIdentity: 'ol_section_source', relativeIdentityPath: [] },
        scope: 'section',
        synchronizationPolicy: 'automatic',
        referencePolicy: 'allow',
        schemaVersion: 3,
        revision: 2,
        metadata: { displayName: 'Session-Karten' }
      }],
      instances: [{
        instanceId: 'inst-session',
        definitionId: 'def-session',
        correlationId: 'def-session',
        pageId: 'page-target',
        rootIdentity: 'ol_section_target',
        state: 'active',
        appliedRevision: 0,
        schemaVersion: 3,
        metadata: {}
      }],
      references: []
    }
  }
};

assert.strictEqual(repeat.bind(editor, {
  initialProjectData: persistedProjectData,
  hydrationSource: 'pre-grapesjs-local-storage'
}), true);

const snapshot = repeat.snapshot();
assert.strictEqual(snapshot.definitions.length, 1, 'Die Repeat-Definition muss sofort aus dem vor GrapesJS gesicherten Projektstand hydriert werden.');
assert.strictEqual(snapshot.instances.length, 1, 'Die Repeat-Instanz muss nach einem Session-Neustart wieder verfügbar sein.');
assert.strictEqual(snapshot.definitions[0].metadata.displayName, 'Session-Karten');
assert.strictEqual(repeat.getDefinitions()[0].definitionId, 'def-session', 'Die Listenfunktion muss dieselbe hydrierte Definition über getDefinitions() erhalten.');
assert.ok(triggered.some(item => item.name === 'oluntir:repeat:changed'), 'Nach der Hydrierung muss die Repeat-UI über den importierten Zustand informiert werden.');
assert.ok(logs.some(item => item.message === 'repeat.project-state-hydrated' && item.data.definitionCount === 1 && item.data.instanceCount === 1), 'Die Session-Hydrierung muss mit Definition-/Instanzanzahl protokolliert werden.');

console.log('REPEAT-SESSION-HYDRATION-TEST ERFOLGREICH');

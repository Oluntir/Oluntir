'use strict';

const assert = require('assert');
let persistenceRequests = 0;

global.OluntirPersistProjectSoon = function (delay) {
  assert.strictEqual(delay, 0, 'Repeat-Änderungen müssen ohne unnötige Verzögerung gespeichert werden.');
  persistenceRequests += 1;
};

const repeat = require('../editor/js/core/repeat-engine-v2.js');
repeat.reset();
repeat.bind({ on() {}, trigger() {} });

const definition = repeat.createDefinition({
  source: { pageId: 'page-source', rootIdentity: 'component-source' }
});
repeat.createInstance(definition.definitionId, {
  pageId: 'page-target',
  rootIdentity: 'component-target'
});

assert.strictEqual(persistenceRequests, 2, 'Definition und Instanz müssen jeweils eine Projektsicherung anfordern.');
console.log('REPEAT-PERSISTENCE-BRIDGE-TEST ERFOLGREICH');

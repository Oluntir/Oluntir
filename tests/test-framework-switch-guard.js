'use strict';

const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('editor/js/core/editor.js', 'utf8');
assert(source.includes("frameworkSelect.addEventListener('change', async () =>"));
assert(source.includes('Framework wechseln und vorher speichern?'));
assert(source.includes('await window.OluntirPersistProjectNow()'));
assert(source.indexOf('await window.OluntirPersistProjectNow()') < source.indexOf('window.setPageBuilderFramework(next)'));
assert(source.includes('frameworkId: ACTIVE_FRAMEWORK.id'));
assert(source.includes('frameworkVersion: ACTIVE_FRAMEWORK.version || \'unversioned\''));
console.log('FRAMEWORK-SWITCH-GUARD-TEST ERFOLGREICH');

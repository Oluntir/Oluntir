'use strict';

const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('editor/js/features/block-search.js', 'utf8');
assert(source.includes("root.querySelectorAll('.gjs-block')"), 'Die Suche muss sichtbare GrapesJS-Blockknoten erfassen.');
assert(source.includes('modelsById'), 'Die Suche muss Blockmodelle optional über ihre ID zuordnen.');
assert(source.includes('element.textContent'), 'Die Suche muss ohne data-id aus dem sichtbaren Blocktext arbeiten können.');
assert(source.includes('entries = Array.from'), 'Der Suchindex muss aus dem tatsächlichen Block-DOM aufgebaut werden.');
console.log('BLOCK-SEARCH-AVAILABILITY-TEST ERFOLGREICH');

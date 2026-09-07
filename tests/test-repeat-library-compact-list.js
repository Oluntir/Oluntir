'use strict';
const assert = require('assert');
const fs = require('fs');

const index = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('editor/css/editor.css', 'utf8');
const manager = fs.readFileSync('editor/js/core/repeat-library-manager.js', 'utf8');

assert(index.includes('<h3>Repeat-Bibliothek</h3><p>Bereich zentral bearbeiten</p>'), 'Überschrift/Subtitel der Bearbeitungsbibliothek fehlen.');
assert(index.includes('<h3>Bereich aus Bibliothek einsetzen</h3><p>Auswahl Repeat und bei Ziel einfügen</p>'), 'Überschrift/Subtitel der Einsetzbibliothek fehlen.');
assert(index.includes('id="oluntir-repeat-library-sort-recent"'), 'Sortierbutton „Zuletzt angelegt“ fehlt.');
assert(index.includes('>Zuletzt angelegt</button>'));
assert(index.includes('id="oluntir-repeat-library-sort-alpha"'), 'Sortierbutton A–Z fehlt.');
assert(index.includes('>A–Z</button>'));
assert(index.includes('id="oluntir-repeat-library-expand"'));
assert(index.includes('Gesamtliste erweitern'));
assert(index.includes('id="oluntir-repeat-library-catalog"'));
assert(index.includes('id="oluntir-repeat-insert-catalog"'), 'Die Einsetzfunktion muss dieselbe kompakte Listendarstellung verwenden.');
assert(index.includes('id="oluntir-repeat-definition-select" hidden'), 'Technischer Select darf für Kompatibilität nur verborgen weiterbestehen.');
assert(!index.includes('id="oluntir-repeat-manager-insert"'), '„Auf Seite einsetzen“ darf nicht mehr im zentralen Bearbeitungsbereich liegen.');
assert(index.includes('class="fa fa-undo"'), 'Undo muss als Icon vorliegen.');
assert(index.includes('class="fa fa-repeat"'), 'Redo muss als Icon vorliegen.');
assert(index.includes('class="fa fa-eraser"'), 'Entwurf verwerfen muss das Radiergummi-Icon verwenden.');
assert(css.includes('.oluntir-repeat-catalog[data-expanded="true"]'));
assert(css.includes('max-height:176px'));
assert(css.includes('overflow-y:auto'));
assert(css.includes('.oluntir-repeat-catalog--insert'));
assert(css.includes('[data-selected="true"]'));
assert(manager.includes("catalogSort: 'recent'"));
assert(manager.includes("state.catalogSort === 'alpha'"));
assert(manager.includes('function renderEditCatalog(host, definitions)'));
assert(manager.includes('function renderInsertCatalog(host, definitions)'));
assert(manager.includes("root.OluntirRepeatUi.selectLibraryDefinition(definition.definitionId)"));
assert(manager.includes("'Gesamtliste reduzieren' : 'Gesamtliste erweitern'"));
assert(manager.includes("state.catalogExpanded = !state.catalogExpanded"));

console.log('REPEAT-LIBRARY-COMPACT-LIST-TEST ERFOLGREICH');

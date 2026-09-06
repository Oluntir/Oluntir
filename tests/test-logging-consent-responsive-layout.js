const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('editor/css/editor.css', 'utf8');
const js = fs.readFileSync('editor/js/core/oluntir-logging-consent.js', 'utf8');

assert.ok(html.includes('Oluntir – Zustimmung &amp; lokale Diagnose'), 'Kompakter Dialogtitel fehlt.');
assert.ok(html.includes('Ohne Logging starten'), 'Kurze Ohne-Logging-Aktion fehlt.');
assert.ok(html.includes('Zustimmen und logs-Ordner wählen'), 'Kurze Logging-Aktion fehlt.');
assert.ok(css.includes('width: 80vw;'), 'Logging-Dialog muss 80 % der Viewport-Breite verwenden.');
assert.ok(css.includes('grid-template-rows: auto minmax(0, 1fr) auto;'), 'Kopf, scrollbarer Inhalt und sichtbare Aktionen müssen getrennt bleiben.');
assert.ok(css.includes('overflow-y: auto;'), 'Nur der Inhaltsbereich darf bei geringer Höhe scrollen.');
assert.ok(css.includes('.oluntir-consent-actions { flex-wrap: wrap; gap: .5rem;'), 'Aktionsbereich muss dauerhaft kompakt und responsiv bleiben.');
assert.ok(js.includes("authorizedBy: 'Oluntir 2.1.0 BETA'"), 'Logging-Metadaten müssen den aktuellen Beta-Stand ausweisen.');
assert.ok(js.includes("'Zustimmen und logs-Ordner wählen'"), 'Dynamischer Buttontext muss dem kompakten Dialog entsprechen.');

console.log('LOGGING-CONSENT-RESPONSIVE-LAYOUT-TEST ERFOLGREICH');

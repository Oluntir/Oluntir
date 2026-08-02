const fs = require('fs');
const path = require('path');

const presentation = fs.readFileSync(path.join(__dirname, '../editor/js/core/presentation-vocabulary.js'), 'utf8');
const shared = fs.readFileSync(path.join(__dirname, '../editor/js/core/shared-content-manager.js'), 'utf8');
const snapshot = fs.readFileSync(path.join(__dirname, '../editor/js/core/export-snapshot.js'), 'utf8');
const exporter = fs.readFileSync(path.join(__dirname, '../editor/js/core/export.js'), 'utf8');

if (!/function materializeHtml\s*\(/.test(presentation)) throw new Error('Export-Materialisierung des Darstellungsvokabulars fehlt');
if (!/persistTree\(component\)/.test(presentation)) throw new Error('Rekursive Persistierung der Darstellung fehlt');
if (!/Export is model-first/.test(shared)) throw new Error('Model-First-Exportvertrag fehlt');
if (/const committed = commitSelectedCanvasToShared\(page\)/.test(shared)) throw new Error('Export überschreibt das Modell weiterhin aus dem Canvas');
if (!/presentation\.materializeHtml\(html, \{ stripMetadata: true \}\)/.test(snapshot)) throw new Error('Export-Snapshot materialisiert die Darstellung nicht');
if (!/presentationApi\.materializeHtml\(html, \{ stripMetadata: true \}\)/.test(exporter)) throw new Error('Finaler Export materialisiert die Darstellung nicht defensiv');
console.log('OLUNTIR-1.3.1-EXPORT-PRESENTATION-TRANSLATION-TEST ERFOLGREICH');

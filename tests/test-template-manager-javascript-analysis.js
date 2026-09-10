'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

(function () {
  const html = fs.readFileSync(path.join(__dirname, '..', 'template-manager.html'), 'utf8');
  assert(html.includes('templates/javascript-analyzer.js?v=2.3.0'), 'Template-Manager muss den universellen JavaScript-Analyzer laden.');
  assert(html.includes('templates/javascript-runtime-planner.js?v=2.3.0'), 'Template-Manager muss den universellen JavaScript-Runtime-Planer laden.');
  assert(html.includes('templates/javascript-activation-planner.js?v=2.3.0'), 'Template-Manager muss den universellen JavaScript-Aktivierungsplaner laden.');
  ['JS-Dateien primär','Custom-JS','JS-Bibliotheken','Behavior-Bindungen','HTML/Section-Zuordnungen','JS-Abhängigkeiten','Section-Verhalten','Globales Verhalten','Helper / Konfiguration','Unaufgelöst','Geplante JS-Dateien','Runtime-Verhalten freigegeben','JS für Preview/Export vorbereitet','Davon Abhängigkeiten','Base-JS wiederverwendet','JS-Dateien blockiert','Inline-JS zurückgestellt'].forEach(label => {
    assert(html.includes(label), `JavaScript-Analysemetrik fehlt: ${label}`);
  });
  assert(html.includes('behavior-manifest.json'));
  assert(html.includes('dependencies.json'));
  assert(html.includes('runtime-plan.json'));
  assert(html.includes('javascript-activation-plan.json'));
  assert(/Während der Analyse selbst wird weiterhin kein Template-JavaScript ausgeführt/.test(html));
  console.log('TEMPLATE-MANAGER-JAVASCRIPT-ANALYSIS-TEST ERFOLGREICH');
})();

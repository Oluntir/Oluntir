# Oluntir 1.3.1 – Technisches Handbuch

## 1. Laufzeit

Oluntir wird über `index.html` gestartet. GrapesJS liegt unverändert unter `vendor/grapesjs/`. Oluntir-spezifische Integration liegt unter `editor/integrations/grapesjs/`.

## 2. Projektmodell

Seiten und Komponenten werden im GrapesJS-Projektmodell gespeichert. `layout-identities.js` ergänzt interne stabile IDs. Diese IDs bleiben im Projekt erhalten und werden vor dem finalen Export entfernt.

## 3. Semantische Pipeline

- `semantic-dictionary.js`: bekannte Rollen und Cardinality.
- `identity-resolver.js`: Zuordnung eines Komponenten-Kontexts.
- `context-resolver.js`: Ahnen- und Strukturkontext.
- `structure-resolver.js`: unveränderliche Struktur-Snapshots.
- `relationship-resolver.js`: funktionale Gruppen und Mitglieder.
- `project-dependency-graph.js`: Knoten, Kanten und Dirty-Propagation.
- `semantic-action-engine.js`: isolierte Action-Orchestrierung.
- `semantic-validator.js`: semantische Prüfungen.

## 4. Shared Content

`shared-content-manager.js` verwaltet Header, Navigation und Footer. Änderungen werden zentral gespeichert. Beim Seitenwechsel wird nur die benötigte Zielseite aktualisiert. Fingerprints verhindern unveränderte Schreibvorgänge. Komponentenreferenzen werden pro Seite gecacht.

## 5. Repeat Foundation

`repeat-engine-v2.js` enthält das technische Datenmodell für wiederholbare Strukturen. Die vollständige sichtbare Verwaltung ist nicht Bestandteil von 1.3.1.

## 6. Logging

`oluntir-logger.js` schreibt nach Opt-in kategorisierte JSONL-Dateien in den ausgewählten `logs`-Ordner. Die Zustimmung wird über `oluntir-logging-consent.js` verwaltet. `oluntir-runtime-actions.js` führt reale Editorereignisse durch die Semantic Action Engine.

## 7. Diagnose

`developer-diagnostics-center.js` zeigt Runtime-, Action-, Queue-, Shared-Content- und Log-Snapshots. Der Dependency Graph wird nur auf Benutzerbefehl analysiert.

## 8. Export

`export.js` erzeugt HTML-, SSI- und PHP-Ausgaben. Der Export löst gemeinsame Bereiche entsprechend dem Ziel auf, sammelt lokale Assets und entfernt editorinterne Metadaten.

## 9. Tests

`tests/run-tests.sh` führt Syntax-, Architektur-, Resolver-, Logging-, Action-, Shared-Content-, Galerie- und Strukturtests aus. Einzelne Tests können mit Node direkt aufgerufen werden.

## 10. Architekturregeln

- Bestehende Module erweitern; keine Parallelarchitektur.
- Resolver analysieren und verändern keine Dokumente.
- Die Action Engine orchestriert und enthält keine Fachlogik.
- Der Dependency Graph beschreibt Abhängigkeiten und Auswirkungen.
- Keine vollständigen Projekt- oder Seiten-Neuaufbauten für lokale Änderungen.
- Logging bleibt lokal, optional und auf den gewählten Ordner begrenzt.
- Dokumentation beschreibt zuerst Zweck und Grenzen, danach API und Umsetzung.

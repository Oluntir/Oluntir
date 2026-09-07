# Oluntir 2.2.1 – Technisches Handbuch

Dieses Handbuch beschreibt Oluntir 2.2.1 im Bootstrap-fokussierten Branch.
Oluntir 1.3.1 bleibt die stabile Kompatibilitätsbaseline.

## 1. Laufzeit

Oluntir wird über `index.html` gestartet. GrapesJS liegt unverändert unter
`vendor/grapesjs/`. Oluntir-spezifische Integration liegt unter
`editor/integrations/grapesjs/`. Die optionale lokale Analyzer-API nutzt die
portable Runtime unter `runtime/node/` und benötigt keine globale PATH-Runtime.

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
- Unter `analyzer/` ergänzen statische HTML-/CSS-/JavaScript-Evidenz,
  Source-Profile, Capability-Manifeste und ein read-only Knowledge Compiler
  die semantische Pipeline.
- Übersetzungs- und Behavior-Module erzeugen unveränderliche Pläne und
  Auflösungen; sie führen importierten Code nicht aus und verändern keine
  Dokumente.

## 3a. Bootstrap-Supportgrenze

`frameworks/bootstrap4/` und `frameworks/bootstrap5/` sind die einzigen
konkreten Frameworkdistributionen. Bootstrap 5 ist primär, Bootstrap 4 ist
Legacy. Unbekannte Source Packages dürfen in der generischen Analyse bleiben,
werden durch die Support-Policy aber als `analysis-only` klassifiziert.

## 3b. Source Packages und Frontend-Bridge

Die lokale API importiert Ordner, Archive, Browser-Dateien und URLs in isolierte
Paketordner. Jedes Paket erhält Manifest, Inventar, Source-Hash, Recovery-JSON
und Analyseausgaben. Der GrapesJS-Adapter stellt erkannte Strukturen als vom
Benutzer auswählbare Blöcke bereit. Source-JavaScript wird nicht ausgeführt.

## 4. Shared Content

`shared-content-manager.js` verwaltet Header, Navigation und Footer. Änderungen werden zentral gespeichert und nach einem erfolgreichen Commit auf die betroffenen Projektseiten propagiert. Das GrapesJS-Projektmodell ist die Autorität; langlebige Komponentenreferenzen werden nicht gecacht. Fingerprints und ein `centralChanged`-Fast-Exit verhindern redundante Zielmutationen und Speichervorgänge.

## 5. Repeat-Bibliothek und Publish-Transaktionen

`repeat-engine-v2.js` bleibt das persistente Datenmodell für Repeat-Familien und
stabile Oluntir-Identitäten. `repeat-library-manager.js` verwaltet darüber die
zentrale Published-/Draft-Quelle, Seitenverwendungen, Revisionen sowie die
Repeat-Historie. Alle normalen Seitenvorkommen sind materialisierte Instanzen
und gegen direkte Inhaltsbearbeitung gesperrt.

**Bearbeiten** öffnet einen internen GrapesJS-Einzelobjekt-Arbeitsbereich. Dort
werden Änderungen ausschließlich am Draft vorgenommen; während des Tippens gibt
es keine projektweite Repeat-Verteilung. **„Auf alle Vorkommen anwenden“**
schreibt den Draft kontrolliert in alle aktiven Instanzen und aktualisiert deren
Revision/Fingerprint. Der Arbeitsbereich wird vor Persistenz und Export aus den
GrapesJS-Seitendaten entfernt.

Die orange Mouseover-Steuerleiste auf einer Seiteninstanz öffnet die zentrale
Bearbeitung oder entfernt genau dieses Vorkommen. Entfernen und Publish werden als
Oluntir-Transaktionen in einer begrenzten Repeat-Undo/Redo-Historie geführt. Die
Listenfunktion materialisiert zusätzliche Instanzen über Quelle → Zielseite →
Position → bestätigtes Canvas-Ziel. Resolver-, Dependency-Graph-, Action- und
gezielte Synchronisationsverträge bleiben die technische Schutzschicht; eine
Live-Synchronisation bei jedem Tastendruck ist im Produktpfad deaktiviert.

## 6. Logging

`oluntir-logger.js` schreibt nach Opt-in kategorisierte JSONL-Dateien in den ausgewählten `logs`-Ordner. Die Zustimmung wird über `oluntir-logging-consent.js` verwaltet. `oluntir-runtime-actions.js` führt reale Editorereignisse durch die Semantic Action Engine.

## 7. Diagnose

`developer-diagnostics-center.js` zeigt Runtime-, Action-, Queue-, Shared-Content- und Log-Snapshots. Der Dependency Graph wird nur auf Benutzerbefehl analysiert.

## 8. Export

`export.js` erzeugt HTML-, SSI- und PHP-Ausgaben. Der Export löst gemeinsame Bereiche entsprechend dem Ziel auf, sammelt lokale Assets und entfernt editorinterne Metadaten.

## 9. Tests

`tests/run-tests.sh` führt Syntax-, Architektur-, Resolver-, Logging-, Action-, Shared-Content-, Galerie- und Strukturtests aus. Einzelne Tests können mit Node direkt aufgerufen werden.

Analyzer-Tests decken Source-Inventar, statische Analyzer, Profile,
Behavior-Auflösung, Paket-Recovery, GrapesJS-Bridge, Bootstrap-Support und die
portable Runtime ab.

## 10. Architekturregeln

- Bestehende Module erweitern; keine Parallelarchitektur.
- Resolver analysieren und verändern keine Dokumente.
- Die Action Engine orchestriert und enthält keine Fachlogik.
- Der Dependency Graph beschreibt Abhängigkeiten und Auswirkungen.
- Keine vollständigen Projekt- oder Seiten-Neuaufbauten für lokale Änderungen.
- Logging bleibt lokal, optional und auf den gewählten Ordner begrenzt.
- Dokumentation beschreibt zuerst Zweck und Grenzen, danach API und Umsetzung.

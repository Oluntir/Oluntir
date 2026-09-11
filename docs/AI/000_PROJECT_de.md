# Projektkontext

Oluntir ist ein lokaler, browserbasierter Editor für mehrseitige Websites.
Version 1.3.1 ist die stabile Kompatibilitätsbaseline; `2.3.0` ist der
aktuelle Bootstrap-fokussierte Entwicklungsbranch.

## Verbindliches Verhalten

- Annahmen ausdrücklich nennen.
- Bestehende Verträge erhalten, sofern die Aufgabe keine versionierte Änderung verlangt.
- Tests gemeinsam mit Code aktualisieren.
- Kein nicht implementiertes Verhalten dokumentieren.
- Konkrete Editorunterstützung auf Bootstrap 4.6.2 und 5.3.8 begrenzen.
- Generische Analyzer-/Compiler-Architektur für spätere versionsgebundene
  Analysen erhalten; unbekannte Frameworks als `analysis-only` einstufen.
- Ausführung importierter Sources deaktiviert halten. Produktive
  Repeat-Synchronisation ausschließlich über den implementierten Resolver,
  Dependency Graph, Action Contracts und gezielten Synchronisationsdienst ausführen.

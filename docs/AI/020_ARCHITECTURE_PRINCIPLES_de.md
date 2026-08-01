# Architekturprinzipien

Bestehende Module erweitern. Parallelarchitekturen vermeiden. Resolver bleiben read-only. Fachlogik gehört nicht in die Action Engine; Abhängigkeitspropagation gehört nicht in einzelne Features.

## Verbindliches Verhalten

- Annahmen ausdrücklich nennen.
- Bestehende Verträge erhalten, sofern die Aufgabe keine versionierte Änderung verlangt.
- Tests gemeinsam mit Code aktualisieren.
- Kein nicht implementiertes Verhalten dokumentieren.

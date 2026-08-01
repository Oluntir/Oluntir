# Architekturentscheidungen

Keine Vollseiten-Neuaufbauten für Shared-Regionen. Vor Mutationen Fingerprints prüfen. Logging ist lokales Opt-in mit geringstmöglicher Berechtigung. Zustimmung ist versioniert und installationsbezogen.

## Verbindliches Verhalten

- Annahmen ausdrücklich nennen.
- Bestehende Verträge erhalten, sofern die Aufgabe keine versionierte Änderung verlangt.
- Tests gemeinsam mit Code aktualisieren.
- Kein nicht implementiertes Verhalten dokumentieren.

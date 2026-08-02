# Architekturentscheidungen

Keine Vollseiten-Neuaufbauten für Shared-Regionen. Vor Mutationen Fingerprints prüfen. Logging ist lokales Opt-in mit geringstmöglicher Berechtigung. Zustimmung ist versioniert und installationsbezogen.

## Verbindliches Verhalten

- Annahmen ausdrücklich nennen.
- Bestehende Verträge erhalten, sofern die Aufgabe keine versionierte Änderung verlangt.
- Tests gemeinsam mit Code aktualisieren.
- Kein nicht implementiertes Verhalten dokumentieren.

## Template First

**Entscheidung:** Das Template ist die alleinige Grundlage für Struktur und Rollen. Frameworkklassen und Template-Markup werden zuerst ausgewertet. Oluntir-Identitäten sind nur stabile Adressen.

**Grund:** Oluntir muss Bootstrap 4, Bootstrap 5 und zukünftige Templates korrekt nutzbar machen, ohne eine eigene konkurrierende Darstellung über das Template zu legen.

**Folge:** Resolver, Document API, Repeat, Shared Content, History und Export dürfen Rollen nicht aus `data-oluntir-*`-Identitäten ableiten.

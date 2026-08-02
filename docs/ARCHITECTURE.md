> **Language:** English · [Deutsch](ARCHITECTURE_de.md)  
> **Version:** 1.3.1

# Architecture overview

```text
UI und Editorbefehle
→ GrapesJS-Adapter
→ Projektmodell und stabile Identitäten
→ Semantic Dictionary
→ Identity Resolver
→ Context Resolver
→ Structure Resolver
→ Relationship Resolver
→ Project Dependency Graph
→ Semantic Action Engine
→ Validator / Shared Content / Repeat Engine / Export
→ Logger und Diagnostics Center
```

## Separation of responsibilities

- GrapesJS bleibt unverändert unter `vendor/`.
- Adapter kapseln GrapesJS-spezifische Zugriffe.
- Resolver analysieren nur.
- Der Dependency Graph beschreibt Abhängigkeiten.
- Die Action Engine orchestriert Handler und Phasen.
- Shared Content führt gezielte Regionsupdates aus.
- Export arbeitet auf dem Projektmodell und einer Exportkopie.
- Logging ist optional, lokal und berechtigungsgebunden.

## Performance

Shared Content vergleicht Fingerprints, speichert Komponentenreferenzen pro Seite und aktualisiert nur die benötigte Zielseite. Der Dependency Graph wird nicht automatisch bei jedem Editorereignis aufgebaut. Das Diagnostics Center aktualisiert kleine Snapshots und beendet seinen Timer beim Schließen.

## Further reading

Siehe `docs/Architecture/` sowie `docs/AI/`.

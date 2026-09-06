> **Language:** English · [Deutsch](ARCHITECTURE_de.md)
> **Version:** 2.2.0 BETA · **Stable baseline:** 1.3.1

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

Source Packages follow a separate read-only path:

```text
local folder/archive/URL
→ local API
→ isolated Source Package
→ inventory and evidence
→ OIR and Knowledge Compiler
→ Bootstrap support policy
→ source profile / translation / behavior plans
→ controlled GrapesJS bridge
```
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
- Concrete editor profiles are limited to Bootstrap 4.6.2 and 5.3.8.
- Unknown Source Packages remain analysis-only.
- Imported source JavaScript is not executed.
- User-defined Repeat definitions are productively and atomically synchronized
  through the resolver, dependency graph, action contracts and targeted
  synchronization service.

## Performance

Shared Content vergleicht Fingerprints, speichert Komponentenreferenzen pro Seite und aktualisiert nur die benötigte Zielseite. Der Dependency Graph wird nicht automatisch bei jedem Editorereignis aufgebaut. Das Diagnostics Center aktualisiert kleine Snapshots und beendet seinen Timer beim Schließen.

## Further reading

Siehe `docs/Architecture/` sowie `docs/AI/`.

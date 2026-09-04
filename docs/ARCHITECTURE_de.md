> **Sprache:** Deutsch · [English](ARCHITECTURE.md)
> **Version:** 2.0.1-alpha · **Stabile Baseline:** 1.3.1

# Architekturübersicht

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

Source Packages durchlaufen einen getrennten read-only-Pfad:

```text
lokaler Ordner/Archiv/URL
→ lokale API
→ isoliertes Source Package
→ Inventar und Evidenz
→ OIR und Knowledge Compiler
→ Bootstrap-Support-Policy
→ Source-Profil / Übersetzung / Behavior-Pläne
→ kontrollierte GrapesJS-Bridge
```
```

## Trennung der Verantwortlichkeiten

- GrapesJS bleibt unverändert unter `vendor/`.
- Adapter kapseln GrapesJS-spezifische Zugriffe.
- Resolver analysieren nur.
- Der Dependency Graph beschreibt Abhängigkeiten.
- Die Action Engine orchestriert Handler und Phasen.
- Shared Content führt gezielte Regionsupdates aus.
- Export arbeitet auf dem Projektmodell und einer Exportkopie.
- Logging ist optional, lokal und berechtigungsgebunden.
- Konkrete Editorprofile sind auf Bootstrap 4.6.2 und 5.3.8 begrenzt.
- Unbekannte Source Packages bleiben `analysis-only`.
- Importiertes Source-JavaScript, automatische Dokumentmutation und produktive
  Repeat-Synchronisation sind deaktiviert.

## Performance

Shared Content vergleicht Fingerprints, speichert Komponentenreferenzen pro Seite und aktualisiert nur die benötigte Zielseite. Der Dependency Graph wird nicht automatisch bei jedem Editorereignis aufgebaut. Das Diagnostics Center aktualisiert kleine Snapshots und beendet seinen Timer beim Schließen.

## Weiterführend

Siehe `docs/Architecture/` sowie `docs/AI/`.

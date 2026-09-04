# DEV_025 – Frameworkneutrale JavaScript-Verhaltensmatrix

## Ergebnis

Aus dem DEV_024-`behavior-manifest.json` wird jetzt ein unveränderlicher
`javascript-behavior-plan.json` erzeugt. Die Matrix ordnet nachgewiesene
JavaScript- und Interaktionsmuster neutral ein, ohne ein Frameworkverhalten zu
erraten oder eine Runtime auszuführen.

## Matrixregeln

Enthalten sind neutrale Regeln für:

- Accordion umschalten
- Modal öffnen/schließen
- Tab auswählen
- Dropdown umschalten
- Carousel/Slider navigieren
- Offcanvas umschalten
- Event-Listener und Custom Events
- DOM-Observer
- Timer/Animation-Frames
- Netzwerkanfragen
- DOM-Mutationsmuster

Die Regeln tragen neutrale Semantic IDs und Zustandsmodelle. Die konkrete
Frameworkimplementierung bleibt absichtlich offen und wird erst durch ein
versionsbezogenes Frameworkprofil aufgelöst.

## Plan- und Gate-Verhalten

Der Plan unterscheidet `recognized`, `unsupported` und
`invalid-dependency`. Jeder Eintrag enthält Quell-Evidenz,
Script-Abhängigkeiten, offene Style-Abhängigkeiten, Frameworkprofilstatus und
Runtime-Anforderungen.

In DEV_025 bleiben immer:

```text
runtime.enabled       = false
activation.allowed    = false
runtimeActivation     = false
documentMutation      = false
repeatSynchronization  = false
```

Die Matrix ist damit eine read-only Plan-/Resolver-Vorstufe. Sie aktiviert
weder importierte Scripts noch ändert sie das GrapesJS-Projektmodell.

## Architektur- und Identitätsauswirkungen

- Das DEV_024-Manifest bleibt die einzige JavaScript-Evidenzquelle.
- `javascript-behavior-matrix.js` normalisiert und plant diese Evidenz; es
  analysiert Source-Code nicht ein zweites Mal.
- `unitId` bleibt vollständig bei GrapesJS.
- `behaviorId` ist eine Evidenzidentität und keine GrapesJS-Komponenten-ID.
- Keine parallele Oluntir-Komponenten- oder Projektdatenbank.
- Keine automatische Mutation, keine DOM-Rekonstruktion und keine
  Repeat-Synchronisation.

## Geänderte und neue Dateien

- `analyzer/core/javascript-behavior-matrix.js`
- `analyzer/contracts/javascript-behavior-matrix-contract.json`
- `analyzer/contracts/source-package-contract.json`
- `analyzer/core/project-analyzer.js`
- `analyzer/app/server.js`
- `editor/js/core/source-package-bridge.js`
- `analyzer/tests/test-javascript-behavior.js`
- `analyzer/tests/test-source-package-server.js`
- `docs/Architecture/JAVASCRIPT_BEHAVIOR_MATRIX_de.md`
- `docs/Architecture/JAVASCRIPT_BEHAVIOR_MATRIX.md`

## Kritische Selbstkontrolle

1. **Frontend-Nutzung:** Die Bridge kann den Verhaltensplan über die lokale
   API laden. Sie aktiviert daraus keine Scripts und verändert keine
   bestehende Seite.
2. **Abstimmung:** Es wird keine neue sichtbare Bedienfunktion eingeführt.
   Die Matrix ist zunächst Analyse- und Planinfrastruktur.
3. **Abhängigkeiten:** Bestehender Static-Script-Analyzer → DEV_024-
   Behavior-Manifest → DEV_025-Matrix → späterer Framework-Resolver.
4. **Frameworkneutralität:** Die Semantic IDs und Zustände sind unabhängig von
   Bootstrap oder einem anderen konkreten Framework. Eine konkrete
   Implementierung benötigt ein passendes Profil.
5. **Gate:** Jede Planvalidierung weist aktivierte Runtime oder Mutation als
   Vertragsfehler zurück.

## Verifikation

Die Matrix-, Manifest-, API- und Bridge-Tests, der vollständige Regressionstest,
die Syntax-/Strukturprüfung, die SHA-256-Prüfung und der ZIP-Integritätstest
werden ausgeführt. Der Browser-Runtime-Test bleibt bis zum vereinbarten
Testfenster aus.

Vorgeschlagener Commit in GitHub Desktop:

```text
feat(alpha): add framework-neutral javascript behavior matrix
```

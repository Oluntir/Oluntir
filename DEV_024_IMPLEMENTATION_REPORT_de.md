# DEV_024 – JavaScript-Evidenz- und Runtime-Vertrag

## Ergebnis

Die vorhandene statische JavaScript-Analyse liefert jetzt ein neutrales,
versioniertes `behavior-manifest.json`. Das Manifest normalisiert die bereits
vorhandenen `static-script`-Inventarreferenzen und beschreibt erkannte
Verhaltensmuster und Runtime-Risiken, ohne importierte Scripts auszuführen oder
eine Runtime-Aktivierung freizuschalten.

## Erfasste Evidenz

- Modul- und dynamische Imports
- DOM-Selektoren und Event-Listener
- Custom Events
- Klassen- und Dataset-Zustände
- Mutation-, Intersection- und ResizeObserver
- Timer und Animation-Frames
- Netzwerkanfragen
- DOM-Mutationsmuster
- HTML-Indizien für Accordion, Modal, Tabs, Dropdown, Carousel und Offcanvas

Jede Evidenz enthält mindestens Typ, Wert, Quelldatei und Quellposition.
Verhaltenskandidaten erhalten außerdem Abhängigkeiten, Seiteneffekte,
Reversibilitätsbewertung, Runtime-Anforderungen und eine stabile, vom
Quellpaket abgeleitete ID.

## Selektive Script-Aktivierung

Importierte Source-Scripts werden in der Frontend-Bridge nicht mehr pauschal
als `canvasScripts` aktiviert. Standardmäßig ist die Liste leer. Eine
Aktivierung darf nur über eine explizite Dateiliste erfolgen; akzeptiert werden
ausschließlich Dateien, die im jeweiligen Source-Package-Manifest vorhanden
sind. Der spätere Verhaltensresolver kann diese Auswahl kontrolliert aus einem
validierten Plan ableiten.

## Architektur- und Sicherheitsgrenzen

- Analyse bleibt read-only und führt kein Source-JavaScript aus.
- `unitId` bleibt vollständig bei GrapesJS.
- Das Manifest ist abgeleitete Evidenz und keine zweite Projekt- oder
  Komponentenquelle.
- automatische Dokumentmutation, DOM-Rekonstruktion und Repeat-Synchronisation
  bleiben deaktiviert.
- Style-Abhängigkeiten werden noch nicht automatisch einem Verhalten
  zugeordnet; das ist Bestandteil der Verhaltensmatrix.

## Geänderte und neue Dateien

- `analyzer/core/javascript-behavior.js`
- `analyzer/contracts/javascript-behavior-contract.json`
- `analyzer/contracts/source-package-contract.json`
- `analyzer/core/project-analyzer.js`
- `analyzer/app/server.js`
- `editor/js/core/source-package-bridge.js`
- `analyzer/tests/test-javascript-behavior.js`
- `analyzer/tests/test-source-package-server.js`
- `tests/test-source-package-bridge.js`
- `tests/run-tests.sh`
- `docs/Architecture/JAVASCRIPT_BEHAVIORS_de.md`
- `docs/Architecture/JAVASCRIPT_BEHAVIORS.md`

## Kritische Selbstkontrolle

1. **Frontend:** Bestehende Bootstrap-Profile bleiben unverändert. Imported
   Source-Scripts werden nur noch explizit gewählt; CSS und Source-Blöcke
   bleiben nutzbar.
2. **Abstimmung:** Es wird keine neue sichtbare UI vorausgesetzt. Die
   Auswahl-API ist für den späteren Verhaltensresolver vorbereitet.
3. **Abhängigkeiten:** Source-Dateien → bestehender `static-script`-Analyzer →
   Behavior Manifest → spätere Matrix/Resolver. Es gibt keine doppelte
   JavaScript-Evidenzquelle und keine direkte Abhängigkeit zur
   Synchronisationsmutation.
4. **Identität:** Keine manuelle `unitId`, keine parallele Komponentenablage,
   stabile `behaviorId` nur als Evidenzidentität.
5. **Mutation:** Alle Aktivierungs- und Dokumentmutationsflags bleiben false;
   automatische Runtime-Aktivierung findet nicht statt.

## Verifikation

Der bestehende Einzeltest, der neue JavaScript-Vertragstest, die Bridge- und
Servertests, Syntax-/Strukturprüfung, vollständige Regression und SHA-256-
Prüfung werden nach Abschluss dieses Schritts ausgeführt. Der echte
Browser-Runtime-Test bleibt bis zum vereinbarten Testfenster aus.

Vorgeschlagener Commit in GitHub Desktop:

```text
feat(alpha): add javascript behavior runtime contract
```

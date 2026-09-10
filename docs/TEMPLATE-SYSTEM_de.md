# Modulares Template-System – Oluntir 2.3.0

## Ziel

Das Template-System erweitert Oluntir um zusätzliche Bootstrap-4-/Bootstrap-5-Templates, ohne die Standardprofile oder den Editor-Kern templatespezifisch zu verändern.

## Verzeichnisvertrag

```text
frameworks/
├── bootstrap4/
└── bootstrap5/

templates/
├── registry.json
├── registry.js
└── <template-id>/
    ├── template.json
    ├── template.js
    ├── components.json
    ├── analysis.json
    ├── assets.json
    ├── behavior-manifest.json
    ├── dependencies.json
    ├── runtime-plan.json
    ├── javascript-activation-plan.json
    ├── embed-isolation.json
    └── source/
```

Ein Import darf ausschließlich unter `templates/` schreiben. `frameworks/` bleibt unverändert.

## Import- und Compilerablauf

1. Template-ZIP und Name auswählen.
2. Primäre Beispiel-HTMLs gegenüber Dokumentation/Hilfsseiten bestimmen.
3. Bootstrap-4-/Bootstrap-5-Basis erkennen.
4. Sections, Bereiche, Varianten, Repeat-Kandidaten und Bausteinfamilien analysieren.
5. CSS-, Asset- und JavaScript-Abhängigkeiten ermitteln.
6. Aktive Fremd-Embeds im Editor isolieren.
7. Statische Template-Definition erzeugen.
8. Nach ausdrücklicher Aufnahme in `templates/<id>/` schreiben.
9. Registry schreiben, zurücklesen und physisch verifizieren.

## Registry

`registry.json` ist die lesbare Registry. `registry.js` ist die browserlesbare Spiegelung für einen direkten `file://`-Start. Beide werden durch die Verwaltung gemeinsam aktualisiert.

Ein gelöschter Template-Ordner darf Oluntir nicht beschädigen. Die Verwaltung erkennt den fehlenden Ordner und kann den veralteten Registry-Eintrag entfernen. Umgekehrt können gültige manuell kopierte Template-Ordner anhand ihrer `template.json` in die Registry aufgenommen werden.

## JavaScript

Der Analyzer ist generisch. Er nutzt keine Regeln für bestimmte Template-Namen. Er ermittelt Scriptrollen, Libraries, Plugins, Ladefolgen, Dependencies, DOM-Selektoren, Events und Section-Zuordnungen. Unbekannte Plugins bleiben als unbekannte Provider/Invocations analysierbar.

Template-JavaScript wird im Editier-Canvas nicht ausgeführt. Der Aktivierungsplan dient der kontrollierten Preview-/Veröffentlichungsruntime und vermeidet bekannte Frameworkduplikate sowie erkannte Hochrisiko-Skripte.

## Embed-Isolation

`iframe`, `object` und `embed` werden unabhängig vom Anbieter isoliert. Die aktive Quelle wird im Editiermodus durch ein lokales SVG ersetzt. Der ursprüngliche Tag bleibt bestehen, sodass Bootstrap-/Template-CSS für Breite, Höhe, Klassen und Einbettungsrahmen weiterhin greift. Editor-Platzhalter sind pointer-transparent und nicht fokussierbar; Auswahl und Blockwerkzeuge greifen dadurch auf die umgebende Oluntir-Struktur durch.

Gespeichert werden unter anderem Originalquelle, aktives Quellattribut und gegebenenfalls `srcdoc`. Beim Preview-Wechsel wird die Originalquelle ausschließlich im Canvas-DOM reaktiviert; beim Verlassen der Preview wird der SVG-Platzhalter wiederhergestellt. Dadurch verändert die Preview nicht das persistierte GrapesJS-Modell.

## Performanceprinzip

Die aufwändige Analyse findet ausschließlich beim Import statt. Der normale Editorstart lädt nur `registry.js`, `template.js`, die fertigen Bausteine und die freigegebenen Template-Assets. Importiertes JavaScript und externe Embeds dürfen den normalen Editierbetrieb nicht durch permanente DOM-Mutationen belasten.

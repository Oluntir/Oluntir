# Übersetzungsmatrix

## Zweck

Die Übersetzungsmatrix übersetzt die kanonische Oluntir-Semantik in
framework- und versionsspezifische Erkennungs- und Ausgabe-Descriptoren. Sie
ist der Datenvertrag für den späteren Analyzer und Compiler. Sie verändert
weder Dokument, DOM noch GrapesJS-Komponenten.

## Implementierung

`editor/js/core/translation-matrix.js` besitzt das Schema, das kanonische
Vokabular, die Descriptor-Validierung, unveränderliche Profile und die
read-only Regelsuche.

## Vertrag

Jede Regel beschreibt:

- eine stabile `ruleId`;
- eine kanonische `semanticId`;
- Framework-Familie, Framework-ID und Versionsbereich;
- eine Richtung (`detect`, `emit` oder `bidirectional`);
- Erkennungs- und Ausgabe-Descriptoren;
- Fähigkeiten, Einschränkungen und Abhängigkeiten;
- Priorität, Sicherheit, Reversibilität und Informationsverlust;
- die Herkunft der Analyzer- oder Profildaten.

Regel-IDs sind keine Komponenten-IDs und keine `unitId`-Werte. Eine
Übersetzungsregel darf niemals eine Dokumentidentität ersetzen, erzeugen oder
verändern.

## Abgrenzung

- Die UI-Sprachübersetzung bleibt Aufgabe von `i18n.js`.
- Die CSS-Eigenschaftsnormierung bleibt Aufgabe von
  `presentation-vocabulary.js`.
- Die template-first Rollenauflösung bleibt Aufgabe von
  `template-semantics.js`.
- Konkrete Frameworkregeln werden erst in einem späteren DEV-Schritt als
-  Datenprofile ergänzt. DEV_017 liefert dafür die read-only Profile für
  Bootstrap 4.6.2 und Bootstrap 5.3.8.
- Mutation bleibt ausdrücklich deaktiviert (`mutationEnabled: false`).

## Integrationsreihenfolge

1. DEV_016: Schema und kanonisches Vokabular;
2. DEV_017: Bootstrap-4- und Bootstrap-5-Profildaten;
3. DEV_018: Analyzer-Evidenz und Capability-Manifeste;
4. DEV_019: read-only Translation Resolver und Compile-Plan;
5. DEV_020: Validierung von Konflikten, Fallbacks und Diagnostik.

Vertragsänderungen benötigen passende Tests und Dokumentation.

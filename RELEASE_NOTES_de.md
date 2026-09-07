# Release Notes – Oluntir 2.2.1

Oluntir 2.2.1 ist der aktuelle Bootstrap-fokussierte Release. Die vollständige technische Änderungshistorie steht im [Changelog](CHANGELOG_de.md).

## Schwerpunkte von 2.2.1

### Zentrale Repeat-Bibliothek

Wiederholbare Bereiche werden projektweit als zentrale Repeat-Familien verwaltet. Die Bearbeitung erfolgt in einem Einzelobjekt-Canvas; Änderungen werden erst über **„Auf alle Vorkommen anwenden“** veröffentlicht. Seitenvorkommen können gezielt eingesetzt, entfernt und über eine eigene Repeat-Historie wiederhergestellt werden.

### Bootstrap 4 und 5

Die produktive Frameworkunterstützung konzentriert sich auf Bootstrap 4.6.2 und Bootstrap 5.3.8. Die Komponentenpalette und die Template-Erkennung berücksichtigen die Unterschiede beider Generationen. Bootstrap-4-spezifische Elemente werden nur im BS4-Profil angeboten.

### HTML5-Video

BS4 und BS5 besitzen jeweils einen nativen responsiven HTML5-Videoblock mit mehreren Wiedergabequellen, Poster und Download-Fallback.

### Template- und Source-Analyse

Der lokale Analyzer erkennt Bootstrap-Versionen und Komponentenstrukturen präziser und kann geeignete quellengebundene Strukturen kontrolliert in den Editor übernehmen. Nicht unterstützte Frameworks bleiben `analysis-only`; importiertes Source-JavaScript wird nicht automatisch ausgeführt.

### Export

Oluntir exportiert als HTML, Apache SSI oder PHP-Includes und kann Projekte als lokalen Ordner, ZIP oder TAR ausgeben. Lokale Assets werden gesammelt und editorinterne Metadaten aus der veröffentlichten Ausgabe entfernt.

### Kompatibilität

Bestehende Projekte werden über stabile Oluntir-Identitäten weitergeführt. Vor größeren Änderungen wird weiterhin eine portable `.oluntir`-Projektsicherung empfohlen.

## Weitere Informationen

- [README](README_de.md)
- [Funktionen](FEATURES_de.md)
- [Handbuch](HANDBOOK_de.md)
- [Changelog](CHANGELOG_de.md)

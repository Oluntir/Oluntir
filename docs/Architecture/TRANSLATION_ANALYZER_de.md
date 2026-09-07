# Translation Analyzer

Der Translation Analyzer untersucht eine Source read-only anhand des aktiven
Matrixprofils. Er verarbeitet HTML, CSS, JavaScript- und SCSS-Text als
Evidenz. Er führt keinen fremden Code aus und verändert weder Dokument noch
GrapesJS-Modell.

Das Ergebnis trennt ausdrücklich:

- erkannte Matrixregeln;
- daraus abgeleitete Fähigkeiten;
- nicht erkannte Regeln;
- grundsätzlich ausgabefähige Descriptoren.

`tests/fixtures/bootstrap5-source.html` ist eine kleine repräsentative
Bootstrap-5-Testquelle. Sie dient der Vertragsprüfung des Analyzers und ist
kein produktiver Templatebestandteil.

Die Erkennung ist noch keine Materialisierung. Die spätere Übersetzung in
einen validierten Compile-Plan erfolgt erst im Translation Resolver.

## Bootstrap-4-/Bootstrap-5-Evidenz

Für Bootstrap-Quellen wird die Frameworkgeneration nicht mehr aus einem einzelnen generischen Signal abgeleitet. Der Analyzer gewichtet Versionsbanner und versionierte Pfade, Data-API-Attribute, Runtime-Indizien sowie generationsspezifische Klassen. Zusätzlich erkennt der quellengebundene Komponenten-Katalog weitere Bootstrap-Strukturen wie Jumbotron, Media object, Custom controls, Offcanvas, List groups, Progress, Breadcrumbs und Input groups. Die Analyse bleibt read-only; fremdes JavaScript wird weiterhin nicht ausgeführt.

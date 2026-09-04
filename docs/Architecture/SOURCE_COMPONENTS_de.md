# Quellengebundene Frontend-Komponenten

DEV_023 verbindet den vorhandenen Source-Analyzer mit der bestehenden
GrapesJS-Blockauswahl. Der Analyzer erzeugt aus tatsächlich vorhandenen
HTML-Strukturen eines importierten Source Packages einen
`component-catalog.json`.

## Architekturgrenze

Der Katalog ist keine zweite Komponentenwelt. Ein Eintrag bleibt an sein
Quell-Dokument, seine Quellposition und seine Evidenz gebunden. Er erhält
keine manuelle `unitId`; diese Identität entsteht erst durch GrapesJS bei der
bewussten Einfügung in das Projektmodell.

Jeder Katalogeintrag ist mit `sourceBacked: true` und
`mutationPolicy: user-insert-only` gekennzeichnet. Die Analyse führt keine
importierten Skripte aus und verändert kein bestehendes Dokument.

## Nutzung

Nach der Auswahl eines importierten Frameworkprofils lädt die Frontend-Bridge
den Katalog über die lokale API und registriert die Einträge als normale
GrapesJS-Blöcke. Der Blockinhalt ist die bereinigte Originalstruktur; inline
Skriptereignisse und `<script>`-Elemente werden nicht übernommen.

Lokale `src`, `href` und `poster`-Referenzen werden auf die API-Dateiroute des
zugehörigen Source Packages abgebildet. Bei geschützter lokaler API wird die
Sitzung als URL-Parameter für Browser-Ressourcen weitergegeben.

## Bewusste Nicht-Funktionen

- keine automatische Übertragung in bestehende Dokumente;
- keine Repeat-Synchronisation;
- keine Ausführung von Source-JavaScript während Import oder Analyse;
- keine Erfindung von Komponenten ohne Source-Evidenz;
- kein Überschreiben bestehender Block-IDs.

## Wiederherstellung

Der Katalog wird bei jedem Import und bei jeder JSON-Recovery erneut aus der
wiederhergestellten Source erzeugt. Dadurch bleiben Katalog und
`capability-manifest.json` aus der Source ableitbar und müssen nicht als
unabhängige Wahrheit behandelt werden.

> **Sprache:** Deutsch · [English](README.md)

# Oluntir 2.2.1

Oluntir ist ein lokaler, browserbasierter Website-Editor auf Basis von GrapesJS 0.23.2. Er verwaltet mehrseitige Bootstrap-Projekte, lokale Assets, gemeinsame Seitenbereiche, projektweit wiederverwendbare Inhalte und offene Exporte ohne verpflichtende Cloud- oder Serverlaufzeit.

**Status:** Release 2.2.1  
**Framework-Fokus:** Bootstrap 4.6.2 und Bootstrap 5.3.8  
**Arbeitsweise:** lokal und projektbasiert

## Kernfunktionen

- visueller GrapesJS-Editor für HTML-, Bootstrap- und projektgebundene Komponenten;
- mehrseitige Projekte mit portablen `.oluntir`-Projektdateien;
- Seitenverwaltung, lokale Assets, Favicon, Bilder und Galerien;
- responsive Bildvarianten für Desktop, Tablet und Mobil;
- Shared Content für Header, Navigation und Footer;
- zentrale Bibliothek für projektweit wiederholbare Bereiche;
- zentrale Bearbeitung eines Repeat-Bereichs mit kontrollierter Verteilung auf alle Vorkommen;
- gezieltes Einsetzen und Entfernen einzelner Repeat-Vorkommen auf Projektseiten;
- Repeat-Undo/Redo für Veröffentlichung und Entfernen;
- Ein- und Zwei-Monitor-Arbeitsbereich;
- HTML-, Apache-SSI- und PHP-Include-Export;
- Export als lokaler Ordner, ZIP oder TAR;
- optionales lokales Logging und Diagnosewerkzeuge nach ausdrücklicher Zustimmung.

## Wiederholbare Bereiche

Wiederholbare Bereiche werden als zentrale **Repeat-Familien** verwaltet. Eine Familie besitzt einen zentralen Entwurf und kann auf beliebig vielen Projektseiten eingesetzt werden.

Der typische Ablauf ist:

1. Bereich als Repeat-Quelle anlegen und benennen.
2. Weitere Vorkommen über die Repeat-Bibliothek auf Zielseiten einsetzen.
3. Änderungen über **„Zentral bearbeiten“** im Einzelobjekt-Canvas vornehmen.
4. Mit **„Auf alle Vorkommen anwenden“** den neuen Stand kontrolliert veröffentlichen.

Auf normalen Seiten sind Repeat-Vorkommen gegen direkte Inhaltsbearbeitung geschützt. Eine orange Steuerleiste führt zur zentralen Bearbeitung oder entfernt nur das ausgewählte Vorkommen. Header, Navigation und Footer bleiben davon getrennt und werden über Shared Content verwaltet.

## Bootstrap-Unterstützung

Oluntir enthält konkrete Editorprofile für:

- **Bootstrap 4.6.2**
- **Bootstrap 5.3.8**

Die eingebauten Blöcke verwenden natives Bootstrap-Markup. Bootstrap-4-spezifische Elemente wie Jumbotron, Media Object und Custom Forms werden nur im BS4-Profil angeboten. Bootstrap 5 verwendet die entsprechenden aktuellen Strukturen und Hilfsklassen seiner Generation.

Für beide Profile stehen responsive HTML5-Videoblöcke mit mehreren Wiedergabequellen, Poster und Download-Fallback zur Verfügung.

## Template- und Source-Analyse

Der lokale Oluntir API Analyzer kann Bootstrap-Templates und Source Packages statisch untersuchen. Er analysiert HTML, CSS und JavaScript-Evidenz, erkennt Bootstrap-Version und Komponentenstrukturen und kann geeignete erkannte Strukturen kontrolliert als Editorblöcke bereitstellen.

Unbekannte oder nicht unterstützte Frameworks dürfen analysiert werden, bleiben jedoch `analysis-only`. Importiertes Source-JavaScript wird nicht automatisch ausgeführt.

## Shared Content

Header, Navigation und Footer werden projektweit als Shared Content verwaltet. Änderungen können auf einer Projektseite vorgenommen und auf die übrigen Seiten übertragen werden. Beim Export kann Oluntir gemeinsame Inhalte direkt auflösen oder als Apache-SSI- bzw. PHP-Includes ausgeben.

## Export

Oluntir erzeugt veröffentlichbare Projekte ohne proprietäre Laufzeit. Unterstützt werden:

- aufgelöstes HTML;
- Apache SSI;
- PHP-Includes;
- lokale Ordnerausgabe;
- ZIP-Archive;
- TAR-Archive.

Lokale Framework-, Bild-, Schrift- und Projektassets werden entsprechend der gewählten Exportart übernommen. Editorinterne Oluntir-Metadaten werden aus der finalen Ausgabe entfernt.

## Start

1. Archiv entpacken.
2. `index.html` in einem aktuellen Chromium-basierten Desktop-Browser öffnen.
3. Datenschutz- und Logging-Auswahl treffen.
4. Ein bestehendes Projekt öffnen oder ein neues Projekt anlegen.
5. Bootstrap-Profil auswählen und mit der Bearbeitung beginnen.

Für die lokale Source-Package-Analyse kann zusätzlich die mitgelieferte portable Analyzer-Runtime gestartet werden.

## Dokumentation

- [Funktionen](FEATURES_de.md)
- [Handbuch](HANDBOOK_de.md)
- [Erster Start](docs/FIRST_START_de.md)
- [Warum Oluntir?](docs/WHY_OLUNTIR_de.md)
- [Architektur](docs/ARCHITECTURE_de.md)
- [Repeat Engine V2](docs/042_REPEAT_ENGINE_V2_de.md)
- [Shared Content](docs/SHARED-CONTENT-MANAGER_de.md)
- [Release Notes](RELEASE_NOTES_de.md)
- [Changelog](CHANGELOG_de.md)
- [Dokumentationsindex](docs/index_de.md)

## Projektgrenzen

Oluntir 2.2.1 ist produktiv auf Bootstrap 4 und Bootstrap 5 fokussiert. Fremdframeworks werden nicht stillschweigend als Bootstrap behandelt. Der Analyzer kann zusätzliche Quellen untersuchen, aber eine aktive Editorintegration erfordert ein ausdrücklich unterstütztes Profil.

## Lizenz

Siehe [LICENSING_de.md](LICENSING_de.md), [THIRD_PARTY_NOTICES_de.md](THIRD_PARTY_NOTICES_de.md) und die Dateien unter `LICENSES/`.

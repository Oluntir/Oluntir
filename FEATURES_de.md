# Funktionen – Oluntir 2.3.0

Diese Übersicht beschreibt die nutzbaren Produktfunktionen von Oluntir 2.3.0. Technische Implementierungsdetails und Fehlerhistorie stehen im Changelog, in den Release Notes und in den Architektur-/DEV-Dokumenten.

## Editor und Projekte

- lokaler visueller Editor auf Basis von GrapesJS 0.23.2;
- mehrseitige Website-Projekte und portable `.oluntir`-Projektdateien;
- Seiten anlegen, umbenennen, auswählen und entfernen;
- Ein- und Zwei-Monitor-Arbeitsbereich;
- globales Undo/Redo für normale Editoraktionen;
- Projekt-Favicon und lokale Projektassets.

## Inhalte und Medien

- Text-, Bild-, Galerie- und Komponentenbearbeitung;
- responsive Bildvarianten für Desktop, Tablet und Mobil;
- lokale Bildverwaltung und Wiederverwendung vorhandener Assets;
- Lightbox- und Galerieintegration;
- responsive HTML5-Videos mit WebM-, MP4- und Ogg-Quellen, Poster und Download-Fallback;
- Bootstrap-spezifische Videodarstellung für BS4 und BS5.

## Shared Content

- projektweite Verwaltung von Header, Navigation und Footer;
- Änderungen können von beteiligten Seiten in den gemeinsamen Stand übernommen werden;
- gemeinsame Bereiche werden projektweit konsistent gehalten;
- Ausgabe als aufgelöstes HTML, Apache SSI oder PHP-Includes.

## Wiederholbare Bereiche

- zentrale Repeat-Bibliothek mit verständlichen Namen;
- Anzeige der verwendeten Seiten und Vorkommen;
- zentrale Bearbeitung im Einzelobjekt-Canvas;
- Draft-/Published-Arbeitsweise;
- **„Auf alle Vorkommen anwenden“** für kontrollierte Veröffentlichung;
- geschützte Seiteninstanzen mit eigener Steuerleiste;
- einzelne Vorkommen gezielt entfernen und wiederherstellen;
- Repeat-Undo/Redo für Veröffentlichung und Entfernen;
- zusätzliche Vorkommen über Zielseite und Einfügeposition einsetzen.

## Bootstrap 4 und 5

- Bootstrap 4.6.2 als geschütztes Standardprofil;
- Bootstrap 5.3.8 als geschütztes Standardprofil;
- native Bootstrap-Blöcke statt einer eigenen Parallelkomponentenwelt;
- generationenspezifische Komponenten und Utilities;
- Erkennung der Bootstrap-Generation über Versions-, Data-API- und Strukturmerkmale.

## Modulare Template-Verwaltung

- separate `template-manager.html` für zusätzliche Bootstrap-Templates;
- importierte Templates liegen ausschließlich unter `templates/<name>/`;
- `frameworks/bootstrap4` und `frameworks/bootstrap5` werden durch Templateimporte nicht verändert;
- statische `registry.json`/`registry.js` für schnellen Start ohne erneute Analyse;
- manuell kopierte Template-Ordner erkennen und registrieren;
- manuell gelöschte Ordner erkennen und Registry-Einträge bereinigen;
- importierte Templates über die Verwaltung entfernen;
- Standardprofile bleiben sichtbar, versioniert und geschützt.

## Universeller Bootstrap-Template-Compiler

- ZIP-Import beliebiger Bootstrap-4-/Bootstrap-5-Templates;
- Analyse aller relevanten Dateien unabhängig von der Ordnerstruktur;
- Trennung von Primär-HTMLs, Dokumentation und Hilfsseiten;
- semantische Erkennung von Sections, Bereichen und Bausteinfamilien;
- Repeat-Kandidaten und Varianten werden als Strukturmetadaten erfasst;
- Erkennung und Übernahme von Bildern, Fonts, Medien sowie unreferenzierten Demo-/Placeholder-Assets;
- Template-CSS und Vendor-CSS werden von Bootstrap-CSS getrennt;
- die teure Analyse findet beim Import statt, der normale Editorstart lädt nur das kompilierte Ergebnis.

## Universelle JavaScript-Analyse

- Analyse lokaler und referenzierter JavaScript-Dateien;
- Erkennung von Script-Ladereihenfolge, Bibliotheken, Plugins und Abhängigkeiten;
- DOM-Selektoren werden mit HTML-Seiten und Section-Familien verknüpft;
- unbekannte Plugins bleiben analysierbar und werden nicht auf feste Template-Namen zugeschnitten;
- Klassifizierung in Section-Verhalten, globales Verhalten, Dependencies, Helper/Konfiguration und unaufgelöste Bindungen;
- Erzeugung von `behavior-manifest.json`, `dependencies.json`, `runtime-plan.json` und `javascript-activation-plan.json`;
- erkannte Bootstrap-/jQuery-Duplikate werden im Aktivierungsplan nicht erneut eingeplant;
- importiertes Template-JavaScript läuft nicht im bearbeitbaren GrapesJS-Canvas.

## Externe Embeds und Plugin-Frames

- `iframe`, `object` und `embed` werden im Editiermodus pauschal isoliert;
- unabhängig vom Anbieter, z. B. Google Maps, OpenStreetMap, Video-/Social-Embeds und andere Fremd-Widgets;
- aktive Fremdquelle wird durch einen skalierenden SVG-Platzhalter ersetzt;
- Tag, Klassen, Style, Breite und Höhe bleiben erhalten;
- Originalquelle und `srcdoc` werden für Preview/Veröffentlichung erhalten;
- Preview-Reaktivierung erfolgt nur im Canvas-DOM und verändert nicht das gespeicherte Editor-Modell;
- `embed-isolation.json` dokumentiert den Compiler-Vertrag.

## Export

- HTML-Export;
- Apache-SSI-Export;
- PHP-Include-Export;
- Ausgabe in einen lokalen Ordner;
- ZIP- und TAR-Archive;
- Sammlung lokaler Framework-, Bild-, Schrift- und Projektassets;
- Entfernung editorinterner Oluntir-Metadaten aus der finalen Ausgabe.

## Arbeitsunterstützung und Diagnose

- optionale lokale Logs nach Zustimmung;
- Diagnosewerkzeuge für Projekt-, Runtime- und Analysezustände;
- Blocksuche, Ebenen-, Eigenschaften- und Style-Ansichten von GrapesJS;
- Fortschrittsanzeige bei Templateanalyse und -aufnahme;
- Aufnahme wird erst nach Rücklesen von Registry und Template-Dateien als erfolgreich gemeldet.

# Funktionen – Oluntir 2.2.1

Diese Übersicht beschreibt die nutzbaren Produktfunktionen von Oluntir 2.2.1. Technische Implementierungsdetails und Fehlerhistorie stehen im Changelog, in den Release Notes und in den Architektur-/DEV-Dokumenten.

## Editor und Projekte

- lokaler visueller Editor auf Basis von GrapesJS 0.23.2;
- mehrseitige Website-Projekte;
- portable `.oluntir`-Projektdateien;
- Seiten anlegen, umbenennen, auswählen und entfernen;
- Ein- und Zwei-Monitor-Arbeitsbereich;
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
- Änderungen können von jeder beteiligten Seite in den gemeinsamen Stand übernommen werden;
- gemeinsame Bereiche werden auf Projektseiten konsistent gehalten;
- Ausgabe als aufgelöstes HTML, Apache SSI oder PHP-Includes.

## Wiederholbare Bereiche

- zentrale Repeat-Bibliothek mit verständlichen Namen;
- Anzeige der verwendeten Seiten und Vorkommen;
- zentrale Bearbeitung im Einzelobjekt-Canvas;
- Draft-/Published-Arbeitsweise;
- **„Auf alle Vorkommen anwenden“** für kontrollierte projektweite Veröffentlichung;
- geschützte Seiteninstanzen mit orangefarbener Steuerleiste;
- einzelne Vorkommen gezielt entfernen und wiederherstellen;
- Repeat-Undo/Redo für Veröffentlichung und Entfernen;
- zusätzliche Vorkommen über Repeat → Zielseite → Einfügeposition einsetzen;
- kompakte, sortierbare und erweiterbare Bibliothekslisten;
- Übernahme bestehender Projekte über stabile Oluntir-Identitäten.

## Bootstrap 4 und 5

- Bootstrap 4.6.2 als Legacy-Profil;
- Bootstrap 5.3.8 als primäres Profil;
- native Bootstrap-Blöcke statt eigener Parallelkomponenten;
- BS4-spezifische Unterstützung u. a. für Jumbotron, Media Object und Custom Forms;
- BS5-spezifische aktuelle Komponenten und Utility-Strukturen;
- getrennte Erkennung der Bootstrap-Generationen über Versions-, Data-API- und Strukturmerkmale.

## Source Packages und Analyzer

- lokaler Source-Package-Import aus Ordnern, Archiven, Browser-Dateien und URLs;
- statische Analyse von HTML, CSS und JavaScript-Evidenz;
- Erkennung von Bootstrap-Versionen, Komponenten und Fähigkeiten;
- quellengebundene Profile und Capability-Informationen;
- geeignete erkannte Strukturen können kontrolliert als GrapesJS-Blöcke bereitgestellt werden;
- unbekannte Frameworks bleiben `analysis-only`;
- importiertes Source-JavaScript wird nicht automatisch ausgeführt.

## Export

- HTML-Export;
- Apache-SSI-Export;
- PHP-Include-Export;
- Ausgabe in einen lokalen Ordner;
- ZIP- und TAR-Archive;
- Sammlung lokaler Framework-, Bild-, Schrift- und Projektassets;
- Entfernung editorinterner Oluntir-Metadaten aus der finalen Ausgabe.

## Arbeitsunterstützung

- globales Undo/Redo für normale Editoraktionen;
- eigene Repeat-Historie für projektweite Repeat-Transaktionen;
- optionale lokale Logs nach Zustimmung;
- Diagnosewerkzeuge für Projekt-, Runtime- und Analysezustände;
- Blocksuche, Ebenen-, Eigenschaften- und Style-Ansichten von GrapesJS.

> **Sprache:** Deutsch · [English](WHY_OLUNTIR.md)
> **Version:** 2.3.0

# Warum Oluntir?

Oluntir behandelt eine Website als zusammenhängendes, übertragbares Projekt und nicht nur als die gerade geöffnete HTML-Seite. Seiten, Assets, Bootstrap-Version, gemeinsame Bereiche, wiederholbare Inhalte und Exportregeln bleiben in einem Projektkontext verbunden.

## Warum GrapesJS?

GrapesJS liefert Canvas, Komponentenmodell, Blöcke, responsive Ansichten und direkte Bearbeitung. Oluntir nutzt GrapesJS 0.23.2 als unveränderte Editor-Engine und ergänzt Projektverwaltung, Shared Content, Repeat-Bibliothek, Assets, Analyzer und Export in eigenen Integrationsschichten.

## Warum lokal?

Oluntir ist local-first:

- Projekte und Assets bleiben unter der Kontrolle des Benutzers;
- kein verpflichtendes Cloud-Konto ist notwendig;
- Projekte können kopiert, gesichert und auf einem anderen Rechner weitergeführt werden;
- veröffentlichte Websites benötigen keine Oluntir-Laufzeit.

## Warum Shared Content?

Header, Navigation und Footer sind typische gemeinsame Seitenbereiche. Oluntir verwaltet sie zentral, damit sie nicht auf jeder Seite unabhängig gepflegt werden müssen.

## Warum eine Repeat-Bibliothek?

Projektweit wiederkehrende Inhaltsbereiche benötigen einen anderen Arbeitsablauf als Header oder Footer. Deshalb verwaltet Oluntir benutzerdefinierte Repeat-Bereiche in einer zentralen Bibliothek. Eine Quelle wird zentral bearbeitet und anschließend kontrolliert auf alle Vorkommen verteilt.

Dadurch bleiben Seiteninstanzen konsistent, ohne bei jeder Texteingabe projektweit synchronisiert werden zu müssen.

## Warum Bootstrap 4 und 5?

Oluntir konzentriert die aktive Editorintegration auf zwei klar definierte Frameworkprofile: Bootstrap 4.6.2 und Bootstrap 5.3.8. Dadurch können Komponenten, Utilities und Template-Strukturen generationsgerecht erkannt und bearbeitet werden, ohne unterschiedliche Frameworkmodelle zu vermischen.

## Warum offene Exportformate?

Oluntir exportiert reguläres HTML, CSS, JavaScript und lokale Assets. Gemeinsame Inhalte können zusätzlich als Apache SSI oder PHP-Includes ausgegeben werden. Ordner-, ZIP- und TAR-Ausgabe bleiben unabhängig von einer proprietären Laufzeit.

## Warum ein lokaler Analyzer?

Bootstrap-Templates unterscheiden sich in Struktur, Komponenten und eingebundenen Assets. Der Analyzer untersucht Quellen statisch und liefert Oluntir eine nachvollziehbare Grundlage für Erkennung und kontrollierte Editorintegration. Fremdes Source-JavaScript wird dabei nicht automatisch ausgeführt.

## Kernidee

Oluntir verbindet visuellen Editor, Projektverwaltung, Bootstrap-Verständnis, wiederverwendbare Inhalte, lokale Assets und offene Exporte zu einer portablen Website-Arbeitsumgebung.

## Weiterführend

- [README](../README_de.md)
- [Funktionen](../FEATURES_de.md)
- [Handbuch](../HANDBOOK_de.md)
- [Architektur](ARCHITECTURE_de.md)

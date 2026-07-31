> **Sprache:** Deutsch · [English (reference)](HANDBOOK.md)

# Technisches Handbuch Oluntir

**Version:** 1.2.0  
**Status:** Stabil  
**Stand:** 30.07.2026

## 1. Zweck

Oluntir bearbeitet und exportiert statische Website-Projekte lokal im Browser. Die Browserpersistenz ermöglicht bequemes Fortsetzen; portable Projektsicherungen und exportierte Dateien bleiben jedoch die maßgeblichen externen Sicherheitskopien.

## 2. Editor-Fundament

GrapesJS 0.23.2 stellt Canvas und visuelle Komponentenbearbeitung bereit. Oluntir verantwortet die umgebende Anwendung: Start, Projekte, Includes, Export, Bildservices, Workspaces, Einstellungen, Schnellbearbeitung und Mehrmonitorbetrieb. Vendor-Dateien werden nicht verändert; Kompatibilitätscode gehört nach `editor/integrations/grapesjs/`.

## 3. Projektarten

Ein klassisches Projekt speichert vollständiges HTML je Seite. Ein Projekt mit sich inhaltlich wiederholenden Elementen und Bereichen verwaltet gemeinsame Layoutquellen und referenziert sie über `<ope-include>`. Der zentrale Resolver erzeugt aufgelöstes HTML, Apache SSI oder PHP-Includes.

## 4. Start und Persistenz

Beim Start prüft Oluntir vorhandene Browserdaten und bietet Fortsetzen, Wiederherstellen oder ein neues Projekt an. Allgemeine Anwendungseinstellungen verwenden `oluntir-settings`; Bildassets verwenden ihre versionierte Asset-Datenbank. Beide Speicher erfüllen unterschiedliche Aufgaben und ersetzen keine Projektsicherung.

## 5. Ein- und Zwei-Monitor-Betrieb

Der bevorzugte Modus lautet `ask`, `single` oder `dual`. Im Zwei-Monitor-Modus bleibt der Canvas im Hauptfenster; die rechte GrapesJS-Werkzeugspalte und die Oluntir-Schnellbearbeitungsbereiche wechseln in ein separates Fenster. Ein eigener Sitzungsstatus beschreibt, ob der Modus tatsächlich aktiv ist. Wird das Werkzeugfenster geschlossen oder verloren, kehren alle ausgelagerten Bereiche ins Hauptfenster zurück.

Die gespeicherte Präferenz wird nicht überschrieben, nur weil aktuell ein Monitor verfügbar ist. Gespeicherte Fenstergrenzen werden vor der Wiederverwendung geprüft. Ohne Window Management API positioniert der Benutzer das Werkzeugfenster manuell.

## 6. Bildmanager

Der Bildmanager ist ein Oluntir-Workspace und nicht die sichtbare GrapesJS-Asset-Manager-Oberfläche. Er verwendet gemeinsame Asset-Services und IndexedDB und bietet Raster-/Listenansicht, Suche, Filter, Details, responsive Varianten, Ersetzen, Löschen und Auswahlmodi.

Für die physische Synchronisation liest der Benutzer zuerst das Infofenster und wählt anschließend den Projektstammordner. Oluntir verwendet oder erstellt `assets/user_upload/`. In einer späteren Browsersitzung kann eine erneute Berechtigung erforderlich sein.

## 7. Galerien

Jede Galerie wählt `none`, `modal` oder `lightbox`. Modal ist ein gerahmter Dialog; Lightbox ein dunkler, rahmenloser Viewer. Beide verwenden gemeinsame Navigation, Tastatursteuerung, Fokusfalle, Fokusrückgabe, Bildbezeichnung, Zähler und Originalbild-Download. Desktop-Layouts reservieren unten einen Sicherheitsabstand; kleinere Displays behalten das bestehende responsive Verhalten.

## 8. Export

Exportformat und Ziel sind getrennte Entscheidungen. Vor dem Schreiben prüft Oluntir fehlende Ziele, doppelte Pfade und zyklische Include-Referenzen. Ordnerzugriff bleibt browserabhängig. ZIP und TAR sind alternative Archivziele.

## 9. Validierung und Release-Prüfungen

Ausführen:

```text
python tools/validate-structure.py
node tools/test-grapesjs-adapter.js
```

Zusätzlich gehören JavaScript-Syntaxprüfung, statische Prüfung lokaler Referenzen, Archivintegrität sowie manuelle Browsertests für Start, Projektwiederherstellung, beide Bootstrap-Profile, Export, Bildmanager, Modal, Lightbox und Monitorumschaltung zum Releaseprozess.

## 10. Betriebliche Einschränkungen

Oluntir kann Browser-Sicherheitsabfragen nicht umgehen und keine automatische Platzierung auf einem anderen Bildschirm garantieren. Importiertes HTML kann unsichere Inhalte enthalten; unbekannte Projekte vor Vorschau und Export prüfen. Vor Migrationen und größeren Änderungen externe Sicherungen anlegen.

## 11. Projektphilosophie und Dokumentationsübersicht

Oluntir ist als lokale Open-Source-Projektumgebung für Websites konzipiert und nicht nur als visueller Seiteneditor. GrapesJS stellt die visuelle Editor-Engine bereit; Oluntir verantwortet Projekt, Workspace, Assets, Shared Content, Persistenz und Export über eigene Adapter und Dienste.

Die Dokumentation steht auf Deutsch und Englisch zur Verfügung. Einstiegspunkte sind die [Dokumentationsübersicht](docs/index_de.md), [Warum Oluntir?](docs/WHY_OLUNTIR_de.md) und die [Architekturübersicht](docs/ARCHITECTURE_de.md).


## Architekturgrundlage Version 1.2.1

Stabile Layout-Identitäten und Repeat Engine V2 sind in `docs/040_LAYOUT_GRAPH_de.md` bis `docs/045_PROJECT_MIGRATION_1.2.1_de.md` dokumentiert.

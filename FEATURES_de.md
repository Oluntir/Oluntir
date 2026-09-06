# Funktionen – Oluntir 2.0.1-alpha

Dieser Alpha-Branch nutzt Oluntir 1.3.1 als Kompatibilitätsbaseline und
konsolidiert die produktive Frameworkunterstützung auf Bootstrap 4.6.2 und 5.3.8.

## Editor und Projekte

- Lokaler browserbasierter GrapesJS-Editor
- Mehrseitige Projekte
- Portable `.oluntir`-Projektdateien
- Ein- und Zwei-Monitor-Arbeitsbereich
- Projekt-Favicon und lokale Assets

## Inhalte und Layout

- Text-, Bild-, Galerie- und Komponentenbearbeitung
- Responsive Bilder für Desktop, Tablet und Mobil
- Shared Content für Header, Navigation und Footer
- Schnellbearbeitung gemeinsamer Inhalte
- Galerie-Einschübe in vorhandenen Containern
- Neue Galerie-Bereiche zwischen vollständigen Seitenbereichen
- Undo und Redo für Text- und Bildänderungen

## Frameworks und Export

- Bootstrap 4.6.2
- Bootstrap 5.3.8
- HTML-, Apache-SSI- und PHP-Include-Export
- Ausgabe als Ordner, ZIP oder TAR
- Entfernung editorinterner Metadaten im finalen Export
- Lokaler Source-Package-Import über die API: Ordner, ZIP, TAR, TAR.GZ/TGZ,
  Browser-Dateien und URLs
- Quellengebundene Recovery-JSON, Source-Hashes und Paketmanifeste
- Nicht-Bootstrap-Packages bleiben `analysis-only` und werden nicht im Editor aktiviert

## Technische Grundlage

- stabile Layout-Identitäten
- read-only Resolver und Dependency Graph
- Action- und Validierungsverträge
- produktive Repeat-Synchronisation für ausdrücklich definierte Bereiche mit stabilen Identitäten
- Statische Evidenzanalyse für HTML, CSS und JavaScript
- OIR-Projektmodell, Capability-Manifest und read-only Knowledge Compiler
- Übersetzungsmatrix und JavaScript-Behavior-Resolver
- Kontrollierte GrapesJS-Source-Package-Bridge
- Portable Windows-x64-Node.js-Runtime für die lokale Analyzer-API

## Bekannte Einschränkung

Eine explizit gesetzte Footer-Schriftfarbe kann in der Arbeitsansicht anders erscheinen als im Export. Der Export übernimmt den gewählten Wert korrekt.

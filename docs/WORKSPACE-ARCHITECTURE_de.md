# Oluntir Workspace-Architektur

Oluntir verwendet ab Version 1.1.0 einen eigenen Workspace-Manager für umfangreiche Werkzeuge. GrapesJS bleibt dabei die Editor-Engine, stellt aber nicht mehr die sichtbare Oberfläche des Bildmanagers bereit.

## Grundprinzip

- `OluntirWorkspaceManager` öffnet und schließt große Werkzeuge.
- Während eines Workspaces werden Schnellkonfiguration und Schnellbearbeitung ausgeblendet.
- Nach dem Schließen wird die Editoroberfläche vollständig wiederhergestellt.
- Module greifen nicht auf interne `.gjs-*`-Strukturen zu.
- Der Bildmanager ist das erste Workspace-Modul.

## Bildmanager

Der Bildmanager verwendet die Asset-Services und IndexedDB. Für große Bestände werden nur zunächst 60 Karten erzeugt. Weitere Karten folgen beim Scrollen. Vorschaubilder werden erst kurz vor dem sichtbaren Bereich geladen.

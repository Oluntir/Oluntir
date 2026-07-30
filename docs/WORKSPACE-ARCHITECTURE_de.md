# Oluntir-Workspace-Architektur

Oluntir 1.2.0 verwendet den `OluntirWorkspaceManager` für umfangreiche anwendungseigene Werkzeuge. GrapesJS bleibt die visuelle Editor-Engine; Oluntir besitzt die sichtbare Bildmanager- und Mehrmonitor-Oberfläche.

## Zuständigkeiten

- vollständige Editor-Workspaces öffnen und schließen;
- kollidierende Schnellbereiche ausblenden und wiederherstellen;
- Workspace-Module von internem GrapesJS-Markup entkoppeln;
- Bildmanager koordinieren;
- Auslagerung von Werkzeugcontainern über den GrapesJS-Adapter unterstützen;
- bei Fehlern oder Fensterschließung alle verschobenen Bereiche wiederherstellen.

## Mehrmonitor-Grenze

`multi-monitor-manager.js` verwaltet zweites Fenster, gespeicherte Grenzen, Status und Fallback. GrapesJS wird im zweiten Fenster nicht neu erzeugt. Canvas und Editorinstanz bleiben im Hauptfenster; nur freigegebene Werkzeugcontainer werden verschoben und synchronisiert.

## Persistenz

Allgemeine Workspace-Einstellungen verwenden `indexeddb-settings-store.js`. Assetdaten bleiben in ihrer getrennten versionierten Datenbank. Bevorzugter und tatsächlich aktiver Monitor-Modus sind bewusst getrennte Zustände.

# Release Notes Oluntir 1.2.0

**Veröffentlichung:** 30.07.2026  
**Release-Typ:** Stabil

Oluntir 1.2.0 entwickelt den Editor zu einem eigenständigeren Anwendungs-Workspace weiter. GrapesJS bleibt dabei unverändert die visuelle Editor-Engine.

## Höhepunkte

### Zwei-Monitor-Arbeitsbereich

Im Hauptfenster verbleibt der GrapesJS-Canvas. Die vollständige rechte GrapesJS-Werkzeugspalte mit Komponenten, Styles, Ebenen und Eigenschaften kann zusammen mit beiden Oluntir-Schnellbearbeitungssystemen in ein eigenes Werkzeugfenster verschoben werden. Schaltflächen in der zweiten Werkzeugleiste lagern die Spalte aus, rufen das Fenster erneut auf oder holen alles ins Hauptfenster zurück.

Arbeitsbereichspräferenz und optionale Fenstergrenzen werden in IndexedDB gespeichert. Wird das zweite Fenster blockiert, geschlossen oder auf einem Rechner mit nur einem Monitor wiederhergestellt, fällt Oluntir sicher auf das Hauptfenster zurück, ohne die bevorzugte Zwei-Monitor-Einstellung zu verwerfen.

### Bildmanager und Projektordner-Synchronisation

Der Workspace-basierte Bildmanager bietet Suche, Filter, Raster- und Listenansicht, responsive Varianten, Details, Ersetzen und sicheres Löschen. Vor dem Ordnerzugriff erklärt ein Infofenster, dass der Projektstammordner gewählt werden muss. Oluntir verwendet oder erstellt anschließend automatisch `assets/user_upload/` und kann die IndexedDB-Uploads dorthin schreiben.

### Galerie-Modi Modal und Lightbox

Galerien unterstützen keine Vergrößerung, ein gerahmtes Modal oder eine echte dunkle Lightbox. Beide Viewer besitzen Tastaturnavigation, Fokusfalle und Fokusrückgabe, Bildbezeichnung, Zähler und Originalbild-Download. Auf Desktop-Systemen bleibt nach unten mindestens eine Bedienelementhöhe Sicherheitsabstand, damit die Aktionen nicht an oder unter der sichtbaren Browserkante liegen.

### Architektur

- `OluntirWorkspaceManager` koordiniert größere Oluntir-Workspaces.
- `multi-monitor-manager.js` verwaltet Werkzeugfenster und Wiederherstellung.
- Allgemeine Einstellungen liegen in einer eigenen IndexedDB.
- GrapesJS bleibt versioniert unter `vendor/grapesjs/` und wird über `editor/integrations/grapesjs/` angesprochen.
- Außerhalb der Adaptergrenze dürfen Oluntir-Module nicht direkt von internen `.gjs-*`-DOM-Klassen abhängen.

## Kompatibilitätshinweise

- Ein aktueller Desktop-Browser ist erforderlich.
- Mehrfenster- und Ordnerzugriff hängen von Browserberechtigungen und Sicherheitsrichtlinien ab.
- Die direkte Auswahl des Zwei-Monitor-Modus über eine Benutzeraktion ist zuverlässiger als ein verzögertes Pop-up.
- Gespeicherte Fensterkoordinaten werden vor der Wiederverwendung validiert.
- Browserdaten ersetzen keine externe Projektsicherung.

## Aktualisierung

Version 1.2.0 in einen neuen Ordner entpacken und die neue `index.html` öffnen. Die vorherige Version und eine Projektsicherung aufbewahren, bis das Projekt erfolgreich geöffnet, geprüft und exportiert wurde. Keine alte Installation durch Vermischen alter und neuer Dateien überschreiben.

## Bekannte Einschränkungen

Oluntir kann Browserberechtigungen für Dateisystem, Fensterpositionierung oder Pop-ups nicht erzwingen. Ist die Window Management API nicht verfügbar oder nicht freigegeben, bleibt das Werkzeugfenster manuell verschiebbar. Die automatische Platzierung auf einem zweiten Monitor setzt daher eine passende Browser- und Betriebssystemkonfiguration voraus.

## In 1.2.0 gestärkte Projektgrundsätze

- GrapesJS bleibt eine unveränderte Open-Source-Engine; Oluntir-Funktionen werden über Adapter- und Integrationsschicht umgesetzt.
- Arbeitsbereichseinstellungen werden lokal gespeichert und können Monitor-Modus, Fenstergeometrie und ausgewählte Workspace-Einstellungen wiederherstellen.
- Der Bildmanager erläutert die Auswahl des Projektstamms, bevor `assets/user_upload/` verwendet oder angelegt wird.
- Modal und Lightbox bleiben bewusst getrennte Darstellungskonzepte.
- Das interne Projektmodell bleibt vom gewählten Exportformat unabhängig.
- Englische und deutsche Release-Informationen werden als gleichwertige Projektdokumentation gepflegt.

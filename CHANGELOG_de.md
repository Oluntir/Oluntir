> **Sprache:** Deutsch · [English (reference)](CHANGELOG.md)

# Änderungsprotokoll

## Oluntir 1.1.0 — 30.07.2026

### Technisches Fundament: GrapesJS

- GrapesJS ist die zentrale visuelle Editor-Engine und damit eine unverzichtbare Grundlage von Oluntir.
- Die unveränderte Vendor-Version, der Adapter und die Kompatibilitätsprüfung schaffen einen kontrollierten Updatepfad für künftige GrapesJS-Versionen.

### Assets und Bedienung

- Uploads werden weiterhin in IndexedDB verwaltet und können zusätzlich nach `assets/user_upload/` des verbundenen Projekts geschrieben werden.
- Eigenständige Bildauswahl mit Suche, Filtern, Raster-/Listenansicht, Bilddetails, Varianten, Ersetzen und sicherem Löschen.
- Lightbox-Hintergrund auf 80 % Schwarz mit dezentem `backdrop-filter: blur(2px)` verfeinert.
- Oberste Werkzeugleiste bleibt beim Scrollen sichtbar; Auswahlfelder im Dark Theme sind kontrastreicher.


### Galerie-Viewer und Barrierefreiheit

- Auswahl der Klickvergrößerung pro Galerie: keine, Modal oder Lightbox.
- Tastaturnavigation, Fokusfalle, Fokusrückgabe, Bildunterschriften, Bildzähler und optionale zyklische Navigation ergänzt.
- Gemeinsame Galerie-Viewer-Laufzeit in die Exporte für Bootstrap 4.6.2 und Bootstrap 5.3.8 aufgenommen.


### Workspace-Architektur

- Neuer zentraler `OluntirWorkspaceManager` für große Editorwerkzeuge.
- Der Bildmanager läuft außerhalb des GrapesJS-Modals und überdeckt die Editorfläche ohne die Schnellbearbeitung zu überlagern.
- Dauerhafter Bildmanager-Button in der oberen GrapesJS-Werkzeugleiste.
- Lazy Loading und abschnittsweises Rendering für große Bildbestände.
- Vorschaubilder werden direkt aus dem IndexedDB-Assetbestand geladen.
- Der Bildmanager kann nach dem Schließen beliebig oft erneut geöffnet werden.

- GrapesJS als unveränderte, versionierte Vendor-Abhängigkeit ausgelagert.
- Zentrale GrapesJS-Adapter- und Kompatibilitätsschicht eingeführt.
- Eigenständiges Image-Select-Modul ohne Abhängigkeit von internen GrapesJS-DOM-Klassen.
- Asset-, IndexedDB-, Varianten- und Verwendungslogik in getrennte Services ausgelagert.
- Suche, Filter, Hauptbild-/Variantenansicht, Auflösungen, Details, Ersetzen und sichere Sammellöschung umgesetzt.


## Oluntir 1.0.0 — 29.07.2026

Oluntir 1.0.0 ist die erste stabile öffentliche Version des browserbasierten Editors für statische Websites.

### Enthaltener Funktionsumfang

- Lokale Bearbeitung im Browser ohne Datenbank oder serverseitige Anwendungslaufzeit.
- Projektprofile für Bootstrap 4.6.2 und Bootstrap 5.3.8.
- Anlegen, Umbenennen und Löschen von Seiten, lokale Browserspeicherung sowie Projektsicherung und Wiederherstellung.
- Portable Projektdateien mit der Endung `.oluntir` bei unveränderter binärer Projektstruktur.
- Klassische HTML-Projekte und Projekte mit zentral gepflegten sich inhaltlich wiederholenden Elementen und Bereichen.
- Shared Content Manager für Header, Navigation, Footer und optionale sich inhaltlich wiederholende Abschnitte.
- Quellcode- und gerenderte Codeansicht.
- Export als aufgelöstes HTML, Apache SSI oder PHP-Includes.
- Export in Ordner, ZIP und TAR.
- Deutsche und englische Oberfläche und Dokumentation.
- Schnelleinrichtung, Schnellbearbeitung, Blocksuche, Galerieunterstützung und responsive Editoransichten.
- Lokal gebündelte Framework-, Schrift-, Bild-, Editor- und Website-Assets.

### Release-Aufbereitung

- Vereinheitlichung von Produktname, sichtbarem Branding, Metadaten, Repository-Links, Websites und Kontaktdaten unter Oluntir.
- Entfernung ausschließlich historischer Entwicklungs- und Zwischenstandsunterlagen vor Version 1.0 aus dem Releasepaket.
- Aktualisierung der produktiven Dokumentation bei Erhalt aller erforderlichen Drittanbieter-Lizenz- und Attributionshinweise.

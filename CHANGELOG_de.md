# Änderungsprotokoll

> **Sprache:** Deutsch · [English (reference)](CHANGELOG.md)

## Oluntir 1.2.0 — 30.07.2026

### Mehrmonitor-Arbeitsbereich

- Startauswahl für Ein- oder Zwei-Monitor-Betrieb mit Stabilitäts- und Pop-up-Hinweis ergänzt.
- IndexedDB-basierte Workspace-Einstellungen für bevorzugten Modus, Startauswahl, Fenstergrenzen und Wiederherstellung eingeführt.
- Eigenes Werkzeugfenster mit vollständiger rechter GrapesJS-Spalte und beiden Oluntir-Schnellbearbeitungsbereichen ergänzt.
- Werkzeugleisten-Schaltflächen zum Auslagern, Zurückrufen, Fokussieren und Zurückholen der Werkzeugspalte ergänzt.
- Sicherer Fallback für blockierte Pop-ups, geschlossene Fenster, nicht verfügbare Bildschirme, ungültige Grenzen und Ein-Monitor-Systeme umgesetzt.
- Bevorzugte Zwei-Monitor-Einstellung und aktiver Sitzungs-Fallback getrennt.

### Bildmanager und Projektordner

- Workspace-basierte Bildverwaltung mit Suche, Filtern, Raster-/Listenansicht, Details, Varianten, Ersetzen und sicherem Löschen fertiggestellt.
- Erklärendes Infofenster vor der Ordnerauswahl ergänzt.
- Aktion zu „Projektordner verbinden“ vereinfacht; der Benutzer wählt den Projektstamm und Oluntir verwendet oder erstellt `assets/user_upload/`.
- Browser-Bildspeicher und physische Ordnersynchronisation bleiben getrennt.

### Galerie-Viewer

- Eigenständige Modi `none`, `modal` und `lightbox` erhalten.
- Echte dunkle, rahmenlose Lightbox wiederhergestellt; gerahmtes Modal beibehalten.
- Bildbezeichnung, Zähler, Originalbild-Download, Tastaturnavigation, Fokusfalle und Fokusrückgabe ergänzt beziehungsweise stabilisiert.
- Unteren Sicherheitsabstand von mindestens einer Bedienelementhöhe auf Desktop ergänzt, ohne das responsive Verhalten zu verändern.

### Architektur und Oberfläche

- `OluntirWorkspaceManager` erweitert und eigene Mehrmonitor- und Settings-Services eingeführt.
- GrapesJS unverändert und versioniert hinter Adapter- und Kompatibilitätsgrenze gehalten.
- Dauerhafte Synchronisation verzögert erzeugter GrapesJS-Werkzeugcontainer in das externe Fenster ergänzt.
- Sticky Toolbar, Dark-Theme-Kontrast, Monitorsteuerung und Einstellungswarnungen verbessert.

## Oluntir 1.0.0 — 29.07.2026

Oluntir 1.0.0 war die erste stabile öffentliche Version. Sie führte lokale Bearbeitung statischer Websites, Bootstrap-4-/5-Profile, Projektpersistenz, sich inhaltlich wiederholende Elemente und Bereiche, das Oluntir-Include-Modell, HTML-/SSI-/PHP-Export, Ordner-/ZIP-/TAR-Ausgabe, zweisprachige Oberfläche und Dokumentation, Schnellbearbeitung, Galerien und lokal gebündelte Assets ein.

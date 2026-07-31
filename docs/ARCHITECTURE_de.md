> **Sprache:** Deutsch · [English](ARCHITECTURE.md)  
> **Version:** 1.2.0 · **Aktualisiert:** 30.07.2026

# Architekturübersicht

Oluntir trennt die visuelle Editor-Engine von den Aufgaben der Projekt- und Anwendungslogik.

```text
Oluntir
├── Benutzeroberfläche und Befehle
├── WorkspaceManager
│   ├── Hauptarbeitsbereich des Editors
│   ├── Bildmanager-Workspace
│   └── externes Werkzeugfenster
├── Projekt- und Seitendienste
├── Shared Content Manager
├── Bild- und Asset-Dienste
├── Exportdienste
├── Bootstrap-Framework-Profile
├── GrapesJS-Adapter und Kompatibilitätsschicht
└── Persistenz
    ├── Projektdaten
    ├── IndexedDB-Arbeitsbereichseinstellungen
    └── optionale Synchronisation mit dem physischen Projektordner
```

## Verantwortungsbereiche

### GrapesJS-Adapter

Nur der Adapter darf von GrapesJS-spezifischen Integrationsdetails abhängen. GrapesJS bleibt eine unveränderte Vendor-Abhängigkeit. Anwendungsmodule dürfen nicht direkt auf undokumentierte interne GrapesJS-DOM-Strukturen zugreifen oder diese außerhalb des Adapters steuern.

### WorkspaceManager

Der WorkspaceManager koordiniert Haupteditor, Bildmanager und externes Werkzeugfenster. Er bewahrt die gewählte Arbeitsweise und stellt zugleich einen sicheren Rückfall auf den Ein-Monitor-Betrieb bereit.

### Projekt- und Seitendienste

Diese Dienste verwalten Projektmetadaten, Seiten, Projekttyp, Framework-Profil, Wiederherstellung und portable `.oluntir`-Projektdaten.

### Shared Content Manager

Shared Content speichert sich inhaltlich wiederholende Elemente und Bereiche zentral und stellt den Seiten sichtbare `<ope-include>`-Referenzen bereit. Die Exportdienste lösen diese Referenzen entsprechend dem gewählten Ziel auf.

### Bild- und Asset-Dienste

Der Bildmanager stellt Suche, Filter, Ansichten, Details, responsive Varianten, Ersetzen, Löschen und nach dem Verbinden des Projektstamms die Synchronisation mit `assets/user_upload/` bereit.

### Exportdienste

Die Exportschicht wandelt das interne, serverneutrale Projektmodell in aufgelöstes HTML, Apache SSI oder PHP-Includes um und kann das Ergebnis als Ordner, ZIP- oder TAR-Archiv ausgeben.

### Persistenz

Arbeitsbereichseinstellungen werden getrennt von Projektinhalten gespeichert. Die Browserpersistenz unterstützt die Fortsetzung der Arbeit; Projekt- und Exportdateien bleiben die übertragbare Grundlage.

## Architekturregel

Neue Funktionen sollen in Oluntirs eigenen Diensten und Adaptern umgesetzt werden. Sie dürfen keine versteckte Kopplung an interne GrapesJS-DOM-Strukturen schaffen und keine proprietäre Laufzeit für die exportierte Website voraussetzen.

## Weiterführende Dokumentation

- [Warum Oluntir?](WHY_OLUNTIR_de.md)
- [Workspace-Architektur](WORKSPACE-ARCHITECTURE_de.md)
- [GrapesJS-Integration](GRAPESJS-INTEGRATION.md)
- [Projektstruktur](PROJECT-STRUCTURE_de.md)
- [Projektgrundsätze](PROJECT-PRINCIPLES_de.md)

## Layout Identity Layer (1.2.1)

`editor/js/core/layout-identities.js` ergänzt persistente interne IDs im GrapesJS-Komponentenmodell. Der GrapesJS-Seitenwrapper bildet den logischen Seitenroot; ein einzelnes `main` ist nicht die persistente Exportquelle. Die ID-Schicht verändert keine Bootstrap-Klassen und keine sichtbaren HTML-IDs.

## Favicon-Pipeline

`favicon-manager.js` erzeugt und persistiert projektweite Faviconvarianten. Der Export ergänzt die Head-Referenzen und schreibt die erzeugten Binärdateien sowie `site.webmanifest` in das Ausgabeziel.

## Responsive Asset Pipeline

Der Uploadspeicher verwaltet Desktop-, Tablet- und Mobile-Varianten. Die Exportpipeline liest Seiten ausschließlich aus dem Modell und sammelt zu jeder verwendeten Uploaddatei den vollständigen Variantenverbund.

## Editor-only Placeholder

Der Hinweis „+ Hier Section einfügen“ wird durch Canvas-CSS für `main:empty` erzeugt. Er gehört weder zum Komponentenbaum noch zum Exportvertrag.

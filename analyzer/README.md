# Oluntir Framework Knowledge Compiler

Der Analyzer ist ein eigenständiger, read-only arbeitender Kernbereich zur Erschließung von Framework- und Templatewissen.

## Aktueller Stand

### DEV_027

- universeller quellengebundener Profile-Builder;
- neues `source-framework-profile.json` je Source Package;
- Source-Hash- und Package-Bindung gegen Fremdverwendung;
- automatische Ableitung belegter Matrixregeln aus Template-, CSS- und
  Framework-Evidenz;
- `unknownFeatures` für nicht sicher erkennbare Merkmale;
- neue Source-Versionen erzeugen neue Profilidentitäten;
- keine globale Framework-Sonderregistry und keine Runtime-Mutation.

### DEV_026

- versionierte Bootstrap-4-/Bootstrap-5-Profile für JavaScript-Verhalten;
- read-only Behavior-Resolver für Trigger, Adapter und Abhängigkeiten;
- `javascript-behavior-resolution.json` je Source Package;
- getrennte Behandlung von `data-toggle` und `data-bs-toggle`;
- Statusdiagnostik für fehlende Profile, Trigger und Paketabhängigkeiten;
- keine Source-Ausführung, Runtime-Aktivierung oder Dokumentmutation.

### DEV_025

- frameworkneutrale JavaScript-Verhaltensmatrix;
- unveränderlicher Verhaltensplan aus `behavior-manifest.json`;
- neutrale Semantik für Accordion, Modal, Tabs, Dropdown, Carousel, Offcanvas
  und Runtime-Evidenzen;
- Frameworkprofil- und Runtime-Gate bleiben vor Aktivierung erforderlich.

### DEV_024

- versionierter JavaScript-Verhaltens- und Runtime-Evidenzvertrag;
- `behavior-manifest.json` für Events, Selektoren, Zustände, Observer, Timer,
  Netzwerkanfragen und DOM-Mutationsmuster;
- standardmäßig deaktivierte Scripts mit expliziter manifestbasierter Auswahl;
- keine Source-Ausführung und keine automatische Dokumentmutation.

### DEV_023

- quellengebundener Komponenten-Katalog aus dem vorhandenen Source-Inventar;
- auswählbare Frontend-Blöcke ohne eigene Oluntir-Komponentenwelt;
- lokale Asset-Auflösung über die API und `user-insert-only`-Mutation-Policy;
- keine Skriptausführung, keine automatische Dokumentmutation, keine `unitId`-Vergabe.

### DEV_022

- frameworkneutraler Source-Package-Import über die lokale API;
- Ordner-, ZIP-, TAR-, TAR.GZ/TGZ-, URL- und Browser-Datei-Eingänge;
- isolierte, versionierte Source Packages mit SHA-256-Inventar;
- vollständige `source-recovery.json` mit komprimierten Dateiinhalten;
- read-only Analyse und Capability-Manifest je importiertem Paket;
- Frontend-Bridge für die bestehende Framework-Auswahl.

### DEV_028

- kontrollierter Universal-Source-Anschluss an den persistenten GrapesJS-Editor;
- erkannte Source-Komponenten als benutzergesteuerte Blöcke;
- Source Package bleibt Quelle der Wahrheit;
- automatische Dokumentmutation, Repeat-Synchronisation und Source-JavaScript-Ausführung bleiben gesperrt.

### DEV_001

- Plattformgrenzen
- Evidenzspeicher
- OIR-Grundmodell mit sieben Graphen
- frameworkneutraler Capability-Katalog
- deklarativer Knowledge Compiler

### DEV_002

- versionierter Source-Inventory-Vertrag
- Source-Inventory-Schema
- statischer HTML-Analyzer
- Dokument-, Element-, Attribut- und Quellpositionsinventar
- Asset- und Referenzerfassung
- Diagnosen für unvollständige HTML-Tokens

### DEV_003

- versionierter CSS-Source-Analysis-Vertrag
- statischer CSS-Analyzer
- Regeln, At-Rules, Selektoren und Deklarationen
- CSS Custom Properties
- Media- und Container-Queries
- Font-Face- und Keyframe-Inventar
- CSS-Assetreferenzen und Diagnosen

## Noch ausdrücklich nicht enthalten

- semantische Interpretation
- Frameworkerkennung
- JavaScript-Analyse
- Runtime-CSS- und Cascade-Auswertung
- Presentation Vocabulary
- DOM-Veränderungen
- HTML-Erzeugung
- GrapesJS-Zugriffe
- Generierung eigener Oluntir-Komponenten
- produktive Adaptererzeugung

# Repeat Engine V2 – Oluntir 2.1.0 BETA

`editor/js/core/repeat-engine-v2.js` speichert Repeat-Definitionen über stabile Oluntir-Identitäten. DOM-Positionen, CSS-Selektoren und eine Änderung der `unitId` dienen nicht als Identität.

## Synchronisation

Unterstützt werden:

- Quelle → Instanzen;
- Instanz → Quelle;
- Instanz → weitere verknüpfte Instanzen.

Resolver, Dependency Graph, Action Contracts und der gemeinsame gezielte Synchronisationsdienst validieren jeden produktiven Plan. Änderungen werden aus dem GrapesJS-Projektmodell gelesen und idempotent geschrieben.

## Benutzerabläufe

### Wiederholbare Bereiche

Quellbereich auswählen → Quellenname setzen → Quelle speichern → Zielseite auswählen → Einfügeposition wählen → Ziel im Canvas bestätigen → Bereich einsetzen. Dieses Fenster zeigt nur die aktuelle Quelle, keine projektweite Quellenliste.

### Wiederholbare Bereiche aus Liste einfügen

Gespeicherte Quelle nach Namen auswählen → Zielseite auswählen → Einfügeposition wählen → Ziel im Canvas bestätigen → Bereich einsetzen. Interne Definition- und Repeat-IDs bleiben technische Korrelation und sind keine Benutzerbezeichnung.

## Bestehende Projekte

Ältere Alpha-Projekte werden beim Laden nur dann nachhydriert, wenn vorhandene Oluntir-Korrelationsmarker Quelle oder Instanz eindeutig bestimmen. Bei Mehrdeutigkeit wird keine Bindung geraten.

> **Sprache:** Deutsch · [English](SHARED-CONTENT-MANAGER.md)

# Shared Content Manager

**Version:** 2.1.0 BETA
**Status:** BETA
**Stabile Baseline:** Oluntir 1.3.1
**Letzte Aktualisierung:** 2026-09-06

Der Shared Content Manager synchronisiert die Layoutbereiche eines Projekts mit sich inhaltlich wiederholenden Elementen und Bereichen über alle Seiten hinweg.

## Verwaltete Bereiche

- Header;
- Navigation;
- Footer.

Jeder Bereich besitzt genau eine zentrale Repräsentation im Oluntir-Projektzustand. Die Seiten zeigen beim Bearbeiten aufgelöste Inhalte. Änderungen werden in den zentralen Zustand zurückgeschrieben und anschließend auf alle anderen Seiten übertragen.

## Synchronisationsablauf

1. GrapesJS meldet eine Komponentenänderung.
2. Der Manager liest die Layoutbereiche der aktuellen Seite.
3. Geänderte Bereiche werden über `OluntirIncludes.updateLayoutRegions()` gespeichert.
4. Alle anderen Seiten werden aus dem zentralen Zustand aktualisiert.
5. Vor Seitenwechsel, Löschen, Speichern oder Neuerstellung wird die ausgewählte Seite erneut übernommen.

Eigene Aktualisierungsereignisse werden während der Übertragung unterdrückt. Zusätzlich beendet 2.1.0 BETA einen Komponenten-Commit sofort, wenn sich der zentrale Shared-Content-Fingerprint nicht geändert hat. Dadurch entstehen bei redundanten GrapesJS-Events weder Zielmutationen noch zusätzliche `editor.store()`-Aufrufe.

## Neue Seiten

Neue Seiten verwenden den aktuellen zentralen Header, die Navigation und den Footer. Das seitenspezifische `<main>`-Element wird leer angelegt. Vorhandene Include-Dateien werden weiterverwendet; es entstehen keine Duplikate.

## Öffentliche Browser-API

```javascript
window.OluntirSharedContentManager.flushSelected();
window.OluntirSharedContentManager.flushPage(page);
window.OluntirSharedContentManager.applyToPage(page);
window.OluntirSharedContentManager.applyToAll(excludedPage);
```

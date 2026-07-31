# Änderungsprotokoll

> **Sprache:** Deutsch · [English](CHANGELOG.md)

## 1.2.1 — 31.07.2026

### Hinzugefügt

- Stabile, additive interne Identitäten für Page, Section, Row, Slot, Component und Repeat.
- Schema-Versionen für Projekt, Layout-Identitäten und Repeat Engine V2.
- Idempotente Migration vorhandener 1.2.0-Projekte beim Laden.
- Technische Repeat-Engine-V2-Grundlage mit modellbasierter Zielauflösung.
- Projekt-Favicon-Dialog in der zweiten Werkzeugleiste.
- Automatische Erzeugung von ICO-, PNG-, Apple- und Android-Faviconvarianten sowie `site.webmanifest`.
- Zustandsprüfung im Favicon-Dialog mit Vorschau, Quelldatei, Dateityp und Änderungszeitpunkt.
- Editorhinweis **„+ Hier Section einfügen“** für leere neue Seiten.
- Automatisierte Tests für Identitäten, Read-only-Export, responsive Uploads, Favicon, RTE-Cursor und GrapesJS-Adapter.

### Geändert

- HTML-, SSI- und PHP-Export lesen Seiten direkt aus dem jeweiligen GrapesJS-`MainComponent`.
- Der Export ist nicht-destruktiv: keine sichtbaren Seitenwechsel, keine Canvas-Rückschreibung und keine automatische Projektspeicherung während des Exports.
- Shared Header, Navigation, Footer und Include-Bereiche werden an ihrer bestehenden Modellposition verarbeitet statt pauschal neu angeordnet.
- Neue Seiten übernehmen gemeinsame Projektbereiche, aber keinen individuellen Inhalt der Startseite.
- Favicon-Ersetzen entfernt alle alten Varianten vor der Neuerzeugung.
- Upload-Export nimmt Desktop-, Tablet- und Mobile-Varianten als zusammengehörige Assetgruppe auf.

### Behoben

- Zusätzliche Row/Spalte aus dem gerenderten Canvas im Export.
- Fehler `headerContainsNavigation is not defined` bei HTML-, SSI- und PHP-Export.
- Falsche SSI-/PHP-Reihenfolge und doppelte Shared-Inhalte in bestehenden Projekten.
- Verlust neu gesetzter Card-Bilder während des Export-Layers.
- Fehlende Tablet- und Mobile-Dateien unter `assets/user_upload/` und Legacy-Pfaden.
- Cursor-Sprung an den Zeilenanfang während aktiver Rich-Text-Bearbeitung.
- Künstlicher Abstand zwischen letzter Row und Footer auf neuen Seiten.
- Nicht erreichbarer unterer Canvas-Bereich bei langen Seiten.
- Fehlende Head-Verweise für 48×48- und Android-Favicons sowie fehlende Manifest-Verknüpfung.
- Favicon-Dialog meldete trotz vorhandener Assets fälschlich, es sei kein eigenes Favicon gesetzt.

### Migration und Kompatibilität

- Vorhandene HTML-IDs, Klassen, Texte, Bilder und Links werden nicht verändert.
- Fehlende interne IDs werden ergänzt; vorhandene interne IDs bleiben erhalten.
- Interne `data-oluntir-*`-Attribute bleiben im `.oluntir`-Projekt und werden nur aus der finalen Exportkopie entfernt.
- Bootstrap 4 und Bootstrap 5 bleiben unterstützt.
- Bestehende Shared-Content- und OPE-Include-Strukturen werden nicht automatisch umgebaut.

### Bekannte Grenze

- Repeat Engine V2 ist in 1.2.1 als technische Grundlage und Datenmodell vorhanden. Eine vollständige sichtbare Verwaltungsoberfläche für Wiederholungen ist nicht Bestandteil dieses Releases.

## 1.2.0 — 30.07.2026

- Zwei-Monitor-Arbeitsbereich mit auslagerbarer GrapesJS-Werkzeugspalte.
- Workspace-basierter Bildmanager mit responsiven Varianten.
- Projektordner-Synchronisation für `assets/user_upload/`.
- Galerie-Modi `none`, `modal` und `lightbox`.
- Verbesserte Workspace-, Persistenz- und GrapesJS-Adapterarchitektur.

## 1.0.0 — 29.07.2026

Erste stabile öffentliche Version mit lokaler Website-Bearbeitung, Bootstrap-4-/5-Profilen, Projektpersistenz, Shared Content, OPE-Includes, HTML-/SSI-/PHP-Export, Schnellbearbeitung, Galerien und lokal gebündelten Assets.

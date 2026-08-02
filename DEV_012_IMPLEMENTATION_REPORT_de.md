# Oluntir 2.0 – DEV_012

## Bildaktionen mit Undo und Redo

### Ziel
Bildänderungen werden über denselben GrapesJS-UndoManager wie sonstige Dokumentänderungen geführt.

### Umgesetzt
- Bildaustausch im Text-/Media-Editor über `OluntirDocumentApi.updateAttributes`.
- Änderung von Bildquelle, Alt-Text und Titel in der Schnellbearbeitung über die Dokument-API.
- Responsiver Galerie-Bildwechsel als Batch aus Bild, Sources, Lightbox-Link und Download-Link.
- Undo-/Redo-Befehle verwenden zentral `OluntirDocumentApi.undo()` und `redo()`.
- Nach Undo/Redo werden Canvas-Pfade erneut aufgelöst und der Projektzustand zeitnah persistiert.
- Alte Zwischenberichte `DEV_011_FIX*` wurden aus dem Paket entfernt.

### Bewusst nicht rückgängig machbar
Das dauerhafte Löschen einer hochgeladenen Datei aus IndexedDB bzw. dem Projektordner bleibt eine explizit bestätigte Asset-Verwaltungsaktion. Es ist keine reine Dokumentänderung und wird nicht durch den GrapesJS-Verlauf wiederhergestellt.

### Tests
- Bildaustausch erzeugt einen Undo-Schritt.
- Undo stellt die vorherigen Attribute wieder her.
- Redo stellt die neuen Attribute wieder her.
- Galerie-Bildwechsel aktualisiert Desktop-, Tablet-, Mobil-, Lightbox- und Download-Referenzen.
- Undo/Redo stößt Persistenz und Canvas-Refresh an.

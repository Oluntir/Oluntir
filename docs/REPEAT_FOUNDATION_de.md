# Repeat Foundation

`editor/js/core/repeat-engine-v2.js` speichert Wiederholungsdefinitionen anhand stabiler Identitäten statt DOM-Positionen. Eine Definition enthält Quellseite, Quellkomponente, Wiederholungseinheit, Zielseiten, Zielpfad, Modus und Schema-Version.

Die Modi heißen `selected` und `context`. Zielseiten und Komponenten werden ausschließlich über das GrapesJS-Seiten- und Komponentenmodell aufgelöst. Vorhandene passende Strukturen werden zusammengeführt, fehlende ergänzt. Die Engine steht als `window.OluntirRepeatEngineV2` bereit. Version 1.2.1 ergänzt bewusst keine neue Benutzeroberfläche.

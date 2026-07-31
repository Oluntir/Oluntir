# Oluntir 1.3.0 DEV_020 – BS4 Gallery Inline-SVG Fix

## Fehlerbild

In der Bootstrap-4-Galerie waren die Schaltflächen für Vergrößern und Original-Download sichtbar, die eigentlichen Symbole jedoch weder dauerhaft noch beim Mouseover zuverlässig erkennbar. Der Fehler trat in der Voransicht und im Export auf.

## Ursache

DEV_019 stellte die Symbole über externe SVG-Dateien als CSS-Masken dar. Diese Lösung hing von der Auflösung relativer CSS-URLs, dem Export der zusätzlichen SVG-Dateien und der Unterstützung externer Masken im jeweiligen Browser-/iframe-/file-Kontext ab. Insbesondere in der lokalen Voransicht und in exportierten Paketen war diese Kette nicht robust.

## Korrektur

- Zoom- und Download-Symbol werden als echte Inline-SVGs im Galerie-Markup erzeugt.
- Keine PNG-Dateien, Icon-Fonts oder externen SVG-Masken.
- Die Darstellung verwendet `stroke: currentColor`, feste Geometrie und eine dauerhaft weiße Icon-Farbe.
- Die Symbole sind im Grundzustand, beim Hover und beim Tastaturfokus sichtbar.
- Die Lösung ist unabhängig von relativen Asset-Pfaden und funktioniert damit in Voransicht, Export, `file://` und Webserver-Betrieb.

## Geänderte Dateien

- `editor/js/features/gallery.js`
- `assets/css/pagebuilder-bs4.css`
- `assets/css/pagebuilder-bs5.css`
- `tests/test-gallery-svg-icons.js`
- `audit/OLUNTIR_1.3.0_DEV_020_BS4_GALLERY_INLINE_SVG_FIX.md`

## Architekturwirkung

Keine Änderung am Galerie-Datenmodell, an den stabilen Bildpfaden, an den Download-Zielen oder an der Viewer-Funktion. Es wurde ausschließlich die visuelle Icon-Ausgabe von pfadabhängigen CSS-Masken auf selbst enthaltene SVG-Geometrie umgestellt.

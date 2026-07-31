# Oluntir 1.3.0 DEV_024 – BS4 Gallery Download Source Fix

## Ursache

Der Download-Button war vorhanden, das sichtbare Symbol hing aber weiterhin von CSS-Pseudoelementen bzw. zuvor erzeugter Icon-Geometrie ab. Zusätzlich wurden Canvas-CSS und JavaScript unter unveränderten Dateinamen geladen, wodurch alte Browserstände weiterverwendet werden konnten.

## Lösung

- Das Download-Symbol wird als echtes DOM-Zeichen `⇩` direkt in den Download-Link geschrieben.
- Bestehende gespeicherte Galerien werden beim Laden, Projektwechsel und Seitenwechsel automatisch repariert.
- Die bisherigen Download-Pseudoelemente werden ausdrücklich deaktiviert.
- Canvas-CSS sowie die geänderten Editor-Skripte erhalten einen Versionsparameter für zuverlässige Cache-Aktualisierung.
- Exportpfade bleiben unverändert und ohne Query-Parameter.

## Betroffene Dateien

- `editor/js/features/gallery.js`
- `editor/js/core/editor.js`
- `editor/js/core/framework.js`
- `assets/css/pagebuilder-bs4.css`
- `assets/css/pagebuilder-bs5.css`
- `index.html`
- `tools/validate-structure.py`
- zugehörige Galerie-Tests

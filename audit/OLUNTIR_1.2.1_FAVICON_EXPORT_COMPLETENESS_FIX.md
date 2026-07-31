# Oluntir 1.2.1 – Favicon export completeness fix

## Ursache
Die Varianten 48×48, 192×192 und 512×512 wurden erzeugt, aber nicht vollständig im Dokumentkopf referenziert. Für Android fehlte außerdem ein Web-App-Manifest.

## Umsetzung
- 48×48-Favicon als `rel="icon"` ergänzt.
- Android-Icons 192×192 und 512×512 explizit verknüpft.
- `site.webmanifest` wird automatisch erzeugt und exportiert.
- Manifest enthält beide Android-Icon-Pfade.
- Vollständigkeitstest prüft Ausgabevarianten und Head-Verweise gemeinsam.

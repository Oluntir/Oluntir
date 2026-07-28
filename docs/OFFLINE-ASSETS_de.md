> **Sprache:** Deutsch · [English (reference)](OFFLINE-ASSETS.md)

# Lokale Assets

## Zweck

Editorvorschau und Website-Export verwenden lokal gebündelte Dateien.

## Frameworks

- Bootstrap 4.6.2 unter `frameworks/bootstrap4/`;
- Bootstrap 5.3.8 unter `frameworks/bootstrap5/`;
- lokales jQuery 3.4.1 für das Bootstrap-4-Profil.

## Schriften

Webfonts liegen unter `assets/fonts/`. `assets/css/local-fonts.css` bindet sie mit relativen Pfaden ein. Es werden keine Font-CDNs benötigt.

## Export

Ordner-, ZIP- und TAR-Ausgabe übernehmen die erforderlichen Framework-, Schrift- und Asset-Dateien. Exportierte Projekte können dadurch ohne externe CDN-Abhängigkeiten betrieben werden.

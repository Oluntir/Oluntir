> **Sprache:** Deutsch · [English](README.md)

# Oluntir 1.3.1

Oluntir ist ein lokaler, browserbasierter Website-Editor auf Basis von GrapesJS 0.23.2. Die Anwendung verwaltet mehrseitige Projekte, lokale Assets, gemeinsame Seitenbereiche und Exporte ohne serverseitige Anwendungslaufzeit.

**Release:** 1.3.1  
**Datum:** 2. August 2026  
**Status:** Stable

## Unterstützte Profile und Exporte

- Bootstrap 4.6.2
- Bootstrap 5.3.8
- HTML-, Apache-SSI- und PHP-Include-Export
- Ausgabe als Ordner, ZIP oder TAR

## Zentrale Funktionen

- visuelle Bearbeitung mit GrapesJS;
- mehrseitige Projekte und portable `.oluntir`-Projektdateien;
- Shared Content für Header, Navigation und Footer;
- gezielte, persistente Schnellbearbeitung gemeinsamer Inhalte;
- Galerie- und Layout-Einschübe innerhalb vorhandener Container sowie zwischen Seitenbereichen;
- Bildmanager mit Desktop-, Tablet- und Mobilvarianten;
- Undo und Redo für Text- und Bildänderungen;
- Projekt-Favicon, Lightbox und Download-Links;
- Ein- und Zwei-Monitor-Arbeitsbereich;
- stabile interne Layout-Identitäten;
- vorbereitete, inaktive Repeat Foundation ohne sichtbare oder produktive Synchronisation;
- optionales lokales Logging nach ausdrücklicher Zustimmung.

## Start

1. Archiv entpacken.
2. `index.html` in einem aktuellen Chromium-basierten Desktop-Browser öffnen.
3. Lizenz-, Datenschutz- und Sicherheitsbedingungen bestätigen.
4. Ein Projekt öffnen oder neu anlegen.

## Bekannte Einschränkung

Eine explizit gesetzte Footer-Schriftfarbe kann in der Arbeitsansicht von der exportierten Darstellung abweichen. Der Export übernimmt den ausdrücklich gewählten Wert korrekt.

## Dokumentation

- [Dokumentationsindex](docs/index_de.md)
- [Technisches Handbuch](HANDBOOK_de.md)
- [Funktionen](FEATURES_de.md)
- [Release Notes](RELEASE_NOTES_de.md)
- [Sicherheit](SECURITY_de.md)
- [Datenschutz](PRIVACY_de.md)
- [Release-Audit](audit/OLUNTIR_1.3.1_AUDIT.md)

## Lizenz

Der Oluntir-eigene Quellcode steht unter der MIT-Lizenz. Drittkomponenten behalten ihre jeweiligen Lizenzen. Details stehen in [LICENSING_de.md](LICENSING_de.md), [THIRD_PARTY_NOTICES_de.md](THIRD_PARTY_NOTICES_de.md) und `compliance/`.

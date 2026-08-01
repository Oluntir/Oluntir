> **Sprache:** Deutsch · [English](README.md)

# Oluntir 1.3.0

Oluntir ist ein lokaler, browserbasierter Website-Editor auf Basis von GrapesJS 0.23.2. Die Anwendung verwaltet mehrseitige Projekte, lokale Assets, gemeinsame Seitenbereiche und Exporte ohne serverseitige Anwendungslaufzeit.

**Release:** 1.3.0  
**Datum:** 1. August 2026  
**Status:** Release

## Unterstützte Projektprofile

- Bootstrap 4.6.2
- Bootstrap 5.3.8
- HTML-Export
- Apache-SSI-Export
- PHP-Include-Export
- Ausgabe als Ordner, ZIP oder TAR

## Zentrale Funktionen

- visuelle Bearbeitung mit GrapesJS;
- mehrere Seiten und projektweite gemeinsame Bereiche;
- stabile interne Layout-Identitäten;
- Shared Content für Header, Navigation und Footer;
- Fingerprint-basierte, verzögerte Synchronisation ohne Vollprojekt-Neuaufbau;
- Bildmanager mit Desktop-, Tablet- und Mobile-Varianten;
- Galerie, Lightbox und Projekt-Favicon;
- Ein- und Zwei-Monitor-Arbeitsbereich;
- portable `.oluntir`-Projektdateien;
- lokale Diagnoseprotokolle nach ausdrücklicher Zustimmung;
- installationsbezogene Zustimmung zu Lizenz, Datenschutz und Sicherheitsrichtlinien;
- Developer Diagnostics Center für Laufzeit-, Action-, Log- und Graph-Snapshots.

## Semantischer Kern

Version 1.3.0 enthält folgende interne Schichten:

```text
Semantic Dictionary
→ Identity Resolver
→ Context Resolver
→ Structure Resolver
→ Relationship Resolver
→ Project Dependency Graph
→ Semantic Action Engine
→ Semantic Validator / Shared Content / Repeat Engine / Export
```

Structure Resolver, Relationship Resolver und Project Dependency Graph arbeiten nur lesend, sofern ihre APIs ausdrücklich aufgerufen werden. Die Semantic Action Engine ist als isolierter Orchestrierungskern vorhanden. Bestehende Fachmodule werden in 1.3.0 noch nicht vollständig über die Engine ausgeführt.

## Start

1. Archiv entpacken.
2. `index.html` in einem aktuellen Chromium-basierten Desktop-Browser öffnen.
3. Lizenz, Datenschutz und Sicherheitsrichtlinien bestätigen.
4. Optional den vorhandenen Unterordner `logs` auswählen und lokales Logging aktivieren.
5. Ein Projekt öffnen oder anlegen.

Die Zustimmung ist an den konkreten entpackten Programmordner gebunden. Ein anderer Programmordner fordert erneut zur Zustimmung auf.

## Logging

Logging ist optional und lokal. Bei Aktivierung erhält Oluntir ausschließlich Schreibzugriff auf den vom Benutzer gewählten Ordner `logs`. Die Datei `.oluntir-logging.json` dokumentiert Freigabe, Version und Maskierungsregeln. Seiteninhalte werden nicht absichtlich protokolliert. Sensible Schlüssel und typische Pfadbestandteile werden maskiert.

## Repository-Struktur

```text
assets/       Website- und Projektassets
editor/       Oberfläche, Kernmodule, Services und Integrationen
frameworks/   Bootstrap-Profile
plugins/      eingebundene Bibliotheken
vendor/       unveränderte Vendor-Abhängigkeiten
docs/         Anwender-, Architektur- und AI-Wissensdokumentation
tests/        automatisierte Regressionstests
compliance/   Lizenz- und Assetnachweise
logs/         lokales optionales Logging
audit/        Release-Audit
```

## Dokumentation

- [Dokumentationsindex](docs/index_de.md)
- [Technisches Handbuch](HANDBOOK_de.md)
- [Architektur](docs/ARCHITECTURE_de.md)
- [Release Notes](RELEASE_NOTES_de.md)
- [Datenschutz](PRIVACY_de.md)
- [Sicherheit](SECURITY_de.md)
- [AI-Wissensbasis](docs/AI/000_PROJECT_de.md)
- [Release-Audit](audit/OLUNTIR_1.3.0_AUDIT.md)

## Lizenz

Der Oluntir-eigene Quellcode steht unter der MIT-Lizenz. Drittkomponenten behalten ihre jeweiligen Lizenzen. Details stehen in [LICENSING_de.md](LICENSING_de.md), [THIRD_PARTY_NOTICES_de.md](THIRD_PARTY_NOTICES_de.md) und `compliance/`.

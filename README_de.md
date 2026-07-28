> **Sprache:** Deutsch · [English (reference)](README.md)

# Oluntir

Oluntir ist ein browserbasierter Editor für statische Websites. Die Anwendung arbeitet lokal und erzeugt HTML, CSS und JavaScript ohne erforderliche Datenbank oder serverseitige Projektlaufzeit.

**Version:** 1.0.0  
**Status:** Release Candidate

## Funktionen

- lokale Nutzung im Browser;
- Projektprofile für Bootstrap 4.6.2 und Bootstrap 5.3.8;
- Seitenverwaltung, Speichern und Wiederherstellen;
- klassische HTML-Projekte und Projekte mit wiederverwendbaren Bereichen;
- automatische Übernahme von Header, Navigation und Footer beim Erstellen neuer Seiten in Projekten mit wiederverwendbaren Bereichen;
- Oluntir-Dokumentmodell mit sichtbaren `<ope-include>`-Referenzen;
- Export als vollständig aufgelöstes HTML, Apache SSI oder PHP Includes;
- Export in Ordner, ZIP oder TAR;
- deutsch- und englischsprachige Benutzeroberfläche;
- Schnellkonfiguration, Schnellbearbeitung und Blocksuche;
- responsive Editoransichten;
- lokale Framework-, Schrift- und Bilddateien.

## Projektarten

### Klassisches HTML-Projekt

Jede Seite enthält ihren vollständigen HTML-Inhalt. Der Export erzeugt eigenständige HTML-Dateien.

### Projekt mit wiederverwendbaren Bereichen

Header, Navigation, Footer und zusätzliche Bereiche werden zentral verwaltet. Die interne Seitenstruktur verwendet Oluntir-Referenzen:

```html
<ope-include src="includes/layout/navigation.html"></ope-include>
```

Der zentrale Include-Resolver erzeugt daraus je nach Exportziel vollständig aufgelöstes HTML, Apache-SSI-Direktiven oder PHP-Includes. Beim Anlegen einer neuen Seite werden der aktuelle gemeinsame Header, die Navigation und der Footer übernommen; für den seitenspezifischen Inhalt wird ein leeres `<main>`-Element angelegt. Änderungen an diesen gemeinsamen Layoutbereichen können auf jeder Seite vorgenommen werden. Beim Seitenwechsel werden sie in den zentralen Oluntir-Zustand zurückgeschrieben und automatisch auf die nächste Seite übertragen. Es entstehen keine doppelten Include-Dateien.

## Lokaler Start

1. Projektarchiv entpacken.
2. `index.html` in einem aktuellen Browser öffnen.
3. Bestehendes Projekt laden oder ein neues Projekt anlegen.
4. Seiten bearbeiten und das gewünschte Exportformat auswählen.

Einige Datei- und Ordnerfunktionen unterscheiden sich je nach Browser und bei Aufruf über `file://`. Oluntir zeigt für bekannte Einschränkungen Hinweise an.

## Repository-Struktur

```text
assets/       Lokale Schriften, Bilder und projektbezogene Assets
editor/       Benutzeroberfläche und Kernfunktionen
frameworks/   Versionierte Bootstrap-Profile
plugins/      Eingebundene Editor- und Website-Bibliotheken
docs/         Technische Dokumentation
compliance/   Lizenz- und Asset-Nachweise
templates/    Editions- und Projektvorlagen
examples/     Beispielmaterial
.github/      Repository-Vorlagen und Automatisierung
```

## Technische Dokumentation

- [Projektstruktur](docs/PROJECT-STRUCTURE.md)
- [Oluntir-Include-System](docs/OLUNTIR-INCLUDE-SYSTEM.md)
- [Offline-Assets](docs/OFFLINE-ASSETS.md)
- [Dokumentationsstandard](docs/DOCUMENTATION-STYLE.md)

## Lizenzierung

Der originale Oluntir-Quellcode steht unter der MIT-Lizenz. Eingebundene Bibliotheken, Schriften und sonstige Drittkomponenten behalten ihre jeweiligen Lizenzen. Details enthalten:

- [LICENSE](LICENSE)
- [LICENSING.md](LICENSING.md)
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
- [Lizenzmatrix](compliance/LICENSE_MATRIX.md)

## Beiträge und Meldungen

Hinweise zur Mitarbeit stehen in [CONTRIBUTING.md](CONTRIBUTING.md). Sicherheitsrelevante Meldungen werden gemäß [SECURITY.md](SECURITY.md) behandelt.

### Leere Projekte mit wiederverwendbaren Bereichen

Ein neues Projekt mit wiederverwendbaren Bereichen startet mit einer leeren Seite. Oluntir fügt keinen vorgegebenen Header, keine Navigation und keinen Footer ein. Erst nachdem der Benutzer diese Elemente angelegt hat, verwaltet der Shared Content Manager sie als projektweit gemeinsame Quelle und übernimmt ihren aktuellen Stand in neu erstellte Seiten. Enthält der Header bereits eine Navigation, bleibt sie Bestandteil des Headers und wird nicht ein zweites Mal eingefügt.

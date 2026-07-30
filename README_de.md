> **Sprache:** Deutsch · [English (reference)](README.md)

# Oluntir

**Version:** 1.2.0  
**Status:** Stabil  
**Veröffentlichung:** 30.07.2026

Oluntir ist ein offline-orientierter, browserbasierter Editor für statische Websites. Die Anwendung erstellt und pflegt HTML-, CSS- und JavaScript-Projekte lokal, ohne eine Datenbank oder serverseitige Anwendungslaufzeit zu benötigen.

## GrapesJS als Editor-Engine

Oluntir verwendet **GrapesJS 0.23.2** als zentrale visuelle Editor-Engine. GrapesJS bleibt unverändert und versioniert unter `vendor/grapesjs/`. Oluntir-spezifisches Verhalten ist hinter der Integrations- und Kompatibilitätsschicht in `editor/integrations/grapesjs/` gekapselt. Dadurch bleiben Projekt-, Asset-, Workspace-, Export- und Mehrmonitor-Architektur unabhängig von internen GrapesJS-DOM-Strukturen.

## Höhepunkte der Version 1.2.0

- **Zwei-Monitor-Arbeitsbereich:** Der GrapesJS-Canvas bleibt im Hauptfenster; die vollständige rechte Werkzeugspalte und die Oluntir-Schnellbearbeitung können in ein eigenes Werkzeugfenster ausgelagert werden.
- **Sichere Wiederherstellung:** Blockierte Pop-ups, geschlossene Fenster, nicht verfügbare Bildschirme, ungültige Positionen und Rechner mit nur einem Monitor führen zu einem sicheren Fallback, ohne die bevorzugte Einstellung zu löschen.
- **Dauerhafte Arbeitsbereichseinstellungen:** Monitor-Modus, Startauswahl, Fenstergröße und Position werden in einer eigenen IndexedDB gespeichert.
- **Workspace-basierter Bildmanager:** Suche, Filter, Raster-/Listenansicht, Details, responsive Varianten, Ersetzen, Löschen und Projektordner-Synchronisation.
- **Projektordner verbinden:** Vor der Auswahl erklärt ein Infofenster den Ablauf. Der Benutzer wählt den Projektstammordner; Oluntir verwendet oder erstellt automatisch `assets/user_upload/`.
- **Galerie-Viewer:** Eigenständiges Modal und echte Lightbox mit Tastaturnavigation, Fokusführung, Bildbezeichnung, Zähler, Originalbild-Download und geschütztem Abstand nach unten.
- **Stabile und klarere Bedienung:** dauerhaft sichtbare obere Werkzeugleiste, verbesserter Kontrast und eindeutige Schaltflächen zum Auslagern und Zurückholen der Werkzeugspalte.

## Hauptfunktionen

- Projektprofile für Bootstrap 4.6.2 und Bootstrap 5.3.8;
- klassische HTML-Projekte sowie Projekte mit sich inhaltlich wiederholenden Elementen und Bereichen;
- Seitenverwaltung, Browserpersistenz, Projektsicherung, Wiederherstellung und portable `.oluntir`-Projektdateien;
- Shared Content Manager für Header, Navigation, Footer und optionale gemeinsame Bereiche;
- editierbares Oluntir-Include-Modell mit sichtbaren `<ope-include>`-Referenzen;
- Export als aufgelöstes HTML, Apache SSI oder PHP-Includes;
- Ausgabe als Ordner, ZIP oder TAR;
- deutsche und englische Benutzeroberfläche und Dokumentation;
- Schnellkonfiguration, Schnellbearbeitung, Blocksuche, responsive Editoransichten, Galerien und Bildverwaltung;
- lokal gebündelte Framework-, Schrift-, Bild-, Editor- und Website-Assets.

## Lokaler Start

1. Release-Archiv entpacken.
2. `index.html` in einem aktuellen Desktop-Browser öffnen.
3. Beim Start Ein- oder Zwei-Monitor-Betrieb wählen.
4. Ein vorhandenes Projekt fortsetzen oder ein neues Projekt erstellen.
5. Vor größeren Änderungen oder Migrationen eine zusätzliche Projektsicherung anlegen.

Ordnerzugriff und Mehrfensterbetrieb hängen von Browserberechtigungen ab. Ein nachträglich geöffnetes Werkzeugfenster kann als Pop-up erkannt werden; das direkte Öffnen über eine Benutzeraktion ist am zuverlässigsten.

## Projektordner verbinden

Im Bildmanager **Projektordner verbinden** wählen und den Stammordner des aktuellen Oluntir-Projekts auswählen – nicht `assets` und nicht `user_upload`. Oluntir verwendet oder erstellt anschließend automatisch:

```text
assets/user_upload/
```

Browserberechtigungen können nach einem Neustart, auf einem anderen Rechner oder nach dem Löschen von Websitedaten verloren gehen. IndexedDB-Bildbestand und physischer Projektordner bleiben deshalb getrennte Persistenzebenen.

## Repository-Struktur

```text
assets/       Lokale Schriften, Bilder und projektbezogene Assets
editor/       Oluntir-Oberfläche, Services, Workspaces und Kernfunktionen
frameworks/   Versionierte Bootstrap-Profile
plugins/      Eingebundene Editor- und Website-Bibliotheken
vendor/       Unveränderte, versionierte Editor-Abhängigkeiten
docs/         Anwender- und technische Dokumentation
compliance/   Lizenz- und Asset-Nachweise
templates/    Editions- und Projektvorlagen
examples/     Beispielmaterial
.github/      Repository-Vorlagen und Automatisierung
```

## Dokumentation

- [Erster Start](docs/FIRST_START_de.md)
- [Mehrmonitor-Arbeitsbereich](docs/MULTI_MONITOR_de.md)
- [Bildmanager](docs/IMAGE_MANAGER_de.md)
- [Workspace-Architektur](docs/WORKSPACE-ARCHITECTURE_de.md)
- [GrapesJS-Integration](docs/GRAPESJS-INTEGRATION.md)
- [Projektstruktur](docs/PROJECT-STRUCTURE_de.md)
- [Oluntir-Include-System](docs/OLUNTIR-INCLUDE-SYSTEM_de.md)
- [Technisches Handbuch](HANDBOOK_de.md)
- [Release Notes](RELEASE_NOTES_de.md)

## Lizenzierung und Sicherheit

Der originale Oluntir-Quellcode steht unter der MIT-Lizenz. Eingebundene Bibliotheken, Schriften und andere Drittkomponenten behalten ihre jeweiligen Lizenzen. Siehe [LICENSE](LICENSE), [LICENSING_de.md](LICENSING_de.md), [THIRD_PARTY_NOTICES_de.md](THIRD_PARTY_NOTICES_de.md) und [compliance/LICENSE_MATRIX_de.md](compliance/LICENSE_MATRIX_de.md).

Sicherheitsmeldungen werden nach [SECURITY_de.md](SECURITY_de.md) behandelt. Anforderungen an Beiträge stehen in [CONTRIBUTING_de.md](CONTRIBUTING_de.md).

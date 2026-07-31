> **Sprache:** Deutsch · [English (reference)](README.md)

# Oluntir

**Version:** 1.2.0  
**Status:** Stabil  
**Veröffentlichung:** 30.07.2026

**Open-Source Website-Editor mit Projektverwaltung, Zwei-Monitor-Arbeitsbereich und lokalem Export.**

Oluntir ist ein offline-orientierter, browserbasierter Editor für statische Websites. Die Anwendung erstellt und pflegt HTML-, CSS- und JavaScript-Projekte lokal, ohne eine Datenbank oder serverseitige Anwendungslaufzeit zu benötigen.

## GrapesJS als Editor-Engine

Oluntir verwendet **GrapesJS 0.23.2** als zentrale visuelle Editor-Engine. GrapesJS bleibt als eigenständige, unveränderte und versionierte Open-Source-Engine unter `vendor/grapesjs/`; Oluntir verändert die Engine selbst nicht. Oluntir-spezifisches Verhalten ist hinter der Integrations- und Kompatibilitätsschicht in `editor/integrations/grapesjs/` gekapselt. Dadurch bleiben Projekt-, Asset-, Workspace-, Export- und Mehrmonitor-Architektur unabhängig von internen GrapesJS-DOM-Strukturen.

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

- [Dokumentationsübersicht](docs/index_de.md)
- [Warum Oluntir?](docs/WHY_OLUNTIR_de.md)
- [Architekturübersicht](docs/ARCHITECTURE_de.md)
- [Projektgrundsätze](docs/PROJECT-PRINCIPLES_de.md)
- [Versionierung](docs/VERSIONING_de.md)
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


## Architekturgrundlage Version 1.2.1

Stabile Layout-Identitäten und Repeat Engine V2 sind in `docs/040_LAYOUT_GRAPH_de.md` bis `docs/045_PROJECT_MIGRATION_1.2.1_de.md` dokumentiert.

### Projekt-Favicon

Über das Stern-Symbol in der zweiten Werkzeugleiste lässt sich ein projektweites Favicon festlegen. Oluntir erzeugt aus einer PNG-, JPG-, WebP-, GIF- oder SVG-Datei automatisch alle benötigten Browser-, Apple- und Android-Varianten. Eine vollständige Anleitung steht unter [`docs/FAVICON_de.md`](docs/FAVICON_de.md).

## Neu in Oluntir 1.2.1

### Stabile Layout-Identitäten

Oluntir ergänzt Seiten und geeignete GrapesJS-Komponenten additiv um dauerhafte interne Identitäten für Page, Section, Row, Slot, Component und Repeat. Vorhandene HTML-IDs, Klassen und Inhalte bleiben unverändert. Beim Kopieren erhalten Duplikate neue interne IDs; beim erneuten Öffnen bleiben bestehende IDs erhalten. Die Identitäten werden nur im Projektmodell gespeichert und vor dem finalen HTML-, SSI- oder PHP-Export aus der Exportkopie entfernt.

Technische Details: [`docs/041_LAYOUT_IDENTITIES_de.md`](docs/041_LAYOUT_IDENTITIES_de.md) und [`docs/045_PROJECT_MIGRATION_1.2.1_de.md`](docs/045_PROJECT_MIGRATION_1.2.1_de.md).

### Neue Seiten und „Hier Section einfügen“

Neu angelegte Seiten übernehmen Header, Navigation und Footer des Projekts, enthalten aber bewusst keinen kopierten Seiteninhalt. Ein leeres `<main>` wird im Editor als kompakte Einfügezone mit **„+ Hier Section einfügen“** angezeigt. Nach dem Einfügen der ersten Section verschwindet der Hinweis automatisch. Die Einfügezone ist eine reine Editorhilfe und wird weder gespeichert noch exportiert.

Anleitung: [`docs/047_EDITOR_PLACEHOLDERS_de.md`](docs/047_EDITOR_PLACEHOLDERS_de.md).

### Projekt-Favicon

Über das Stern-Symbol in der zweiten Werkzeugleiste wird ein projektweites Favicon gesetzt. Aus einer PNG-, JPG-, WebP-, GIF- oder SVG-Datei erzeugt Oluntir automatisch ICO-, Browser-, Apple- und Android-Varianten sowie `site.webmanifest`. Der Dialog zeigt ein bereits gesetztes Favicon mit Vorschau, Quelldatei, Dateityp und Änderungszeitpunkt an. Beim Ersetzen werden alle bisherigen Varianten vollständig verworfen und neu erzeugt.

Anleitung: [`docs/046_PROJECT_FAVICON_de.md`](docs/046_PROJECT_FAVICON_de.md).

### Vollständiger Responsive-Bildexport

Verwendete Uploadbilder werden zusammen mit ihren Desktop-, Tablet- und Mobile-Varianten exportiert. Das gilt für `assets/user_upload/` sowie die kompatiblen Legacy-Pfade unter `images/uploads/`. Fehlt eine benötigte Variante, bricht der Export mit einer konkreten Dateiliste ab, anstatt ein unvollständiges Paket zu erzeugen.

Details: [`docs/048_RESPONSIVE_IMAGE_EXPORT_de.md`](docs/048_RESPONSIVE_IMAGE_EXPORT_de.md).

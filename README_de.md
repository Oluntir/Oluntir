> **Sprache:** Deutsch · [English](README.md)

# Oluntir 2.0.1-alpha

Oluntir ist ein lokaler, browserbasierter Website-Editor auf Basis von GrapesJS 0.23.2. Die Anwendung verwaltet mehrseitige Projekte, lokale Assets, gemeinsame Seitenbereiche und Exporte ohne serverseitige Anwendungslaufzeit.

**Branch:** `Oluntir-2.0.1-alpha`
**Baseline:** Oluntir 1.3.1
**Datum:** 4. September 2026
**Status:** Alpha / Bootstrap-fokussiert

Oluntir 1.3.1 bleibt die stabile Kompatibilitätsbaseline. Dieser Branch ist
eine experimentelle Weiterentwicklung und ersetzt den stabilen Release nicht.

## 2.0 Alpha – Entwicklungsstand

Im 2.0-Alpha-Branch werden die Übersetzungsmatrix der Oluntir-API und die
Source-Analysepipeline entwickelt. DEV_016 bis DEV_021 umfassen kanonisches Vokabular,
Bootstrap-Profile, read-only Analyzer, Resolver, Validierung und abstrakte
Materialisierungspläne. DEV_022 ergänzt den universellen Source-Package-Import
 und die Frontend-Bridge für lokal gespeicherte Framework- und Templatequellen.
DEV_023 ergänzt einen quellengebundenen Komponenten-Katalog: erkannte HTML-
Strukturen können als auswählbare GrapesJS-Blöcke eingefügt werden. Lokale
Assets werden dabei über die lokale API aufgelöst.
DEV_024 ergänzt den JavaScript-Verhaltens- und Runtime-Vertrag mit statischer
Evidenz und expliziter Script-Auswahl.
DEV_025 ergänzt daraus eine frameworkneutrale Verhaltensmatrix und einen
unveränderlichen Verhaltensplan. Eine Ausführung wird dadurch noch nicht
freigegeben.
DEV_026 ergänzt getrennte Bootstrap-4-/Bootstrap-5-Profile und einen
 read-only Behavior-Resolver für Trigger, Adapter und Abhängigkeiten.
Der Resolver erzeugt je Source Package eine
`javascript-behavior-resolution.json`; auch ein aufgelöster Eintrag wird noch
nicht ausgeführt.
DEV_027 ergänzt quellengebundene Frameworkprofile. Das Profil wird nach jeder
Analyse aus der jeweiligen Bootstrap-Source neu erzeugt, per Source-Hash
gebunden und nicht für andere Packages wiederverwendet. Neue Versionen werden
als eigene Analyse mit eigener Profilidentität aufgenommen.

Die Ressourcenaktivierung und die bewusste Benutzer-Einfügung eines
ausgewählten Source Packages sind möglich. Die Ausführung importierter
JavaScript-Dateien bleibt deaktiviert. Explizit definierte Wiederholbare
Bereiche werden dagegen in 2.0.1-alpha produktiv und transaktional synchronisiert.

DEV028 verbindet die quellengebundenen Profile über eine kontrollierte
Adapter-Schicht mit dem persistenten GrapesJS-Editor. Source-Komponenten
können als Benutzer-Blöcke eingefügt werden; die Repeat-Synchronisation ist
für ausdrücklich definierte Instanzen freigegeben und durch Resolver,
Dependency Graph, Action Contracts und den gezielten Synchronisationsdienst
abgesichert. Source-JavaScript wird weiterhin nicht automatisch ausgeführt.

### Repeat-Synchronisation in 2.0.1-alpha

Eine Repeat-Definition trennt Quelle, Instanz und Komponentenidentität über
stabile Oluntir-IDs. Änderungen an der Quelle werden nur an ihre verknüpften
Instanzen propagiert. Der Synchronisationsdienst arbeitet atomar: Nach
erfolgreichem Plan und Schreibprüfung wird aktualisiert; bei einem Fehler
werden bereits geänderte Ziele zurückgesetzt. Der Export liest danach das
konsistente Projektmodell. Nav, Header und Footer bleiben als Shared Content
separat behandelt.

Der eigenständige Branch `2.0.1-alpha` konsolidiert den produktiven
Frameworkkontext auf Bootstrap 4 und Bootstrap 5. Generische Import-,
Analyse- und Recovery-Grundlagen bleiben erhalten; konkrete Fremdframework-
Profile und Testpakete gehören nicht zu diesem Branch. Bootstrap 5 ist das
primäre Profil, Bootstrap 4 bleibt als Legacy-Profil erhalten. Unbekannte
Packages dürfen analysiert werden, werden aber als `analysis-only` eingestuft
und nicht stillschweigend Bootstrap zugeordnet.

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
- produktive Repeat-Synchronisation für ausdrücklich definierte Bereiche über
  stabile Seiten-, Komponenten- und Zielpositions-IDs;
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
- [Technische Änderungen seit 1.3.1](docs/CHANGELOG_1.3.1_TO_2.0.1_ALPHA_de.md)
- [Bereinigungsliste für 2.0.1-alpha](docs/REMOVAL_LIST_2.0.1_ALPHA_de.md)
- [Sicherheit](SECURITY_de.md)
- [Datenschutz](PRIVACY_de.md)
- [Release-Audit](audit/OLUNTIR_1.3.1_AUDIT.md)

## Lizenz

Der Oluntir-eigene Quellcode steht unter der MIT-Lizenz. Drittkomponenten und
die portable Node.js-Runtime behalten ihre jeweiligen Lizenzen. Details stehen
in [LICENSING_de.md](LICENSING_de.md), [THIRD_PARTY_NOTICES_de.md](THIRD_PARTY_NOTICES_de.md),
`LICENSES/` und `compliance/`.

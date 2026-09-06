> **Sprache:** Deutsch · [English](README.md)

# Oluntir 2.2.0 BETA

Oluntir ist ein lokaler, browserbasierter Website-Editor auf Basis von GrapesJS 0.23.2. Die Anwendung verwaltet mehrseitige Projekte, lokale Assets, gemeinsame Seitenbereiche und Exporte ohne serverseitige Anwendungslaufzeit.

**Branch:** `Oluntir-2.2.0-beta`
**Baseline:** Oluntir 1.3.1
**Datum:** 6. September 2026
**Status:** BETA / Bootstrap-fokussiert

Oluntir 1.3.1 bleibt die stabile Kompatibilitätsbaseline. 2.2.0 BETA führt
die Bootstrap-fokussierte 2.x-Beta-Linie mit einer zentralen Repeat-Bibliothek fort.

## 2.2.0 BETA – aktueller Stand

- Falls bei einem übernommenen Projekt zentrale Repeat-Metadaten fehlen, rekonstruiert Oluntir die Familien ausschließlich aus vorhandenen stabilen Repeat-Markern der materialisierten Seiteninstanzen; Nav/Header/Footer werden dabei ignoriert.

- Header, Navigation und Footer bleiben bidirektionaler Shared Content.
- Wiederholbare Bereiche werden als **zentrale Repeat-Familien** verwaltet; alle Seitenvorkommen sind materialisierte Instanzen.
- Direkte Bearbeitung der Repeat-Inhalte auf normalen Seiten ist gesperrt. Die orange Mouseover-Leiste führt zur zentralen Bearbeitung oder entfernt genau dieses Vorkommen.
- Die zentrale Repeat-Bibliothek listet Namen, verwendete Seiten, Vorkommen und Revisionen.
- Ein Repeat wird in einem internen Einzelobjekt-Canvas bearbeitet. Änderungen bleiben Draft, bis **„Auf alle Vorkommen anwenden“** gedrückt wird.
- Dieser zentrale Einzelobjekt-Canvas ist vollständig editierbar; die Bearbeitungssperre gilt ausschließlich für materialisierte Repeat-Instanzen auf normalen Projektseiten.
- Publikation und Entfernen sind Oluntir-Transaktionen mit Repeat-Undo/Redo.
- Während kontrollierter Repeat-Publish-/Undo-/Redo-/Insert-/Remove-Transaktionen werden die dabei intern erzeugten GrapesJS-Add/Remove-Ereignisse vom Shared-Content-Sicherheitswatcher abgeschirmt; normale Nav/Footer-Strukturänderungen bleiben vollständig überwacht.
- Die Einfügefunktion bleibt erhalten: Bibliotheksquelle → Zielseite → Einfügeposition → Canvas-Ziel → Bereich einsetzen.
- Bestehende Projekte werden anhand stabiler Oluntir-Korrelationen in das zentrale Published/Draft-Modell übernommen.
- Beim Verlassen des zentralen Repeat-Canvas führt Oluntir einen sicheren PageManager-Handoff aus: Zielseite zuerst auswählen, temporären Workspace danach entfernen.
- Technische Fehlermeldungen bleiben 12 Sekunden sichtbar; normale Hinweise 5 Sekunden.

## Historische Entwicklungsbasis aus 2.0 Alpha

Im vorausgehenden 2.0-Alpha-Branch wurden die Übersetzungsmatrix der Oluntir-API und die
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
JavaScript-Dateien bleibt deaktiviert. Explizit definierte wiederholbare Bereiche werden in 2.2.0 BETA zentral verwaltet.
Seitenvorkommen bleiben während der Bearbeitung unverändert und werden erst durch eine
ausdrückliche Publish-Transaktion aktualisiert.

DEV028 verbindet die quellengebundenen Profile über eine kontrollierte
Adapter-Schicht mit dem persistenten GrapesJS-Editor. Source-Komponenten
können als Benutzer-Blöcke eingefügt werden. Die in Alpha aufgebaute Repeat-
Vertragsbasis aus Resolver, Dependency Graph, Action Contracts und gezieltem
Synchronisationsdienst bleibt erhalten; 2.2.0 BETA nutzt sie für kontrollierte
Publish-Transaktionen statt für eine Synchronisation bei jeder Eingabe.
Source-JavaScript wird weiterhin nicht automatisch ausgeführt.

### Repeat-Bibliothek in 2.2.0 BETA

Eine Repeat-Familie besitzt genau einen zentralen Published-/Draft-Inhalt. Alle
Vorkommen auf Projektseiten sind materialisierte Instanzen und dort gegen direkte
Inhaltsbearbeitung gesperrt. Die zentrale Bibliothek zeigt Namen, Seitenverwendung,
Vorkommen und Revisionen. Ein Klick auf **Bearbeiten** öffnet einen internen
Einzelobjekt-Canvas. Änderungen bleiben dort lokal, bis **„Auf alle Vorkommen
anwenden“** die Familie in einer kontrollierten Oluntir-Transaktion publiziert.

Auf normalen Seiten erscheint bei Mouseover eine orange Steuerleiste oben mittig.
**Bearbeiten** springt zur zentralen Quelle; **Entfernen** löscht nur dieses
Vorkommen und aktualisiert die Verwendungsliste. Publish und Entfernen besitzen
eine eigene Repeat-Undo/Redo-Historie. Nav, Header und Footer bleiben als Shared
Content separat behandelt.

Der eigenständige Branch `2.2.0-beta` konsolidiert den produktiven
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

### Wiederholbare Bereiche

**Erstellen/Bearbeiten:** Quellbereich auswählen → Quellenname setzen → Quelle speichern → Zielseite auswählen → Einfügeposition wählen → Ziel im Canvas bestätigen → Bereich einsetzen.

**Aus Liste einfügen:** gespeicherte Quelle nach Namen auswählen → Zielseite auswählen → Einfügeposition wählen → Ziel im Canvas bestätigen → Bereich einsetzen. Interne Repeat-IDs bleiben technische Korrelation und werden nicht als Benutzerbezeichnung verwendet.


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
- zentrale Repeat-Bibliothek mit materialisierten Seiteninstanzen und expliziter Publish-Transaktion;
- projektweite Seitenverwendung, Revisionen sowie Repeat-Undo/Redo für Publish und Entfernen;
- getrennte zentrale Bearbeitung und Listen-/Einfügefunktion;
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
- [Historische technische Änderungen bis 2.1.0 BETA](docs/CHANGELOG_1.3.1_TO_2.1.0_BETA_de.md)
- [Historische Bereinigungsliste 2.1.0 BETA](docs/REMOVAL_LIST_2.1.0_BETA_de.md)
- [Sicherheit](SECURITY_de.md)
- [Datenschutz](PRIVACY_de.md)
- [Historisches Release-Audit 2.1.0 BETA](audit/OLUNTIR_2.1.0_BETA_AUDIT_de.md)

## Lizenz

Der Oluntir-eigene Quellcode steht unter der MIT-Lizenz. Drittkomponenten und
die portable Node.js-Runtime behalten ihre jeweiligen Lizenzen. Details stehen
in [LICENSING_de.md](LICENSING_de.md), [THIRD_PARTY_NOTICES_de.md](THIRD_PARTY_NOTICES_de.md),
`LICENSES/` und `compliance/`.

# Technische Änderungen von Oluntir 1.3.1 zu 2.0.1-alpha

**Baseline:** 1.3.1, Commit `1b8c199`  
**Aktueller Branch:** `Oluntir-2.0.1-alpha`  
**Aktueller Commit:** `e6c4e5b`  
**Geltungsbereich:** Bootstrap 4.6.2 und Bootstrap 5.3.8

Dieses Dokument beschreibt die tatsächlich implementierten Änderungen.
Historische DEV-Berichte bleiben als Entwicklungsnachweise erhalten; sie
ersetzen diese aktuelle technische Gesamtübersicht nicht.

## 1. Laufzeit und Verteilung

- Portable Windows-x64-Node.js-Runtime 24.18.0 unter
  `runtime/node/win32-x64/node.exe` ergänzt.
- Laufzeitmanifest und Integritätsdaten ergänzt.
- Windows-CMD-Starter, Entwicklungsstarter und Unix-Shell-Starter für die
  lokale Analyzer-API ergänzt.
- Builder für portable Windows-Pakete und zugehörige Runtime-Prüfungen ergänzt.
- Upstream-Lizenz von Node.js unter `LICENSES/runtime/` aufgenommen.
- Die lokale Analyzer-API ist für Offlinebetrieb und Loopback-Betrieb ausgelegt.

## 2. Universelle Source-Package-Pipeline

- Vertrag und isolierte Speicherung für Source Packages ergänzt.
- Importwege für lokale Ordner, ZIP, TAR, TAR.GZ/TGZ, Browser-Dateiauswahl
  und URLs über die lokale API ergänzt.
- Jedes importierte Paket erhält einen eigenen Source-Ordner, eine Paket-ID,
  ein Inventar und SHA-256-Informationen.
- Erzeugung und Wiederherstellung von `source-recovery.json` mit eingebetteten
  Dateiinhalten ergänzt.
- Paketmanifest, Source-Hash, Dateiauslieferung und Paketliste ergänzt.
- Schutz gegen manipulierte Archivpfade und übergroße Pakete ergänzt.
- Capability-Manifest, Source-Profil, Behavior-Manifest, Behavior-Plan und
  Komponenten-Katalog als Analyseergebnisse ergänzt.

## 3. Analyzer- und Compiler-Architektur

- Source-Inventory-Vertrag und Schema ergänzt.
- Statische HTML-Analyse für Dokumente, Elemente, Attribute, Positionen,
  Assets und Referenzen ergänzt.
- Statische CSS-Analyse für Selektoren, Deklarationen, At-Rules, Custom
  Properties, Media-/Container-Queries, Fonts und Keyframes ergänzt.
- Statische JavaScript-Analyse für Selektoren, Events, Zustände, Observer,
  Timer, Netzwerkanfragen und Mutationsmuster ergänzt.
- Capability-Evidenz, Evidenzspeicher, Framework-Evidenz und Support-Policy
  ergänzt.
- OIR-Projektmodell und deklarativen Knowledge Compiler ergänzt.
- Versionierte Verträge und Schemas für die wesentlichen Analyzer-Ausgaben
  ergänzt.
- Die Analyse bleibt read-only und führt importierten Source-Code nicht aus.

## 4. Quellengebundene Frameworkprofile

- Erzeugung eines Frameworkprofils aus dem jeweils analysierten Paket ergänzt.
- Das Profil wird an Paket-ID und Source-Hash gebunden.
- Eine spätere Frameworkversion erhält eine neue Analyse und Profilidentität.
- Profile werden nicht in einer globalen Fremdframework-Registry wiederverwendet.
- Unbekannte oder mehrdeutige Fähigkeiten bleiben als Diagnose sichtbar und
  werden nicht stillschweigend Bootstrap zugeordnet.

## 5. Übersetzungsmatrix

- Vertrag und kanonisches Vokabular der Übersetzungsmatrix ergänzt.
- Matrixprofile für Bootstrap 4 und Bootstrap 5 ergänzt.
- Read-only-Übersetzungsanalyse, Auflösung, Validierung und ein abstrakter
  Materialisierungsplan ergänzt.
- Confidence, Mehrdeutigkeit, Abhängigkeiten, Verlust, Reversibilität und
  nicht unterstützte Fähigkeiten werden ausdrücklich behandelt.
- Die Materialisierung erzeugt nur abstrakte Operationen und verändert keinen
  GrapesJS-Baum.

## 6. JavaScript-Behavior-Pipeline

- Versionierter JavaScript-Verhaltensvertrag und Behavior-Manifest ergänzt.
- Frameworkneutrale Semantik für Accordion, Modal, Tabs, Dropdown, Carousel,
  Offcanvas und weitere Runtime-Evidenz ergänzt.
- Verhaltensmatrix und unveränderlicher Verhaltensplan ergänzt.
- Read-only Behavior-Resolver für Trigger, Adapter und Abhängigkeiten ergänzt.
- Bootstrap-4-`data-toggle` und Bootstrap-5-`data-bs-toggle` werden getrennt
  aufgelöst.
- Importierte Scripts werden nicht automatisch ausgeführt.

## 7. GrapesJS- und Frontend-Integration

- Kontrollierte Source-Package-Bridge für die bestehende Frameworkauswahl
  ergänzt.
- GrapesJS-Adapter ergänzt, der erkannte Source-Strukturen als auswählbare
  Benutzer-Blöcke bereitstellt, ohne eine parallele Komponentenwelt zu erzeugen.
- Lokale Paket-Assets werden über die lokale API ausgeliefert.
- Der Editor wartet vor der endgültigen Frameworkinitialisierung auf die
  Source-Profil-Ermittlung.
- Eingebaute Bootstrap-Blöcke und Varianten werden nur für die integrierten
  Bootstrap-Profile registriert.
- Importierte Source-Blöcke werden nur bei zulässigem Supportstatus verbunden.
- `unitId` und bestehende Projektidentitäten bleiben unverändert.

## 8. Bootstrap-Konsolidierung

- Der produktive Frameworkkontext ist auf Bootstrap 4.6.2 und Bootstrap 5.3.8
  begrenzt.
- Bootstrap 5 ist das primäre Profil; Bootstrap 4 bleibt das Legacy-Profil.
- Generische Import-, Evidenz-, OIR-, Compiler-, Übersetzungs- und
  Behavior-Infrastruktur bleibt erhalten.
- Nicht-Bootstrap-Pakete dürfen analysiert werden, werden aber als
  `analysis-only` klassifiziert und nicht als Editorprofil aktiviert.
- Für unbekannte Sources gibt es keinen stillen Bootstrap-Fallback.
- Frühere Tailwind- und Foundation6-Produktquellen, Profile, Fixtures und
  Lizenznachweise gehören nicht zum konsolidierten Branch.

## 9. Editor-, Galerie- und Exportänderungen

- Galerie-Strukturen stammen aus dem jeweiligen Framework; ein separater
  Oluntir-Galeriepfad ist nicht mehr die Strukturquelle.
- Galerieeinschübe in leeren Projekten, leeren Seiten, bestehenden Containern
  und zwischen vollständigen Seitenbereichen stabilisiert.
- Frameworkbezogene Galerie-Assets für Bootstrap 4 und 5 ergänzt.
- Klickvergrößerung für Bilder mit lokaler Lightbox und Export-Assets ergänzt.
- Vorschau-Beenden, ESC-Verhalten und sichtbare Vorschau-Rückmeldung verbessert.
- Export bei unvollständigen wiederverwendbaren Bereichen verfügbar gehalten.
- HTML-, Apache-SSI- und PHP-Include-Export, lokale Assets, responsive
  Bildvarianten und Entfernung editorinterner Metadaten erhalten.
- Regressionstests für Export, Assets, Galerie, Bausteinsuche und
  Frameworkwechsel ergänzt bzw. erweitert.

## 10. Repeat Foundation und produktive Synchronisation

- Repeat-Foundation-Readiness um explizite Prüfungen für Resolver,
  Dependency Graph, Action-Verträge und gezielten Synchronisationsdienst
  erweitert.
- Die vier Verträge sind in 2.0.1-alpha vollständig verbunden. Für explizit
  definierte Repeat-Instanzen gelten:

  ```text
  productiveSynchronizationEnabled = true
  automaticSynchronizationEnabled = true
  executionEnabled = true
  mutationPerformed = false
  ```

- Die Mutation erfolgt nur nach erfolgreicher Resolver-, Graph-, Action- und
  Schreibprüfung. Der gezielte Synchronisationsdienst arbeitet atomar und
  setzt bereits geänderte Ziele bei einem Fehler zurück. Importiertes
  Source-JavaScript bleibt davon getrennt deaktiviert.

## 11. Tests und Compliance

- Tests für Analyzer-Verträge, Source Packages, Recovery, Profile,
  Behavior-Auflösung, GrapesJS-Bridge, Bootstrap-Support, Export, Galerie,
  Runtimeauswahl und Frameworkwechsel ergänzt.
- Strukturprüfung für Bootstrap-4-/Bootstrap-5-Assets und lokale Referenzen
  ergänzt.
- Third-Party-Hinweise, Source Attribution, Lizenzmatrizen und Dokumentation
  der portablen Runtime aktualisiert.
- Der Branch enthält nur die konkreten Bootstrap-Framework-Assets.

## Kompatibilitätsgrenze

Bestehende Projekt- und Exportstrukturen von 1.3.1 bleiben die
Kompatibilitätsbaseline. Neue Analyzer- und Source-Package-Metadaten sind
additiv. Produktive Repeat-Synchronisation, Ausführung importierter
JavaScript-Quellen und automatische Dokumentmutation gehören weiterhin nicht
zur freigegebenen Funktionsoberfläche.

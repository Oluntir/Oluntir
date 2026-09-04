# Release Notes – Oluntir 2.0.1-alpha

Oluntir 2.0.1-alpha ist eine experimentelle Weiterentwicklung der stabilen
1.3.1-Linie. Die produktive Frameworkunterstützung wird auf Bootstrap 4.6.2
und 5.3.8 konsolidiert.

## Alpha-Änderungen seit 1.3.1

- portable Windows-x64-Node.js-Runtime 24.18.0 und lokale Analyzer-API;
- universeller Source-Package-Import für Ordner, ZIP, TAR, TAR.GZ/TGZ,
  Browser-Dateien und URLs über die lokale API;
- eigene Source-Ordner je Paket, Manifeste, SHA-256-Inventare und Recovery-JSON;
- statische HTML-, CSS- und JavaScript-Analyse mit OIR-, Evidenz- und
  Capability-Manifesten;
- quellengebundene Bootstrap-Profile, Übersetzungsmatrix und JavaScript-
  Behavior-Resolver;
- kontrollierte GrapesJS-Bridge für auswählbare Source-Strukturen;
- Bootstrap-Support-Gate: Bootstrap 4/5 sind konkrete Profile, unbekannte
  Sources bleiben `analysis-only`;
- frameworkeigene Galeriestrukturen, Bild-Lightbox, Vorschauverbesserungen und
  Export-Regression-Fixes.

Automatische Dokumentmutation, Ausführung importierter JavaScript-Quellen und
produktive Repeat-Synchronisation bleiben deaktiviert.

## 2.0 Alpha – DEV_022/DEV_023

Der Alpha-Entwicklungsstand ergänzt den universellen Source-Package-Import.
Framework- und Templatequellen können über die lokale API aus Ordnern,
Archiven oder Download-URLs importiert, analysiert und über die bestehende
Framework-Auswahl mit dem Frontend verbunden werden. Für jedes Paket wird eine
vollständige `source-recovery.json` erzeugt.

Die Aktivierung bleibt auf die ausgewählte Ressourcenbindung begrenzt.
DEV_023 ergänzt erkannte, quellengebundene HTML-Strukturen als auswählbare
GrapesJS-Blöcke. Lokale Asset-Referenzen werden über die lokale API bedient.
Automatische Dokumentmutation und Repeat-Synchronisation sind weiterhin nicht
freigegeben.

## Wichtigste Änderungen

- stabilere Persistenz gemeinsamer Header-, Navigations- und Footer-Bereiche;
- projektweite Schnellbearbeitung ohne erneuten Aufbau der Navigation;
- Übertragung von Text, Schriftgröße und expliziten Darstellungswerten in den Export;
- Undo und Redo für Text- und Bildänderungen;
- neue Galerie-Einschübe zwischen vollständigen Seitenbereichen;
- zuverlässigere Export-Snapshots und responsive Bildausgabe;
- konsolidierte Framework- und Iconquellen für Bootstrap 4 und 5;
- vorbereitete Repeat Foundation ohne produktive Wirkung.

## Kompatibilität

Bestehende Projekte werden weiterhin über die vorhandenen Migrations- und Identity-Routinen geladen. Vor größeren Änderungen wird eine portable Projektsicherung empfohlen.

## Bekannte Einschränkung

Eine explizit gesetzte Footer-Schriftfarbe kann in der Arbeitsansicht von der exportierten Darstellung abweichen. Der Export übernimmt den ausdrücklich gewählten Wert korrekt.

# Oluntir 2.1.0 BETA – Bootstrap-Teststand

Dieser eigenständige Teststand basiert auf dem DEV030-Konsolidierungspaket.
Als konkrete Frameworkprofile sind ausschließlich Bootstrap 4.6.2 und
Bootstrap 5.3.8 enthalten.

## Start

1. Das vollständige Archiv entpacken.
2. `Start-Oluntir-API-Analyzer.cmd` starten, sofern der lokale Analyzer
   benötigt wird.
3. `index.html` in einem aktuellen Chromium-basierten Desktop-Browser öffnen.
4. Im Framework-Menü Bootstrap 4 oder Bootstrap 5 auswählen.

## Import-Test

Source Packages werden über die lokale API importiert. Verfügbar sind:

- `+ Source-Ordner` für einen lokalen Ordner;
- `+ Source-Archiv` für ZIP, TAR, TAR.GZ oder TGZ;
- `+ Source-URL` für einen Downloadlink, der standardmäßig über die lokale API
  geladen wird;
- `+ Recovery-JSON` zur Wiederherstellung eines beschädigten oder fehlenden
  Source-Bestands.

Nach einem Import wird je Paket ein eigener Source-Ordner einschließlich
`source-recovery.json` angelegt. Die Analyse erzeugt ein source-gebundenes
Profil; es wird nicht für andere Packages wiederverwendet.

## Prüfschritte

1. Bootstrap 4 und Bootstrap 5 jeweils separat auswählen.
2. Prüfen, dass der Arbeitsbereich initialisiert wird und die vorhandenen
   GrapesJS-Funktionen sichtbar bleiben.
3. Source-Import durchführen und prüfen, dass die quellengebundenen Blöcke im
   BlockManager erscheinen.
4. Einen Block bewusst per Drag & Drop einfügen.
5. Export als Ordner, ZIP und TAR prüfen. Der Export muss das aktuell gewählte
   Bootstrap-Profil und dessen Pfade verwenden.
6. Einen Frameworkwechsel auslösen. Vor dem Wechsel muss gespeichert und
   bestätigt werden; bei Abbruch bleibt das bisherige Profil aktiv.

## Sicherheits- und Funktionsgrenzen

- Nicht-Bootstrap-Sources werden nicht als produktives Editorprofil aktiviert.
- Importierte Source-Scripte werden nicht automatisch ausgeführt.
- Automatische Source-Package-Dokumentmutation und importierte Source-Scripte bleiben deaktiviert.
- Benutzerdefinierte Wiederholbare Bereiche sind produktiv: Quelle ↔ Instanzen und Instanz → weitere Instanzen.
- Für Repeat existieren zwei getrennte Workflows: aktuelle Quelle erstellen/bearbeiten sowie gespeicherte Quelle aus der projektweiten Liste einsetzen.
- Shared Content für Header, Navigation und Footer arbeitet bidirektional.

## Repeat-Test in 2.1.0 BETA

1. Im Werkzeug **Wiederholbare Bereiche** einen Quellbereich wählen, benennen und speichern.
2. Zielseite und Einfügeposition wählen, Canvas-Ziel bestätigen und Bereich einsetzen.
3. Text an Quelle und Instanz jeweils in beide Richtungen ändern und die verknüpften Bereiche prüfen.
4. Das separate Listenwerkzeug öffnen, eine gespeicherte Quelle nach Namen auswählen und über Zielseite, Position und Canvas-Ziel einsetzen.

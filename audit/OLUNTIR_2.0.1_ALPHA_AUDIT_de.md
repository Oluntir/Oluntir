# Oluntir 2.0.1-alpha – Release-Audit

**Branch:** `Oluntir-2.0.1-alpha`  
**Commit:** `e6c4e5b`  
**Stabile Baseline:** 1.3.1  
**Status:** Experimentell / Bootstrap-fokussiert

## Geltungsbereich

Dieses Audit umfasst den aktuellen Branch nach der stabilen Baseline 1.3.1.
Der produktive Frameworkumfang ist auf Bootstrap 4.6.2 und Bootstrap 5.3.8
begrenzt.

## Durch Repository-Prüfung bestätigt

- Nur `frameworks/bootstrap4/` und `frameworks/bootstrap5/` sind konkrete
  Frameworkdistributionen.
- Generische Source-Package-, Analyzer-, OIR-, Compiler-, Übersetzungs- und
  Behavior-Infrastruktur bleibt erhalten.
- Nicht-Bootstrap-Sources werden als `analysis-only` klassifiziert und nicht
  stillschweigend Bootstrap zugeordnet.
- Portable Windows-x64-Node.js-Runtime und lokale API-Starter sind vorhanden.
- Dokumentation für Source-Recovery, Paketidentität und Source-Hash ist vorhanden.
- GrapesJS bleibt unter Version 0.23.2 eingebunden.
- Repeat-Foundation-Verträge bleiben vorhanden; produktive Synchronisation ist
  deaktiviert.
- README, Handbuch, Funktionen, Release-, Architektur- und Compliance-
  Dokumentation weisen 2.0.1-alpha und die Baseline 1.3.1 aus.
- Historische Audit-Dateien zu 1.3.0/1.3.1 bleiben separat erkennbar.

## Vor dem Release erforderliche Prüfungen

- `python3 tools/validate-structure.py` ausführen;
- `bash tests/run-tests.sh` ausführen;
- portable Windows-Starter unter Windows x64 prüfen;
- Source-Package-Import über die lokale API für Ordner, ZIP, TAR und URL prüfen;
- Wiederherstellung über Recovery-JSON prüfen;
- Bootstrap-4-/Bootstrap-5-Auswahl, Blockeinfügung, Export und Speicherwarnung
  beim Frameworkwechsel im Browser prüfen;
- sicherstellen, dass `.git/` und `.github/` nicht im Release-ZIP enthalten sind;
- `SHA256SUMS.txt` aus den final paketierten Bytes neu erzeugen und prüfen.

## Durch dieses Audit ausdrücklich nicht freigegeben

- produktive Repeat-Synchronisation;
- automatische Dokumentmutation;
- Ausführung importierten Source-JavaScripts;
- unbekannte Frameworks als konkrete Editorprofile behandeln;
- Gleichstellung des Alpha-Stands mit dem stabilen Release 1.3.1.

Das Audit zu 1.3.1 bleibt der historische Nachweis des stabilen Releases und
wird durch dieses Alpha-Audit nicht ersetzt.

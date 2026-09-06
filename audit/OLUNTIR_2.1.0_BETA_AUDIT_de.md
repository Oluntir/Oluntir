# Oluntir 2.1.0 BETA – Release-Audit

**Branch:** `Oluntir-2.1.0-beta`  
**Stabile Baseline:** 1.3.1  
**Status:** BETA / Bootstrap-fokussiert  
**Audit-Stand:** 06.09.2026

## Geltungsbereich

Der produktive Frameworkumfang bleibt auf Bootstrap 4.6.2 und Bootstrap 5.3.8 begrenzt. GrapesJS bleibt auf 0.23.2. Importierte Source-JavaScript-Dateien werden nicht automatisch ausgeführt.

## In 2.1.0 BETA bestätigt

- Shared Content synchronisiert Header, Navigation und Footer bidirektional.
- Repeat Engine V2 synchronisiert Quelle → Instanzen, Instanz → Quelle und Instanz → weitere Instanzen über stabile Oluntir-Identitäten.
- Repeat-Quellenwerkzeug und Repeat-Bibliothekswerkzeug sind getrennte Benutzerabläufe.
- Bestehende Alpha-Projekte werden nur über vorhandene eindeutige Oluntir-Korrelationen nachhydriert.
- Shared Content besitzt einen No-op-Fast-Path: bei unverändertem zentralem Snapshot werden Zielmutation und zusätzlicher Store übersprungen; Update-/Style-Events außerhalb gemeinsamer Bereiche werden früh verworfen.
- Bootstrap 4/5 bleiben die einzigen konkreten Frameworkdistributionen; unbekannte Sources bleiben `analysis-only`.

## Performance-Loganalyse vor dem Beta-Fix

Der bereitgestellte Lauf umfasste rund **344,7 Sekunden** und enthielt **33.728 `component.added`**, **6.504 `component.removed`** sowie **312 `project.saved`**. Von **290 `shared-component-committed`**-Ereignissen änderten nur **10** den zentralen Shared-Content-Snapshot; **280 (96,6 %)** waren No-op-Commits. Zusätzlich waren 332 von 361 `page-flushed`-Läufen unverändert. 2.1.0 BETA beendet deshalb unveränderte Shared-Komponenten-Commits vor Zielmutation/Store und filtert normale Update-/Style-Ereignisse außerhalb von Header, Navigation und Footer. Die reale CPU-Wirkung muss im Browser mit neuen Logs gegengeprüft werden.

## Automatisierte Prüfung

Am 06.09.2026 wurde `bash tests/run-tests.sh` vollständig ausgeführt: **Exit-Code 0**. Enthalten waren insbesondere Repeat-Verträge, Altprojekt-Hydrierung, Repeat-Zielauswahl, RTE-Persistenz, Shared Content, Shared-Content-Performancevertrag, Export, Bootstrap-Struktur, Source-Package- und Analyzer-Tests. `tools/validate-structure.py` meldete **86 statische HTML-Referenzen geprüft**, Bootstrap 4.6.2/5.3.8 geprüft und JavaScript-Syntax erfolgreich.

Der Logger-Test meldet in der Node-Testumgebung weiterhin den bekannten Hinweis `directory.getFileHandle is not a function`; der dazugehörige Logger-Test selbst besteht und der Gesamtlauf endet mit Exit-Code 0.

## Noch manuell zu verifizieren

- CPU-Verhalten im realen Browser nach dem neuen Shared-Content-No-op-Fast-Path;
- portable Windows-Starter auf Windows x64;
- vollständiger Browser-Praxistest der beiden Repeat-Workflows, Shared Content, Export und Frameworkwechsel.

Die historischen Audits für 1.3.1 und 2.0.1-alpha bleiben separat erhalten.

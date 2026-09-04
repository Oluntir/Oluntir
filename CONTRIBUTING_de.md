> **Sprache:** Deutsch · [English (reference)](CONTRIBUTING.md)

# Beiträge zu Oluntir

**Gültig für:** Oluntir 2.0.1-alpha und die stabile Baseline 1.3.1

Beiträge sollen klar abgegrenzt, reproduzierbar, offline-kompatibel und möglichst ohne Verlust vorhandener Projektdaten sein.

## Vor dem Einreichen

1. Fehler oder Vorschlag mit erwartetem Verhalten beschreiben.
2. Änderungen auf dem aktuellen Standard-Branch aufbauen.
3. Unabhängige Refactorings nicht in denselben Pull Request mischen.
4. Alle neuen, geänderten und gelöschten Dateien nennen.
5. Auswirkungen auf Architektur, Persistenz, Projektformat, Export und Kompatibilität dokumentieren.
6. Englische Referenzdokumentation und passende deutsche `*_de.md`-Datei gemeinsam aktualisieren.

## Architekturregeln

- Versionierte GrapesJS-Vendor-Dateien nicht verändern.
- GrapesJS-spezifische DOM- und Kompatibilitätslogik in `editor/integrations/grapesjs/` halten.
- Gemeinsame Asset-, Workspace-, Settings- und Include-Services verwenden, statt Zustand zu duplizieren.
- Browser-, Projekt-, Bild- oder Fensterdaten nicht stillschweigend verwerfen.
- Laufzeit offline halten und keine neuen Netzwerkabhängigkeiten einführen.
- Drittanbieter-Lizenztexte, Hinweise und Quellenangaben erhalten.

## Erforderliche Tests

Mindestens ausführen:

```text
python tools/validate-structure.py
node tools/test-grapesjs-adapter.js
```

Den geänderten Pfad manuell testen. Je nach Umfang gehören klassische und Shared-Content-Projekte, Bootstrap 4 und 5, Speichern/Wiederherstellen, HTML-/SSI-/PHP-Export, Ordner-/Archivausgabe, Bildmanager, Modal/Lightbox und Ein-/Zwei-Monitor-Umschaltung dazu.

## Pull-Request-Beschreibung

Problem, Umsetzung, geänderte Dateien, Testbefehle, erwartete und tatsächliche Ergebnisse, Kompatibilität, Migration, bekannte Einschränkungen und Dokumentationsänderungen angeben.

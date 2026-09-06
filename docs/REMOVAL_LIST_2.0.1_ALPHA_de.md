# Bereinigungs- und Entfernungsliste für 2.0.1-alpha

Dies ist eine kontrollierte Bereinigungsliste. Sie unterscheidet zwischen
Dateien, die nicht in ein Release-ZIP gehören, und historischen oder
architektonischen Dateien, die erhalten bleiben müssen. Dateien dürfen nicht
blind nach ihrem Namen gelöscht werden.

## Aus einem Release-ZIP entfernen, im Git-Arbeitsverzeichnis behalten

| Element | Grund |
|---|---|
| `.git/` | Repository-Metadaten gehören nicht zur Laufzeit und können das Paket um viele Megabytes vergrößern. |
| `.github/` | In GitHub behalten, für ein reines Anwenderpaket aber normalerweise nicht erforderlich. |

## Kandidaten für veraltete Dokumentation

Diese Dateien können archiviert und aus dem Releasepaket entfernt werden, sobald
die aktuelle Dokumentation verfügbar ist:

- `audit/OLUNTIR_1.3.0_AUDIT.md`
- `tests/MANUAL_TEST_1.2.1_de.md`
- alte, ersetzte DEV-Berichte, die ausschließlich einen verworfenen oder
  fehlgeschlagenen Zwischenstand beschreiben

`audit/OLUNTIR_1.3.1_AUDIT.md` sollte als historische stabile Baseline
normalerweise erhalten bleiben. Die Datei darf nicht zu einem Alpha-Audit
umgeschrieben werden.

## Falls im Arbeitsverzeichnis vorhanden: entfernen

Folgende Namen und Pfade gehören nicht zum Bootstrap-only-Produktumfang:

- `frameworks/tailwind*/`
- `frameworks/foundation*/`
- `frameworks/foundation-sites*/`
- `examples/test-source/tailwind*/`
- `examples/test-source/foundation-6*/`
- `examples/test-source/foundation-sites-6.9.0-official/`
- `Oluntir-Tailwind-*.zip`
- `Oluntir-Foundation-*.zip`
- `Oluntir-Foundation-Sites-*.zip`
- frameworkbezogene Tailwind-/Foundation6-Lizenznachweise, die nicht mehr
  von `compliance/` oder `THIRD_PARTY_NOTICES*` referenziert werden

Der vollständige aktuelle Ordner wurde geprüft: Konkrete Tailwind- oder
Foundation6-Frameworkordner sind nicht mehr enthalten.

## Diese ähnlich benannten Dateien nicht entfernen

Das Wort `Foundation` bedeutet nicht automatisch Foundation6. Erhalten bleiben:

- `DEV_010_RUNTIME_FOUNDATION_DE.md` — Historie der portablen Runtime;
- `docs/REPEAT_FOUNDATION.md` und `docs/REPEAT_FOUNDATION_de.md` — Architektur
  für wiederholbare Elemente;
- `editor/js/core/repeat-foundation-readiness.js` — Vertrags-Gate;
- `tests/test-foundation-consent-*.js` — Consent-Verträge der Repeat Foundation;
- `analyzer/tests/test-analyzer-foundation.js` — Test der Analyzer-/Compilerbasis.

## Die generische 2.0-Architektur nicht entfernen

Für die aktuelle Bootstrap-Implementierung und spätere versionsgebundene
Analysen erforderlich sind:

- `analyzer/` mit Verträgen, statischen Analyzern, Evidenzspeicher, OIR und
  Compiler;
- `editor/js/core/source-package-bridge.js`;
- `editor/js/core/source-package-grapesjs-adapter.js`;
- Übersetzungsmatrix, Analyzer, Resolver, Validierung und
  Materialisierungsplan;
- JavaScript-Behavior-, Matrix- und Resolver-Module;
- `runtime/` und lokale API-Starter;
- die Frameworkordner für Bootstrap 4 und 5;
- Repeat-Foundation-Verträge, Resolver, Dependency Graph, Action Contracts und
  der produktive gezielte Synchronisationsdienst dürfen nicht entfernt werden.

## Prüfung nach der Bereinigung

Vor dem Commit ausführen:

```sh
git status --short
git ls-files | grep -Ei 'tailwind|foundation-sites|foundation-6|frameworks/foundation'
python3 tools/validate-structure.py
bash tests/run-tests.sh
```

Der Pfad-Check darf keine konkreten Fremdframeworkpfade ausgeben. Struktur- und
Gesamttest müssen erfolgreich beendet werden.

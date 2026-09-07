> **Sprache:** Deutsch · [English (reference)](DOCUMENTATION-STYLE.md)

# Dokumentationsstandard

## Zweck

Dieser Standard gilt für Markdown-Dateien im Oluntir-Repository.

## Inhalt

Dokumente beschreiben je nach Zweck:

- technische Funktion und Ziel;
- Voraussetzungen;
- Bedienablauf oder Architektur;
- betroffene Dateien und Datenstrukturen;
- Export- und Speicherverhalten;
- bekannte Einschränkungen;
- reproduzierbare Tests und erwartete Ergebnisse;
- Versions- oder Statusangaben.

## Sprachstil

- sachlich und technisch;
- kurze, eindeutige Sätze;
- keine Werbeaussagen oder Superlative;
- keine weltanschaulichen oder stiltheoretischen Aussagen;
- keine Zusage noch nicht implementierter Funktionen;
- klare Kennzeichnung von Veröffentlichungs- und Unterstützungsstatus;
- Fachbegriffe werden konsistent verwendet.

## Struktur

Technische Feature-Dokumente verwenden nach Möglichkeit:

```text
# Titel
## Zweck
## Voraussetzungen
## Funktionsweise
## Daten- oder Dateistruktur
## Einschränkungen
## Test
## Erwartetes Ergebnis
```

Nicht benötigte Abschnitte werden ausgelassen. Rechtliche Dokumente und Tabellen können abweichende Strukturen verwenden.

## Pflege

Bei einer Funktionsänderung werden mindestens README, Changelog und das zugehörige technische Dokument geprüft. Veraltete Aussagen werden entfernt oder ausdrücklich als historisch gekennzeichnet.
## Trennung nach Zielgruppe

- `README`, `FEATURES`, `HANDBOOK` und `WHY_OLUNTIR` beschreiben stabile Produktfunktionen, Arbeitsabläufe, Umfang und nutzerrelevante Grenzen. Einzelne Fehlerbehebungen, Icon-Details, Cache-Anpassungen, Regressionen oder interne Eventnamen gehören dort nicht hinein.
- `RELEASE_NOTES` fassen Änderungen auf Release-Ebene und wichtige Kompatibilitätsinformationen zusammen.
- `CHANGELOG`, DEV-Berichte, Audits, Architekturdokumente und Testdokumente dürfen Implementierungsdetails, Regressionen, interne Bezeichner und Entwicklungshistorie enthalten.
- Historische Dokumente werden nicht nachträglich auf den aktuellen Stand umgeschrieben, sondern bleiben ausdrücklich historisch.


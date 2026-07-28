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

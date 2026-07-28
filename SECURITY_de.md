> **Sprache:** Deutsch · [English (reference)](SECURITY.md)

# Sicherheitsrichtlinie

## Unterstützte Versionen

Sicherheitskorrekturen werden für den aktuelle stabile Version 1.0.0 geprüft.

## Meldung einer Schwachstelle

Sicherheitsrelevante Probleme nicht als öffentliches GitHub-Issue melden. Kontakt:

**[info@oluntir.com](mailto:info@oluntir.com)**

Eine Meldung sollte enthalten:

- betroffene Version;
- Reproduktionsschritte;
- erwartetes und tatsächliches Verhalten;
- mögliche Auswirkungen;
- relevante Dateien, Logs oder einen begrenzten Proof of Concept;
- bekannte Gegenmaßnahmen.

## Prüfbereich

Besonders relevant sind:

- unsichere HTML- oder Skriptverarbeitung;
- Script-Injection;
- Pfadmanipulation im Export;
- Erstellung oder Verarbeitung von Archiven;
- Zugriff auf Browser-Speicher;
- Import und Verarbeitung lokaler Dateien;
- Schwachstellen eingebundener Abhängigkeiten.

Meldungen werden technisch geprüft. Eine Meldung gilt erst nach Bestätigung als Sicherheitslücke.

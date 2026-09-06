> **Sprache:** Deutsch · [English (reference)](SECURITY.md)

# Sicherheitsrichtlinie

**Unterstützte Linien:** 2.1.0 BETA (experimentell) · 1.3.1 (stabile Baseline)

## Meldung

Vertrauliche Sicherheitsmeldungen an `info@oluntir.com` senden. Betroffene Version, Browser und Betriebssystem, reproduzierbare Schritte, Soll-/Ist-Verhalten, Auswirkung und mögliche Gegenmaßnahme angeben. Keine aktiven Zugangsdaten oder unnötigen personenbezogenen Daten mitsenden.

Für eine noch nicht behobene Schwachstelle kein öffentliches Issue eröffnen.

## Geltungsbereich

Relevant sind insbesondere unsichere Verarbeitung importierter Projektdaten, Script-Injection über Editor oder Vorschau, manipulierte Archivpfade, unbeabsichtigter Verlust von Projekten oder Assets, irreführende Berechtigungszustände beim Dateisystemzugriff und verwundbare gebündelte Abhängigkeiten.

## Reaktion

Eingangsbestätigung, Schweregrad, Behebung, Release-Koordination und Offenlegungszeitpunkt werden fallbezogen behandelt. Die stabile Linie 1.3.1 und der Branch 2.1.0 BETA werden entsprechend ihrem jeweiligen Release-Status geprüft. Die BETA-Funktionen für Analyzer und Import erfordern besondere Aufmerksamkeit, weil lokale Dateien und Archive verarbeitet werden.

## Verantwortung der Anwender

Oluntir verarbeitet importiertes HTML und JavaScript in einer browserbasierten Bearbeitungsumgebung. Nur Projekte aus vertrauenswürdigen Quellen öffnen, externe Sicherungen führen, Exporte prüfen und Browser-Sicherheitsupdates installieren.

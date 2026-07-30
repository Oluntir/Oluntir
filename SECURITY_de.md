> **Sprache:** Deutsch · [English (reference)](SECURITY.md)

# Sicherheitsrichtlinie

**Unterstützte Version:** 1.2.0

## Meldung

Vertrauliche Sicherheitsmeldungen an `info@oluntir.com` senden. Betroffene Version, Browser und Betriebssystem, reproduzierbare Schritte, Soll-/Ist-Verhalten, Auswirkung und mögliche Gegenmaßnahme angeben. Keine aktiven Zugangsdaten oder unnötigen personenbezogenen Daten mitsenden.

Für eine noch nicht behobene Schwachstelle kein öffentliches Issue eröffnen.

## Geltungsbereich

Relevant sind insbesondere unsichere Verarbeitung importierter Projektdaten, Script-Injection über Editor oder Vorschau, manipulierte Archivpfade, unbeabsichtigter Verlust von Projekten oder Assets, irreführende Berechtigungszustände beim Dateisystemzugriff und verwundbare gebündelte Abhängigkeiten.

## Reaktion

Eingangsbestätigung, Schweregrad, Behebung, Release-Koordination und Offenlegungszeitpunkt werden fallbezogen behandelt. Aktiv geprüft wird die aktuelle stabile Release-Linie.

## Verantwortung der Anwender

Oluntir verarbeitet importiertes HTML und JavaScript in einer browserbasierten Bearbeitungsumgebung. Nur Projekte aus vertrauenswürdigen Quellen öffnen, externe Sicherungen führen, Exporte prüfen und Browser-Sicherheitsupdates installieren.

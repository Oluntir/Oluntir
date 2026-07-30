> **Sprache:** Deutsch · [English (reference)](PROJECT-PRINCIPLES.md)

# Technische Projektgrundsätze

## Zweck

Dieses Dokument definiert technische Leitlinien für Entwicklung und Wartung von Oluntir.

## Ausgabe und Standards

- Exportierte Projekte verwenden reguläres HTML, CSS und JavaScript.
- Proprietäre Laufzeitabhängigkeiten sind für exportierte statische Projekte nicht erforderlich.
- Export ist Bestandteil des Kernworkflows und wird bei relevanten Änderungen geprüft.
- Sich inhaltlich wiederholende Elemente und Bereiche werden intern serverneutral gespeichert.
- Zielformate werden ausschließlich durch den jeweiligen Export-Writer erzeugt.

## Lokale Nutzung

- Kernfunktionen sollen ohne Netzwerkzugriff verfügbar sein.
- Frameworks, Schriften und Editor-Abhängigkeiten werden lokal bereitgestellt.
- Verdeckte Netzwerkzugriffe und Telemetrie sind nicht vorgesehen.

## Benutzeroberfläche

- Beschriftungen beschreiben die ausgeführte Funktion.
- Dialoge behandeln jeweils einen klar abgegrenzten Vorgang.
- Deutsch und Englisch werden bei Änderungen gemeinsam gepflegt.
- Tastaturbedienung, Fokusführung und verständliche Fehlermeldungen werden bei neuen Funktionen berücksichtigt.

## Entwicklung

- Änderungen an Speicherung, Wiederherstellung oder Export erfordern passende Regressionstests.
- Drittkomponenten benötigen dokumentierte Quelle, Version und Lizenz.
- Inkompatible Änderungen werden dokumentiert und erhalten, soweit technisch möglich, einen Migrationspfad.
- Implementierungen sollen nachvollziehbar und ohne unnötige Abstraktionsschichten bleiben.
- Projektzustände dürfen bei abgebrochenen Assistenten oder Exporten nicht unbeabsichtigt überschrieben werden.

## Dokumentation

- Dokumente beschreiben vorhandene Funktionen, Voraussetzungen, Einschränkungen und Tests.
- Wertende, werbliche oder nicht überprüfbare Aussagen werden vermieden.
- Vorschaufunktionen werden mit ihrer jeweiligen Versionsbezeichnung gekennzeichnet.

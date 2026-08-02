# Architekturprinzipien

Bestehende Module erweitern. Parallelarchitekturen vermeiden. Resolver bleiben read-only. Fachlogik gehört nicht in die Action Engine; Abhängigkeitspropagation gehört nicht in einzelne Features.

## Verbindliches Verhalten

- Annahmen ausdrücklich nennen.
- Bestehende Verträge erhalten, sofern die Aufgabe keine versionierte Änderung verlangt.
- Tests gemeinsam mit Code aktualisieren.
- Kein nicht implementiertes Verhalten dokumentieren.

## Template First

Das aktive Template und dessen Framework-Semantik bestimmen Struktur, Rollen und zulässige Operationen.

- Bootstrap-Klassen wie `.row`, `.col-*`, `.container` und `.container-fluid` bestimmen ihre jeweilige Template-Rolle.
- HTML-Tags und Template-Attribute ergänzen die Framework-Semantik.
- Oluntir-Identitäten dienen ausschließlich der stabilen Referenzierung konkreter Template-Elemente.
- Eine Oluntir-Identität darf niemals eine Template- oder Framework-Rolle erzeugen, ersetzen oder überstimmen.
- APIs und Resolver müssen Bootstrap 4 und Bootstrap 5 über den aktiven Frameworkkontext auswerten.
- Export und Bearbeitung erhalten das Template-Markup; interne Oluntir-Daten dürfen keine Ersatzstruktur bilden.

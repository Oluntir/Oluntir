# Technische Änderungen von Oluntir 1.3.1 zu 2.1.0 BETA

**Aktueller Branch:** `Oluntir-2.1.0-beta`  
**Stabile Baseline:** Oluntir 1.3.1  
**Stand:** 06.09.2026

## Beta-relevante Änderungen

- Bootstrap 4.6.2 und Bootstrap 5.3.8 sind die produktiven Frameworkprofile.
- Header, Navigation und Footer werden über den Shared Content Manager bidirektional synchronisiert.
- Repeat Engine V2 synchronisiert Quelle → Instanzen, Instanz → Quelle und Instanz → weitere Instanzen über stabile Oluntir-Identitäten.
- Das Repeat-Quellenwerkzeug erstellt/bearbeitet eine benannte aktuelle Quelle und setzt sie direkt über Zielseite und Einfügeposition ein.
- Das getrennte Repeat-Listenwerkzeug setzt projektweit gespeicherte Quellen nach verständlichem Namen ein.
- Bestehende Alpha-Projekte werden nur über vorhandene eindeutige Oluntir-Korrelationen nachhydriert.
- Shared-Content-Performance wurde durch einen No-op-Fast-Path und Event-Filter verbessert: unveränderte zentrale Commits mutieren keine Zielseiten/starten keinen zusätzlichen Store; normale Main-Updates laufen nicht mehr durch den Shared-Content-Updatepfad.
- Importierte Source-JavaScript-Dateien bleiben standardmäßig deaktiviert.

Die detaillierte Alpha-Entwicklungshistorie bleibt in [CHANGELOG_1.3.1_TO_2.0.1_ALPHA_de.md](CHANGELOG_1.3.1_TO_2.0.1_ALPHA_de.md) erhalten.

# Migration von Oluntir 1.2.0 auf 1.2.1

1. Vorhandenes Projekt mit 1.2.0 als `.oluntir` sichern.
2. Version 1.2.1 in einen neuen Ordner entpacken; Installationen nicht vermischen.
3. Projekt öffnen. Oluntir lädt zuerst das vollständige GrapesJS-Projektmodell.
4. Fehlende interne Layout-IDs werden additiv ergänzt.
5. Shared Content, OPE-Includes, HTML-IDs, Klassen, Texte, Bilder und Links bleiben unverändert.
6. Projekt explizit speichern, um die ergänzten IDs dauerhaft in der Projektdatei abzulegen.
7. Projekt erneut öffnen und Struktur, Bilder sowie Shared Content kontrollieren.
8. HTML-, SSI- und PHP-Export prüfen.

Die Migration ist idempotent: Ein zweites Öffnen erzeugt keine neuen IDs und keine zusätzlichen Strukturen.

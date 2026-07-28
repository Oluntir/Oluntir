> **Sprache:** Deutsch · [English (reference)](PROJECT-STRUCTURE.md)

# Projektstruktur

## Repository

- `assets/`: lokale Schriften, Bilder, Styles und Skripte;
- `editor/`: Benutzeroberfläche, Kernlogik und Editor-Funktionen;
- `frameworks/`: versionierte Bootstrap-Profile;
- `plugins/editor/`: Editor-Abhängigkeiten wie GrapesJS und JSZip;
- `plugins/site/`: optionale Bibliotheken für Vorschau und Export;
- `templates/`: Editions- und Projektvorlagen;
- `examples/`: Beispielmaterial;
- `docs/`: technische Dokumentation;
- `compliance/`: Lizenz- und Asset-Nachweise.

## Export

Die Standardstruktur enthält je nach Projekt und Exportformat unter anderem `css/`, `js/`, `images/`, `fonts/` und `includes/`. Ordner-, ZIP- und TAR-Ausgabe verwenden dieselbe Export-Engine und dieselbe Asset-Quelle.

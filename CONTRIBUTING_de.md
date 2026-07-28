> **Sprache:** Deutsch · [English (reference)](CONTRIBUTING.md)

# Beiträge

## Geltungsbereich

Beiträge können Fehlerkorrekturen, technische Dokumentation, Tests oder abgegrenzte Funktionen umfassen.

## Vor der Umsetzung

- vorhandene Issues und Dokumentation prüfen;
- größere Architekturänderungen vorab beschreiben;
- Drittcode und Assets nur mit Quelle, Version und Lizenz ergänzen;
- Auswirkungen auf Speicherung, Wiederherstellung und Export bestimmen.

## Branches

- `main`: freigabefähiger Projektstand;
- `feature/<name>`: neue Funktion;
- `fix/<name>`: Fehlerkorrektur;
- `docs/<name>`: ausschließlich Dokumentation.

Ein zusätzlicher Integrationsbranch wird erst benötigt, wenn mehrere parallele Entwicklungsstände koordiniert werden müssen.

## Pull Requests

Ein Pull Request enthält:

1. technische Zielbeschreibung;
2. Liste neuer, geänderter und gelöschter Dateien;
3. Auswirkungen auf Datenmodell, Architektur und Export;
4. reproduzierbare Testschritte;
5. erwartetes Testergebnis;
6. Angaben zu neuen Drittkomponenten;
7. aktualisierte Dokumentation und Changelog-Eintrag.

## Funktionstests

Soweit betroffen, werden geprüft:

- lokaler Start;
- Projekterstellung und Seitenwechsel;
- Speichern und Wiederherstellen;
- Ordner-, ZIP- und TAR-Export;
- HTML-, SSI- und PHP-Ausgabe;
- Bootstrap 4 und Bootstrap 5;
- deutsche und englische Oberfläche;
- Chrome oder Edge sowie Firefox.

## Code

- browserkompatibles JavaScript verwenden;
- lokale und offlinefähige Ausführung erhalten;
- keine Telemetrie oder verdeckten Netzwerkzugriffe ergänzen;
- Fehlerzustände behandeln und für den Benutzer verständlich melden;
- bestehende Daten nicht unbeabsichtigt löschen oder überschreiben.

## Commit-Nachrichten

Beispiele:

```text
feat: add Oluntir code formatting
fix: create include files during SSI folder export
docs: revise technical documentation
```

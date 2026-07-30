> **Sprache:** Deutsch · [English (reference)](GITHUB-PUBLISHING.md)

# GitHub-Veröffentlichung

**Release:** Oluntir 1.2.0

## Repository-Metadaten

Empfohlene Beschreibung:

```text
Offline-first visual editor for static Bootstrap websites, powered by GrapesJS.
```

Empfohlene Topics:

```text
website-builder grapesjs offline bootstrap static-site-generator html css javascript open-source
```

## Git-Befehle

Im entpackten Projektstamm:

```powershell
git init
git branch -M main
git add .
git status
git commit -m "release: Oluntir 1.2.0"
git remote add origin https://github.com/Oluntir/Oluntir.git
git push -u origin main
```

Den stabilen Tag erst nach Prüfung des Pakets, der Prüfsumme und des Auditberichts erstellen:

```powershell
git tag -a v1.2.0 -m "Oluntir 1.2.0"
git push origin v1.2.0
```

## GitHub-Release

Titel:

```text
Oluntir 1.2.0
```

`docs/releases/1.2.0_de.md` als Release-Text verwenden. Finale ZIP und `.sha256` anhängen und die Prüfsumme nach dem Upload erneut kontrollieren.

## Checkliste vor Veröffentlichung

- sauberer Git-Status;
- keine lokalen Projekte oder personenbezogenen Daten;
- Struktur- und Adaptertests erfolgreich;
- Archiv lässt sich öffnen und `index.html` startet;
- Lizenzen und Hinweise vorhanden;
- README-Verweise funktionieren;
- Prüfsumme des Release-Archivs stimmt;
- manuelle Abnahme der releasekritischen Abläufe abgeschlossen.

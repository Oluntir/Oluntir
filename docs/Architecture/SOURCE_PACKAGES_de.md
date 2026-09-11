# Source Packages und Frontend-Bridge

Ein Source Package ist die unveränderliche, versionierte lokale Repräsentation
einer importierten Framework-, Template-, Theme- oder Komponentenquelle. Seine
Identität wird unabhängig von GrapesJS-Komponenten und `unitId` geführt.

## Importkette

```text
Ordner / ZIP / TAR / URL / Browser-Dateien
        ↓
lokaler Source-Package-Importer
        ↓
isolierter temporärer Arbeitsordner
        ↓
Inventar und SHA-256-Prüfung
        ↓
frameworks/<frameworkId>/sources/<packageId>/source
        ↓
read-only Compiler-Pipeline
        ↓
Capability-Manifest und Frontend-Auswahl
```

URL-Importe werden über die lokale API ausgeführt. Die Analyse führt keine
importierten Skripte aus. Die Aktivierung von Ressourcen erfolgt erst nach
bewusster Auswahl des Source Packages.

## Recovery

`source-recovery.json` enthält die vollständigen Dateien als `gzip+base64`
sowie Größe und SHA-256-Prüfsumme. Dadurch ist die Wiederherstellung auch
möglich, wenn der `source`-Ordner verloren oder beschädigt wurde.

Die vorhandene beschädigte Quelle wird nicht gelöscht, sondern als beschädigte
Sicherungsquelle erhalten.

## Framework-Auswahl

Die Frontend-Bridge erzeugt aus jedem gültigen Manifest ein auswählbares
Frameworkprofil. Bootstrap 4 und Bootstrap 5 sind lediglich vorhandene Profile;
die Bridge enthält keine Bootstrap-only-Annahme.

Automatische Dokumentänderungen, Repeat-Synchronisation und Kopierlogik bleiben
durch die bestehenden Architektur-Gates geschützt.

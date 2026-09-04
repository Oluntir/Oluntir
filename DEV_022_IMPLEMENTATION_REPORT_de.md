# DEV_022 – Universeller Source-Package-Import

## Ergebnis

Oluntir 2.0 Alpha besitzt jetzt einen frameworkneutralen Source-Package-Layer.
Quellen können über die lokale API aus Ordnern, ZIP/TAR-Archiven, TAR.GZ/TGZ
und Download-URLs importiert werden. Browser-Dateiauswahl ist als ergänzender
Importweg vorbereitet.

## Architektur

Ein importiertes Paket wird unter `frameworks/<frameworkId>/sources/<packageId>`
isoliert gespeichert. Jedes Paket erhält `source/`, `source-package.json`,
`source-inventory.json`, `capability-manifest.json`, `analysis-report.json` und
`source-recovery.json`. Das Recovery-JSON enthält komprimierte, vollständige
Dateiinhalte sowie SHA-256-Prüfsummen.

Bestehende Pakete werden nicht überschrieben. Eine beschädigte Quelle wird bei
Recovery geprüft ersetzt; die beschädigte Quelle bleibt als
`source.damaged-<timestamp>` erhalten.

## API

- `GET /api/source-packages`
- `GET /api/source-packages/<packageId>`
- `GET /api/source-packages/<packageId>/files/<path>`
- `POST /api/source-packages/import-path`
- `POST /api/source-packages/import-url`
- `POST /api/source-packages/import-files`
- `POST /api/source-packages/import-archive`
- `POST /api/source-packages/restore`
- `POST /api/source-packages/restore-json`

URL-Downloads laufen standardmäßig über die lokale API. Private und lokale
Netzwerkziele werden blockiert. Quellen werden während der Analyse nicht
ausgeführt.

## Frontend-Bridge

Die Bridge registriert importierte Pakete zusätzlich zu den vorhandenen
Bootstrap-Profilen. Das bestehende Framework-Auswahlfeld kann ein importiertes
Paket als Profil aktivieren. CSS- und JavaScript-Einstiegspunkte werden aus dem
Paketmanifest bezogen; `unitId`, GrapesJS-Identitäten und bestehende
Projektverträge werden nicht verändert.

Die Aktivierung ist auf Ressourcenbindung und Auswahl begrenzt. Automatische
Dokumentmutation und produktive Repeat-Synchronisation bleiben deaktiviert.

## Tests

- Source-Package-Import aus Ordner erfolgreich
- TAR-Import erfolgreich
- Recovery mit Hash-Prüfung erfolgreich
- beschädigte Quelle erfolgreich repariert, Original erhalten
- lokale API-Listung, Import und Quelldateiabruf erfolgreich
- vollständige vorhandene Regressionstests erfolgreich

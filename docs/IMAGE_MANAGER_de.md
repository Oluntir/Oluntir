# Bildmanager

Der Bildmanager ist ein Oluntir-Workspace auf Basis gemeinsamer Asset-Services und IndexedDB. Er ist unabhängig von der sichtbaren GrapesJS-Asset-Manager-Oberfläche.

## Funktionen

- Suche und Filter;
- Raster- und Listenansicht;
- Hauptbild- und Variantenanzeige;
- Bildabmessungen und Details;
- Ersetzen bei stabilen Projektpfaden;
- sicheres Löschen und Verwendungsprüfung;
- Zuweisungs- und Verwaltungsmodus;
- Projektordner-Synchronisation.

## Projektordner verbinden

Der erste Klick öffnet ein Infofenster. Den Stammordner des Oluntir-Projekts auswählen, nicht `assets` oder `user_upload`. Oluntir verwendet oder erstellt anschließend `assets/user_upload/` und schreibt vorhandene IndexedDB-Uploads dorthin. Weitere Uploads können während der aktiven Berechtigungssitzung synchronisiert werden.

## Datensicherheit

IndexedDB-Bildbestand und physischer Ordner sind getrennte Kopien. Eine verlorene Ordnerberechtigung löscht nicht automatisch die IndexedDB-Assets. Löschaktionen müssen ausdrücklich erfolgen und dürfen verwendete Bilder nicht stillschweigend entfernen.

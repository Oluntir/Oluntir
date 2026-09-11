# Release Notes – Oluntir 2.3.0

Oluntir 2.3.0 erweitert den Bootstrap-fokussierten Editor um eine modulare Template-Runtime und einen universellen Compiler für zusätzliche Bootstrap-4-/Bootstrap-5-Templates. Die fest integrierten Bootstrap-Profile bleiben unverändert und geschützt.

## Schwerpunkte von 2.3.0

### Stabilere Footer-Bearbeitung und Template-Verwaltung

Die blaue GrapesJS-Komponentenleiste verwendet beim Löschen komplexer Shared-Regionen nun einen stabilen Ziel-Snapshot. Dadurch wird der ausgewählte Footer direkt adressiert, auch wenn eingebettete oder stark verschachtelte Inhalte den Fokus verändern. Der Template-Manager trennt außerdem „Entfernen“ strikt von der Ordnerauswahl: der Entfernen-Button öffnet keinen Explorer mehr und verwendet nur einen bereits freigegebenen `templates`-Ordner. Das bisherige synthetische `runtime-test`-Template wurde aus dem Distributionsstand entfernt.

### Modulare Template-Architektur

Importierte Templates werden ausschließlich unter `templates/<name>/` abgelegt. Die Ordner `frameworks/bootstrap4` und `frameworks/bootstrap5` bleiben unangetastet. Eine statische Registry bindet aufgenommene Templates beim normalen `index.html`-Start ohne erneute Analyse ein.

### Template-Verwaltung

`template-manager.html` übernimmt Analyse, Aufnahme, Prüfung und Entfernung zusätzlicher Templates. Manuell kopierte gültige Template-Ordner können registriert werden; manuell gelöschte Ordner werden erkannt und veraltete Registry-Einträge lassen sich bereinigen. Standard-Templates bleiben sichtbar, versioniert und geschützt.

### Universeller Bootstrap-Template-Compiler

Der Compiler analysiert beliebige BS4-/BS5-Templates ohne templatespezifische Sonderlogik. Beispiel-HTMLs, Sections, semantische Bausteinfamilien, Repeat-Kandidaten, CSS, Assets und JavaScript werden einmalig beim Import ausgewertet und anschließend als statisches Template-Modul gespeichert.

### JavaScript-Analyse und Aktivierungsplan

JavaScript wird statisch auf Bibliotheken, Plugins, Dependencies, DOM-Selektoren, Events und Section-Zuordnungen untersucht. Aus der Analyse entstehen Behavior-, Dependency- und Runtime-Manifeste. Importiertes Template-JavaScript wird im bearbeitbaren GrapesJS-Canvas nicht ausgeführt; dadurch bleiben Undo/Redo, Löschen, Shared Content und Autosave von fremden DOM-Mutationen entkoppelt.

### Externe Embeds und Maps

`iframe`, `object` und `embed` werden im Editiermodus pauschal isoliert. Aktive Fremdquellen wie Google Maps, OpenStreetMap, Video-/Social-Embeds und vergleichbare Plugin-Frames werden durch skalierende SVG-Platzhalter ersetzt. Breite, Höhe, Klassen und Styles bleiben erhalten; die Platzhalter fangen im Editor weder Mausereignisse noch Tastaturfokus ab. Originalquellen werden für Preview und Veröffentlichungsvertrag gespeichert.

### Bestehende Kernfunktionen

2.3.0 erhält die mehrseitige Projektverwaltung, Shared Content für Header/Navigation/Footer, die zentrale Repeat-Bibliothek, Bild- und Galerieverwaltung, responsive Medien, Zwei-Monitor-Arbeitsbereich sowie HTML-/SSI-/PHP- und Ordner-/ZIP-/TAR-Export.

## Kompatibilität

Die produktive Frameworkbasis bleibt Bootstrap 4.6.2 und Bootstrap 5.3.8. Der neue Template-Compiler ist auf Templates dieser beiden Bootstrap-Generationen ausgelegt. Bestehende Projekte werden über die vorhandenen Oluntir-Identitäten weitergeführt.

## Weitere Informationen

- [README](README_de.md)
- [Funktionen](FEATURES_de.md)
- [Template-System](docs/TEMPLATE-SYSTEM_de.md)
- [Handbuch](HANDBOOK_de.md)
- [Changelog](CHANGELOG_de.md)

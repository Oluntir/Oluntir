# Oluntir 2.2.1 – Handbuch

Dieses Handbuch beschreibt die Arbeit mit Oluntir 2.2.1. Implementierungsdetails befinden sich in `docs/ARCHITECTURE_de.md` und den thematischen Dokumenten unter `docs/`.

## 1. Projekt starten

Oluntir wird lokal über `index.html` geöffnet. Beim Start kann ein vorhandenes Projekt geladen oder ein neues Projekt angelegt werden. Projekte lassen sich als `.oluntir`-Dateien sichern und später weiterbearbeiten.

Für Source-Package-Analysen steht zusätzlich eine portable lokale Analyzer-Runtime zur Verfügung.

## 2. Seiten und Arbeitsbereich

Ein Projekt kann mehrere Seiten enthalten. Seiten werden über die obere Seitensteuerung angelegt, ausgewählt, umbenannt oder entfernt.

Oluntir unterstützt einen Ein-Monitor- und einen Zwei-Monitor-Modus. Im Zwei-Monitor-Modus können Werkzeugbereiche in ein separates Fenster ausgelagert werden, während der Canvas im Hauptfenster bleibt.

## 3. Inhalte bearbeiten

Der Canvas basiert auf GrapesJS. Inhalte können über Blöcke eingefügt und anschließend direkt oder über Eigenschaften, Ebenen und Styles bearbeitet werden.

Zu den typischen Inhalten gehören:

- Text und Überschriften;
- Bilder und responsive Bildvarianten;
- Galerien und Lightbox-Inhalte;
- Bootstrap-Komponenten;
- HTML5-Videos;
- projektgebundene Source-Komponenten.

## 4. Bootstrap-Profile

Oluntir 2.2.1 unterstützt Bootstrap 4.6.2 und Bootstrap 5.3.8 als konkrete Editorprofile.

Bootstrap 4 und Bootstrap 5 werden getrennt behandelt. Generationsspezifische Komponenten und Hilfsklassen werden nur im passenden Profil angeboten. Die eingebauten Blöcke verwenden natives Bootstrap-Markup.

## 5. Shared Content

Header, Navigation und Footer werden als Shared Content verwaltet. Änderungen können auf einer beteiligten Seite vorgenommen und in den gemeinsamen Stand übernommen werden. Die übrigen Seiten erhalten anschließend denselben Inhalt.

Shared Content ist bewusst von benutzerdefinierten Repeat-Bereichen getrennt.

## 6. Wiederholbare Bereiche

Wiederholbare Bereiche eignen sich für projektweite Inhalte, die auf mehreren Seiten vorkommen sollen, aber nicht zu Header, Navigation oder Footer gehören.

### Repeat anlegen

1. gewünschten Quellbereich auswählen;
2. Repeat-Familie benennen und speichern;
3. Zielseite und Einfügeposition auswählen;
4. Position im Canvas bestätigen;
5. Bereich einsetzen.

### Repeat zentral bearbeiten

Die Repeat-Bibliothek zeigt die vorhandenen Familien und ihre Seitenverwendung. Über **„Zentral bearbeiten“** wird nur der gewählte Repeat im Einzelobjekt-Canvas geöffnet.

Änderungen bleiben zunächst im Entwurf. Erst **„Auf alle Vorkommen anwenden“** veröffentlicht den neuen Stand auf allen aktiven Vorkommen.

### Repeat auf Seiten

Vorkommen auf normalen Projektseiten sind gegen direkte Inhaltsbearbeitung geschützt. Beim Mouseover erscheint eine orange Steuerleiste:

- **Bearbeiten** öffnet die zentrale Bearbeitung;
- **Entfernen** löscht nur dieses Vorkommen.

Publish und Entfernen besitzen eine eigene Repeat-Undo/Redo-Historie.

## 7. Bilder, Galerien und Videos

Der Bildmanager verwaltet lokale Bilder und responsive Varianten. Galerien können in geeignete Layoutbereiche eingefügt werden.

Die HTML5-Videoblöcke unterstützen mehrere Wiedergabequellen, Poster und einen Download-Fallback. Bootstrap 4 und Bootstrap 5 verwenden dabei jeweils ihre native responsive Layoutstruktur.

## 8. Source Packages und Analyzer

Der lokale Analyzer kann Template- und Frameworkquellen importieren und statisch untersuchen. Analysiert werden insbesondere HTML-, CSS- und JavaScript-Evidenz, Bootstrap-Generation und Komponentenstrukturen.

Erkannte Strukturen können – sofern das aktive Profil sie unterstützt – als quellengebundene Blöcke in den Editor übernommen werden. Importiertes Source-JavaScript wird nicht automatisch ausgeführt.

## 9. Export

Oluntir unterstützt:

- aufgelöstes HTML;
- Apache SSI;
- PHP-Includes;
- lokalen Ordnerexport;
- ZIP;
- TAR.

Der Export sammelt benötigte lokale Assets und entfernt editorinterne Oluntir-Metadaten aus der veröffentlichten Ausgabe.

## 10. Logging und Diagnose

Logging ist optional und wird nur nach ausdrücklicher Zustimmung aktiviert. Logs werden in einen vom Benutzer gewählten lokalen Ordner geschrieben.

Das Diagnosewerkzeug hilft bei der Analyse von Projekt-, Runtime-, Shared-Content-, Repeat- und Analyzer-Zuständen.

## 11. Projektpflege

Vor größeren Änderungen empfiehlt sich eine `.oluntir`-Projektsicherung. Bestehende Projekte werden über stabile Oluntir-Identitäten weitergeführt; bei nicht eindeutig rekonstruierbaren Beziehungen wird keine Zuordnung geraten.

## Weiterführende Dokumentation

- [Funktionen](FEATURES_de.md)
- [Architektur](docs/ARCHITECTURE_de.md)
- [Repeat Engine V2](docs/042_REPEAT_ENGINE_V2_de.md)
- [Shared Content Manager](docs/SHARED-CONTENT-MANAGER_de.md)
- [Image Manager](docs/IMAGE_MANAGER_de.md)
- [Multi-Monitor](docs/MULTI_MONITOR_de.md)
- [Release Notes](RELEASE_NOTES_de.md)

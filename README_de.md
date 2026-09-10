> **Sprache:** Deutsch · [English](README.md)

# Oluntir 2.3.0

Oluntir ist ein lokaler, browserbasierter Website-Editor auf Basis von GrapesJS 0.23.2. Er verwaltet mehrseitige Bootstrap-Projekte, lokale Assets, gemeinsame Seitenbereiche, projektweit wiederverwendbare Inhalte und offene Exporte ohne verpflichtende Cloud- oder Serverlaufzeit.

**Status:** Release 2.3.0
**Framework-Fokus:** Bootstrap 4.6.2 und Bootstrap 5.3.8
**Template-Import:** beliebige Bootstrap-4-/Bootstrap-5-Templates als modulare Templates unter `templates/`
**Arbeitsweise:** lokal und projektbasiert

## Kernfunktionen

- visueller GrapesJS-Editor für HTML- und Bootstrap-Projekte;
- mehrseitige Projekte mit portablen `.oluntir`-Projektdateien;
- Seitenverwaltung, lokale Assets, Favicon, Bilder, Galerien und responsive Bildvarianten;
- Shared Content für Header, Navigation und Footer;
- zentrale Bibliothek für projektweit wiederholbare Bereiche mit kontrollierter Veröffentlichung;
- Ein- und Zwei-Monitor-Arbeitsbereich;
- HTML-, Apache-SSI- und PHP-Include-Export sowie Ordner-, ZIP- und TAR-Ausgabe;
- optionale lokale Diagnose-Logs nach ausdrücklicher Zustimmung;
- modulare Template-Verwaltung außerhalb des Oluntir-Kerns.

## Neu in 2.3.0: modulare Bootstrap-Templates

Oluntir 2.3.0 trennt die fest integrierten Frameworkprofile von importierten Templates:

```text
frameworks/
├── bootstrap4/
└── bootstrap5/

templates/
├── registry.json
├── registry.js
└── <benutzer-template>/
```

`frameworks/` bleibt für importierte Templates unverändert. Ein aufgenommenes Template wird vollständig unter `templates/<name>/` abgelegt und kann dort auch außerhalb der Verwaltung gelöscht oder gesichert werden.

Die separate `template-manager.html` übernimmt Import, Analyse, Aufnahme, Registry-Prüfung und Entfernung. Manuell kopierte gültige Template-Ordner können erkannt und in die Registry aufgenommen werden; fehlende Ordner werden erkannt und können aus der Registry bereinigt werden. Die integrierten Bootstrap-4-/Bootstrap-5-Profile bleiben geschützt.

## Universeller Template-Compiler

Der Template-Compiler ist nicht auf ein bestimmtes Testtemplate zugeschnitten. Beim Import eines Bootstrap-4- oder Bootstrap-5-Templates werden unter anderem analysiert:

- alle relevanten Beispiel-HTML-Dateien unabhängig von ihrer Ordnerstruktur;
- Primärseiten gegenüber Dokumentation und Hilfsseiten;
- Bootstrap-Basis und erkannte Version;
- Seitenbereiche, Sections und semantische Bausteinfamilien;
- wiederholbare Child-Strukturen und Varianten;
- CSS-Ladekette, Template-CSS, Vendor-CSS und Framework-CSS;
- Bilder, Fonts, Medien und nicht referenzierte Demo-/Placeholder-Assets;
- JavaScript-Dateien, Lade-Reihenfolge, Bibliotheken, Dependencies, DOM-Selektoren und Section-Zuordnungen.

Aus der Analyse entsteht ein statisches Template-Modul. Die teure Analyse erfolgt beim Import; der normale Start über `index.html` lädt nur die fertige Registry und die kompilierten Template-Definitionen.

## JavaScript-Analyse und Editor-Isolation

Importiertes JavaScript wird universell statisch analysiert. Oluntir klassifiziert Section-Verhalten, globale Verhalten, Dependencies, Helper/Konfiguration und unaufgelöste Bindungen und erzeugt unter anderem:

- `behavior-manifest.json`;
- `dependencies.json`;
- `runtime-plan.json`;
- `javascript-activation-plan.json`.

Der Aktivierungsplan vermeidet doppelte Bootstrap-/jQuery-Runtimes und blockiert erkannte Hochrisiko-Skripte. Importiertes Template-JavaScript läuft **nicht im bearbeitbaren GrapesJS-Canvas**. Dadurch bleiben Undo/Redo, Löschen, Shared Content und Autosave von DOM-Mutationen fremder Plugins entkoppelt.

## Externe Embeds und Maps

Aktive Fremdinhalte über `iframe`, `object` und `embed` werden im Editiermodus pauschal isoliert. Das gilt unabhängig vom Anbieter, z. B. für Google Maps, OpenStreetMap, Video-/Social-Embeds oder andere Plugin-Frames.

Oluntir ersetzt die aktive Quelle im Editor durch einen skalierenden SVG-Platzhalter. Tag, Klassen, Style, Breite und Höhe bleiben erhalten; die Originalquelle wird gespeichert. Der Platzhalter ist im Editiermodus pointer-transparent und nicht fokussierbar, damit auch große Map-/Plugin-Flächen Auswahl, Löschen und Undo/Redo des umgebenden Blocks nicht blockieren. Beim Wechsel in die Preview wird die Originalquelle nur im Canvas-DOM reaktiviert. Der Compiler erzeugt zusätzlich `embed-isolation.json` und eine Restore-Runtime für den Veröffentlichungs-/Preview-Vertrag.

## Wiederholbare Bereiche

Wiederholbare Bereiche werden als zentrale Repeat-Familien verwaltet. Eine Familie besitzt einen zentralen Entwurf und kann auf mehreren Projektseiten eingesetzt werden. Die Bearbeitung erfolgt über **„Zentral bearbeiten“**; mit **„Auf alle Vorkommen anwenden“** wird der neue Stand kontrolliert veröffentlicht. Seiteninstanzen bleiben gegen direkte Inhaltsbearbeitung geschützt.

## Bootstrap-Unterstützung

Oluntir enthält unverändert die geschützten Standardprofile:

- **Bootstrap 4.6.2**
- **Bootstrap 5.3.8**

Importierte Templates verwenden eines dieser Profile als technische Basis, ohne die Dateien unter `frameworks/` zu verändern.

## Start und Template-Import

Normaler Editorstart:

1. Archiv entpacken.
2. `index.html` in einem aktuellen Chromium-basierten Desktop-Browser öffnen.
3. Projekt öffnen oder neu anlegen.
4. Bootstrap- oder registriertes Template-Profil auswählen.

Template-Import:

1. `template-manager.html` öffnen.
2. Namen und Template-ZIP wählen.
3. **Template analysieren**.
4. Analysewerte kontrollieren.
5. `templates`-Ordner der aktuellen Oluntir-Installation auswählen.
6. **Template aufnehmen**.
7. Nach erfolgreicher Verifikation über den grünen Button Oluntir öffnen.

## Dokumentation

- [Funktionen](FEATURES_de.md)
- [Handbuch](HANDBOOK_de.md)
- [Template-System](docs/TEMPLATE-SYSTEM_de.md)
- [Erster Start](docs/FIRST_START_de.md)
- [Architektur](docs/ARCHITECTURE_de.md)
- [Repeat Engine V2](docs/042_REPEAT_ENGINE_V2_de.md)
- [Shared Content](docs/SHARED-CONTENT-MANAGER_de.md)
- [Release Notes](RELEASE_NOTES_de.md)
- [Changelog](CHANGELOG_de.md)
- [Dokumentationsindex](docs/index_de.md)

## Projektgrenzen

Oluntir 2.3.0 ist produktiv auf Bootstrap 4 und Bootstrap 5 fokussiert. Der universelle Import ist für Templates dieser beiden Bootstrap-Generationen ausgelegt. Fremdframeworks werden nicht stillschweigend als Bootstrap behandelt.

## Lizenz

Siehe [LICENSING_de.md](LICENSING_de.md), [THIRD_PARTY_NOTICES_de.md](THIRD_PARTY_NOTICES_de.md) und die Dateien unter `LICENSES/`.

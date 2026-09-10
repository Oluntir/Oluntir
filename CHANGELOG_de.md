# Changelog

## 2.3.0 — 2026-09-10

- Shared Footer werden bei strukturellem Löschen aus dem resultierenden Seitenmodell übernommen; selbst erzeugte Style-Updates lösen keine rekursiven Shared-Content-Commits mehr aus. Embed-Platzhalter sind im Editiermodus pointer-transparent und nicht fokussierbar.
- Modulares Template-System unter `templates/`: zusätzliche Bootstrap-4-/Bootstrap-5-Templates werden außerhalb von `frameworks/` verwaltet und über eine statische Registry geladen.
- Neue `template-manager.html` für Analyse, Aufnahme, Prüfung, Registrierung manuell kopierter Templates und Entfernung zusätzlicher Templates.
- Universeller Bootstrap-Template-Compiler: Primär-/Doku-HTML-Trennung, semantische Sections/Bausteinfamilien, Repeat-Kandidaten, Asset- und CSS-Erfassung sowie statische Kompilierung.
- Universelle JavaScript-Analyse mit Bibliotheks-/Plugin-Erkennung, Dependency Graph, DOM-/Section-Zuordnung, Runtime-Plan und kontrolliertem Aktivierungsplan.
- Importiertes Template-JavaScript wird im bearbeitbaren GrapesJS-Canvas isoliert und nicht ausgeführt; kontrollierte Runtime-Skripte bleiben für Preview/Veröffentlichung vorbereitet.
- Externe `iframe`-, `object`- und `embed`-Inhalte werden im Editiermodus providerunabhängig durch skalierende SVG-Platzhalter ersetzt; Originalquelle und Größen-/Style-Struktur bleiben erhalten.
- Templateanalyse und Aufnahme besitzen Fortschrittsanzeige und verifizieren Registry sowie Template-Einstiegsdateien nach dem Schreiben.
- Standardprofile Bootstrap 4.6.2 und Bootstrap 5.3.8 bleiben geschützt und unverändert.

## 2.2.1 — 2026-09-07

- Dokumentation redaktionell bereinigt: README, FEATURES, HANDBOOK, ROADMAP und WHY_OLUNTIR konzentrieren sich auf stabile Produktfunktionen und Nutzung; Implementierungsdetails und Fehlerhistorie bleiben Changelog, Release Notes, DEV-, Audit-, Architektur- und Testdokumenten vorbehalten.
- Werkzeugleiste bereinigt: der redundante GrapesJS-Import/Download-Button zwischen Redo und Löschen wurde entfernt; der Oluntir-Ordnerexport bleibt erhalten.
- Erster regulärer 2.2.x-Release auf Basis des erfolgreich getesteten 2.2.0-BETA-Stands.
- Repeat-Zielauswahl unterstützt nun auch echte Top-Level-Inhaltsgrenzen außerhalb von `<main>`; Shared Header, Navigation und Footer bleiben ausgeschlossen.
- Repeat-Bibliothek: Untertitel „Bereich zentral bearbeiten“.
- ZIP- und TAR-Exportsymbole besitzen eindeutige kleine Format-Badges.
- Bootstrap-4/5-Abdeckung, HTML5-Video-Fallbacks, zentrale Repeat-Bibliothek, kontrolliertes Publish sowie Repeat-Undo/Redo bleiben Bestandteil der Release-Linie.

## 2.2.0 BETA — 2026-09-06

- 2026-09-07: Native HTML5-Videoblöcke für Bootstrap 4 und 5 ergänzt. BS4 verwendet `embed-responsive`, BS5 `ratio`; beide bieten WebM/MP4/Ogg, Poster und sichtbaren Download-Fallback. Analyzer um `media.video` und Video-Quellkomponenten-Erkennung erweitert.
- 2026-09-07: Bootstrap-4-Nutzung um Jumbotron, Media object und Custom forms ergänzt; BS5 registriert keine entfernten BS4-Komponenten. Analyzer-Erkennung auf gewichtete Versions-/Data-API-/Klassenevidenz und breiteren Bootstrap-Komponenten-Katalog erweitert.
- 2026-09-07: Repeat-Bibliothek neu strukturiert: getrennte Bereiche **„Bereich zentral bearbeiten“** und **„Auswahl Repeat und bei Ziel einfügen“**, kompakte A–Z-/Zuletzt-angelegt-Schalter, zwei schmale Scrolllisten und zentraler Bearbeitungsbereich mit Icon-Aktionen für Undo/Redo/Entwurf verwerfen. Der unpassende zentrale Button „Auf Seite einsetzen“ sowie die oberen zeilenweisen „Einsetzen“-Buttons wurden entfernt.
- 2026-09-07: Globales GrapesJS-Undo/Redo stellt die aktive rechte Werkzeugansicht kontrolliert wieder her. Hängende `open-blocks`-/Style-/Layer-/Traits-Commandzustände werden normalisiert; `Open Blocks` rendert den BlockManager beim Öffnen erneut.

- Zentraler Repeat-Canvas wieder vollständig editierbar: Seiteninstanz-Sperrflags werden nicht mehr in Draft/Published-Snapshots übernommen; Text-RTE, Auswahl und normale GrapesJS-Komponentenwerkzeuge sind in „Zentral bearbeiten“ wieder aktiv.

- Repeat-Bibliotheks-Zielauswahl über Seitenwechsel gehärtet: Das Bibliotheksfenster bleibt ohne aktiven zentralen Workspace geöffnet, Quelle/Zielseite bleiben erhalten und ein bestätigtes Canvas-Ziel aktiviert „Bereich einsetzen“ zuverlässig.
- Bestehende Projekte erhalten eine markerbasierte Repeat-Recovery: Fehlen zentrale Repeat-Metadaten, werden Familien und Vorkommen ausschließlich aus stabilen `data-oluntir-repeat-*`-Markern rekonstruiert; Header/Nav/Footer sind ausgeschlossen.
- Startup-Metadaten verwenden jetzt verbindlich `2.2.0 BETA`; ältere gespeicherte Versionsangaben werden nur noch als interne Migrationshistorie geführt und beim Öffnen aktualisiert.

- Neuer Branch `Oluntir-2.2.0-beta` auf Basis von 2.1.0 BETA.
- Repeat-Architektur auf zentrale Draft/Published-Bibliothek mit manueller Publikation umgestellt.
- Projektweite Verwendungsliste, Einzelobjekt-Canvas, orange Bearbeiten-/Entfernen-Steuerung und Repeat-Undo/Redo ergänzt.
- Automatische Repeat-Verteilung bei jedem GrapesJS-Änderungsereignis im 2.2-Branch deaktiviert; der bestehende gezielte Synchronisationsdienst bleibt als Transaktions-/Rollback-Grundlage erhalten.
- Kontrollierte Repeat-Projektmutationen schirmen intern erzeugte GrapesJS-Add/Remove-Ereignisse vom Shared-Content-Strukturwatcher ab; normale Header/Nav/Footer- und Benutzerstrukturänderungen bleiben aktiv.
- Repeat-Workspace-Seitenwechsel gehärtet: zuerst Handoff auf eine echte Projektseite, danach Entfernen der temporären GrapesJS-Seite; damit wird der `getAttributes`-Fehler beim Verlassen des zentralen Repeat-Canvas verhindert.
- Fehlermeldungen bleiben standardmäßig 12 Sekunden sichtbar; normale Hinweise 5 Sekunden.


## 2.1.0 BETA — 06.09.2026

- Versionsstatus und sichtbare UI-Kennzeichnung von `2.0.1 Alpha` auf **2.1.0 BETA** angehoben.
- Repeat-Bedienung in zwei getrennte Workflows aufgeteilt: aktuelle Quelle erstellen/bearbeiten und benannte projektweite Quelle aus Liste einsetzen.
- Beide Repeat-Workflows führen Zielseite → Einfügeposition → Canvas-Bestätigung → Einsetzen über denselben produktiven Synchronisationskern aus.
- Bestehende Alpha-Projekte werden nur anhand vorhandener stabiler Oluntir-Korrelationsmarker nachhydriert.
- Shared Content für Header, Navigation und Footer bleibt bidirektional.
- Performance: redundante Shared-Komponentenereignisse mit unverändertem zentralem Snapshot werden vor Zielmutation und zusätzlichem `editor.store()` beendet; normale Update-/Style-Ereignisse außerhalb gemeinsamer Bereiche werden nicht mehr als Shared Content verarbeitet.
- Dokumentation, Handbuch, Feature-Übersichten, Release Notes, Testhinweise und aktive Metadaten auf den Beta-Stand aktualisiert.

## 2.0.1-alpha v16 — 05.09.2026

- Shared-Content-Änderungen in Navigation und Footer werden beim Rückweg von
  Unterseiten direkt aus dem aktuellen GrapesJS-Komponentenmodell übernommen.
  Ein veralteter Canvas-HTML-Stand kann die zentrale Quelle dadurch nicht mehr
  überschreiben.
- Die Zielauswahl wird nach einem Canvas-Klick nicht mehr durch das zusätzliche
  `component:selected`-Ereignis auf einen übergeordneten Bereich verschoben.
- Blockierte Repeat-Pläne schreiben nun ihre konkreten Validierungsprobleme in
  das Diagnose-Log.
- Cache-Buster auf `repeat-v16` aktualisiert.

## 2.0.1-alpha v15 — 05.09.2026

- Der Persistenzlauf nach einem Seitenwechsel schreibt den frisch synchronisierten
  Shared-Content-Stand nicht mehr aus dem noch nicht aktualisierten Ziel-Canvas
  zurück. Damit bleibt insbesondere die Richtung neue Seite → Index für Header,
  Navigation und Footer erhalten.
- Repeat-Änderungen während einer aktiven Rich-Text-Bearbeitung werden gesammelt
  und erst nach `rte:disable` synchronisiert. Dadurch bleiben Textcursor und
  Eingabefluss stabil.
- Die Repeat-Zielauswahl trennt Hover-Vorschau und bestätigten Mausklick. Die
  orange Markierung bleibt bis zum Einsetzen oder Löschen bestehen; echte
  Grenzen zwischen direkten `main`-Bereichen können ausgewählt werden.
- Cache-Buster auf `repeat-v15` aktualisiert.

## 2.0.1-alpha v14 — 05.09.2026

- Zielauswahl zeigt wieder beim Überfahren eines Canvas-Bereichs die orange
  Einfügeposition; die Auswahl und das produktive Einsetzen verwenden weiterhin
  denselben Document-API-Resolver.
- Ein aktiver RTE wird vor dem Seitenwechsel abgeschlossen, damit Änderungen
  der neuen Seite in das GrapesJS-Projektmodell und den Projektsnapshot gelangen.
- Seitenwechsel protokollieren die erkannte Quell- und Zielseite für die weitere
  Laufzeitdiagnose.
- Cache-Buster auf `repeat-v14` aktualisiert.

## 2.0.1-alpha v13 — 05.09.2026

- RTE-/Textcursor-Bearbeitung wird im Shared-Content-Pfad nicht mehr durch
  einen verzögerten Re-Render unterbrochen.
- Nav, Header und Footer übernehmen vor dem Seitenwechsel wieder den aktuellen
  sichtbaren Zustand der Quellseite; die Rückrichtung neue Seite → Index bleibt
  dabei im zentralen Shared-Content-Manager.
- Repeat-Änderungen werden über stabile Quell-IDs auch aus einer eingesetzten
  Instanz erkannt und als gezielter Transaktionsplan zur Quelle und zu allen
  übrigen Instanzen zurückgeschrieben.
- Shared Layouts werden nicht zusätzlich durch die Repeat-Automatik verwaltet.
- Neue Reverse-Synchronisations-, Identity-Mapping- und RTE-Regressionstests;
  Cache-Buster auf `repeat-v13` aktualisiert.

## 2.0.1-alpha v12 — 05.09.2026

- Repeat-Ziele verwenden jetzt den bestehenden GrapesJS-/Dokument-Resolver mit
  stabilen Seiten-, Parent- und Anchor-IDs; das feste DOM-Hover-Overlay wurde entfernt.
- „Im Bereich“, „davor“ und „danach“ zeigen die echte Strukturgrenze auch bei
  null, einem oder mehreren sichtbaren Seitenbereichen.
- Repeat-Markierungen erscheinen orange erst nach einer gültigen Auswahl und
  werden beim Löschen, Abschluss oder erneuten Öffnen zuverlässig entfernt.
- Shared Content schreibt den zentralen Snapshot und propagiert Änderungen aus
  Header, Navigation und Footer über den Shared Content Manager auf alle Seiten;
  Diagnoseereignisse protokollieren Quelle, Region, Pfad und Zieländerungen.
- Cache-Buster auf `repeat-v12` aktualisiert; Vertragstests und Hashes erneuert.

## 2.0.1-alpha v11 — 05.09.2026

- Shared Content propagiert Änderungen aus Header, Navigation und Footer jetzt
  über den betroffenen Komponentenpfad auf alle Projektseiten, auch beim
  Rückweg von einer neu angelegten Seite zum Index.
- Der Repeat-Dialog setzt Quelle, Definition, Zielseite und Zielknoten nach
  erfolgreichem Einsetzen zurück, ohne die Projektdefinitionen zu löschen.
- Die Zielseite bleibt beim Wechsel der Repeat-Definition erhalten; nur der
  konkrete Zielknoten wird neu markiert.
- Hover-Ziele lösen keine globale `<main>`-Einfügelinie mehr aus. Einfügeposition
  und Zielknoten werden eindeutig am gewählten GrapesJS-Baustein berechnet.
- Cache-Buster auf `repeat-v11` aktualisiert; SHA256SUMS und Vertragstests
  erneuert.

## 2.0.1-alpha — 04.09.2026

- Portable Windows-x64-Node.js-Runtime und lokale Analyzer-API-Starter ergänzt.
- Universeller Source-Package-Import über die lokale API für Ordner, ZIP, TAR,
  TAR.GZ/TGZ, Browser-Dateien und URLs ergänzt.
- Eigene Paketordner, Inventare, Hashes, Recovery-JSON, Capability-Manifeste
  und quellengebundene Profile ergänzt.
- Statische HTML-/CSS-/JavaScript-Analyse, OIR, Knowledge Compiler,
  Übersetzungsmatrix und JavaScript-Behavior-Resolver ergänzt.
- Kontrollierte GrapesJS-Source-Package-Bridge für auswählbare Source-Blöcke
  ergänzt.
- Produktive Frameworkunterstützung auf Bootstrap 4.6.2 und 5.3.8 begrenzt;
  unbekannte Sources bleiben `analysis-only`.
- Frameworkeigene Galeriebehandlung, Lightbox, Vorschaukorrekturen und
  Export-Regressionstests ergänzt.
- Repeat-Foundation-Ausführung und produktive Synchronisation sind für
  ausdrücklich definierte Wiederholungsinstanzen aktiviert.

## 1.3.1 — 02.08.2026
- Globale optionale Klickvergrößerung für Bilder ergänzt: Aktivierung direkt im Bildmanager oder nachträglich über die Schnellbearbeitung; persistent in Cards, Grids, Textbereichen und beliebigen Bildkomponenten sowie vollständig in HTML-, SSI- und PHP-Exporten verfügbar.

### Stabilität und Persistenz
- Shared Content für Header, Navigation und Footer stabilisiert.
- Schnellbearbeitungen werden projektweit gespeichert und ohne destruktiven Neuaufbau der Navigation übertragen.
- Text-, Farb- und Schriftgrößenwerte werden über den Oluntir-Darstellungsvertrag in Projekt und Export übernommen.
- Undo und Redo für Text- und Bildänderungen stabilisiert.

### Galerie und Layout
- Einfügepositionen innerhalb vorhandener Container beibehalten.
- Neue Galerie-Bereiche können vor, zwischen und nach vollständigen Seitenbereichen eingefügt werden.
- Orange Vorschau- und Scrollmarkierungen für neue Seitenbereiche ergänzt.
- Leere oder doppelte Einfügepositionen entfernt.
- Vollständig leere neue Projekte und leere HTML-Seiten bieten nun eine gültige Position für die erste Galerie; die Seitenwurzel wird dabei stabil über die Seiten-ID adressiert.

### Export und Frameworks
- Der Export bleibt auch bei leerem Header, leerer Navigation, leerem Footer oder noch unvollständigen wiederverwendbaren Bereichen möglich; diese Zustände werden nur noch als Hinweise protokolliert.
- Export-Snapshots und responsive Bildvarianten stabilisiert.
- Bootstrap 4.6.2 und Bootstrap 5.3.8 geprüft.
- Framework- und Iconquellen konsolidiert.
- Editorinterne Metadaten werden im finalen Export entfernt.

### Technische Vorbereitung
- Resolver, Dependency Graph, Action-Verträge und Validierung konsolidiert.
- Repeat Foundation vollständig vorbereitet, aber ohne sichtbare oder produktive Synchronisation.

### Bekannte Einschränkung
- Eine explizit gesetzte Footer-Schriftfarbe kann in der Arbeitsansicht vom Export abweichen; der Export übernimmt den gewählten Wert korrekt.

## 1.3.0 — 01.08.2026

- Semantische Resolver-, Identitäts- und Abhängigkeitsgrundlagen eingeführt.
- Shared Content und Projektpersistenz erweitert.
- Bootstrap-4-/Bootstrap-5-Unterstützung und Exportfunktionen konsolidiert.

## Frühere Versionen

Die ältere Historie bleibt im Git-Verlauf erhalten.

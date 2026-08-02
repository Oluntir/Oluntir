- Bekannter Darstellungsfehler: Eine explizit bearbeitete Footer-Schriftfarbe kann im Arbeitsbereich von der exportierten Farbe abweichen; der Export übernimmt explizit gewählte Werte korrekt.
## DEV_012 – Bild-Undo/Redo

- Bildaustausch und Bildattribute an den gemeinsamen Dokument-/Undo-Vertrag angebunden.
- Responsiven Galerie-Bildwechsel über die Dokument-API geführt.
- Undo/Redo aktualisiert Canvas und persistenten Projektzustand.
- Zwischenberichte `DEV_011_FIX*` aus dem Paket entfernt.
# DEV_011 FIX16

- Behebt den letzten instabilen Backbone-Objektreferenzvergleich bei der produktiven MAIN-Bereichseinfügung.
- Direkte MAIN-Kinder werden nun über stabile Oluntir-Identität und Canvas-DOM auf die live Komponenten-Collection abgebildet.
- Orange Vorschau, Scrollen und sortierte Einschübe bleiben unverändert.

## DEV_011 FIX15 – Laufzeitstabile AreaSlot-Einfügung

- Behebt die weiterhin auftretende Meldung „Die gewählte Template-Position ist nicht mehr verfügbar“.
- Ermittelt die direkte MAIN-Grenze notfalls über die bereits aufgelöste Anchor-Komponente und deren reales Canvas-DOM.
- Vergleicht deklarierte und aktuelle MAIN-Komponenten über stabile Oluntir-Identitäten statt über Backbone-Objektreferenzen.
- Vorschau, Sortierung und bestehende ROW-Einfügung bleiben unverändert.

## DEV_011 FIX1

- Korrigiert die MAIN-Erkennung für importierte Templates mit abweichender Herkunftskennzeichnung.
- Orange Galerie-Bereichseinschübe erscheinen nun vor, zwischen und nach allen direkten MAIN-Bereichen.
- Neuer Regressionstest für drei bestehende `CONTAINER-FLUID`-Bereiche und vier MAIN-Einschubpositionen.

# Changelog
## Oluntir 2.0 – DEV_011 — 02.08.2026

### Galerie-Bereichseinschub
- Neue Galerie-Bereiche werden als direkte `SECTION` innerhalb der tatsächlichen `MAIN`-Template-Struktur eingefügt.
- Einfügepositionen entstehen vor, zwischen und nach direkten `SECTION`-/`CONTAINER`-Bereichen von `MAIN`.
- Der Dialog bietet ausschließlich `Container` und `Container Fluid`.
- Laufzeitvalidierung verhindert das Einfügen in verschobene oder verschachtelte Anker.
- Bestehende ROW-Einschübe, Preview, Export, Shared Content, Repeat und Project Store bleiben unverändert.
- Keine produktive Synchronisationslogik ergänzt.


## 1.3.0 — 01.08.2026

### Architektur
- Semantic Dictionary sowie Identity-, Context-, Structure- und Relationship Resolver ergänzt.
- Project Dependency Graph als explizit aufgebautes, read-only Abhängigkeitsmodell ergänzt.
- Semantic Action Engine mit Lifecycle, Actions, Handlern, Phasen, Queue, Batches, Deduplizierung, Transaktionen, Fehlern und Metriken ergänzt.
- Semantic Validator und technische Repeat-Engine-V2-Grundlage beibehalten.

### Shared Content und Performance
- Shared Content für Header, Navigation und Footer auf gezielte Regionsupdates umgestellt.
- Fingerprints und Lazy Sync eingeführt.
- Vollseiten- und Vollprojekt-Neuaufbauten beim normalen Seitenwechsel vermieden.

### Logging und Diagnose
- Optionales lokales Logging mit Ringpuffer, JSONL-Dateien, Rotation und Maskierung ergänzt.
- Runtime Actions für Editor-, Seiten-, Shared-Content-, Galerie- und Exportereignisse ergänzt.
- Installationsbezogene, versionierte Zustimmung für Lizenz, Datenschutz und Sicherheitsrichtlinien ergänzt.
- Developer Diagnostics Center mit manueller Graphanalyse und Snapshot-Export ergänzt.

### Editor und Export
- Framework- und Iconquellen für Bootstrap 4 und 5 konsolidiert.
- Projekt-Favicon, Editor-Platzhalter und responsive Bildvarianten stabilisiert.
- HTML-, SSI- und PHP-Export einschließlich Shared Content lokal getestet.

### Dokumentation
- Hauptdokumentation auf 1.3.0 konsolidiert.
- Architektur- und AI-Wissensbasis ergänzt.
- Release-Audit ergänzt.

## Frühere Versionen
Die Historie bis 1.2.1 bleibt im Git-Verlauf und in den vorhandenen migrationsbezogenen Dokumenten erhalten.

## DEV_011 FIX2

- Alte Galerie-Option „Hier platzieren – leerer CONTAINER/CONTAINER-FLUID“ entfernt.
- MAIN-Bereichsgrenzen werden nun auch erkannt, wenn der MAIN-Knoten selbst nicht in der Resolver-Knotenliste enthalten ist, seine direkten Template-Bereiche aber dieselbe reale Elternidentität besitzen.
- Für drei bestehende Seitenbereiche werden zuverlässig vier Galerie-Bereichseinschübe erzeugt.
- Regressionstest für den realen Dialogfall ergänzt.

## Oluntir 2.0 DEV_011 FIX3

- Orangefarbene MAIN-Einschübe werden nun in der tatsächlichen Seitenreihenfolge zwischen den sichtbaren blauen Bootstrap-Bereichen dargestellt.
- Bereichszuordnung zusätzlich über den Template-`positionPath` abgesichert.
- Nicht direkt zuordenbare Container werden nicht mehr gesammelt nach allen orangefarbenen Einschüben ausgegeben.
- Regressionstest für die sortierte gemeinsame Bereichssequenz ergänzt.

### DEV_011 FIX4 – Vorschau für MAIN-Galeriebereiche

- Orangefarbene Vorschau-Markierung für `new-gallery-area` im Bearbeitungsbereich ergänzt.
- Die Markierung liegt exakt an der realen Grenze zwischen direkten Kindern von `MAIN`.
- Beim letzten Einschub wird die Unterkante des letzten Seitenbereichs verwendet, nicht ein Punkt innerhalb des MAIN-Paddings.
- Blau bleibt ausschließlich für ROW-Einschübe in bestehenden Containern reserviert.

## Oluntir 2.0 DEV_011 FIX5

- Der Preview-Marker für neue Galerie-Bereiche wird als deutlich sichtbarer orangefarbener Bereich über die vollständige Breite des Editor-Viewports dargestellt.
- Der Marker liegt mittig auf der tatsächlichen MAIN-Einfügegrenze.
- Das automatische Scrollen berücksichtigt die Markerhöhe und zentriert die sichtbare Einfügeposition.
- Die blaue ROW-Markierung bleibt unverändert containerbezogen.


## DEV_011 FIX6 – sichtbare vollbreite MAIN-Vorschau und Bereinigung leerer Container

- Leere `container`-/`container-fluid`-Gruppen ohne direkte ROW werden im Galerie-Zieldialog nicht mehr dargestellt.
- Der veraltete Rest der früheren Leer-Container-Einfügelogik ist damit aus der sichtbaren Auswahl entfernt.
- Orange MAIN-Vorschauen werden ohne Hover-Verzögerung ausgelöst.
- Der Marker wird als absoluter Overlay-Knoten direkt im Canvas-Dokument verankert.
- Seine Position berücksichtigt den tatsächlichen Scrollstand und bleibt exakt auf der MAIN-Einfügegrenze.
- Die Breite orientiert sich an der vollständigen Dokumentbreite des Arbeitsbereichs.

## DEV_011 FIX7 – konsolidierte MAIN-Grenzen und sichtbare Canvas-Vorschau

- Leere, nicht dargestellte Resolver-Bereiche erzeugen keine doppelten orangefarbenen Einschübe mehr.
- Die sichtbare Sequenz wird ausschließlich aus tatsächlich dargestellten Bootstrap-Bereichen aufgebaut.
- Der letzte sichtbare Bereich erhält genau einen Einschub „nach dem letzten Seitenbereich“.
- Die orange Vorschau wird als `position: fixed` direkt im Canvas-Body dargestellt.
- Die Vorschau nutzt die vollständige Canvasbreite und aktualisiert ihre Position bei Scrollen und Größenänderungen.

## DEV_011 FIX8 – Orange Vorschau-Markierung tatsächlich aktiviert

- Die Hover- und Klickauflösung berücksichtigt nun neben `model.slots` auch `model.areaSlots`.
- Dadurch wird ein orangefarbener MAIN-Einschub erstmals als gültiges Vorschauziel an die Preview-API übergeben.
- Beim Verlassen eines Einfügebuttons wird eine aktive Markierung vollständig entfernt.
- Keine Änderung an Reihenfolge, Bereichserkennung oder Einfügesemantik.

## DEV_011 FIX9

- Orange MAIN-Vorschau vom produktiven Einfügevertrag getrennt.
- Read-only-Zielauflösung für sichtbare Bereichsanker ergänzt.
- Scrollen und vollbreite orange Markierung funktionieren auch dann, wenn der vollständige MAIN-Einfügevertrag erst beim produktiven Vorgang validiert werden kann.
- Strenge Validierung der tatsächlichen Einfügung bleibt unverändert.

## DEV_011 FIX10 – Gemeinsamer AreaSlot-Vertrag für Vorschau und Einfügung

- Die orange Vorschau und die produktive Galerie-Bereichseinfügung verwenden nun denselben Resolver `resolveAreaInsertionTarget()`.
- Die tatsächliche Einfügeposition wird aus dem weiterhin vorhandenen sichtbaren Anker und dessen realem direkten MAIN-Elternknoten bestimmt.
- Ein nicht separat auflösbarer MAIN-Identitätseintrag älterer Templates blockiert die Einfügung nicht mehr, sofern der Live-Anker weiterhin direkt in einem semantischen `<main>` liegt.
- Auflösbare, aber abweichende Elternidentitäten sowie verschobene oder entfernte Anker werden weiterhin abgelehnt.
- Die bestehende ROW-Einfügelogik bleibt unverändert.

## DEV_011 FIX11 – Vorschau-Regression aus FIX10 behoben

- Die produktive Galerie-Bereichseinfügung verwendet weiterhin den gemeinsamen strengen AreaSlot-Resolver aus FIX10.
- Die in FIX9 funktionierende Read-only-Fallback-Auflösung für Vorschau und Scrollen wurde wiederhergestellt.
- Ältere Templates können damit erneut orange Markierungen anzeigen, auch wenn die MAIN-Owner-Identität in der Vorschauphase nicht auflösbar ist.
- Die produktive Einfügevalidierung wurde nicht gelockert.

## DEV_011 FIX12 – MAIN/SECTION-Grenze bei produktiver Einfügung

- Produktive Galerie-Bereichseinfügung steigt vom sichtbaren Container-Anker bis zum echten `MAIN` auf.
- Als Einfügegrenze wird das direkte Kind des `MAIN` verwendet, typischerweise die umgebende `SECTION`.
- Die funktionierende orange Vorschau aus FIX11 bleibt unverändert.
- Deklarierte MAIN-Identitäten werden weiterhin gegen den realen MAIN-Vorfahren validiert.

## DEV_011 FIX13 – Produktive MAIN-Auflösung über Canvas-DOM

- Behebt die weiterhin auftretende Meldung „Die gewählte Template-Position ist nicht mehr verfügbar“ beim Klick auf einen orangefarbenen Galerie-Bereichseinschub.
- Vorschau und produktive Einfügung verwenden nun dieselbe tatsächlich gerenderte Template-Grenze im GrapesJS-Canvas.
- Der sichtbare Anker wird per `closest('main')` dem echten MAIN zugeordnet; das direkte DOM-Kind von MAIN wird anschließend über `DomComponents.getComponent()` wieder in die GrapesJS-Komponente überführt.
- Die bisherige Modell-Elternkette bleibt ausschließlich als Kompatibilitätsfallback für noch nicht gemountete Canvas-Strukturen erhalten.
- Die produktive Sicherheitsvalidierung und die Repeat-Synchronisationssperre bleiben unverändert.

## DEV_011 FIX14

- Behebt die weiterhin fehlschlagende produktive Galerie-Bereichseinfügung.
- Ersetzt die ungültige DOM-Auflösung über `DomComponents.getComponent(DOMElement)` durch die GrapesJS-0.23.2-kompatible Brücke `element.__gjsv.model`.
- Orange Vorschau und Dialogsortierung bleiben unverändert.

## DEV_011 DIAG

- Diagnose-Build ohne funktionale Änderung ergänzt.
- Produktive orange AreaSlot-Auflösung meldet nun die konkrete Abbruchstufe und einen stabilen Diagnosecode.
- Kurzdiagnose im Fehlerdialog und vollständige strukturierte Ausgabe in der Browser-Konsole.

## DEV_011 FIX17 – stabiler AreaSlot-Besitzer

- Produktive Galerie-Bereichseinfügung verwendet nun zuerst `parentIdentity` und `anchorIdentity` des bereits bestätigten AreaSlots.
- Semantische Seitenwurzeln mit `data-oluntir-page-id` werden als gültige Besitzer vorhandener MAIN-Bereiche unterstützt.
- Eine erneute MAIN-Suche über Canvas oder unvollständige GrapesJS-Elternketten ist nicht mehr Voraussetzung für die Einfügung.

## DEV_012 FIX1

- Regression im zentralen Undo-/Redo-Pfad behoben: Text und Bilder verwenden wieder direkt den nativen GrapesJS-UndoManager.
- Zusätzliche Undo-/Redo-Nachpersistierung entfernt, die den History-Lebenszyklus beeinflussen konnte.
- Temporäre DEV_011-Runtime-Diagnoseausgaben und Diagnoseartefakte entfernt.

## DEV_012 FIX2

- Bild-Redo repariert: Bild-Autosave leert nach Undo nicht mehr den GrapesJS-Redo-Stack.
- Undo/Redo-Zustände werden ohne erneute Canvas-/Modellnormalisierung gespeichert.
- Text-Undo/Redo und Bild-Undo bleiben unverändert.


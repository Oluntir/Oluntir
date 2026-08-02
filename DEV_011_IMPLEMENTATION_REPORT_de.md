# Oluntir 2.0 – DEV_011 Umsetzungsbericht

## Neue Dateien

- `docs/050_DEV_011_GALLERY_MAIN_AREA_INSERTION_de.md`
- `tests/test-dev011-gallery-main-area-insertion.js`
- `DEV_011_IMPLEMENTATION_REPORT_de.md`

## Geänderte Dateien

- `editor/js/core/oluntir-document-api.js`
- `editor/integrations/grapesjs/grapesjs-adapter.js`
- `editor/js/core/template-structure-api.js`
- `editor/js/core/structure-insertion-target.js` (bestehende DEV_010-Darstellung weiterverwendet, Vertragsversion bleibt 8)
- `editor/js/features/gallery.js`
- `editor/css/editor.css`
- `tests/test-template-structure-api.js`
- `tests/run-tests.sh`
- `CHANGELOG.md`
- `CHANGELOG_de.md`
- `SHA256SUMS.txt`

## Gelöschte Dateien

Keine.

## Architekturänderungen

1. `new-gallery-area` ist nun ein expliziter MAIN-Strukturvorgang.
2. Die sichtbare Bereichsfolge wird ausschließlich aus direkten Bootstrap-Strukturbereichen unter `MAIN` gebildet.
3. Beliebige direkte Texte oder technische Knoten erzeugen keine Galerie-Bereichsslots.
4. Der GrapesJS-Adapter dient nur als Laufzeitbrücke und validiert, dass MAIN und direkter Anker noch der zuvor analysierten Template-Struktur entsprechen.
5. Die erzeugte Galerie bleibt Bootstrap-Struktur; Oluntir ergänzt nur `data-oluntir-layout-area="gallery"`.

## Vertragsänderungen

Galerie-Bereichsslots führen zusätzlich:

- `structureScope: main`
- `structureKind: section-container-row-gallery`

Der Template-Structure-API-Schemastand wurde von 1 auf 2 erhöht. Der Document-API-Schemastand wurde von 7 auf 8 erhöht.

Keine Änderungen an Resolver-, Dependency-Graph-, Action- oder Synchronisationsverträgen. Keine produktive Repeat-Synchronisation.

## Automatische Tests

Ausgeführt:

```text
bash tests/run-tests.sh
```

Ergebnis:

- vollständige bestehende Testsuite erfolgreich
- `DEV_011-GALLERY-MAIN-AREA-INSERTION-TEST ERFOLGREICH`
- Strukturprüfung erfolgreich: 74 statische HTML-Referenzen, Bootstrap 4.6.2 und Bootstrap 5.3.8, lokale Assets und JavaScript-Syntax

Die Logger-Dateiprüfung gibt weiterhin ihre bekannte simulierte Warnung `directory.getFileHandle is not a function` aus und endet anschließend erfolgreich. Diese Warnung ist kein DEV_011-Fehler.

## Konkrete manuelle Tests und erwartete Ergebnisse

### Test 1 – Zwischen zwei SECTIONs

1. Seite mit mindestens zwei direkten SECTIONs unter MAIN öffnen.
2. Galerie hinzufügen.
3. Orange Position zwischen beiden Bereichen auswählen.
4. `Container` wählen und Bilder bestätigen.

Erwartet: Eine neue SECTION erscheint exakt zwischen den beiden bisherigen SECTIONs. Darin liegt `div.container > div.row.pb-gallery`.

### Test 2 – Container Fluid

Wie Test 1, aber `Container Fluid` wählen.

Erwartet: Die neue SECTION enthält unter Bootstrap 4 `div.container-fluid`; unter Bootstrap 5 `div.container-fluid.px-3.px-lg-4`.

### Test 3 – Vor erstem und nach letztem Bereich

Jeweils den obersten bzw. untersten orangefarbenen Einschub wählen.

Erwartet: Die Galerie-SECTION wird als erstes bzw. letztes direktes Layoutkind von MAIN eingefügt, nicht in HEADER, FOOTER, CONTAINER oder ROW.

### Test 4 – Bestehender Container-/ROW-Einschub

Einen blauen Slot vor, zwischen oder nach vorhandenen ROWs wählen.

Erwartet: Das bisherige Verhalten bleibt unverändert; nur eine Galerie-ROW wird in den vorhandenen Container eingefügt.

### Test 5 – Persistenz und Folgesysteme

Projekt nach Test 1 speichern, neu öffnen und HTML/SSI/PHP exportieren.

Erwartet: Neue SECTION und Galerie bleiben erhalten; Preview und Export zeigen dieselbe Reihenfolge. Shared Content, Repeat-Metadaten und Project Store arbeiten über die bestehenden Pfade weiter. Es wird keine produktive Synchronisation ausgelöst.

### Test 6 – Veraltetes Ziel

Auswahldialog öffnen und die zugrunde liegende Struktur vor Bestätigung programmgesteuert ändern oder den Anker entfernen.

Erwartet: Einfügen wird mit der Meldung abgebrochen, dass die Position nicht mehr verfügbar ist; keine SECTION wird in einen falschen Container geschrieben.

## DEV_011 FIX1 – Korrektur der sichtbaren MAIN-Einschübe

### Fehlerursache

Die Erkennung des tatsächlichen `MAIN` war zusätzlich zur Template-Rolle auf die internen Herkunftswerte `main` oder `page` eingeschränkt. Reale importierte Templates können für dasselbe echte `<main>` jedoch eine andere Herkunftskennzeichnung führen. Dadurch wurden die Container-/ROW-Gruppen angezeigt, aber die MAIN-basierten Galerie-Bereichsslots nicht erzeugt.

### Korrektur

`MAIN` wird nun ausschließlich anhand der tatsächlichen Template-Rolle `main` erkannt. Ausgeschlossen bleiben nur Bereiche aus Shared Header und Shared Footer. Die Bootstrap- und Template-First-Struktur bleibt unverändert.

Für drei direkte Bereiche in `MAIN` werden nun exakt vier orange Einschubpositionen erzeugt:

1. vor dem ersten Bereich,
2. zwischen Bereich 1 und 2,
3. zwischen Bereich 2 und 3,
4. nach dem letzten Bereich beziehungsweise vor dem Footer.

### Dateien

Geändert:

- `editor/js/core/oluntir-document-api.js`
- `tests/run-tests.sh`
- `DEV_011_IMPLEMENTATION_REPORT_de.md`
- `CHANGELOG_de.md`

Neu:

- `tests/test-dev011-fix1-main-origin-area-slots.js`

Gelöscht: keine.

### Test

`bash tests/run-tests.sh`

Erwartetes und erreichtes Ergebnis:

- alle bestehenden Tests erfolgreich,
- Strukturprüfung erfolgreich,
- neuer Regressionstest `DEV_011-FIX1-MAIN-ORIGIN-AREA-SLOTS-TEST ERFOLGREICH`,
- drei direkte `CONTAINER-FLUID`-Bereiche erzeugen vier MAIN-Einschübe.

## DEV_011 FIX2 – tatsächliche MAIN-Grenzen bei nicht aufgelöstem MAIN-Knoten

### Korrektur

- Der veraltete Slot `Hier platzieren – leerer CONTAINER/CONTAINER-FLUID` wurde vollständig entfernt.
- Leere Container bleiben im Strukturfenster nur noch als sichtbarer Seitenbereich erhalten; sie bieten keinen falschen containerinternen Galerie-Slot mehr an.
- Wenn der Struktur-Resolver die direkten Kinder von `MAIN`, aber nicht den `MAIN`-Knoten selbst liefert, werden die MAIN-Grenzen nun aus der gemeinsamen realen `parentIdentity` und den aufgelösten Template-Positionen der sichtbaren Bereiche gebildet.
- Bei drei direkten Seitenbereichen entstehen damit exakt vier neue Galerie-Bereichseinschübe: davor, zweimal dazwischen und danach.
- Die Einfügung bleibt ein `new-gallery-area`-Vorgang mit `structureScope: main`; der GrapesJS-Adapter validiert den tatsächlichen Elternknoten vor dem Schreiben weiterhin als `MAIN`.

### Geänderte Dateien

- `editor/js/core/oluntir-document-api.js`
- `tests/test-bootstrap-row-insertion-slots.js`
- `tests/run-tests.sh`
- `DEV_011_IMPLEMENTATION_REPORT_de.md`
- `CHANGELOG_de.md`

### Neue Datei

- `tests/test-dev011-fix2-unresolved-main-boundaries.js`

### Regressionstest

Der neue Test bildet genau den gemeldeten Fall ab:

- drei sichtbare `CONTAINER-FLUID`-Bereiche,
- zwei Bereiche mit ROW,
- ein leerer Bereich,
- der MAIN-Knoten ist nicht Bestandteil der Resolver-Knotenliste,
- alle drei Bereiche besitzen aber dieselbe reale MAIN-`parentIdentity`.

Erwartet werden vier MAIN-Einschübe und kein `empty-layout-area`-Slot.

## DEV_011 FIX3 – sortierte Darstellung der MAIN-Einschübe

### Fehlerbild

Die orangefarbenen MAIN-Einschübe wurden zwar ermittelt, aber bei abweichenden Runtime-Identitäten gesammelt vor den sichtbaren Bootstrap-Containern dargestellt. Damit entsprach die Auswahlliste nicht der echten Seitenreihenfolge.

### Korrektur

Die Dialogausgabe ordnet sichtbare Container nun zusätzlich über ihren tatsächlichen `positionPath` den direkten MAIN-Bereichen zu. Die Ausgabe erfolgt als gemeinsame Sequenz:

1. orangefarbener Einschub vor dem ersten Bereich,
2. zugehöriger blauer Container-/ROW-Bereich,
3. orangefarbener Einschub zwischen den Bereichen,
4. nächster blauer Bereich,
5. abschließender orangefarbener Einschub vor dem Footer.

Nicht über die Runtime-Identität zuordenbare Container werden anhand der echten Template-Reihenfolge in den passenden Bereich einsortiert. Sie werden nicht mehr gesammelt hinter allen Einschüben ausgegeben.

### Geänderte Dateien

- `editor/js/core/structure-insertion-target.js`
- `tests/run-tests.sh`
- `DEV_011_IMPLEMENTATION_REPORT_de.md`
- `CHANGELOG_de.md`

### Neue Dateien

- `tests/test-dev011-fix3-sorted-area-rendering.js`

### Gelöschte Dateien

- keine

### Architektur- und Vertragsänderungen

- keine Änderung der Resolver-Verträge
- keine Änderung des Dependency-Graph-Modells
- keine Änderung der Action-Verträge
- keine Änderung des gezielten Synchronisationsdienstes
- keine produktive Repeat-Synchronisationslogik ergänzt
- ausschließlich Korrektur der read-only Darstellung des bestehenden Einfügemodells

### Test

```bash
node --check editor/js/core/structure-insertion-target.js
bash tests/run-tests.sh
```

Erwartetes Ergebnis:

```text
DEV_011-FIX3-SORTED-AREA-RENDERING-TEST ERFOLGREICH
DEV_011-GALLERY-MAIN-AREA-INSERTION-TEST ERFOLGREICH
STRUKTURPRÜFUNG ERFOLGREICH
```

## FIX4 – Orange Vorschau-Markierung und exakte Scrollposition

Geändert wurde `editor/integrations/grapesjs/grapesjs-adapter.js`.

Für alle Einfügeziele wird die sichtbare Geometrie nun zentral durch `insertionTargetGeometry()` bestimmt. Bei einem neuen Galerie-Bereich wird die tatsächliche MAIN-Grenze verwendet:

- vor einem Bereich: Oberkante des folgenden direkten MAIN-Kindes,
- zwischen Bereichen: Oberkante des folgenden beziehungsweise Unterkante des vorherigen direkten MAIN-Kindes,
- nach dem letzten Bereich: Unterkante des letzten direkten MAIN-Kindes.

Der Bearbeitungsbereich zeigt für diese Ziele eine orange Linie mit der Beschriftung `NEUER GALERIE-BEREICH`. Bestehende ROW-Ziele bleiben blau.

Neu: `tests/test-dev011-fix4-area-preview-marker.js`.

## FIX5 – Vollbreite orange Vorschau-Markierung

### Geänderte Datei

- `editor/integrations/grapesjs/grapesjs-adapter.js`

### Neue Datei

- `tests/test-dev011-fix5-full-width-area-preview-marker.js`

### Verhalten

Neue MAIN-Galeriebereiche erhalten im Bearbeitungsbereich keinen schmalen Container-Marker mehr. Stattdessen wird ein 38 Pixel hoher, orange hinterlegter Marker über die gesamte Breite des Editor-Viewports angezeigt. Seine Mitte liegt auf der tatsächlichen Einfügegrenze zwischen den direkten MAIN-Bereichen. Das Scrollziel berücksichtigt die Markerhöhe.

### Unverändert

- Blaue ROW-Vorschau innerhalb vorhandener Container
- Template-First-Struktur
- Bootstrap-Strukturverträge
- Repeat- und Synchronisationssperre


## FIX6 – sichtbarer orangefarbener Arbeitsbereichsmarker und Entfernung leerer Rest-Container

### Korrektur

Der im Dialog weiterhin sichtbare leere `CONTAINER-FLUID` war kein eigener Seitenbereich, sondern ein Rest der früheren containerinternen Leerbereichslogik. Container ohne direkte ROW werden deshalb nicht mehr als auswählbarer blauer Bereich ausgegeben.

Die orange MAIN-Vorschau wird nun ohne Verzögerung ausgelöst und als absoluter Overlay-Knoten direkt im Canvas-Dokument gerendert. Dadurch ist sie nicht mehr von `position: fixed` innerhalb der GrapesJS-Canvas-/Transformationsstruktur abhängig. Der Scrollstand wird in die reale Dokumentposition eingerechnet; der Marker reicht über die vollständige Breite des Arbeitsdokuments.

### Geänderte Dateien

- `editor/js/core/structure-insertion-target.js`
- `editor/integrations/grapesjs/grapesjs-adapter.js`
- `tests/run-tests.sh`
- `CHANGELOG_de.md`
- `DEV_011_IMPLEMENTATION_REPORT_de.md`

### Neue Datei

- `tests/test-dev011-fix6-visible-area-preview-and-no-empty-container.js`

### Erwartetes Ergebnis

- Kein leerer `CONTAINER` oder `CONTAINER-FLUID` ohne ROW erscheint mehr im Zieldialog.
- Beim Überfahren eines orangefarbenen MAIN-Einschubs erscheint sofort eine orange Vorschau über die volle Arbeitsbreite.
- Die Vorschau bleibt nach dem automatischen Scrollen exakt auf der späteren Einfügegrenze.
- Blaue ROW-Vorschauen bleiben unverändert.

## FIX7 – Ursachenbehebung

### Doppelter letzter Einschub

Die bisherige Darstellung blendete einen leeren Container zwar aus, behielt dessen `visualArea` jedoch in der Bereichssequenz. Dadurch entstanden direkt hintereinander die Grenzen „zwischen Bereich 6 und 7“ sowie „nach dem letzten Bereich“. FIX7 bildet die Dialogsequenz nun aus Bereichen mit mindestens einem tatsächlich sichtbaren Bootstrap-Ziel. Grenzen um ausgeblendete Leerbereiche werden zu genau einer sichtbaren Grenze zusammengeführt.

### Fehlende orange Vorschau im Canvas

Der orange Marker wurde zuvor absolut an das HTML-Wurzelelement des GrapesJS-Canvas angehängt. Abhängig vom Template-Body und dessen Stacking-Kontext konnte er hinter der Seite liegen. FIX7 hängt den Marker direkt an den Canvas-Body und positioniert ihn viewportbezogen mit `position: fixed`. Beim Scrollen und bei Größenänderungen wird die reale MAIN-Einfügegrenze erneut berechnet.

### Vertragslage

Keine produktive Repeat-Synchronisation und keine Änderungen an Resolver-, Dependency-Graph-, Action- oder Synchronisationsverträgen.

## FIX8 – Ursache der fehlenden orangefarbenen Canvas-Markierung

Die orangefarbenen Buttons referenzieren Ziele aus `model.areaSlots`. Der gemeinsame Event-Handler suchte die jeweilige `slotId` jedoch ausschließlich in `model.slots`, das nur die blauen ROW-Ziele enthält. Deshalb wurde beim Überfahren eines orangefarbenen Einschubs kein Ziel an `OluntirPreviewApi.showSlot()` übergeben. Das Scrollverhalten konnte dennoch sichtbar sein, weil es teilweise durch andere Auswahlabläufe ausgelöst wurde.

FIX8 löst Buttons nun in beiden Zielmengen auf:

- `model.slots` für blaue ROW-Einschübe
- `model.areaSlots` für orange MAIN-Einschübe

Zusätzlich entfernt `mouseleave` eine bereits aktive Vorschau über `preview.clear()` vollständig.

### Geänderte Dateien

- `editor/js/core/structure-insertion-target.js`
- `tests/run-tests.sh`
- `CHANGELOG_de.md`
- `DEV_011_IMPLEMENTATION_REPORT_de.md`

### Neue Datei

- `tests/test-dev011-fix8-area-slot-hover-resolution.js`

## DEV_011 FIX9 – Read-only-Vorschau unabhängig vom Einfügevertrag

### Ursache

Die orange Vorschau wurde bereits in `OluntirPreviewApi.showSlot()` verworfen, wenn die strenge produktive MAIN-Zielvalidierung fehlschlug. In realen Template-Varianten sind die sichtbaren Bereichsanker auflösbar, während der vollständige MAIN-Einfügevertrag in dieser Phase nicht immer auflösbar ist. Deshalb wurden weder Scrollen noch Markierung ausgeführt.

### Umsetzung

- neuer Read-only-Vertrag `OluntirDocumentApi.canPreviewTarget()`
- neuer Adaptervertrag `canPreviewInsertionTarget()`
- eigener `resolvePreviewInsertionTarget()` mit sicherer Ankerauflösung für orange MAIN-Grenzen
- Scrollen und Markieren verwenden die Read-only-Vorschauauflösung
- produktives Einfügen verwendet unverändert ausschließlich `resolveInsertionTarget()` und dessen strenge MAIN-Validierung

Damit wird keine Einfüge- oder Synchronisationslogik gelockert.

### Test

`tests/test-dev011-fix9-preview-resolution-independent-of-insert.js`

Erwartet wird, dass orange Bereichsziele als Read-only-Vorschau auflösbar sind, ohne den produktiven Einfügevertrag zu umgehen.

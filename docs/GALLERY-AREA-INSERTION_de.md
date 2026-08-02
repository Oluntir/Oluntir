
## Ziel


## Strukturvertrag

Der Vorgang erzeugt ausschließlich:

```html
<section data-oluntir-layout-area="gallery">
  <div class="container|container-fluid">
    <div class="row pb-gallery">…Galerie…</div>
  </div>
</section>
```

Bootstrap bleibt Eigentümer der sichtbaren Struktur. Oluntir ergänzt nur das Metadatum `data-oluntir-layout-area="gallery"`.

## Zielermittlung

Ein Galerie-Bereichs-Slot besitzt folgende Eigenschaften:

- `slotKind: new-gallery-area`
- `actionKind: new-area`
- `structureScope: main`
- `structureKind: section-container-row-gallery`
- `parentIdentity`: die tatsächliche MAIN-Struktur
- optional `anchorIdentity`: ein direkter SECTION-/CONTAINER-Knoten von MAIN

Nur direkte `SECTION`, `CONTAINER` und `CONTAINER-FLUID` unter `MAIN` bilden die Bereichsfolge. Beliebige Texte, Skripte oder tief verschachtelte Elemente erzeugen keine Einschübe.

## Laufzeitvalidierung

Vor dem Einfügen wird erneut geprüft:

1. Das Ziel gehört zur aktuellen Seite.
2. Der Ziel-Elternknoten ist weiterhin `MAIN`.
3. Ein Anker ist weiterhin ein direktes Kind dieses MAIN-Knotens.
4. Die Position `before`, `after` oder `inside-end` ist weiterhin gültig.

Damit kann ein inzwischen verschobener oder gelöschter Bereich nicht versehentlich zu einer SECTION innerhalb eines Containers führen.

## Nicht verändert

- bestehende ROW-Slots in vorhandenen Containern
- Template-First-Semantik
- Bootstrap-ROW-Erkennung
- Galerie-Preview und Viewer-Optionen
- Export-, Shared-Content-, Repeat- und Project-Store-Pfade
- keine produktive Synchronisationslogik

## Tests

`tests/test-dev011-gallery-main-area-insertion.js` prüft Bereichsfilterung, Slotvertrag, erzeugte Bootstrap-Struktur, MAIN-Laufzeitvalidierung und den Auswahldialog.

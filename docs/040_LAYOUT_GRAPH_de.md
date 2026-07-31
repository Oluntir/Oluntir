# Layout-Graph

Oluntir 1.2.1 bildet die Seitenstruktur tolerant als Page → Section → Row → Slot → Component ab. Der Graph wird aus dem GrapesJS-Komponentenbaum abgeleitet und ersetzt ihn nicht. Fehlende Ebenen sind zulässig. Bootstrap-Klassen `.row` und `col-*` werden erkannt, ohne Klassen oder Markup zu verändern.

Persistente Beziehungen liegen als interne `data-oluntir-*-id`-Attribute auf GrapesJS-Komponenten. Die Page-ID wird zusätzlich als `oluntirPageId` am GrapesJS-Seitenmodell gespeichert. Das Canvas-DOM bleibt ausschließlich eine gerenderte Ansicht.

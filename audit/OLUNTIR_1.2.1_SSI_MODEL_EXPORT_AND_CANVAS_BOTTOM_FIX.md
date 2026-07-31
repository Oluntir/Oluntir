# Oluntir 1.2.1 – SSI model export and canvas bottom fix

## Fehlerbild

- Bestehende Projekte konnten im SSI-Export eine falsche Reihenfolge, fehlende Inhalte oder zusätzliche Strukturen erzeugen.
- Im HTML-Export konnte eine editorseitige Row/Spalte erscheinen.
- Am unteren Ende hoher Seiten war die Einfügeposition für Footer oder weitere Elemente trotz Scrollbar nicht zuverlässig erreichbar.

## Ursachen

1. `export.js` verwendete das gerenderte Canvas-DOM als primäre Exportquelle.
2. `includes.js` entfernte pauschal alle `header`, `nav` und `footer` und setzte Shared-Bereiche anschließend neu zusammen.
3. Zugeordnete Shared Sections wurden pauschal vor den individuellen Seiteninhalt gestellt.
4. Das Canvas besaß keinen ausreichend großen, innerhalb des Iframes scrollbar erreichbaren unteren Arbeitsbereich.

## Umsetzung

- Exportquelle auf das persistente GrapesJS-Modell (`editor.getHtml()`) zurückgestellt.
- Bild- und Textänderungen werden vor dem Export weiterhin gezielt in das Modell synchronisiert.
- Header, Navigation, Footer und Shared Sections werden nur an exakt vorhandenen Modellpositionen ersetzt.
- Keine globale Entfernung semantischer Elemente und kein Voranstellen von Shared Sections.
- Editorinterner unterer Arbeitsbereich mit zusätzlichem Canvas-Boden und Main-Einfügefläche; nicht Bestandteil des Exports.

## Tests

- JavaScript-Syntaxprüfung erfolgreich.
- GrapesJS-Adaptertest erfolgreich.
- Layout-Identity-Test erfolgreich.
- Strukturprüfung für Bootstrap 4 und Bootstrap 5 erfolgreich.

## Manueller Regressionstest

1. Bestehendes `.oluntir`-Projekt öffnen.
2. HTML exportieren und auf unerwünschte zusätzliche Row/Spalte prüfen.
3. SSI exportieren und Reihenfolge von Header, Navigation, normalem Inhalt, Shared Sections und Footer vergleichen.
4. Eine lange neue Seite erstellen, bis die Monitorhöhe überschritten ist.
5. Bis unter die letzte Row scrollen und dort Footer beziehungsweise weiteres Element ablegen.

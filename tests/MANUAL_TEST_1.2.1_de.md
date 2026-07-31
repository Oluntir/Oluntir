# Manueller Testablauf Oluntir 1.2.1

1. Ein bestehendes 1.2.0-Projekt mit mindestens zwei Seiten, Header, Navigation, Footer, Shared Content, normalem Inhalt vor und nach Shared Content sowie Bildern öffnen.
2. Ohne Bearbeitung Sichtdarstellung mit 1.2.0 vergleichen.
3. Projekt als `.oluntir` speichern, schließen, erneut öffnen und Darstellung sowie Reihenfolge vergleichen.
4. Eine Card kopieren, speichern und erneut öffnen. Original und Kopie müssen erhalten bleiben.
5. HTML, SSI und PHP jeweils als ZIP exportieren.
6. Prüfen: Header/Footer-Reihenfolge, Include-Positionen, keine doppelten Shared-Inhalte, keine leeren Restcontainer, keine `data-oluntir-*-id`-Attribute im Export.
7. Den Ablauf mit Bootstrap 4 und Bootstrap 5 wiederholen.
8. In der Browserkonsole Repeat Engine V2 mit einer ausgewählten Komponente definieren und auf eine Zielseite anwenden; beim zweiten Anwenden darf keine zweite identische Row entstehen.

## Erwartetes Ergebnis

Alle sichtbaren Funktionen von 1.2.0 bleiben erhalten. Interne IDs persistieren ausschließlich im Projektmodell. HTML, SSI und PHP entsprechen strukturell dem 1.2.0-Vertrag. Die Zielauflösung der Repeat Engine arbeitet über Page- und Komponentenidentitäten.

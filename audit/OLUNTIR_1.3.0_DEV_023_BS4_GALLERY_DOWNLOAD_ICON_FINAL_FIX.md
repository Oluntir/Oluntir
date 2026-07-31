# Oluntir 1.3.0 DEV_023 – BS4 Gallery Download Icon Final Fix

## Fehlerbild

Bei Galerien, die über die obere Werkzeugleiste eingefügt wurden, war das Zoom-Symbol sichtbar, das Download-Symbol jedoch weiterhin leer.

## Ursache

Die bisherige Download-Geometrie hing weiterhin an der Klasse `portfolio-download` und an mehreren zusammengesetzten CSS-Verläufen. In der realen GrapesJS-Laufzeit blieb zwar das rechte Aktionselement erhalten, die zusammengesetzte Darstellung wurde jedoch nicht zuverlässig gerendert.

## Korrektur

Der Download-Button wird zusätzlich als letztes Aktionselement innerhalb von `.pb-gallery-actions` angesprochen. Der Pfeil wird als Unicode-Pfeil und die Ablage als einfache Rahmengeometrie dargestellt. Damit sind weder SVG, PNG, Masken, Icon-Fonts noch verschachtelte Kind-Elemente erforderlich.

Die bestehende Download-Funktion, Pfade, Attribute und Exportlogik wurden nicht verändert.

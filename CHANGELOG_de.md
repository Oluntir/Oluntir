# Changelog

## 1.3.1 — 02.08.2026

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

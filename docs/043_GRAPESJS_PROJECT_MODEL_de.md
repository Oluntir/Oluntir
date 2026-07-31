# GrapesJS-Projektmodell

Persistente Quelle ist `editor.getProjectData()`. Seiten stammen aus `editor.Pages`; jede Seite besitzt eine Hauptkomponente und einen Komponentenbaum. Oluntir ergänzt ein Metadatenobjekt `oluntir` mit Projekt-, Layout-Identity- und Repeat-Engine-Schema-Version. Darunter werden Wiederholungsdefinitionen gespeichert.

Speichern und portable `.oluntir`-Sicherung ergänzen die Metadaten erst nach Übernahme der Canvas-Assetreferenzen. Beim Laden werden Repeat-Metadaten importiert und anschließend fehlende Identitäten additiv migriert.

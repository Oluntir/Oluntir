# Mehrmonitor-Arbeitsbereich

## Modi

- `ask`: Startauswahl anzeigen;
- `single`: alle Bedienelemente im Hauptfenster;
- `dual`: separates Werkzeugfenster bevorzugen.

Die Präferenz wird in IndexedDB gespeichert. Der tatsächlich aktive Modus ist sitzungsabhängig und kann auf Ein-Monitor zurückfallen, ohne die Zwei-Monitor-Präferenz zu löschen.

## Werkzeugfenster

Im Hauptfenster bleibt der GrapesJS-Canvas. Das Werkzeugfenster enthält die vollständige rechte GrapesJS-Spalte, die Oluntir-Schnellbearbeitung sowie beide getrennten Repeat-Werkzeuge für Quelle und Bibliothek. Schaltflächen lagern die Spalte aus, öffnen oder fokussieren das Werkzeugfenster erneut und holen alle Werkzeuge zurück.

## Sicherheitsverhalten

Oluntir stellt die Werkzeuge im Hauptfenster wieder her, wenn das Werkzeugfenster tatsächlich geschlossen wird. Verschieben oder Größenänderung gelten nicht als Schließen. Ungültige gespeicherte Koordinaten werden verworfen. Ohne Window Management API bleibt die Positionierung manuell.

## Fehlerbehebung

- Pop-up blockiert: Pop-ups für die lokale Oluntir-Seite erlauben und die Schaltfläche erneut verwenden.
- Nur ein Bildschirm verfügbar: Oluntir startet sicher im Ein-Monitor-Modus und behält die Zwei-Monitor-Präferenz.
- Werkzeugfenster außerhalb des sichtbaren Bereichs: Rückruf-Schaltfläche verwenden; Oluntir prüft und ersetzt unbrauchbare Fenstergrenzen.

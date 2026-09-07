# Repeat Engine V2 – Oluntir 2.2.1

`editor/js/core/repeat-engine-v2.js` verwaltet Repeat-Familien über stabile Oluntir-Identitäten. DOM-Positionen, CSS-Selektoren und eine Änderung der `unitId` dienen nicht als Identität.

## Zentrale Repeat-Bibliothek

2.2.1 ersetzt die permanente Live-Synchronisation beim Tippen durch ein zentrales Oluntir-Modell:

1. Ein wiederholbarer Bereich wird einmal als benannte Repeat-Familie angelegt.
2. Alle Vorkommen auf Projektseiten sind materialisierte Instanzen dieser Familie.
3. Direkte Inhaltsbearbeitung auf den Seiteninstanzen ist gesperrt.
4. Die zentrale Bearbeitung öffnet einen internen, nicht persistierten GrapesJS-Arbeitsbereich, der nur den gewählten Repeat-Entwurf enthält.
5. Änderungen bleiben zunächst im Draft. Erst **„Auf alle Vorkommen anwenden“** startet eine Oluntir-Transaktion und schreibt den veröffentlichten Snapshot in alle aktiven Instanzen.

GrapesJS dient damit weiterhin als visueller Editor und Komponentenmodell, kennt aber nicht das projektweite Repeat-Netzwerk. Definition, Vorkommen, Revisionen, Draft/Published-Snapshots und Transaktionen gehören Oluntir.

## Projektweite Liste

Die Repeat-Bibliothek zeigt je Familie:

- verständlichen Namen;
- alle Seiten, auf denen die Familie eingesetzt ist;
- Anzahl der Vorkommen;
- veröffentlichte Revision;
- Hinweis auf noch nicht verteilte Draft-Änderungen.

Aus derselben Liste kann eine Familie zentral bearbeitet oder über **Quelle → Zielseite → Einfügeposition → Bereich einsetzen** zusätzlich materialisiert werden.

## Canvas-Steuerung

Auf normalen Projektseiten erscheint bei Mouseover oben mittig eine orange Oluntir-Steuerleiste. Sie bietet:

- **Bearbeiten** – öffnet die zentrale Repeat-Bearbeitung;
- **Entfernen** – entfernt nur dieses Vorkommen und aktualisiert die Verwendungsliste.

Header, Navigation und Footer werden nicht als Repeat gekennzeichnet; sie bleiben ausschließlich Shared Content.

## Entfernen und Undo/Redo

Das Entfernen einer Instanz ist eine Oluntir-Transaktion. Gespeichert werden Definition, Instanz-ID, Seite, Elternidentität, Einfügeindex und Rollback-Snapshot. Dadurch kann die Repeat-Verwaltung das Vorkommen inklusive Registereintrag wiederherstellen und erneut entfernen. Publikationsvorgänge besitzen ebenfalls einen begrenzten Repeat-History-Stack.

## Persistenz und bestehende Projekte

Bestehende 2.1.0-BETA-/Alpha-Projekte werden beim Laden weiterhin über vorhandene Oluntir-Korrelationsmarker hydriert. Beim ersten 2.2-Lauf wird aus der bisherigen Quelle ein zentraler Published-Snapshot aufgebaut; das bisherige Quellvorkommen wird wie alle anderen Seitenvorkommen als Instanz registriert. Eindeutige stabile IDs bleiben erhalten. Bei Mehrdeutigkeit wird keine Bindung geraten.

Der interne Arbeitsbereich `oluntir-repeat-workspace` wird vor dem Speichern und Export aus den GrapesJS-Projektdaten entfernt. Der Draft selbst liegt im Oluntir-Repeat-Zustand.

## Performance-Modell

Während der zentralen Bearbeitung findet keine projektweite Repeat-Verteilung statt. Dadurch erzeugt jeder Tastendruck nur Änderungen am einzelnen Draft-Canvas. Der teurere Komponentenabgleich erfolgt kontrolliert einmal beim Publizieren. Das reduziert die bisher nahezu linear mit der Anzahl der Repeat-Vorkommen steigende Live-Last.

Zusätzlich besitzt jede materialisierende Repeat-Aktion (`publish`, Publish-Undo/Redo, Instanz einsetzen/entfernen und Remove-Undo/Redo) einen kurzlebigen Oluntir-Projektmutationskontext. Solange dieser Kontext aktiv ist, ignoriert der Shared-Content-Manager ausschließlich die intern erzeugten GrapesJS-`component:add`-/`component:remove`-Ereignisse. Dadurch führt ein Repeat-Publish nicht noch einmal indirekt zu einem projektweiten Header/Nav/Footer-Sicherheitslauf. Normale strukturelle Benutzerereignisse und direkte Shared-Content-Updates werden nicht unterdrückt.

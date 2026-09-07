# Oluntir 2.2.0 BETA – Bootstrap-Teststand

Dieser eigenständige Teststand basiert auf dem DEV030-Konsolidierungspaket.
Als konkrete Frameworkprofile sind ausschließlich Bootstrap 4.6.2 und
Bootstrap 5.3.8 enthalten.

## Start

1. Das vollständige Archiv entpacken.
2. `Start-Oluntir-API-Analyzer.cmd` starten, sofern der lokale Analyzer
   benötigt wird.
3. `index.html` in einem aktuellen Chromium-basierten Desktop-Browser öffnen.
4. Im Framework-Menü Bootstrap 4 oder Bootstrap 5 auswählen.

## Import-Test

Source Packages werden über die lokale API importiert. Verfügbar sind:

- `+ Source-Ordner` für einen lokalen Ordner;
- `+ Source-Archiv` für ZIP, TAR, TAR.GZ oder TGZ;
- `+ Source-URL` für einen Downloadlink, der standardmäßig über die lokale API
  geladen wird;
- `+ Recovery-JSON` zur Wiederherstellung eines beschädigten oder fehlenden
  Source-Bestands.

Nach einem Import wird je Paket ein eigener Source-Ordner einschließlich
`source-recovery.json` angelegt. Die Analyse erzeugt ein source-gebundenes
Profil; es wird nicht für andere Packages wiederverwendet.

## Prüfschritte

1. Bootstrap 4 und Bootstrap 5 jeweils separat auswählen.
2. Prüfen, dass der Arbeitsbereich initialisiert wird und die vorhandenen
   GrapesJS-Funktionen sichtbar bleiben.
3. Source-Import durchführen und prüfen, dass die quellengebundenen Blöcke im
   BlockManager erscheinen.
4. Einen Block bewusst per Drag & Drop einfügen.
5. Export als Ordner, ZIP und TAR prüfen. Der Export muss das aktuell gewählte
   Bootstrap-Profil und dessen Pfade verwenden.
6. Einen Frameworkwechsel auslösen. Vor dem Wechsel muss gespeichert und
   bestätigt werden; bei Abbruch bleibt das bisherige Profil aktiv.

## Sicherheits- und Funktionsgrenzen

- Nicht-Bootstrap-Sources werden nicht als produktives Editorprofil aktiviert.
- Importierte Source-Scripte werden nicht automatisch ausgeführt.
- Automatische Source-Package-Dokumentmutation bleibt deaktiviert.
- Wiederholbare Bereiche werden in 2.2.0 BETA **zentral** verwaltet; Seiteninstanzen sind materialisiert und dort gegen direkte Inhaltsbearbeitung gesperrt.
- Es gibt keine projektweite Repeat-Verteilung bei jedem Tastendruck. Änderungen werden erst mit **„Auf alle Vorkommen anwenden“** publiziert.
- Die Repeat-Bibliothek zeigt alle Familien, verwendete Seiten, Vorkommen und Revisionen.
- Orange Mouseover-Steuerungen auf Seiteninstanzen öffnen die zentrale Bearbeitung oder entfernen genau dieses Vorkommen.
- Publish und Entfernen besitzen eine eigene Repeat-Undo/Redo-Historie.
- Shared Content für Header, Navigation und Footer arbeitet weiterhin bidirektional und bleibt außerhalb des Repeat-Systems.

## Bestehendes Projekt / Repeat-Recovery

1. Ein bereits gespeichertes Projekt mit vorhandenen Repeat-Vorkommen öffnen.
2. Im Startdialog muss ein älterer Metadatenstand als Übernahme auf **2.2.0 BETA** gekennzeichnet werden; nach dem ersten Öffnen/Speichern muss 2.2.0 BETA persistiert sein.
3. Die zentrale Repeat-Bibliothek öffnen. Vorhandene Repeat-Familien müssen wieder gelistet werden.
4. Falls die zentrale Repeat-Metadatenstruktur absichtlich fehlt, müssen Familien und Instanzen anhand der stabilen Seitenmarker rekonstruiert werden; Header/Nav/Footer dürfen nicht als Repeat-Familie auftauchen.
5. Projekt erneut schließen und öffnen: die rekonstruierte Bibliothek muss persistent erhalten bleiben.

## Repeat-Test 2.2.0 BETA

1. Im Werkzeug **Wiederholbare Bereiche** einen Bereich auswählen, benennen und als Repeat-Familie anlegen.
2. Die Familie über Zielseite → Einfügeposition → bestätigtes Canvas-Ziel auf mehreren Seiten einsetzen.
3. Repeat-Bibliothek öffnen: Oben müssen **„Repeat-Bibliothek“** und der Untertitel **„Anpassung bei Auswahl“** erscheinen. Die kompakte Scrollliste muss alle Familien mit Seitenverwendung/Vorkommen/Revision zeigen. Die Schalter **„Zuletzt angelegt“** und **„A–Z“** müssen die Reihenfolge umstellen; **„Gesamtliste erweitern“** muss den Scrollbereich vergrößern. Pro Eintrag darf oben nur **„Zentral bearbeiten“** angeboten werden.
4. Auf einer normalen Seite prüfen, dass der Repeat-Inhalt nicht direkt bearbeitet werden kann und bei Mouseover oben mittig die orange Steuerleiste erscheint.
5. **Bearbeiten** öffnen: Es darf nur der gewählte Repeat im internen Einzelobjekt-Canvas bearbeitet werden. Während des Tippens dürfen die Seiteninstanzen unverändert bleiben.
6. Ohne den Workspace manuell zu schließen über die normale Seitenauswahl auf eine Projektseite wechseln. Die Zielseite muss sofort im allgemeinen Canvas erscheinen; im Repeat-Log muss vorher `repeat.library-workspace-handoff` und anschließend `repeat.library-editor-closed` erscheinen. Es darf kein `getAttributes`-Fehler auftreten.
7. **„Auf alle Vorkommen anwenden“** auslösen: Alle aktiven Instanzen müssen anschließend denselben veröffentlichten Stand besitzen.
8. Auf einer Seiteninstanz **Entfernen** auslösen: Nur dieses Vorkommen muss verschwinden und die Verwendungsliste muss aktualisiert werden.
9. Repeat-**Undo** prüfen: das entfernte Vorkommen muss an Seite und Position wiederhergestellt werden. Repeat-**Redo** muss es erneut entfernen.
10. Im unteren Bereich **„Bereich aus Bibliothek einsetzen“** muss der Untertitel **„Auswahl Repeat und bei Ziel einfügen“** erscheinen. Eine Familie dort aus der eigenen kompakten Liste auswählen, Zielseite und Einfügeposition wählen und die orange Zielposition bestätigen. Beim Seitenwechsel muss die Bibliothek geöffnet bleiben; Familienauswahl und Zielseite müssen erhalten bleiben. Danach muss **„Bereich einsetzen“** aktiv sein. Im zentralen Bearbeitungsbereich darf kein eigener Button **„Auf Seite einsetzen“** mehr vorhanden sein.
11. Im zentralen Bearbeitungsbereich müssen Repeat-Undo, Repeat-Redo und **Entwurf verwerfen** als Icons erscheinen; **„Auf alle Vorkommen anwenden“** und **„Zur Seitenansicht zurück“** bleiben als Textaktionen.
12. Browser schließen und neu öffnen: Bibliothek, Published/Draft-Stand, Seitenverwendungen und Instanzzuordnungen müssen erhalten bleiben.

## Globales Undo / Open Blocks

1. Auf einer normalen Projektseite den Bereich **Blocks** öffnen und einen Block einfügen oder eine andere Undo-fähige Änderung erzeugen.
2. In der oberen Oluntir-Leiste **Undo** auslösen.
3. Danach **Open Blocks** erneut anklicken. Der BlockManager muss sichtbar werden und seine Blöcke erneut rendern.
4. Dasselbe mit **Redo** wiederholen.
5. Optional nacheinander Styles, Eigenschaften, Ebenen und Blocks öffnen, jeweils Undo/Redo auslösen und prüfen, dass die zuvor aktive rechte Ansicht wiederhergestellt wird.
6. Im Action-Log dürfen `panel.view-restored` bzw. `panel.blocks-opened` erscheinen; es darf kein dauerhaft hängender `open-blocks`-Command zurückbleiben.

## Performance-Prüfung

1. Eine Repeat-Familie mit mehreren Vorkommen zentral öffnen und mehrere Textänderungen ausführen.
2. Während der Eingabe dürfen keine projektweiten Repeat-Publish-Läufe entstehen.
3. Erst beim Publish dürfen die Zielinstanzen mutiert werden.
4. Im Repeat-Log muss die Publish-Transaktion mit `repeat.library-project-mutation-begin` / `repeat.library-project-mutation-end` gekapselt sein. Wenn die Materialisierung strukturelle GrapesJS-Events erzeugt, zeigt `suppressedSharedStructuralEvents`, wie viele davon nicht erneut in den Shared-Content-Strukturwatcher gelangten.
5. Im Shared-Content-Log darf derselbe Repeat-Publish keinen zusätzlichen projektweiten Header/Nav/Footer-Flush nur aufgrund dieser internen Add/Remove-Ereignisse auslösen.
6. Direkt danach Navigation oder Footer normal bearbeiten und zwischen Seiten wechseln. Die bidirektionale Shared-Content-Übernahme muss weiterhin funktionieren.
7. CPU/Komponentenereignisse für 4, 8 und mehr Vorkommen protokollieren, um die neue Publish-Kostenkurve zu vermessen.

## Video-Test Bootstrap 4 / Bootstrap 5

1. Bootstrap 4 auswählen und **Video (HTML5)** aus `BS4 · Content` einsetzen. Der Rahmen muss `embed-responsive embed-responsive-16by9` verwenden.
2. Das Video auswählen und in **Eigenschaften** getrennte Felder für WebM, MP4 und Ogg sowie Poster, Vorladen, Steuerung, Stumm, Autoplay und Wiederholen prüfen.
3. Mindestens MP4 und WebM auf existierende Testdateien/Pfade setzen. Wiedergabe im Canvas prüfen.
4. Eine Quelle absichtlich ungültig setzen. Der Browser muss zur nächsten unterstützten `<source>`-Quelle wechseln; der sichtbare Download-Link muss auf die bevorzugte MP4-Quelle zeigen.
5. Bootstrap 5 auswählen und denselben Test mit **Video (HTML5)** aus `BS5 · Content` durchführen. Der Rahmen muss `ratio ratio-16x9` verwenden und darf keine BS4-`embed-responsive`-Klasse enthalten.
6. Export prüfen: `<video>`, die drei `<source>`-Elemente, Poster, `controls`, `preload="metadata"`, `playsinline` und Download-Fallback bleiben erhalten; die editorinternen `data-oluntir-video-*`-Attribute dürfen im finalen HTML nicht enthalten sein.

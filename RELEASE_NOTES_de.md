# Release Notes – Oluntir 2.2.1

- Werkzeugleiste bereinigt: der redundante GrapesJS-Import/Download-Button zwischen Redo und Löschen wurde entfernt; der Oluntir-Ordnerexport bleibt erhalten.
Oluntir 2.2.1 ist der aktuelle Bootstrap-fokussierte Release-Linie auf Basis von 2.1.0 BETA.

## 2.2.1 – wichtigste Änderungen

- Repeat-Zielauswahl erweitert: Auch Top-Level-Inhaltsbereiche außerhalb von `<main>` können als gültige Grenzen dienen. Damit ist z. B. das Einsetzen zwischen einem eigenständigen Hero und dem Shared Footer möglich; Header/Nav/Footer bleiben ausgeschlossen.
- Export-Werkzeuge: Die Archivsymbole tragen jetzt kleine **ZIP**-/ **TAR**-Badges.
- Repeat-Bibliothek: Untertitel oben lautet jetzt **„Bereich zentral bearbeiten“**.
- Bootstrap-Abdeckung ergänzt: BS4 bietet zusätzlich Jumbotron, Media object und Custom forms als echtes Framework-Markup. Der Analyzer unterscheidet BS4/BS5 strenger über Versions-, Data-API- und Klassenevidenz und erkennt mehr quellengebundene Bootstrap-Komponenten.
- Video-Unterstützung ergänzt: BS4 und BS5 erhalten jeweils einen nativen responsiven HTML5-Videoblock mit WebM/MP4/Ogg-Quellen, Poster, Inline-Wiedergabe und sichtbarem Download-Fallback. GrapesJS zeigt für diese Blöcke getrennte Quellpfade statt nur eines einzelnen `src`-Felds.
- Repeat-Bibliothek neu geordnet: oben **„Repeat-Bibliothek – Bereich zentral bearbeiten“** mit kompakter Scrollliste und den Sortierschaltern **„Zuletzt angelegt“ / „A–Z“**; darunter **„Bereich aus Bibliothek einsetzen – Auswahl Repeat und bei Ziel einfügen“** mit eigener kompakter Auswahlliste. Der zentrale Bearbeitungsbereich nutzt Icons für Undo/Redo/Entwurf verwerfen; „Auf Seite einsetzen“ und die oberen zeilenweisen „Einsetzen“-Buttons wurden entfernt.
- Globales Undo/Redo normalisiert jetzt den GrapesJS-View-/Commandzustand der rechten Werkzeugleiste. Dadurch bleibt **Open Blocks** nach Undo/Redo erneut zuverlässig aufrufbar; der BlockManager wird beim Öffnen explizit neu gerendert.

- Der zentrale Repeat-Draft übernimmt keine Sperrflags materialisierter Seiteninstanzen mehr. Text kann wieder per RTE bearbeitet werden; Auswahl, Styling und die normalen blauen GrapesJS-Komponentenwerkzeuge sind im Einzelobjekt-Canvas aktiv.

- Der Einsetz-Workflow der Repeat-Bibliothek bleibt jetzt über normale Seitenwechsel erhalten: Bibliotheksfenster, gewählte Familie und Zielseite werden nicht mehr zurückgesetzt; nach der orange bestätigten Position wird „Bereich einsetzen“ zuverlässig aktiv.
- Bestehende Projekte mit verlorenen/unvollständigen Repeat-Metadaten werden aus den auf den Seiten vorhandenen stabilen Repeat-Familienmarkern rekonstruiert; die zentrale Bibliothek bleibt damit nach Projektübernahme nutzbar.
- Die Startansicht kennzeichnet ältere gespeicherte Versionsmetadaten als Übernahme auf 2.2.1 und schreibt anschließend den aktuellen Stand zurück.

- Neue **zentrale Repeat-Bibliothek** mit vollständiger Projektliste und Seitenverwendung je Repeat-Familie.
- Repeat-Inhalte werden auf normalen Seiten nicht mehr live bei jeder Eingabe synchronisiert. Direkte Inhaltsbearbeitung der materialisierten Instanzen ist gesperrt.
- Zentrale Bearbeitung erfolgt in einem internen Einzelobjekt-Canvas; Draft-Änderungen werden erst über **„Auf alle Vorkommen anwenden“** verteilt.
- Beim Publizieren aktualisiert Oluntir Quelle/alle Vorkommen in einer kontrollierten Transaktion; GrapesJS verwaltet nicht das projektweite Repeat-Netzwerk.
- Orange Mouseover-Steuerleiste oben mittig an jedem Repeat-Vorkommen mit **Bearbeiten** und **Entfernen**. Header/Nav/Footer bleiben Shared Content und erhalten keine Repeat-Steuerung.
- Entfernen eines einzelnen Vorkommens aktualisiert die zentrale Verwendungsliste und ist über Repeat-Undo/Redo wiederherstellbar; auch Publish-Transaktionen werden im Repeat-History-Stack geführt.
- Bestehende Projekte werden beim ersten 2.2-Lauf aus den vorhandenen stabilen Oluntir-Korrelationen in das zentrale Published/Draft-Modell überführt.
- Der temporäre Repeat-Arbeitsbereich wird vor Persistenz und Export aus den GrapesJS-Seiten entfernt.
- Performance-Isolation: intern erzeugte `component:add`-/`component:remove`-Ereignisse einer kontrollierten Repeat-Projektmutation lösen keinen zusätzlichen Shared-Content-Projektscan mehr aus. Direkte Header/Nav/Footer-Änderungen sowie normale strukturelle Benutzeraktionen bleiben unverändert überwacht.
- Der zentrale Repeat-Arbeitsbereich wird beim Seitenwechsel nicht mehr als aktive GrapesJS-Seite entfernt: Oluntir selektiert zuerst die Zielseite, löscht danach den Workspace und überspringt für diesen Übergang die normale Seiten-Commit-Transaktion.
- Fehlerhinweise bleiben länger sichtbar (12 Sekunden), damit technische Meldungen vollständig gelesen werden können.

## Historische Alpha-Änderungen seit 1.3.1

- portable Windows-x64-Node.js-Runtime 24.18.0 und lokale Analyzer-API;
- universeller Source-Package-Import für Ordner, ZIP, TAR, TAR.GZ/TGZ,
  Browser-Dateien und URLs über die lokale API;
- eigene Source-Ordner je Paket, Manifeste, SHA-256-Inventare und Recovery-JSON;
- statische HTML-, CSS- und JavaScript-Analyse mit OIR-, Evidenz- und
  Capability-Manifesten;
- quellengebundene Bootstrap-Profile, Übersetzungsmatrix und JavaScript-
  Behavior-Resolver;
- kontrollierte GrapesJS-Bridge für auswählbare Source-Strukturen;
- Bootstrap-Support-Gate: Bootstrap 4/5 sind konkrete Profile, unbekannte
  Sources bleiben `analysis-only`;
- frameworkeigene Galeriestrukturen, Bild-Lightbox, Vorschauverbesserungen und
  Export-Regression-Fixes.

Die Ausführung importierter JavaScript-Quellen bleibt deaktiviert. Explizit
definierte Repeat-Bereiche werden produktiv über stabile Identitäten eingesetzt
und synchronisiert; Header, Navigation und Footer laufen ausschließlich über
den Shared Content Manager.

## 2.0 Alpha – DEV_022/DEV_023

Der Alpha-Entwicklungsstand ergänzt den universellen Source-Package-Import.
Framework- und Templatequellen können über die lokale API aus Ordnern,
Archiven oder Download-URLs importiert, analysiert und über die bestehende
Framework-Auswahl mit dem Frontend verbunden werden. Für jedes Paket wird eine
vollständige `source-recovery.json` erzeugt.

Die Aktivierung bleibt auf die ausgewählte Ressourcenbindung begrenzt.
DEV_023 ergänzt erkannte, quellengebundene HTML-Strukturen als auswählbare
GrapesJS-Blöcke. Lokale Asset-Referenzen werden über die lokale API bedient.
Automatische Dokumentmutation und Repeat-Synchronisation sind weiterhin nicht
freigegeben.

## Wichtigste Änderungen

- stabilere Persistenz gemeinsamer Header-, Navigations- und Footer-Bereiche;
- projektweite Schnellbearbeitung ohne erneuten Aufbau der Navigation;
- Übertragung von Text, Schriftgröße und expliziten Darstellungswerten in den Export;
- Undo und Redo für Text- und Bildänderungen;
- neue Galerie-Einschübe zwischen vollständigen Seitenbereichen;
- zuverlässigere Export-Snapshots und responsive Bildausgabe;
- konsolidierte Framework- und Iconquellen für Bootstrap 4 und 5;
- produktive Repeat-Bereiche mit Zielauswahl, Clear-/Rücksetzablauf,
  strukturellen Einfügepositionen und persistenter Instanzverknüpfung.

## Kompatibilität

Bestehende Projekte werden weiterhin über die vorhandenen Migrations- und Identity-Routinen geladen. Vor größeren Änderungen wird eine portable Projektsicherung empfohlen.

## Bekannte Einschränkung

Eine explizit gesetzte Footer-Schriftfarbe kann in der Arbeitsansicht von der exportierten Darstellung abweichen. Der Export übernimmt den ausdrücklich gewählten Wert korrekt.

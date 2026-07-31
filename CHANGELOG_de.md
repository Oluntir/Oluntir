# Änderungsprotokoll

## Unveröffentlicht

- Regression behoben: Beim Austausch eines Card-Bildes wird nur noch die zugehörige GrapesJS-Bildkomponente aktualisiert; die Card-Struktur bleibt vollständig greifbar und responsive.

- Neue Grid-Bilder werden nach der Auswahl zuverlässig aus dem Canvas in das GrapesJS-Komponentenmodell übernommen und bleiben nach erneutem Öffnen erhalten.
- Das Schnellwerkzeug im zweiten Monitor besitzt einen scrollbaren Inhaltsbereich; Kopfbereich und Aktionsbuttons bleiben erreichbar.


> **Sprache:** Deutsch · [English (reference)](CHANGELOG.md)

## Oluntir 1.2.0 — 30.07.2026

### Mehrmonitor-Arbeitsbereich

- Startauswahl für Ein- oder Zwei-Monitor-Betrieb mit Stabilitäts- und Pop-up-Hinweis ergänzt.
- IndexedDB-basierte Workspace-Einstellungen für bevorzugten Modus, Startauswahl, Fenstergrenzen und Wiederherstellung eingeführt.
- Eigenes Werkzeugfenster mit vollständiger rechter GrapesJS-Spalte und beiden Oluntir-Schnellbearbeitungsbereichen ergänzt.
- Werkzeugleisten-Schaltflächen zum Auslagern, Zurückrufen, Fokussieren und Zurückholen der Werkzeugspalte ergänzt.
- Sicherer Fallback für blockierte Pop-ups, geschlossene Fenster, nicht verfügbare Bildschirme, ungültige Grenzen und Ein-Monitor-Systeme umgesetzt.
- Bevorzugte Zwei-Monitor-Einstellung und aktiver Sitzungs-Fallback getrennt.

### Bildmanager und Projektordner

- Workspace-basierte Bildverwaltung mit Suche, Filtern, Raster-/Listenansicht, Details, Varianten, Ersetzen und sicherem Löschen fertiggestellt.
- Erklärendes Infofenster vor der Ordnerauswahl ergänzt.
- Aktion zu „Projektordner verbinden“ vereinfacht; der Benutzer wählt den Projektstamm und Oluntir verwendet oder erstellt `assets/user_upload/`.
- Browser-Bildspeicher und physische Ordnersynchronisation bleiben getrennt.

### Galerie-Viewer

- Eigenständige Modi `none`, `modal` und `lightbox` erhalten.
- Echte dunkle, rahmenlose Lightbox wiederhergestellt; gerahmtes Modal beibehalten.
- Bildbezeichnung, Zähler, Originalbild-Download, Tastaturnavigation, Fokusfalle und Fokusrückgabe ergänzt beziehungsweise stabilisiert.
- Unteren Sicherheitsabstand von mindestens einer Bedienelementhöhe auf Desktop ergänzt, ohne das responsive Verhalten zu verändern.

### Architektur und Oberfläche

- `OluntirWorkspaceManager` erweitert und eigene Mehrmonitor- und Settings-Services eingeführt.
- GrapesJS unverändert und versioniert hinter Adapter- und Kompatibilitätsgrenze gehalten.
- Dauerhafte Synchronisation verzögert erzeugter GrapesJS-Werkzeugcontainer in das externe Fenster ergänzt.
- Sticky Toolbar, Dark-Theme-Kontrast, Monitorsteuerung und Einstellungswarnungen verbessert.

## Oluntir 1.0.0 — 29.07.2026

Oluntir 1.0.0 war die erste stabile öffentliche Version. Sie führte lokale Bearbeitung statischer Websites, Bootstrap-4-/5-Profile, Projektpersistenz, sich inhaltlich wiederholende Elemente und Bereiche, das Oluntir-Include-Modell, HTML-/SSI-/PHP-Export, Ordner-/ZIP-/TAR-Ausgabe, zweisprachige Oberfläche und Dokumentation, Schnellbearbeitung, Galerien und lokal gebündelte Assets ein.

## Oluntir 1.2.0 – Canvas-Scrollbereich und Editor-Arbeitsabstand

- Den layoutverändernden Platzierungspuffer vollständig entfernt.
- Vertikales Scrollen im GrapesJS-Canvas ausdrücklich wiederhergestellt.
- Unterhalb des letzten Seitenelements steht dauerhaft ein ausschließlich editorinterner Arbeitsabstand zur Verfügung.
- Ein wirklich leeres `<main>` erhält nur bis zum ersten Inhalt eine kleine gekennzeichnete Dropfläche.
- Bestehende Navigationen, Rows, Cards und Footer erhalten keine zusätzlichen Innenabstände, Höhen oder Klassen.
- Arbeitsabstand und Leerflächenhinweis werden weder gespeichert noch exportiert.

### Korrektur: editorinterne Section-Einfügezone

- Der große unsichtbare Arbeitsabstand unterhalb der Seite wurde entfernt.
- Stattdessen zeigt der Canvas eine kompakte gerasterte Overlay-Hilfe mit „+ Hier Section einfügen“.
- Der Scrollabschluss wurde auf 68 px begrenzt und ist optisch klar vom Footer getrennt.
- Auf leeren Seiten wird dieselbe Einfügekennzeichnung direkt im leeren `<main>` angezeigt.
- Overlay und Editorhilfen werden vor dem gerenderten HTML-Export ausdrücklich entfernt.

### Korrektur: leeres `<main>` auf neu angelegten Seiten

- Die globale Canvas-Abstands- und Fixed-Overlay-Lösung wurde entfernt.
- Ursache war die von der Startseite übernommene Flex-Wachstumsregel des leeren `<main>`.
- Ausschließlich ein tatsächlich leeres `<main>` wird im Editor auf eine kompakte 64-px-Einfügezone begrenzt.
- Die Einfügezone ist mit „+ Hier Section einfügen“ gekennzeichnet.
- Nach dem Einfügen der ersten Section gelten automatisch wieder alle ursprünglichen Klassen und Layoutregeln.
- Befüllte Seiten, die Indexseite, Navigation und Footer bleiben unverändert.

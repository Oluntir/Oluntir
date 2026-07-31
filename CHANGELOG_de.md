# 1.2.1

- Projekt-Favicon-Dialog erkennt nun vorhandene Favicon-Assets zuverlässig, zeigt Vorschau, Quelldatei, Dateityp und Änderungszeitpunkt und kennzeichnet den Vorgang eindeutig als Ersetzen. Beim Ersetzen werden alte Varianten vor der Neuerzeugung vollständig entfernt.

- Stabile, additive Layout-Identitäten für Seiten und GrapesJS-Komponenten ergänzt.
- Repeat Engine V2 auf Basis persistenter Identitäten ergänzt.
- Idempotente Migration von 1.2.0-Projekten und reine Exportbereinigung interner IDs ergänzt.
- Bestehende HTML-/SSI-/PHP-Export- und Shared-Content-Pipelines erhalten.
- Automatisierte Identity-, Syntax-, Adapter- und Strukturtests ergänzt.

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

## 1.2.1 – Stabilisierung von SSI-Export und unterem Canvas-Arbeitsbereich

- Exportquelle auf das persistente GrapesJS-Komponentenmodell zurückgestellt.
- Verhindert, dass Canvas- oder Editorhilfsstrukturen als zusätzliche Row/Spalte exportiert werden.
- SSI-/PHP-Includes ersetzen Shared-Bereiche jetzt an ihrer bestehenden Seitenposition.
- Pauschales Entfernen und Neuordnen von Header, Navigation, Footer und Shared Sections entfernt.
- Zusätzlicher scrollbar erreichbarer Arbeitsbereich unter der letzten Row für Footer und weitere Elemente.

### Stabilitätskorrektur – Export und unterer Canvas-Bereich
- Behebt den Exportabbruch `headerContainsNavigation is not defined` bei HTML-, SSI- und PHP-Ausgaben.
- Erkennt eine im Shared Header enthaltene Navigation nun über eine definierte, modellbasierte Prüfung.
- Entfernt den editorinternen Dauerabstand aus nichtleeren `main`-Elementen.
- Verlegt die zusätzliche Scrollreserve hinter den Footer, sodass neue Seiten keinen künstlichen Zwischenraum zwischen letzter Row und Footer erhalten.

## 1.2.1 – Nicht-destruktiver Bildexport

- HTML-, SSI- und PHP-Seiten werden beim Export direkt aus dem jeweiligen GrapesJS-MainComponent gelesen.
- Der Export wechselt nicht mehr sichtbar zwischen Projektseiten.
- Canvas-Blob-URLs werden während des Exports nicht mehr in das geöffnete Projektmodell zurückgeschrieben.
- Der Export normalisiert oder speichert das Projekt nicht mehr automatisch.
- Neu gesetzte Card-Bilder bleiben während des Exportvorgangs sichtbar und werden mit ihrem stabilen Uploadpfad samt Bilddatei exportiert.

## 1.2.1 – Stabilität der Rich-Text-Eingabe

- Verhindert automatische Projekt- und Shared-Content-Synchronisation während einer aktiven GrapesJS-Rich-Text-Bearbeitung.
- Behebt das Springen der Einfügemarke an den Zeilenanfang, durch das eingegebener Text rückwärts erschien.
- Shared Header und Footer werden nach Abschluss der Texteingabe einmalig synchronisiert.
- Bildänderungen bleiben weiterhin zeitnah persistent; Textänderungen werden beim Verlassen des RTE gesichert.

## 1.2.1 – Projekt-Favicon

- Neues Stern-Symbol in der zweiten oberen Werkzeugleiste.
- Ein Ausgangsbild erzeugt automatisch ICO-, Browser-, Apple- und Android-Faviconvarianten.
- Projektweite Favicon-Metadaten und Dateien werden mit `.oluntir`-Backups gespeichert.
- HTML-, SSI- und PHP-Export erhalten automatisch passende `<link>`-Einträge.
- Ordner-, ZIP- und TAR-Export enthalten alle erzeugten Favicon-Dateien.

### Favicon-Export-Vollständigkeit
- `favicon-48x48.png` wird nun im Dokumentkopf referenziert.
- Android-Icons mit 192 × 192 und 512 × 512 Pixeln werden explizit eingebunden.
- `site.webmanifest` wird automatisch erzeugt, exportiert und im Dokumentkopf verknüpft.

### Vollständiger Responsive-Upload-Export
- Bei verwendeten Bildern unter `assets/user_upload/desktop/` werden nun automatisch auch die zugehörigen Tablet- und Mobile-Dateien exportiert.
- Dasselbe gilt für die kompatiblen Legacy-Pfade unter `images/uploads/`.
- Fehlt eine der drei erzeugten Varianten im Asset-Speicher, wird der Export mit einer konkreten Dateiliste abgebrochen, statt ein unvollständiges Paket zu erzeugen.

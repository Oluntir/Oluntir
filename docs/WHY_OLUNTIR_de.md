> **Sprache:** Deutsch · [English](WHY_OLUNTIR.md)
> **Version:** 2.2.0 BETA · **Stabile Baseline:** 1.3.1 · **Aktualisiert:** 04.09.2026

# Warum Oluntir?

Oluntir entstand aus der Überzeugung, dass eine Website mehr ist als die gerade geöffnete Seite eines Editors. Reale Projekte bestehen aus Seiten, Bildern, Framework-Versionen, gemeinsamer Navigation und gemeinsamen Layoutbereichen, Exportregeln, Sicherungen und Entscheidungen, die langfristig nachvollziehbar bleiben müssen.

Oluntir behandelt eine Website deshalb als zusammenhängendes, übertragbares Projekt und nicht als Sammlung voneinander unabhängiger HTML-Dateien.

## Warum GrapesJS?

GrapesJS stellt den visuellen Canvas, das Komponentenmodell, Blöcke, responsive Ansichten und die direkte Bearbeitung bereit. Oluntir nutzt **GrapesJS 0.23.2** als unveränderte und versionierte Open-Source-Editor-Engine.

Oluntir-spezifische Funktionen werden ausschließlich über eine eigene Integrations- und Adapterebene ergänzt. GrapesJS selbst wird nicht verändert. Projektverwaltung, Workspaces, Assets, Shared Content, Persistenz, Export und Mehrmonitorbetrieb bleiben von internen GrapesJS-DOM-Strukturen getrennt. Dadurch sind Verantwortlichkeiten klarer und spätere Aktualisierungen der Editor-Engine besser prüfbar.

## Warum lokale Projekte?

Oluntir arbeitet bewusst lokal:

- Projektdateien bleiben unter der Kontrolle der Anwenderinnen und Anwender;
- Projekte können kopiert, archiviert, gesichert und wiederhergestellt werden;
- ein verpflichtendes Cloud-Konto oder eine Datenbank sind nicht erforderlich;
- die Browserpersistenz unterstützt den aktuellen Arbeitsstand, ersetzt aber nicht die physische Projektstruktur;
- ein gesichertes Projekt kann auf einem anderen Rechner oder in einem anderen unterstützten Browser fortgeführt werden.

## Warum Shared Content?

Navigation, Header, Footer und andere sich inhaltlich wiederholende Elemente und Bereiche sollen nicht auf jeder Seite unabhängig gepflegt werden müssen. Oluntir speichert sie zentral und referenziert sie über sichtbare `<ope-include>`-Elemente.

Eine Änderung kann auf jeder beliebigen Seite beginnen, in den zentralen Shared Content übernommen und anschließend auf die übrigen Seiten angewendet werden. Erst beim Export wird zwischen aufgelöstem HTML, Apache SSI und PHP-Includes entschieden.

## Warum ein Zwei-Monitor-Arbeitsbereich?

Ein großer Seiten-Canvas und umfangreiche Werkzeuge konkurrieren um Bildschirmfläche. Oluntir kann den Canvas im Hauptfenster belassen und die vollständige rechte Werkzeugspalte, Schnellbearbeitung und Schnellkonfiguration in ein eigenes Werkzeugfenster auslagern.

Der bevorzugte Modus und die Fenstergeometrie werden lokal gespeichert. Kann das zweite Fenster nicht geöffnet werden oder wird es geschlossen, kehrt Oluntir sicher zum Ein-Monitor-Betrieb zurück.

## Warum offene Exportformate?

Die veröffentlichte Website benötigt keine proprietäre Oluntir-Laufzeit. Exporte bestehen aus regulärem HTML, CSS, JavaScript, lokalen Assets und – je nach Auswahl – standardisierten SSI- oder PHP-Includes.

Das interne Projektmodell bleibt vom gewählten Ausgabeformat unabhängig. Ein Projekt kann dadurch unterschiedliche Zielumgebungen bedienen, ohne neu aufgebaut werden zu müssen.

## Warum Open Source?

Open Source macht Verhalten, Abhängigkeiten und Entscheidungen des Projekts überprüfbar. Es ermöglicht Beiträge aus der Community, unabhängige Sicherheitsprüfungen, langfristige Wartbarkeit und Unabhängigkeit von einem einzelnen Hersteller.

## Die Grundidee

Oluntir ist nicht nur ein weiterer visueller HTML-Editor. Es ist eine lokale Open-Source-Projektumgebung für Websites – von der ersten Seite und Bildverwaltung über gemeinsame Inhalte und Workspace-Wiederherstellung bis zum offenen Export.

## Weiterführende Dokumentation

- [Architektur](ARCHITECTURE_de.md)
- [Projektgrundsätze](PROJECT-PRINCIPLES_de.md)
- [Erster Start](FIRST_START_de.md)
- [Zwei-Monitor-Arbeitsbereich](MULTI_MONITOR_de.md)
- [Bildmanager](IMAGE_MANAGER_de.md)
- [Release Notes 2.2.0 BETA](../RELEASE_NOTES_de.md)
- [Historische technische Änderungen bis 2.1.0 BETA](CHANGELOG_1.3.1_TO_2.1.0_BETA_de.md)

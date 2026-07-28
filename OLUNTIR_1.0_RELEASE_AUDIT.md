# Oluntir 1.0.0 Release Audit

**Audit date:** 2026-07-29  
**Target:** Oluntir 1.0.0  
**Contact:** info@oluntir.com  
**Websites:** https://oluntir.com · https://oluntir.de  
**Repository:** https://github.com/Oluntir/Oluntir

## Ausgangsstand

Grundlage war die bereitgestellte letzte funktionierende Audit-ZIP unter der früheren Projektidentität. Die Anwendung bestand aus einer statischen browserbasierten Editoranwendung mit lokalen Assets, zwei Bootstrap-Profilen, Projektverwaltung, wiederverwendbaren Bereichen sowie HTML-, SSI-, PHP-, ZIP-, TAR- und Ordnerexport.

## Durchgeführte Anpassungen

- Projektidentität, Version, sichtbare GUI-Texte, Fenstertitel, Metadaten, Dokumentation und eigene Projekthinweise auf Oluntir 1.0.0 vereinheitlicht.
- Kontaktadresse auf `info@oluntir.com` umgestellt.
- Projekt-, Website- und Repository-Verweise auf die vorgegebenen Oluntir-Ziele aktualisiert.
- Interne, projektspezifische Präfixe und Ereignis-/DOM-Bezeichner konsistent umbenannt, ohne Abläufe oder Programmlogik zu ändern.
- Projektspezifische Dateiendung auf `.oluntir` und MIME-Typ auf `application/x-oluntir-project` umgestellt.
- Binäres Rohdatenformat, Assetbehandlung, Importablauf und Exportlogik beibehalten.
- Produktive Include-System- und Codeansichtsdateien auf neutrale Oluntir-Dateinamen umbenannt und alle Referenzen angepasst.

## Umbenannte Dateien

- `editor/js/core/oluntir-code-view.js`
- `docs/OLUNTIR-INCLUDE-SYSTEM.md`
- `docs/OLUNTIR-INCLUDE-SYSTEM_de.md`
- Repository-Stammordner auf `Oluntir`

## Gelöschte Dateien

Entfernt wurden ausschließlich Vorabversions-, Zwischenprüfungs-, Hotfix-, Arbeitspaket-, Sitzungs- und frühere Auditunterlagen. Produktive Funktions-, Architektur-, Bedien-, Lizenz- und Beitragsdokumentation blieb erhalten und wurde aktualisiert. Insgesamt wurden 42 historische Dateien entfernt.

## Dokumentation

Erhalten und aktualisiert wurden unter anderem README, Changelog, Handbook, Security Policy, Contributing Guide, Code of Conduct, Roadmap, Governance, Support, Lizenzunterlagen, Third-Party-Hinweise sowie die produktive Dokumentation unter `docs/` und `compliance/`.

Englische und deutsche Kerndokumente wurden auf Version 1.0.0, die neue Identität, die neue Kontaktadresse und die aktuellen Verweise abgestimmt. Verweise auf entfernte historische Dokumente wurden entfernt. Die lokale Markdown-Linkprüfung meldet keine fehlenden Ziele.

## Lizenzprüfung

- MIT-Projektlizenz und vorhandene Drittanbieter-Lizenztexte wurden beibehalten.
- Drittanbieter-Namen und Attributionen wurden nicht umbenannt.
- Asset-Inventar, Lizenzmatrix, Source Attribution und Third-Party Notices blieben erhalten.
- Binäre Assets wurden zusätzlich über druckbare Zeichenfolgen auf alte Projektkennzeichnungen geprüft.
- Das eingebettete Export-Assetarchiv enthielt im Ausgangspaket einen beschädigten ZIP-Eintrag. Das Archiv wurde aus den bereits im Repository vorhandenen, unveränderten Quelldateien neu aufgebaut. Es wurden keine Bibliotheksinhalte oder Funktionen verändert.

## Ausgeführte Tests

1. Vorhandener Python-Strukturvalidator.
2. JavaScript-Syntaxprüfung aller eigenen JavaScript-Dateien mit Node.js.
3. Prüfung aller lokalen `src`- und `href`-Referenzen in `index.html`.
4. Prüfung aller lokalen Markdown-Links.
5. Prüfung der `.oluntir`-Dateifilter, Dateinamen, MIME-Konfiguration und des beibehaltenen binären Rohdatenformats.
6. Rekursive Inhalts-, Pfad-, E-Mail-, URL- und Binärzeichenfolgenprüfung.

## Testergebnisse

- Strukturvalidator: erfolgreich.
- Eingebettetes Export-Assetpaket: vollständig, lesbar und ZIP-integritätsgeprüft.
- JavaScript-Syntax: alle geprüften eigenen Dateien erfolgreich.
- Statische HTML-Referenzen: 30 geprüft, 0 fehlend.
- Lokale Markdown-Links: 95 geprüft, 0 fehlend.
- Projektdateikonfiguration `.oluntir`: erfolgreich geprüft.
- Verbotene Altkennzeichnungen in Dateinamen und Textinhalten: 0 Treffer.
- Alte Kontaktadressen: 0 Treffer.
- Alte Projekt-/Kontakt-URLs: 0 Treffer.
- Binäre druckbare Zeichenfolgen: 0 Treffer.

## Nicht vollständig automatisierbare Tests

Der interaktive Import und Export über native Browser-Dateiauswahldialoge konnte in der headless Containerumgebung nicht vollständig automatisiert werden. Die betroffenen JavaScript-Dateien bestanden die Syntaxprüfung; Filter, MIME-Typ, vorgeschlagener Dateiname, binärer Dateikopf, Manifestverarbeitung und Exportpfade wurden statisch geprüft. Ein Headless-Chromium-DOM-Test lieferte wegen eines Timeouts kein belastbares vollständiges Ergebnis und wird daher nicht als bestanden gewertet.

## Verbliebene Risiken

- Native Datei- und Ordnerdialoge unterscheiden sich je nach Browser und Betriebssystem und sollten vor Veröffentlichung zusätzlich manuell in den unterstützten Zielbrowsern geprüft werden.
- Die Umbenennung interner Browser-Speicherschlüssel führt bewusst zu einer eigenständigen Oluntir-Projektidentität; alte lokale Browserstände werden nicht unter einem früheren Schlüssel weitergeführt.
- Projektdateien verwenden weiterhin dieselbe grundlegende binäre Rohdatenstruktur, tragen aber die neue Oluntir-Kennung und Dateiendung.

## Abschluss

Das Repository ist als vollständiges Oluntir-1.0.0-Releasepaket aufbereitet. Die dokumentierten rekursiven Endprüfungen ergaben jeweils 0 Treffer für die untersuchten alten Projektkennzeichnungen, Kontaktadressen und Projektverweise.

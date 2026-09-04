# DEV_023 – Quellengebundene Frontend-Bridge

## Ergebnis

Importierte Framework-, Template-, Theme- und Komponentenquellen können über
die bestehende Framework-Auswahl als quellengebundene GrapesJS-Blöcke genutzt
werden. Die Bridge erzeugt keine eigene Oluntir-Komponentenwelt, sondern
verwendet ausschließlich aus dem Source-Inventar abgeleitete HTML-Strukturen.

## Umsetzung

- `analyzer/core/source-component-catalog.js` erzeugt aus HTML-Evidenz einen
  begrenzten, deterministisch identifizierten `component-catalog.json`.
- `<script>`-Elemente und inline `on...`-Handler werden aus Blockfragmenten
  entfernt; Source-JavaScript wird während der Analyse nie ausgeführt.
- Lokale vorhandene `src`, `href` und `poster`-Dateien werden als
  Asset-Referenzen erfasst.
- `editor/js/core/source-package-bridge.js` registriert Katalogeinträge als
  normale GrapesJS-Blöcke in einer Source-Kategorie.
- Asset-Referenzen werden beim Einfügen auf die lokale API-Dateiroute des
  jeweiligen Pakets abgebildet.
- API-Sitzungen werden für Ressourcendateien zusätzlich als URL-Parameter
  weitergegeben, da Browser-Subressourcen keine benutzerdefinierten Session-
  Header setzen können.
- Das Manifest verweist auf den Katalog und nennt dessen Anzahl.

## Architektur- und Identitätsauswirkungen

Die Analyse bleibt read-only. Die Blockregistrierung ist eine vorbereitete
Benutzer-Einfügung; sie bearbeitet kein vorhandenes Dokument automatisch.
GrapesJS vergibt bei der tatsächlichen Einfügung seine normale Identität.
`unitId` wird weder gelesen noch geschrieben. Automatische Mutation,
Kopierlogik und Repeat-Synchronisation bleiben gesperrt.

Der Katalog ist aus Source, Inventar und Report ableitbar und wird nach Import
oder Recovery neu erzeugt. Er ist damit keine zusätzliche normative Wahrheit.

## Geänderte und neue Dateien

- `analyzer/core/source-component-catalog.js`
- `analyzer/app/server.js`
- `analyzer/contracts/source-component-catalog-contract.json`
- `analyzer/contracts/source-package-contract.json`
- `editor/js/core/source-package-bridge.js`
- `editor/js/core/editor.js`
- `analyzer/tests/test-source-package.js`
- `analyzer/tests/test-source-package-server.js`
- `analyzer/tests/test-bootstrap-framework-import.js`
- `tests/test-source-package-bridge.js`
- `docs/Architecture/SOURCE_COMPONENTS_de.md`
- `docs/Architecture/SOURCE_COMPONENTS.md`

## Kritische Selbstkontrolle

1. **Frontend-Nutzung:** Die vorhandene Framework-Auswahl und der bestehende
   GrapesJS-BlockManager werden erweitert; bestehende Bootstrap-Blöcke,
   Editorpfade und `unitId`-Verträge bleiben unverändert.
2. **Abstimmung:** Es entsteht keine neue sichtbare Parallel-UI. Die bereits
   vorhandenen Import-Schaltflächen und die Framework-Auswahl werden verwendet.
3. **Abhängigkeiten:** Source-Analyse → Inventar/Evidenz → Katalog → lokale
   API-Route → Frontend-Bridge → GrapesJS-BlockManager. Keine Rückabhängigkeit
   zum Resolver, zur Synchronisation oder zu einer eigenen Komponentenwelt.
4. **Testquelle:** Die bestehende Source-Package-Testquelle enthält semantische
   und signalbasierte HTML-Strukturen. Die Bridge-Prüfung deckt Registrierung,
   Asset-URL-Umschreibung und Session-URL ab. Eine zusätzliche universelle
   Bootstrap-Testmatrix prüft Bootstrap 4 und Bootstrap 5 getrennt mit
   derselben Import-/Analyse-/Katalog-Pipeline.
5. **Mutation:** Nur bewusste Block-Einfügung ist vorgesehen. Automatische
   Dokumentmutation und Repeat-Synchronisation bleiben `user-insert-only` bzw.
   deaktiviert.

## Verifikation

Ausgeführt werden die vorhandenen Vertragstests, der Source-Package-Import-
und API-Test, der Bridge-Test, die Syntaxprüfung, die Strukturvalidierung, der
vollständige Testlauf und die SHA-256-Prüfung. Browser- und echte
Framework-Lauftests bleiben bis zum vereinbarten Testfenster aus.

Vorgeschlagener Commit in GitHub Desktop:

```text
feat(alpha): expose source-backed framework blocks
```

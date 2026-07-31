# Release Audit – Oluntir 1.2.1

**Stand:** 31.07.2026  
**Basis:** Branch-/ZIP-Stand `Oluntir-1.2.1`

## Ergebnis

Die zentrale Dokumentation wurde auf den tatsächlich implementierten Stand 1.2.1 konsolidiert. Layout-Identitäten, Migration, modellbasierter Export, Projekt-Favicon, responsive Uploadvarianten und der Editorhinweis „+ Hier Section einfügen“ sind auf Deutsch und Englisch dokumentiert.

Die Laufzeit-Versionsanzeige und Cache-Busting-Parameter wurden von 1.2.0 auf 1.2.1 angehoben. Funktionscode wurde dabei nicht umgebaut.

## Aktualisierte Hauptdokumente

- `README.md`, `README_de.md`
- `CHANGELOG.md`, `CHANGELOG_de.md`
- `RELEASE_NOTES.md`, `RELEASE_NOTES_de.md`
- `HANDBOOK.md`, `HANDBOOK_de.md`
- `docs/ARCHITECTURE.md`, `docs/ARCHITECTURE_de.md`
- `docs/index.md`, `docs/index_de.md`

## Neue beziehungsweise konsolidierte Dokumente

- `FEATURES.md`, `FEATURES_de.md`
- `docs/046_PROJECT_FAVICON.md`, `docs/046_PROJECT_FAVICON_de.md`
- `docs/047_EDITOR_PLACEHOLDERS.md`, `docs/047_EDITOR_PLACEHOLDERS_de.md`
- `docs/048_RESPONSIVE_IMAGE_EXPORT.md`, `docs/048_RESPONSIVE_IMAGE_EXPORT_de.md`
- `docs/MIGRATION_1.2.0_TO_1.2.1.md`, `docs/MIGRATION_1.2.0_TO_1.2.1_de.md`

`docs/FAVICON.md` und `docs/FAVICON_de.md` bleiben als kurze Kompatibilitätsweiterleitungen erhalten, damit vorhandene Links nicht brechen.

## Obsolete Dateien – zur Entfernung empfohlen

Die folgenden Dateien sind historische Zwischen-Audits oder einzelne Fixprotokolle. Sie werden vom Laufzeitcode nicht benötigt. Vor dem Löschen kann der Branchverlauf als Historie dienen.

### Sicher entfernbar: alte Audit- und Testergebnis-Artefakte

- `audit/OLUNTIR_1.1.0_ARCHITECTURE_AUDIT.md`
- `audit/OPEN_SOURCE_READINESS_1.2.0.md`
- `audit/RELEASE_AUDIT_1.2.0.md`
- `audit/TEST_RESULTS_1.2.0.txt`
- alle `audit/grapesjs-adapter-*.txt`
- alle `audit/structure-validator-*.txt`
- alle `audit/image-select-*.txt`
- alle `audit/oluntir-1.1.0-*.txt`
- alle `audit/oluntir-1.2.0-*.txt`
- `audit/test-results.txt`

### Nach Konsolidierung entfernbar: 1.2.1 Einzel-Fixberichte

Die Inhalte sind im neuen Changelog, den Release Notes und diesem Abschluss-Audit zusammengeführt:

- `audit/OLUNTIR_1.2.1_CARD_IMAGE_READONLY_EXPORT_FIX.md`
- `audit/OLUNTIR_1.2.1_EXPORT_AND_FOOTER_GAP_FIX.md`
- `audit/OLUNTIR_1.2.1_FAVICON_EXPORT_COMPLETENESS_FIX.md`
- `audit/OLUNTIR_1.2.1_FAVICON_STATE_AND_REPLACE_FIX.md`
- `audit/OLUNTIR_1.2.1_PROJECT_FAVICON.md`
- `audit/OLUNTIR_1.2.1_RESPONSIVE_UPLOAD_EXPORT_FIX.md`
- `audit/OLUNTIR_1.2.1_RTE_CURSOR_STABILITY_FIX.md`
- `audit/OLUNTIR_1.2.1_SSI_MODEL_EXPORT_AND_CANVAS_BOTTOM_FIX.md`
- zugehörige `audit/TEST_RESULTS_1.2.1_*`-Einzeldateien

### Beibehalten

- `audit/IMPLEMENTATION_AUDIT_1.2.1.md` als technische Implementierungsübersicht
- `audit/RELEASE_AUDIT_1.2.1.md` als finalen Releaseabschluss
- `audit/TEST_RESULTS_1.2.1.txt` als konsolidiertes Testergebnis, sofern dessen Inhalt nach dem finalen Testlauf aktualisiert wird
- Scan-Ergebnisse (`binary-string-scan.txt`, `email-scan.txt`, `filename-scan.txt`, `legacy-name-scan.txt`, `url-scan.txt`) nur dann, wenn sie Teil des dokumentierten Compliance-Prozesses bleiben sollen; andernfalls ebenfalls aus dem Release-ZIP entfernen und nur als CI-Artefakte führen

## Nicht als obsolet eingestuft

- `docs/WHATS_NEW_1.2.0*.md`: historische Release-Dokumentation
- `docs/FAVICON*.md`: Kompatibilitätslinks auf die nummerierte 1.2.1-Dokumentation
- vorhandene automatisierte Tests unter `tests/`: sie prüfen weiterhin unterschiedliche Regressionsverträge und sollten nicht allein wegen ähnlicher Namen gelöscht werden

## Prüfungen

- Strukturvalidator: erfolgreich
- GrapesJS-Adaptertest: erfolgreich
- Layout-Identity-Test: erfolgreich
- JavaScript-Syntaxprüfung: erfolgreich
- Bootstrap 4 und Bootstrap 5: erfolgreich
- statische lokale Referenzen und Exportassets: erfolgreich

## Merge-Empfehlung

Vor dem Merge:

1. die oben als entfernbar markierten Audit-Zwischenartefakte löschen,
2. `SHA256SUMS.txt` neu erzeugen,
3. `bash tests/run-tests.sh` ausführen,
4. ZIP-Integrität prüfen,
5. anschließend den Branch nach `main` mergen.

- Known presentation issue: an explicitly edited footer text color can differ between the editor canvas and export; explicitly selected values are exported correctly.
## DEV_012 – Bild-Undo/Redo

- Bildaustausch und Bildattribute an den gemeinsamen Dokument-/Undo-Vertrag angebunden.
- Responsiven Galerie-Bildwechsel über die Dokument-API geführt.
- Undo/Redo aktualisiert Canvas und persistenten Projektzustand.
- Zwischenberichte `DEV_011_FIX*` aus dem Paket entfernt.
# Changelog
## Oluntir 2.0 – DEV_011 — 2026-08-02

### Gallery area insertion
- New gallery areas are inserted as direct `SECTION` children of the actual `MAIN` template structure.
- Insertion positions are derived before, between and after direct `SECTION`/`CONTAINER` areas of `MAIN`.
- The creation dialog is limited to `Container` and `Container Fluid`.
- Runtime validation prevents insertion against moved or nested stale anchors.
- Existing ROW insertion, preview, export, shared content, repeat and project-store paths remain unchanged.
- No productive synchronization logic was added.


## 1.3.0 — 2026-08-01

### Architecture
- Added the Semantic Dictionary and Identity, Context, Structure and Relationship Resolvers.
- Added an explicitly built read-only Project Dependency Graph.
- Added the Semantic Action Engine with lifecycle, action definitions, handlers, phases, queue, batching, deduplication, transactions, failures and metrics.
- Retained the Semantic Validator and Repeat Engine V2 technical foundation.

### Shared content and performance
- Changed shared header, navigation and footer synchronization to targeted region updates.
- Added fingerprints and lazy synchronization.
- Avoided full-page and full-project rebuilds during normal page switching.

### Logging and diagnostics
- Added optional local logging with a ring buffer, JSONL files, rotation and redaction.
- Added Runtime Actions for editor, page, shared-content, gallery and export events.
- Added installation-bound versioned consent for licensing, privacy and security documents.
- Added the Developer Diagnostics Center with manual graph analysis and snapshot export.

### Editor and export
- Consolidated framework and icon sources for Bootstrap 4 and 5.
- Stabilized project favicon, editor placeholders and responsive image variants.
- Locally tested HTML, SSI and PHP export including shared content.

### Documentation
- Consolidated main documentation for 1.3.0.
- Added architecture and AI knowledge documentation.
- Added a release audit.

## Earlier versions
History up to 1.2.1 remains available in Git history and the existing migration documents.


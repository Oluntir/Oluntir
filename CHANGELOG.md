# Changelog

## 1.3.0 DEV_029 — 2026-08-01

### Added

- Read-only Structure Resolver for complete semantic page and project structures.
- Immutable snapshots containing parent/child relationships, roles, structure kinds, semantic areas and cardinality summaries.
- Public core API `OluntirStructureResolver.resolvePage(page)` and `resolveProject(editor)`.
- Automated test that also verifies the GrapesJS structure remains unchanged after resolution.

### Unchanged

- No UI, automatic correction, framework, editor or export logic in the resolver.
- Repeat Engine, Shared Content, Export and Semantic Validator retain their existing flows in DEV_029.
- Gallery and icon implementation remain untouched.

### Verification

- Local application use and export were successfully tested.


> **Language:** English · [Deutsch](CHANGELOG_de.md)

## 1.2.1 — 2026-07-31

### Added

- Stable additive internal identities for Page, Section, Row, Slot, Component, and Repeat.
- Schema versions for project data, layout identities, and Repeat Engine V2.
- Idempotent migration of existing 1.2.0 projects on load.
- Technical Repeat Engine V2 foundation with model-based target resolution.
- Project favicon dialog in the secondary toolbar.
- Automatic ICO, PNG, Apple, and Android favicon generation plus `site.webmanifest`.
- Favicon state detection with preview, source name, source type, and update time.
- Editor hint **“+ Insert section here”** on empty new pages.
- Automated tests for identities, read-only export, responsive uploads, favicon, RTE cursor stability, and the GrapesJS adapter.

### Changed

- HTML, SSI, and PHP exports read pages directly from each GrapesJS `MainComponent`.
- Export is read-only: no visible page selection, no Canvas-to-model writeback, and no automatic project save during export.
- Shared header, navigation, footer, and include regions are processed at their existing model positions instead of being globally reordered.
- New pages inherit shared project regions but not page-specific content from the start page.
- Replacing a favicon removes all previous generated variants before regeneration.
- Upload export treats desktop, tablet, and mobile files as one responsive asset group.

### Fixed

- Extra row/column structures leaking from the rendered Canvas into exports.
- `headerContainsNavigation is not defined` in HTML, SSI, and PHP export.
- Incorrect SSI/PHP ordering and duplicated shared content in existing projects.
- Newly assigned card images disappearing during the export overlay.
- Missing tablet and mobile files below `assets/user_upload/` and legacy upload paths.
- Caret jumping to the beginning while editing rich text.
- Artificial gap between the last row and footer on new pages.
- Unreachable lower Canvas area on long pages.
- Missing head references for 48×48 and Android icons and missing manifest link.
- Favicon dialog reporting no project favicon although generated assets existed.

### Migration and compatibility

- Existing HTML IDs, classes, text, images, and links remain unchanged.
- Missing internal IDs are added; existing internal IDs are preserved.
- Internal `data-oluntir-*` attributes remain in `.oluntir` projects and are stripped only from the final export copy.
- Bootstrap 4 and Bootstrap 5 remain supported.
- Existing Shared Content and OPE Include structures are not automatically restructured.

### Known limitation

- Repeat Engine V2 is present as a technical foundation and data model. A complete visible repeat-management UI is not part of this release.

## 1.2.0 — 2026-07-30

- Dual-monitor workspace with detachable GrapesJS tools.
- Workspace image manager with responsive variants.
- Project-folder synchronisation for `assets/user_upload/`.
- Gallery modes `none`, `modal`, and `lightbox`.
- Improved workspace, persistence, and GrapesJS adapter architecture.

## 1.0.0 — 2026-07-29

First stable public release with local website editing, Bootstrap 4/5 profiles, project persistence, Shared Content, OPE Includes, HTML/SSI/PHP export, quick editing, galleries, and locally bundled assets.

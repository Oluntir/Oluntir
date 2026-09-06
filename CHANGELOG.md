# Changelog

## 2.0.1-alpha v16 — 2026-09-05

- Shared Content changes in navigation and footer now use the current GrapesJS
  component model when returning from a subpage, preventing stale Canvas HTML
  from overwriting the central source.
- A confirmed Canvas target is no longer promoted to a parent by the separate
  `component:selected` event.
- Blocked Repeat plans now write their concrete validation issues to diagnostics.
- Updated cache busting to `repeat-v16`.

## 2.0.1-alpha v15 — 2026-09-05

- Prevented the post-page-switch persistence pass from flushing the newly
  selected Canvas back into the central Shared Content snapshot. This protects
  bidirectional header, navigation and footer edits, especially new page → index.
- Repeat automation now defers component changes during active Rich Text editing
  and releases them after `rte:disable`, preventing caret resets and edit lag.
- Repeat target selection now distinguishes hover preview from confirmed click;
  the orange marker remains locked until insertion or clear, and direct `main`
  boundaries between sections can be selected.
- Updated cache busting to `repeat-v15`.

## 2.0.1-alpha v14 — 2026-09-05

- Target selection again previews the orange insertion position on Canvas hover;
  selection and productive insertion still use the same Document API resolver.
- An active RTE session is completed before page changes so edits from the new
  page reach the GrapesJS project model and synchronous project snapshot.
- Page changes now emit the detected source and target page for runtime diagnosis.
- Updated cache busting to `repeat-v14`.

## 2.0.1-alpha v13 — 2026-09-05

- RTE/text-cursor editing is no longer interrupted by a delayed Shared Content
  re-render.
- Nav, header and footer now commit the current visible source-page state before
  page changes, including the new page → index direction.
- Repeat edits are detected through stable source identities inside inserted
  instances and are planned back to the definition source and all sibling
  instances.
- Shared layouts are excluded from Repeat automation; Shared Content remains
  their sole synchronization owner.
- Added reverse-sync, identity-mapping and RTE regression coverage and updated
  cache busting to `repeat-v13`.

## 2.0.1-alpha v12 — 2026-09-05

- Repeat targets now use the existing GrapesJS/document insertion resolver with
  stable page, parent and anchor identities; the former fixed DOM hover overlay
  is removed.
- „Im Bereich“, „davor“ and „danach“ resolve to the actual structural boundary,
  including pages with zero, one or multiple visible areas.
- Repeat target previews are orange only after a valid component selection and
  are cleared when the workflow is cleared, completed or reopened.
- Shared header, navigation and footer commits now write the central snapshot,
  propagate through the shared-content manager to all pages and emit diagnostic
  events for source page, region, path and changed targets.
- Updated cache busting to `repeat-v12`; refreshed contract tests and hashes.

## 2.0.1-alpha v11 — 2026-09-05

- Shared Content now propagates edits from header, navigation and footer
  through the affected component path to all project pages, including the
  return from a newly created page to the index.
- The Repeat dialog resets source, definition, target page and target node
  after a successful insertion without deleting stored project definitions.
- Changing the Repeat definition retains the selected target page and only
  requires a new target-node selection.
- Hovering no longer turns the page-level `<main>` into a misleading global
  insertion line. The target node and insertion position are resolved from
  the selected GrapesJS component.
- Updated cache busting to `repeat-v11`; refreshed SHA256SUMS and contract tests.

## 2.0.1-alpha — 2026-09-04

- Added portable Windows x64 Node.js runtime and local Analyzer API launchers.
- Added universal Source-Package import through local API for folders, ZIP, TAR,
  TAR.GZ/TGZ, browser files and URLs.
- Added per-package source storage, inventories, hashes, recovery JSON,
  capability manifests and source-bound profiles.
- Added static HTML/CSS/JavaScript analysis, OIR, knowledge compiler,
  translation matrix and JavaScript behavior resolver.
- Added controlled GrapesJS Source-Package Bridge for user-selectable source
  blocks.
- Restricted productive framework support to Bootstrap 4.6.2 and 5.3.8;
  unknown sources remain analysis-only.
- Added framework-owned gallery handling, lightbox support, preview fixes and
  export regression coverage.
- Repeat Foundation execution and productive synchronization are enabled for
  explicitly defined repeat instances.

- Corrected preview UX so only the dynamically displayed exit control is enlarged; the normal preview activation icon remains unchanged.

- Klickvergrößerte Bilder bleiben im Bearbeitungsmodus direkt auswählbar; die Lightbox öffnet sich im Editor nur noch im Vorschaumodus.

## 1.3.1 — 2026-08-02
- Added optional project-wide click-to-enlarge support for images, configurable in the image manager and quick editor, persisted across cards, grids, text areas and arbitrary image components, and included in HTML, SSI and PHP exports.
- Exportierte Bild-Lightbox: Download-Symbol als fest eingebettetes, frameworkunabhängiges SVG vereinheitlicht; kein abweichendes Unicode-Fallback-Icon mehr.
- Improved preview-mode discoverability with a larger 24 px exit icon, an automatic “ESC or eye” hint and ESC-key exit support.

### Stability and persistence
- Stabilized shared header, navigation and footer content.
- Quick edits are stored project-wide without destructively rebuilding navigation.
- Text, color and font-size values are transferred through the Oluntir presentation contract into projects and exports.
- Stabilized undo and redo for text and image changes.

### Gallery and layout
- Existing insertion points inside containers remain available.
- New gallery areas can be inserted before, between and after complete page areas.
- Added orange preview and scroll markers for new page areas.
- Removed empty and duplicate insertion positions.
- Completely empty new projects and blank HTML pages now expose a valid position for inserting the first gallery; the page root is addressed through the stable page ID.

### Export and frameworks
- Export remains available with an empty header, navigation, footer or otherwise incomplete reusable regions; these states are now logged as non-blocking diagnostics only.
- Stabilized export snapshots and responsive image variants.
- Verified Bootstrap 4.6.2 and Bootstrap 5.3.8.
- Consolidated framework and icon sources.
- Editor-only metadata is removed from final exports.

### Technical preparation
- Consolidated resolvers, dependency graph, action contracts and validation.
- Historical preparation of the Repeat Foundation; current explicit Repeat
  synchronization is documented in the v12 entry above.

### Known limitation
- An explicitly selected footer text color may differ in the editor and export; the export preserves the selected value.

## 1.3.0 — 2026-08-01

- Introduced semantic resolver, identity and dependency foundations.
- Extended shared content and project persistence.
- Consolidated Bootstrap 4/5 support and export functions.

## Earlier versions

Earlier history remains available in the Git history.

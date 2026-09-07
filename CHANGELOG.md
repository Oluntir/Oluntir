# Changelog

## 2.2.1 — 2026-09-07

- Editorial documentation cleanup: README, FEATURES, HANDBOOK, ROADMAP, and WHY_OLUNTIR now focus on stable product capabilities and usage; implementation details and bug history remain in changelog, release notes, DEV, audit, architecture, and test documentation.
- Toolbar cleanup: removed the redundant GrapesJS import/download button between Redo and Clear; the Oluntir folder export remains available.
- First regular 2.2.x release based on the successfully tested 2.2.0 BETA baseline.
- Repeat target selection now supports genuine top-level content boundaries outside `<main>` while shared header, navigation and footer remain excluded.
- Repeat library subtitle changed to “Bereich zentral bearbeiten”.
- ZIP and TAR export icons now carry small explicit format badges.
- Bootstrap 4/5 coverage, HTML5 video fallbacks, the central Repeat library, controlled publish and Repeat undo/redo remain part of the release line.

## 2.2.0 BETA — 2026-09-06

- 2026-09-07: Added native HTML5 video blocks for Bootstrap 4 and 5. BS4 uses `embed-responsive`, BS5 uses `ratio`; both provide WebM/MP4/Ogg sources, poster, and a visible download fallback. Analyzer extended with `media.video` and video source-component recognition.
- 2026-09-07: Extended Bootstrap 4 usage with Jumbotron, Media object and Custom forms; BS5 does not register removed BS4-only components. Analyzer detection now uses weighted version/Data-API/class evidence and a broader Bootstrap source-component catalog.
- 2026-09-07: Reorganized the Repeat library into separate **selection editing** and **library insertion** sections, with compact Newest/A–Z buttons, two slim scroll lists, and icon actions for undo/redo/discard in the central editor. The misplaced central “insert on page” action and the top-row insert buttons were removed.
- 2026-09-07: Global GrapesJS undo/redo now restores the active right-side tool view deterministically. Stale `open-blocks`/style/layers/traits command state is normalized and the Block Manager is explicitly re-rendered when opened.

- Central Repeat Canvas is fully editable again: page-instance lock flags are no longer carried into Draft/Published snapshots; text RTE, selection and normal GrapesJS component controls are restored in central editing.

- Hardened Repeat-library target selection across page switches: the library stays open without an active central workspace, source/target-page state is preserved, and a confirmed Canvas target reliably enables insertion.
- Existing projects now have marker-based repeat recovery: if central repeat metadata is missing, families and instances are reconstructed only from stable `data-oluntir-repeat-*` markers; header/nav/footer are excluded.
- Startup metadata now reports `2.2.0 BETA`; older stored version labels are shown as migration sources and updated on open.

- New `Oluntir-2.2.0-beta` branch based on 2.1.0 BETA.
- Repeat architecture changed to a central draft/published library with explicit publishing.
- Added project-wide usage catalog, single-object canvas, orange edit/remove controls, and Repeat undo/redo.
- Per-event automatic Repeat propagation is disabled in the 2.2 branch; the targeted synchronization/rollback foundation remains available.
- Controlled Repeat project mutations isolate internally generated GrapesJS add/remove events from the Shared Content structural watcher while normal header/navigation/footer and user structural changes remain active.
- Repeat workspace navigation now hands off to a real project page before removing the temporary GrapesJS page, preventing the `getAttributes` failure when leaving central Repeat editing.
- Error notifications remain visible for 12 seconds by default; normal notifications for 5 seconds.


## 2.1.0 BETA — 2026-09-06

- Raised the release status and visible UI version from `2.0.1 Alpha` to **2.1.0 BETA**.
- Split Repeat UX into two workflows: create/edit the current source and insert a named project-wide source from the library.
- Both Repeat workflows use target page → insertion mode → Canvas confirmation → insert through the same productive synchronization core.
- Existing Alpha projects are hydrated only through existing stable Oluntir correlation markers.
- Shared Content for header, navigation and footer remains bidirectional.
- Performance: redundant Shared Content component events with an unchanged central snapshot exit before target mutation and extra `editor.store()`; normal update/style events outside shared regions are no longer processed as Shared Content.
- Updated documentation, handbook, feature lists, release notes, test notes and active metadata to the Beta state.

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

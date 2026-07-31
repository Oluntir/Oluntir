# 1.2.1

- Projekt-Favicon-Dialog erkennt nun vorhandene Favicon-Assets zuverlässig, zeigt Vorschau, Quelldatei, Dateityp und Änderungszeitpunkt und kennzeichnet den Vorgang eindeutig als Ersetzen. Beim Ersetzen werden alte Varianten vor der Neuerzeugung vollständig entfernt.

- Added stable, additive layout identities for pages and GrapesJS components.
- Added Repeat Engine V2 core based on persistent identities.
- Added idempotent 1.2.0 project migration and export-only identity sanitizing.
- Preserved the existing HTML/SSI/PHP export and Shared Content pipelines.
- Added automated identity, syntax, adapter and structure tests.

# Changelog

## Unreleased

- Fixed a regression where replacing a card image reparsed the surrounding card structure; only the dedicated GrapesJS image component is updated now.

- Images added to newly created grids are now committed reliably from the canvas to the GrapesJS component model and remain available after reopening a project.
- The second-monitor quick tool now has a scrollable content area while its header and action buttons remain reachable.


> **Language:** English (reference) · [Deutsch](CHANGELOG_de.md)

## Oluntir 1.2.0 — 2026-07-30

### Multi-monitor workspace

- Added startup choice for single- or two-monitor operation with stability and pop-up guidance.
- Added IndexedDB-backed workspace settings for preferred mode, startup choice, tool-window bounds, and restoration.
- Added a separate tool window containing the complete right GrapesJS column and both Oluntir quick-edit areas.
- Added toolbar controls to move, recall, focus, and return the tool column.
- Added safe fallback for blocked pop-ups, closed windows, unavailable screens, invalid bounds, and one-monitor systems.
- Kept the preferred dual-monitor setting separate from the active session fallback.

### Image Manager and project folder

- Completed workspace-based image management with search, filters, grid/list views, details, variants, replacement, and safe deletion.
- Added an explanatory dialog before folder selection.
- Simplified the action to “Connect project folder”; users select the project root and Oluntir uses or creates `assets/user_upload/`.
- Kept browser asset storage separate from physical folder synchronization.

### Gallery viewers

- Preserved distinct `none`, `modal`, and `lightbox` modes.
- Restored a true dark, frameless Lightbox and retained a framed Modal.
- Added or stabilized caption, image counter, original-image download, keyboard navigation, focus trapping, and focus restoration.
- Added a bottom safe area of at least one control height on desktop while preserving responsive behavior.

### Architecture and UI

- Extended `OluntirWorkspaceManager` and introduced dedicated multi-monitor and settings services.
- Kept GrapesJS unchanged and versioned behind the adapter and compatibility boundary.
- Added ongoing synchronization of delayed GrapesJS tool containers into the external window.
- Improved sticky toolbar behavior, dark-theme contrast, monitor controls, and settings notices.

## Oluntir 1.0.0 — 2026-07-29

Oluntir 1.0.0 was the first stable public release. It introduced local static-site editing, Bootstrap 4 and 5 profiles, project persistence, recurring content elements and regions, the Oluntir include model, HTML/SSI/PHP export, folder/ZIP/TAR output, bilingual UI and documentation, quick editing, galleries, and bundled offline assets.

## Oluntir 1.2.0 – Canvas scrolling and editor workspace

- Removed the layout-changing placement buffer completely.
- Explicitly restored vertical scrolling inside the GrapesJS canvas.
- Added a permanent editor-only workspace below the final page element.
- A truly empty `<main>` receives a small marked drop area only until its first content element is added.
- Existing navigation, rows, cards, and footers receive no added padding, height, or classes.
- The workspace and empty-main hint are neither persisted nor exported.

### Fix: editor-only section insertion zone

- Removed the large invisible workspace below the page.
- Added a compact grid-style canvas overlay labelled “+ Hier Section einfügen”.
- Reduced the scroll tail to 68 px and visually separated it from the footer.
- Empty pages display the same insertion hint inside the empty `<main>` area.
- The overlay and editor-only helpers are explicitly removed from rendered HTML exports.

### Fix: empty `<main>` on newly created pages

- Removed the global canvas spacing and fixed-overlay approach.
- The cause was the empty `<main>` inheriting the start page's flex-growth rule.
- Only a truly empty `<main>` is constrained to a compact 64 px insertion zone inside the editor.
- The zone is labelled “+ Hier Section einfügen”.
- As soon as the first section is inserted, all original classes and layout rules apply again automatically.
- Populated pages, the index page, navigation, and footer remain unchanged.

## 1.2.1 – SSI export and lower canvas workspace stabilization

- Restored the persistent GrapesJS component model as the canonical export source.
- Prevents canvas/editor helper structures from appearing as additional rows or columns.
- SSI/PHP includes now replace shared regions at their existing page positions.
- Removed global removal and reordering of header, navigation, footer, and shared sections.
- Added a scroll-reachable lower workspace below the last row for footers and further elements.

### Stability fix – export and lower canvas workspace
- Fixes the `headerContainsNavigation is not defined` export failure for HTML, SSI and PHP output.
- Detects navigation embedded in the shared header through a defined model-based check.
- Removes the permanent editor-only spacing from non-empty `main` elements.
- Moves the additional scroll reserve behind the footer so new pages no longer show an artificial gap between the final row and footer.

## 1.2.1 – Non-destructive image export

- HTML, SSI and PHP pages are now read directly from each GrapesJS MainComponent.
- Export no longer switches visibly between project pages.
- Canvas blob URLs are no longer written back into the open project model during export.
- Export no longer normalizes or automatically stores the project.
- Newly selected card images remain visible during export and are exported with their stable upload path and image file.

## 1.2.1 – Rich text editing stability

- Blocks automatic project and shared-content synchronization while GrapesJS rich text editing is active.
- Fixes the caret jumping to the beginning of the line, which caused typed text to appear reversed.
- Shared headers and footers are synchronized once after text editing ends.
- Image changes remain promptly persisted; text changes are saved when leaving the RTE.

## 1.2.1 – Project favicon

- Added a star icon to the secondary top toolbar.
- One source image now generates ICO, browser, Apple, and Android favicon variants.
- Project favicon metadata and files persist in portable `.oluntir` backups.
- HTML, SSI, and PHP exports receive the matching `<link>` elements automatically.
- Folder, ZIP, and TAR exports include all generated favicon files.

### Complete favicon export
- `favicon-48x48.png` is now referenced in the document head.
- Android icons in 192 × 192 and 512 × 512 are linked explicitly.
- `site.webmanifest` is generated, exported, and linked automatically.

### Complete responsive upload export
- Images used from `assets/user_upload/desktop/` now automatically include their related tablet and mobile files in every export.
- The same rule applies to compatible legacy paths below `images/uploads/`.
- If one of the three generated variants is missing from asset storage, export stops with an explicit file list instead of producing an incomplete package.

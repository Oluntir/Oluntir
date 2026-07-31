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

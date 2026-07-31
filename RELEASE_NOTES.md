# Oluntir 1.2.1

This release establishes stable layout identities and the technical Repeat Engine V2 foundation without changing the visible editor workflow. Existing 1.2.0 projects are migrated additively on load and remain export-compatible.

# Oluntir 1.2.0 release notes

**Release date:** 2026-07-30  
**Release type:** Stable

Oluntir 1.2.0 expands the editor into a more independent application workspace while retaining GrapesJS as the unchanged visual editing engine.

## Highlights

### Two-monitor workspace

The main window keeps the GrapesJS canvas. The complete right GrapesJS tool column, including Components, Styles, Layers, and Traits, can move to a separate tool window together with both Oluntir quick-edit systems. Controls in the second toolbar can move the tool column, recall the window, or return everything to the main window.

Workspace preferences and optional window bounds are stored in IndexedDB. When the second window is blocked, closed, unavailable, or restored on a one-monitor computer, Oluntir falls back safely to the main window while preserving the preferred dual-monitor setting.

### Image Manager and project-folder synchronization

The workspace-based Image Manager provides search, filters, grid and list views, responsive variants, details, replacement, and safe deletion. Before folder access begins, an information dialog explains that the user must choose the project root. Oluntir then automatically uses or creates `assets/user_upload/` and can write IndexedDB uploads there.

### Modal and Lightbox gallery modes

Galleries can use no enlargement, a framed Modal, or a true dark Lightbox. Both viewers include keyboard navigation, focus trapping and restoration, image captions, counters, and original-image download. Desktop viewers reserve a bottom safe area of at least one control height so actions do not touch or fall below the visible browser edge.

### Architecture

- `OluntirWorkspaceManager` coordinates large Oluntir workspaces.
- `multi-monitor-manager.js` owns the separate tool window and restoration behavior.
- general settings use a dedicated IndexedDB settings store;
- GrapesJS stays versioned below `vendor/grapesjs/` and is accessed through `editor/integrations/grapesjs/`;
- Oluntir modules must not depend directly on internal `.gjs-*` DOM classes outside the adapter boundary.

## Compatibility notes

- A current desktop browser is required.
- Multi-window and directory access depend on browser permissions and security policy.
- Selecting two-monitor mode directly from a user action is more reliable than a delayed pop-up attempt.
- Saved window coordinates are advisory and are validated before reuse.
- Browser storage is not a replacement for an external project backup.

## Upgrade notes

Extract 1.2.0 into a new folder and open the new `index.html`. Keep the previous release and a project backup until the project has been opened, checked, and exported successfully. Do not overwrite an existing installation folder with a mixture of old and new files.

## Known limitations

Oluntir cannot force a browser to grant file-system, window-placement, or pop-up permission. When the Window Management API is unavailable or denied, the tool window remains manually movable. Physical two-monitor placement therefore requires a browser and operating-system configuration that exposes the necessary capability.

## Project principles reinforced in 1.2.0

- GrapesJS remains an unchanged Open Source engine; Oluntir features are implemented through the adapter and integration layer.
- Workspace settings are stored locally and can restore monitor mode, window geometry, and selected workspace behavior.
- The Image Manager explains project-root selection before it uses or creates `assets/user_upload/`.
- Modal and Lightbox remain intentionally separate viewing concepts.
- The internal project model remains independent of the selected export format.
- English and German release information are maintained as equivalent project documentation.

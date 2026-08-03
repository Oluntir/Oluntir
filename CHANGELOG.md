# Changelog

## 1.3.1 — 2026-08-02

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
- Completed the inactive Repeat Foundation without visible or productive synchronization.

### Known limitation
- An explicitly selected footer text color may differ in the editor and export; the export preserves the selected value.

## 1.3.0 — 2026-08-01

- Introduced semantic resolver, identity and dependency foundations.
- Extended shared content and project persistence.
- Consolidated Bootstrap 4/5 support and export functions.

## Earlier versions

Earlier history remains available in the Git history.

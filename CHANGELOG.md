> **Language:** English (reference) · [Deutsch](CHANGELOG_de.md)

# Changelog

## Oluntir 1.1.0 — 2026-07-30

### Technical foundation: GrapesJS

- GrapesJS is the central visual editor engine and an essential foundation of Oluntir.
- The unchanged vendor version, adapter, and compatibility checks provide a controlled update path for future GrapesJS releases.

### Assets and usability

- Uploads remain managed in IndexedDB and can additionally be written to the connected project's `assets/user_upload/` directory.
- Standalone image selection interface with search, filters, grid/list views, details, variants, replacement, and safe deletion.
- Lightbox backdrop refined to 80% black with a subtle `backdrop-filter: blur(2px)`.
- Top toolbar remains visible while scrolling, and dark-theme selection fields have improved contrast.


### Gallery viewer and accessibility

- Added per-gallery enlargement modes: none, modal, and lightbox.
- Added keyboard navigation, focus trapping, focus restoration, captions, image counters, and optional loop navigation.
- Added the shared gallery viewer runtime to both Bootstrap 4.6.2 and Bootstrap 5.3.8 exports.


### Workspace architecture

- Added a central `OluntirWorkspaceManager` for large editor tools.
- The image manager now runs outside the GrapesJS modal and covers the editor workspace without overlapping quick editing.
- Added a permanent image-manager button to the upper GrapesJS toolbar.
- Added lazy loading and incremental rendering for large image collections.
- Preview images are loaded directly from the IndexedDB asset store.
- The image manager can be reopened repeatedly after closing.

- Moved GrapesJS into an unchanged, versioned vendor dependency.
- Added a central GrapesJS adapter and compatibility layer.
- Added an independent Image Select module without internal GrapesJS DOM dependencies.
- Separated asset, IndexedDB, variant, and usage logic into services.
- Added search, filters, primary/all-variant views, dimensions, details, replacement, and guarded bulk deletion.


## Oluntir 1.0.0 — 2026-07-29

Oluntir 1.0.0 is the first stable public release of the browser-based static website editor.

### Included capabilities

- Local browser-based editing without a database or server-side application runtime.
- Bootstrap 4.6.2 and Bootstrap 5.3.8 project profiles.
- Page creation, renaming, deletion, local browser storage, project backup, and project restore.
- Portable project files using the `.oluntir` extension while retaining the existing binary project structure.
- Classic HTML projects and projects with centrally maintained recurring content regions.
- Shared Content Manager for header, navigation, footer, and optional recurring content sections.
- Source and rendered-code views.
- Export as resolved HTML, Apache SSI, or PHP includes.
- Folder, ZIP, and TAR export.
- German and English interface and documentation.
- Quick setup, quick editing, block search, gallery support, and responsive editor views.
- Bundled local framework, font, image, editor, and website assets.

### Release preparation

- Unified product naming, visible branding, metadata, repository links, website links, and contact details under Oluntir.
- Removed pre-1.0 development, preview, release-candidate, migration, and rename records from the release package.
- Updated productive documentation and retained required third-party licensing and attribution information.

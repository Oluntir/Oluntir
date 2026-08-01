> **Language:** English · [Deutsch](ARCHITECTURE_de.md)  
> **Version:** 1.3.0 DEV_029 · **Updated:** 2026-08-01

# Architecture overview

Oluntir separates the visual editor engine from project and application responsibilities.

```text
Oluntir
├── User interface and commands
├── WorkspaceManager
│   ├── main editor workspace
│   ├── Image Manager workspace
│   └── external tool window
├── Project and page services
├── Shared Content Manager
├── Image and asset services
├── Export services
├── Bootstrap framework profiles
├── GrapesJS adapter and compatibility layer
└── Persistence
    ├── project data
    ├── IndexedDB workspace settings
    └── optional physical project-folder synchronization
```

## Responsibility boundaries

### GrapesJS adapter

The adapter is the only layer allowed to depend on GrapesJS-specific integration details. GrapesJS remains an unchanged vendor dependency. Application modules must not extract or control undocumented GrapesJS DOM internals directly.

### WorkspaceManager

The WorkspaceManager coordinates the main editor, Image Manager, and external tool window. It preserves the selected workflow while providing a safe single-monitor fallback.

### Project and page services

These services maintain project metadata, pages, project type, framework profile, restoration, and portable `.oluntir` project data.

### Shared Content Manager

Shared Content stores recurring content elements and regions centrally and exposes visible `<ope-include>` references to pages. Export services resolve those references according to the selected target.

### Image and asset services

The Image Manager handles search, filters, views, details, responsive variants, replacement, deletion, and synchronization with `assets/user_upload/` after the project root has been connected.

### Export services

The export layer transforms the internal, server-neutral project model into resolved HTML, Apache SSI, or PHP includes and can package the result as a folder, ZIP, or TAR archive.

### Persistence

Workspace preferences are stored separately from project content. Browser persistence supports continuity; the project and exported files remain the portable source of truth.

## Architectural rule

New features should be added to Oluntir's own services and adapters. They must not create hidden coupling to GrapesJS DOM internals or require a proprietary runtime in the exported website.

## Related documentation

- [Why Oluntir?](WHY_OLUNTIR.md)
- [Workspace architecture](WORKSPACE-ARCHITECTURE.md)
- [GrapesJS integration](GRAPESJS-INTEGRATION.md)
- [Project structure](PROJECT-STRUCTURE.md)
- [Project principles](PROJECT-PRINCIPLES.md)

## Layout Identity Layer (1.2.1)

`editor/js/core/layout-identities.js` adds persistent internal IDs inside the GrapesJS component model. The GrapesJS page wrapper is the logical page root; a single `main` is not the persistent export source. The identity layer changes neither Bootstrap classes nor visible HTML IDs.

## Favicon pipeline

`favicon-manager.js` generates and persists project-wide favicon variants. Export adds head references and writes generated binaries plus `site.webmanifest`.

## Responsive asset pipeline

The upload store manages desktop, tablet, and mobile variants. Export reads pages from the model and collects the complete variant group for every used upload.

## Editor-only placeholder

“+ Insert section here” is generated through Canvas CSS for `main:empty`; it is neither part of the component tree nor the export contract.


## Structure Resolver (1.3.0 DEV_029)

`editor/js/core/structure-resolver.js` creates immutable, read-only structure snapshots from the GrapesJS project model. The API resolves parent/child relationships, stable identities, structure kinds, semantic areas, roles and cardinality. It contains no framework, editor, export or correction logic. Existing consumers remain unchanged in DEV_029; the API forms the shared basis for later integrations.

See [Structure Resolver](049_STRUCTURE_RESOLVER.md).

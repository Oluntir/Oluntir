> **Language:** English (reference) · [Deutsch](HANDBOOK_de.md)

# Oluntir technical handbook

**Version:** 1.2.1  
**Status:** Stable  
**Last updated:** 2026-07-30

## 1. Purpose

Oluntir edits and exports static website projects locally in a browser. Browser persistence supports convenient continuation, but portable project backups and exported files remain the authoritative external safety copies.

## 2. Editor foundation

GrapesJS 0.23.2 provides the canvas and visual component editor. Oluntir owns the surrounding application: startup, projects, includes, exports, image services, workspaces, settings, quick editing, and multi-monitor behavior. Vendor files are not patched; compatibility code belongs in `editor/integrations/grapesjs/`.

## 3. Project types

A classic project stores complete HTML per page. A project with recurring content elements and regions stores shared layout sources and references them through `<ope-include>` nodes. The central resolver produces resolved HTML, Apache SSI, or PHP includes.

## 4. Startup and persistence

At startup, Oluntir examines available browser data and offers project continuation, restoration, or a new project. General application settings use `oluntir-settings`; image assets use their versioned asset database. These stores serve different purposes and must not be treated as a substitute for project backups.

## 5. Single- and two-monitor operation

The preferred workspace mode is `ask`, `single`, or `dual`. In dual mode, the canvas stays in the main window while the right GrapesJS tool column and Oluntir quick-edit areas move to a separate window. A separate session state records whether dual mode is actually active. Closing or losing the tool window restores all moved areas to the main window.

The saved preference is not overwritten merely because only one monitor is available. Saved bounds are validated before reuse. Without the Window Management API, the user positions the tool window manually.

## 6. Image Manager

The Image Manager is an Oluntir workspace, not the visible GrapesJS Asset Manager. It uses shared asset services and IndexedDB and provides grid/list presentation, search, filters, details, responsive variants, replacement, deletion, and selection modes.

To synchronize physical files, the user chooses the project root after reading the information dialog. Oluntir then uses or creates `assets/user_upload/`. Permission may need to be granted again in a later browser session.

## 7. Galleries

Each gallery selects `none`, `modal`, or `lightbox`. Modal is a framed dialog. Lightbox is a dark, frameless viewer. Both use shared navigation, keyboard controls, focus trapping, focus restoration, caption, counter, and original-image download. Desktop layouts reserve a safe bottom area; smaller displays keep the established responsive behavior.

## 8. Export

Export format and target are separate decisions. Before writing, Oluntir checks missing targets, duplicate paths, and cyclic include references. Folder access remains browser-dependent. ZIP and TAR are alternative archive targets.

## 9. Validation and release checks

Run:

```text
python tools/validate-structure.py
node tools/test-grapesjs-adapter.js
```

Also perform JavaScript syntax checks, static local-reference checks, archive integrity checks, and manual browser tests for startup, project restore, both Bootstrap profiles, export, Image Manager, Modal, Lightbox, and monitor switching.

## 10. Operational limitations

Oluntir cannot bypass browser security prompts or guarantee automatic placement on another display. Imported HTML can contain unsafe content; review unknown projects before previewing or exporting. Keep external backups before migrations and major edits.

## 11. Project philosophy and documentation map

Oluntir is designed as a local Open Source website project environment rather than only a visual page editor. GrapesJS provides the visual editing engine; Oluntir owns project, workspace, asset, Shared Content, persistence, and export responsibilities through its own adapter and services.

The documentation is available in English and German. Start with [the documentation index](docs/index.md), [Why Oluntir?](docs/WHY_OLUNTIR.md), and [the architecture overview](docs/ARCHITECTURE.md).


## Version 1.2.1 architecture foundation

Stable layout identities and Repeat Engine V2 are documented in `docs/040_LAYOUT_GRAPH.md` through `docs/045_PROJECT_MIGRATION_1.2.1.md`.

## 12. Layout identities and migration

The persistent project model receives internal IDs for pages and suitable components. Assignment is additive and idempotent, ordinary HTML IDs remain unchanged, and internal attributes are stripped only from a final export copy.

## 13. New pages and insertion hint

New pages inherit shared header, navigation, and footer regions. Their empty `<main>` is labelled “+ Insert section here” through editor-only CSS that is neither stored nor exported.

## 14. Project favicon

`favicon-manager.js` handles metadata, preview, generation, replacement, removal, and export of project-wide favicon variants and `site.webmanifest`.

## 15. Responsive asset export

Desktop, tablet, and mobile upload files form one variant group. Export collects the full group and stops with an explicit error if variants are missing. Path normalisation happens only in the temporary export copy.

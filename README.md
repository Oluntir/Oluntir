> **Language:** English · [Deutsch](README_de.md)

# Oluntir 2.3.0

Oluntir is a local, browser-based website editor built on GrapesJS 0.23.2. It manages multi-page Bootstrap projects, local assets, shared page regions, project-wide repeatable content and open exports without a mandatory cloud or server runtime.

**Status:** Release 2.3.0
**Framework focus:** Bootstrap 4.6.2 and Bootstrap 5.3.8
**Template import:** arbitrary Bootstrap 4/5 templates as modular packages under `templates/`
**Operation:** local and project-based

## Core capabilities

- visual GrapesJS editor for HTML and Bootstrap projects;
- multi-page projects with portable `.oluntir` project files;
- page management, local assets, favicon, images, galleries and responsive image variants;
- Shared Content for header, navigation and footer;
- central library for project-wide repeatable regions with controlled publishing;
- single- and dual-monitor workspaces;
- HTML, Apache SSI and PHP include export plus folder, ZIP and TAR output;
- optional local diagnostic logging after explicit consent;
- modular template management outside the Oluntir core.

## New in 2.3.0: modular Bootstrap templates

Oluntir 2.3.0 separates bundled framework profiles from imported templates:

```text
frameworks/
├── bootstrap4/
└── bootstrap5/

templates/
├── registry.json
├── registry.js
└── <user-template>/
```

Imported templates never modify `frameworks/`. A template accepted by the user is stored completely below `templates/<name>/` and can also be backed up or removed directly at file-system level.

The separate `template-manager.html` handles import, analysis, acceptance, registry validation and removal. Valid template folders copied manually into `templates/` can be discovered and registered; missing folders are detected and stale registry entries can be cleaned up. Bundled Bootstrap 4/5 profiles remain protected.

## Universal template compiler

The compiler is not tailored to a particular sample template. For Bootstrap 4/5 imports it analyzes, among other things:

- sample HTML pages regardless of folder layout;
- primary template pages versus documentation/helper pages;
- Bootstrap base and detected version;
- page regions, sections and semantic block families;
- repeatable child structures and variants;
- CSS load order, template CSS, vendor CSS and framework CSS;
- images, fonts, media and unreferenced demo/placeholder assets;
- JavaScript files, load order, libraries, dependencies, DOM selectors and section mappings.

The expensive analysis runs once during import. Normal `index.html` startup loads only the static registry and compiled template definitions.

## JavaScript analysis and editor isolation

Imported JavaScript is analyzed statically and classified into section behavior, global behavior, dependencies, helpers/configuration and unresolved bindings. The compiler creates:

- `behavior-manifest.json`;
- `dependencies.json`;
- `runtime-plan.json`;
- `javascript-activation-plan.json`.

The activation plan avoids duplicate Bootstrap/jQuery runtimes and blocks detected high-risk scripts. Imported template JavaScript does **not run in the editable GrapesJS canvas**, keeping Undo/Redo, deletion, Shared Content and autosave isolated from third-party DOM mutations.

## External embeds and maps

Active third-party content in `iframe`, `object` and `embed` elements is generically isolated in edit mode, regardless of provider. This covers Google Maps, OpenStreetMap embeds, video/social embeds and similar plugin frames.

The active source is replaced by a scalable SVG placeholder while tag, classes, style, width and height are preserved. The original source is retained. The placeholder is pointer-transparent and non-focusable in edit mode, so large map/plugin surfaces cannot block selection, deletion or Undo/Redo of the surrounding block. Preview can reactivate the original source only in the canvas DOM without rewriting the stored editor model. The compiler also creates `embed-isolation.json` and a restore runtime contract for preview/publishing.

## Repeatable regions

Repeatable regions are managed as central Repeat families. A family has one central draft and may be placed on multiple project pages. Editing is performed through the central workspace and published with **Apply to all occurrences**. Page instances remain protected from direct content editing.

## Bootstrap support

Oluntir keeps the protected bundled profiles:

- **Bootstrap 4.6.2**
- **Bootstrap 5.3.8**

Imported templates use one of those profiles as their technical base without changing any files below `frameworks/`.

## Start and template import

Normal editor start:

1. Extract the archive.
2. Open `index.html` in a current Chromium-based desktop browser.
3. Open or create a project.
4. Select a bundled Bootstrap profile or a registered template profile.

Template import:

1. Open `template-manager.html`.
2. Choose a name and template ZIP.
3. Run **Analyze template**.
4. Review the analysis results.
5. Select the `templates` folder of the current Oluntir installation.
6. Accept the template.
7. After verification, open Oluntir using the green action button.

## Documentation

- [Features](FEATURES.md)
- [Handbook](HANDBOOK.md)
- [Template system](docs/TEMPLATE-SYSTEM.md)
- [First start](docs/FIRST_START.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Repeat Engine V2](docs/042_REPEAT_ENGINE_V2.md)
- [Shared Content](docs/SHARED-CONTENT-MANAGER.md)
- [Release notes](RELEASE_NOTES.md)
- [Changelog](CHANGELOG.md)
- [Documentation index](docs/index.md)

## Project boundary

Oluntir 2.3.0 is product-focused on Bootstrap 4 and Bootstrap 5. Universal template import targets templates based on those Bootstrap generations. Foreign frameworks are not silently treated as Bootstrap.

## License

See [LICENSING.md](LICENSING.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the files under `LICENSES/`.
